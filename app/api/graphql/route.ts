import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { Context } from "@/shared/graphql/context";
import { schema } from "@/server/graphql/schema";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server-route";
import { prisma } from "@/shared/lib/prisma";

/** Apollo Sandbox UI at GET /api/graphql in development only. */
const plugins =
  process.env.NODE_ENV !== "production"
    ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
    : [];

const server = new ApolloServer<Context>({
  schema,
  plugins,
  introspection: process.env.NODE_ENV !== "production",
});

const graphqlHandler = startServerAndCreateNextHandler(server, {
  context: async (): Promise<Context> => {
    let userId: string | null = null;
    if (isSupabaseConfigured()) {
      const cookieStore = await cookies();
      const supabase = createSupabaseRouteHandlerClient(cookieStore);
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        userId = data.user.id;
      }
    }
    return { prisma, userId };
  },
});

/** Explicit handlers so types match Next.js App Router `RouteHandler` (Next 16). */
export async function GET(request: NextRequest) {
  return graphqlHandler(request);
}

export async function POST(request: NextRequest) {
  return graphqlHandler(request);
}
