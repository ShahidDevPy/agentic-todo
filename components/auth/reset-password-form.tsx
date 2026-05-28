"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { validatePasswordPair } from "@/lib/auth/password";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { authCopy } from "@/shared/messages/auth-copy";

const authCardClassName = cn(
  "w-full max-w-md gap-0 overflow-hidden rounded-2xl border-border/60 py-0 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
);

const authHeaderClassName =
  "border-border/50 space-y-1.5 border-b px-5 pb-4 pt-5 sm:px-6 sm:pt-6";

function stripRecoveryParamsFromUrl() {
  window.history.replaceState({}, "", "/auth/reset-password");
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") ? next : "/";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCheckingSession(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    async function establishRecoverySession() {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled && !exchangeError) {
          stripRecoveryParamsFromUrl();
          setHasSession(true);
          setCheckingSession(false);
          return;
        }
      }

      if (tokenHash && type === "recovery") {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (!cancelled && !verifyError) {
          stripRecoveryParamsFromUrl();
          setHasSession(true);
          setCheckingSession(false);
          return;
        }
      }

      const hash = window.location.hash;
      if (hash && (hash.includes("access_token") || hash.includes("type=recovery"))) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (!cancelled && !sessionError && sessionData.session) {
          stripRecoveryParamsFromUrl();
          setHasSession(true);
          setCheckingSession(false);
          return;
        }
      }

      const { data } = await supabase.auth.getUser();
      if (!cancelled) {
        setHasSession(!!data.user);
        setCheckingSession(false);
      }
    }

    void establishRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setHasSession(true);
        setCheckingSession(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setMessage(null);
      if (!isSupabaseConfigured()) {
        setError("Supabase is not configured.");
        return;
      }
      const validation = validatePasswordPair(password, confirm);
      if (validation === "tooShort") {
        setError(authCopy.resetPassword.tooShort);
        return;
      }
      if (validation === "mismatch") {
        setError(authCopy.resetPassword.mismatch);
        return;
      }
      setLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();
        const { error: err } = await supabase.auth.updateUser({ password });
        if (err) {
          setError(err.message);
          return;
        }
        setMessage(authCopy.resetPassword.success);
        router.replace(safeNext);
        router.refresh();
      } finally {
        setLoading(false);
      }
    },
    [confirm, password, router, safeNext],
  );

  if (!isSupabaseConfigured()) {
    return (
      <Card className={cn(authCardClassName, "border-dashed")}>
        <CardHeader className={authHeaderClassName}>
          <CardTitle className="text-lg sm:text-xl">Reset unavailable</CardTitle>
          <CardDescription>Supabase is not configured.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (checkingSession) {
    return (
      <Card className={authCardClassName}>
        <CardHeader className={authHeaderClassName}>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!hasSession) {
    return (
      <Card className={authCardClassName}>
        <CardHeader className={authHeaderClassName}>
          <CardTitle className="text-lg sm:text-xl">
            {authCopy.resetPassword.title}
          </CardTitle>
          <CardDescription>{authCopy.resetPassword.noSession}</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6">
          <Link
            href="/login/forgot-password"
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            {authCopy.resetPassword.requestAgain}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={authCardClassName}>
      <CardHeader className={authHeaderClassName}>
        <CardTitle className="text-lg sm:text-xl">
          {authCopy.resetPassword.title}
        </CardTitle>
        <CardDescription>{authCopy.resetPassword.description}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4 px-5 pb-2 pt-4 sm:px-6 sm:pt-5">
          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="text-sm font-medium leading-none"
            >
              {authCopy.resetPassword.newPasswordLabel}
            </label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium leading-none"
            >
              {authCopy.resetPassword.confirmPasswordLabel}
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="h-10"
            />
          </div>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="text-muted-foreground text-sm" role="status">
              {message}
            </p>
          ) : null}
        </CardContent>
        <div className="border-border/50 border-t px-5 py-4 sm:px-6 sm:py-5">
          <Button
            type="submit"
            className="h-10 w-full sm:w-auto sm:min-w-[7.5rem]"
            disabled={loading}
          >
            {loading
              ? authCopy.resetPassword.saving
              : authCopy.resetPassword.submit}
          </Button>
        </div>
      </form>
    </Card>
  );
}
