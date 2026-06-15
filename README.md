# Alhisba Chat

A Claude-style chat interface that connects to the Alhisba MCP server for real estate data.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your values:
   - `ANTHROPIC_API_KEY` — your Anthropic API key
   - `CHAT_PASSWORD` — a strong password users must enter to access the chat
   - `ALLOWED_ORIGIN` — your production domain (e.g. `https://chat.alhisba.com`)

3. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Architecture

```
src/
  app/
    page.tsx              # Root page — login gate or chat
    layout.tsx            # HTML shell
    globals.css           # Tailwind + prose styles
    api/
      auth/route.ts       # Password auth endpoint
      chat/route.ts       # Claude + MCP proxy (API key never leaves server)
  components/
    LoginGate.tsx         # Password screen
    Chat.tsx              # Main chat container
    ChatMessage.tsx       # Message bubble with markdown rendering
    ChatInput.tsx         # Auto-resize textarea
    TypingIndicator.tsx   # Animated dots
    ToolActivity.tsx      # Collapsible MCP tool call log
  lib/
    rateLimit.ts          # In-memory rate limiter (20 req/min per IP)
    sanitize.ts           # Input validation helpers
```

## Security

- API key is server-only (`ANTHROPIC_API_KEY` in `.env.local`, never sent to browser)
- All Claude/MCP calls go through `/api/chat` — frontend has no direct API access
- Password gate required before chat is usable
- Rate limiting: 20 requests/minute per IP
- Input sanitized and capped at 4000 characters
- CORS headers restrict API to `ALLOWED_ORIGIN`
- Errors never expose internal details or stack traces

## MCP Server

Connected to `https://mcp.alhisba.com/mcp` on every request. Tool calls are surfaced
in a collapsible "N tools called" section below each assistant message.
# alhisba-chat-bot
