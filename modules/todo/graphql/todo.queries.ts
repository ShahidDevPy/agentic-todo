import { arg, booleanArg, list, nonNull, queryField, stringArg } from "nexus";
import { TodoListFilter, TodoListOrder } from "./todo.node";

type TodoRow = {
  priority: string;
  dueDate: Date | null;
  sortOrder: number;
  createdAt: Date;
};

/** Higher priority and sooner due dates first; ties use manual order then recency. */
function sortTodosSmart<T extends TodoRow>(rows: T[]): T[] {
  const rank = (p: string) =>
    p === "high" ? 0 : p === "medium" ? 1 : 2;
  return [...rows].sort((a, b) => {
    const pr = rank(a.priority) - rank(b.priority);
    if (pr !== 0) return pr;
    const at = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
    const bt = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
    if (at !== bt) return at - bt;
    const so = a.sortOrder - b.sortOrder;
    if (so !== 0) return so;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export const todosQuery = queryField("todos", {
  type: nonNull(list(nonNull("Todo"))),
  description:
    "Tasks for a user. listOrder SMART = high priority & nearest due first; MANUAL = respects sortOrder from drag/reorder.",
  args: {
    userId: nonNull(stringArg()),
    listFilter: arg({
      type: TodoListFilter,
      description:
        "ACTIVE = incomplete only (default). COMPLETED = done only. ALL = both.",
      default: "ACTIVE",
    }),
    listOrder: arg({
      type: TodoListOrder,
      description:
        "MANUAL = database sortOrder ascending. SMART = priority, due date, then sortOrder.",
      default: "SMART",
    }),
    starredOnly: booleanArg({
      default: false,
    }),
  },
  resolve: async (_parent, { userId, listFilter, listOrder, starredOnly }, ctx) => {
    const completionClause =
      listFilter === "COMPLETED"
        ? { isCompleted: true }
        : listFilter === "ALL"
          ? {}
          : { isCompleted: false };

    let rows = await ctx.prisma.todo.findMany({
      where: {
        userId,
        ...completionClause,
        ...(starredOnly ? { starred: true } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    if (listOrder === "SMART") {
      rows = sortTodosSmart(rows);
    }

    return rows;
  },
});

export const todoQuery = queryField("todo", {
  type: "Todo",
  args: {
    id: nonNull(stringArg()),
  },
  resolve: (_parent, { id }, ctx) => ctx.prisma.todo.findUnique({ where: { id } }),
});
