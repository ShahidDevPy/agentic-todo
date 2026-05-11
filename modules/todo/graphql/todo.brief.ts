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
        "True when summaryMarkdown used optional server-side enhancement instead of the built-in template alone.",
    });
  },
});

export const dailyBriefQuery = queryField("dailyBrief", {
  type: nonNull("DailyBrief"),
  description:
    "Daily task summary as Markdown; may use optional server-side enhancement when available, otherwise the built-in template.",
  args: {
    userId: nonNull(stringArg()),
    deterministicOnly: booleanArg({
      description:
        "If true, use only the built-in Markdown template (no optional enhancement).",
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
