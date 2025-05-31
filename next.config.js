/** @type {import('next').NextConfig} */
const nextConfig = {  // プロダクション向け設定
  typescript: {
    ignoreBuildErrors: false, // 型エラーは常にチェック
  },
  eslint: {
    ignoreDuringBuilds: true, // ESLint警告は無視してビルド続行
  },
  swcMinify: true,  images: {
    unoptimized: false, // Vercelでは画像最適化を有効に
    domains: ['localhost', 'your-domain.vercel.app'], // Vercelドメインに更新
  },
  // パフォーマンス最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },  // Vercel最適化設定
  experimental: {
    // データベースは使用しないため、外部パッケージ設定も不要
  },
  // Standalone出力（Docker用）
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  // セキュリティヘッダー設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },          {
            key: 'Strict-Transport-Security',
            value: process.env.NODE_ENV === 'production' 
              ? 'max-age=31536000; includeSubDomains; preload' 
              : 'max-age=0',
          },          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production' ? [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://accounts.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https: wss:",
              "frame-ancestors 'none'",
              "frame-src https://accounts.google.com",
              "form-action 'self' https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "upgrade-insecure-requests"
            ].join('; ') : [
              // 開発環境ではより緩和されたCSP
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://accounts.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https: wss: ws: localhost:*",
              "frame-ancestors 'none'",
              "frame-src 'self' https://accounts.google.com",
              "form-action 'self' https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; ')
          }
        ],
      },
    ];
  },
  // 静的エクスポート設定を削除
  // output: 'export',  // trailingSlash: true, // この設定が404エラーの原因になっている可能性があるため削除
};

module.exports = nextConfig;
