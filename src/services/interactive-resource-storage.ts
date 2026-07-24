import type { InteractiveResource } from "@/types/interactive-resource";

const KEY = "it-ustaz-interactive-resources";

export const interactiveResourceStorage = {
  list(): InteractiveResource[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as InteractiveResource[]; } catch { return []; }
  },
  save(resource: InteractiveResource) {
    const items = this.list().filter((item) => item.id !== resource.id);
    localStorage.setItem(KEY, JSON.stringify([resource, ...items]));
  },
  remove(id: string) {
    localStorage.setItem(KEY, JSON.stringify(this.list().filter((item) => item.id !== id)));
  },
};
