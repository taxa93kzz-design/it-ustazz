import { NextResponse } from "next/server";
import { createUserSchema } from "@/lib/auth-schemas";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ message: "Рұқсат жоқ" }, { status: 403 });
  const admin = createAdminClient();
  const { data, error } = await admin.from("profiles").select("id,email,username,full_name,school_name,role,is_active,created_at,last_login_at,subscription_status,trial_generations_used,subscription_expires_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ message: "Қолданушылар жүктелмеді" }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ message: "Рұқсат жоқ" }, { status: 403 });
  const parsed = createUserSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  const input = parsed.data;
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email, password: input.password, email_confirm: true,
    user_metadata: { username: input.username.toLowerCase(), full_name: input.fullName, school_name: input.schoolName, role: input.role },
  });
  if (error || !data.user) return NextResponse.json({ message: error?.message ?? "Қолданушы ашылмады" }, { status: 400 });
  const { error: profileError } = await admin.from("profiles").update({
    username: input.username.toLowerCase(), full_name: input.fullName, school_name: input.schoolName,
    role: input.role, is_active: true, must_change_password: true,
  }).eq("id", data.user.id);
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ message: "Логин бұрын тіркелген болуы мүмкін" }, { status: 409 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
