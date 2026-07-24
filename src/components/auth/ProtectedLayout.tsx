import { requireUser } from "@/lib/auth";

export async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}
