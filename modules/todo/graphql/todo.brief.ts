import { booleanArg, nonNull, objectType, queryField, stringArg } from "nexus";
import { generateDailyBrief } from "@/modules/todo/agent/generateDailyBrief";

export const DailyBrief = objectType({
  name: "DailyBrief",
  definition(t) {
    t.nonNull.string("summaryMarkdown");
    t.nonNull.int("pendingCount");
    t.nonNull.int("overdueCount");
    t.nonNull.boolean("usedGemini", {
      description:
        "True when summaryMarkdown was produced by the Gemini API (not the local template fallback).",
    });
  },
});

export const dailyBriefQuery = queryField("dailyBrief", {
  type: nonNull("DailyBrief"),
  description:
    "LLM-enhanced motivational brief when GEMINI_MODEL + GEMINI_API_KEY are configured; falls back to a deterministic Markdown summary.",
  args: {
    userId: nonNull(stringArg()),
    deterministicOnly: booleanArg({
      description:
        "If true, skip the LLM and use only the deterministic template.",
      default: false,
    }),
    timeZone: stringArg({
      description:
        "IANA timezone for due-today / overdue bucketing (e.g. America/New_York). Omit or invalid → UTC.",
    }),
  },
  resolve: (_parent, { userId, deterministicOnly, timeZone }, ctx) =>
    generateDailyBrief(ctx.prisma, userId, {
      deterministicOnly: deterministicOnly ?? false,
      timeZone: timeZone ?? null,
    }),
});
