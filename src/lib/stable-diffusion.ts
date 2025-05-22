// src/lib/stable-diffusion.ts
// Stability.ai (Stable Diffusion) API連携
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";

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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
      throw new Error(error.message || '画像生成に失敗しました');
    }

    const data = await response.json();
    const base64Image = data.artifacts[0].base64;
    
    // Base64画像をアップロードして永続化する処理
    const imageUrl = await uploadBase64Image(base64Image, 'character-images');
    
    return imageUrl;
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error('画像の生成中にエラーが発生しました');
  }
}

// Base64画像をファイルシステムにアップロード
async function uploadBase64Image(base64String: string, folder: string): Promise<string> {
  // この部分はロリポップのファイルシステムに合わせて実装
  // サンプル実装としてはローカルファイルシステムへの保存を想定
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.png`;
  const filePath = `./public/uploads/${folder}/${fileName}`;
  
  // Base64をバイナリに変換
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  // ファイル書き込み（実際の実装では適切なストレージに書き込む）
  // この部分は実際のロリポップの環境に合わせて修正が必要
  const fs = require('fs');
  const path = require('path');
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, buffer);
  
  // 公開URL（実際の環境に合わせて調整）
  return `/uploads/${folder}/${fileName}`;
}
