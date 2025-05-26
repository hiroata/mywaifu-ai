import { NextRequest, NextResponse } from 'next/server';

// テスト用のエンドポイント（認証なし）
interface TestGenerateRequest {
  prompt: string;
  negative_prompt?: string;
  style: 'anime' | 'realistic';
  width?: number;
  height?: number;
  steps?: number;
  cfg_scale?: number;
  sampler_name?: string;
  seed?: number;
  model_name?: string;
}

const SD_API_URL = process.env.AUTOMATIC1111_API_URL || 'http://127.0.0.1:7860';

export async function POST(request: NextRequest) {
  try {
    const body: TestGenerateRequest = await request.json();
    const { 
      prompt, 
      negative_prompt, 
      style, 
      width = 512, 
      height = 768, 
      steps = 20, 
      cfg_scale = 7,
      sampler_name = 'DPM++ 2M',
      seed = -1,
      model_name
    } = body;

    console.log('🎨 Testing image generation with:', {
      prompt,
      style,
      model_name,
      sampler_name,
      steps,
      cfg_scale,
      width,
      height,
      seed
    });

    // モデル名の決定
    const selectedModel = model_name || (style === 'anime' 
      ? '🐼_illustriousPencilXL_v200' 
      : '📷️_beautifulRealistic_brav5');

    const startTime = Date.now();

    // Automatic1111 APIが利用可能かチェック
    const healthCheck = await fetch(`${SD_API_URL}/sdapi/v1/ping`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    if (!healthCheck.ok) {
      throw new Error('Stable Diffusion API is not available');
    }

    // スタイル別のプロンプト強化
    const enhancedPrompt = style === 'anime' 
      ? `${prompt}, anime style, high quality, detailed, masterpiece, best quality, 1girl, beautiful face, perfect anatomy`
      : `${prompt}, photorealistic, high quality, detailed, professional photography, 8k, beautiful woman, perfect lighting`;

    const enhancedNegativePrompt = style === 'anime'
      ? `${negative_prompt || ''}, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple people, multiple girls, 2girls, 3girls`
      : `${negative_prompt || ''}, cartoon, anime, 3d render, illustration, painting, drawing, art, sketch, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple people`;

    console.log('🚀 Sending request to Automatic1111 API...');

    // 画像生成リクエスト
    const generateResponse = await fetch(`${SD_API_URL}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negative_prompt: enhancedNegativePrompt,
        width,
        height,
        steps,
        cfg_scale,
        sampler_name,
        batch_size: 1,
        n_iter: 1,
        seed: seed === -1 ? -1 : seed,
        restore_faces: style === 'realistic',
        enable_hr: width > 512 || height > 512,
        hr_scale: 1.5,
        hr_upscaler: 'R-ESRGAN 4x+',
        denoising_strength: 0.3
      }),
      signal: AbortSignal.timeout(120000) // 2分タイムアウト
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('❌ SD API Error:', errorText);
      throw new Error(`SD API Error: ${generateResponse.statusText} - ${errorText}`);
    }

    const result = await generateResponse.json();
    
    if (!result.images || result.images.length === 0) {
      throw new Error('No image generated');
    }

    const generationTime = Math.round((Date.now() - startTime) / 1000);

    console.log(`✅ Image generated successfully in ${generationTime}s`);

    // Base64画像を返す
    return NextResponse.json({
      success: true,
      image: result.images[0], // Base64形式
      info: result.info,
      generationTime,
      parameters: {
        prompt: enhancedPrompt,
        negative_prompt: enhancedNegativePrompt,
        model: selectedModel,
        sampler: sampler_name,
        steps,
        cfg_scale,
        seed: result.parameters?.seed || seed,
        width,
        height
      }
    });

  } catch (error) {
    console.error('❌ Generation error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Generation timeout' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
