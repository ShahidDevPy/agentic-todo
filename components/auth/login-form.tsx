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
import { Separator } from "@/components/ui/separator";
import {
  PROFILE_FIRST_NAME_KEY,
  PROFILE_LAST_NAME_KEY,
} from "@/lib/auth/profile-meta";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { authCopy } from "@/shared/messages/auth-copy";

type Mode = "signIn" | "signUp";

const authCardClassName = cn(
  "w-full max-w-md gap-0 overflow-hidden rounded-2xl border-border/60 py-0 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
);

const authHeaderClassName =
  "border-border/50 space-y-1.5 border-b px-5 pb-4 pt-5 sm:px-6 sm:pt-6";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    authError === "auth" ? "Could not complete sign-in. Try again." : null,
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace(next.startsWith("/") ? next : "/");
      }
    });
  }, [next, router]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setMessage(null);
    setMode("signIn");
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured.");
      return;
    }
    setOauthLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const origin = window.location.origin;
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (err) setError(err.message);
    } finally {
      setOauthLoading(false);
    }
  }, [next]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setMessage(null);
      if (!isSupabaseConfigured()) {
        setError("Supabase is not configured.");
        return;
      }
      const supabase = getSupabaseBrowserClient();
      const trimmed = email.trim();
      if (!trimmed || !password) {
        setError("Enter email and password.");
        return;
      }
      if (mode === "signUp") {
        const fn = firstName.trim();
        const ln = lastName.trim();
        if (!fn || !ln) {
          setError("Enter your first and last name.");
          return;
        }
      }
      setLoading(true);
      try {
        if (mode === "signIn") {
          const { error: err } = await supabase.auth.signInWithPassword({
            email: trimmed,
            password,
          });
          if (err) {
            setError(err.message);
            return;
          }
        } else {
          const fn = firstName.trim();
          const ln = lastName.trim();
          const origin = window.location.origin;
          const { data, error: err } = await supabase.auth.signUp({
            email: trimmed,
            password,
            options: {
              emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
              data: {
                [PROFILE_FIRST_NAME_KEY]: fn,
                [PROFILE_LAST_NAME_KEY]: ln,
              },
            },
          });
          if (err) {
            const msg = err.message.toLowerCase();
            if (
              msg.includes("already registered") ||
              msg.includes("already been registered") ||
              msg.includes("already exists") ||
              msg.includes("user already registered")
            ) {
              setError(
                "This email is already registered. Sign in instead, or use Google.",
              );
              setMode("signIn");
              return;
            }
            setError(err.message);
            return;
          }
          if (
            data.user &&
            Array.isArray(data.user.identities) &&
            data.user.identities.length === 0
          ) {
            setError(
              "This email is already registered. Sign in instead, or use Google.",
            );
            setMode("signIn");
            return;
          }
          if (data.user && !data.session) {
            setMessage(
              "Check your email to confirm your account, then sign in.",
            );
            setMode("signIn");
            return;
          }
        }
        router.replace(next.startsWith("/") ? next : "/");
        router.refresh();
      } finally {
        setLoading(false);
      }
    },
    [email, password, mode, next, router, firstName, lastName],
  );

  if (!isSupabaseConfigured()) {
    return (
      <Card className={cn(authCardClassName, "border-dashed")}>
        <CardHeader className={authHeaderClassName}>
          <CardTitle className="text-lg sm:text-xl">
            Sign in unavailable
          </CardTitle>
          <CardDescription>
            Add{" "}
            <code className="text-foreground rounded bg-muted px-1 py-0.5 text-xs">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="text-foreground rounded bg-muted px-1 py-0.5 text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            to{" "}
            <code className="text-foreground rounded bg-muted px-1 py-0.5 text-xs">
              .env.local
            </code>
            , then restart the dev server.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={authCardClassName}>
      <CardHeader className={authHeaderClassName}>
        <CardTitle className="text-lg sm:text-xl">
          {mode === "signIn" ? "Sign in" : "Create account"}
        </CardTitle>
        <CardDescription className="text-pretty">
          {mode === "signIn"
            ? "Sign in with the email and password for your workspace."
            : "We’ll save your name to your profile so the app can greet you by first name."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4 px-5 pb-2 pt-4 sm:px-6 sm:pt-5">
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full border-border/80 bg-background font-normal"
              disabled={loading || oauthLoading}
              onClick={() => void signInWithGoogle()}
              aria-label="Continue with Google"
            >
              {oauthLoading ? (
                "Redirecting…"
              ) : (
                <>
                  <span className="mr-2 inline-flex size-5 items-center justify-center rounded-sm bg-[#4285F4] text-[11px] font-bold text-white">
                    G
                  </span>
                  Continue with Google
                </>
              )}
            </Button>
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-muted-foreground shrink-0 text-xs">
                or email
              </span>
              <Separator className="flex-1" />
            </div>
          </div>
          {mode === "signUp" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium leading-none"
                >
                  First name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={mode === "signUp"}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium leading-none"
                >
                  Last name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={mode === "signUp"}
                  className="h-10"
                />
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
              >
                Password
              </label>
              {mode === "signIn" ? (
                <Link
                  href={`/login/forgot-password?next=${encodeURIComponent(next.startsWith("/") ? next : "/")}`}
                  className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
                >
                  {authCopy.login.forgotPassword}
                </Link>
              ) : null}
            </div>
            <Input
              id="password"
              type="password"
              autoComplete={
                mode === "signIn" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <p className="text-muted-foreground text-sm">{message}</p>
          ) : null}
        </CardContent>
        <div className="border-border/50 flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <Button
            type="submit"
            className="h-10 w-full sm:w-auto sm:min-w-[7.5rem]"
            disabled={loading || oauthLoading}
          >
            {loading
              ? "Please wait…"
              : mode === "signIn"
                ? "Sign in"
                : "Sign up"}
          </Button>
          <button
            type="button"
            className={cn(
              "text-muted-foreground hover:text-foreground text-center text-sm underline-offset-4 hover:underline sm:text-left",
            )}
            onClick={() => {
              setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
              setError(null);
              setMessage(null);
            }}
          >
            {mode === "signIn"
              ? "Need an account? Sign up"
              : "Have an account? Sign in"}
          </button>
        </div>
      </form>
    </Card>
  );
}
