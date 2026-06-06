import type { ReactNode } from "react";
import { AuthBrand } from "@/components/auth/auth-brand";

type Props = {
  children: ReactNode;
};

export function AuthPageShell({ children }: Props) {
  return (
    <div className="from-background to-muted/40 flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b px-4 py-8 sm:px-6 sm:py-10">
      <div className="w-full max-w-md space-y-6">
        <AuthBrand variant="compact" />
        {children}
      </div>
    </div>
  );
}
