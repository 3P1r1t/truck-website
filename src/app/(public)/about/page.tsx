"use client";

import Image from "next/image";
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
    "Tengyu International Truck Factory specializes in remanufacturing a wide range of commercial vehicles and trailers, including dump trucks, tractor trucks, and tankers. We provide high-performance and durable customized solutions for construction, transportation, and engineering projects."
  );
  const aboutImage = settings.about_image_url || "";

  const cards = [
    {
      title: getSettingValueByLocale(settings, "about_card_1_title", locale, locale === "zh" ? "质量连接你我" : "Quality Connects Us"),
      body: getSettingValueByLocale(
        settings,
        "about_card_1_body",
        locale,
        locale === "zh"
          ? "我们坚持严格质量标准，每台交付车辆都经过完整检测与审核。"
          : "Every delivered commercial vehicle goes through strict testing and auditing before handover."
      ),
    },
    {
      title: getSettingValueByLocale(settings, "about_card_2_title", locale, locale === "zh" ? "再制造能力" : "Remanufacturing Capability"),
      body: getSettingValueByLocale(
        settings,
        "about_card_2_body",
        locale,
        locale === "zh"
          ? "覆盖整车清洗、底盘检修、发动机与变速箱再制造、线路检测及易损件更换。"
          : "Our process includes deep cleaning, chassis repair, engine and transmission remanufacturing, circuit checks, and component replacement."
      ),
    },
    {
      title: getSettingValueByLocale(settings, "about_card_3_title", locale, locale === "zh" ? "定制化方案" : "Customized Solutions"),
      body: getSettingValueByLocale(
        settings,
        "about_card_3_body",
        locale,
        locale === "zh"
          ? "可按场景定制自卸车、牵引车、搅拌车、罐车及挂车配置，精准匹配业务需求。"
          : "We tailor dump trucks, tractor heads, mixers, tankers, and trailers to match specific business scenarios."
      ),
    },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-3 text-3xl font-bold">{locale === "zh" ? "关于我们" : "About Us"}</h1>

      <div className="mb-10 overflow-hidden rounded border">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-xl font-semibold">{locale === "zh" ? "公司介绍" : "Company Profile"}</h2>
            <p className="mt-2 text-muted-foreground">{intro}</p>
          </div>
          {aboutImage ? (
            <div className="relative h-56 overflow-hidden rounded border bg-muted md:h-64">
              <Image src={aboutImage} alt={locale === "zh" ? "关于我们图片" : "About image"} fill className="object-cover" />
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((item) => (
          <div key={item.title} className="rounded border p-5">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
