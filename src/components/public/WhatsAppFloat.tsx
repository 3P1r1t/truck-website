"use client";

import { MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/api";
import { getSettingValueByLocale } from "@/lib/i18n";
import { t } from "@/lib/site-dictionary";
import { useLocale } from "@/lib/use-locale";
import { buildWhatsAppLink } from "@/lib/utils";

export function WhatsAppFloat() {
  const locale = useLocale();
  const { settings } = useSettings(locale);

  const number = settings.whatsapp_number || settings.support_phone || "";
  const message = getSettingValueByLocale(
    settings,
    "whatsapp_message",
    locale,
    locale === "zh" ? "您好，我想咨询车辆方案。" : "Hello, I would like to discuss truck options."
  );
  const link = buildWhatsAppLink(number, message);

  if (!link) {
    return null;
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-green-700"
      aria-label={t(locale, "contact_start_whatsapp")}
      title={t(locale, "contact_start_whatsapp")}
    >
      <MessageCircle className="h-4 w-4" />
      <span>{t(locale, "contact_whatsapp")}</span>
    </a>
  );
}
