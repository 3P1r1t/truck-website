"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { getSettingValueByLocale, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function withLang(path: string, locale: Locale) {
  const [pathname, hash] = path.split("#");
  const base = `${pathname}${pathname.includes("?") ? "&" : "?"}lang=${locale}`;
  return hash ? `${base}#${hash}` : base;
}

export function Header() {
  const locale = useLocale();
  const { settings } = useSettings(locale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash || "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const siteName = getSettingValueByLocale(settings, "header_title", locale, "Tengyu Commercial Vehicles");
  const topNotice = getSettingValueByLocale(
    settings,
    "header_top_notice",
    locale,
    locale === "zh" ? "TENGYU GLOBAL: 服务覆盖 50+ 国家与地区" : "TENGYU GLOBAL: OPERATING IN 50+ COUNTRIES"
  );
  const supportPhone = settings.support_phone || "+86-188-0000-0000";

  const navItems = [
    { href: "/", label: t(locale, "nav_home") },
    { href: "/products", label: t(locale, "nav_products") },
    { href: "/#solutions", label: t(locale, "nav_solutions") },
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
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
      <div className="hidden border-b border-slate-800/30 bg-slate-950 text-[10px] uppercase tracking-[0.2em] text-slate-300 md:block">
        <div className="section-shell flex h-9 items-center justify-between">
          <span>{topNotice}</span>
          <span className="inline-flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" />
            {supportPhone}
          </span>
        </div>
      </div>

      <div className="section-shell flex h-20 items-center justify-between">
        <Link href={withLang("/", locale)} className="flex items-center gap-3">
          <span className="inline-flex rounded-sm border border-slate-200 bg-white px-2 py-1">
            <Image src="/tengyu.png" alt={siteName} width={164} height={48} className="h-9 w-auto md:h-10" priority />
          </span>
          <span className="hidden h-6 border-l border-slate-300 sm:block" />
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 sm:block">
            {locale === "zh" ? "工业制造" : "Industrial Excellence"}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.2em] lg:flex">
          {navItems.map((item) => {
            let active = false;
            if (item.href === "/") {
              active = pathname === "/" && currentHash !== "#solutions";
            } else if (item.href === "/#solutions") {
              active = pathname === "/" && currentHash === "#solutions";
            } else {
              active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            }

            return (
              <Link
                key={item.href}
                href={withLang(item.href, locale)}
                className={cn("transition-colors", active ? "text-primary" : "text-slate-600 hover:text-primary")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <div className="rounded-sm border border-slate-200 bg-slate-50 p-0.5 text-[10px] font-semibold uppercase tracking-widest">
            <button
              className={cn("px-2.5 py-1 transition-colors", locale === "en" ? "bg-primary text-white" : "text-slate-600")}
              onClick={() => switchLang("en")}
            >
              EN
            </button>
            <button
              className={cn("px-2.5 py-1 transition-colors", locale === "zh" ? "bg-primary text-white" : "text-slate-600")}
              onClick={() => switchLang("zh")}
            >
              中文
            </button>
          </div>
          <Button asChild className="rounded-sm bg-primary px-6 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-primary/90">
            <Link href={withLang("/contact", locale)}>{t(locale, "nav_quote")}</Link>
          </Button>
        </div>

        <button className="rounded-sm border border-slate-200 p-2 text-slate-700 lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="section-shell space-y-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={withLang(item.href, locale)}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-slate-100 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button size="sm" variant={locale === "en" ? "default" : "outline"} onClick={() => switchLang("en")}>
                  EN
                </Button>
                <Button size="sm" variant={locale === "zh" ? "default" : "outline"} onClick={() => switchLang("zh")}>
                  中文
                </Button>
              </div>
              <Button size="sm" asChild>
                <Link href={withLang("/contact", locale)} onClick={() => setMobileOpen(false)}>
                  {t(locale, "nav_quote")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
