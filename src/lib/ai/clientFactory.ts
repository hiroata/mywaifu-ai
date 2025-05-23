// src/lib/ai/clientFactory.ts
import { XAIClient } from "./xaiClient";
import { GeminiClient } from "./geminiClient";

export function getAIClient(provider: string, apiKeys: Record<string, string>) {
  switch (provider) {
    case "xai":
      return new XAIClient(apiKeys.XAI_API_KEY);
    case "gemini":
      return new GeminiClient(apiKeys.GEMINI_API_KEY);
    default:
      return new XAIClient(apiKeys.XAI_API_KEY);
  }
}
