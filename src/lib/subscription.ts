import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PRICE, WHATSAPP_URL } from "@/constants/subscription";

export class SubscriptionConfigurationError extends Error {
  constructor() {
    super("Жазылым жүйесі бапталмаған. Supabase ішінде 002_ai_subscriptions.sql көшіруін орындаңыз.");
    this.name = "SubscriptionConfigurationError";
  }
}

interface ClaimRow {
  allowed: boolean;
  remaining: number;
  current_status: "trial" | "active" | "expired" | "blocked";
  charged: boolean;
}

export async function claimAiGeneration() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_ai_generation");
  if (error) {
    throw new SubscriptionConfigurationError();
  }
  const result = (data as ClaimRow[] | null)?.[0];
  if (!result) throw new Error("AI лимиті туралы жауап алынбады");
  return result;
}

export async function refundAiGeneration(userId: string, charged: boolean) {
  if (!charged) return;
  const { error } = await createAdminClient().rpc("refund_ai_generation", { target_user: userId });
  if (error) throw new SubscriptionConfigurationError();
}

export function subscriptionRequiredResponse() {
  return {
    error: "2 тегін AI мүмкіндігі аяқталды. Жазылым бағасы — 5000 ₸.",
    code: "SUBSCRIPTION_REQUIRED",
    price: SUBSCRIPTION_PRICE,
    whatsappUrl: WHATSAPP_URL,
  };
}
