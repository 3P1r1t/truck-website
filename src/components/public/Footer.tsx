"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSettings } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { getSettingValueByLocale, withLangPath } from "@/lib/i18n";
import { buildWhatsAppLink } from "@/lib/utils";

export function Footer() {
  const locale = useLocale();
  const { settings } = useSettings(locale);

  const siteName = getSettingValueByLocale(settings, "site_title", locale, "Tengyu Commercial Vehicles");
  const copyright = getSettingValueByLocale(
    settings,
    "footer_copyright_text",
    locale,
    `${siteName}. All rights reserved.`
  );
  const email = settings.support_email || "sales@tengyutruck.com";
  const phone = settings.support_phone || "+86-188-0000-0000";
  const whatsappNumber = settings.whatsapp_number || phone;
  const whatsappMessage = getSettingValueByLocale(
    settings,
    "whatsapp_message",
    locale,
    locale === "zh" ? "您好，我想咨询卡车方案。" : "Hello, I would like to discuss truck options."
  );
  const whatsappLink = buildWhatsAppLink(whatsappNumber, whatsappMessage);
  const address = getSettingValueByLocale(settings, "contact_address", locale, "");

  return (
    <footer className="border-t border-white/10 bg-black text-slate-400">
      <div className="section-shell grid grid-cols-1 gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5 md:col-span-2">
          <span className="inline-flex rounded-sm bg-white px-2 py-1">
            <Image src="/tengyu.png" alt="Tengyu" width={170} height={46} className="h-9 w-auto" />
          </span>
          <p className="max-w-md text-sm leading-7">
            {getSettingValueByLocale(
              settings,
              "home_hero_subtitle",
              locale,
              locale === "zh"
                ? "腾宇专注商用车再制造与全球交付服务，为不同运输场景提供可靠方案。"
                : "Tengyu focuses on remanufactured commercial vehicles and global delivery for demanding logistics scenarios."
            )}
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
            {locale === "zh" ? "导航" : "Navigation"}
          </h4>
          <div className="space-y-3 text-[11px] font-semibold uppercase tracking-[0.15em]">
            <Link href={withLangPath("/products", locale)} className="block hover:text-primary">
              {t(locale, "nav_products")}
            </Link>
            <Link href={withLangPath("/#solutions", locale)} className="block hover:text-primary">
              {t(locale, "nav_solutions")}
            </Link>
            <Link href={withLangPath("/about", locale)} className="block hover:text-primary">
              {t(locale, "nav_about")}
            </Link>
            <Link href={withLangPath("/contact", locale)} className="block hover:text-primary">
              {t(locale, "nav_contact")}
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">{t(locale, "footer_contact")}</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>{phone}</span>
            </div>
            {whatsappLink ? (
              <a className="flex items-center gap-2 hover:text-primary" href={whatsappLink} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span>{whatsappNumber}</span>
              </a>
            ) : null}
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>{email}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <span>{address}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-slate-500">{copyright}</div>
    </footer>
  );
}
