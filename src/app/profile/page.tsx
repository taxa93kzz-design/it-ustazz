import { ProfileForm } from "@/components/auth/ProfileForm";
import { ResetPasswordForm } from "@/components/auth/PasswordForm";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const profile = await requireUser();
  return <><p className="text-sm font-bold text-blue-700">Аккаунт</p><h1 className="mt-2 text-3xl font-bold">Профиль</h1><p className="mb-6 mt-2 text-slate-500">{profile.email}</p><ProfileForm profile={profile} /><section className="mt-6 max-w-xl rounded-2xl border bg-white p-5"><h2 className="mb-4 text-lg font-bold">Парольді өзгерту</h2><ResetPasswordForm /></section></>;
}
