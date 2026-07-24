import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) return <section className="rounded-2xl border border-red-200 bg-red-50 p-8"><p className="text-sm font-bold text-red-700">403</p><h1 className="mt-2 text-2xl font-bold">Бұл бөлімге кіруге рұқсатыңыз жоқ</h1></section>;
  return children;
}
