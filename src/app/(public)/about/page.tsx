"use client";

import { useSettings } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { getSettingValueByLocale } from "@/lib/i18n";

export default function AboutPage() {
  const locale = useLocale();
  const { settings } = useSettings(locale);

  const intro = getSettingValueByLocale(
    settings,
    "about_intro",
    locale,
    "We provide integrated procurement and support for commercial fleets."
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-3 text-3xl font-bold">{locale === "zh" ? "关于我们" : "About Us"}</h1>
      <p className="mb-10 text-muted-foreground">{intro}</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            titleEn: "Industry Experience",
            titleZh: "行业经验",
            bodyEn: "Focused on international truck sourcing and export support.",
            bodyZh: "专注国际卡车采购与出口支持。",
          },
          {
            titleEn: "Reliable Supply",
            titleZh: "稳定供应",
            bodyEn: "Cooperate with trusted manufacturers and partners.",
            bodyZh: "与可靠制造商和合作伙伴长期协作。",
          },
          {
            titleEn: "Service Response",
            titleZh: "服务响应",
            bodyEn: "Fast response from inquiry to technical coordination.",
            bodyZh: "从询盘到技术沟通提供快速响应。",
          },
        ].map((item) => (
          <div key={item.titleEn} className="rounded border p-5">
            <h2 className="text-lg font-semibold">{locale === "zh" ? item.titleZh : item.titleEn}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{locale === "zh" ? item.bodyZh : item.bodyEn}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
