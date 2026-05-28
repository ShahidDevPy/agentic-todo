"use client";

import { NetworkStatus } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { DestructiveConfirmDialog } from "@/components/common/destructive-confirm-dialog";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { DailyBriefPanel } from "@/components/todo/daily-brief-panel";
import {
  TaskCreateDialog,
  type CreateTaskPayload,
} from "@/components/todo/task-create-dialog";
import { TaskSidebar } from "@/components/todo/task-sidebar";
import { Button } from "@/components/ui/button";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { useAuth } from "@/hooks/use-auth";
import { getGreetingName, getProfileAvatarUrl } from "@/lib/auth/profile-meta";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useTodoListOrder } from "@/hooks/use-todo-list-order";
import { dueGroupForTodo } from "@/lib/todo-due-groups";
import {
  filterTodosByTaskSegment,
  type TaskListSegment,
} from "@/lib/todo-list-segment";
import { cn } from "@/lib/utils";
import { MobileTodoDetailDialog } from "@/components/todo/mobile-todo-detail-dialog";
import { TodoStatusStack } from "@/components/todo/todo-status-stack";
import { TodoTasksView } from "@/components/todo/todo-tasks-view";
import {
  CLEAR_COMPLETED,
  COMPLETED_TODOS_COUNT_QUERY,
  CREATE_TODO,
  DAILY_BRIEF_QUERY,
  DELETE_TODO,
  REORDER_TODOS,
  TODOS_QUERY,
  TOGGLE_TODO,
  UPDATE_TODO,
} from "@/lib/graphql/documents";
import { parseUserFacingError } from "@/lib/parse-user-facing-error";
import { workspacePanelShellClassName } from "@/lib/ui/workspace-panel";
import { statusCopy } from "@/shared/messages/status-copy";
import { Plus } from "lucide-react";
import { uiCopy } from "@/shared/messages/ui-copy";
import {
  narrowDailyBrief,
  narrowTodos,
  type DailyBriefQueryData,
  type TodoGql,
  type TodoPriority,
} from "@/types/todo-view";

type MainNav = "tasks" | "assistant";
type StatusTone = "success" | "danger" | "neutral";

export function TodoApp() {
  const { user, loading: authLoading, configured, signOut } = useAuth();
  const userId = user?.id ?? null;
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [listOrder, setListOrder] = useTodoListOrder();

  const [completedOnly, setCompletedOnly] = useState(false);
  const [starredOnly, setStarredOnly] = useState(false);
  const mainNav: MainNav = pathname === "/tasks" ? "tasks" : "assistant";
  const [createOpen, setCreateOpen] = useState(false);
  const [briefDeterministic, setBriefDeterministic] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [listSegment, setListSegment] = useState<TaskListSegment>("all");

  const [actionError, setActionError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<StatusTone>("success");
  const [suppressQueryBanner, setSuppressQueryBanner] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TodoGql | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const viewerTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  const listFilter = completedOnly
    ? ("COMPLETED" as const)
    : ("ACTIVE" as const);

  const { data, loading, error, refetch } = useQuery<{
    todos: TodoGql[];
  }>(TODOS_QUERY, {
    variables: {
      listFilter,
      listOrder,
      starredOnly,
    },
    skip: !userId,
  });

  const { data: completedCountData, refetch: refetchCompletedCount } =
    useQuery<{ completedTodosCount: number }>(COMPLETED_TODOS_COUNT_QUERY, {
      skip: !userId,
    });

  const completedCount = completedCountData?.completedTodosCount ?? 0;

  const refetchTasks = useCallback(async () => {
    await Promise.all([refetch(), refetchCompletedCount()]);
  }, [refetch, refetchCompletedCount]);

  const {
    data: briefData,
    loading: briefLoading,
    error: briefError,
    refetch: refetchBrief,
    networkStatus: briefNetworkStatus,
  } = useQuery<DailyBriefQueryData>(DAILY_BRIEF_QUERY, {
    variables: {
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

  useEffect(() => {
    setStatusMessage(null);
    setStatusTone("success");
  }, [mainNav]);

  useEffect(() => {
    if (!statusMessage) return;
    const id = window.setTimeout(() => setStatusMessage(null), 2400);
    return () => window.clearTimeout(id);
  }, [statusMessage]);

  const queryBanner =
    !suppressQueryBanner && (error ?? briefError)
      ? parseUserFacingError(error ?? briefError)
      : null;

  const bannerMessage = actionError ?? queryBanner;

  const dismissBanner = useCallback(() => {
    setActionError(null);
    setStatusMessage(null);
    setStatusTone("success");
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

  const brief = useMemo(() => narrowDailyBrief(briefData), [briefData]);

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

  const setStatusWithTone = useCallback(
    (message: string | null, tone: StatusTone = "success") => {
      setStatusTone(tone);
      setStatusMessage(message);
    },
    [],
  );

  const mutationOpts = useMemo(
    () => ({
      setError: setActionError,
      setStatus: setStatusWithTone,
      refetch: refetchTasks,
    }),
    [refetchTasks, setStatusWithTone],
  );

  const [createTodo, { loading: creating }] = useAppMutation<
    { createTodo: { title: string } },
    Record<string, unknown>
  >(CREATE_TODO, {
    ...mutationOpts,
    onSuccessStatus: (data) => ({
      message: statusCopy.taskCreated(data.createTodo.title),
      tone: "success",
    }),
    onCompleted: () => setCreateOpen(false),
  });

  const [toggleTodo] = useAppMutation(TOGGLE_TODO, {
    ...mutationOpts,
    onSuccessStatus: () => ({
      message: statusCopy.taskToggled,
      tone: "neutral",
    }),
  });

  const [updateTodo] = useAppMutation(UPDATE_TODO, {
    ...mutationOpts,
    onSuccessStatus: () => ({
      message: statusCopy.taskUpdated,
      tone: "neutral",
    }),
  });

  const [deleteTodo, { loading: deletingTodo }] = useAppMutation<
    { deleteTodo: boolean },
    { id: string }
  >(DELETE_TODO, {
    ...mutationOpts,
    onSuccessStatus: () => ({
      message: statusCopy.taskDeleted,
      tone: "danger",
    }),
    onCompleted: () => setDeleteTarget(null),
  });

  const [clearCompleted, { loading: clearing }] = useAppMutation<{
    clearCompletedTodos: number;
  }>(CLEAR_COMPLETED, {
    ...mutationOpts,
    refetchQueries: ["Todos", "CompletedTodosCount"],
    awaitRefetchQueries: true,
    onSuccessStatus: (data) => ({
      message: statusCopy.clearedCompleted(data.clearCompletedTodos),
      tone: data.clearCompletedTodos > 0 ? "danger" : "neutral",
    }),
    onCompleted: () => setClearConfirmOpen(false),
  });

  const [reorderTodos] = useAppMutation(REORDER_TODOS, {
    ...mutationOpts,
    onSuccessStatus: () => ({
      message: statusCopy.orderSaved,
      tone: "success",
    }),
  });

  const handleCreateTaskSubmit = useCallback(
    async (payload: CreateTaskPayload) => {
      if (!userId) return;
      await createTodo({
        variables: {
          title: payload.title,
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
        variables: { orderedIds: next.map((t) => t.id) },
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
      variables: { id: deleteTarget.id },
    });
  }, [deleteTarget, deleteTodo, userId]);

  const handleConfirmClear = useCallback(async () => {
    if (!userId) return;
    await clearCompleted({});
  }, [clearCompleted, userId]);

  const reorderEnabled = listOrder === "MANUAL";

  const greetingName = useMemo(
    () => getGreetingName(user, uiCopy.welcome.you),
    [user],
  );

  const greetingAvatarUrl = useMemo(() => getProfileAvatarUrl(user), [user]);

  const handleSelectTodo = useCallback((id: string) => {
    setSelectedTodoId(id);
  }, []);

  const handleListSegmentChange = useCallback((segment: TaskListSegment) => {
    setListSegment(segment);
  }, []);

  if (!configured) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] flex-col items-center justify-center gap-2 px-4 text-center text-sm">
        <p className="text-foreground max-w-md font-medium">
          Sign-in is not configured.
        </p>
        <p className="max-w-md">
          Add{" "}
          <code className="text-foreground rounded bg-muted px-1 py-0.5 text-xs">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="text-foreground rounded bg-muted px-1 py-0.5 text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          to <code className="text-xs">.env.local</code>, then restart the dev
          server.
        </p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const showMobileDetail = isMobile && mainNav === "tasks" && !!selectedTodo;

  return (
    <div className="from-background to-muted/30 flex min-h-[100dvh] flex-col bg-gradient-to-b lg:flex-row">
      <TaskSidebar
        onCreateTask={() => setCreateOpen(true)}
        userEmail={user?.email ?? undefined}
        onSignOut={signOut}
      />

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          mainNav === "assistant"
            ? "max-lg:min-h-0 max-lg:overflow-y-auto"
            : "min-h-0",
        )}
      >
        <TodoStatusStack
          errorMessage={bannerMessage}
          statusMessage={statusMessage}
          statusTone={statusTone}
          onDismiss={dismissBanner}
        />

        <main
          className={cn(
            "mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-8",
            mainNav === "assistant"
              ? "max-lg:min-h-0 max-lg:overflow-y-auto"
              : "min-h-0",
          )}
        >
          <div
            className={cn(
              "relative isolate flex flex-1 flex-col",
              mainNav === "tasks" && "min-h-0",
            )}
          >
            <TodoTasksView
              mainNav={mainNav}
              greetingName={greetingName}
              greetingAvatarUrl={greetingAvatarUrl}
              listSegment={listSegment}
              onListSegmentChange={handleListSegmentChange}
              upcomingCount={upcomingCount}
              listOrder={listOrder}
              onListOrderChange={setListOrder}
              completedOnly={completedOnly}
              onCompletedOnlyChange={setCompletedOnly}
              starredOnly={starredOnly}
              onStarredOnlyChange={setStarredOnly}
              onClearRequest={() => {
                void refetchCompletedCount();
                setClearConfirmOpen(true);
              }}
              clearing={clearing}
              canClear={!!userId}
              displayTodos={displayTodos}
              loading={loading}
              listEmptyLabel={listEmptyLabel}
              selectedTodoId={selectedTodoId}
              onSelectTodo={handleSelectTodo}
              onToggle={onToggle}
              onUpdatePriority={onUpdatePriority}
              selectedTodo={selectedTodo}
              selectedIndex={selectedIndex}
              todosLength={todos.length}
              reorderEnabled={reorderEnabled}
              onStar={onStar}
              onDeleteRequest={setDeleteTarget}
              onMove={move}
              onUpdate={onUpdateTask}
            />
            <section
              aria-hidden={mainNav !== "assistant"}
              className={cn(
                "transition-opacity duration-200 ease-out motion-reduce:transition-none",
                mainNav === "assistant"
                  ? "relative z-10 flex flex-1 flex-col opacity-100 max-lg:min-h-0 lg:min-h-0"
                  : "pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0",
              )}
            >
              <div
                className={workspacePanelShellClassName(undefined, {
                  layout: "assistant",
                })}
              >
                <DailyBriefPanel
                  greetingName={greetingName}
                  avatarUrl={greetingAvatarUrl}
                  timeZone={viewerTimeZone}
                  onAssistantTasksChanged={() => {
                    void refetch();
                    void refetchBrief();
                  }}
                  assistantDisabled={!userId}
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
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 size-12 rounded-full shadow-lg sm:right-5 sm:bottom-[max(1.25rem,env(safe-area-inset-bottom))] sm:size-14 lg:hidden"
        onClick={() => setCreateOpen(true)}
        aria-label={uiCopy.a11y.newTaskFab}
      >
        <Plus className="size-5 sm:size-6" aria-hidden />
      </Button>

      <MobileTodoDetailDialog
        open={showMobileDetail}
        onOpenChange={(open) => {
          if (!open) setSelectedTodoId(null);
        }}
        selectedTodo={selectedTodo}
        selectedIndex={selectedIndex}
        todosLength={todos.length}
        reorderEnabled={reorderEnabled}
        onToggle={onToggle}
        onStar={onStar}
        onDeleteRequest={setDeleteTarget}
        onMove={move}
        onUpdate={onUpdateTask}
      />

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
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title={uiCopy.confirmations.clearCompletedTitle}
        description={uiCopy.confirmations.clearCompletedDescription(
          completedCount,
        )}
        confirmLabel={uiCopy.confirmations.clearConfirm}
        cancelLabel={uiCopy.confirmations.cancel}
        loading={clearing}
        onConfirm={handleConfirmClear}
      />
    </div>
  );
}
