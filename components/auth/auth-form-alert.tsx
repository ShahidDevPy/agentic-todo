import { cn } from "@/lib/utils";

type Props = {
  variant: "error" | "success";
  children: React.ReactNode;
  className?: string;
};

export function AuthFormAlert({ variant, children, className }: Props) {
  const isError = variant === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm leading-relaxed",
        isError
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-border/60 bg-muted/40 text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
