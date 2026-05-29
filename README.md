# Agentic Todo APP

Next.js app for tasks, priorities, and a **daily brief**, backed by **Postgres** (Prisma), **GraphQL** at `/api/graphql`, and **Supabase Auth** (email + password).

## Requirements

- **Node.js** 20+
- **PostgreSQL** (local or hosted)
- **Supabase** project (Authentication → Email provider enabled)

## Environment

Copy [`.env.example`](.env.example) to `.env.local` in the project root.

| Variable                        | Required | Purpose                                                                                                              |
| ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                  | Yes      | App runtime database URL.                                                                                            |
| `DIRECT_URL`                    | Yes      | URL for `prisma migrate` (see `prisma.config.ts`). Use the same value as `DATABASE_URL` for a single local database. |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL (Auth + session cookies).                                                                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anon (public) API key.                                                                                      |
| `GEMINI_API_KEY`                | No       | Optional server-side enhancement for the daily brief.                                                                |
| `GEMINI_MODEL`                  | No       | Model id when using the optional brief enhancement (see `.env.example`).                                             |
| `GEMINI_BRIEF_CACHE_SECONDS`    | No       | Brief response cache TTL in seconds (default in code: 300).                                                          |

In the **Supabase dashboard**: Authentication → **URL configuration** — set **Site URL** to `http://localhost:3000` (and your production URL when deployed). Add **Redirect URLs** including:

- `http://localhost:3000/auth/callback` (email confirmation, Google OAuth)
- `http://localhost:3000/auth/reset-password` (password reset email link)
- Production equivalents when deployed

Restart the dev server after changing env files.

## Auth behavior

- `proxy.ts` refreshes the Supabase session and sends unauthenticated visitors to `/login` (except `/login`, `/auth/*`, and `/api/*`).
- GraphQL resolvers use the **signed-in user’s id** from the session (`ctx.userId`). The client no longer passes `userId` on queries or mutations, so users only read and write **their own** todos.

### Password reset

| Route                    | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `/login/forgot-password` | Request a reset email                            |
| `/auth/reset-password`   | Set a new password after clicking the email link |

Add **`http://localhost:3000/auth/reset-password`** to Supabase **Redirect URLs** (plus production URL). Use **Forgot password?** on the sign-in form.

## Scripts

| Command                  | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `npm run dev`            | Development server                                               |
| `npm run build`          | Production build                                                 |
| `npm run build:vercel`   | `prisma migrate deploy` then `next build`                        |
| `npm run lint`           | ESLint                                                           |
| `npm run generate:nexus` | Regenerate `prisma/generated/*` after GraphQL schema changes     |
| `npm run test:gemini`    | Smoke-test optional brief API (needs network + `GEMINI_API_KEY`) |

## Project layout (high level)

- `app/` — App Router pages, `api/graphql`, `auth/callback`, `login`
- `components/todo/` — Task UI and daily brief
- `components/auth/` — Sign-in / sign-up form
- `modules/todo/` — GraphQL resolvers, agents, types
- `prisma/` — Schema and migrations
- `shared/lib/prisma.ts` — Prisma client
- `proxy.ts` — Session refresh + auth gate for pages

## Links

- [Next.js documentation](https://nextjs.org/docs)
- [Prisma documentation](https://www.prisma.io/docs)
- [Supabase Auth (Next.js)](https://supabase.com/docs/guides/auth/server-side/nextjs)

## Code conventions

| Area              | Convention                                        | Examples                                                                    |
| ----------------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| React components  | `kebab-case.tsx`, named exports                   | `task-create-dialog.tsx`, `daily-brief-panel.tsx`                           |
| Hooks             | `use-*.ts`                                        | `use-assistant.ts`, `use-app-mutation.ts`                                   |
| Domain / server   | `modules/todo/`                                   | `graphql/todo.mutations.ts`, `assistant/interpret-command.ts`               |
| User-facing copy  | `shared/messages/*-copy.ts`                       | `ui-copy.ts` (labels), `error-copy.ts` (errors), `status-copy.ts` (success) |
| Client GraphQL    | `lib/graphql/documents.ts`                        | Apollo operations (queries/mutations)                                       |
| Data layer naming | Prisma/GraphQL use `Todo`; UI copy may say “task” | `Todo` type, “My tasks” nav label                                           |

### Folder layout

- `app/` — routes, API handlers, auth callback
- `components/` — React UI (`todo/`, `assistant/`, `common/`, `ui/`)
- `hooks/` — client hooks
- `lib/` — client infrastructure (Apollo, Supabase, formatters)
- `modules/todo/` — server domain (GraphQL, agents, assistant)
- `shared/` — isomorphic helpers and messages
- `types/` — shared TypeScript types for the client
- `generated/` / `prisma/generated/` — generated artifacts (do not hand-edit)
