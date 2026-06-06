"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  authCardClassName,
  authFooterClassName,
  authHeaderClassName,
} from "@/components/auth/auth-card-styles";
import { AuthFormAlert } from "@/components/auth/auth-form-alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildPasswordResetRedirectUrl } from "@/lib/auth/password";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { authCopy } from "@/shared/messages/auth-copy";

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const loginHref =
    next && next.startsWith("/")
      ? `/login?next=${encodeURIComponent(next)}`
      : "/login";
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!isSupabaseConfigured()) {
        setError(authCopy.forgotPassword.supabaseNotConfigured);
        return;
      }
      const trimmed = email.trim();
      if (!trimmed) {
        setError(authCopy.forgotPassword.enterEmail);
        return;
      }
      setLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();
        const redirectTo = buildPasswordResetRedirectUrl(
          window.location.origin,
        );
        const { error: err } = await supabase.auth.resetPasswordForEmail(
          trimmed,
          { redirectTo },
        );
        if (err) {
          setError(err.message);
          return;
        }
        setSent(true);
      } finally {
        setLoading(false);
      }
    },
    [email],
  );

  if (!isSupabaseConfigured()) {
    return (
      <Card className={cn(authCardClassName, "border-dashed")}>
        <CardHeader className={authHeaderClassName}>
          <CardTitle className="text-lg sm:text-xl">
            {authCopy.forgotPassword.unavailableTitle}
          </CardTitle>
          <CardDescription>
            Configure Supabase env vars in{" "}
            <code className="text-foreground rounded bg-muted px-1 py-0.5 text-xs">
              .env.local
            </code>{" "}
            and restart the dev server.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={authCardClassName}>
      <CardHeader className={authHeaderClassName}>
        <CardTitle className="text-lg sm:text-xl">
          {authCopy.forgotPassword.title}
        </CardTitle>
        <CardDescription className="text-pretty">
          {authCopy.forgotPassword.description}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4 px-5 pb-2 pt-4 sm:px-6 sm:pt-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              {authCopy.forgotPassword.emailLabel}
            </label>
            <Input
              ref={emailRef}
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={sent || loading}
              className="h-10"
            />
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {authCopy.forgotPassword.googleHint}
          </p>
          {error ? (
            <AuthFormAlert variant="error">{error}</AuthFormAlert>
          ) : null}
          {sent ? (
            <AuthFormAlert variant="success">
              {authCopy.forgotPassword.success}
            </AuthFormAlert>
          ) : null}
        </CardContent>
        <div
          className={cn(
            authFooterClassName,
            "sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <Button
            type="submit"
            className="h-10 w-full sm:w-auto sm:min-w-[7.5rem]"
            disabled={loading || sent}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {authCopy.forgotPassword.sending}
              </>
            ) : (
              authCopy.forgotPassword.submit
            )}
          </Button>
          <Link
            href={loginHref}
            className="text-muted-foreground hover:text-foreground text-center text-sm underline-offset-4 hover:underline sm:text-left"
          >
            {authCopy.forgotPassword.backToSignIn}
          </Link>
        </div>
      </form>
    </Card>
  );
}
