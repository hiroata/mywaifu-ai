import { NextRequest, NextResponse } from "next/server";
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
    }    const { searchParams } = new URL(request.url);
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

    // コンテンツ機能は現在無効化されています
    await logSecurityEvent(
      SecurityEvent.ADMIN_ACTION,
      request,
      {
        endpoint: '/api/content/public',
        action: 'content_feature_disabled',
        characterId,
        contentType
      },
      { severity: 'low' }
    );

    return createSecurityResponse({
      success: true,
      data: {
        items: [],
        pagination: {
          page: parseInt(pageRaw),
          limit: parseInt(limitRaw),
          total: 0,
          totalPages: 0,
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
