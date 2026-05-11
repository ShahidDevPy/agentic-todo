import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function requireDatabaseUrl(context: string): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;
  throw new Error(`Missing DATABASE_URL for ${context}.`);
}

function createPrismaClient(): PrismaClient {
  const connectionString = requireDatabaseUrl("PrismaClient");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
