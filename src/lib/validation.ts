// src/lib/validation.ts - 包括的なバリデーション
import { z } from 'zod';

// AI API リクエストバリデーション
export const aiRequestSchema = z.object({
  prompt: z.string()
    .min(1, 'プロンプトは必須です')
    .max(10000, 'プロンプトは10,000文字以内で入力してください'),
  model: z.string().optional(),
  provider: z.enum(['xai', 'gemini', 'openai']).default('xai'),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
});

// チャットメッセージバリデーション
export const chatMessageSchema = z.object({
  content: z.string()
    .min(1, 'メッセージを入力してください')
    .max(1000, 'メッセージは1000文字以内で入力してください'),
  conversationId: z.string().cuid('無効な会話IDです'),
  imagePrompt: z.string().max(200).optional(),
  generateVoice: z.boolean().default(false),
  aiProvider: z.enum(['openai', 'xai']).default('xai'),
});

// ユーザー登録バリデーション
export const userRegistrationSchema = z.object({
  name: z.string()
    .min(2, '名前は2文字以上で入力してください')
    .max(50, '名前は50文字以内で入力してください'),
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .max(255, 'メールアドレスが長すぎます'),
  password: z.string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(128, 'パスワードは128文字以内で入力してください')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'パスワードは小文字、大文字、数字を含む必要があります'),
});

// WebSocket イベントバリデーション
export const socketEventSchema = z.object({
  chatId: z.string().cuid(),
  message: z.string().min(1).max(1000).optional(),
  userId: z.string().cuid(),
  isTyping: z.boolean().optional(),
});

// API エラー型
export interface APIError {
  message: string;
  code?: string;
  status: number;
  details?: any;
}

// エラーレスポンス標準化
export function createErrorResponse(
  message: string, 
  status: number = 500, 
  code?: string,
  details?: any
): Response {
  const error: APIError = { message, status, code, details };
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 成功レスポンス標準化
export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
