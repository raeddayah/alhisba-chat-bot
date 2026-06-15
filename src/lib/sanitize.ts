const MAX_MESSAGE_LENGTH = 4000;

export function sanitizeMessage(input: unknown): string {
  if (typeof input !== "string") throw new Error("Invalid message type");
  const trimmed = input.trim();
  if (trimmed.length === 0) throw new Error("Empty message");
  if (trimmed.length > MAX_MESSAGE_LENGTH)
    throw new Error(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
  return trimmed;
}

export function sanitizeHistory(
  history: unknown
): Array<{ role: "user" | "assistant"; content: string }> {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m) =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-20) // keep last 20 turns max
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));
}
