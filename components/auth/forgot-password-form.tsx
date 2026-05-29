"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
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

const authCardClassName = cn(
  "w-full max-w-md gap-0 overflow-hidden rounded-2xl border-border/60 py-0 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
);

const authHeaderClassName =
  "border-border/50 space-y-1.5 border-b px-5 pb-4 pt-5 sm:px-6 sm:pt-6";

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const loginHref =
    next && next.startsWith("/")
      ? `/login?next=${encodeURIComponent(next)}`
      : "/login";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!isSupabaseConfigured()) {
        setError("Supabase is not configured.");
        return;
      }
      const trimmed = email.trim();
      if (!trimmed) {
        setError("Enter your email address.");
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
            Reset unavailable
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
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={sent}
              className="h-10"
            />
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {authCopy.forgotPassword.googleHint}
          </p>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          {sent ? (
            <p className="text-muted-foreground text-sm" role="status">
              {authCopy.forgotPassword.success}
            </p>
          ) : null}
        </CardContent>
        <div className="border-border/50 flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <Button
            type="submit"
            className="h-10 w-full sm:w-auto sm:min-w-[7.5rem]"
            disabled={loading || sent}
          >
            {loading
              ? authCopy.forgotPassword.sending
              : authCopy.forgotPassword.submit}
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
