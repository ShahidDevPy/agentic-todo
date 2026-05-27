"use client";

import type {
  DocumentNode,
  InternalRefetchQueriesInclude,
  OperationVariables,
  TypedDocumentNode,
} from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useCallback } from "react";
import { parseUserFacingError } from "@/lib/parse-user-facing-error";

type StatusTone = "success" | "danger" | "neutral";

type MutationHookOptions<TData> = {
  setError: (message: string | null) => void;
  setStatus: (message: string | null, tone?: StatusTone) => void;
  onSuccessStatus?: (data: TData) => { message: string | null; tone?: StatusTone };
  onCompleted?: (data: TData) => void;
  refetch?: () => void | Promise<void>;
  refetchQueries?: InternalRefetchQueriesInclude;
  awaitRefetchQueries?: boolean;
};

export function useAppMutation<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(
  document: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options: MutationHookOptions<TData>,
) {
  const {
    setError,
    setStatus,
    onSuccessStatus,
    onCompleted,
    refetch,
    refetchQueries,
    awaitRefetchQueries,
  } = options;

  const [mutate, result] = useMutation<TData, TVariables>(document, {
    refetchQueries,
    awaitRefetchQueries,
  });

  type MutateFn = typeof mutate;

  const run = useCallback<MutateFn>(
    ((...args: Parameters<MutateFn>) => {
      setStatus(null, "success");
      return mutate(...args).then(
        (response) => {
          if (response.error) {
            setStatus(null, "success");
            setError(parseUserFacingError(response.error));
            return response;
          }
          if (response.data) {
            setError(null);
            const status =
              onSuccessStatus?.(response.data) ?? {
                message: null,
                tone: "success" as const,
              };
            setStatus(status.message, status.tone);
            void refetch?.();
            onCompleted?.(response.data);
          }
          return response;
        },
        (err) => {
          setStatus(null, "success");
          setError(parseUserFacingError(err));
          throw err;
        },
      );
    }) as MutateFn,
    [
      mutate,
      onCompleted,
      onSuccessStatus,
      refetch,
      setError,
      setStatus,
    ],
  );

  return [run, result] as const;
}
