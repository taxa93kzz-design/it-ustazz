import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeOrigin } from "@/lib/safe-origin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextValue = url.searchParams.get("next") ?? "/reset-password";
  const next = nextValue.startsWith("/") && !nextValue.startsWith("//") ? nextValue : "/reset-password";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${getSafeOrigin(request.url)}${next}`);
  }
  return NextResponse.redirect(`${getSafeOrigin(request.url)}/login?error=recovery`);
}
