"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductCard } from "@/components/public/ProductCard";
import { ContactMethodCard } from "@/components/public/ContactMethodCard";
import { useProducts, useSettings } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { getSettingValueByLocale, Locale } from "@/lib/i18n";

function withLang(path: string, locale: Locale) {
  const [pathname, hash] = path.split("#");
  const base = `${pathname}${pathname.includes("?") ? "&" : "?"}lang=${locale}`;
  return hash ? `${base}#${hash}` : base;
}

function safeColor(input: string | undefined, fallback: string) {
  const value = (input || "").trim();
  if (!value) return fallback;
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return value;
  if (/^(rgb|rgba|hsl|hsla)\(/.test(value)) return value;
  if (/^[a-zA-Z]{3,20}$/.test(value)) return value;
  return fallback;
}

function isVideoAsset(url: string) {
  const normalized = url.split("?")[0].split("#")[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov|m4v|avi)$/.test(normalized);
}

type SolutionBlock = {
  title: string;
  desc: string;
};

const SOLUTION_DEFAULTS: Record<Locale, SolutionBlock[]> = {
  en: [
    {
      title: "Urban Distribution",
      desc: "Optimized for city routes with flexible body configurations and efficient fuel strategy.",
    },
    {
      title: "Cross-Border Logistics",
      desc: "Stable long-haul platform with remote diagnostics and strong uptime management.",
    },
    {
      title: "Heavy Construction",
      desc: "Reinforced chassis and high torque output for complex engineering and mining environments.",
    },
  ],
  zh: [
    {
      title: "城市配送",
      desc: "适配城市多场景运输，支持灵活上装与高效油耗策略。",
    },
    {
      title: "跨境干线",
      desc: "长途工况稳定可靠，支持远程诊断和持续出勤管理。",
    },
    {
      title: "工程重载",
      desc: "强化底盘与高扭矩输出，适配矿区和重型工程作业。",
    },
  ],
};

export default function HomePage() {
  const locale = useLocale();
  const { settings } = useSettings(locale);
  const { products } = useProducts({ lang: locale, featured: true, pageSize: 6 });

  const legacyHeroTitle = getSettingValueByLocale(settings, "home_hero_title", locale, "Driving Your Success Forward");
  const [legacyLine1, legacyLine2] = legacyHeroTitle.split("\n");
  const heroLine1 = getSettingValueByLocale(
    settings,
    "home_hero_title_line1",
    locale,
    legacyLine1 || (locale === "zh" ? "驱动" : "Driving Your")
  );
  const heroLine2 = getSettingValueByLocale(
    settings,
    "home_hero_title_line2",
    locale,
    legacyLine2 || (locale === "zh" ? "成功前行" : "Success Forward")
  );
  const heroLine1Color = safeColor(settings.home_hero_title_line1_color, "#FFFFFF");
  const heroLine2Color = safeColor(settings.home_hero_title_line2_color, "#8B1D21");

  const heroSubtitle = getSettingValueByLocale(
    settings,
    "home_hero_subtitle",
    locale,
    "Tengyu provides remanufactured commercial vehicles and reliable fleet solutions for global transport companies."
  );
  const defaultHeroImage =
    "https://images.unsplash.com/photo-1592417817098-8fd3d7dbe115?auto=format&fit=crop&w=1920&q=80";
  const heroMediaUrl = (settings.home_hero_image_url || "").trim() || "/Home-background.mp4";
  const heroIsVideo = isVideoAsset(heroMediaUrl);

  const capabilityTitle = getSettingValueByLocale(
    settings,
    "home_capability_title",
    locale,
    locale === "zh" ? "核心能力" : "Core Capabilities"
  );
  const capabilitySubtitle = getSettingValueByLocale(
    settings,
    "home_capability_subtitle",
    locale,
    locale === "zh" ? "以再制造体系和工程能力支撑全球运输业务。"
      : "Powered by remanufacturing standards and engineering delivery for global fleets."
  );

  const solutionDefaults = SOLUTION_DEFAULTS[locale];
  const solutionsKicker = getSettingValueByLocale(
    settings,
    "home_solutions_kicker",
    locale,
    locale === "zh" ? "行业方案" : "Sector Expertise"
  );
  const solutionsTitle = getSettingValueByLocale(
    settings,
    "home_solutions_title",
    locale,
    locale === "zh" ? "场景化运输解决方案" : "Industry-Specific Solutions"
  );
  const learnMoreText = getSettingValueByLocale(
    settings,
    "home_solutions_learn_more",
    locale,
    t(locale, "solution_learn_more")
  );
  const solutionDialogTitle = getSettingValueByLocale(
    settings,
    "home_solutions_dialog_title",
    locale,
    t(locale, "solution_dialog_title")
  );

  const solutionBlocks = useMemo(
    () =>
      [1, 2, 3].map((index) => ({
        title: getSettingValueByLocale(
          settings,
          `home_solution_${index}_title`,
          locale,
          solutionDefaults[index - 1]?.title || ""
        ),
        desc: getSettingValueByLocale(
          settings,
          `home_solution_${index}_desc`,
          locale,
          solutionDefaults[index - 1]?.desc || ""
        ),
      })),
    [settings, locale, solutionDefaults]
  );

  const [activeSolution, setActiveSolution] = useState<SolutionBlock | null>(null);
  const [heroContactOpen, setHeroContactOpen] = useState(false);

  return (
    <div>
      <section className="relative min-h-[82vh] overflow-hidden bg-slate-950 text-white">
        {heroIsVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={defaultHeroImage}
          >
            <source src={heroMediaUrl} />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroMediaUrl || defaultHeroImage})` }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(78deg,rgba(15,23,42,0.9)_0%,rgba(15,23,42,0.36)_60%)]"
        />
        <div className="section-shell relative z-10 flex min-h-[82vh] items-center py-24">
          <div className="max-w-3xl space-y-7">
            <div className="tire-line" />
            <h1 className="text-5xl font-bold uppercase leading-[1.05] tracking-tight md:text-7xl">
              <span className="block" style={{ color: heroLine1Color }}>
                {heroLine1}
              </span>
              <span className="mt-1 block italic" style={{ color: heroLine2Color }}>
                {heroLine2}
              </span>
            </h1>
            <p className="max-w-2xl text-lg text-slate-200 md:text-xl">{heroSubtitle}</p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild className="rounded-sm bg-white px-8 py-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900 hover:bg-primary hover:text-white">
                <Link href={withLang("/products", locale)}>
                  {t(locale, "hero_cta_primary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-sm border-white/40 bg-white/5 px-8 py-6 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-white/15"
                onClick={() => setHeroContactOpen(true)}
              >
                <span className="relative mr-2 inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                {t(locale, "hero_cta_secondary")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-24">
        <div className="section-shell">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="tire-line mb-4" />
              <p className="industrial-kicker">{locale === "zh" ? "旗舰车型" : "Flagship Fleet"}</p>
              <h2 className="mt-2 text-4xl font-bold uppercase tracking-tight">
                {locale === "zh" ? "为性能而生" : "Engineered for Performance"}
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-sm border-slate-300 bg-white text-xs font-semibold uppercase tracking-[0.16em]">
              <Link href={withLang("/products", locale)}>{t(locale, "hero_cta_primary")}</Link>
            </Button>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500">{t(locale, "empty_products")}</p>
          )}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="section-shell">
          <div className="mb-10 max-w-3xl">
            <div className="tire-line mb-4" />
            <h2 className="text-4xl font-bold uppercase tracking-tight">{capabilityTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">{capabilitySubtitle}</p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                num: "01",
                title: locale === "zh" ? "智能动力总成" : "Smart Powertrain",
                desc:
                  locale === "zh"
                    ? "通过工况感知与动力匹配策略，帮助客户在复杂路况下控制油耗。"
                    : "Powertrain matching strategy helps optimize fuel consumption in demanding road conditions.",
              },
              {
                num: "02",
                title: locale === "zh" ? "全程状态管理" : "Connected Uptime",
                desc:
                  locale === "zh"
                    ? "远程诊断与维保节奏联动，减少计划外停机。"
                    : "Remote diagnostics and maintenance rhythm reduce unplanned downtime.",
              },
              {
                num: "03",
                title: locale === "zh" ? "多能源能力" : "Multi-Energy Vision",
                desc:
                  locale === "zh"
                    ? "覆盖传统燃油与新能源方案，兼顾效率与可持续运营。"
                    : "Support both diesel and new energy options for performance and sustainability goals.",
              },
            ].map((item) => (
              <div key={item.num}>
                <p className="text-5xl font-bold italic text-slate-100">{item.num}</p>
                <h3 className="mt-3 border-l-4 border-primary pl-4 text-2xl font-semibold uppercase tracking-tight">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="bg-white py-24">
        <div className="section-shell">
          <div className="mb-12">
            <div className="tire-line mb-4" />
            <p className="industrial-kicker">{solutionsKicker}</p>
            <h2 className="mt-2 text-4xl font-bold uppercase tracking-tight">{solutionsTitle}</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {solutionBlocks.map((item) => (
              <article key={item.title} className="industrial-panel overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-slate-900 to-slate-700" />
                <div className="space-y-4 p-6">
                  <h3 className="text-2xl font-semibold uppercase tracking-tight">{item.title}</h3>
                  <p className="text-sm leading-7 text-slate-500">{item.desc}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-sm text-xs font-semibold uppercase tracking-[0.14em]"
                    onClick={() => setActiveSolution(item)}
                  >
                    {learnMoreText}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={heroContactOpen} onOpenChange={setHeroContactOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <span className="relative mr-2 inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              {t(locale, "hero_cta_secondary")}
            </DialogTitle>
          </DialogHeader>
          <ContactMethodCard
            sourceType="GENERAL"
            contextNote={locale === "zh" ? "首页 Contact Us 按钮咨询" : "Inquiry from homepage Contact Us button"}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activeSolution)} onOpenChange={(next) => !next && setActiveSolution(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {solutionDialogTitle}
              {activeSolution ? `: ${activeSolution.title}` : ""}
            </DialogTitle>
          </DialogHeader>
          {activeSolution ? (
            <ContactMethodCard
              sourceType="GENERAL"
              contextNote={`${locale === "zh" ? "解决方案咨询" : "Solution inquiry"}: ${activeSolution.title}`}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
