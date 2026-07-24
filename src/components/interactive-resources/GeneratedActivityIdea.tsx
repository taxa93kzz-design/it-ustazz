"use client";

import { Lightbulb } from "lucide-react";
import { createGeneratedIdea } from "@/lib/interactive-resource-mapper";
import type { InteractivePlatform, InteractiveResource, InteractiveSearchInput } from "@/types/interactive-resource";
import { InteractiveResourceCard } from "./InteractiveResourceCard";

export function GeneratedActivityIdea({ input, platform, onAdd }: {
  input: InteractiveSearchInput; platform: InteractivePlatform; onAdd: (resource: InteractiveResource) => void;
}) {
  const idea = createGeneratedIdea(input, platform);
  return <section className="grid gap-3"><h3 className="flex items-center gap-2 font-semibold"><Lightbulb className="size-5 text-amber-500" /> Дайын тапсырма табылмаса</h3><InteractiveResourceCard resource={idea} onAdd={onAdd} /></section>;
}
