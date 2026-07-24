"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <TriangleAlert className="mx-auto mb-4 size-12 text-red-500" />
        <h2 className="text-xl font-bold">Бірдеңе дұрыс болмады</h2>
        <p className="mt-2 mb-5 text-sm text-slate-500">Бетті қайта жүктеп көріңіз.</p>
        <Button onClick={reset}>Қайталап көру</Button>
      </div>
    </div>
  );
}
