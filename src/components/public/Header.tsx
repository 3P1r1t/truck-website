"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { getSettingValueByLocale, Locale } from "@/lib/i18n";

function withLang(path: string, locale: Locale) {
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

export function Header() {
  const locale = useLocale();
  const { settings } = useSettings(locale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const siteName = getSettingValueByLocale(settings, "header_title", locale, "Truck Showcase");

  const navItems = [
    { href: "/", label: t(locale, "nav_home") },
    { href: "/products", label: t(locale, "nav_products") },
    { href: "/articles", label: t(locale, "nav_articles") },
    { href: "/about", label: t(locale, "nav_about") },
    { href: "/contact", label: t(locale, "nav_contact") },
  ];

  const switchLang = (nextLocale: Locale) => {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLocale);
    document.cookie = `site_lang=${nextLocale}; path=/; max-age=31536000`;
    window.location.href = url.toString();
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={withLang("/", locale)} className="flex items-center gap-2">
          <Truck className="h-6 w-6" />
          <span className="text-lg font-bold">{siteName}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={withLang(item.href, locale)} className="text-sm text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
          <Button size="sm" asChild>
            <Link href={withLang("/contact", locale)}>{t(locale, "nav_quote")}</Link>
          </Button>
          <div className="flex items-center rounded border">
            <button
              className={`px-2 py-1 text-xs ${locale === "en" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => switchLang("en")}
            >
              EN
            </button>
            <button
              className={`px-2 py-1 text-xs ${locale === "zh" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => switchLang("zh")}
            >
              中文
            </button>
          </div>
        </nav>

        <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link key={item.href} href={withLang(item.href, locale)} onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Button size="sm" asChild>
              <Link href={withLang("/contact", locale)} onClick={() => setMobileOpen(false)}>
                {t(locale, "nav_quote")}
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button size="sm" variant={locale === "en" ? "default" : "outline"} onClick={() => switchLang("en")}>
                EN
              </Button>
              <Button size="sm" variant={locale === "zh" ? "default" : "outline"} onClick={() => switchLang("zh")}>
                中文
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
