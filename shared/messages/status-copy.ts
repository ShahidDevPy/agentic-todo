/** User-visible success feedback for mutations and actions. */
export const statusCopy = {
  taskCreated(title?: string) {
    const trimmed = title?.trim();
    return trimmed
      ? `Task "${trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed}" created.`
      : "Task created.";
  },

  taskDeleted: "Task deleted.",

  taskUpdated: "Task updated.",

  taskToggled: "Task updated.",

  orderSaved: "Order saved.",

  clearedCompleted(count: number) {
    if (count <= 0) return "No completed tasks to clear.";
    return count === 1
      ? "Cleared 1 completed task."
      : `Cleared ${count} completed tasks.`;
  },
} as const;
