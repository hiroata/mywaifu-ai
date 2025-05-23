// src/lib/utils/index.ts
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as fs from "fs";
import * as path from "path";
import { NextResponse } from "next/server";

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

// ファイル操作用の共通ユーティリティ
export async function saveFile(
  buffer: Buffer,
  folder: string,
  extension: string = "bin",
  baseDir: string = "./public/uploads",
): Promise<string> {
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
  const dirPath = path.join(baseDir, folder);
  const filePath = path.join(dirPath, fileName);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, buffer);
  return `/uploads/${folder}/${fileName}`;
}

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
