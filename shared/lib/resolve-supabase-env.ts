/**
 * Browser-safe public Supabase settings (middleware, client components).
 * Accepts multiple env names used by Supabase / Vercel templates.
 */
export function resolvePublicSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

/** Anon / publishable key (same role for client SDK). */
export function resolvePublicSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    undefined
  );
}
