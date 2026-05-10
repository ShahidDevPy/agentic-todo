"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "agentic-todo-user-id";

/** Stable anonymous user id for GraphQL until Supabase auth is wired. */
export function useUserId(): string | null {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    try {
      let v = localStorage.getItem(STORAGE_KEY);
      if (!v) {
        v = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, v);
      }
      setId(v);
    } catch {
      setId("browser-user");
    }
  }, []);

  return id;
}
