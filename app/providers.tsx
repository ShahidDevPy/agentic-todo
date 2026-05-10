"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useMemo, type ReactNode } from "react";
import { getApolloClient } from "@/lib/apollo-client";

export function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => getApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
