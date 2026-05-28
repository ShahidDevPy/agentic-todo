"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "agentic-todo-list-order";

export type ClientListOrder = "SMART" | "MANUAL";

export function useTodoListOrder(): [
  ClientListOrder,
  (v: ClientListOrder) => void,
] {
  const [order, setOrderState] = useState<ClientListOrder>("SMART");

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "MANUAL" || v === "SMART") setOrderState(v);
    } catch {
      /* ignore */
    }
  }, []);

  const setOrder = (v: ClientListOrder) => {
    setOrderState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  };

  return [order, setOrder];
}
