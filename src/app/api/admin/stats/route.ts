// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logSecurityEvent, SecurityEvent } from "@/lib/security/security-logger";
import { isRateLimited, createApiErrorResponse, createApiSuccessResponse } from "@/lib/security/api-security";
import { hasPermission, Permission, Role } from "@/lib/security/rbac";

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  try {
    // Rate limiting for admin endpoints (stricter)
    if (isRateLimited(`admin-stats:${ip}`, 20, 60000)) { // 20回/分
      await logSecurityEvent(
        SecurityEvent.RATE_LIMIT_EXCEEDED,
        request,
        {
          endpoint: '/api/admin/stats',
          method: 'GET'
        },
        { severity: 'medium', blocked: true }
      );
      return createApiErrorResponse({ message: 'Too many requests', status: 429 });
    }

    // 認証確認
    const session = await auth();
    if (!session || !session.user) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        {
          endpoint: '/api/admin/stats',
          method: 'GET'
        },
        { severity: 'high', blocked: true }
      );
      return createApiErrorResponse({ message: "認証が必要です", status: 401 });
    }

    // Admin権限チェック
    const userRole = session.user.role as Role;
    if (!hasPermission(userRole, Permission.ADMIN_ACCESS)) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        {
          endpoint: '/api/admin/stats',
          method: 'GET',
          requiredPermission: Permission.ADMIN_ACCESS,
          userRole
        },
        { 
          severity: 'high', 
          blocked: true,
          userId: session.user.id 
        }
      );
      return createApiErrorResponse({ message: "管理者権限が必要です", status: 403 });
    }

    // Analytics権限チェック
    if (!hasPermission(userRole, Permission.VIEW_ANALYTICS)) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        {
          endpoint: '/api/admin/stats',
          method: 'GET',
          requiredPermission: Permission.VIEW_ANALYTICS,
          userRole
        },
        { 
          severity: 'high', 
          blocked: true,
          userId: session.user.id 
        }
      );
      return createApiErrorResponse({ message: "統計閲覧権限が必要です", status: 403 });
    }

    // 統計データを取得（実際のデータベースクエリに置き換える）
    const statsData = {
      totalMessages: 1000,
      openAIMessages: 800,
      xAIMessages: 200,
      totalUsers: 50,
      premiumUsers: 20,
      ultimateUsers: 5,
      recentCharacters: [],
      recentActivity: [],
    };

    await logSecurityEvent(
      SecurityEvent.ADMIN_ACTION,
      request,
      {
        action: 'view_stats',
        endpoint: '/api/admin/stats',
        userRole
      },
      { 
        severity: 'low',
        userId: session.user.id 
      }
    );

    return createApiSuccessResponse({
      success: true,
      data: statsData,
    });

  } catch (error) {
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      {
        endpoint: '/api/admin/stats',
        method: 'GET',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { severity: 'high' }
    );

    console.error("統計API エラー:", error);
    return createApiErrorResponse({ 
      message: "統計の取得中にエラーが発生しました", 
      status: 500 
    });
  }
}
