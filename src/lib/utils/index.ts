// src/lib/utils/index.ts
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";
import { format, formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

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
