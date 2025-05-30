// src/lib/ai/contentService.ts
import { AI_CONFIG, AIProvider } from "./config";
import { getAIClient } from "./clientFactory";

export async function generateAIContent({
  prompt,
  model,
  provider,
  apiKeys,
}: {
  prompt: string;
  model?: string;
  provider?: AIProvider;
  apiKeys: Record<string, string>;
}) {
  const usedProvider = provider || AI_CONFIG.defaultProvider;
  const usedModel = model || AI_CONFIG.defaultModels[usedProvider];
  const client = getAIClient(usedProvider, apiKeys);
  return await client.generateContent(prompt, usedModel);
}
