import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getMissingSupabasePublicVariables, getSupabasePublicConfigIssue } from "./config";

const protectedPrefixes = ["/dashboard", "/lesson-plans", "/kmzh", "/tests", "/worksheets", "/worksheet", "/materials", "/profile", "/admin"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const missing = getMissingSupabasePublicVariables();
  const configIssue = getSupabasePublicConfigIssue();
  if (configIssue) {
    if (protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      login.searchParams.set("error", "config");
      if (missing.length) login.searchParams.set("missing", missing.join(","));
      else login.searchParams.set("invalid", "NEXT_PUBLIC_SUPABASE_URL");
      return NextResponse.redirect(login);
    }
    return response;
  }
  const supabase = createServerClient(url!, publishableKey!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, {
          ...options, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
        }));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  if (!user && isProtected) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  if (user && request.nextUrl.pathname === "/login") {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/dashboard";
    dashboard.search = "";
    return NextResponse.redirect(dashboard);
  }
  return response;
}
