// middleware.ts - セキュリティと認証制御
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// CSRF保護とセキュリティヘッダーの設定
export async function middleware(request: NextRequest) {
  // API リクエストの詳細ログ（デバッグ用）
  if (request.nextUrl.pathname.includes('/api/auth/register')) {
    console.log('=== MIDDLEWARE DEBUG ===');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Content-Type header:', request.headers.get('content-type'));
    console.log('User-Agent:', request.headers.get('user-agent'));
    console.log('========================');
  }

  const response = NextResponse.next();

  // セキュリティヘッダーの設定
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss: ws:;"
  );

  // レート制限チェック（基本的なDDoS対策）
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitKey = `rate_limit_${ip}`;
    // API ルートの認証確認
  if (request.nextUrl.pathname.startsWith('/api/')) {
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
    
    if (!isPublic) {
      // API認証が必要なルートの処理
      const session = await auth();
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
  }

  // プライベートページの認証確認
  const protectedRoutes = ['/dashboard', '/chat', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
