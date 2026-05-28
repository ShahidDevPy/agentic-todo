import { GraphQLError } from "graphql";
import type { Prisma } from "@/generated/prisma/client";
import {
  arg,
  booleanArg,
  list,
  mutationField,
  nonNull,
  nullable,
  stringArg,
} from "nexus";
import { TodoPriority } from "./todo.node";
import { requireUserId } from "@/shared/graphql/require-auth";

export const createTodoMutation = mutationField("createTodo", {
  type: nonNull("Todo"),
  args: {
    title: nonNull(stringArg()),
    description: nullable(stringArg()),
    dueDateISO: nullable(stringArg()),
    priority: arg({ type: TodoPriority }),
    starred: booleanArg({ default: false }),
  },
  resolve: async (
    _parent,
    { title, description, dueDateISO, priority, starred },
    ctx,
  ) => {
    const userId = requireUserId(ctx);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      throw new GraphQLError("Title is required", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    const parseDueOptional = (): Date | null | undefined => {
      if (dueDateISO === undefined) return undefined;
      if (dueDateISO === null || dueDateISO.trim() === "") return null;
      const d = new Date(dueDateISO);
      if (Number.isNaN(d.getTime())) {
        throw new GraphQLError("Invalid dueDateISO", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      return d;
    };
    const dueDate = parseDueOptional();

    return ctx.prisma.$transaction(async (tx) => {
      await tx.todo.updateMany({
        where: { userId },
        data: { sortOrder: { increment: 1 } },
      });

      return tx.todo.create({
        data: {
          title: trimmedTitle,
          userId,
          ...(description !== undefined
            ? {
                description:
                  description === null
                    ? null
                    : typeof description === "string"
                      ? description.trim() || null
                      : null,
              }
            : {}),
          priority: priority ?? "medium",
          isCompleted: false,
          starred: starred ?? false,
          completedAt: null,
          sortOrder: 0,
          ...(dueDate !== undefined ? { dueDate } : {}),
        },
      });
    });
  },
});

export const updateTodoMutation = mutationField("updateTodo", {
  type: nonNull("Todo"),
  description:
    "Partial update. Omit a field to leave it unchanged. Pass nullable fields as null on the wire to clear (title cannot be cleared).",
  args: {
    id: nonNull(stringArg()),
    title: nullable(stringArg()),
    description: nullable(stringArg()),
    priority: nullable(arg({ type: TodoPriority })),
    starred: nullable(booleanArg()),
    isCompleted: nullable(booleanArg()),
    dueDateISO: nullable(stringArg()),
  },
  resolve: async (_parent, args, ctx) => {
    const userId = requireUserId(ctx);
    const existing = await ctx.prisma.todo.findUnique({ where: { id: args.id } });
    if (!existing || existing.userId !== userId) {
      throw new GraphQLError("Todo not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    const data: Prisma.TodoUpdateInput = {};

    if (args.title != null) {
      const trimmed = args.title.trim();
      if (!trimmed) {
        throw new GraphQLError("Title cannot be empty", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      data.title = trimmed;
    }

    if ("description" in args) {
      data.description =
        typeof args.description === "string"
          ? args.description.trim() || null
          : null;
    }

    if (args.priority != null) {
      data.priority = args.priority;
    }

    if (typeof args.starred === "boolean") {
      data.starred = args.starred;
    }

    if (typeof args.isCompleted === "boolean") {
      data.isCompleted = args.isCompleted;
      data.completedAt = args.isCompleted ? new Date() : null;
    }

    if ("dueDateISO" in args) {
      if (
        typeof args.dueDateISO !== "string" ||
        args.dueDateISO.length === 0
      ) {
        data.dueDate = null;
      } else {
        const d = new Date(args.dueDateISO);
        if (Number.isNaN(d.getTime())) {
          throw new GraphQLError("Invalid dueDateISO", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        data.dueDate = d;
      }
    }

    return ctx.prisma.todo.update({
      where: { id: args.id },
      data,
    });
  },
});

export const toggleTodoMutation = mutationField("toggleTodo", {
  type: nonNull("Todo"),
  args: {
    id: nonNull(stringArg()),
  },
  resolve: async (_parent, { id }, ctx) => {
    const userId = requireUserId(ctx);
    const existing = await ctx.prisma.todo.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new GraphQLError("Todo not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }
    const next = !existing.isCompleted;
    return ctx.prisma.todo.update({
      where: { id },
      data: {
        isCompleted: next,
        completedAt: next ? new Date() : null,
      },
    });
  },
});

export const deleteTodoMutation = mutationField("deleteTodo", {
  type: nonNull("Boolean"),
  args: {
    id: nonNull(stringArg()),
  },
  resolve: async (_parent, { id }, ctx) => {
    const userId = requireUserId(ctx);
    const deleted = await ctx.prisma.todo.deleteMany({
      where: { id, userId },
    });
    if (deleted.count === 0) {
      throw new GraphQLError("Todo not found for user", {
        extensions: { code: "NOT_FOUND" },
      });
    }
    return true;
  },
});

export const clearCompletedTodosMutation = mutationField("clearCompletedTodos", {
  type: nonNull("Int"),
  description: "Deletes all completed todos for this user.",
  args: {},
  resolve: async (_parent, _args, ctx) => {
    const userId = requireUserId(ctx);
    const res = await ctx.prisma.todo.deleteMany({
      where: { userId, isCompleted: true },
    });
    return res.count;
  },
});

export const reorderTodosMutation = mutationField("reorderTodos", {
  type: nonNull(list(nonNull("Todo"))),
  description:
    "Sets sortOrder by array index. Every id must belong to the signed-in user.",
  args: {
    orderedIds: nonNull(list(nonNull(stringArg()))),
  },
  resolve: async (_parent, { orderedIds }, ctx) => {
    const userId = requireUserId(ctx);
    const uniqueLen = new Set(orderedIds).size;
    if (uniqueLen !== orderedIds.length) {
      throw new GraphQLError("orderedIds contains duplicates", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    const rows = await ctx.prisma.todo.findMany({
      where: { userId, id: { in: orderedIds } },
      select: { id: true },
    });
    if (rows.length !== orderedIds.length) {
      throw new GraphQLError(
        "orderedIds references missing todos or another user",
        { extensions: { code: "BAD_USER_INPUT" } },
      );
    }

    await ctx.prisma.$transaction(
      orderedIds.map((id, index) =>
        ctx.prisma.todo.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    return ctx.prisma.todo.findMany({
      where: { userId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  },
});
