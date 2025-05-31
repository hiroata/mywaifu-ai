// src/lib/ai/config.ts

// 型定義
export type AIProvider = "gemini" | "xai" | "openai";

export const AI_CONFIG = {
  // デフォルト設定
  defaultProvider: "gemini" as const,
  fallbackProvider: "xai" as const,
  
  // 各プロバイダーのモデル一覧
  models: {
    gemini: [
      "gemini-2.0-flash-exp",
      "gemini-2.0-flash-thinking-exp-1219",
      "gemini-1.5-pro",
      "gemini-1.5-flash"
    ],
    xai: [
      "grok-3",
      "grok-2-vision-1212",
      "grok-2-1212"
    ],
    openai: [
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo"
    ]
  },
  
  // デフォルトモデル
  defaultModels: {
    gemini: "gemini-2.0-flash-exp",
    xai: "grok-3",
    openai: "gpt-4o"
  },
  
  // レート制限設定
  rateLimits: {
    gemini: {
      requests: 60,
      window: 60000, // 1分
      tokensPerMinute: 32000
    },
    xai: {
      requests: 100,
      window: 60000, // 1分
      tokensPerMinute: 100000
    },
    openai: {
      requests: 60,
      window: 60000, // 1分
      tokensPerMinute: 40000
    }
  },
  
  // 生成パラメータのデフォルト値
  defaultParameters: {
    gemini: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      topP: 0.8,
      topK: 40
    },
    xai: {
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.8,
      frequency_penalty: 0,
      presence_penalty: 0
    },
    openai: {
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.8,
      frequency_penalty: 0,
      presence_penalty: 0
    }
  },
  
  // API エンドポイント設定
  endpoints: {
    gemini: {
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      timeout: 30000
    },
    xai: {
      baseUrl: process.env.XAI_API_URL || "https://api.x.ai/v1",
      timeout: 30000
    },
    openai: {
      baseUrl: "https://api.openai.com/v1",
      timeout: 30000
    }
  },
  
  // 機能別設定
  features: {
    chatCompletion: {
      enabled: true,
      supportedProviders: ["gemini", "xai", "openai"]
    },
    textGeneration: {
      enabled: true,
      supportedProviders: ["gemini", "xai", "openai"]
    },
    imageGeneration: {
      enabled: true,
      supportedProviders: [] // Stable Diffusion は別で管理
    },
    voiceSynthesis: {
      enabled: true,
      supportedProviders: [] // ElevenLabs は別で管理
    },
    contentEnhancement: {
      enabled: true,
      supportedProviders: ["gemini", "xai"]
    }
  },
  
  // 開発・デバッグ設定
  development: {
    saveResponses: process.env.NODE_ENV === "development",
    logLevel: process.env.AI_LOG_LEVEL || "info",
    enableConsoleLog: process.env.ENABLE_AI_CONSOLE_LOG === "true"
  }
};

// 環境変数からの設定上書き
export function getAIConfig() {
  return {
    ...AI_CONFIG,
    defaultProvider: (process.env.AI_DEFAULT_PROVIDER as AIProvider) || AI_CONFIG.defaultProvider,
    fallbackProvider: (process.env.AI_FALLBACK_PROVIDER as AIProvider) || AI_CONFIG.fallbackProvider,
  };
}

// プロバイダー別設定取得
export function getProviderConfig(provider: AIProvider) {
  const config = getAIConfig();
  return {
    models: config.models[provider],
    defaultModel: config.defaultModels[provider],
    rateLimit: config.rateLimits[provider],
    defaultParameters: config.defaultParameters[provider],
    endpoint: config.endpoints[provider]
  };
}

// 新しいモデル追加用のヘルパー関数
export function addModel(provider: AIProvider, modelName: string) {
  if (!AI_CONFIG.models[provider].includes(modelName)) {
    AI_CONFIG.models[provider].push(modelName);
    console.log(`Added new model ${modelName} to provider ${provider}`);
  }
}
