# Agentic Todo

Full-stack task app with an AI **daily brief** and a **natural-language assistant** — priorities, due dates, and per-user task ordering in one workspace.

**Stack:** Next.js 16 · React 19 · GraphQL (Nexus) · Apollo Client · Prisma · PostgreSQL · Supabase Auth · Gemini (optional)

---

## Setup

### Requirements

- **Node.js 20+** (NVM recommended)
- **PostgreSQL** (local via Docker or hosted)
- **Supabase** project with Email auth enabled

### Install

```bash
git clone <repo-url>
cd agentic-todo
npm install
```

### Database (local)

```bash
docker compose up -d
```

Default connection: `postgresql://postgres:postgres@localhost:5432/postgres`

Set both `DATABASE_URL` and `DIRECT_URL` in `.env.local` (same value for a single local DB).

### Environment

Copy `.env.example` → `.env.local` and fill in:

| Variable                        | Required | Purpose                                     |
| ------------------------------- | -------- | ------------------------------------------- |
| `DATABASE_URL`                  | Yes      | App Postgres connection                     |
| `DIRECT_URL`                    | Yes      | Migrations connection                       |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anon key                           |
| `GEMINI_API_KEY`                | No       | AI brief + assistant (app works without it) |
| `GEMINI_MODEL`                  | No       | Model id (see `.env.example`)               |

**Supabase → Authentication → URL configuration**

- Site URL: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/reset-password`

Enable **Email** (and **Google** if using OAuth). Restart the dev server after env changes.

### Run migrations & start

```bash
npx prisma migrate deploy
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- GraphQL sandbox (dev): [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql)

Production-style local run:

```bash
npm run build
npm run start
```

---

## Onboarding

Short map of how the app fits together:

| Area                    | What it does                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Daily brief** (`/`)   | Loads a summary of open/overdue tasks; assistant input below                       |
| **My tasks** (`/tasks`) | List, filters, detail panel, manual reorder                                        |
| **GraphQL**             | All todo CRUD + brief at `/api/graphql`; user id from session, not client          |
| **Assistant**           | Natural language → intent → preview → execute (`/api/assistant` + Gemini optional) |
| **Auth**                | Supabase SSR cookies; `proxy.ts` refreshes session and gates routes                |

Without `GEMINI_API_KEY`, the brief uses templates and the assistant uses rule-based fallbacks.

---

## Project structure

```
├── .github/workflows/     CI (lint, typecheck, build on PRs)
├── app/
│   ├── (workspace)/         Daily brief (`/`) and tasks (`/tasks`)
│   ├── api/
│   │   ├── graphql/         GraphQL endpoint
│   │   └── assistant/       Assistant interpret/execute API
│   ├── auth/                Callback + reset-password routes
│   └── login/               Sign-in, forgot password
├── components/
│   ├── assistant/           Chat input, messages, previews
│   ├── auth/                Login, reset, forgot password forms
│   ├── common/              Banners, confirm dialogs, profile badge
│   ├── todo/                Task list, brief, sidebar, dialogs
│   └── ui/                  Radix + Tailwind primitives
├── hooks/                   Client hooks (`use-auth`, `use-assistant`, …)
├── lib/
│   ├── graphql/             Apollo documents
│   └── supabase/            Browser + server + proxy clients
├── modules/todo/
│   ├── graphql/             Nexus resolvers, queries, mutations
│   ├── assistant/           Intent parsing and execution
│   └── agent/               Daily brief generation
├── prisma/                  Schema and migrations
├── shared/
│   ├── messages/            UI copy (`*-copy.ts`)
│   └── lib/                 Prisma client, Gemini helper
├── generated/               Prisma client output (do not edit)
├── prisma/generated/        GraphQL schema artifacts (do not edit)
├── scripts/                 Nexus codegen, Gemini smoke test
├── proxy.ts                 Session refresh + auth gate
├── docker-compose.yml       Local Postgres
└── .env.local               Local secrets (not committed)
```

---

## Best practices

### Imports

Use the `@/` alias for project imports (maps to repo root). Avoid deep relative paths (`../../../`).

### UI copy

User-visible strings live in `shared/messages/*-copy.ts` — not inline in components.

### GraphQL

- Client operations: `lib/graphql/documents.ts`
- Resolvers: `modules/todo/graphql/` — always scope with `requireUserId(ctx)`; never accept `userId` from the client
- After schema changes: `npm run generate:nexus`
- Narrow Apollo results with `narrowTodos` / Zod in `types/todo-view.ts`

### Auth & Supabase

- Session via `@supabase/ssr` with `getAll` / `setAll` cookies (`lib/supabase/proxy-client.ts`, `server-route.ts`)
- Do not use deprecated per-cookie `get` / `set` / `remove` in proxy

### Components

- File names: `kebab-case.tsx`, named exports
- Prisma/GraphQL model: `Todo`; UI may say “task”
- Styling: Tailwind utilities + `cn()` from `@/lib/utils`; reuse `components/ui/*`

### Generated code

Do not hand-edit `generated/` or `prisma/generated/`. Regenerate via Prisma / `npm run generate:nexus`.

---

## Scripts

| Command                  | Description                        |
| ------------------------ | ---------------------------------- |
| `npm run dev`            | Development server                 |
| `npm run build`          | Production build                   |
| `npm run start`          | Run production build               |
| `npm run build:vercel`   | `prisma migrate deploy` then build |
| `npm run lint`           | ESLint (zero warnings)             |
| `npm run type-check`     | TypeScript                         |
| `npm run check`          | Lint + typecheck + build           |
| `npm run format`         | Prettier write                     |
| `npm run generate:nexus` | Regenerate GraphQL artifacts       |

---

## Before committing your code

Husky runs lint-staged on commit. Before pushing, run:

```bash
npm run format
npm run lint
npm run type-check
```

Or the full gate:

```bash
npm run check
```

Do not commit `.env.local` or secrets. Add new env vars to `.env.example` when needed.

---

## Pull requests

CI (`.github/workflows/pr-quality.yml`) runs on every PR:

- `npm run lint`
- `npm run type-check`
- `npm run build`

**Before opening a PR:** run `npm run check` locally.

**PR description:** summarize what changed and how to verify (screenshots help for UI work).

---

## Deployment

Typical path: Vercel (or similar) with hosted Postgres and Supabase.

```bash
npm run build:vercel
```

Set production env vars (`DATABASE_URL`, `DIRECT_URL`, Supabase URLs/keys, optional `GEMINI_*`) and add production URLs to Supabase redirect allowlist.
