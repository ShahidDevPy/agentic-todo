/**
 * Single place for Prisma / Postgres URL resolution.
 * Supports Supabase & Vercel-style names from `.env.local`.
 *
 * ## Runtime (Next.js API / PrismaClient)
 * Prefer pooled URLs — good for serverless (first match wins):
 * 1. `DATABASE_URL`
 * 2. `POSTGRES_PRISMA_URL` (Supabase pooler)
 * 3. `POSTGRES_URL_NON_POOLING`
 * 4. Composed from `POSTGRES_*` parts
 *
 * ## Migrations (`prisma migrate deploy`)
 * Use `resolveDatabaseUrlForMigrate()` — **never** the pooler (PgBouncer breaks prepared statements).
 */

/** Heuristic: Supabase pooler / transaction mode (migrations must not use this). */
export function isLikelyPoolerUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes("pooler.supabase.com") ||
    u.includes(":6543/") ||
    u.includes(":6543?") ||
    u.includes("pgbouncer=true")
  );
}

/**
 * Runtime Postgres URL (pooled OK). Used by `shared/lib/prisma.ts`.
 */
export function resolveDatabaseUrl(): string | undefined {
  const explicit = process.env.DATABASE_URL?.trim();
  if (explicit) return explicit;

  const prismaPooler = process.env.POSTGRES_PRISMA_URL?.trim();
  if (prismaPooler) return prismaPooler;

  const nonPooling = process.env.POSTGRES_URL_NON_POOLING?.trim();
  if (nonPooling) return nonPooling;

  return composeFromParts();
}

/**
 * Direct connection for `prisma migrate` / `db execute` only.
 * Supabase: copy **Session mode** or **Direct connection** (`db.xxx.supabase.co:5432`),
 * not `…pooler…:6543`.
 */
export function resolveDatabaseUrlForMigrate(): string | undefined {
  const migrateOnly = process.env.MIGRATE_DATABASE_URL?.trim();
  if (migrateOnly) return migrateOnly;

  const direct = process.env.DIRECT_URL?.trim();
  if (direct) return direct;

  const nonPooling = process.env.POSTGRES_URL_NON_POOLING?.trim();
  if (nonPooling) return nonPooling;

  const dbUrl = process.env.DATABASE_URL?.trim();
  if (dbUrl && !isLikelyPoolerUrl(dbUrl)) return dbUrl;

  const composed = composeFromParts();
  if (composed) return composed;

  return undefined;
}

export function requireDatabaseUrlForMigrate(): string {
  const url = resolveDatabaseUrlForMigrate();
  if (url) return url;

  const poolerHint =
    [process.env.DATABASE_URL, process.env.POSTGRES_PRISMA_URL]
      .map((s) => s?.trim())
      .filter(Boolean)
      .some((u) => u && isLikelyPoolerUrl(u));

  throw new Error(
    poolerHint
      ? [
          "Prisma Migrate cannot use Supabase's connection pooler (…pooler… / port 6543).",
          "It causes: prepared statement \"s1\" already exists.",
          "Add a direct URL — in Supabase: Project Settings → Database →",
          "use \"Direct connection\" or `POSTGRES_URL_NON_POOLING` from Vercel,",
          "or set MIGRATE_DATABASE_URL / DIRECT_URL to a `db.<ref>.supabase.co:5432` URI.",
        ].join(" ")
      : [
          "No direct Postgres URL for migrations.",
          "Set POSTGRES_URL_NON_POOLING, DIRECT_URL, MIGRATE_DATABASE_URL,",
          "or a non-pooler DATABASE_URL (host db.*.supabase.co port 5432).",
        ].join(" "),
  );
}

function composeFromParts(): string | undefined {
  const host = process.env.POSTGRES_HOST?.trim();
  const user = process.env.POSTGRES_USER?.trim();
  const password = process.env.POSTGRES_PASSWORD ?? "";
  const database = process.env.POSTGRES_DATABASE?.trim();
  if (!host || !user || !database) return undefined;

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${encodeURIComponent(database)}?sslmode=require`;
}

export function requireDatabaseUrl(context: string): string {
  const url = resolveDatabaseUrl();
  if (url) return url;
  throw new Error(
    [
      `Missing database URL for ${context}.`,
      "Set one of: DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING,",
      "or POSTGRES_HOST + POSTGRES_USER + POSTGRES_PASSWORD + POSTGRES_DATABASE",
      "in .env / .env.local (project root next to package.json).",
    ].join(" "),
  );
}
