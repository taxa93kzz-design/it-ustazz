import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-6xl font-black text-blue-100">404</p>
        <h1 className="mt-3 text-2xl font-bold">Бет табылмады</h1>
        <p className="mt-2 mb-5 text-slate-500">Сілтеме қате немесе бет жойылған.</p>
        <Button asChild><Link href="/">Басты бетке оралу</Link></Button>
      </div>
    </div>
  );
}
