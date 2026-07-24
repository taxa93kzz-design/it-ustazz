import { ForgotPasswordForm } from "@/components/auth/PasswordForm";
export default function ForgotPasswordPage() {
  return <div className="mx-auto grid min-h-[80vh] max-w-md place-items-center"><section className="w-full rounded-3xl border bg-white p-7"><h1 className="text-2xl font-bold">Парольді қалпына келтіру</h1><p className="mb-6 mt-2 text-sm text-slate-500">Аккаунт email мекенжайын енгізіңіз.</p><ForgotPasswordForm /></section></div>;
}
