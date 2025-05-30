import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { logSecurityEvent, SecurityEvent } from "@/lib/security/security-logger";
import { isRateLimited, createApiErrorResponse, createApiSuccessResponse } from "@/lib/security/api-security";
import { validateInput } from "@/lib/content-filter";
import { hasPermission, Permission, Role } from "@/lib/security/rbac";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  try {
    // Rate limiting check for view tracking (permissive but prevents abuse)
    const rateLimitResult = await checkApiRateLimit('content-view', ip, {
      windowMs: 60 * 1000, // 1分
      maxRequests: 50 // 1分間に50回まで (読み取り専用なので比較的緩い)
    });

    if (!rateLimitResult.success) {
      await logSecurityEvent(
        SecurityEvent.RATE_LIMIT_EXCEEDED,
        request,
        {
          endpoint: `/api/content/${params.id}/view`,
          method: 'POST',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining
        },
        { severity: 'low', blocked: true }
      );
      return createSecurityError('Too many requests', 429);
    }

    // ユーザー認証の確認
    const session = await auth();
    if (!session || !session.user) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        {
          endpoint: `/api/content/${params.id}/view`,
          method: 'POST'
        },
        { severity: 'low', blocked: true }
      );
      return createSecurityError("認証が必要です", 401);
    }

    // View tracking permission check
    if (!hasPermission(session.user.role as Role, Permission.CREATE_CONTENT)) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        {
          endpoint: `/api/content/${params.id}/view`,
          method: 'POST',
          requiredPermission: Permission.CREATE_CONTENT,
          userRole: session.user.role
        },
        { 
          userId: session.user.id,
          severity: 'low', 
          blocked: true 
        }
      );
      return createSecurityError("閲覧権限がありません", 403);
    }

    const contentId = params.id;

    // Content ID validation
    const contentIdValidation = validateInput(contentId, 50);
    if (!contentIdValidation.isValid) {
      await logSecurityEvent(
        SecurityEvent.SUSPICIOUS_REQUEST,
        request,
        {
          field: 'contentId',
          error: contentIdValidation.error,
          input: contentId?.substring(0, 20)
        },
        { 
          userId: session.user.id,
          severity: 'low', 
          blocked: true 
        }
      );
      return createSecurityError("無効なコンテンツIDです", 400);    }

    // コンテンツ機能は現在無効化されています
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      {
        action: 'content_view_disabled',
        contentId: contentId
      },
      { 
        userId: session.user.id,
        severity: 'low', 
        blocked: true 
      }
    );
    return createSecurityError("コンテンツ機能は現在利用できません", 404);
  } catch (error) {
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      {
        endpoint: `/api/content/${params.id}/view`,
        method: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        userId: (await auth())?.user?.id,
        severity: 'high' 
      }
    );

    console.error("閲覧数カウントエラー:", error);
    return createSecurityError("閲覧数のカウントに失敗しました", 500);
  }
}

// Helper functions for security responses
const createSecurityError = (message: string, status: number) => {
  return createApiErrorResponse({ message, status });
};

const createSecurityResponse = (data: any, status: number = 200) => {
  return createApiSuccessResponse(data, status);
};

const checkApiRateLimit = async (key: string, ip: string, options: { windowMs: number; maxRequests: number }) => {
  const rateLimitKey = `${key}:${ip}`;
  const isLimited = isRateLimited(rateLimitKey, options.maxRequests, options.windowMs);
  return {
    success: !isLimited,
    limit: options.maxRequests,
    remaining: isLimited ? 0 : options.maxRequests
  };
};
