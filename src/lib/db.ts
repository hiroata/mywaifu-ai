// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// データベース接続の設定と検証
console.log('データベース設定:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('Environment:', process.env.NODE_ENV);

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });

// データベース接続を確認
if (process.env.NODE_ENV === "production") {
  db.$connect()
    .then(() => {
      console.log('データベース接続成功');
    })
    .catch((error) => {
      console.error('データベース接続失敗:', error);
    });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// API routes での互換性のために prisma も export
export const prisma = db;
