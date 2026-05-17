import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { AssistantIntent } from "@/modules/todo/assistant/intent.schema";
import { generateDailyBrief } from "@/modules/todo/agent/generateDailyBrief";

export type AssistantExecuteResult = {
  message: string;
  summaryMarkdown?: string;
  taskTitle?: string;
};

async function assertTodoOwned(
  prisma: PrismaClient,
  userId: string,
  taskId: string,
) {
  const row = await prisma.todo.findUnique({
    where: { id: taskId },
    select: { id: true, userId: true, title: true, isCompleted: true },
  });
  if (!row || row.userId !== userId) {
    throw new Error("Task not found");
  }
  return row;
}

export async function executeAssistantIntent(
  prisma: PrismaClient,
  userId: string,
  intent: AssistantIntent,
  timeZone: string,
): Promise<AssistantExecuteResult> {
  switch (intent.action) {
    case "clarify":
      return { message: intent.message };

    case "create": {
      const trimmedTitle = intent.title.trim();
      if (!trimmedTitle) throw new Error("Title is required");

      let dueDate: Date | undefined;
      if (intent.dueDateISO) {
        const d = new Date(intent.dueDateISO);
        if (Number.isNaN(d.getTime())) throw new Error("Invalid due date");
        dueDate = d;
      }

      const created = await prisma.$transaction(async (tx) => {
        await tx.todo.updateMany({
          where: { userId },
          data: { sortOrder: { increment: 1 } },
        });
        return tx.todo.create({
          data: {
            title: trimmedTitle,
            userId,
            description: intent.description?.trim() || null,
            priority: intent.priority ?? "medium",
            isCompleted: false,
            starred: intent.starred ?? false,
            completedAt: null,
            sortOrder: 0,
            ...(dueDate ? { dueDate } : {}),
          },
        });
      });

      return {
        message: `Added “${created.title}”.`,
        taskTitle: created.title,
      };
    }

    case "update": {
      const existing = await assertTodoOwned(prisma, userId, intent.taskId);
      const data: Prisma.TodoUpdateInput = {};

      if (intent.title != null) {
        const t = intent.title.trim();
        if (!t) throw new Error("Title cannot be empty");
        data.title = t;
      }
      if ("description" in intent) {
        data.description =
          typeof intent.description === "string"
            ? intent.description.trim() || null
            : null;
      }
      if (intent.priority != null) data.priority = intent.priority;
      if (typeof intent.starred === "boolean") data.starred = intent.starred;
      if (typeof intent.isCompleted === "boolean") {
        data.isCompleted = intent.isCompleted;
        data.completedAt = intent.isCompleted ? new Date() : null;
      }
      if ("dueDateISO" in intent) {
        if (intent.dueDateISO == null || intent.dueDateISO === "") {
          data.dueDate = null;
        } else {
          const d = new Date(intent.dueDateISO);
          if (Number.isNaN(d.getTime())) throw new Error("Invalid due date");
          data.dueDate = d;
        }
      }

      const updated = await prisma.todo.update({
        where: { id: intent.taskId },
        data,
      });
      return {
        message: `Updated “${updated.title}”.`,
        taskTitle: updated.title,
      };
    }

    case "toggle": {
      const existing = await assertTodoOwned(prisma, userId, intent.taskId);
      const next = !existing.isCompleted;
      const updated = await prisma.todo.update({
        where: { id: intent.taskId },
        data: {
          isCompleted: next,
          completedAt: next ? new Date() : null,
        },
      });
      return {
        message: next
          ? `Marked “${updated.title}” complete.`
          : `Marked “${updated.title}” incomplete.`,
        taskTitle: updated.title,
      };
    }

    case "delete": {
      const existing = await assertTodoOwned(prisma, userId, intent.taskId);
      await prisma.todo.deleteMany({
        where: { id: intent.taskId, userId },
      });
      return {
        message: `Deleted “${existing.title}”.`,
        taskTitle: existing.title,
      };
    }

    case "summarize": {
      if (intent.style === "list") {
        const open = await prisma.todo.findMany({
          where: { userId, isCompleted: false },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          take: 30,
          select: { title: true, priority: true, dueDate: true },
        });
        if (open.length === 0) {
          return { message: "You have no open tasks." };
        }
        const lines = open.map((t, i) => {
          const due = t.dueDate
            ? ` (due ${t.dueDate.toISOString().slice(0, 10)})`
            : "";
          return `${i + 1}. **${t.title}** — ${t.priority}${due}`;
        });
        return {
          message: `You have ${open.length} open task${open.length === 1 ? "" : "s"}:`,
          summaryMarkdown: lines.join("\n"),
        };
      }

      const brief = await generateDailyBrief(prisma, userId, {
        timeZone,
        deterministicOnly: false,
      });
      return {
        message: `Here’s your brief (${brief.pendingCount} open, ${brief.overdueCount} overdue).`,
        summaryMarkdown: brief.summaryMarkdown,
      };
    }

    default: {
      const _exhaustive: never = intent;
      return _exhaustive;
    }
  }
}
