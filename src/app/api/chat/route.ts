// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// リクエストスキーマ
const requestSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(1000),
  imagePrompt: z.string().max(200).optional(),
  shouldGenerateVoice: z.boolean().optional().default(false),
  aiProvider: z.enum(["openai", "xai"]).optional().default("openai"),
});

export async function POST(request: NextRequest) {
  try {
    // テストモードのみ対応
    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    console.error("ChatAPI エラー:", error);
    return NextResponse.json(
      { error: "メッセージの処理中にエラーが発生しました" },
      { status: 500 },
    );
  }
}

// 会話の履歴を取得するエンドポイント
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: [
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
      ],
    });
  } catch (error) {
    console.error("ChatAPI エラー:", error);
    return NextResponse.json(
      { error: "メッセージの取得中にエラーが発生しました" },
      { status: 500 },
    );
  }
}
