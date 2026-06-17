const MAX_MESSAGE_LENGTH = 4000;

export function sanitizeMessage(input: unknown): string {
  if (typeof input !== "string") throw new Error("Invalid message type");
  const trimmed = input.trim();
  if (trimmed.length === 0) throw new Error("Empty message");
  if (trimmed.length > MAX_MESSAGE_LENGTH)
    throw new Error(`Message too long (max ${MAX_MESSAGE_LENGTH} chars)`);
  return trimmed;
}
