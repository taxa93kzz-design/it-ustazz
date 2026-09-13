import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const updateSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  schoolName: z.string().trim().min(2).max(160).optional(),
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/).optional(),
  role: z.enum(["admin", "teacher"]).optional(),
  isActive: z.boolean().optional(),
  subscriptionAction: z.enum(["activate", "reset_trial"]).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ message: "Рұқсат жоқ" }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  const { id } = await context.params;
  const value = parsed.data;
  const admin = createAdminClient();
  const subscriptionUpdate = value.subscriptionAction === "activate"
    ? { subscription_status: "active", subscription_expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString() }
    : value.subscriptionAction === "reset_trial"
      ? { subscription_status: "trial", trial_generations_used: 0, subscription_expires_at: null }
      : {};
  const { error } = await admin.from("profiles").update({
    ...(value.fullName !== undefined ? { full_name: value.fullName } : {}),
    ...(value.schoolName !== undefined ? { school_name: value.schoolName } : {}),
    ...(value.username !== undefined ? { username: value.username.toLowerCase() } : {}),
    ...(value.role !== undefined ? { role: value.role } : {}),
    ...(value.isActive !== undefined ? { is_active: value.isActive } : {}),
    ...subscriptionUpdate,
  }).eq("id", id);
  if (error) return NextResponse.json({ message: "Өзгерісті сақтау мүмкін болмады" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const current = await requireAdmin();
  if (!current) return NextResponse.json({ message: "Рұқсат жоқ" }, { status: 403 });
  const { id } = await context.params;
  if (id === current.id) return NextResponse.json({ message: "Өз аккаунтыңызды жоя алмайсыз" }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ message: "Қолданушыны жою мүмкін болмады" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
