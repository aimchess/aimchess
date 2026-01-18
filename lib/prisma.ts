// src/lib/prisma.ts
// Note: Run `npx prisma generate` after setting up the database to get proper types
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: any };

// Using 'any' type assertion as a workaround until Prisma client is generated
// This allows the code to work without TypeScript errors
// Run `npx prisma generate` to get proper type safety
export const prisma: any =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;