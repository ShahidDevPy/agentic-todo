import path from "path";
import { enumType, objectType } from "nexus";

export const TodoPriority = enumType({
  name: "TodoPriority",
  members: ["low", "medium", "high"],
});

export const TodoListFilter = enumType({
  name: "TodoListFilter",
  members: ["ACTIVE", "COMPLETED", "ALL"],
});

export const TodoListOrder = enumType({
  name: "TodoListOrder",
  members: ["MANUAL", "SMART"],
});

export const Todo = objectType({
  name: "Todo",
  sourceType: {
    module: path.join(process.cwd(), "generated/prisma/client.ts"),
    export: "Todo",
  },
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("title");
    t.nullable.string("description");
    t.nonNull.boolean("starred");
    t.nonNull.boolean("isCompleted");
    t.nullable.string("completedAt", {
      resolve: (parent) => parent.completedAt?.toISOString() ?? null,
    });
    t.nullable.string("dueDate", {
      resolve: (parent) => parent.dueDate?.toISOString() ?? null,
    });
    t.nonNull.field("priority", { type: TodoPriority });
    t.nonNull.int("sortOrder");
    t.nonNull.string("userId");
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent) => parent.updatedAt.toISOString(),
    });
  },
});
