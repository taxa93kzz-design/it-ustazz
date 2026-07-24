import { NextResponse } from "next/server";
import { profileUpdateSchema } from "@/lib/auth-schemas";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const parsed = profileUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Сессия мерзімі аяқталған" }, { status: 401 });
  const { error } = await supabase.from("profiles").update({
    full_name: parsed.data.fullName, school_name: parsed.data.schoolName,
  }).eq("id", user.id);
  if (error) return NextResponse.json({ message: "Профильді сақтау мүмкін болмады" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
