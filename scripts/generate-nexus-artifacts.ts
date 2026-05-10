/**
 * Run `npm run generate:nexus` after changing Nexus schema so `prisma/generated/nexus.ts`
 * stays in sync (production builds skip artifact generation).
 */
import "../server/graphql/schema";
