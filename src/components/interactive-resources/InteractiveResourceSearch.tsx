"use client";

import { useState } from "react";
import { Notice } from "@/components/feedback";
import { Card } from "@/components/ui/card";
import type { InteractivePlatform, InteractiveResource, InteractiveSearchInput } from "@/types/interactive-resource";
import { GeneratedActivityIdea } from "./GeneratedActivityIdea";
import { InteractiveResourceForm } from "./InteractiveResourceForm";
import { InteractiveResourceList } from "./InteractiveResourceList";
import { ManualResourceDialog } from "./ManualResourceDialog";

export function InteractiveResourceSearch({ defaults, onAdd }: {
  defaults: Partial<InteractiveSearchInput>; onAdd: (resource: InteractiveResource) => void;
}) {
  const [input, setInput] = useState<InteractiveSearchInput | null>(null);
  const [resources, setResources] = useState<InteractiveResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const search = async (values: InteractiveSearchInput) => {
    setInput(values); setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/interactive-resources/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json() as { resources?: InteractiveResource[]; message?: string };
      setResources(data.resources ?? []); setMessage(data.message ?? "");
    } catch {
      setResources([]); setMessage("Іздеу қызметі уақытша қолжетімсіз. Сілтемені қолмен қосуға болады.");
    } finally { setLoading(false); }
  };
  return <Card className="no-print mt-6 grid gap-5 border-blue-100 bg-blue-50/40 p-5">
    <div><p className="text-sm font-semibold text-blue-700">Цифрлық оқу ресурстары</p><h2 className="text-xl font-bold">Интерактивті тапсырмалар</h2><p className="text-sm text-slate-600">Ресурсты қарап, мазмұнын тексергеннен кейін ғана ҚМЖ-ға қосыңыз.</p></div>
    <InteractiveResourceForm defaults={defaults} loading={loading} onSubmit={search} />
    {message && <Notice type={resources.length ? "success" : "error"}>{message}</Notice>}
    {resources.length > 0 && <InteractiveResourceList resources={resources} onAdd={onAdd} />}
    {input && <div className="flex"><ManualResourceDialog input={input} onAdd={(resource) => setResources((items) => [resource, ...items])} /></div>}
    {input && <GeneratedActivityIdea input={input} platform={(input.platform === "all" ? "wordwall" : input.platform) as InteractivePlatform} onAdd={onAdd} />}
  </Card>;
}
