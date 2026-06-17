import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { createXai } from "@ai-sdk/xai";
import { getModel } from "./models";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLanguageModel(modelId: string): any {
  const model = getModel(modelId);

  switch (model.provider) {
    case "anthropic":
      return anthropic(modelId);

    case "openai": {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      return openai(modelId);
    }

    case "deepseek": {
      // DeepSeek exposes an OpenAI-compatible API — avoids @ai-sdk/deepseek v2 spec issue
      const deepseek = createOpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com/v1",
      });
      return deepseek(modelId);
    }

    case "google":
      return google(modelId);

    case "groq": {
      const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
      return groq(modelId);
    }

    case "xai": {
      const xai = createXai({ apiKey: process.env.XAI_API_KEY });
      return xai(modelId);
    }

    case "mistral": {
      const mistral = createMistral({ apiKey: process.env.MISTRAL_API_KEY });
      return mistral(modelId);
    }

    case "zhipu": {
      // Z.AI / Zhipu AI — OpenAI-compatible endpoint
      const zhipu = createOpenAI({
        apiKey: process.env.ZHIPU_API_KEY,
        baseURL: "https://open.bigmodel.cn/api/paas/v4",
      });
      return zhipu(modelId);
    }

    default:
      return anthropic("claude-sonnet-4-6");
  }
}
