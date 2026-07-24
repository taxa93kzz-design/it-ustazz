import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSafeOrigin } from "@/lib/safe-origin";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ message: "Рұқсат жоқ" }, { status: 403 });
  const { id } = await context.params;
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("email").eq("id", id).single();
  if (!data?.email) return NextResponse.json({ message: "Қолданушы табылмады" }, { status: 404 });
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo: `${getSafeOrigin(request.url)}/auth/callback?next=/reset-password` });
  if (error) return NextResponse.json({ message: "Сілтемені жіберу мүмкін болмады" }, { status: 500 });
  return NextResponse.json({ message: "Қалпына келтіру сілтемесі жіберілді" });
}
