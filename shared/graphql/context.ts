import type { PrismaClient } from "@/generated/prisma/client";

/** Injected into every GraphQL resolver via Apollo `context`. */
export interface Context {
  prisma: PrismaClient;
}
