import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { getCurrentProfile } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "IT Ustaz", template: "%s | IT Ustaz" },
  description: "Информатика мұғалімінің цифрлық көмекшісі",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile().catch(() => null);
  return (
    <html lang="kk" data-scroll-behavior="smooth">
      <body>
        <AppShell profile={profile}>{children}</AppShell>
      </body>
    </html>
  );
}
