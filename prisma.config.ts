// Loads .env then .env.local (Next-style) so CLI commands match how you configure the app locally.
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

function requireDirectUrl(): string {
  const url =
    process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (url) return url;
  throw new Error(
    [
      "Missing DIRECT_URL (or DATABASE_URL).",
      "Set DIRECT_URL for Prisma Migrate.",
      "For a single local database you can use the same value as DATABASE_URL.",
    ].join(" "),
  );
}

const databaseUrl = requireDirectUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
