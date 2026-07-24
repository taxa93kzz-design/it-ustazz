"use client";

import { CheckCircle2, LoaderCircle, PackageOpen, TriangleAlert } from "lucide-react";

export function LoadingState({ text = "Жүктелуде..." }: { text?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 text-slate-500">
      <LoaderCircle className="size-5 animate-spin" /> {text}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div>
        <PackageOpen className="mx-auto mb-3 size-10 text-slate-300" />
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

export function Notice({ type, children }: { type: "success" | "error"; children: React.ReactNode }) {
  return (
    <div
      role="status"
      className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
        type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {type === "success" ? <CheckCircle2 className="size-4" /> : <TriangleAlert className="size-4" />}
      {children}
    </div>
  );
}
