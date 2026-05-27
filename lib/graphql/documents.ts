import { gql } from "@apollo/client";

export const TODOS_QUERY = gql`
  query Todos(
    $listFilter: TodoListFilter
    $listOrder: TodoListOrder
    $starredOnly: Boolean
  ) {
    todos(
      listFilter: $listFilter
      listOrder: $listOrder
      starredOnly: $starredOnly
    ) {
      id
      title
      description
      starred
      isCompleted
      priority
      sortOrder
      dueDate
      completedAt
      createdAt
    }
  }
`;

export const COMPLETED_TODOS_COUNT_QUERY = gql`
  query CompletedTodosCount {
    completedTodosCount
  }
`;

export const DAILY_BRIEF_QUERY = gql`
  query DailyBrief($deterministicOnly: Boolean, $timeZone: String) {
    dailyBrief(deterministicOnly: $deterministicOnly, timeZone: $timeZone) {
      summaryMarkdown
      pendingCount
      overdueCount
      usedGemini
    }
  }
`;

export const CREATE_TODO = gql`
  mutation CreateTodo(
    $title: String!
    $description: String
    $dueDateISO: String
    $priority: TodoPriority
    $starred: Boolean
  ) {
    createTodo(
      title: $title
      description: $description
      dueDateISO: $dueDateISO
      priority: $priority
      starred: $starred
    ) {
      id
      title
      priority
      sortOrder
    }
  }
`;

export const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: String!) {
    toggleTodo(id: $id) {
      id
      isCompleted
      completedAt
    }
  }
`;

export const UPDATE_TODO = gql`
  mutation UpdateTodo(
    $id: String!
    $title: String
    $description: String
    $priority: TodoPriority
    $starred: Boolean
    $isCompleted: Boolean
    $dueDateISO: String
  ) {
    updateTodo(
      id: $id
      title: $title
      description: $description
      priority: $priority
      starred: $starred
      isCompleted: $isCompleted
      dueDateISO: $dueDateISO
    ) {
      id
      title
      description
      starred
      isCompleted
      priority
      dueDate
      completedAt
    }
  }
`;

export const DELETE_TODO = gql`
  mutation DeleteTodo($id: String!) {
    deleteTodo(id: $id)
  }
`;

export const CLEAR_COMPLETED = gql`
  mutation ClearCompleted {
    clearCompletedTodos
  }
`;

export const REORDER_TODOS = gql`
  mutation ReorderTodos($orderedIds: [String!]!) {
    reorderTodos(orderedIds: $orderedIds) {
      id
      sortOrder
    }
  }
`;
