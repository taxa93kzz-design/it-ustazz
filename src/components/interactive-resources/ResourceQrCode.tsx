"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResourceQrCode({ dataUrl, title }: { dataUrl?: string; title: string }) {
  if (!dataUrl) return null;
  return (
    <div className="grid justify-items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt={`${title} QR коды`} className="size-28 rounded-lg border bg-white p-1" />
      <a href={dataUrl} download={`${title.replace(/[^\p{L}\p{N}]+/gu, "-")}-qr.png`}>
        <Button type="button" size="sm" variant="outline"><Download className="size-4" /> QR жүктеу</Button>
      </a>
    </div>
  );
}
