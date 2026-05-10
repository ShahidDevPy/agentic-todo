"use client";

import { NetworkStatus } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { ChevronLeft, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { MockUserBadge } from "@/components/common/mock-user-badge";
import { ErrorBanner } from "@/components/common/error-banner";
import { DestructiveConfirmDialog } from "@/components/common/destructive-confirm-dialog";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { DailyBriefPanel } from "@/components/todo/daily-brief-panel";
import { TaskListControlsStrip } from "@/components/todo/task-list-controls-strip";
import {
  TaskCreateDialog,
  type CreateTaskPayload,
} from "@/components/todo/task-create-dialog";
import { TaskSidebar } from "@/components/todo/task-sidebar";
import { TodoDetailPanel } from "@/components/todo/todo-detail-panel";
import { TodoList } from "@/components/todo/todo-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useTodoListOrder } from "@/hooks/use-todo-list-order";
import { useUserId } from "@/hooks/use-user-id";
import { dueGroupForTodo } from "@/lib/todo-due-groups";
import {
  filterTodosByTaskSegment,
  type TaskListSegment,
} from "@/lib/todo-list-segment";
import { cn } from "@/lib/utils";
import {
  CLEAR_COMPLETED,
  CREATE_TODO,
  DAILY_BRIEF_QUERY,
  DELETE_TODO,
  REORDER_TODOS,
  TODOS_QUERY,
  TOGGLE_TODO,
  UPDATE_TODO,
} from "@/lib/graphql/documents";
import { parseUserFacingError } from "@/lib/parse-user-facing-error";
import { mobileSheetDialogContentClassName } from "@/lib/ui/mobile-sheet-dialog";
import { workspacePanelShellClassName } from "@/lib/ui/workspace-panel";
import { uiCopy } from "@/shared/messages/ui-copy";
import {
  narrowDailyBrief,
  narrowTodos,
  type DailyBriefQueryData,
  type TodoGql,
  type TodoPriority,
} from "@/types/todo-view";

type MainNav = "tasks" | "assistant";

export function TodoApp() {
  const userId = useUserId();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [listOrder, setListOrder] = useTodoListOrder();

  const [completedOnly, setCompletedOnly] = useState(false);
  const [starredOnly, setStarredOnly] = useState(false);
  /** Routes: `/` = Daily brief, `/tasks` = My tasks. */
  const mainNav: MainNav = pathname === "/tasks" ? "tasks" : "assistant";
  const [createOpen, setCreateOpen] = useState(false);
  /** When false, server uses Gemini (if GEMINI_API_KEY is set). When true, template only. */
  const [briefDeterministic, setBriefDeterministic] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [listSegment, setListSegment] = useState<TaskListSegment>("all");

  const [actionError, setActionError] = useState<string | null>(null);
  const [suppressQueryBanner, setSuppressQueryBanner] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TodoGql | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  /** IANA zone for daily brief bucketing (client clock). */
  const viewerTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  const onGraphqlMutationError = useCallback((err: unknown) => {
    setActionError(parseUserFacingError(err));
  }, []);

  const listFilter = completedOnly ? ("COMPLETED" as const) : ("ACTIVE" as const);

  const { data, loading, error, refetch } = useQuery<{
    todos: TodoGql[];
  }>(TODOS_QUERY, {
    variables: {
      userId: userId ?? "",
      listFilter,
      listOrder,
      starredOnly,
    },
    skip: !userId,
  });

  const {
    data: briefData,
    loading: briefLoading,
    error: briefError,
    refetch: refetchBrief,
    networkStatus: briefNetworkStatus,
  } = useQuery<DailyBriefQueryData>(DAILY_BRIEF_QUERY, {
    variables: {
      userId: userId ?? "",
      deterministicOnly: briefDeterministic,
      timeZone: viewerTimeZone,
    },
    skip: !userId,
    notifyOnNetworkStatusChange: true,
  });

  const briefRefetching = briefNetworkStatus === NetworkStatus.refetch;

  useEffect(() => {
    setSuppressQueryBanner(false);
  }, [error, briefError]);

  const queryBanner =
    !suppressQueryBanner && (error ?? briefError)
      ? parseUserFacingError(error ?? briefError)
      : null;

  const bannerMessage = actionError ?? queryBanner;

  const dismissBanner = useCallback(() => {
    setActionError(null);
    if (error ?? briefError) setSuppressQueryBanner(true);
  }, [error, briefError]);

  const todos = useMemo(() => narrowTodos(data), [data]);

  const displayTodos = useMemo(
    () => filterTodosByTaskSegment(todos, listSegment),
    [todos, listSegment],
  );

  const upcomingCount = useMemo(
    () => todos.filter((t) => dueGroupForTodo(t) === "upcoming").length,
    [todos],
  );

  const listEmptyLabel = completedOnly
    ? uiCopy.list.emptyCompleted
    : uiCopy.list.empty;

  const brief = useMemo(
    () => narrowDailyBrief(briefData),
    [briefData],
  );

  useEffect(() => {
    if (mainNav !== "tasks") {
      setSelectedTodoId(null);
      return;
    }
    if (displayTodos.length === 0) {
      setSelectedTodoId(null);
      return;
    }
    setSelectedTodoId((prev) => {
      if (prev && displayTodos.some((t) => t.id === prev)) return prev;
      const first = displayTodos[0];
      return first ? first.id : null;
    });
  }, [mainNav, displayTodos]);

  const selectedTodo = useMemo(() => {
    if (!selectedTodoId) return null;
    return todos.find((t) => t.id === selectedTodoId) ?? null;
  }, [todos, selectedTodoId]);

  const selectedIndex = useMemo(() => {
    if (!selectedTodo) return -1;
    return todos.findIndex((t) => t.id === selectedTodo.id);
  }, [selectedTodo, todos]);

  const [createTodo, { loading: creating }] = useMutation(CREATE_TODO, {
    onCompleted: () => {
      setCreateOpen(false);
      void refetch();
      setActionError(null);
    },
    onError: onGraphqlMutationError,
  });

  const [toggleTodo] = useMutation(TOGGLE_TODO, {
    onCompleted: () => void refetch(),
    onError: onGraphqlMutationError,
  });

  const [updateTodo] = useMutation(UPDATE_TODO, {
    onCompleted: () => void refetch(),
    onError: onGraphqlMutationError,
  });

  const [deleteTodo, { loading: deletingTodo }] = useMutation(DELETE_TODO, {
    onCompleted: () => {
      void refetch();
      setDeleteTarget(null);
      setActionError(null);
    },
    onError: onGraphqlMutationError,
  });

  const [clearCompleted, { loading: clearing }] = useMutation(
    CLEAR_COMPLETED,
    {
      onCompleted: () => {
        void refetch();
        setClearDialogOpen(false);
        setActionError(null);
      },
      onError: onGraphqlMutationError,
    },
  );

  const [reorderTodos] = useMutation(REORDER_TODOS, {
    onCompleted: () => void refetch(),
    onError: onGraphqlMutationError,
  });

  const handleCreateTaskSubmit = useCallback(
    async (payload: CreateTaskPayload) => {
      if (!userId) return;
      await createTodo({
        variables: {
          title: payload.title,
          userId,
          description: payload.description,
          dueDateISO: payload.dueDateISO,
          priority: payload.priority,
          starred: false,
        },
      });
    },
    [createTodo, userId],
  );

  const move = useCallback(
    async (index: number, dir: -1 | 1) => {
      if (!userId) return;
      setListOrder("MANUAL");
      const swap = index + dir;
      if (swap < 0 || swap >= todos.length) return;
      const next = [...todos];
      const [row] = next.splice(index, 1);
      if (!row) return;
      next.splice(swap, 0, row);
      await reorderTodos({
        variables: { userId, orderedIds: next.map((t) => t.id) },
      });
    },
    [reorderTodos, setListOrder, todos, userId],
  );

  const onToggle = useCallback(
    (id: string) => {
      void toggleTodo({ variables: { id } });
    },
    [toggleTodo],
  );

  const onStar = useCallback(
    (id: string, starred: boolean) => {
      void updateTodo({ variables: { id, starred } });
    },
    [updateTodo],
  );

  const onUpdateTask = useCallback(
    (
      id: string,
      patch: {
        title?: string;
        description?: string | null;
        priority?: TodoPriority;
        dueDateISO?: string | null;
      },
    ) => {
      void updateTodo({ variables: { id, ...patch } });
    },
    [updateTodo],
  );

  const onUpdatePriority = useCallback(
    (id: string, priority: TodoPriority) => {
      const t = todos.find((x) => x.id === id);
      if (!t || t.priority === priority) return;
      void updateTodo({ variables: { id, priority } });
    },
    [todos, updateTodo],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!userId || !deleteTarget) return;
    await deleteTodo({
      variables: { id: deleteTarget.id, userId },
    });
  }, [deleteTarget, deleteTodo, userId]);

  const handleConfirmClear = useCallback(async () => {
    if (!userId) return;
    await clearCompleted({ variables: { userId } });
  }, [clearCompleted, userId]);

  const reorderEnabled = listOrder === "MANUAL";

  const handleSelectTodo = useCallback((id: string) => {
    setSelectedTodoId(id);
  }, []);

  const handleListSegmentChange = useCallback((segment: TaskListSegment) => {
    setListSegment(segment);
  }, []);

  if (!userId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const showMobileDetail =
    isMobile && mainNav === "tasks" && !!selectedTodo;

  return (
    <div className="from-background to-muted/30 flex min-h-[100dvh] flex-col bg-gradient-to-b md:flex-row">
      <TaskSidebar onCreateTask={() => setCreateOpen(true)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ErrorBanner
          className="shrink-0 px-3 pt-3 sm:px-6 sm:pt-4"
          message={bannerMessage}
          onDismiss={dismissBanner}
        />

        <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-8">
          <div className="relative isolate flex min-h-0 flex-1 flex-col">
            <section
              aria-hidden={mainNav !== "tasks"}
              className={cn(
                "transition-opacity duration-200 ease-out motion-reduce:transition-none",
                mainNav === "tasks"
                  ? "relative z-10 flex min-h-0 flex-1 flex-col opacity-100"
                  : "pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0",
              )}
            >
              <div className={workspacePanelShellClassName()}>
                <div className="border-border/45 flex shrink-0 flex-col gap-1.5 border-b px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-5 sm:py-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight sm:text-lg md:text-xl">
                      {uiCopy.list.heading}
                    </h2>
                    {uiCopy.list.headingHint ? (
                      <p className="text-muted-foreground mt-0.5 max-w-prose text-xs">
                        {uiCopy.list.headingHint}
                      </p>
                    ) : null}
                  </div>
                  <MockUserBadge variant="compact" className="shrink-0" />
                </div>

                <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(220px,30%)_minmax(0,1fr)]">
                  <div className="border-border/40 flex min-h-0 min-w-0 flex-col lg:border-r">
                    <TaskListControlsStrip
                      listSegment={listSegment}
                      onListSegmentChange={handleListSegmentChange}
                      upcomingCount={upcomingCount}
                      listOrder={listOrder}
                      onListOrderChange={setListOrder}
                      completedOnly={completedOnly}
                      onCompletedOnlyChange={setCompletedOnly}
                      starredOnly={starredOnly}
                      onStarredOnlyChange={setStarredOnly}
                      onClearRequest={() => setClearDialogOpen(true)}
                      clearing={clearing}
                      canClear={!!userId}
                    />
                    <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2 sm:px-3 sm:py-3">
                      <TodoList
                        todos={displayTodos}
                        loading={loading}
                        emptyLabel={listEmptyLabel}
                        groupByDue={listSegment === "all"}
                        selectedTodoId={selectedTodoId}
                        onSelectTodo={handleSelectTodo}
                        onToggle={onToggle}
                        onUpdatePriority={onUpdatePriority}
                      />
                    </div>
                  </div>
                  <div className="bg-muted/10 hidden min-h-0 flex-col lg:flex">
                    <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-6">
                      <TodoDetailPanel
                        key={selectedTodo?.id ?? "__none__"}
                        className="border-0 shadow-none ring-0"
                        todo={selectedTodo}
                        index={selectedIndex >= 0 ? selectedIndex : 0}
                        isFirst={selectedIndex === 0}
                        isLast={
                          selectedIndex >= 0 &&
                          selectedIndex === todos.length - 1
                        }
                        reorderEnabled={reorderEnabled}
                        onToggle={onToggle}
                        onStar={onStar}
                        onDeleteRequest={setDeleteTarget}
                        onMove={move}
                        onUpdate={onUpdateTask}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section
              aria-hidden={mainNav !== "assistant"}
              className={cn(
                "transition-opacity duration-200 ease-out motion-reduce:transition-none",
                mainNav === "assistant"
                  ? "relative z-10 flex min-h-0 flex-1 flex-col opacity-100"
                  : "pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0",
              )}
            >
              <div className={workspacePanelShellClassName()}>
                <DailyBriefPanel
                  brief={brief}
                  loading={briefLoading}
                  briefRefetching={briefRefetching}
                  briefQueryFailed={!!briefError}
                  deterministicOnly={briefDeterministic}
                  onDeterministicChange={setBriefDeterministic}
                  onRefresh={() => void refetchBrief()}
                  disabled={!userId || (briefLoading && !brief)}
                  onAddTask={() => setCreateOpen(true)}
                />
              </div>
            </section>
          </div>
        </main>
      </div>

      <Button
        type="button"
        size="icon"
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 size-12 rounded-full shadow-lg sm:right-5 sm:bottom-[max(1.25rem,env(safe-area-inset-bottom))] sm:size-14 md:hidden"
        onClick={() => setCreateOpen(true)}
        aria-label={uiCopy.a11y.newTaskFab}
      >
        <Plus className="size-5 sm:size-6" aria-hidden />
      </Button>

      <Dialog
        open={showMobileDetail}
        onOpenChange={(open) => {
          if (!open) setSelectedTodoId(null);
        }}
      >
        <DialogContent
          showCloseButton
          className={cn(
            "flex max-h-[min(92dvh,100dvh)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
            mobileSheetDialogContentClassName(),
            "sm:left-[50%] sm:top-[50%] sm:max-h-[90vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:p-0",
          )}
        >
          <DialogHeader className="border-border flex shrink-0 flex-row items-center gap-2 border-b px-3 py-2.5 sm:px-4 sm:py-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              aria-label={uiCopy.detailMobile.back}
              onClick={() => setSelectedTodoId(null)}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <DialogTitle className="text-sm font-semibold sm:text-base">
              {uiCopy.detailMobile.sheetTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-4 sm:pb-6">
            <TodoDetailPanel
              key={selectedTodo?.id ?? "__none__"}
              todo={selectedTodo}
              index={selectedIndex >= 0 ? selectedIndex : 0}
              isFirst={selectedIndex === 0}
              isLast={
                selectedIndex >= 0 && selectedIndex === todos.length - 1
              }
              reorderEnabled={reorderEnabled}
              onToggle={onToggle}
              onStar={onStar}
              onDeleteRequest={setDeleteTarget}
              onMove={move}
              onUpdate={onUpdateTask}
            />
          </div>
        </DialogContent>
      </Dialog>

      <TaskCreateDialog
        key={createOpen ? "task-create-open" : "task-create-closed"}
        open={createOpen}
        onOpenChange={setCreateOpen}
        creating={creating}
        onSubmit={handleCreateTaskSubmit}
      />

      <DestructiveConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={uiCopy.confirmations.deleteTaskTitle}
        description={
          deleteTarget
            ? uiCopy.confirmations.deleteTaskDescription(deleteTarget.title)
            : ""
        }
        confirmLabel={uiCopy.confirmations.deleteConfirm}
        cancelLabel={uiCopy.confirmations.cancel}
        loading={deletingTodo}
        onConfirm={handleConfirmDelete}
      />

      <DestructiveConfirmDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title={uiCopy.confirmations.clearCompletedTitle}
        description={uiCopy.confirmations.clearCompletedDescription}
        confirmLabel={uiCopy.confirmations.clearConfirm}
        cancelLabel={uiCopy.confirmations.cancel}
        loading={clearing}
        onConfirm={handleConfirmClear}
      />
    </div>
  );
}
