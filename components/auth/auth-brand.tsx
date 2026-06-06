import { ListTodo, Sparkles } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { authCopy } from "@/shared/messages/auth-copy";
import { uiCopy } from "@/shared/messages/ui-copy";

type Props = {
  variant?: "compact" | "hero";
  className?: string;
};

export function AuthBrand({ variant = "compact", className }: Props) {
  const hero = variant === "hero";

  return (
    <div
      className={cn(
        hero ? "max-w-md" : "mx-auto w-full max-w-md text-center sm:text-left",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5",
          hero ? "justify-start" : "justify-center sm:justify-start",
        )}
      >
        <Image
          src="/favicon.ico"
          alt=""
          width={hero ? 32 : 28}
          height={hero ? 32 : 28}
          className={cn("shrink-0 rounded-sm", hero ? "size-8" : "size-7")}
          aria-hidden
          unoptimized
        />
        <p
          className={cn(
            "font-semibold tracking-tight",
            hero ? "text-2xl sm:text-3xl" : "text-xl",
          )}
        >
          {uiCopy.appTitle}
        </p>
      </div>
      <p
        className={cn(
          "text-muted-foreground mt-2 text-pretty leading-relaxed",
          hero ? "text-base sm:text-lg" : "text-sm",
        )}
      >
        {uiCopy.appTagline}
      </p>
      {hero ? (
        <ul className="mt-8 space-y-3.5" aria-label="Features">
          {authCopy.login.features.map((feature) => (
            <li
              key={feature}
              className="text-foreground/90 flex items-start gap-3 text-sm leading-snug sm:text-base"
            >
              <span className="bg-primary/10 text-primary mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg">
                {feature.includes("brief") ? (
                  <Sparkles className="size-3.5" aria-hidden />
                ) : (
                  <ListTodo className="size-3.5" aria-hidden />
                )}
              </span>
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
