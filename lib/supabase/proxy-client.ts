import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/** Copy auth cookies so session refresh in proxy stays in sync with the browser. */
export function copyResponseCookies(
  from: NextResponse,
  to: NextResponse,
): void {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
}

/**
 * Supabase client for Next.js proxy/middleware.
 * Uses getAll/setAll so chunked auth cookies are written atomically.
 */
export function createSupabaseProxyClient(request: NextRequest): {
  supabase: SupabaseClient | null;
  getResponse: () => NextResponse;
} {
  let response = NextResponse.next({ request });

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    return { supabase: null, getResponse: () => response };
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  return { supabase, getResponse: () => response };
}
