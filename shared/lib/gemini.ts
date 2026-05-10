/** Read per request so callers can load dotenv before first use (e.g. scripts). */
function resolvedModel(): string {
  /** Default: Flash-Lite — lighter usage / cost, good fit for Google AI free tier. */
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";
}

const MAX_429_ATTEMPTS = 4;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Delay before retry from Retry-After header or Gemini error body ("Please retry in 21.5s"). */
function parseRetryDelayMs(res: Response, body: string): number {
  const ra = res.headers.get("retry-after");
  if (ra) {
    const n = parseInt(ra, 10);
    if (!Number.isNaN(n) && n > 0) return Math.min(n * 1000, 120_000);
  }
  const m = body.match(/Please retry in ([\d.]+)\s*s/i);
  if (m?.[1]) {
    const sec = parseFloat(m[1]);
    if (!Number.isNaN(sec) && sec > 0) {
      return Math.min(Math.ceil(sec * 1000), 120_000);
    }
  }
  return 5000;
}

type GenerateContentResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
    blockReasonMessage?: string;
  };
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

function parseSuccessResponse(rawText: string): string | null {
  let json: GenerateContentResponse;
  try {
    json = JSON.parse(rawText) as GenerateContentResponse;
  } catch {
    throw new Error(
      `Gemini API: response was not JSON. First 200 chars: ${rawText.slice(0, 200)}`,
    );
  }

  if (json.error?.message) {
    throw new Error(`Gemini API error: ${json.error.message}`);
  }

  if (json.promptFeedback?.blockReason) {
    const msg = json.promptFeedback.blockReasonMessage ?? "";
    throw new Error(
      `Gemini blocked the prompt (${json.promptFeedback.blockReason}) ${msg}`.trim(),
    );
  }

  const first = json.candidates?.[0];
  const text =
    first?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  const trimmed = text.trim();

  if (!trimmed) {
    const hint =
      json.candidates?.length === 0
        ? "No candidates returned (check safety settings or try a smaller prompt)."
        : "Empty text in response.";
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[gemini]",
        hint,
        "finishReason:",
        first?.finishReason,
        "raw:",
        rawText.slice(0, 400),
      );
    }
    return null;
  }

  return trimmed;
}

/** Returns null when no API key (caller should fall back). */
export async function generateGeminiText(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;

  const model = resolvedModel();

  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.65,
    },
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  let last429Body = "";

  for (let attempt = 0; attempt < MAX_429_ATTEMPTS; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const rawText = await res.text().catch(() => "");

    if (res.status === 429) {
      last429Body = rawText.slice(0, 1200);
      if (attempt < MAX_429_ATTEMPTS - 1) {
        const wait = parseRetryDelayMs(res, rawText);
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[gemini] HTTP 429 (attempt ${attempt + 1}/${MAX_429_ATTEMPTS}), waiting ${wait}ms before retry. ` +
              `If this keeps failing, free-tier quota may be exhausted — see https://ai.google.dev/gemini-api/docs/rate-limits`,
          );
        }
        await sleep(wait);
        continue;
      }
      throw new Error(
        `Gemini API HTTP 429 after ${MAX_429_ATTEMPTS} attempts (model ${model}). ` +
          `Quota or rate limit — check billing / AI Studio usage. Body: ${last429Body.slice(0, 600)}`,
      );
    }

    if (!res.ok) {
      throw new Error(
        `Gemini API HTTP ${res.status} (model ${model}): ${rawText.slice(0, 800)}`,
      );
    }

    return parseSuccessResponse(rawText);
  }

  throw new Error(`Gemini API: unexpected retry loop end (model ${model})`);
}
