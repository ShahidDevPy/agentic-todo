import type { ReactNode } from "react";
import { AuthBrand } from "@/components/auth/auth-brand";

type Props = {
  children: ReactNode;
};

export function AuthSplitLayout({ children }: Props) {
  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-2">
      <div className="border-border/50 from-primary/5 via-background to-muted/20 relative hidden overflow-hidden border-r bg-gradient-to-br lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-16 xl:px-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.45 0.18 265 / 0.12), transparent 45%), radial-gradient(circle at 80% 70%, oklch(0.55 0.15 280 / 0.1), transparent 40%)",
          }}
        />
        <div className="relative">
          <AuthBrand variant="hero" />
        </div>
      </div>
      <div className="from-background to-muted/40 flex flex-col items-center justify-center bg-gradient-to-b px-4 py-8 sm:px-6 lg:px-12 lg:py-10">
        <div className="w-full max-w-md space-y-6">
          <AuthBrand variant="compact" className="lg:hidden" />
          {children}
        </div>
      </div>
    </div>
  );
}
