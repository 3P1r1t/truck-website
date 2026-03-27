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
    "Tengyu International Truck Factory specializes in remanufacturing commercial vehicles and trailers for engineering and logistics scenarios."
  );
  const aboutImage = settings.about_image_url || "";
  const profileKicker = getSettingValueByLocale(
    settings,
    "about_profile_kicker",
    locale,
    locale === "zh" ? "企业介绍" : "Company Profile"
  );
  const profileTitle = getSettingValueByLocale(
    settings,
    "about_profile_title",
    locale,
    locale === "zh" ? "腾宇商用车再制造" : "Tengyu Remanufacturing System"
  );

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
    <div className="bg-slate-50 pb-16">
      <section className="bg-slate-950 py-16 text-white">
        <div className="section-shell">
          <div className="tire-line mb-4" />
          <h1 className="text-5xl font-bold uppercase tracking-tight">{locale === "zh" ? "关于我们" : "About Us"}</h1>
          <p className="mt-5 max-w-4xl text-slate-300">{intro}</p>
        </div>
      </section>

      <section className="section-shell -mt-8">
        <div className="industrial-panel overflow-hidden">
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 md:items-center md:p-8">
            <div>
              <p className="industrial-kicker text-2xl">{profileKicker}</p>
              <h2 className="mt-3 text-m leading-7 text-slate-600">{profileTitle}</h2>
            </div>
            {aboutImage ? (
              <div className="rounded-sm border border-slate-200 bg-white p-4 md:p-6">
                <div className="mx-auto w-full max-w-[593px]">
                  <Image
                    src={aboutImage}
                    alt={locale === "zh" ? "关于我们图片" : "About image"}
                    width={593}
                    height={467}
                    className="h-auto w-full object-contain"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-shell mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((item) => (
          <article key={item.title} className="industrial-panel p-6">
            <h3 className="text-2xl font-semibold uppercase tracking-tight">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">{item.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
