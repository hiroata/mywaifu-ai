// src/lib/ai/contentService.ts
import { AI_CONFIG } from "./config";
import { getAIClient } from "./clientFactory";

export async function generateAIContent({
  prompt,
  model,
  provider,
  apiKeys,
}: {
  prompt: string;
  model?: string;
  provider?: string;
  apiKeys: Record<string, string>;
}) {
  const usedModel = model || AI_CONFIG.defaultModel;
  const usedProvider = provider || AI_CONFIG.defaultProvider;
  const client = getAIClient(usedProvider, apiKeys);
  return await client.generateContent(prompt, usedModel);
}
