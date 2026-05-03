// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import path from 'path';

// 1. Calculate the absolute path to your database on your G: drive
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 2. Inject the absolute path directly, bypassing the .env file
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;