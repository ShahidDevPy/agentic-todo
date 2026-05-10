/**
 * Quick check that GEMINI_API_KEY + GEMINI_MODEL work with the Google Generative Language API.
 *
 * Usage (from repo root):
 *   npm run test:gemini
 *
 * Loads `.env.local` then `.env`. Dynamic-imports Gemini **after** dotenv so MODEL/KEY are visible.
 */

import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function main() {
  const { generateGeminiText } = await import("../shared/lib/gemini");

  const key = process.env.GEMINI_API_KEY?.trim();
  const model =
    process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";

  console.log("--- Gemini API smoke test ---");
  console.log(
    "Loaded GEMINI_API_KEY:",
    key ? `yes (length ${key.length})` : "NO — add to .env.local or .env",
  );
  console.log("Model:", model);
  console.log("");

  if (!key) {
    console.error(
      "Set GEMINI_API_KEY in .env.local (recommended) or .env, then run again.",
    );
    process.exit(1);
  }

  try {
    const text = await generateGeminiText(
      'Reply with exactly one word: "pong"',
    );
    if (!text?.trim()) {
      console.error("Empty response. In dev, check server/gemini logs for raw API body.");
      process.exit(1);
    }
    console.log("Success. Model replied:");
    console.log(text);
    console.log(
      "\nIf this works but the app still shows “Template”, restart `npm run dev` and turn off “Template only (no AI)” on Daily Brief.",
    );
  } catch (e) {
    console.error("Request failed:");
    console.error(e);
    console.log("\nCommon fixes:");
    console.log("- Key from https://aistudio.google.com/apikey (Google AI Studio).");
    console.log("- Try GEMINI_MODEL=gemini-2.0-flash or gemini-2.5-flash-lite");
    console.log("- Restart `npm run dev` after editing .env.local.");
    process.exit(1);
  }
}

void main();
