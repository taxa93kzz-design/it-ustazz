import { NextResponse } from "next/server";
import { emailSchema } from "@/lib/auth-schemas";
import { createClient } from "@/lib/supabase/server";
import { getSafeOrigin } from "@/lib/safe-origin";

export async function POST(request: Request) {
  const message = "Егер бұл email жүйеде тіркелген болса, қалпына келтіру сілтемесі жіберілді";
  try {
    const parsed = emailSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
    const origin = getSafeOrigin(request.url);
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${origin}/auth/callback?next=/reset-password` });
  } catch {}
  return NextResponse.json({ message });
}
