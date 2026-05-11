import { GraphQLError } from "graphql";
import type { Context } from "@/shared/graphql/context";

export function requireUserId(ctx: Context): string {
  if (!ctx.userId) {
    throw new GraphQLError("Sign in required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return ctx.userId;
}
