import { NextResponse, type NextRequest } from "next/server";
import {
  copyResponseCookies,
  createSupabaseProxyClient,
} from "@/lib/supabase/proxy-client";

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/auth")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/_next")) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { supabase, getResponse } = createSupabaseProxyClient(request);

  if (!supabase) {
    return getResponse();
  }

  const pathname = request.nextUrl.pathname;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionResponse = getResponse();

  if (!user && !isPublicPath(pathname)) {
    const login = new URL("/login", request.url);
    const nextPath = `${pathname}${request.nextUrl.search}`;
    login.searchParams.set("next", nextPath || "/");
    const redirectResponse = NextResponse.redirect(login);
    copyResponseCookies(sessionResponse, redirectResponse);
    return redirectResponse;
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
