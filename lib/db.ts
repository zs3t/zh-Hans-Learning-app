// 文件路径: lib/db.ts

import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// 在实例化之前打印环境变量，确保它被正确读取
console.log("-----------------------------------------");
console.log("LIB_DB: process.env.DATABASE_URL =", process.env.DATABASE_URL);
console.log("-----------------------------------------");

export const prisma = globalThis.prisma || new PrismaClient({
  // 可以添加日志级别的配置，以获取更详细信息（可选，如果问题持续）
  // log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  // 打印 Prisma 客户端实际解析的数据库 URL，这是最准确的（注意：_l 是内部属性，用于调试）
  try {
    const resolvedDbUrl = (prisma as any)._l?.url; // 访问内部的连接URL
    if (!!resolvedDbUrl) {
      console.log("-----------------------------------------");
      console.log("LIB_DB: Prisma Resolved Database URL =", resolvedDbUrl);
      console.log("-----------------------------------------");
    } else {
      console.warn("LIB_DB: Could not retrieve Prisma's resolved database URL.");
    }
  } catch (e) {
    console.error("LIB_DB: Error getting Prisma resolved URL:", e);
  }
  globalThis.prisma = prisma;
}
