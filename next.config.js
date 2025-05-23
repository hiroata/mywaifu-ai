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
  // 静的エクスポートに変更
  output: 'export',
  trailingSlash: true,
};

module.exports = nextConfig;
