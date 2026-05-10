import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PoolConfig } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { requireDatabaseUrl } from "@/shared/lib/resolve-database-url";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Postgres TLS verification for `pg` / Prisma adapter.
 * - Production defaults to strict (public CAs only).
 * - Development defaults to `rejectUnauthorized: false` so corporate proxies / AV TLS
 *   inspection does not block `self-signed certificate in certificate chain`.
 * Override: POSTGRES_SSL_REJECT_UNAUTHORIZED=true (force strict in dev) or =false (relax in prod).
 */
function postgresTlsRejectUnauthorized(): boolean {
  const v = process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase();
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return process.env.NODE_ENV === "production";
}

function createPgPoolConfig(connectionString: string): PoolConfig {
  const config: PoolConfig = { connectionString };
  if (!postgresTlsRejectUnauthorized()) {
    config.ssl = { rejectUnauthorized: false };
  }
  return config;
}

function createPrismaClient(): PrismaClient {
  const connectionString = requireDatabaseUrl("PrismaClient");
  const adapter = new PrismaPg(createPgPoolConfig(connectionString));
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
