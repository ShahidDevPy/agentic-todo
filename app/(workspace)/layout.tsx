import { TodoApp } from "@/components/todo/todo-app";

/**
 * Single long-lived shell so client state (filters, selection) survives / ↔ /tasks navigation.
 * Route segments under this group render `null`; the UI is entirely in TodoApp (pathname-driven).
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TodoApp />
      {children}
    </>
  );
}
