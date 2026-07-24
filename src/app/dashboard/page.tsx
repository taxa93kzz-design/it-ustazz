import Link from "next/link";
import { BookOpenCheck, ClipboardCheck, FileText, Library } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const profile = await requireUser();
  const items = [
    { href: "/kmzh", title: "ҚМЖ жасау", icon: BookOpenCheck },
    { href: "/tests", title: "Тест жасау", icon: ClipboardCheck },
    { href: "/tasks", title: "Тапсырма жасау", icon: FileText },
    { href: "/materials", title: "Менің материалдарым", icon: Library },
  ];
  return <><p className="text-sm font-bold text-blue-700">Жеке кабинет</p><h1 className="mt-2 text-3xl font-bold">Қош келдіңіз, {profile.full_name}</h1>{profile.must_change_password && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-amber-800">Қауіпсіздік үшін уақытша парольді профиль бетінде ауыстырыңыз.</p>}<div className="mt-7 grid gap-4 sm:grid-cols-2">{items.map((item) => <Link key={item.href} href={item.href}><Card className="flex items-center gap-4 transition hover:border-blue-300"><item.icon className="size-7 text-blue-600" /><span className="font-bold">{item.title}</span></Card></Link>)}</div></>;
}
