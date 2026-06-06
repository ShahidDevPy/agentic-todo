import { Suspense } from "react";
import { AuthCardSkeleton } from "@/components/auth/auth-card-skeleton";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<AuthCardSkeleton />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
