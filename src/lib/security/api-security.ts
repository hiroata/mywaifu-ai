// src/lib/security/api-security.ts
/**
 * API セキュリティ強化ユーティリティ
 * レート制限、認証、権限チェックなどの共通機能
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { hasPermission, Permission, Role, parseRole } from './rbac';

export class ApiSecurityError extends Error {
  constructor(public statusCode: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiSecurityError';
  }
}

// メモリ内レート制限ストア（本番環境ではRedisを推奨）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * レート制限チェック
 * 
 * @param key レート制限キー
 * @param limit 制限回数
 * @param windowMs 時間窓（ミリ秒）
 * @returns レート制限に引っかかった場合はtrue
 */
export function isRateLimited(key: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (entry.count >= limit) {
    return true;
  }

  entry.count++;
  return false;
}

/**
 * レート制限のクリーンアップ（定期実行推奨）
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => {
    rateLimitStore.delete(key);
  });
}

// 定期的なクリーンアップ（5分ごと）
setInterval(cleanupRateLimit, 5 * 60 * 1000);

/**
 * APIリクエストの包括的な検証
 * 
 * @param request NextRequest オブジェクト
 * @param schema Zodスキーマ
 * @param options セキュリティオプション
 * @returns 検証されたデータ
 */
export async function validateApiRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
  options: {
    requireAuth?: boolean;
    requiredPermission?: Permission;
    rateLimitKey?: string;
    rateLimitCount?: number;
    rateLimitWindow?: number;
  } = {}
): Promise<{ data: T; session: any }> {
  const {
    requireAuth = true,
    requiredPermission,
    rateLimitKey,
    rateLimitCount = 100,
    rateLimitWindow = 60000
  } = options;

  // レート制限チェック
  if (rateLimitKey) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const key = `${rateLimitKey}_${ip}`;
    
    if (isRateLimited(key, rateLimitCount, rateLimitWindow)) {
      throw new ApiSecurityError(429, 'Rate limit exceeded', 'RATE_LIMIT_EXCEEDED');
    }
  }

  // 認証チェック
  let session = null;
  if (requireAuth) {
    session = await auth();
    if (!session?.user) {
      throw new ApiSecurityError(401, 'Authentication required', 'AUTH_REQUIRED');
    }

    // 権限チェック
    if (requiredPermission) {
      const userRole = parseRole(session.user.role);
      if (!hasPermission(userRole, requiredPermission)) {
        throw new ApiSecurityError(403, 'Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
      }
    }
  }

  // リクエストボディの検証
  try {
    const contentType = request.headers.get('content-type');
    let body: any;

    if (contentType?.includes('application/json')) {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = {};
    }

    const data = schema.parse(body);
    return { data, session };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiSecurityError(
        400, 
        `Invalid request data: ${error.errors.map(e => e.message).join(', ')}`,
        'VALIDATION_ERROR'
      );
    }
    throw new ApiSecurityError(400, 'Invalid request format', 'INVALID_FORMAT');
  }
}

/**
 * APIエラーレスポンスの作成
 * 
 * @param error エラーオブジェクト
 * @returns NextResponse
 */
export function createApiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiSecurityError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected API error:', error);
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    },
    { status: 500 }
  );
}

/**
 * 成功レスポンスの作成
 * 
 * @param data レスポンスデータ
 * @param status HTTPステータスコード
 * @returns NextResponse
 */
export function createApiSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}
