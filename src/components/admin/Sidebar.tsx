"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, FileText, MessageSquare, Settings, Users, LogOut } from "lucide-react";
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
  const locale = useLocale();
  const router = useRouter();

  const items = [
    { href: "/admin/dashboard", label: t(locale, "admin_dashboard"), icon: LayoutDashboard },
    { href: "/admin/products", label: t(locale, "admin_products"), icon: Package },
    { href: "/admin/articles", label: t(locale, "admin_articles"), icon: FileText },
    { href: "/admin/inquiries", label: t(locale, "admin_inquiries"), icon: MessageSquare },
    { href: "/admin/settings", label: t(locale, "admin_settings"), icon: Settings },
    { href: "/admin/users", label: t(locale, "admin_users"), icon: Users },
  ];

  return (
    <aside className="w-64 border-r bg-muted/20">
      <div className="border-b p-4 text-lg font-semibold">{t(locale, "admin_panel")}</div>
      <nav className="space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={withLang(item.href, locale)}
              className={cn(
                "flex items-center gap-2 rounded px-3 py-2 text-sm",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <button
          className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          onClick={() => {
            clearAdminToken();
            router.push(withLang("/admin/login", locale));
          }}
        >
          <LogOut className="h-4 w-4" />
          {t(locale, "admin_logout")}
        </button>
      </div>
    </aside>
  );
}
