export interface ModelOption {
  id: string;
  label: string;
  provider: string;
  envKey: string;       // which env var holds its API key
  supportsTools: boolean;
  badge?: string;
}

export const MODELS: ModelOption[] = [
  // ── Anthropic ──────────────────────────────────────────
  {
    id: "claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
    provider: "anthropic",
    envKey: "ANTHROPIC_API_KEY",
    supportsTools: true,
    badge: "Default",
  },
  {
    id: "claude-haiku-4-5-20251001",
    label: "Claude Haiku 4.5",
    provider: "anthropic",
    envKey: "ANTHROPIC_API_KEY",
    supportsTools: true,
    badge: "Fast",
  },

  // ── OpenAI ─────────────────────────────────────────────
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    envKey: "OPENAI_API_KEY",
    supportsTools: true,
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "openai",
    envKey: "OPENAI_API_KEY",
    supportsTools: true,
    badge: "Fast",
  },

  // ── DeepSeek ───────────────────────────────────────────
  {
    id: "deepseek-chat",
    label: "DeepSeek V3",
    provider: "deepseek",
    envKey: "DEEPSEEK_API_KEY",
    supportsTools: true,
  },
  {
    id: "deepseek-reasoner",
    label: "DeepSeek R1",
    provider: "deepseek",
    envKey: "DEEPSEEK_API_KEY",
    supportsTools: false,
    badge: "Reasoning",
  },

  // ── Google ─────────────────────────────────────────────
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    provider: "google",
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
    supportsTools: true,
    badge: "Fast",
  },
  {
    id: "gemini-1.5-pro",
    label: "Gemini 1.5 Pro",
    provider: "google",
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
    supportsTools: true,
  },

  // ── Groq (Llama) ───────────────────────────────────────
  {
    id: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B",
    provider: "groq",
    envKey: "GROQ_API_KEY",
    supportsTools: true,
  },
  {
    id: "llama-3.1-8b-instant",
    label: "Llama 3.1 8B",
    provider: "groq",
    envKey: "GROQ_API_KEY",
    supportsTools: true,
    badge: "Fast",
  },

  // ── xAI (Grok) ─────────────────────────────────────────
  {
    id: "grok-2-1212",
    label: "Grok 2",
    provider: "xai",
    envKey: "XAI_API_KEY",
    supportsTools: true,
  },

  // ── Mistral ────────────────────────────────────────────
  {
    id: "mistral-large-latest",
    label: "Mistral Large",
    provider: "mistral",
    envKey: "MISTRAL_API_KEY",
    supportsTools: true,
  },

  // ── GLM / Z.AI (Zhipu AI) ──────────────────────────────
  {
    id: "glm-4.5",
    label: "GLM-4.5",
    provider: "zhipu",
    envKey: "ZHIPU_API_KEY",
    supportsTools: true,
  },
  {
    id: "glm-4.5-air",
    label: "GLM-4.5 Air",
    provider: "zhipu",
    envKey: "ZHIPU_API_KEY",
    supportsTools: true,
    badge: "Fast",
  },
  {
    id: "glm-5",
    label: "GLM-5",
    provider: "zhipu",
    envKey: "ZHIPU_API_KEY",
    supportsTools: true,
    badge: "New",
  },
];

export const PROVIDER_NAMES: Record<string, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  deepseek: "DeepSeek",
  google: "Google",
  groq: "Groq",
  xai: "xAI",
  mistral: "Mistral",
  zhipu: "Z.AI / GLM",
};

export const DEFAULT_MODEL_ID = "claude-sonnet-4-6";

export function getModel(id: string): ModelOption {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}
