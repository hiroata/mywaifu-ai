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
  // 静的エクスポート設定を削除
  // output: 'export',  // trailingSlash: true, // この設定が404エラーの原因になっている可能性があるため削除
};

module.exports = nextConfig;
