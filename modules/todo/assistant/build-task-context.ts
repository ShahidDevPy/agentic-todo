import type { PrismaClient } from "@/generated/prisma/client";
import type { AssistantTaskContextItem } from "@/modules/todo/assistant/intent.schema";

const MAX_TASKS_IN_CONTEXT = 40;

export async function buildTaskContextForAssistant(
  prisma: PrismaClient,
  userId: string,
): Promise<AssistantTaskContextItem[]> {
  const rows = await prisma.todo.findMany({
    where: { userId, isCompleted: false },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: MAX_TASKS_IN_CONTEXT,
    select: {
      id: true,
      title: true,
      priority: true,
      starred: true,
      isCompleted: true,
      dueDate: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    priority: r.priority as AssistantTaskContextItem["priority"],
    starred: r.starred,
    isCompleted: r.isCompleted,
    dueDateISO: r.dueDate ? r.dueDate.toISOString() : null,
  }));
}
