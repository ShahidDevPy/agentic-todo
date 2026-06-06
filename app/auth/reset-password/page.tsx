import { Suspense } from "react";
import { AuthCardSkeleton } from "@/components/auth/auth-card-skeleton";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<AuthCardSkeleton />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
