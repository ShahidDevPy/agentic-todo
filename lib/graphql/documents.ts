import { gql } from "@apollo/client";

export const TODOS_QUERY = gql`
  query Todos(
    $userId: String!
    $listFilter: TodoListFilter
    $listOrder: TodoListOrder
    $starredOnly: Boolean
  ) {
    todos(
      userId: $userId
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

export const DAILY_BRIEF_QUERY = gql`
  query DailyBrief(
    $userId: String!
    $deterministicOnly: Boolean
    $timeZone: String
  ) {
    dailyBrief(
      userId: $userId
      deterministicOnly: $deterministicOnly
      timeZone: $timeZone
    ) {
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
    $userId: String!
    $description: String
    $dueDateISO: String
    $priority: TodoPriority
    $starred: Boolean
  ) {
    createTodo(
      title: $title
      userId: $userId
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
  mutation DeleteTodo($id: String!, $userId: String!) {
    deleteTodo(id: $id, userId: $userId)
  }
`;

export const CLEAR_COMPLETED = gql`
  mutation ClearCompleted($userId: String!) {
    clearCompletedTodos(userId: $userId)
  }
`;

export const REORDER_TODOS = gql`
  mutation ReorderTodos($userId: String!, $orderedIds: [String!]!) {
    reorderTodos(userId: $userId, orderedIds: $orderedIds) {
      id
      sortOrder
    }
  }
`;
