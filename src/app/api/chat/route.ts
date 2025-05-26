// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createApiSuccess, createApiError } from "@/lib/utils/index";
import { chatRequestSchema } from "@/lib/schemas";
import { validateApiRequest, createApiErrorResponse, createApiSuccessResponse, ApiSecurityError } from "@/lib/security/api-security";
import { logSecurityEvent, SecurityEvent } from "@/lib/security/security-logger";
import { filterContent } from "@/lib/content-filter";
import { auth } from "@/lib/auth";

// リクエストスキーマの削除（lib/schemasに移動済み）

export async function POST(request: NextRequest) {
  try {
    // セキュリティ検証
    const { data, session } = await validateApiRequest(request, chatRequestSchema, {
      requireAuth: true,
      rateLimitKey: 'chat',
      rateLimitCount: 50, // チャットは頻度が高いので50回/分
    });

    // セキュリティログ記録
    await logSecurityEvent(
      SecurityEvent.ADMIN_ACTION,
      request,
      { 
        action: 'chat_request',
        characterId: data.characterId 
      },
      { 
        userId: session.user.id,
        severity: 'low'
      }
    );

    // メッセージまたはコンテンツフィールドを使用（後方互換性）
    const messageContent = data.message || data.content || "";
    
    // コンテンツフィルタリング
    const filteredMessage = await filterContent(messageContent);
    if (filteredMessage.blocked) {
      await logSecurityEvent(
        SecurityEvent.MALICIOUS_PROMPT_DETECTED,
        request,
        { 
          reason: filteredMessage.reason,
          originalMessage: messageContent?.substring(0, 100)
        },
        { 
          userId: session.user.id,
          severity: 'high',
          blocked: true
        }
      );
      return createApiErrorResponse(new ApiSecurityError(400, "メッセージが不適切な内容を含んでいます", 'CONTENT_BLOCKED'));
    }

    // テストモードのみ対応
    return createApiSuccessResponse({
      userMessage: {
        id: "mock-user-message-id",
        conversationId: data.conversationId || "mock-conversation-id",
        content: filteredMessage.content,
        role: "user",
        createdAt: new Date().toISOString(),
      },
      assistantMessage: {
        id: "mock-assistant-message-id",
        conversationId: data.conversationId || "mock-conversation-id",
        content: "これはテスト応答です。ビルドテスト用のモックメッセージです。",
        role: "assistant",
        createdAt: new Date().toISOString(),
      },
      relationship: null,
    });
  } catch (error) {
    console.error("ChatAPI エラー:", error);

    if (error instanceof ApiSecurityError) {
      return createApiErrorResponse(error);
    }

    // 予期しないエラーのログ記録
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      { 
        endpoint: '/api/chat',
        method: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { severity: 'high' }
    );

    return createApiErrorResponse(new ApiSecurityError(500, "メッセージの処理中にエラーが発生しました"));
  }
}

// 会話の履歴を取得するエンドポイント
export async function GET(request: NextRequest) {
  try {
    // セキュリティ検証（GETは軽いバリデーション）
    const { data, session } = await validateApiRequest(request, z.object({}), {
      requireAuth: true,
      rateLimitKey: 'chat_get',
      rateLimitCount: 100,
    });

    // セキュリティログ記録
    await logSecurityEvent(
      SecurityEvent.ADMIN_ACTION,
      request,
      { action: 'get_chat_history' },
      { 
        userId: session.user.id,
        severity: 'low'
      }
    );

    return createApiSuccessResponse([
      {
        id: "mock-message-1",
        conversationId: "mock-conversation-id",
        content: "こんにちは",
        role: "user",
        createdAt: new Date().toISOString(),
      },
      {
        id: "mock-message-2",
        conversationId: "mock-conversation-id",
        content: "これはテスト応答です。",
        role: "assistant",
        createdAt: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error("ChatAPI エラー:", error);

    if (error instanceof ApiSecurityError) {
      return createApiErrorResponse(error);
    }

    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      { 
        endpoint: '/api/chat',
        method: 'GET',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { severity: 'medium' }
    );

    return createApiErrorResponse(new ApiSecurityError(500, "メッセージの取得中にエラーが発生しました"));
  }
}
