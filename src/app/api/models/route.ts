import { NextResponse } from "next/server";
import { MODELS } from "@/lib/models";

/** Returns which providers have API keys configured (server-side only) */
export async function GET() {
  const providers = [...new Set(MODELS.map((m) => m.provider))];
  const available: Record<string, boolean> = {};

  for (const p of providers) {
    const envKey = MODELS.find((m) => m.provider === p)?.envKey ?? "";
    available[p] = !!process.env[envKey];
  }

  return NextResponse.json({ available });
}
