import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { errorCopy, graphqlCodeMessage } from "@/shared/messages/error-copy";

/**
 * Turns Apollo/GraphQL/network errors into strings safe to show in the UI.
 */
export function parseUserFacingError(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    const first = error.errors[0];
    const code = first?.extensions?.code;
    if (typeof code === "string") {
      const mapped = graphqlCodeMessage[code];
      if (mapped) return mapped;
    }
    if (
      first?.message &&
      first.message.length > 0 &&
      first.message.length < 280
    ) {
      return first.message;
    }
    return errorCopy.generic;
  }

  if (ServerError.is(error)) {
    if (error.statusCode >= 500) return errorCopy.server;
    if (
      error.statusCode === 0 ||
      /failed to fetch|network/i.test(String(error.message))
    ) {
      return errorCopy.offline;
    }
  }

  if (error instanceof Error) {
    const msg = error.message;
    if (/failed to fetch|network/i.test(msg)) return errorCopy.offline;
    if (msg.length > 0 && msg.length < 200) return msg;
  }

  return errorCopy.unexpected;
}
