import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { buildTaskContextForAssistant } from "@/modules/todo/assistant/build-task-context";
import { executeAssistantIntent } from "@/modules/todo/assistant/execute-intent";
import {
  assistantIntentSchema,
  formatIntentPreview,
  intentRequiresConfirmation,
} from "@/modules/todo/assistant/intent.schema";
import { interpretAssistantCommand } from "@/modules/todo/assistant/interpret-command";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server-route";
import { prisma } from "@/shared/lib/prisma";

const interpretBodySchema = z.object({
  phase: z.literal("interpret"),
  transcript: z.string().min(1).max(2000),
  timeZone: z.string().min(1).max(120).optional(),
});

const executeBodySchema = z.object({
  phase: z.literal("execute"),
  intent: z.unknown(),
  timeZone: z.string().min(1).max(120).optional(),
});

const bodySchema = z.discriminatedUnion("phase", [
  interpretBodySchema,
  executeBodySchema,
]);

async function resolveUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  const supabase = createSupabaseRouteHandlerClient(cookieStore);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export async function POST(request: Request) {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Sign in required" },
      { status: 401 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const timeZone =
    parsed.data.timeZone?.trim() ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "UTC";

  try {
    if (parsed.data.phase === "interpret") {
      const tasks = await buildTaskContextForAssistant(prisma, userId);
      const intent = await interpretAssistantCommand(
        parsed.data.transcript,
        tasks,
        timeZone,
      );
      const preview = formatIntentPreview(intent);
      const requiresConfirmation = intentRequiresConfirmation(intent);
      const assistantMessage =
        intent.action === "clarify"
          ? intent.message
          : requiresConfirmation
            ? `I’ll ${preview.toLowerCase()}. Please confirm.`
            : `Got it — ${preview}.`;

      return NextResponse.json({
        intent,
        preview,
        requiresConfirmation,
        assistantMessage,
      });
    }

    const intentParsed = assistantIntentSchema.safeParse(parsed.data.intent);
    if (!intentParsed.success) {
      return NextResponse.json(
        { error: "Invalid intent" },
        { status: 400 },
      );
    }

    const tasks = await buildTaskContextForAssistant(prisma, userId);
    const intent = intentParsed.data;
    if (
      (intent.action === "update" ||
        intent.action === "toggle" ||
        intent.action === "delete") &&
      !tasks.some((t) => t.id === intent.taskId)
    ) {
      return NextResponse.json(
        { error: "Task not found or no longer available" },
        { status: 404 },
      );
    }

    const result = await executeAssistantIntent(
      prisma,
      userId,
      intent,
      timeZone,
    );

    return NextResponse.json({
      success: true,
      message: result.message,
      summaryMarkdown: result.summaryMarkdown,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Assistant request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
