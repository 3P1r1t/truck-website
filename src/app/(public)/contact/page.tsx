"use client";

import { useMemo } from "react";
import { useProducts, useSettings } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { getSettingValueByLocale } from "@/lib/i18n";
import { buildWhatsAppLink } from "@/lib/utils";
import { ContactMethodCard } from "@/components/public/ContactMethodCard";

export default function ContactPage() {
  const locale = useLocale();
  const { products } = useProducts({ lang: locale, pageSize: 100 });
  const { settings } = useSettings(locale);

  const supportEmail = settings.support_email || "sales@tengyutruck.com";
  const supportPhone = settings.support_phone || "+86-188-0000-0000";
  const whatsappNumber = settings.whatsapp_number || supportPhone;
  const whatsappMessage = getSettingValueByLocale(
    settings,
    "whatsapp_message",
    locale,
    locale === "zh" ? "您好，我想咨询卡车方案。" : "Hello, I would like to discuss truck options."
  );
  const whatsappLink = buildWhatsAppLink(whatsappNumber, whatsappMessage);
  const address = getSettingValueByLocale(settings, "contact_address", locale, "");

  const productOptions = useMemo(
    () => products.map((product) => ({ id: product.id, name: product.name })),
    [products]
  );

  return (
    <div className="bg-slate-50 pb-16">
      <section className="bg-slate-950 py-16 text-white">
        <div className="section-shell">
          <div className="tire-line mb-4" />
          <h1 className="text-5xl font-bold uppercase tracking-tight">{locale === "zh" ? "联系我们" : "Contact Us"}</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            {locale === "zh" ? "选择 WhatsApp 或留下信息，我们会尽快为您匹配方案。" : "Choose WhatsApp or leave your details and we will contact you shortly."}
          </p>
        </div>
      </section>

      <section className="section-shell -mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="industrial-panel p-6">
          <h2 className="text-3xl font-semibold uppercase tracking-tight">{locale === "zh" ? "联系方式" : "Contact Details"}</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p>Email: {supportEmail}</p>
            <p>{locale === "zh" ? "电话" : "Phone"}: {supportPhone}</p>
            {whatsappLink ? (
              <p>
                WhatsApp:{" "}
                <a className="text-primary hover:underline" href={whatsappLink} target="_blank" rel="noreferrer">
                  {whatsappNumber}
                </a>
              </p>
            ) : null}
            <p>{locale === "zh" ? "地址" : "Address"}: {address}</p>
          </div>
        </div>

        <div className="industrial-panel p-6">
          <ContactMethodCard
            title={locale === "zh" ? "提交咨询" : "Send Inquiry"}
            sourceType="GENERAL"
            allowProductSelect
            productOptions={productOptions}
          />
        </div>
      </section>
    </div>
  );
}
