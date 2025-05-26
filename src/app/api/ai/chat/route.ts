import { NextResponse, NextRequest } from "next/server";
import { createChatCompletion } from "@/lib/xai";
import { validateApiRequest, createApiErrorResponse, createApiSuccessResponse, ApiSecurityError } from "@/lib/security/api-security";
import { logSecurityEvent, SecurityEvent } from "@/lib/security/security-logger";
import { validateInput } from "@/lib/content-filter";
import { z } from "zod";

// AI チャット API 用のスキーマ
const aiChatSchema = z.object({
  message: z.string().min(1, "メッセージは必須です").max(2000, "メッセージは2000文字以内で入力してください"),
  characterId: z.string().min(1, "キャラクターIDは必須です"),
  unleashed: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    // セキュリティ検証
    const { data, session } = await validateApiRequest(req, aiChatSchema, {
      requireAuth: true,
      rateLimitKey: 'ai_chat',
      rateLimitCount: 30, // AI チャットは重いので30回/分
    });

    // コンテンツバリデーション
    const validationResult = validateInput(data.message, 2000);
    if (!validationResult.isValid) {
      await logSecurityEvent(
        SecurityEvent.MALICIOUS_PROMPT_DETECTED,
        req,
        { 
          reason: validationResult.error,
          originalMessage: data.message?.substring(0, 100)
        },
        { 
          userId: session.user.id,
          severity: 'high',
          blocked: true
        }
      );
      return createApiErrorResponse(new ApiSecurityError(400, validationResult.error || "不適切な内容が含まれています", 'CONTENT_BLOCKED'));
    }

    // セキュリティログ記録
    await logSecurityEvent(
      SecurityEvent.ADMIN_ACTION,
      req,
      { 
        action: 'ai_chat_request',
        characterId: data.characterId,
        unleashed: data.unleashed 
      },
      { 
        userId: session.user.id,
        severity: 'low'
      }
    );

    // キャラクター情報を取得
    const characterResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3015'}/api/characters/public/${data.characterId}`,
      { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!characterResponse.ok) {
      return createApiErrorResponse(new ApiSecurityError(404, "キャラクター情報の取得に失敗しました"));
    }

    const character = await characterResponse.json();

    // xAIライブラリを使用してチャット応答を生成
    const chatOptions = data.unleashed ? {
      uncensored: true,
      explicit_content: true,
      adult_mode: true,
      temperature: 1.0,
      max_tokens: 2000,
    } : {
      temperature: 0.8,
      max_tokens: 500,
    };

    const aiResponse = await createChatCompletion(
      [{ role: "user", content: validationResult.sanitized }],
      character,
      "親密な関係", // 関係性
      chatOptions
    );

    if (!aiResponse || !aiResponse.content) {
      return createApiErrorResponse(new ApiSecurityError(500, "AI応答の生成に失敗しました"));
    }

    return createApiSuccessResponse({
      message: aiResponse.content,
      characterName: character.name,
      unleashed: data.unleashed
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    
    if (error instanceof ApiSecurityError) {
      return createApiErrorResponse(error);
    }

    // セキュリティログ記録
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      req,
      { 
        endpoint: '/api/ai/chat',
        method: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { severity: 'high' }
    );
    
    // エラーの詳細を判定
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return createApiErrorResponse(new ApiSecurityError(500, "API設定エラーです。管理者にお問い合わせください。"));
      }
      if (error.message.includes('rate limit')) {
        return createApiErrorResponse(new ApiSecurityError(429, "現在アクセスが集中しています。しばらく待ってからお試しください。"));
      }
    }

    return createApiErrorResponse(new ApiSecurityError(500, "チャット機能で問題が発生しました。しばらく待ってからお試しください。"));
  }
}
