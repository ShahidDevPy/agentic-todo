// Loads .env then .env.local (Next-style) so CLI commands match how you configure the app locally.
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";
import { requireDatabaseUrlForMigrate } from "./shared/lib/resolve-database-url";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

/** Direct DB only — never the Supabase pooler (see `requireDatabaseUrlForMigrate`). */
const databaseUrl = requireDatabaseUrlForMigrate();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
