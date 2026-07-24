import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSession } from "@/lib/auth";

const idSchema = z.string().uuid();

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  if (!await hasActiveSession()) return NextResponse.json({ message: "Сессия мерзімі аяқталған" }, { status: 401 });
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ message: "Материал идентификаторы қате" }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Сессия мерзімі аяқталған" }, { status: 401 });
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) return NextResponse.json({ message: "Материалды жою мүмкін болмады" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
