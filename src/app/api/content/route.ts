import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { saveFile, createApiError, createApiSuccess } from "@/lib/utils/index";
import { validateMediaFile, contentSchema } from "@/lib/utils/index";
import { logSecurityEvent, SecurityEvent } from "@/lib/security/security-logger";
import { processSecureSingleFile } from "@/lib/security/secure-content-api";
import { isRateLimited, createApiErrorResponse, createApiSuccessResponse } from "@/lib/security/api-security";
import { sanitizeHtml, validateInput, containsInappropriateContent } from "@/lib/content-filter";
import { hasPermission, Permission, Role } from "@/lib/security/rbac";

// コンテンツのバリデーションスキーマはsrc/lib/schemasに移動

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  try {
    // Rate limiting check
    const rateLimitResult = await checkApiRateLimit('content-upload', ip, {
      windowMs: 15 * 60 * 1000, // 15分
      maxRequests: 10 // 15分間に10回まで
    });

    if (!rateLimitResult.success) {
      await logSecurityEvent(
        SecurityEvent.RATE_LIMIT_EXCEEDED,
        request,
        {
          endpoint: '/api/content',
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
          endpoint: '/api/content',
          method: 'POST'
        },
        { severity: 'medium', blocked: true }
      );
      return createSecurityError("認証が必要です", 401);
    }

    // Content creation permission check
    if (!hasPermission(session.user.role as Role, Permission.CREATE_CONTENT)) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        {
          endpoint: '/api/content',
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
      return createSecurityError("コンテンツ作成権限がありません", 403);
    }

    // FormDataを取得
    const formData = await request.formData();

    // フォームデータから各フィールドを取得・検証
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const contentType = formData.get("contentType") as "story" | "image" | "video";
    const characterIdRaw = formData.get("characterId") as string | null;
    const customCharacterIdRaw = formData.get("customCharacterId") as string | null;
    const isPublicRaw = formData.get("isPublic") as string;
    const storyContent = formData.get("storyContent") as string | undefined;
    const tagsRaw = formData.get("tags") as string | undefined;

    // Input validation and sanitization
    const titleValidation = validateInput(title, 100);
    if (!titleValidation.isValid) {
      await logSecurityEvent(
        SecurityEvent.SUSPICIOUS_REQUEST,
        request,
        {
          field: 'title',
          error: titleValidation.error,
          input: title?.substring(0, 50)
        },
        { 
          userId: session.user.id,
          severity: 'low', 
          blocked: true 
        }
      );
      return createSecurityError(titleValidation.error || "タイトルが無効です", 400);
    }

    const descriptionValidation = validateInput(description, 500);
    if (!descriptionValidation.isValid) {
      await logSecurityEvent(
        SecurityEvent.SUSPICIOUS_REQUEST,
        request,
        {
          field: 'description',
          error: descriptionValidation.error,
          input: description?.substring(0, 50)
        },
        { 
          userId: session.user.id,
          severity: 'low', 
          blocked: true 
        }
      );
      return createSecurityError(descriptionValidation.error || "説明が無効です", 400);
    }

    // Check for inappropriate content
    if (containsInappropriateContent(title) || containsInappropriateContent(description)) {
      await logSecurityEvent(
        SecurityEvent.MALICIOUS_PROMPT_DETECTED,
        request,
        {
          contentType: 'metadata',
          title: title?.substring(0, 50),
          description: description?.substring(0, 50)
        },
        { 
          userId: session.user.id,
          severity: 'high', 
          blocked: true 
        }
      );
      return createSecurityError("不適切なコンテンツが含まれています", 400);
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeHtml(title);
    const sanitizedDescription = sanitizeHtml(description);

    // characterIdかcustomCharacterIdのどちらかは必要
    const characterId = characterIdRaw || undefined;
    const customCharacterId = customCharacterIdRaw || undefined;

    if (!characterId && !customCharacterId) {
      return createSecurityError("キャラクターIDが必要です", 400);
    }

    // isPublicをbooleanに変換
    const isPublic = isPublicRaw === "true";

    // ストーリーコンテンツの確認と検証
    if (contentType === "story") {
      if (!storyContent) {
        return createSecurityError("ストーリーコンテンツが必要です", 400);
      }

      const storyValidation = validateInput(storyContent, 10000);
      if (!storyValidation.isValid) {
        await logSecurityEvent(
          SecurityEvent.SUSPICIOUS_REQUEST,
          request,
          {
            field: 'storyContent',
            error: storyValidation.error,
            input: storyContent?.substring(0, 100)
          },
          { 
            userId: session.user.id,
            severity: 'low', 
            blocked: true 
          }
        );
        return createSecurityError(storyValidation.error || "ストーリーコンテンツが無効です", 400);
      }

      if (containsInappropriateContent(storyContent)) {
        await logSecurityEvent(
          SecurityEvent.MALICIOUS_PROMPT_DETECTED,
          request,
          {
            contentType: 'story',
            preview: storyContent?.substring(0, 100)
          },
          { 
            userId: session.user.id,
            severity: 'high', 
            blocked: true 
          }
        );
        return createSecurityError("ストーリーに不適切なコンテンツが含まれています", 400);
      }
    }

    // 画像・動画ファイルの処理
    let contentUrl = undefined;

    if (contentType === "image" || contentType === "video") {
      const contentFile = formData.get("contentFile") as File;
      if (!contentFile || contentFile.size === 0) {
        return createSecurityError(`${contentType === "image" ? "画像" : "動画"}ファイルが必要です`, 400);
      }

      try {
        // Secure file processing
        const uploadResult = await processSecureSingleFile(contentFile, {
          allowedTypes: contentType === "image" ? ["image/jpeg", "image/png", "image/webp"] : ["video/mp4", "video/webm"],
          maxSize: contentType === "image" ? 10 * 1024 * 1024 : 100 * 1024 * 1024, // 10MB for images, 100MB for videos
          scanForMalware: true,
          generateSecureName: true
        });

        if (!uploadResult.success) {
          await logSecurityEvent(
            SecurityEvent.FILE_UPLOAD_BLOCKED,
            request,
            {
              fileName: contentFile.name,
              fileSize: contentFile.size,
              contentType: contentFile.type,
              error: uploadResult.error
            },
            { 
              userId: session.user.id,
              severity: 'medium', 
              blocked: true 
            }
          );
          return createSecurityError(uploadResult.error || "ファイルアップロードに失敗しました", 400);
        }

        contentUrl = uploadResult.filePath;

        await logSecurityEvent(
          SecurityEvent.ADMIN_ACTION, // File upload success
          request,
          {
            fileName: contentFile.name,
            fileSize: contentFile.size,
            contentType: contentFile.type,
            uploadPath: uploadResult.filePath,
            action: 'file_upload_success'
          },
          { 
            userId: session.user.id,
            severity: 'low'
          }
        );

      } catch (error) {
        await logSecurityEvent(
          SecurityEvent.FILE_UPLOAD_BLOCKED,
          request,
          {
            fileName: contentFile.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          { 
            userId: session.user.id,
            severity: 'high', 
            blocked: true 
          }
        );
        return createSecurityError("ファイル処理中にエラーが発生しました", 500);
      }
    }

    // バリデーション
    const validatedData = contentSchema.parse({
      title: sanitizedTitle,
      description: sanitizedDescription,
      contentType,
      characterId,
      customCharacterId,
      isPublic,
      storyContent: storyContent ? sanitizeHtml(storyContent) : undefined,
    });

    // タグの処理
    let tags: string[] = [];
    if (tagsRaw) {
      try {
        const parsedTags = JSON.parse(tagsRaw) as string[];
        tags = parsedTags
          .map(tag => sanitizeHtml(tag))
          .filter(tag => tag.length > 0 && tag.length <= 20)
          .slice(0, 10); // 最大10個のタグ
      } catch (error) {
        return createSecurityError("タグの形式が無効です", 400);
      }
    }

    // データベースにコンテンツを保存
    const content = await database.characterContent.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        contentType: validatedData.contentType,
        characterId: validatedData.characterId,
        customCharacterId: validatedData.customCharacterId,
        contentUrl,
        storyContent: validatedData.storyContent,
        isPublic: validatedData.isPublic,
        userId: session.user.id,
        // タグの作成
        contentTags: {
          create: tags.map((tag: string) => ({
            name: tag,
          })),
        },
      },
    });

    await logSecurityEvent(
      SecurityEvent.ADMIN_ACTION, // Content creation
      request,
      {
        contentId: content.id,
        contentType: content.contentType,
        isPublic: content.isPublic,
        characterId: content.characterId,
        customCharacterId: content.customCharacterId,
        action: 'content_created'
      },
      { 
        userId: session.user.id,
        severity: 'low'
      }
    );

    return createSecurityResponse({
      success: true,
      data: content,
    });

  } catch (error) {
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      {
        endpoint: '/api/content',
        method: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { severity: 'high' }
    );

    console.error("コンテンツ作成エラー:", error);

    if (error instanceof z.ZodError) {
      return createSecurityError(error.errors[0].message, 400);
    }

    return createSecurityError("コンテンツの作成に失敗しました", 500);
  }
}

// コンテンツ一覧の取得
export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  try {
    // Rate limiting check for content listing
    const rateLimitResult = await checkApiRateLimit('content-list', ip, {
      windowMs: 60 * 1000, // 1分
      maxRequests: 100 // 1分間に100回まで
    });

    if (!rateLimitResult.success) {
      await logSecurityEvent(
        SecurityEvent.RATE_LIMIT_EXCEEDED,
        request,
        {
          endpoint: '/api/content',
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
          endpoint: '/api/content',
          method: 'GET'
        },
        { severity: 'low', blocked: true }
      );
      return createSecurityError("認証が必要です", 401);
    }

    // クエリパラメータの検証
    const searchParams = request.nextUrl.searchParams;
    const characterId = searchParams.get("characterId");
    const customCharacterId = searchParams.get("customCharacterId");
    const type = searchParams.get("type") as "story" | "image" | "video" | null;
    const pageRaw = searchParams.get("page") || "1";
    const pageSizeRaw = searchParams.get("pageSize") || "20";

    // Input validation for parameters
    const pageValidation = validateInput(pageRaw, 10);
    const pageSizeValidation = validateInput(pageSizeRaw, 10);

    if (!pageValidation.isValid || !pageSizeValidation.isValid) {
      await logSecurityEvent(
        SecurityEvent.SUSPICIOUS_REQUEST,
        request,
        {
          invalidPage: !pageValidation.isValid,
          invalidPageSize: !pageSizeValidation.isValid
        },
        { 
          userId: session.user.id,
          severity: 'low', 
          blocked: true 
        }
      );
      return createSecurityError("無効なパラメータです", 400);
    }

    const page = Math.max(1, parseInt(pageRaw));
    const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeRaw))); // 最大100件まで

    // 検索条件
    const where: any = {
      OR: [{ isPublic: true }, { userId: session.user.id }],
    };

    if (characterId) {
      const characterIdValidation = validateInput(characterId, 50);
      if (!characterIdValidation.isValid) {
        return createSecurityError("無効なキャラクターIDです", 400);
      }
      where.characterId = characterId;
    }

    if (customCharacterId) {
      const customCharacterIdValidation = validateInput(customCharacterId, 50);
      if (!customCharacterIdValidation.isValid) {
        return createSecurityError("無効なカスタムキャラクターIDです", 400);
      }
      where.customCharacterId = customCharacterId;
    }

    if (type && !['story', 'image', 'video'].includes(type)) {
      return createSecurityError("無効なコンテンツタイプです", 400);
    }

    if (type) {
      where.contentType = type;
    }

    // コンテンツの総数を取得
    const total = await database.characterContent.count({ where });

    // ページネーション
    const contents = await database.characterContent.findMany({
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
        contentTags: true,
        comments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // レスポンスデータの整形
    const items = contents.map((content) => ({
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
      commentCount: content.comments.length,
    }));

    await logSecurityEvent(
      SecurityEvent.ADMIN_ACTION, // Content listing
      request,
      {
        itemCount: items.length,
        totalCount: total,
        page,
        pageSize,
        filters: { characterId, customCharacterId, type },
        action: 'content_listed'
      },
      { 
        userId: session.user.id,
        severity: 'low'
      }
    );

    return createSecurityResponse({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      {
        endpoint: '/api/content',
        method: 'GET',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { severity: 'high' }
    );

    console.error("コンテンツ取得エラー:", error);
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
