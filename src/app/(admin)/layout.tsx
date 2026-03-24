"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminMessageProvider } from "@/components/admin/AdminMessageProvider";
import { getAdminToken } from "@/lib/api";
import { localeFromClient } from "@/lib/i18n";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login" || pathname === "/login";

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    const token = getAdminToken();
    if (!token) {
      const lang = localeFromClient();
      router.replace(`/admin/login?lang=${lang}`);
    }
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <AdminMessageProvider>
          <main className="flex-1 bg-gradient-to-b from-slate-100 to-slate-50 p-5">{children}</main>
        </AdminMessageProvider>
      </div>
    </div>
  );
}
