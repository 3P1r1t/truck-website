import { PrismaClient } from '@prisma/client'
import { EnvValidationError, getRequiredEnvMap } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

try {
  getRequiredEnvMap(["DATABASE_URL"], "Prisma database connection");
} catch (error) {
  if (error instanceof EnvValidationError) {
    throw new Error(`${error.message}. Set it in Vercel Project Settings -> Environment Variables.`);
  }
  throw error;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
