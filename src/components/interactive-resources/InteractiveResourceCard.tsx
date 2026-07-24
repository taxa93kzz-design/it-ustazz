"use client";

import { CheckCircle2, ExternalLink, Plus, QrCode, Trash2 } from "lucide-react";
import { useState } from "react";
import { INTERACTIVE_PLATFORMS } from "@/constants/interactive-platforms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateResourceQr } from "@/lib/qr-code-generator";
import type { InteractiveResource } from "@/types/interactive-resource";
import { ResourceQrCode } from "./ResourceQrCode";

export function InteractiveResourceCard({ resource, onAdd, onDelete }: {
  resource: InteractiveResource; onAdd?: (resource: InteractiveResource) => void; onDelete?: () => void;
}) {
  const [verified, setVerified] = useState(resource.verifiedByTeacher);
  const [qr, setQr] = useState(resource.qrDataUrl);
  const [urlStatus, setUrlStatus] = useState("");
  const isReady = resource.source !== "generated-idea" && !resource.title.includes("платформасында іздеу");
  const prepareQr = async () => setQr(await generateResourceQr(resource.url));
  return (
    <Card className="grid gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{INTERACTIVE_PLATFORMS[resource.platform].name}</span>
          <h3 className="mt-2 font-semibold text-slate-900">{resource.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{resource.description}</p>
        </div>
        <span className="text-xs text-slate-500">{resource.grade}-сынып · {resource.language} · {resource.activityType}</span>
      </div>
      {!isReady && <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">Дайын тапсырма емес — платформа беті немесе тапсырма идеясы.</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => {
          try {
            const parsed = new URL(resource.url);
            setUrlStatus(parsed.protocol === "https:" ? "Сілтеме пішімі дұрыс. Мазмұнын жаңа бетте тексеріңіз." : "Қауіпсіз HTTPS сілтемесін таңдаған дұрыс.");
          } catch { setUrlStatus("Сілтеме жарамсыз."); }
        }}><CheckCircle2 className="size-4" /> Сілтемені тексеру</Button>
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          <Button type="button" size="sm" variant="outline"><ExternalLink className="size-4" /> {resource.source === "generated-idea" ? "Платформада жасау" : "Алдын ала қарау"}</Button>
        </a>
        <Button type="button" size="sm" variant="outline" onClick={prepareQr}><QrCode className="size-4" /> QR жасау</Button>
        {onDelete && <Button type="button" size="sm" variant="outline" onClick={onDelete}><Trash2 className="size-4" /> Жою</Button>}
      </div>
      {urlStatus && <p className="text-xs text-slate-600">{urlStatus}</p>}
      {qr && <ResourceQrCode dataUrl={qr} title={resource.title} />}
      {onAdd && (
        <>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} className="mt-1" />
            Сілтемені ҚМЖ-ға қоспас бұрын оның мазмұнын тексердім
          </label>
          <Button type="button" disabled={!verified} onClick={() => onAdd({ ...resource, verifiedByTeacher: true, qrDataUrl: qr, includeQr: Boolean(qr) })}>
            {verified ? <CheckCircle2 className="size-4" /> : <Plus className="size-4" />} ҚМЖ-ға қосу
          </Button>
        </>
      )}
    </Card>
  );
}
