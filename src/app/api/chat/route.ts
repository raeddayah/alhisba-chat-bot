import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "@/lib/rateLimit";
import { sanitizeMessage, sanitizeHistory } from "@/lib/sanitize";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful AI assistant for Alhisba, a Saudi real estate platform.
You have access to real estate tools via the Alhisba MCP server.
Answer questions clearly and concisely. When you retrieve data, present it in a well-structured, readable format.
Use tables for comparisons, bullet points for lists, and clear headings where helpful.
Respond in the same language the user writes in (Arabic or English).`;

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    // Auth gate
    const sessionToken = req.headers.get("x-session-token");
    if (!sessionToken || sessionToken !== process.env.CHAT_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit
    const ip = getIP(req);
    const { ok, remaining } = checkRateLimit(ip);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }

    const body = await req.json();
    const message = sanitizeMessage(body.message);
    const history = sanitizeHistory(body.history);

    const messages: Anthropic.MessageParam[] = [
      ...history,
      { role: "user", content: message },
    ];

    const response = await client.beta.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
      mcp_servers: [
        {
          type: "url",
          url: "https://mcp.alhisba.com/mcp",
          name: "alhisba",
        },
      ],
      betas: ["mcp-client-2025-04-04"],
      stream: false,
    } as Parameters<typeof client.beta.messages.create>[0]);

    if (!("content" in response)) {
      throw new Error("Unexpected streaming response");
    }

    // Extract text and tool activity from response
    let text = "";
    const toolActivity: Array<{ tool: string; input: unknown; output?: string }> = [];

    type AnyBlock = { type: string; text?: string; name?: string; input?: unknown; content?: Array<{ type: string; text?: string }> };
    const blocks = (response as { content: AnyBlock[] }).content;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (block.type === "text") {
        text += block.text ?? "";
      } else if (block.type === "mcp_tool_use") {
        const activity: { tool: string; input: unknown; output?: string } = {
          tool: block.name ?? "unknown",
          input: block.input,
        };
        // Look for matching result block
        const next = blocks[i + 1];
        if (next && next.type === "mcp_tool_result") {
          activity.output = next.content
            ?.filter((c) => c.type === "text")
            .map((c) => c.text)
            .join("\n");
          i++; // skip the result block
        }
        toolActivity.push(activity);
      }
    }

    return NextResponse.json(
      { text, toolActivity },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (err) {
    console.error("Chat API error:", err);
    const message =
      err instanceof Error && err.message.includes("max")
        ? err.message
        : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
