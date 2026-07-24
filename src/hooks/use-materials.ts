"use client";

import { useCallback, useEffect, useState } from "react";
import { materialStorage } from "@/services/storage";
import type { Material } from "@/types/material";

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try { setMaterials(await materialStorage.getAll()); } catch { setMaterials([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(refresh);
    window.addEventListener("materials-changed", refresh);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("materials-changed", refresh);
    };
  }, [refresh]);

  return { materials, loading, refresh };
}
