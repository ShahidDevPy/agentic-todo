/** User-visible copy — single source for consistent UI text. */
export const uiCopy = {
  appTitle: "Agentic Todo",
  appTagline:
    "Natural-language ready — tasks, priorities, and a daily brief.",

  mockUser: {
    displayName: "You",
    status: "Personal workspace",
  },

  account: {
    /** Shown on profile chip when the account has no email (rare). */
    signedInFallback: "Signed in",
  },

  welcome: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    /** Greeting when `first_name` is not in profile (no email in this slot). */
    you: "You",
    name: "there",
    subtitle:
      "Your daily brief and open tasks below — one place to plan the day.",
  },

  addTask: {
    title: "Add task",
    description: "Saved to your signed-in account.",
    titleLabel: "Title",
    notesLabel: "Notes",
    priorityLabel: "Priority",
    titlePlaceholder: "Meeting with design team Tuesday 3pm",
    notesPlaceholder: "Optional",
    submit: "Add",
  },

  sidebar: {
    tagline: "Tasks and daily brief in one place.",
    tasks: "My tasks",
    assistant: "Daily brief",
    newTask: "New task",
    comingTitle: "Todo assistant (chat)",
    comingBody:
      "Coming next: chat with an assistant to create, update, or delete tasks for you.",
  },

  sidebarTask: {
    filtersHeading: "List",
    segmentAll: "All tasks",
  },

  tasksPanel: {
    scopeLabel: "List scope",
    optionsButton: "Options",
    optionsHint: "Filters and clear completed — optional.",
  },

  dueGroups: {
    overdue: "Overdue",
    today: "Today",
    upcoming: "Upcoming",
    nodate: "No date",
  },

  detail: {
    placeholder: "Select a task from the list to see details here.",
    noDescription: "No extra details yet — add notes above.",
    duePrefix: "Due",
    markComplete: "Mark complete",
    markIncomplete: "Mark incomplete",
  },

  detailMobile: {
    sheetTitle: "Task details",
    back: "Back to list",
  },

  createTask: {
    dialogTitle: "New task",
    dialogHint: "Add a title, optional details, due date, and priority.",
    titleRequired: "Add a title to create this task.",
    detailsLabel: "Details",
    detailsPlaceholder: "Add notes, links, or context…",
    dueLabel: "Due date",
    timeLabel: "Time",
    dueHint:
      "Optional. Pick a date; add a time or we use noon local. Your timezone.",
    cancel: "Cancel",
    save: "Add task",
  },

  toolbar: {
    sortLabel: "Order",
    smartOrder: "Smart",
    smartOrderHint: "High priority and nearest due dates first.",
    manualOrder: "My order",
    manualOrderHint: "Drag-style arrows; order is saved for this list.",
  },

  list: {
    heading: "Your tasks",
    headingHint: "",
    loading: "Loading tasks…",
    empty: "No tasks yet. Use New task to add one.",
    emptyCompleted: "No completed tasks in this view.",
    completedOnly: "Completed only",
    starredOnly: "Starred only",
    clearCompleted: "Clear completed",
  },

  brief: {
    cardTitle: "Daily brief",
    cardDescription:
      "A short summary of your open tasks. Turn on template-only for the same built-in layout every time.",
    templateOnly: "Template only",
    sourceAi: "Enhanced summary",
    sourceTemplate: "Template",
    sourceAiFallback: "Standard summary",
    updatingBrief: "Updating brief…",
    refresh: "Refresh",
    retry: "Try again",
    generating: "Generating brief…",
    generatingDetail:
      "Analyzing your tasks and building a summary…",
    writingBrief: "Writing next part…",
    statsOpen: "Open",
    statsOverdue: "Overdue",
    idleHint: "Brief loads automatically for your tasks.",
    loadFailedTitle: "Couldn’t load brief",
    loadFailedBody: "Check your connection and try again.",
    emptyTasksTitle: "Nothing on your plate",
    emptyTasksBody: "Add a task to get a tailored brief and stay on track.",
    emptyTasksCta: "New task",
    allClearTitle: "All clear",
    allClearBody: "No open tasks — enjoy the calm or add something new.",
  },

  confirmations: {
    deleteTaskTitle: "Delete this task?",
    deleteTaskDescription: (title: string) =>
      `"${title.slice(0, 80)}${title.length > 80 ? "…" : ""}" will be removed permanently.`,
    deleteConfirm: "Delete",
    clearCompletedTitle: "Clear all completed tasks?",
    clearCompletedDescription:
      "This removes every completed task for this profile. This cannot be undone.",
    clearConfirm: "Clear all",
    cancel: "Cancel",
  },

  a11y: {
    moveUp: "Move up",
    moveDown: "Move down",
    star: "Star task",
    unstar: "Remove star",
    delete: "Delete task",
    markDone: "Mark as done",
    markNotDone: "Mark as not done",
    newTaskFab: "Create new task",
    priorityLow: "Low priority",
    priorityMedium: "Medium priority",
    priorityHigh: "High priority",
    priorityGroup: "Task priority",
  },
} as const;
