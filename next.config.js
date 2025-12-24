/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 永久跳过构建时的 TypeScript 类型检查
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. 永久跳过构建时的 ESLint 规范检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // 保持你原来的配置
  },
  // 如果有其他配置可以继续往下加
};

module.exports = nextConfig;