"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { INTERACTIVE_PLATFORMS } from "@/constants/interactive-platforms";
import { Button } from "@/components/ui/button";
import { validateResourceUrl } from "@/lib/interactive-resource-validator";
import type { InteractivePlatform, InteractiveResource, InteractiveSearchInput } from "@/types/interactive-resource";

export function ManualResourceDialog({ input, onAdd }: { input: InteractiveSearchInput; onAdd: (resource: InteractiveResource) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<InteractivePlatform>(input.platform === "all" ? "wordwall" : input.platform);
  const [error, setError] = useState("");
  const submit = () => {
    if (!title.trim()) return setError("Тапсырма атауын енгізіңіз");
    const result = validateResourceUrl(url);
    if (!result.success) return setError(result.error.issues[0]?.message ?? "Сілтеме қате");
    onAdd({
      id: crypto.randomUUID(), platform, title: title.trim(), url, grade: input.grade, subject: "Информатика",
      topic: input.topic, language: input.language === "all" ? "kk" : input.language, activityType: input.activityType,
      lessonStage: input.lessonStage, durationMinutes: input.durationMinutes,
      descriptors: ["тапсырма шартын түсінеді", "тапсырманы орындайды", "нәтижесін түсіндіреді"],
      source: "manual", verifiedByTeacher: false, createdAt: new Date().toISOString(),
    });
    setOpen(false); setError("");
  };
  return <>
    <Button type="button" variant="outline" onClick={() => setOpen(true)}>Сілтемені қолмен қосу</Button>
    {open && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex justify-between"><h2 className="text-lg font-bold">Ресурсты қолмен қосу</h2><button onClick={() => setOpen(false)} aria-label="Жабу"><X /></button></div>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">Платформа<select value={platform} onChange={(e) => setPlatform(e.target.value as InteractivePlatform)} className="h-11 rounded-xl border px-3">{Object.entries(INTERACTIVE_PLATFORMS).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}</select></label>
          <label className="grid gap-1 text-sm">Тапсырма атауы<input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-xl border px-3" /></label>
          <label className="grid gap-1 text-sm">Сілтеме<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="h-11 rounded-xl border px-3" /></label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="button" onClick={submit}>Тексеруге қосу</Button>
        </div>
      </div>
    </div>}
  </>;
}
