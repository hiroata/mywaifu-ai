// src/lib/schemas.ts
import { z } from "zod";

// チャットAPIリクエストスキーマ
export const chatRequestSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(1000),
  imagePrompt: z.string().max(200).optional(),
  shouldGenerateVoice: z.boolean().optional().default(false),
  aiProvider: z.enum(["openai", "xai"]).optional().default("openai"),
});

// コンテンツAPIリクエストスキーマ
export const contentSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください"),
  description: z
    .string()
    .min(1, "説明は必須です")
    .max(500, "説明は500文字以内で入力してください"),
  contentType: z.enum(["story", "image", "video"], {
    invalid_type_error: "コンテンツタイプが無効です",
  }),
  characterId: z.string().optional(),
  customCharacterId: z.string().optional(),
  isPublic: z.boolean().default(true),
  storyContent: z.string().optional(),
});

// ユーティリティ関数：スキーマのバリデーション関数を生成
export function validateSchema<T>(schema: z.ZodType<T>, data: unknown): z.infer<typeof schema> | null {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error("スキーマバリデーションエラー:", error);
    return null;
  }
}
