"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  authCardClassName,
  authFooterClassName,
  authHeaderClassName,
} from "@/components/auth/auth-card-styles";
import { AuthFormAlert } from "@/components/auth/auth-form-alert";
import { GoogleIcon } from "@/components/auth/google-icon";
import { PasswordField } from "@/components/auth/password-field";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PROFILE_FIRST_NAME_KEY,
  PROFILE_LAST_NAME_KEY,
} from "@/lib/auth/profile-meta";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { authCopy } from "@/shared/messages/auth-copy";

type Mode = "signIn" | "signUp";

function redirectHint(next: string): string | null {
  if (next === "/tasks") return authCopy.login.redirectHintTasks;
  if (next === "/") return authCopy.login.redirectHintBrief;
  return null;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const authError = searchParams.get("error");
  const emailRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    authError === "auth" ? authCopy.login.authCallbackError : null,
  );

  const formDisabled = loading || oauthLoading;
  const hint = redirectHint(next.startsWith("/") ? next : "/");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace(next.startsWith("/") ? next : "/");
      }
    });
  }, [next, router]);

  useEffect(() => {
    if (mode === "signUp") {
      firstNameRef.current?.focus();
    } else {
      emailRef.current?.focus();
    }
  }, [mode]);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setMessage(null);
  }

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setMessage(null);
    setMode("signIn");
    if (!isSupabaseConfigured()) {
      setError(authCopy.login.supabaseNotConfigured);
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
        setError(authCopy.login.supabaseNotConfigured);
        return;
      }
      const supabase = getSupabaseBrowserClient();
      const trimmed = email.trim();
      if (!trimmed || !password) {
        setError(authCopy.login.enterEmailPassword);
        return;
      }
      if (mode === "signUp") {
        const fn = firstName.trim();
        const ln = lastName.trim();
        if (!fn || !ln) {
          setError(authCopy.login.enterName);
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
              setError(authCopy.login.emailAlreadyRegistered);
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
            setError(authCopy.login.emailAlreadyRegistered);
            setMode("signIn");
            return;
          }
          if (data.user && !data.session) {
            setMessage(authCopy.login.checkEmailConfirm);
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
            {authCopy.login.unavailableTitle}
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
      <CardHeader className={cn(authHeaderClassName, "space-y-3")}>
        <Tabs value={mode} onValueChange={(value) => switchMode(value as Mode)}>
          <TabsList className="h-10 w-full">
            <TabsTrigger value="signIn" disabled={formDisabled}>
              {authCopy.login.signInTab}
            </TabsTrigger>
            <TabsTrigger value="signUp" disabled={formDisabled}>
              {authCopy.login.signUpTab}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <CardDescription className="text-pretty">
          {mode === "signIn"
            ? authCopy.login.signInDescription
            : authCopy.login.signUpDescription}
        </CardDescription>
        {hint ? (
          <p className="text-muted-foreground text-xs leading-relaxed">
            {hint}
          </p>
        ) : null}
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4 px-5 pb-2 pt-4 sm:px-6 sm:pt-5">
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full border-border/80 bg-background font-normal dark:border-input dark:bg-card"
              disabled={formDisabled}
              onClick={() => void signInWithGoogle()}
              aria-label={authCopy.login.continueWithGoogle}
            >
              {oauthLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {authCopy.login.redirectingGoogle}
                </>
              ) : (
                <>
                  <GoogleIcon className="size-5" />
                  {authCopy.login.continueWithGoogle}
                </>
              )}
            </Button>
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-muted-foreground shrink-0 text-xs">
                {authCopy.login.orEmail}
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
                  {authCopy.login.firstNameLabel}
                </label>
                <Input
                  ref={firstNameRef}
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={mode === "signUp"}
                  disabled={formDisabled}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium leading-none"
                >
                  {authCopy.login.lastNameLabel}
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={mode === "signUp"}
                  disabled={formDisabled}
                  className="h-10"
                />
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              {authCopy.login.emailLabel}
            </label>
            <Input
              ref={emailRef}
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={formDisabled}
              className="h-10"
            />
          </div>
          <PasswordField
            id="password"
            label={authCopy.login.passwordLabel}
            hint={mode === "signUp" ? authCopy.login.passwordHint : undefined}
            autoComplete={
              mode === "signIn" ? "current-password" : "new-password"
            }
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            disabled={formDisabled}
            labelExtra={
              mode === "signIn" ? (
                <Link
                  href={`/login/forgot-password?next=${encodeURIComponent(next.startsWith("/") ? next : "/")}`}
                  className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
                >
                  {authCopy.login.forgotPassword}
                </Link>
              ) : undefined
            }
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
            disabled={formDisabled}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {authCopy.login.pleaseWait}
              </>
            ) : mode === "signIn" ? (
              authCopy.login.signInSubmit
            ) : (
              authCopy.login.signUpSubmit
            )}
          </Button>
          {mode === "signUp" ? (
            <p className="text-muted-foreground text-center text-xs leading-relaxed sm:text-left">
              {authCopy.login.signUpTrust}
            </p>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
