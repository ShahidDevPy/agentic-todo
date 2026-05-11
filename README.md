# Agentic Todo

Next.js app for tasks, priorities, and a **daily brief**, backed by **Postgres** (Prisma) and a **GraphQL** API at `/api/graphql`.

## Requirements

- **Node.js** 20+
- **PostgreSQL** (local or hosted)

## Environment

Copy [`.env.example`](.env.example) to `.env.local` in the project root.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | App runtime database URL. |
| `DIRECT_URL` | Yes | URL for `prisma migrate` (see `prisma.config.ts`). Use the same value as `DATABASE_URL` for a single local database. |
| `GEMINI_API_KEY` | No | Optional server-side enhancement for the daily brief. |
| `GEMINI_MODEL` | No | Model id when using the optional brief enhancement (see `.env.example`). |
| `GEMINI_BRIEF_CACHE_SECONDS` | No | Brief response cache TTL in seconds (default in code: 300). |

Optional **Supabase** session refresh: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or publishable key variants). See `proxy.ts`.

Restart the dev server after changing env files.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run build:vercel` | `prisma migrate deploy` then `next build` |
| `npm run lint` | ESLint |
| `npm run test:gemini` | Smoke-test optional brief API (needs network + `GEMINI_API_KEY`) |

## Project layout (high level)

- `app/` — App Router pages and `api/graphql`
- `components/todo/` — Task UI and daily brief
- `modules/todo/` — GraphQL resolvers, agents, types
- `prisma/` — Schema and migrations
- `shared/lib/prisma.ts` — Prisma client

## Links

- [Next.js documentation](https://nextjs.org/docs)
- [Prisma documentation](https://www.prisma.io/docs)
