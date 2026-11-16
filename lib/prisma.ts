import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDbUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const isVercel = process.env.VERCEL === "1";
  const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");

  if (isVercel) {
    try {
      // In Vercel serverless functions, /tmp is writable
      const tmpDbPath = path.join("/tmp", "dev.db");
      if (
        !fs.existsSync(tmpDbPath) ||
        (fs.existsSync(sourceDbPath) && fs.statSync(sourceDbPath).mtimeMs > fs.statSync(tmpDbPath).mtimeMs)
      ) {
        if (fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        }
      }
      if (fs.existsSync(tmpDbPath)) {
        return `file:${tmpDbPath}`;
      }
    } catch (e) {
      console.warn("Could not copy dev.db to /tmp, falling back to source path:", e);
    }
  }

  return `file:${sourceDbPath}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDbUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
