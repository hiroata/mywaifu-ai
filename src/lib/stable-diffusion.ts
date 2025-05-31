// src/lib/stable-diffusion.ts
// Stability.ai (Stable Diffusion) API連携
import { base64ToBuffer, saveFile } from "./utils/index";

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_URL =
  "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";

interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
}

export async function generateImage({
  prompt,
  negativePrompt = "deformed, ugly, bad anatomy, disfigured, poorly drawn face, extra limb, missing limb, floating limbs, disconnected limbs, long neck, mutation, mutated",
  width = 1024,
  height = 1024,
  steps = 30,
  cfgScale = 7,
}: GenerateImageOptions) {
  try {
    const response = await fetch(STABILITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          { text: prompt, weight: 1 },
          { text: negativePrompt, weight: -1 },
        ],
        cfg_scale: cfgScale,
        height: height,
        width: width,
        samples: 1,
        steps: steps,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "画像生成に失敗しました");
    }
    const data = await response.json();
    const base64Image = data.artifacts[0].base64;

    // Base64画像をアップロードして永続化する処理
    const buffer = base64ToBuffer(base64Image);
    const imageUrl = await saveFile(buffer, {
      folder: "character-images",
      extension: "png",
    });

    return imageUrl;
  } catch (error) {
    console.error("Image generation error:", error);
    throw new Error("画像の生成中にエラーが発生しました");
  }
}

// 新しい画像生成インターface（imageGeneratorService用）
interface StableDiffusionOptions {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg_scale?: number;
  sampler_name?: string;
}

interface StableDiffusionResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// 新しい画像生成関数（結果を統一形式で返す）
export async function generateImageStableDiffusion(options: StableDiffusionOptions): Promise<StableDiffusionResult> {
  try {
    const imageUrl = await generateImage({
      prompt: options.prompt,
      negativePrompt: options.negative_prompt,
      width: options.width || 512,
      height: options.height || 512,
      steps: options.steps || 20,
      cfgScale: options.cfg_scale || 7,
    });

    return {
      success: true,
      imageUrl: imageUrl,
    };
  } catch (error) {
    console.error('Stable Diffusion generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 利用可能なサンプラー一覧
export const AVAILABLE_SAMPLERS = [
  'DPM++ 2M Karras',
  'DPM++ SDE Karras',
  'Euler a',
  'Euler',
  'LMS',
  'Heun',
  'DPM2',
  'DPM2 a',
  'DPM++ 2S a',
  'DPM++ 2M',
  'DPM++ SDE',
  'DPM fast',
  'DPM adaptive',
  'LMS Karras',
  'DPM2 Karras',
  'DPM2 a Karras',
  'DPM++ 2S a Karras',
];

// 利用可能なモデル一覧
export const AVAILABLE_MODELS = [
  'stable-diffusion-xl-1024-v1-0',
  'stable-diffusion-v1-6',
  'stable-diffusion-512-v2-1',
];
