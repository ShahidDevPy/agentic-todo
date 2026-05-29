# Agentic Todo

Full-stack task app with an AI **daily brief** and a **natural-language assistant**. Manage priorities, due dates, and ordering in one workspace — with preview-before-execute for assistant actions.

## Highlights

- **Daily brief** — summarizes open and overdue work when you open the app
- **Assistant** — add, update, complete, or refresh tasks in plain English (optional voice input)
- **Preview first** — confirms assistant actions before they run
- **Task workspace** — priorities, due dates, starring, smart vs manual sort, per-user data
- **Auth** — email sign-up/sign-in, Google OAuth, password reset (Supabase)

## Tech stack

Next.js 16 · React 19 · GraphQL (Nexus) · Apollo Client · Prisma · PostgreSQL · Supabase Auth · Gemini (optional)

## Quick start

**Requirements:** Node.js 20+, PostgreSQL, Supabase project (Email provider enabled).

### 1. Database (local)

```bash
docker compose up -d
```

Default Postgres: `postgresql://postgres:postgres@localhost:5432/postgres`

Use hosted Postgres instead if you prefer — set `DATABASE_URL` and `DIRECT_URL` accordingly.

### 2. App

```bash
cp .env.example .env.local   # fill in values (see below)
npm install
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

GraphQL sandbox (development): [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql)

### Environment

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `DATABASE_URL` | Yes | Postgres connection for the app |
| `DIRECT_URL` | Yes | Postgres connection for migrations (same as `DATABASE_URL` locally) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `GEMINI_API_KEY` | No | AI-enhanced daily brief and assistant parsing |
| `GEMINI_MODEL` | No | Gemini model id (default in `.env.example`) |

Without `GEMINI_API_KEY`, the app still runs using template-based brief and rule-based assistant fallbacks.

### Supabase setup

In **Authentication → URL configuration**:

- **Site URL:** `http://localhost:3000` (plus production URL when deployed)
- **Redirect URLs:**
  - `http://localhost:3000/auth/callback` (OAuth, email confirmation)
  - `http://localhost:3000/auth/reset-password` (password reset)

Enable **Email** under sign-in providers. For Google sign-in, enable the **Google** provider and add the same callback URL.

Restart the dev server after changing `.env.local`.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run build:vercel` | Migrate DB then build (deploy) |
| `npm run lint` | ESLint |
| `npm run check` | Lint, typecheck, and build |

## Project structure

```
app/           Routes, GraphQL API, auth callbacks
components/    UI (todo, assistant, auth)
hooks/         Client hooks
lib/           Apollo, Supabase, formatters
modules/todo/  GraphQL resolvers, daily brief, assistant logic
prisma/        Schema and migrations
proxy.ts       Session refresh and auth gate
```
