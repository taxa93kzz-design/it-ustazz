"use client";

import type { InteractiveResource } from "@/types/interactive-resource";
import { InteractiveResourceCard } from "./InteractiveResourceCard";

export function InteractiveResourceList({ resources, onAdd, onDelete }: {
  resources: InteractiveResource[]; onAdd?: (resource: InteractiveResource) => void; onDelete?: (id: string) => void;
}) {
  if (!resources.length) return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">Интерактивті ресурс әлі қосылған жоқ.</p>;
  return <div className="grid gap-4 lg:grid-cols-2">{resources.map((resource) =>
    <InteractiveResourceCard key={resource.id} resource={resource} onAdd={onAdd} onDelete={onDelete ? () => onDelete(resource.id) : undefined} />,
  )}</div>;
}
