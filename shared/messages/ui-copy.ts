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
    comingTitle: "Daily brief + assistant",
    comingBody:
      "Your brief loads automatically; then ask to add tasks, change priority, or refresh the summary.",
  },

  assistant: {
    title: "Daily brief",
    description:
      "Summary of open tasks on load. Type or use the mic to manage tasks or refresh the brief.",
    commandsHint:
      "Ask below to add tasks, update priority, complete, delete, or say “refresh my brief”.",
    emptyHint:
      'Try “Add buy milk tomorrow”, “Mark the design review complete”, or “Refresh my brief”.',
    inputPlaceholder: "Ask or command…",
    send: "Send message",
    messagesLabel: "Brief and commands",
    listening: "Listening…",
    thinking: "Understanding…",
    applying: "Applying…",
    confirmHint: "Confirm to continue",
    startMic: "Start voice input",
    stopMic: "Done speaking",
    recording: "Listening…",
    recordingLive: "Listening for your command",
    cancelRecording: "Cancel recording",
    stopRequest: "Stop",
    retryVoice: "Try again",
    micUnsupported: "Voice not supported in this browser",
    cancel: "Cancel",
    confirmDelete: "Confirm delete",
    requestFailed:
      "Something went wrong on our side. Please try again in a moment.",
    clarify: {
      empty: "Say or type what you’d like to do with your tasks.",
      unrecognized:
        "I didn’t quite understand that. Try something like “add buy milk”, “mark design review complete”, or “refresh my brief”.",
      taskNotFound:
        "I couldn’t find that task. Try naming it more specifically, or check your task list.",
      geminiUnavailable:
        "Smart commands aren’t available right now. You can still try simple phrases like “add buy milk” or “refresh my brief”.",
      thanks:
        "You’re welcome! I’m here if you want to add a task or refresh your brief.",
      greeting:
        "Hi! Tell me what you’d like to do with your tasks.",
      goodbye:
        "Take care! Your tasks will be here when you need them.",
    },
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
      "Task summary on load — then use voice or chat below to manage todos or refresh.",
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
    clearCompletedDescription(count: number) {
      if (count <= 0) {
        return "There are no completed tasks to remove.";
      }
      const noun = count === 1 ? "task" : "tasks";
      return `This will permanently delete ${count} completed ${noun}. This cannot be undone.`;
    },
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
