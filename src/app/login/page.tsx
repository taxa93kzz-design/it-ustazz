import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { getMissingSupabasePublicVariables, getSupabasePublicConfigIssue } from "@/lib/supabase/config";

export default function LoginPage() {
  const missingVariables = getMissingSupabasePublicVariables();
  const configIssue = getSupabasePublicConfigIssue();
  const configured = configIssue === null;
  return <div className="mx-auto grid min-h-[80vh] max-w-md place-items-center"><section className="w-full rounded-3xl border bg-white p-7 shadow-xl shadow-blue-100"><p className="text-sm font-bold text-blue-700">IT Ustaz</p><h1 className="mt-2 text-2xl font-bold">Жүйеге кіру</h1><p className="mb-6 mt-2 text-sm text-slate-500">Информатика мұғалімінің жеке кабинетіне кіріңіз.</p><Suspense><LoginForm configured={configured} missingVariables={missingVariables} configIssue={configIssue} /></Suspense></section></div>;
}
