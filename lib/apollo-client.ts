import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

function graphqlHttpUri(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/graphql`;
  }
  const base =
    process.env.VERCEL_URL != null
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  return `${base.replace(/\/$/, "")}/api/graphql`;
}

let client: ApolloClient | undefined;

/** Single Apollo instance for the browser bundle (SSR-safe init for Next.js prerender). */
export function getApolloClient() {
  if (!client) {
    client = new ApolloClient({
      link: new HttpLink({
        uri: graphqlHttpUri(),
        credentials: "same-origin",
      }),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: { fetchPolicy: "cache-and-network" },
      },
    });
  }
  return client;
}
