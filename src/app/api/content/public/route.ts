import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logSecurityEvent, SecurityEvent } from "@/lib/security/security-logger";
import { isRateLimited, createApiErrorResponse, createApiSuccessResponse } from "@/lib/security/api-security";
import { validateInput } from "@/lib/content-filter";

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  try {
    // Rate limiting check for public content (more permissive but still protected)
    const rateLimitResult = await checkApiRateLimit('public-content', ip, {
      windowMs: 60 * 1000, // 1分
      maxRequests: 200 // 1分間に200回まで (パブリックAPIなので比較的緩い)
    });

    if (!rateLimitResult.success) {
      await logSecurityEvent(
        SecurityEvent.RATE_LIMIT_EXCEEDED,
        request,
        {
          endpoint: '/api/content/public',
          method: 'GET',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining
        },
        { severity: 'low', blocked: true }
      );
      return createSecurityError('Too many requests', 429);
    }

    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("characterId");
    const pageRaw = searchParams.get("page") || "1";
    const limitRaw = searchParams.get("limit") || "10";
    const contentType = searchParams.get("type");

    // Input validation for query parameters
    const pageValidation = validateInput(pageRaw, 10);
    const limitValidation = validateInput(limitRaw, 10);

    if (!pageValidation.isValid || !limitValidation.isValid) {
      await logSecurityEvent(
        SecurityEvent.SUSPICIOUS_REQUEST,
        request,
        {
          invalidPage: !pageValidation.isValid,
          invalidLimit: !limitValidation.isValid,
          endpoint: '/api/content/public'
        },
        { severity: 'low', blocked: true }
      );
      return createSecurityError("無効なパラメータです", 400);
    }

    const page = Math.max(1, parseInt(pageRaw));
    const limit = Math.min(50, Math.max(1, parseInt(limitRaw))); // 最大50件まで
    const skip = (page - 1) * limit;

    // Character ID validation if provided
    if (characterId) {
      const characterIdValidation = validateInput(characterId, 50);
      if (!characterIdValidation.isValid) {
        await logSecurityEvent(
          SecurityEvent.SUSPICIOUS_REQUEST,
          request,
          {
            field: 'characterId',
            error: characterIdValidation.error,
            input: characterId?.substring(0, 20)
          },
          { severity: 'low', blocked: true }
        );
        return createSecurityError("無効なキャラクターIDです", 400);
      }
    }

    // Content type validation if provided
    if (contentType && !["story", "image", "video"].includes(contentType)) {
      await logSecurityEvent(
        SecurityEvent.SUSPICIOUS_REQUEST,
        request,
        {
          field: 'contentType',
          input: contentType
        },
        { severity: 'low', blocked: true }
      );
      return createSecurityError("無効なコンテンツタイプです", 400);
    }

    // フィルター条件を構築
    const where: any = {
      isPublic: true,
    };

    if (characterId) {
      where.OR = [
        { characterId },
        { character: { id: characterId } },
        { customCharacter: { id: characterId } },
      ];
    }

    if (contentType) {
      where.contentType = contentType;
    }

    // コンテンツを取得
    const [contents, total] = await Promise.all([
      db.characterContent.findMany({
        where,
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
          contentTags: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.characterContent.count({ where }),
    ]);

    // Format response data
    const formattedContents = contents.map((content) => ({
      id: content.id,
      title: content.title,
      description: content.description,
      contentType: content.contentType,
      contentUrl: content.contentUrl,
      storyContent: content.contentType === "story" ? content.storyContent : undefined,
      likes: content.likes,
      views: content.views,
      createdAt: content.createdAt,
      user: content.user,
      character: content.character || content.customCharacter,
      tags: content.contentTags.map((tag) => tag.name),
    }));

    await logSecurityEvent(
      SecurityEvent.ADMIN_ACTION, // Public content listing
      request,
      {
        endpoint: '/api/content/public',
        itemCount: formattedContents.length,
        totalCount: total,
        page,
        limit,
        filters: { characterId, contentType },
        action: 'public_content_listed'
      },
      { severity: 'low' }
    );

    return createSecurityResponse({
      success: true,
      data: {
        items: formattedContents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      {
        endpoint: '/api/content/public',
        method: 'GET',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { severity: 'high' }
    );

    console.error("Public content fetch error:", error);
    return createSecurityError("コンテンツの取得に失敗しました", 500);
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
