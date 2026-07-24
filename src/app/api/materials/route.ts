import { NextResponse } from "next/server";
import { materialInputSchema } from "@/lib/auth-schemas";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSession } from "@/lib/auth";

export async function GET() {
  if (!await hasActiveSession()) return NextResponse.json({ message: "Сессия мерзімі аяқталған" }, { status: 401 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Сессия мерзімі аяқталған" }, { status: 401 });
  const { data, error } = await supabase.from("materials").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ message: "Материалдарды жүктеу мүмкін болмады" }, { status: 500 });
  return NextResponse.json({ materials: data });
}

export async function POST(request: Request) {
  if (!await hasActiveSession()) return NextResponse.json({ message: "Сессия мерзімі аяқталған" }, { status: 401 });
  const parsed = materialInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Сессия мерзімі аяқталған" }, { status: 401 });
  const input = parsed.data;
  const { data, error } = await supabase.from("materials").upsert({
    ...(input.id ? { id: input.id } : {}),
    user_id: user.id, type: input.type, title: input.title, grade: input.grade,
    topic: input.topic, content: input.content, updated_at: new Date().toISOString(),
  }).select().single();
  if (error) return NextResponse.json({ message: "Материалды сақтау мүмкін болмады" }, { status: 500 });
  return NextResponse.json({ material: data });
}
