import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { logSecurityEvent, SecurityEvent } from "@/lib/security/security-logger";
import { isRateLimited, createApiErrorResponse, createApiSuccessResponse } from "@/lib/security/api-security";
import { validateInput } from "@/lib/content-filter";
import { hasPermission, Permission, Role } from "@/lib/security/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  try {
    // Rate limiting check
    if (isRateLimited(`content-detail:${ip}`, 200, 60000)) {
      await logSecurityEvent(
        SecurityEvent.RATE_LIMIT_EXCEEDED,
        request,
        {
          endpoint: `/api/content/${params.id}`,
          method: 'GET'
        },
        { severity: 'low' }
      );
      return createApiErrorResponse({ message: 'Too many requests', status: 429 });
    }

    // ユーザー認証の確認
    const session = await auth();
    if (!session || !session.user) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        {
          endpoint: `/api/content/${params.id}`,
          method: 'GET'
        },
        { severity: 'low' }
      );
      return createApiErrorResponse({ message: "認証が必要です", status: 401 });
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
          value: contentId,
          reason: 'Input validation failed'
        },
        { 
          userId: session.user.id,
          severity: 'medium'
        }
      );
      return createApiErrorResponse({ message: "無効なコンテンツIDです", status: 400 });
    }    // コンテンツの取得
    const content = await database.characterContent.findUnique({
      where: {
        id: contentId,
        OR: [{ isPublic: true }, { userId: session.user.id }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        character: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
        },
        customCharacter: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
          },
        },
        contentTags: true,
        comments: {
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
        },
      },
    });

    if (!content) {
      await logSecurityEvent(
        SecurityEvent.SUSPICIOUS_REQUEST,
        request,
        {
          action: 'content_not_found',
          contentId: contentId
        },
        { 
          userId: session.user.id,
          severity: 'low'
        }
      );
      return createApiErrorResponse({
        message: "コンテンツが見つかりませんでした",
        status: 404
      });
    }

    // セキュリティログ記録 - 成功したアクセス
    await logSecurityEvent(
      SecurityEvent.ADMIN_ACTION,
      request,
      {
        action: 'content_detail_accessed',
        contentId: content.id,
        contentType: content.contentType
      },
      { 
        userId: session.user.id,
        severity: 'low'
      }
    );

    // レスポンスデータの整形
    const formattedContent = {
      id: content.id,
      title: content.title,
      description: content.description,
      contentType: content.contentType,
      contentUrl: content.contentUrl,
      storyContent:
        content.contentType === "story" ? content.storyContent : undefined,
      likes: content.likes,
      views: content.views,
      createdAt: content.createdAt,
      user: content.user,
      character: content.character || content.customCharacter,
      tags: content.contentTags.map((tag) => tag.name),
      comments: content.comments.map((comment) => ({
        id: comment.id,
        userId: comment.userId,
        userName: comment.user.name,
        userImage: comment.user.image,
        comment: comment.comment,
        createdAt: comment.createdAt,
      })),
    };

    return createApiSuccessResponse(formattedContent);
  } catch (error) {
    console.error("コンテンツ詳細取得エラー:", error);
    
    // セキュリティログ記録 - エラー
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      {
        endpoint: `/api/content/${params.id}`,
        method: 'GET',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { severity: 'high' }
    );
    
    return createApiErrorResponse({
      message: "コンテンツの取得に失敗しました",
      status: 500
    });
  }
}
