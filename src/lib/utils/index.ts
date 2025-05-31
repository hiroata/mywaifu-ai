// src/lib/utils/index.ts
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";
import { format, formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { z } from "zod";

// fsとpathモジュールはサーバーサイドでのみ使用
let fs: any;
let path: any;
if (typeof window === 'undefined') {
  fs = require('fs');
  path = require('path');
}

// Tailwindクラスを結合するユーティリティ関数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// IDを生成するユーティリティ関数
export function generateId(length: number = 10): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

// オブジェクトの深いコピーを作成
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 配列からランダムな要素を取得
export function getRandomItem<T>(array: T[]): T {
  if (!array || array.length === 0) {
    throw new Error("配列が空です");
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// 文字列が実際に含まれるか（大小文字を区別しない）
export function includesIgnoreCase(text: string, search: string): boolean {
  return text.toLowerCase().includes(search.toLowerCase());
}

// formatting関数は下部に統合されました
// 削除された重複関数: capitalize, formatCurrency, truncateText, stripHtml, slugify, formatFileSize

// 指定範囲の乱数を生成
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// オブジェクト配列を特定のキーでグループ化
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
}

// オブジェクトから特定のキーだけを抽出
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  return keys.reduce(
    (result, key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
      return result;
    },
    {} as Pick<T, K>,
  );
}

// オブジェクトから特定のキーを除外
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

// 配列を指定された数のチャンクに分割
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// 非同期関数の実行を遅延させる
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// getError関数を追加
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// 安全なローカルストレージアクセス
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("LocalStorage getItem error:", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("LocalStorage setItem error:", e);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("LocalStorage removeItem error:", e);
    }
  },
};

// --- SaveFileOptions型（file-utils.tsより移植） ---
export interface SaveFileOptions {
  folder: string;
  extension?: string;
  baseDir?: string;
  fileName?: string;
}

// --- saveFile（file-utils.tsのオプション形式もサポート） ---
export async function saveFile(
  buffer: Buffer,
  folderOrOptions: string | SaveFileOptions,
  extension?: string,
  baseDir?: string,
): Promise<string> {
  // サーバーサイドでのみ実行可能
  if (typeof window !== 'undefined') {
    console.error('saveFile関数はサーバーサイドでのみ実行できます');
    throw new Error('saveFile関数はサーバーサイドでのみ実行できます');
  }

  let folder: string;
  let ext = "bin";
  let base = "./public/uploads";
  let fileName: string;

  if (typeof folderOrOptions === "string") {
    folder = folderOrOptions;
    if (extension) ext = extension;
    if (baseDir) base = baseDir;
    fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${ext}`;
  } else {
    folder = folderOrOptions.folder;
    ext = folderOrOptions.extension || "bin";
    base = folderOrOptions.baseDir || "./public/uploads";
    fileName = folderOrOptions.fileName || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${ext}`;
  }

  const dirPath = path.join(base, folder);
  const filePath = path.join(dirPath, fileName);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, buffer);
  return `/uploads/${folder}/${fileName}`;
}

// --- base64ToBuffer（file-utils.tsより移植） ---
export function base64ToBuffer(base64String: string): Buffer {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

// エラーハンドリング標準化
export interface ErrorResponse {
  success: boolean;
  message: string;
  code?: string;
  details?: any;
}

export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "エラーが発生しました",
): ErrorResponse {
  console.error(error);
  return {
    success: false,
    message: getErrorMessage(error) || defaultMessage,
    code:
      error instanceof Error && "code" in error
        ? (error as any).code
        : undefined,
  };
}

export function createSuccessResponse<T>(data: T): T & { success: boolean } {
  return { ...data, success: true };
}

// 統一されたAPIレスポンス型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
): ApiResponse<T> {
  return {
    success,
    ...(data !== undefined && { data }),
    ...(error && { error }),
    ...(message && { message }),
  };
}

// NextResponse用のヘルパー
export function createApiError(error: string, status: number = 400) {
  return NextResponse.json(createApiResponse(false, undefined, error), {
    status,
  });
}

export function createApiSuccess<T>(data: T, message?: string) {
  return NextResponse.json(createApiResponse(true, data, undefined, message));
}

// --- date-fnsを利用した日付関数（date.tsから統合・改良） ---

// 日本語の日付フォーマット
export function formatDateJP(date: Date | string | number): string {
  return format(new Date(date), 'yyyy年MM月dd日', { locale: ja });
}

// 日本語の日時フォーマット
export function formatDateTimeJP(date: Date | string | number): string {
  return format(new Date(date), 'yyyy年MM月dd日 HH:mm', { locale: ja });
}

// formatDate関数（utils.tsから移植）
export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// 相対的な時間表示（〜分前、〜時間前など）
export function getRelativeTimeJP(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { locale: ja, addSuffix: true });
}

// 汎用フォーマット関数
export function formatDateCustom(date: Date | string | number, formatString: string): string {
  return format(new Date(date), formatString, { locale: ja });
}

// --- 文字列フォーマット関数（formatting.tsから統合） ---

// 文字列の最初の文字を大文字にし、残りを小文字にする
export function capitalize(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// 金額をフォーマット（日本円表記）
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
  }).format(amount);
}

// テキストを指定した長さに切り詰め、末尾に省略記号を付ける
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

// HTMLタグを除去してプレーンテキストを取得
export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

// 文字列をスラッグに変換（URL用）
export function slugify(text: string): string {
  if (!text) return "";

  return text
    .toLowerCase()
    .normalize("NFD") // 発音記号等を分解
    .replace(/[\u0300-\u036f]/g, "") // アクセント記号などの削除
    .replace(/[^a-z0-9ぁ-んァ-ン一-龯ー]/g, "-") // 英数字、日本語以外をハイフンに置換
    .replace(/-+/g, "-") // 連続するハイフンを一つに
    .replace(/^-|-$/g, ""); // 先頭と末尾のハイフンを削除
}

// ファイルサイズを読みやすい形式に変換
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// --- utils.tsから統合された関数 ---
export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${path}`;
}

// ====================================
// バリデーションスキーマ (schemas.tsから統合)
// ====================================

// チャットAPIリクエストスキーマ
export const chatRequestSchema = z.object({
  message: z.string().min(1, "メッセージは必須です").max(1000, "メッセージは1000文字以内で入力してください"),
  conversationId: z.string().optional(),
  characterId: z.string().optional(),
  customCharacterId: z.string().optional(),
  content: z.string().min(1).max(1000).optional(), // 後方互換性のため
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

// キャラクタースキーマ
export const characterSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(50, "名前は50文字以内で入力してください"),
  description: z.string().min(10, "説明は10文字以上で入力してください").max(1000, "説明は1000文字以内で入力してください"),
  personality: z.string().min(5, "性格は5文字以上で入力してください").max(200, "性格は200文字以内で入力してください"),
  age: z.number().min(18, "年齢は18歳以上である必要があります").max(100, "年齢は100歳以下である必要があります"),
  gender: z.enum(["male", "female", "other"]),
  type: z.enum(["anime", "realistic", "cartoon"]),
  isPublic: z.boolean().default(true),
});

// メディアファイルバリデーション
export const validateMediaFile = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('サポートされていないファイル形式です');
  }

  if (file.size > maxSize) {
    throw new Error('ファイルサイズが大きすぎます（最大5MB）');
  }

  return true;
};

// ユーティリティ関数：スキーマのバリデーション関数を生成
export function validateSchema<T>(schema: z.ZodType<T>, data: unknown): z.infer<typeof schema> | null {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error("スキーマバリデーションエラー:", error);
    return null;
  }
}

// フォームデータのバリデーション
export function validateFormData<T>(schema: z.ZodType<T>, formData: FormData): { success: boolean; data?: T; errors?: string[] } {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors.map(e => e.message) };
    }
    return { success: false, errors: ['バリデーションエラーが発生しました'] };
  }
}

// ====================================
// コンテンツフィルタリング関数
// ====================================
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function validateInput(input: string, maxLength: number = 1000): {
  isValid: boolean;
  error?: string;
  sanitized: string;
} {
  if (!input) {
    return {
      isValid: false,
      error: 'Input is required',
      sanitized: ''
    };
  }

  if (input.length > maxLength) {
    return {
      isValid: false,
      error: `Input exceeds maximum length of ${maxLength} characters`,
      sanitized: ''
    };
  }

  const sanitized = sanitizeHtml(input);
  
  return {
    isValid: true,
    sanitized
  };
}

export function containsInappropriateContent(input: string): boolean {
  if (!input) return false;
  
  const inappropriatePatterns = [
    /\b(?:fuck|shit|damn|hell|ass|bitch)\b/gi,
    /\b(?:性的|エロ|アダルト|ポルノ)\b/gi,
    /\b(?:violence|violent|kill|murder|death)\b/gi,
    /\b(?:暴力|殺人|死|殺す)\b/gi,
    /\b(?:hate|racist|discrimination)\b/gi,
    /\b(?:ヘイト|差別|人種)\b/gi
  ];

  return inappropriatePatterns.some(pattern => pattern.test(input));
}

// ====================================
// セキュリティ機能統合 (security/から統合)
// ====================================
// セキュリティ関数は個別にインポートされます

// ====================================
// AI機能統合 (ai/から統合)
// ====================================
// AI関数は個別にインポートされます

// ====================================
// データベース統合 (database.tsから統合)
// ====================================
export { db, mockDb, database, mockData } from '../database';
