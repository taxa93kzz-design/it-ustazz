"use client";

import { Crown, MessageCircle, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FREE_AI_GENERATIONS,
  SUBSCRIPTION_PRICE,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/constants/subscription";

interface SubscriptionCardProps {
  role: "admin" | "teacher";
  status?: "trial" | "active" | "expired";
  used?: number;
  expiresAt?: string | null;
}

export function SubscriptionCard({ role, status = "trial", used = 0, expiresAt }: SubscriptionCardProps) {
  const [remaining, setRemaining] = useState(Math.max(0, FREE_AI_GENERATIONS - used));
  const [showPayment, setShowPayment] = useState(false);
  const active = role === "admin" || status === "active";

  useEffect(() => {
    const update = (event: Event) => setRemaining(Math.max(0, (event as CustomEvent<{ remaining: number }>).detail.remaining));
    const requirePayment = () => { setRemaining(0); setShowPayment(true); };
    window.addEventListener("ai-usage-updated", update);
    window.addEventListener("subscription-required", requirePayment);
    return () => {
      window.removeEventListener("ai-usage-updated", update);
      window.removeEventListener("subscription-required", requirePayment);
    };
  }, []);

  return <>
    <div className="m-4 rounded-2xl bg-slate-950 p-4 text-white">
      {active ? <Crown className="mb-3 size-5 text-amber-300" /> : <Sparkles className="mb-3 size-5 text-blue-300" />}
      <p className="text-sm font-semibold">{active ? "AI жазылымы белсенді" : `${remaining} тегін AI мүмкіндік қалды`}</p>
      <p className="mt-1 text-xs leading-5 text-slate-300">
        {active
          ? (role === "admin" ? "Әкімшіге толық қолжетімділік берілген." : `Мерзімі: ${expiresAt ? new Date(expiresAt).toLocaleDateString("kk-KZ") : "шектеусіз"}`)
          : `Алғашқы ${FREE_AI_GENERATIONS} AI генерация тегін. Кейін айына ${SUBSCRIPTION_PRICE.toLocaleString("kk-KZ")} ₸.`}
      </p>
      {!active && <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-xs font-bold hover:bg-green-600">
        <MessageCircle className="size-4" /> Жазылымға қосылу
      </a>}
    </div>
    {showPayment && <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="Жазылым қажет">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
        <button onClick={() => setShowPayment(false)} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full hover:bg-slate-100" aria-label="Жабу"><X className="size-5" /></button>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Crown className="size-7" /></span>
        <h2 className="mt-4 text-2xl font-bold text-slate-950">Тегін мүмкіндік аяқталды</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Сіз 2 тегін AI генерацияны пайдаландыңыз. IT Ustaz қызметін жалғастыру үшін жазылымды қосыңыз.</p>
        <p className="mt-4 text-3xl font-black text-blue-700">5 000 ₸ <span className="text-sm font-medium text-slate-500">/ ай</span></p>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-green-500 font-bold text-white hover:bg-green-600"><MessageCircle className="size-5" /> WhatsApp: {WHATSAPP_DISPLAY}</a>
        <p className="mt-3 text-xs text-slate-500">Хабарламада аккаунтыңыздың логинін көрсетіңіз.</p>
      </div>
    </div>}
  </>;
}

