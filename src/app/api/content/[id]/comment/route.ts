import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { logSecurityEvent, SecurityEvent } from "@/lib/security/security-logger";
import { isRateLimited, createApiErrorResponse, createApiSuccessResponse } from "@/lib/security/api-security";
import { sanitizeHtml, validateInput, containsInappropriateContent } from "@/lib/content-filter";
import { hasPermission, Permission, Role } from "@/lib/security/rbac";

// コメントのバリデーションスキーマ
const commentSchema = z.object({
  comment: z
    .string()
    .min(1, "コメントは必須です")
    .max(500, "コメントは500文字以内で入力してください"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  try {
    // Rate limiting check for comment posting
    const rateLimitResult = await checkApiRateLimit('comment-post', ip, {
      windowMs: 5 * 60 * 1000, // 5分
      maxRequests: 20 // 5分間に20回まで
    });

    if (!rateLimitResult.success) {
      await logSecurityEvent(
        SecurityEvent.RATE_LIMIT_EXCEEDED,
        request,
        {
          endpoint: `/api/content/${params.id}/comment`,
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
          endpoint: `/api/content/${params.id}/comment`,
          method: 'POST'
        },
        { severity: 'medium', blocked: true }
      );
      return createSecurityError("認証が必要です", 401);
    }

    // Comment creation permission check
    if (!hasPermission(session.user.role as Role, Permission.CREATE_CONTENT)) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        {
          endpoint: `/api/content/${params.id}/comment`,
          method: 'POST',
          requiredPermission: Permission.CREATE_CONTENT,
          userRole: session.user.role
        },
        { 
          userId: session.user.id,
          severity: 'medium', 
          blocked: true 
        }
      );
      return createSecurityError("コメント投稿権限がありません", 403);
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

    // リクエストボディの取得
    const body = await request.json();

    // Input validation and sanitization
    const commentText = body.comment;
    const commentValidation = validateInput(commentText, 500);
    if (!commentValidation.isValid) {
      await logSecurityEvent(
        SecurityEvent.SUSPICIOUS_REQUEST,
        request,
        {
          field: 'comment',
          error: commentValidation.error,
          input: commentText?.substring(0, 50)
        },
        { 
          userId: session.user.id,
          severity: 'low', 
          blocked: true 
        }
      );
      return createSecurityError(commentValidation.error || "コメントが無効です", 400);
    }

    // Check for inappropriate content
    if (containsInappropriateContent(commentText)) {
      await logSecurityEvent(
        SecurityEvent.MALICIOUS_PROMPT_DETECTED,
        request,
        {
          contentType: 'comment',
          preview: commentText?.substring(0, 100)
        },
        { 
          userId: session.user.id,
          severity: 'high', 
          blocked: true 
        }
      );
      return createSecurityError("不適切なコンテンツが含まれています", 400);
    }

    // バリデーション
    const validatedData = commentSchema.parse({
      comment: sanitizeHtml(commentText)
    });

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
          action: 'comment_on_nonexistent_content',
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

    // コメントの作成
    const comment = await db.contentComment.create({
      data: {
        contentId,
        userId,
        comment: validatedData.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // レスポンスデータの整形
    const formattedComment = {
      id: comment.id,
      userId: comment.userId,
      userName: comment.user.name,
      userImage: comment.user.image,
      comment: comment.comment,
      createdAt: comment.createdAt,
    };

    await logSecurityEvent(
      SecurityEvent.ADMIN_ACTION, // Comment creation
      request,
      {
        commentId: comment.id,
        contentId: contentId,
        action: 'comment_created'
      },
      { 
        userId: session.user.id,
        severity: 'low'
      }
    );

    return createSecurityResponse({
      success: true,
      data: formattedComment,
    });
  } catch (error) {
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      {
        endpoint: `/api/content/${params.id}/comment`,
        method: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        userId: (await auth())?.user?.id,
        severity: 'high' 
      }
    );

    console.error("コメントエラー:", error);

    if (error instanceof z.ZodError) {
      return createSecurityError(error.errors[0].message, 400);
    }

    return createSecurityError("コメントの投稿に失敗しました", 500);
  }
}

// コメント一覧の取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  try {
    // Rate limiting check for comment listing
    const rateLimitResult = await checkApiRateLimit('comment-list', ip, {
      windowMs: 60 * 1000, // 1分
      maxRequests: 200 // 1分間に200回まで
    });

    if (!rateLimitResult.success) {
      await logSecurityEvent(
        SecurityEvent.RATE_LIMIT_EXCEEDED,
        request,
        {
          endpoint: `/api/content/${params.id}/comment`,
          method: 'GET',
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
          endpoint: `/api/content/${params.id}/comment`,
          method: 'GET'
        },
        { severity: 'low', blocked: true }
      );
      return createSecurityError("認証が必要です", 401);
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
          action: 'get_comments_nonexistent_content',
          contentId: contentId
        },
        { 
          userId: session.user.id,
          severity: 'low', 
          blocked: true 
        }
      );
      return createSecurityError("コンテンツが見つかりませんでした", 404);
    }

    // コメントの取得
    const comments = await db.contentComment.findMany({
      where: {
        contentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // レスポンスデータの整形
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      userName: comment.user.name,
      userImage: comment.user.image,
      comment: comment.comment,
      createdAt: comment.createdAt,
    }));

    await logSecurityEvent(
      SecurityEvent.ADMIN_ACTION, // Comment listing
      request,
      {
        contentId: contentId,
        commentCount: formattedComments.length,
        action: 'comments_listed'
      },
      { 
        userId: session.user.id,
        severity: 'low'
      }
    );

    return createSecurityResponse({
      success: true,
      data: formattedComments,
    });
  } catch (error) {
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      {
        endpoint: `/api/content/${params.id}/comment`,
        method: 'GET',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        userId: (await auth())?.user?.id,
        severity: 'high' 
      }
    );

    console.error("コメント取得エラー:", error);
    return createSecurityError("コメントの取得に失敗しました", 500);
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
