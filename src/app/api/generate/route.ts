import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { imageGenerator } from '@/lib/services/imageGenerator'; // imageGenerationServiceからimageGeneratorに変更
import { security } from '@/lib/security';
import { logSecurityEvent, SecurityEvent } from '@/lib/security/security-logger';
import { z } from 'zod';

// 入力検証スキーマ
const generateImageSchema = z.object({
  prompt: z.string().min(1, 'プロンプトは必須です').max(1000, 'プロンプトが長すぎます'),
  negativePrompt: z.string().optional(),
  style: z.enum(['anime', 'realistic']).optional().default('anime'),
  size: z.string().optional().default('512x512'),
  quality: z.string().optional().default('standard'),
  characterId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // レート制限チェック
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `image_generation_${Array.isArray(ip) ? ip[0] : ip}`;
    
    if (security.checkRateLimit && typeof security.checkRateLimit === 'function') {
      const isRateLimited = security.checkRateLimit(rateLimitKey, 10, 60000); // 1分間に10回まで
      
      if (isRateLimited) {
        return NextResponse.json(
          {
            success: false,
            error: 'レート制限に達しました。しばらく待ってから再試行してください。'
          },
          { status: 429 }
        );
      }
    }

    // リクエストボディの解析と検証
    const body = await request.json();
    const validationResult = generateImageSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '入力データが無効です',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { prompt, negativePrompt, style, size, quality, characterId } = validationResult.data;

    // ユーザーの生成制限状況をチェック
    const generationStatus = await imageGenerator.getUserGenerationStatus(session.user.id);
    
    if (!generationStatus.canGenerate) {
      return NextResponse.json(
        {
          success: false,
          error: `1日の生成制限（${generationStatus.dailyLimit}回）に達しました。プレミアムプランにアップグレードすると制限が緩和されます。`,
          generationStatus
        },
        { status: 403 }
      );
    }

    // セキュリティログの記録
    await logSecurityEvent(
      SecurityEvent.LOGIN_ATTEMPT, // 適切なイベントタイプに変更
      request,
      {
        prompt: prompt.substring(0, 100), // プロンプトの最初の100文字のみログ
        style,
        characterId
      },
      {
        userId: session.user.id,
        severity: 'low'
      }
    );

    // 画像生成実行
    const result = await imageGenerator.generateImage({
      prompt,
      negativePrompt,
      style,
      size,
      quality,
      userId: session.user.id,
      characterId
    });

    // 生成後の状況を取得
    const updatedGenerationStatus = await imageGenerator.getUserGenerationStatus(session.user.id);

    if (result.success) {
      await logSecurityEvent(
        SecurityEvent.ADMIN_ACTION, // 画像生成成功イベント
        request,
        {
          generationId: result.generationId,
          generationTime: result.generationTime
        },
        {
          userId: session.user.id,
          severity: 'low'
        }
      );

      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        generationTime: result.generationTime,
        generationId: result.generationId,
        generationStatus: updatedGenerationStatus
      });
    } else {
      await logSecurityEvent(
        SecurityEvent.SUSPICIOUS_REQUEST, // 画像生成失敗イベント
        request,
        {
          error: result.error,
          generationTime: result.generationTime
        },
        {
          userId: session.user.id,
          severity: 'medium'
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          generationStatus: updatedGenerationStatus
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Generate API error:', error);
    
    // エラーログの記録
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST, // エラーイベント
      request,
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        userId: (await auth())?.user?.id || 'unknown',
        severity: 'high'
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: 'サーバー内部エラーが発生しました'
      },
      { status: 500 }
    );
  }
}

// ユーザーの生成状況を取得するGETエンドポイント
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const generationStatus = await imageGenerator.getUserGenerationStatus(session.user.id);
    
    return NextResponse.json({
      success: true,
      generationStatus
    });
    
  } catch (error) {
    console.error('Get generation status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
