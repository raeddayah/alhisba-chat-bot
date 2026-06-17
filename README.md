# Alhisba Chat

Claude-style chat with **Generative UI** — the model renders interactive React components
(charts, tables, property cards, KPI grids) directly into the chat based on live data from
the Alhisba MCP server.

## Setup

```bash
cd alhisba-chat
npm install
cp .env.example .env.local   # then edit .env.local
npm run dev
# → http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key — **never** reaches the client |
| `CHAT_PASSWORD` | Password users must enter before the chat loads |
| `ALLOWED_ORIGIN` | Your production domain for CORS (e.g. `https://chat.alhisba.com`) |

## Architecture

```
src/
  app/
    page.tsx                  # Login gate → chat
    layout.tsx
    globals.css
    api/
      auth/route.ts           # Password verification
      chat/route.ts           # streamText + MCP + render tool definitions
  components/
    LoginGate.tsx             # Password screen
    render/
      ChartCard.tsx           # recharts bar/line/area/pie
      TableCard.tsx           # sortable table with sticky header
      PropertyCard.tsx        # real-estate card with expandable details
      StatGrid.tsx            # KPI grid with trend indicators
      ComparisonCard.tsx      # side-by-side comparison
    chat/
      ChatContainer.tsx       # useChat hook, auto-scroll, suggestions
      ChatMessage.tsx         # renders text + tool invocations as components
      ChatInput.tsx           # auto-resize textarea
      ToolActivity.tsx        # collapsible MCP tool call log
      TypingShimmer.tsx       # animated dots while streaming
  lib/
    cn.ts                     # clsx + tailwind-merge utility
    rateLimit.ts              # 50 req/min per IP
    sanitize.ts               # input validation, 4000-char cap
```

## How Generative UI works

```
User message
  └─▶ /api/chat (streamText)
        ├─ MCP tools (server-executed) → fetch live Alhisba data
        └─ render* tools (client-side) → model calls with data
              └─▶ useChat streams tool invocations to browser
                    └─▶ ChatMessage renders React component
```

The model fetches data from the MCP server, then decides which render tool to call:

| Data type | Tool called | Component |
|---|---|---|
| Trends / time-series | `renderChart` | `ChartCard` |
| Dense lists / many columns | `renderTable` | `TableCard` |
| Single property | `renderPropertyCard` | `PropertyCard` |
| KPIs / statistics | `renderStatGrid` | `StatGrid` |
| Comparing 2–4 options | `renderComparison` | `ComparisonCard` |

## Adding a new render component

1. Create `src/components/render/YourCard.tsx`
2. Add the tool definition in `src/app/api/chat/route.ts` (inside `tools: { ... }`) with a Zod schema — **no `execute` function** (client-side tool)
3. Add the case in `src/components/chat/ChatMessage.tsx` inside `ToolResult`
4. Update the system prompt in `route.ts` to tell the model when to use it

## Security

- API key is server-only — never in the client bundle
- Password gate backed by `CHAT_PASSWORD` env var
- Rate limiting: 50 req/min per IP (in-memory)
- Input sanitized and capped at 4000 chars
- Errors never expose keys or stack traces
