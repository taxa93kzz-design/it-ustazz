import { NextResponse } from "next/server";
import { z } from "zod";
import { passwordSchema } from "@/lib/auth-schemas";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const parsed = z.object({ password: passwordSchema }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: "Қалпына келтіру сессиясы жарамсыз немесе мерзімі өткен" }, { status: 401 });
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) throw error;
    await createAdminClient().from("profiles").update({ must_change_password: false }).eq("id", user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Парольді өзгерту мүмкін болмады" }, { status: 500 });
  }
}
