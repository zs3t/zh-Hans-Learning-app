// 文件路径: lib/db.ts

import { PrismaClient } from '@prisma/client';

// 声明一个全局变量来缓存 PrismaClient 实例
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 在开发环境中，使用全局变量来防止热重载时创建过多的 PrismaClient 实例
// 在生产环境中，则每次都创建一个新的实例
const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };
