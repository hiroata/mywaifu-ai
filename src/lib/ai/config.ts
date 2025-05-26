// src/lib/ai/config.ts
export const AI_CONFIG = {
  models: {
    xai: ["grok-3"],
    gemini: ["gemini-2.5-pro-preview-05-06"],
  },
  defaultModel: "gemini-2.5-pro-preview-05-06",
  defaultProvider: "gemini",
  rateLimits: {
    openai: {
      requests: 60,
      window: 60000, // 1 minute
    },
    xai: {
      requests: 100,
      window: 60000, // 1 minute
    },
    gemini: {
      requests: 60,
      window: 60000, // 1 minute
    },
  },
};
