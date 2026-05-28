import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="from-background to-muted/40 flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b px-4 py-8 sm:px-6 sm:py-10">
      <Suspense
        fallback={
          <div className="text-muted-foreground w-full max-w-md rounded-2xl border border-border/60 bg-card/80 px-5 py-8 text-center text-sm shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] sm:px-6">
            Loading…
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
