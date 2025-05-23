// src/lib/utils/validation.ts
import { z } from "zod";

// メールアドレスのバリデーションスキーマ
export const emailSchema = z
  .string()
  .min(1, { message: "メールアドレスは必須です" })
  .email({ message: "有効なメールアドレスを入力してください" });

// パスワードのバリデーションスキーマ
export const passwordSchema = z
  .string()
  .min(8, { message: "パスワードは8文字以上である必要があります" })
  .regex(/[A-Z]/, {
    message: "パスワードには少なくとも1つの大文字が含まれる必要があります",
  })
  .regex(/[a-z]/, {
    message: "パスワードには少なくとも1つの小文字が含まれる必要があります",
  })
  .regex(/[0-9]/, {
    message: "パスワードには少なくとも1つの数字が含まれる必要があります",
  });

// ユーザー名のバリデーションスキーマ
export const usernameSchema = z
  .string()
  .min(3, { message: "ユーザー名は3文字以上である必要があります" })
  .max(20, { message: "ユーザー名は20文字以下である必要があります" })
  .regex(/^[a-zA-Z0-9_-]+$/, {
    message:
      "ユーザー名には英数字、アンダースコア(_)、ハイフン(-)のみ使用できます",
  });

// 画像ファイルのバリデーション関数
export function validateImageFile(
  file: File | null | undefined,
): string | null {
  if (!file) return null;

  // ファイル形式の確認
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return "JPEG, PNG, GIF, WebP形式の画像ファイルをアップロードしてください";
  }

  // ファイルサイズの確認（5MB以下）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return "画像サイズは5MB以下である必要があります";
  }

  return null;
}

// 動画ファイルのバリデーション関数
export function validateVideoFile(
  file: File | null | undefined,
): string | null {
  if (!file) return null;

  const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
  if (!allowedTypes.includes(file.type)) {
    return "MP4, WebM, OGG形式の動画ファイルをアップロードしてください";
  }

  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return "動画サイズは100MB以下である必要があります";
  }

  return null;
}

// URLのバリデーション関数
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 日本の電話番号のバリデーション関数
export function isValidJapanesePhoneNumber(phoneNumber: string): boolean {
  // 日本の電話番号のパターン（ハイフンあり・なし両対応）
  const pattern = /^(0[0-9]{1,4}-?[0-9]{1,4}-?[0-9]{3,4})$/;
  return pattern.test(phoneNumber);
}

// 年齢のバリデーション関数（13歳以上、120歳以下）
export function isValidAge(age: number): boolean {
  return age >= 13 && age <= 120;
}

// オブジェクトのすべてのフィールドがnullまたは空の文字列でないか確認
export function hasAnyValue(obj: Record<string, any>): boolean {
  return Object.values(obj).some(
    (value) => value !== null && value !== undefined && value !== "",
  );
}

// 汎用バリデーション
export const fileSchema = z.object({
  size: z
    .number()
    .max(5 * 1024 * 1024, {
      message: "ファイルサイズは5MB以下である必要があります",
    }),
  type: z
    .string()
    .refine(
      (type) =>
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type),
      {
        message: "JPEG, PNG, GIF, WebP形式のファイルをアップロードしてください",
      },
    ),
});

// キャラクターのバリデーションスキーマ
export const characterSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です" }),
  description: z
    .string()
    .min(10, { message: "説明文は10文字以上入力してください" }),
  shortDescription: z.string().optional(),
  age: z.number().optional(),
  gender: z.string(),
  type: z.string(),
  personality: z.string(),
  tags: z.array(z.string()),
});

// バリデーションユーティリティ
export function validateData<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: boolean; data?: T; error?: string } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "バリデーションエラーが発生しました" };
  }
}
