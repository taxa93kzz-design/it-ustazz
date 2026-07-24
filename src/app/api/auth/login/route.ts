import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { loginSchema } from "@/lib/auth-schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkLoginRateLimit, clearLoginAttempts } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      message: "Supabase сервері бапталмаған. .env.local файлына қажетті үш айнымалыны енгізіңіз.",
    }, { status: 503 });
  }
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
    const headerStore = await headers();
    const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const key = `${ip}:${parsed.data.identifier.toLowerCase()}`;
    const limit = checkLoginRateLimit(key);
    if (!limit.allowed) return NextResponse.json({ message: `Көп әрекет жасалды. ${limit.retryAfter} секундтан кейін қайталаңыз.` }, { status: 429 });

    let email = parsed.data.identifier;
    if (!email.includes("@")) {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY) {
        return NextResponse.json({ message: "Логинмен кіру үшін серверлік Supabase secret key бапталмаған. Email қолданыңыз." }, { status: 503 });
      }
      const admin = createAdminClient();
      const { data } = await admin.from("profiles").select("email,is_active").eq("username", email.toLowerCase()).maybeSingle();
      if (!data) return NextResponse.json({ message: "Логин немесе пароль қате" }, { status: 401 });
      if (!data.is_active) return NextResponse.json({ message: "Бұл аккаунт бұғатталған" }, { status: 403 });
      email = data.email;
    }
    const supabase = await createClient(parsed.data.remember);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
    if (error || !data.user) return NextResponse.json({ message: "Логин немесе пароль қате" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("is_active").eq("id", data.user.id).single();
    if (!profile?.is_active) {
      await supabase.auth.signOut();
      return NextResponse.json({ message: "Бұл аккаунт бұғатталған" }, { status: 403 });
    }
    if (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY) {
      await createAdminClient().from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", data.user.id);
    }
    clearLoginAttempts(key);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Сервермен байланысу мүмкін болмады" }, { status: 503 });
  }
}
