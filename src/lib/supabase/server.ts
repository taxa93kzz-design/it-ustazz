import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "./config";

export async function createClient(remember = true) {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicConfig();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, {
            ...options,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
          }));
        } catch {
          // Server Components cookie жаңарта алмайды; middleware сессияны жаңартады.
        }
      },
    },
  });
}
