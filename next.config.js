/** @type {import('next').NextConfig} */
const nextConfig = {

  typescript: {
    // 在构建时忽略 TypeScript 错误
    ignoreBuildErrors: false,
  },
  eslint: {
    // 在构建时忽略 ESLint 错误
    ignoreDuringBuilds: false,
  },
  // 优化图片处理
  images: {
    domains: [],
  },
  // 启用 SWC 编译器
  swcMinify: true,
  // 配置静态文件
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // 配置输出
  output: 'standalone',
  // 配置 webpack
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 处理 better-sqlite3 的 native 依赖 (已弃用，但保留配置以防需要)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Linux 兼容性：确保正确处理路径分隔符
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    return config;
  },

  // 实验性功能配置
  experimental: {
    // 确保在 Linux 环境下正确处理
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;
