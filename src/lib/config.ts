// src/lib/config.ts
export const config = {
  api: {
    elevenlabs: {
      apiKey: process.env.ELEVENLABS_API_KEY || "",
      baseUrl: "https://api.elevenlabs.io/v1",
    },
    stability: {
      apiKey: process.env.STABILITY_API_KEY || "",
      baseUrl:
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
    },
    xai: {
      apiKey: process.env.XAI_API_KEY || "",
      baseUrl: process.env.XAI_API_URL || "https://api.grok.x.ai/v1",
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      baseUrl: "https://api.openai.com/v1",
    },
  },
  storage: {
    uploads: {
      baseDir: "./public/uploads",
      maxFileSize: 5 * 1024 * 1024,
      allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    },
  },
  content: {
    inappropriateKeywords: [
      "官能小説",
      "エロ",
      "性的",
      "アダルト",
      "ポルノ",
      "セックス",
      "猥褻",
      "性行為",
      "不適切",
      "成人向け",
      "18禁",
      "R-18",
      "X-rated",
      "ヌード",
    ],
  },
  models: {
    xai: {
      defaultModel: "grok-3",
      models: ["grok-3"],
    },
  },
};
