import type { Material } from "@/types/material";

interface DatabaseMaterial {
  id: string; type: Material["type"]; title: string; grade: string; topic: string;
  content: Record<string, unknown>; created_at: string; updated_at: string;
}

function mapMaterial(item: DatabaseMaterial): Material {
  return { id: item.id, type: item.type, title: item.title, grade: item.grade, topic: item.topic, content: item.content, createdAt: item.created_at, updatedAt: item.updated_at };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? "Сұрау орындалмады");
  return data as T;
}

export const materialStorage = {
  async getAll() {
    const data = await request<{ materials: DatabaseMaterial[] }>("/api/materials");
    return data.materials.map(mapMaterial);
  },
  async get(id: string) {
    return (await this.getAll()).find((item) => item.id === id);
  },
  async save(material: Material) {
    const data = await request<{ material: DatabaseMaterial }>("/api/materials", {
      method: "POST",
      body: JSON.stringify({ id: material.id, type: material.type, title: material.title, grade: material.grade, topic: material.topic ?? "", content: material.content }),
    });
    window.dispatchEvent(new Event("materials-changed"));
    return mapMaterial(data.material);
  },
  async remove(id: string) {
    await request(`/api/materials/${id}`, { method: "DELETE" });
    window.dispatchEvent(new Event("materials-changed"));
  },
  async duplicate(id: string) {
    const source = await this.get(id);
    if (!source) return;
    return this.save({ ...source, id: crypto.randomUUID(), title: `${source.title} (көшірме)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  },
};
