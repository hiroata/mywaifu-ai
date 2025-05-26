// middleware.ts - セキュリティと認証制御
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission, Permission, Role, parseRole } from '@/lib/security/rbac';
import { isRateLimited } from '@/lib/security/api-security';
import { logSecurityEvent, SecurityEvent } from '@/lib/security/security-logger';
import { getToken } from "next-auth/jwt";

/**
 * 強化されたセキュリティヘッダーを取得
 */
function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': process.env.NODE_ENV === 'production' 
      ? 'max-age=31536000; includeSubDomains' 
      : 'max-age=0',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https: wss: ws:",
      "frame-ancestors 'none'",
      "frame-src https://accounts.google.com"
    ].join('; ')
  };
}

// CSRF保護とセキュリティヘッダーの設定
export async function middleware(request: NextRequest) {
  console.log('🔧 Middleware executed for:', request.nextUrl.pathname);
  const startTime = Date.now();
  
  // セキュリティヘッダーを適用したレスポンスを作成
  const response = NextResponse.next();
  const securityHeaders = getSecurityHeaders();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // IP情報の取得
  const ip = request.ip || 
             request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // RSCリクエストは基本的な処理のみ
  if (request.nextUrl.searchParams.has('_rsc')) {
    return response;
  }

  try {
    // グローバルレート制限チェック
    const globalRateLimitKey = `global_${Array.isArray(ip) ? ip[0] : ip}`;
    if (isRateLimited(globalRateLimitKey, 200, 60000)) { // 1分間に200リクエスト
      await logSecurityEvent(
        SecurityEvent.RATE_LIMIT_EXCEEDED,
        request,
        { type: 'global', limit: 200 },
        { severity: 'medium', blocked: true }
      );
      
      return NextResponse.json(
        { error: 'Too Many Requests', retryAfter: 60 },
        { status: 429 }
      );
    }

    // API ルートのセキュリティ処理
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return await handleApiRoute(request, response, ip);
    }

    // 管理者エンドポイントの保護
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return await handleAdminRoute(request, response);
    }    // プライベートページの認証確認
    const protectedRoutes = ['/dashboard', '/chat', '/settings', '/create-character', '/characters'];
    const isProtectedRoute = protectedRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );

    // 認証関連ページと公開ページは保護対象から除外
    const publicRoutes = [
      '/login', '/register', '/forgot-password', 
      '/api/auth', '/terms', '/privacy', '/about',
      '/', '/pricing', '/blog'
    ];
    const isPublicRoute = publicRoutes.some(route =>
      request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute && !isPublicRoute) {
      return await handleProtectedRoute(request, response);
    }

    // パフォーマンス測定
    const processingTime = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${processingTime}ms`);

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    await logSecurityEvent(
      SecurityEvent.SUSPICIOUS_REQUEST,
      request,
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { severity: 'high' }
    );

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * APIルートのセキュリティ処理
 */
async function handleApiRoute(request: NextRequest, response: NextResponse, ip: string): Promise<NextResponse> {
  // パブリックAPIエンドポイント
  const publicRoutes = [
    '/api/health', 
    '/api/auth',
    '/api/characters/public',
    '/api/content/public'
  ];
  
  const isPublic = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // APIレート制限（より厳しく）
  const apiRateLimitKey = `api_${Array.isArray(ip) ? ip[0] : ip}`;
  const limit = isPublic ? 50 : 100; // パブリックAPIはより制限的
  
  if (isRateLimited(apiRateLimitKey, limit, 60000)) {
    await logSecurityEvent(
      SecurityEvent.RATE_LIMIT_EXCEEDED,
      request,
      { type: 'api', limit, isPublic },
      { severity: 'medium', blocked: true }
    );
    
    return NextResponse.json(
      { error: 'API Rate limit exceeded', retryAfter: 60 },
      { status: 429 }
    );
  }

  // 認証が必要なAPIエンドポイントの処理
  if (!isPublic) {
    const session = await auth();
    if (!session?.user) {
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        { endpoint: request.nextUrl.pathname },
        { severity: 'medium', blocked: true }
      );
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ユーザー情報をヘッダーに追加（内部使用）
    response.headers.set('X-User-ID', session.user.id);
    response.headers.set('X-User-Role', session.user.role || 'user');
  }

  return response;
}

/**
 * 管理者エンドポイントの保護
 */
async function handleAdminRoute(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const session = await auth();
  
  if (!session?.user) {
    await logSecurityEvent(
      SecurityEvent.UNAUTHORIZED_ACCESS,
      request,
      { area: 'admin', reason: 'no_session' },
      { severity: 'high', blocked: true }
    );
    
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const userRole = parseRole(session.user.role);
  if (!hasPermission(userRole, Permission.ADMIN_ACCESS)) {
    await logSecurityEvent(
      SecurityEvent.UNAUTHORIZED_ACCESS,
      request,
      { 
        area: 'admin', 
        reason: 'insufficient_permissions',
        userRole,
        userId: session.user.id
      },
      { 
        severity: 'high', 
        blocked: true,
        userId: session.user.id
      }
    );
    
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  // 管理者アクションのログ記録
  await logSecurityEvent(
    SecurityEvent.ADMIN_ACTION,
    request,
    { 
      action: request.nextUrl.pathname,
      userRole,
      userId: session.user.id
    },
    { 
      severity: 'low',
      userId: session.user.id
    }
  );

  return response;
}

/**
 * 保護されたページの認証確認
 */
async function handleProtectedRoute(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  try {
    // 認証ループを防ぐため、認証関連パスをチェック
    const authPaths = ['/login', '/register', '/api/auth', '/forgot-password'];
    const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path));
    
    if (isAuthPath) {
      console.log('🔓 Skipping auth check for auth path:', request.nextUrl.pathname);
      return response;
    }

    const session = await auth();
    
    if (!session?.user) {
      console.log('🔒 No session found for protected route:', request.nextUrl.pathname);
      
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        request,
        { area: 'protected_page' },
        { severity: 'low', blocked: true }
      );
      
      // callbackUrl を設定してリダイレクト
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      
      console.log('🔄 Redirecting to login with callback:', loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }

    console.log('✅ Session found for protected route:', request.nextUrl.pathname, session.user.email);
    return response;
  } catch (error) {
    console.error('🚨 Error in handleProtectedRoute:', error);
    
    // エラーが発生した場合は認証なしで通す（リダイレクトループを防ぐ）
    console.log('⚠️ Auth error, allowing access without redirect');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - manifest.json (manifest file)
     * - terms (terms page)
     * - privacy (privacy page)
     * - auth/error (auth error page)
     * - / (root page, if it's public)
     * - /login, /register, /forgot-password (auth pages themselves)
     *
     * This approach is more of a blacklist for things not to match,
     * letting the middleware logic handle public/protected status.
     * However, a more common approach is to list protected routes here.
     * For this iteration, we will let the middleware logic handle it based on publicPaths array.
     */
    // "/((?!api|_next/static|_next/image|favicon.ico|images|manifest.json|terms|privacy|auth/error|login|register|forgot-password|$).*)  ",
    // A simpler matcher that covers most application routes, letting the middleware logic decide:
    "/dashboard/:path*",
    "/chat/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/settings/:path*",
    "/characters/:path*",
    "/create-character/:path*",
    // The auth routes themselves, to handle redirection if already logged in
    "/login",
    "/register",
    "/forgot-password",
  ],
};
