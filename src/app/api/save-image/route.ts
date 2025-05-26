import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface SaveImageRequest {
  imageBase64: string;
  prompt: string;
  negative_prompt?: string;
  style: 'anime' | 'realistic';
  name?: string;
  age?: number;
  personality?: string;
  generationId?: string;
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

    const body: SaveImageRequest = await request.json();
    const { 
      imageBase64, 
      prompt, 
      negative_prompt, 
      style, 
      name, 
      age, 
      personality,
      generationId
    } = body;

    // Base64画像をファイルに保存
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const fileName = `character_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const uploadDir = join(process.cwd(), 'public', 'generated');
    
    // ディレクトリが存在しない場合は作成
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, imageBuffer);
    
    const imageUrl = `/generated/${fileName}`;
    
    // キャラクター年齢の調整（18-30歳の範囲）
    const characterAge = age && age >= 18 && age <= 30 ? age : Math.floor(Math.random() * 13) + 18;

    // データベースに保存
    const character = await prisma.character.create({
      data: {
        name: name || generateRandomName(),
        description: personality || generateRandomPersonality(),
        shortDescription: `${characterAge}歳の${style === 'anime' ? 'アニメ風' : '実写風'}キャラクター`,
        age: characterAge,
        gender: 'female',
        type: style === 'realistic' ? 'real' : 'anime',
        personality: personality || generateRandomPersonality(),
        profileImageUrl: imageUrl,
        prompt,
        negativePrompt: negative_prompt,
        style,
        isGenerated: true,
        isOnline: Math.random() > 0.5, // ランダムでオンライン状態を設定
        sdModel: style === 'anime' ? 'illustriousPencilXL_v200.safetensors' : 'beautifulRealistic_brav5.safetensors',
        generationParams: {
          width: 512,
          height: 768,
          steps: 20,
          cfg_scale: 7
        }
      }
    });

    // 生成ログ更新（キャラクターIDを追加）
    if (generationId) {
      await prisma.generationLog.update({
        where: { id: generationId },
        data: {
          characterId: character.id,
          imageUrl
        }
      });
    }

    return NextResponse.json({
      success: true,
      character: {
        ...character,
        // フロントエンド用に整形
        avatarUrl: character.profileImageUrl,
        tagline: `${character.age}歳 - ${character.shortDescription}`,
        isNew: true
      },
      imageUrl
    });

  } catch (error) {
    console.error('Save image error:', error);
    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    );
  }
}
