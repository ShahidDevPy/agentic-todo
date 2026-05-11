/**
 * Maps GraphQL `extensions.code` (and similar) to safe, user-facing strings.
 * Resolver messages may leak implementation details — prefer codes from the server.
 */
export const errorCopy = {
  generic:
    "Something went wrong. Check your connection and try again.",

  notFound: "That item no longer exists or you do not have access.",

  badInput: "We could not process that input. Please check and try again.",

  server: "Our servers had a problem. Please try again in a moment.",

  offline:
    "Could not reach the server. Check your network or VPN connection.",

  /** Fallback when we only have a technical Error#message */
  unexpected: "An unexpected error occurred.",

  authRequired: "Please sign in again to continue.",
} as const;

export type GraphqlErrorCode =
  | "NOT_FOUND"
  | "BAD_USER_INPUT"
  | "FORBIDDEN"
  | "UNAUTHENTICATED";

/** Maps known resolver extension codes → user copy. */
export const graphqlCodeMessage: Partial<
  Record<GraphqlErrorCode | string,
    string
  >
> = {
  NOT_FOUND: errorCopy.notFound,
  BAD_USER_INPUT: errorCopy.badInput,
  FORBIDDEN: errorCopy.notFound,
  UNAUTHENTICATED: errorCopy.authRequired,
};
