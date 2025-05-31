// src/server/actions/chat.ts - データベース削除後のダミー実装
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// メッセージ送信スキーマ
const messageSchema = z.object({
  content: z
    .string()
    .min(1, "メッセージを入力してください")
    .max(1000, "メッセージは1000文字以内で入力してください"),
  imagePrompt: z
    .string()
    .max(200, "画像プロンプトは200文字以内で入力してください")
    .optional(),
  generateVoice: z.boolean().optional(),
  aiProvider: z.enum(["openai", "xai"]).optional().default("openai"),
});

// 新しい会話の作成（ダミー実装）
export async function createConversation(
  characterId: string,
  isCustom: boolean = false,
) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  return {
    success: false,
    error: "チャット機能は現在利用できません。データベースが削除されました。",
  };
}

// メッセージ送信（ダミー実装）
export async function sendMessage(
  conversationId: string,
  formData: FormData,
) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  return {
    success: false,
    error: "メッセージ送信機能は現在利用できません。データベースが削除されました。",
  };
}

// 会話の取得（ダミー実装）
export async function getConversation(conversationId: string) {
  const session = await auth();
  if (!session || !session.user) {
    return null;
  }

  return null;
}

// 会話一覧の取得（ダミー実装）
export async function getConversations() {
  const session = await auth();
  if (!session || !session.user) {
    return [];
  }

  return [];
}

// 会話の削除（ダミー実装）
export async function deleteConversation(conversationId: string) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  return {
    success: false,
    error: "会話削除機能は現在利用できません。データベースが削除されました。",
  };
}
