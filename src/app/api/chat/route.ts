// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createApiSuccess, createApiError } from "@/lib/utils/index";
import { chatRequestSchema } from "@/lib/schemas";

// リクエストスキーマの削除（lib/schemasに移動済み）

export async function POST(request: NextRequest) {
  try {
    // テストモードのみ対応
    return createApiSuccess({
      userMessage: {
        id: "mock-user-message-id",
        conversationId: "mock-conversation-id",
        content: "こんにちは",
        role: "user",
        createdAt: new Date().toISOString(),
      },
      assistantMessage: {
        id: "mock-assistant-message-id",
        conversationId: "mock-conversation-id",
        content:
          "これはテスト応答です。ビルドテスト用のモックメッセージです。",
        role: "assistant",
        createdAt: new Date().toISOString(),
      },
      relationship: null,
    });
  } catch (error) {
    console.error("ChatAPI エラー:", error);
    return createApiError("メッセージの処理中にエラーが発生しました", 500);
  }
}

// 会話の履歴を取得するエンドポイント
export async function GET(request: NextRequest) {
  try {
    return createApiSuccess([
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
    return createApiError("メッセージの取得中にエラーが発生しました", 500);
  }
}
