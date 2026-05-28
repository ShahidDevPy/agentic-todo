import type { PrismaClient } from "@/generated/prisma/client";
import { classifyDue, type DueBucket } from "@/lib/brief/daily-brief-buckets";
import { generateGeminiText } from "@/shared/lib/gemini";

const briefResultCache = new Map<
  string,
  { storedAt: number; payload: DailyBriefPayload }
>();

function briefCacheTtlMs(): number {
  const sec = parseInt(process.env.GEMINI_BRIEF_CACHE_SECONDS ?? "300", 10);
  if (!Number.isFinite(sec) || sec <= 0) return 0;
  return Math.min(sec, 3600) * 1000;
}

function todoFingerprint(rows: Array<{ id: string; updatedAt: Date }>): string {
  return [...rows]
    .map((r) => `${r.id}:${r.updatedAt.getTime()}`)
    .sort()
    .join("|");
}

function briefCacheGet(key: string): DailyBriefPayload | null {
  const ttl = briefCacheTtlMs();
  if (ttl <= 0) return null;
  const e = briefResultCache.get(key);
  if (!e) return null;
  if (Date.now() - e.storedAt > ttl) {
    briefResultCache.delete(key);
    return null;
  }
  return e.payload;
}

function briefCacheSet(key: string, payload: DailyBriefPayload) {
  const ttl = briefCacheTtlMs();
  if (ttl <= 0 || !payload.usedGemini) return;
  briefResultCache.set(key, { storedAt: Date.now(), payload });
  while (briefResultCache.size > 200) {
    const k = briefResultCache.keys().next().value;
    if (k !== undefined) briefResultCache.delete(k);
  }
}

function dailyBriefCacheKey(
  userId: string,
  timeZone: string,
  rows: Array<{ id: string; updatedAt: Date }>,
): string {
  return [userId, timeZone, todoFingerprint(rows)].join("\u0000");
}

export type DailyBriefPayload = {
  summaryMarkdown: string;
  pendingCount: number;
  overdueCount: number;
  usedGemini: boolean;
};

export type TodoBriefPayloadLite = {
  title: string;
  description: string | null;
  priority: string;
  dueDate: Date | null;
  starred: boolean;
};

const MAX_DETAIL_IN_PROMPT = 400;

function truncateDetail(s: string, max = MAX_DETAIL_IN_PROMPT): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function formatDue(d: Date): string {
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
}

function sortForDisplay(
  a: TodoBriefPayloadLite,
  b: TodoBriefPayloadLite,
): number {
  const ad = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
  const bd = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
  if (ad !== bd) return ad - bd;
  if (a.starred !== b.starred) return a.starred ? -1 : 1;
  const pr = (p: string) => (p === "high" ? 0 : p === "medium" ? 1 : 2);
  return pr(a.priority) - pr(b.priority);
}

function bucketTasks(
  rows: TodoBriefPayloadLite[],
  now: Date,
  timeZone: string,
): Map<DueBucket, TodoBriefPayloadLite[]> {
  const map = new Map<DueBucket, TodoBriefPayloadLite[]>();
  const keys: DueBucket[] = ["overdue", "today", "thisWeek", "later", "noDue"];
  for (const k of keys) map.set(k, []);

  for (const r of rows) {
    const b = classifyDue(r.dueDate, now, timeZone);
    map.get(b)!.push(r);
  }

  for (const k of keys) {
    map.get(k)!.sort(sortForDisplay);
  }

  return map;
}

function formatTaskLine(r: TodoBriefPayloadLite): string {
  const due = r.dueDate ? ` • due _${formatDue(r.dueDate)}_` : "";
  const star = r.starred ? "**(starred)** " : "";
  let line = `- ${star}**${r.title}**${due} (${r.priority})`;
  const d = r.description?.trim();
  if (d) {
    line += `\n  - _Details:_ ${truncateDetail(d, 220)}`;
  }
  return line;
}

function sectionsFromBuckets(
  buckets: Map<DueBucket, TodoBriefPayloadLite[]>,
): string {
  const parts: string[] = [];
  const push = (title: string, key: DueBucket) => {
    const list = buckets.get(key);
    if (!list?.length) return;
    const lines = list.map(formatTaskLine);
    parts.push(`## ${title}\n${lines.join("\n")}`);
  };

  push("Overdue", "overdue");
  push("Due today", "today");
  push("This week", "thisWeek");
  push("Later", "later");
  push("No due date", "noDue");

  return parts.join("\n\n");
}

export function deterministicDailyBrief(
  rows: TodoBriefPayloadLite[],
  now: Date,
  timeZone: string,
): string {
  if (rows.length === 0) {
    return "**All clear**\nNo open tasks — add one when you’re ready.";
  }

  const buckets = bucketTasks(rows, now, timeZone);
  const overdue = buckets.get("overdue")!.length;
  const high = rows.filter((r) => r.priority === "high").length;

  let intro = `# Your day at a glance\nYou have **${rows.length}** open task${rows.length === 1 ? "" : "s"}.`;
  if (overdue > 0) {
    intro += `\n_${overdue} overdue — tackle or reschedule when you can._`;
  }
  if (high > 0) {
    intro += `\n_${high} marked high priority._`;
  }

  const body = sectionsFromBuckets(buckets);
  return `${intro}\n\n${body}\n\n_Pick the smallest useful step — ship it._`;
}

function buildBucketedTaskList(
  buckets: Map<DueBucket, TodoBriefPayloadLite[]>,
): string {
  const lines: string[] = [];
  const label: Record<DueBucket, string> = {
    overdue: "OVERDUE",
    today: "DUE_TODAY",
    thisWeek: "THIS_WEEK",
    later: "LATER",
    noDue: "NO_DUE_DATE",
  };
  const order: DueBucket[] = ["overdue", "today", "thisWeek", "later", "noDue"];

  for (const key of order) {
    const list = buckets.get(key)!;
    for (const r of list) {
      const due = r.dueDate ? ` due=${formatDue(r.dueDate)}` : "";
      const star = r.starred ? "starred=yes " : "";
      const titleLine = `- [${label[key]}] [${r.priority}] ${star}${r.title}${due}`;
      const detail = r.description?.trim();
      if (detail) {
        lines.push(
          `${titleLine}\n  Details: ${truncateDetail(detail).replace(/\n/g, " ")}`,
        );
      } else {
        lines.push(titleLine);
      }
    }
  }

  if (lines.length === 0) {
    return "(no open tasks)";
  }
  return lines.join("\n");
}

function buildAiPrompt(
  rows: TodoBriefPayloadLite[],
  now: Date,
  timeZone: string,
): string {
  const buckets = bucketTasks(rows, now, timeZone);
  const bucketed = buildBucketedTaskList(buckets);

  const overdueN = buckets.get("overdue")!.length;
  const todayN = buckets.get("today")!.length;

  return `You are part of an agentic task app. Produce a SHORT daily brief in GitHub-flavored Markdown for someone planning their day.

Context:
- Viewer timezone for "today": ${timeZone}
- Open tasks: ${rows.length} (${overdueN} overdue in that timezone, ${todayN} due today).

Rules:
- Start with a clear "## What matters most today" section: 1–3 bullets on what to focus on first (prioritize overdue, high, starred, due today).
- Then optional short sections only if non-empty: "## Overdue", "## Today", "## This week" — use brief bullets, not every task.
- Cap total bullets across the whole brief at 12; quality over quantity.
- For each task you mention, reflect both **title** and **Details** when a Details line exists — weave details into the sentence (do not dump raw dumps).
- Tone: upbeat, pragmatic, professional (brief, not cheesy).
- Strictly **plain Markdown only**: headings, bullets, bold, italics. **Do not** use emojis, emoticons, symbols used as icons, or decorative Unicode (no smiles, stars, checkmarks-as-icons).
- If there are zero tasks, say so positively and invite adding one realistic task.
- Do not invent tasks not listed below.

Tasks (group tags reflect calendar buckets in ${timeZone}; indented "Details:" is task notes):\n${bucketed}`;
}

export type BriefOptions = {
  deterministicOnly?: boolean;
  timeZone?: string | null;
};

export async function generateDailyBrief(
  prisma: PrismaClient,
  userId: string,
  options?: BriefOptions,
): Promise<DailyBriefPayload> {
  const now = new Date();
  const timeZone =
    options?.timeZone?.trim() && options.timeZone.trim().length > 0
      ? options.timeZone.trim()
      : "UTC";

  const pendingTodos = await prisma.todo.findMany({
    where: { userId, isCompleted: false },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      updatedAt: true,
      title: true,
      description: true,
      priority: true,
      dueDate: true,
      starred: true,
    },
  });

  if (pendingTodos.length === 0) {
    return {
      summaryMarkdown: deterministicDailyBrief([], now, timeZone),
      pendingCount: 0,
      overdueCount: 0,
      usedGemini: false,
    };
  }

  const buckets = bucketTasks(pendingTodos, now, timeZone);
  const overdueCount = buckets.get("overdue")!.length;

  const wantsAi =
    options?.deterministicOnly !== true && !!process.env.GEMINI_API_KEY?.trim();

  if (wantsAi) {
    const cached = briefCacheGet(
      dailyBriefCacheKey(userId, timeZone, pendingTodos),
    );
    if (cached) {
      return cached;
    }
  }

  let summaryMarkdown = "";
  let usedGemini = false;

  const fallback = () => deterministicDailyBrief(pendingTodos, now, timeZone);

  try {
    if (wantsAi) {
      const ai = await generateGeminiText(
        buildAiPrompt(pendingTodos, now, timeZone),
      );
      if (ai && ai.length) {
        summaryMarkdown = ai;
        usedGemini = true;
      } else {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[DailyBrief] Gemini returned empty text; using template. Run: npx tsx scripts/test-gemini.ts",
          );
        }
        summaryMarkdown = fallback();
      }
    } else {
      summaryMarkdown = fallback();
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[DailyBrief] Gemini request failed:", err);
    }
    summaryMarkdown = fallback();
  }

  const payload: DailyBriefPayload = {
    summaryMarkdown,
    pendingCount: pendingTodos.length,
    overdueCount,
    usedGemini,
  };

  if (wantsAi) {
    briefCacheSet(dailyBriefCacheKey(userId, timeZone, pendingTodos), payload);
  }

  return payload;
}
