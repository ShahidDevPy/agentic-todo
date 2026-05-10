import path from "path";
import { makeSchema } from "nexus";
import { todoGraphqlTypes } from "@/modules/todo/graphql";

/**
 * Executable GraphQL schema for Apollo Server.
 *
 * Keeps infra (outputs, Nexus context wiring) separate from domain modules under `modules/`.
 */
export const schema = makeSchema({
  types: [...todoGraphqlTypes],
  outputs: {
    schema: path.join(process.cwd(), "prisma/generated/schema.graphql"),
    typegen: path.join(process.cwd(), "prisma/generated/nexus.ts"),
  },
  contextType: {
    module: path.join(process.cwd(), "shared/graphql/context.ts"),
    export: "Context",
  },
  shouldGenerateArtifacts: process.env.NODE_ENV !== "production",
});
