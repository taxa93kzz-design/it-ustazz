import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type UserRole = "admin" | "teacher";
export interface CurrentProfile {
  id: string; email: string; username: string; full_name: string; school_name: string;
  role: UserRole; is_active: boolean; must_change_password: boolean;
  subscription_status?: "trial" | "active" | "expired";
  trial_generations_used?: number;
  subscription_expires_at?: string | null;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data as CurrentProfile | null;
}

export async function requireUser() {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_active) redirect("/login");
  return profile;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile?.is_active || profile.role !== "admin") return null;
  return profile;
}

export async function hasActiveSession() {
  const profile = await getCurrentProfile();
  return Boolean(profile?.is_active);
}
