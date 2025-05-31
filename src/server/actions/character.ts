// src/server/actions/character.ts - データベース削除後のダミー実装
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// キャラクター作成スキーマ
const characterSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(50, "名前は50文字以内で入力してください"),
  description: z
    .string()
    .min(10, "説明は10文字以上で入力してください")
    .max(1000, "説明は1000文字以内で入力してください"),
  shortDescription: z
    .string()
    .max(100, "短い説明は100文字以内で入力してください")
    .optional(),
  age: z
    .number()
    .int()
    .min(18, "年齢は18歳以上で入力してください")
    .max(100, "年齢は100歳以下で入力してください")
    .optional(),
  gender: z.enum(["male", "female", "other"]),
  type: z.enum(["real", "anime"]),
  personality: z
    .string()
    .min(10, "性格は10文字以上で入力してください")
    .max(500, "性格は500文字以内で入力してください"),
  tags: z.array(z.string()).optional(),
});

// カスタムキャラクターの作成（ダミー実装）
export async function createCustomCharacter(formData: FormData) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  return {
    success: false,
    error: "キャラクター作成機能は現在利用できません。データベースが削除されました。",
  };
}

// キャラクター一覧の取得（ダミー実装）
export async function getCharacters() {
  return [];
}

// カスタムキャラクター一覧の取得（ダミー実装）
export async function getCustomCharacters() {
  const session = await auth();
  if (!session || !session.user) {
    return [];
  }

  return [];
}

// キャラクターの削除（ダミー実装）
export async function deleteCustomCharacter(characterId: string) {
  const session = await auth();
  if (!session || !session.user) {
    return {
      success: false,
      error: "認証が必要です",
    };
  }

  return {
    success: false,
    error: "キャラクター削除機能は現在利用できません。データベースが削除されました。",
  };
}
