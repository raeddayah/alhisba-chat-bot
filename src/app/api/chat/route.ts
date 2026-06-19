import { NextRequest } from "next/server";
import { streamText, convertToCoreMessages } from "ai";
import { getLanguageModel } from "@/lib/getProvider";
import { getModel, DEFAULT_MODEL_ID } from "@/lib/models";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { checkRateLimit } from "@/lib/rateLimit";

const MCP_URL = "https://mcp.alhisba.com/mcp";

const SYSTEM_PROMPT = `You are an AI assistant for Alhisba, a Kuwait real estate platform.

Rules:
1. Call MCP tools to fetch real data first.
2. Then call a render tool to display it visually (never paste raw JSON).
3. renderStatGrid=KPIs/summaries, renderPropertyCard=single property, renderTable=lists, renderChart=trends, renderComparison=compare 2-4 items.
4. Never invent data.
5. Reply in the same language as the user (Arabic or English).`;

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

/** Connect to the MCP server and return AI SDK-compatible tools */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getMcpTools(client: Client): Promise<Record<string, any>> {
  const { tools } = await client.listTools();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiTools: Record<string, any> = {};

  for (const t of tools) {
    // Build a zod schema from the JSON Schema inputSchema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputSchema = (t.inputSchema as any) ?? {};
    const props = inputSchema.properties ?? {};

    // Convert each property to a zod type (best-effort)
    const zodProps: Record<string, z.ZodTypeAny> = {};
    for (const [key, val] of Object.entries(props as Record<string, { type?: string; description?: string; enum?: string[]; default?: unknown }>)) {
      let zodType: z.ZodTypeAny;
      if (val.enum) {
        zodType = z.enum(val.enum as [string, ...string[]]);
      } else if (val.type === "number" || val.type === "integer") {
        zodType = z.number();
      } else if (val.type === "boolean") {
        zodType = z.boolean();
      } else if (val.type === "array") {
        zodType = z.array(z.unknown());
      } else if (val.type === "object") {
        zodType = z.record(z.unknown());
      } else {
        zodType = z.string();
      }

      const required: string[] = inputSchema.required ?? [];
      if (!required.includes(key)) zodType = zodType.optional();
      // Skip per-param descriptions to reduce token count
      zodProps[key] = zodType;
    }

    const schema = z.object(zodProps);

    const toolName = t.name;
    // Truncate description to 80 chars to save tokens across 23 tools
    const toolDesc = (t.description ?? t.name).slice(0, 80);
    aiTools[toolName] = {
      description: toolDesc,
      parameters: schema,
      execute: async (args: Record<string, unknown>) => {
        const result = await client.callTool({ name: toolName, arguments: args });
        const content = result.content as Array<{ type: string; text?: string }>;
        return content.filter((c) => c.type === "text").map((c) => c.text).join("\n");
      },
    };
  }

  return aiTools;
}

export async function POST(req: NextRequest) {
  // Auth
  const token = req.headers.get("x-session-token");
  if (!token || token !== process.env.CHAT_PASSWORD) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Rate limit
  const { ok } = checkRateLimit(getIP(req));
  if (!ok) {
    return new Response(JSON.stringify({ error: "Too many requests. Wait a minute." }), { status: 429 });
  }

  let body: { messages?: unknown[]; modelId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided" }), { status: 400 });
  }

  const modelId = typeof body.modelId === "string" ? body.modelId : DEFAULT_MODEL_ID;
  const modelMeta = getModel(modelId);

  // Check that the required API key exists for this provider
  const apiKey = process.env[modelMeta.envKey];
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: `No API key configured for ${modelMeta.provider}. Add ${modelMeta.envKey} to .env.local.` }),
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawMessages = (body.messages as any[]).slice(-40);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let coreMessages: any[];
  try {
    coreMessages = convertToCoreMessages(rawMessages);
  } catch {
    coreMessages = rawMessages
      .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content ?? "",
      }));
  }

  // Strip empty text parts that cause "text content blocks must be non-empty" on Anthropic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coreMessages = coreMessages.map((msg: any) => {
    if (!Array.isArray(msg.content)) return msg;
    const filtered = msg.content.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (part: any) => !(part.type === "text" && (!part.text || part.text.trim() === ""))
    );
    // If all parts were stripped, convert to a plain string content
    if (filtered.length === 0) return { ...msg, content: msg.role === "assistant" ? "…" : "" };
    return { ...msg, content: filtered };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }).filter((msg: any) => {
    // Drop user messages with empty string content (from interactive clicks that were empty)
    if (msg.role === "user" && typeof msg.content === "string" && msg.content.trim() === "") return false;
    return true;
  });

  // Connect to MCP via streamable-http
  const mcpClient = new Client({ name: "alhisba-chat", version: "1.0.0" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mcpTools: Record<string, any> = {};

  try {
    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
    await mcpClient.connect(transport);
    mcpTools = await getMcpTools(mcpClient);
    console.log(`[MCP] Connected. Tools loaded: ${Object.keys(mcpTools).join(", ")}`);
  } catch (err) {
    console.error("[MCP] Connection failed:", err);
  }

  // Render tools — no execute, client-side only
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTools: Record<string, any> = {
    renderChart: {
      description: "Render a chart. Use for trends, distributions, comparisons over time.",
      parameters: z.object({
        title: z.string(),
        type: z.enum(["bar", "line", "pie", "area"]),
        data: z.array(z.record(z.unknown())),
        xKey: z.string(),
        yKey: z.string(),
        description: z.string().optional(),
      }),
    },
    renderTable: {
      description: "Render a sortable table. Use for dense lists or many columns.",
      parameters: z.object({
        title: z.string(),
        columns: z.array(z.object({ key: z.string(), label: z.string(), numeric: z.boolean().optional() })),
        rows: z.array(z.record(z.unknown())),
        description: z.string().optional(),
      }),
    },
    renderPropertyCard: {
      description: "Render a property card. Call once per property.",
      parameters: z.object({
        title: z.string(),
        price: z.string(),
        location: z.string(),
        type: z.string(),
        specs: z.array(z.string()),
        badges: z.array(z.string()).optional(),
        description: z.string().optional(),
        url: z.string().optional(),
      }),
    },
    renderStatGrid: {
      description: "Render KPI stats grid. Use for market summaries and numeric highlights.",
      parameters: z.object({
        title: z.string().optional(),
        stats: z.array(z.object({
          label: z.string(),
          value: z.string(),
          change: z.string().optional(),
          trend: z.enum(["up", "down", "neutral"]).optional(),
          unit: z.string().optional(),
        })),
      }),
    },
    renderComparison: {
      description: "Render side-by-side comparison. Use when comparing 2-4 options.",
      parameters: z.object({
        title: z.string().optional(),
        items: z.array(z.object({
          title: z.string(),
          highlight: z.string().optional(),
          specs: z.array(z.object({ label: z.string(), value: z.string() })),
          badge: z.string().optional(),
        })),
      }),
    },
  };

  try {
    const result = streamText({
      model: getLanguageModel(modelId),
      system: SYSTEM_PROMPT,
      messages: coreMessages,
      tools: { ...mcpTools, ...renderTools },
      maxSteps: 10,
      onFinish: async () => {
        try { await mcpClient.close(); } catch { /* ignore */ }
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (err) => {
        console.error("[stream error]", err);
        return err instanceof Error ? err.message : String(err);
      },
    });
  } catch (err) {
    console.error("[streamText] error:", err);
    await mcpClient.close().catch(() => {});
    return new Response(JSON.stringify({ error: "Failed to process request" }), { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
