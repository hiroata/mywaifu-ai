import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Stable Diffusion API設定
const SD_API_URL = process.env.SD_API_URL || 'http://localhost:7860';

interface GenerateRequest {
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
  name?: string;
  age?: number;
  personality?: string;
}

// 生成制限チェック
async function checkGenerationLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      id: true,
      dailyGenerations: true, 
      lastGeneratedAt: true,
      role: true 
    }
  });

  if (!user) {
    return { allowed: false, remaining: 0 };
  }

  // 日付が変わったらカウントリセット
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!user.lastGeneratedAt || user.lastGeneratedAt < today) {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        dailyGenerations: 0,
        lastGeneratedAt: new Date()
      }
    });
    user.dailyGenerations = 0;
  }

  // プランに応じた制限
  const limits = {
    user: 10,
    premium: 50,
    admin: 1000
  };
  
  const maxGenerations = limits[user.role as keyof typeof limits] || limits.user;
  const remaining = Math.max(0, maxGenerations - user.dailyGenerations);
  
  return {
    allowed: user.dailyGenerations < maxGenerations,
    remaining
  };
}

// ランダムな名前生成
function generateRandomName(): string {
  const names = [
    '桜子', '美咲', '愛子', '結衣', '花音',
    '莉子', '美月', '香織', '真央', '千尋',
    'エミリ', 'ユナ', 'リナ', 'アヤ', 'サクラ',
    '雪菜', '春香', '夏美', '秋奈', '冬花'
  ];
  return names[Math.floor(Math.random() * names.length)];
}

// ランダムな性格生成
function generateRandomPersonality(): string {
  const personalities = [
    '明るく元気で、いつも笑顔を絶やさない女の子です。困っている人を見ると放っておけない優しい心の持ち主です。',
    '知的で冷静、どんなことにも論理的にアプローチします。読書や勉強が好きで、深い会話を楽しみます。',
    '少しツンデレで、素直になれないけど本当は優しい心の持ち主です。時々見せる笑顔がとても魅力的です。',
    'おっとりとした性格で、マイペースに物事を進めるのが得意です。癒し系の雰囲気で周りを和ませます。',
    '好奇心旺盛で、新しいことに挑戦するのが大好きです。エネルギッシュで積極的な性格です。',
    '内気で恥ずかしがり屋ですが、親しくなると甘えん坊になります。繊細で感受性豊かな女の子です。',
    '活発でスポーツが得意、負けず嫌いな一面もあります。仲間思いで頼りになる存在です。',
    '芸術的センスがあり、美しいものが大好きです。感性豊かで創造性に溢れています。'
  ];
  return personalities[Math.floor(Math.random() * personalities.length)];
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 生成制限チェック
    const limitCheck = await checkGenerationLimit(session.user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: 'Daily generation limit reached',
        remaining: limitCheck.remaining 
      }, { status: 429 });
    }    const body: GenerateRequest = await request.json();
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
      model_name,
      name,
      age,
      personality
    } = body;

    // モデル名の決定
    const selectedModel = model_name || (style === 'anime' 
      ? '🐼_illustriousPencilXL_v200' 
      : '📷️_beautifulRealistic_brav5');

    // 生成ログ作成
    const generationLog = await prisma.generationLog.create({
      data: {
        userId: session.user.id,
        prompt,
        negativePrompt: negative_prompt,
        style,
        sdModel: selectedModel,
        status: 'pending',
        parameters: {
          width,
          height,
          steps,
          cfg_scale,
          sampler_name,
          seed,
          model_name: selectedModel
        }
      }
    });

    const startTime = Date.now();

    try {
      // モデル選択
      const modelName = style === 'anime' 
        ? '🐼/illustriousPencilXL_v200.safetensors'
        : 'beautifulRealistic_brav5.safetensors';

      // Automatic1111 APIが利用可能かチェック
      const healthCheck = await fetch(`${SD_API_URL}/sdapi/v1/ping`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5秒タイムアウト
      });

      if (!healthCheck.ok) {
        throw new Error('Stable Diffusion API is not available');
      }      // モデル変更（モデル名が指定されている場合のみ）
      if (model_name) {
        await fetch(`${SD_API_URL}/sdapi/v1/options`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sd_model_checkpoint: model_name
          }),
          signal: AbortSignal.timeout(10000)
        });
      }

      // スタイル別のプロンプト強化
      const enhancedPrompt = style === 'anime' 
        ? `${prompt}, anime style, high quality, detailed, masterpiece, best quality, 1girl, beautiful face, perfect anatomy`
        : `${prompt}, photorealistic, high quality, detailed, professional photography, 8k, beautiful woman, perfect lighting`;

      const enhancedNegativePrompt = style === 'anime'
        ? `${negative_prompt || ''}, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple people, multiple girls, 2girls, 3girls`
        : `${negative_prompt || ''}, cartoon, anime, 3d render, illustration, painting, drawing, art, sketch, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple people`;

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
        throw new Error(`SD API Error: ${generateResponse.statusText}`);
      }

      const result = await generateResponse.json();
      
      if (!result.images || result.images.length === 0) {
        throw new Error('No image generated');
      }

      const generationTime = Math.round((Date.now() - startTime) / 1000);

      // 生成ログ更新（成功）
      await prisma.generationLog.update({
        where: { id: generationLog.id },
        data: {
          status: 'completed',
          generationTime
        }
      });

      // 使用回数更新
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          dailyGenerations: { increment: 1 },
          lastGeneratedAt: new Date()
        }
      });

      // Base64画像を返す
      return NextResponse.json({
        success: true,
        image: result.images[0], // Base64形式
        info: result.info,
        generationId: generationLog.id,
        generationTime,
        remaining: limitCheck.remaining - 1
      });

    } catch (error) {
      // 生成ログ更新（失敗）
      await prisma.generationLog.update({
        where: { id: generationLog.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      throw error;
    }

  } catch (error) {
    console.error('Generation error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Generation timeout' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// プリセットプロンプト生成
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'anime';
  
  const animePrompts = [
    "beautiful anime girl, long flowing hair, school uniform, cute smile, cherry blossoms background",
    "elegant anime woman, fantasy dress, magical aura, ethereal lighting, mystical forest",
    "cheerful anime girl, casual summer clothes, city street background, golden hour lighting",
    "mysterious anime girl, dark gothic outfit, moonlit night scene, atmospheric lighting",
    "sporty anime girl, athletic wear, gymnasium background, energetic pose, bright lighting",
    "shy anime girl, library setting, reading book, soft natural lighting, cozy atmosphere",
    "confident anime woman, business suit, office background, professional lighting",
    "cute anime girl, maid outfit, cafe setting, warm lighting, friendly smile"
  ];
  
  const realisticPrompts = [
    "beautiful young Japanese woman, natural lighting, portrait photography, casual outfit, soft smile",
    "elegant Asian woman, professional attire, office background, confident pose, natural lighting",
    "attractive woman, summer dress, park setting, golden hour lighting, gentle breeze",
    "stylish woman, fashionable outfit, urban background, street photography, confident expression",
    "beautiful woman, vintage style clothing, retro cafe background, film photography aesthetic",
    "natural beauty, minimal makeup, outdoor portrait, soft natural lighting, serene expression",
    "professional model, studio lighting, fashion photography, elegant pose, high-end fashion",
    "girl next door, casual everyday clothes, home setting, warm natural lighting, genuine smile"
  ];
  
  const prompts = type === 'anime' ? animePrompts : realisticPrompts;
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  
  return NextResponse.json({ prompt: randomPrompt });
}
