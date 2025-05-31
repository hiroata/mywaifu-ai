import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/database";
import { database } from "@/lib/database";
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
    // Rate limiting check for like/unlike actions
    const rateLimitResult = await checkApiRateLimit('content-like', ip, {
      windowMs: 60 * 1000, // 1分
      maxRequests: 100 // 1分間に100回まで
    });

    if (!rateLimitResult.success) {
      await logSecurityEvent(
        SecurityEvent.RATE_LIMIT_EXCEEDED,
        request,
        {
          endpoint: `/api/content/${params.id}/like`,
          method: 'POST',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining
        },
        { severity: 'medium', blocked: true }
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
          endpoint: `/api/content/${params.id}/like`,
          method: 'POST'
        },
        { severity: 'low', blocked: true }
      );
      return createSecurityError("認証が必要です", 401);
    }

    // Like permission check
    if (!hasPermission(session.user.role as Role, Permission.CREATE_CONTENT)) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        {
          endpoint: `/api/content/${params.id}/like`,
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
      return createSecurityError("いいね権限がありません", 403);
    }

    const contentId = params.id;
    const userId = session.user.id;

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
      return createSecurityError("無効なコンテンツIDです", 400);
    }

    // コンテンツの存在確認
    const content = await db.characterContent.findUnique({
      where: {
        id: contentId,
      },
    });

    if (!content) {
      await logSecurityEvent(
        SecurityEvent.SUSPICIOUS_REQUEST,
        request,
        {
          action: 'like_nonexistent_content',
          contentId: contentId
        },
        { 
          userId: session.user.id,
          severity: 'medium', 
          blocked: true 
        }
      );
      return createSecurityError("コンテンツが見つかりませんでした", 404);
    }

    // ユーザーがすでにいいねしているか確認
    const existingLike = await db.contentLike.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
    });

    if (existingLike) {
      // いいねを解除
      await db.contentLike.delete({
        where: {
          userId_contentId: {
            userId,
            contentId,
          },
        },
      });

      // いいね数を減らす
      const updatedContent = await db.characterContent.update({
        where: { id: contentId },
        data: { likes: { decrement: 1 } },
      });

      await logSecurityEvent(
        SecurityEvent.ADMIN_ACTION, // Like removed
        request,
        {
          contentId: contentId,
          action: 'like_removed',
          newLikeCount: updatedContent.likes
        },
        { 
          userId: session.user.id,
          severity: 'low'
        }
      );

      return createSecurityResponse({
        success: true,
        data: {
          liked: false,
          likes: updatedContent.likes,
        },
      });
    } else {
      // いいねを追加
      await db.contentLike.create({
        data: {
          userId,
          contentId,
        },
      });

      // いいね数を増やす
      const updatedContent = await db.characterContent.update({
        where: { id: contentId },
        data: { likes: { increment: 1 } },
      });

      await logSecurityEvent(
        SecurityEvent.ADMIN_ACTION, // Like added
        request,
        {
          contentId: contentId,
          action: 'like_added',
          newLikeCount: updatedContent.likes
        },
        { 
          userId: session.user.id,
          severity: 'low'
        }
      );

      return createSecurityResponse({
        success: true,
        data: {
          liked: true,
          likes: updatedContent.likes,
        },
      });
    }
  } catch (error) {
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      {
        endpoint: `/api/content/${params.id}/like`,
        method: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        userId: (await auth())?.user?.id,
        severity: 'high' 
      }
    );

    console.error("いいねエラー:", error);
    return createSecurityError("いいねの処理に失敗しました", 500);
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
