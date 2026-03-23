"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Truck } from "lucide-react";
import { useSettings } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { getSettingValueByLocale, Locale } from "@/lib/i18n";

function withLang(path: string, locale: Locale) {
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

export function Footer() {
  const locale = useLocale();
  const { settings } = useSettings(locale);

  const siteName = getSettingValueByLocale(settings, "site_title", locale, "Truck Showcase");
  const copyright = getSettingValueByLocale(
    settings,
    "footer_copyright_text",
    locale,
    `${siteName}. All rights reserved.`
  );
  const email = settings.support_email || "support@example.com";
  const phone = settings.support_phone || "+1-000-000-0000";
  const address = getSettingValueByLocale(settings, "contact_address", locale, "");

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-10 md:grid-cols-4">
        <div className="space-y-2">
          <Link href={withLang("/", locale)} className="flex items-center gap-2 font-semibold">
            <Truck className="h-5 w-5" />
            {siteName}
          </Link>
          <p className="text-sm text-muted-foreground">{getSettingValueByLocale(settings, "home_hero_subtitle", locale, "")}</p>
        </div>

        <div>
          <h4 className="mb-2 font-semibold">{t(locale, "nav_products")}</h4>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <Link href={withLang("/products", locale)}>{t(locale, "nav_products")}</Link>
            <Link href={withLang("/articles", locale)}>{t(locale, "nav_articles")}</Link>
            <Link href={withLang("/about", locale)}>{t(locale, "nav_about")}</Link>
            <Link href={withLang("/contact", locale)}>{t(locale, "nav_contact")}</Link>
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-semibold">Contact</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {phone}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {email}
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4" />
              <span>{address}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-semibold">Admin</h4>
          <div className="text-sm text-muted-foreground">
            <Link href="/login">/login</Link>
          </div>
        </div>
      </div>
      <div className="border-t px-4 py-3 text-center text-xs text-muted-foreground">{copyright}</div>
    </footer>
  );
}
