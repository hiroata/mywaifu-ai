/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  // 本番環境向けに静的エクスポートを設定
  output: 'standalone',
};

module.exports = nextConfig;
