This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

Copy [`.env.example`](.env.example) to `.env` and set at least **`DATABASE_URL`** for Prisma.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes (for DB) | Postgres connection string for Prisma. |
| `GEMINI_API_KEY` | No | Enables AI-written **Daily brief** summaries. Without it, the app uses a deterministic Markdown brief (same UI, no external API). |
| `GEMINI_MODEL` | No | Default: `gemini-2.5-flash-lite` (oriented toward free-tier usage). Override if you prefer another model. |
| `GEMINI_BRIEF_CACHE_SECONDS` | No | Caches successful AI briefs for this many seconds (default **300**). Same tasks + refresh = no extra Gemini call. Set `0` to disable. |

**Test the key without the app:** from the project root run `npm run test:gemini` (needs network). If that fails, fix the key or model before debugging the UI.

**Using the Google AI free tier:** Limits are strict (requests per minute/day and tokens). Space out retries, avoid hammering **Refresh** on the Daily Brief, and rely on the built-in **brief cache** (default 5 minutes) so repeat loads do not call Gemini again until tasks change. The app falls back to a local template when the API is over quota.

**HTTP 429 / “quota exceeded”:** That comes from Google, not this codebase. The client **retries** 429s a few times with backoff. If it still fails, read [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), check [AI Studio](https://aistudio.google.com/) usage, try `GEMINI_MODEL=gemini-2.5-flash-lite` or `gemini-2.0-flash`, or enable billing if free tier shows `limit: 0`.

**Next.js note:** Put secrets in **`.env.local`**. After changing env files, **restart** `npm run dev` so the GraphQL server picks up `GEMINI_API_KEY`.

**Security:** `GEMINI_*` is read only on the **server** (GraphQL resolver). Do not expose it to the browser or client bundles.

The client sends an optional **IANA timezone** (e.g. `America/New_York`) with the `dailyBrief` query so “due today” and overdue buckets match the user’s calendar.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
