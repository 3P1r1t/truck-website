"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, MessageSquare, Settings, Users, LogOut } from "lucide-react";
import { clearAdminToken } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { cn } from "@/lib/utils";
import { Locale } from "@/lib/i18n";

function withLang(path: string, locale: Locale) {
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

export function Sidebar() {
  const pathname = usePathname();
  const locale = useLocale("zh");
  const router = useRouter();

  const items = [
    { href: "/admin/dashboard", label: locale === "zh" ? "仪表盘" : "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: t(locale, "admin_products"), icon: Package },
    { href: "/admin/inquiries", label: t(locale, "admin_inquiries"), icon: MessageSquare },
    { href: "/admin/settings", label: t(locale, "admin_settings"), icon: Settings },
    { href: "/admin/users", label: t(locale, "admin_users"), icon: Users },
  ];

  return (
    <aside className="flex w-20 flex-col border-r border-white/10 bg-slate-950 text-slate-200 md:w-72">
      <div className="border-b border-white/10 px-3 py-4 md:px-5 md:py-6">
        <span className="hidden rounded-sm bg-white px-2 py-1 md:inline-flex"><Image src="/tengyu.png" alt="Tengyu" width={170} height={44} className="h-9 w-auto" /></span>
        <span className="mx-auto block text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">TY</span>
        <p className="mt-3 hidden text-[10px] uppercase tracking-[0.2em] text-slate-500 md:block">
          {locale === "zh" ? "管理后台" : "Admin Console"}
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-2 md:p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={withLang(item.href, locale)}
              className={cn(
                "flex items-center justify-center gap-3 rounded-sm px-2 py-2.5 text-sm transition md:justify-start md:px-3",
                active ? "bg-primary text-white" : "text-slate-300 hover:bg-white/10"
              )}
              title={item.label}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden font-medium md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2 md:p-3">
        <button
          className="flex w-full items-center justify-center gap-3 rounded-sm px-2 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 md:justify-start md:px-3"
          onClick={() => {
            clearAdminToken();
            router.push(withLang("/admin/login", locale));
          }}
          title={t(locale, "admin_logout")}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">{t(locale, "admin_logout")}</span>
        </button>
      </div>
    </aside>
  );
}

