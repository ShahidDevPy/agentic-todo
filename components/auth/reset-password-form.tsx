"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  authCardClassName,
  authFooterClassName,
  authHeaderClassName,
} from "@/components/auth/auth-card-styles";
import { AuthCardSkeleton } from "@/components/auth/auth-card-skeleton";
import { AuthFormAlert } from "@/components/auth/auth-form-alert";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { validatePasswordPair } from "@/lib/auth/password";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { authCopy } from "@/shared/messages/auth-copy";

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
      if (
        hash &&
        (hash.includes("access_token") || hash.includes("type=recovery"))
      ) {
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
        setError(authCopy.resetPassword.supabaseNotConfigured);
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
          <CardTitle className="text-lg sm:text-xl">
            {authCopy.resetPassword.unavailableTitle}
          </CardTitle>
          <CardDescription>
            {authCopy.resetPassword.supabaseNotConfigured}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (checkingSession) {
    return <AuthCardSkeleton />;
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
          <PasswordField
            id="newPassword"
            label={authCopy.resetPassword.newPasswordLabel}
            hint={authCopy.login.passwordHint}
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            disabled={loading}
          />
          <PasswordField
            id="confirmPassword"
            label={authCopy.resetPassword.confirmPasswordLabel}
            autoComplete="new-password"
            value={confirm}
            onChange={setConfirm}
            required
            minLength={6}
            disabled={loading}
          />
          {error ? (
            <AuthFormAlert variant="error">{error}</AuthFormAlert>
          ) : null}
          {message ? (
            <AuthFormAlert variant="success">{message}</AuthFormAlert>
          ) : null}
        </CardContent>
        <div className={authFooterClassName}>
          <Button
            type="submit"
            className="h-10 w-full sm:w-auto sm:min-w-[7.5rem]"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {authCopy.resetPassword.saving}
              </>
            ) : (
              authCopy.resetPassword.submit
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
