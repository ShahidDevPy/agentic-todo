import { Badge } from "@/components/ui/badge";
import type { TodoPriority } from "@/types/todo-view";

function variantFor(
  p: TodoPriority,
): "default" | "secondary" | "outline" | "destructive" {
  if (p === "high") return "destructive";
  if (p === "medium") return "default";
  return "secondary";
}

export function TodoPriorityBadge({ priority }: { priority: TodoPriority }) {
  return <Badge variant={variantFor(priority)}>{priority}</Badge>;
}
