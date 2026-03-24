"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/public/ProductCard";
import { submitInquiry, useArticles, useProducts, useSettings } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { getSettingValueByLocale, Locale } from "@/lib/i18n";

function withLang(path: string, locale: Locale) {
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

const SOLUTION_BLOCKS = {
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
  const { articles } = useArticles({ lang: locale, pageSize: 3 });

  const heroTitle = getSettingValueByLocale(settings, "home_hero_title", locale, "Driving Your Success Forward");
  const heroSubtitle = getSettingValueByLocale(
    settings,
    "home_hero_subtitle",
    locale,
    "Tengyu provides remanufactured commercial vehicles and reliable fleet solutions for global transport companies."
  );
  const heroImage = settings.home_hero_image_url ||
    "https://images.unsplash.com/photo-1592417817098-8fd3d7dbe115?auto=format&fit=crop&w=1920&q=80";

  const [quickEmail, setQuickEmail] = useState("");
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");
  const [quickError, setQuickError] = useState("");

  const submitQuickInquiry = async (event: FormEvent) => {
    event.preventDefault();
    setQuickSubmitting(true);
    setQuickError("");
    setQuickMessage("");

    try {
      await submitInquiry({
        sourceType: "GENERAL",
        email: quickEmail,
        message:
          locale === "zh"
            ? "Quick inquiry from homepage email form"
            : "Quick inquiry from homepage email form",
      });
      setQuickMessage(locale === "zh" ? "询盘已提交，我们会尽快联系您。" : "Inquiry submitted. We will contact you soon.");
      setQuickEmail("");
    } catch (error: any) {
      setQuickError(error?.message || "Submit failed");
    } finally {
      setQuickSubmitting(false);
    }
  };

  const solutionBlocks = locale === "zh" ? SOLUTION_BLOCKS.zh : SOLUTION_BLOCKS.en;

  return (
    <div>
      <section
        className="relative min-h-[82vh] overflow-hidden bg-slate-950 text-white"
        style={{
          backgroundImage: `linear-gradient(78deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.36) 60%), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="section-shell flex min-h-[82vh] items-center py-24">
          <div className="max-w-3xl space-y-7">
            <div className="tire-line" />
            <h1 className="text-5xl font-bold uppercase leading-[1.05] tracking-tight md:text-7xl">{heroTitle}</h1>
            <p className="max-w-2xl text-lg text-slate-200 md:text-xl">{heroSubtitle}</p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild className="rounded-sm bg-white px-8 py-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900 hover:bg-primary hover:text-white">
                <Link href={withLang("/products", locale)}>
                  {t(locale, "hero_cta_primary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-sm border-white/40 bg-white/5 px-8 py-6 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-white/15">
                <Link href={withLang("/contact", locale)}>{t(locale, "hero_cta_secondary")}</Link>
              </Button>
            </div>

            <form onSubmit={submitQuickInquiry} className="industrial-panel mt-8 max-w-2xl border-white/10 bg-white/10 p-2 backdrop-blur sm:flex sm:items-center">
              <Input
                required
                type="email"
                value={quickEmail}
                onChange={(event) => setQuickEmail(event.target.value)}
                placeholder={locale === "zh" ? "输入企业邮箱，快速获取方案" : "Enter business email for quick inquiry"}
                className="h-12 border-0 bg-transparent text-sm text-white placeholder:text-slate-300 focus-visible:ring-0"
              />
              <Button disabled={quickSubmitting} className="mt-2 h-12 w-full rounded-sm bg-primary text-xs font-semibold uppercase tracking-[0.18em] hover:bg-primary/90 sm:mt-0 sm:w-auto sm:px-8">
                {quickSubmitting ? (locale === "zh" ? "提交中" : "Submitting") : locale === "zh" ? "免费询价" : "Get Free Quote"}
              </Button>
            </form>
            {quickError ? <p className="text-sm text-red-200">{quickError}</p> : null}
            {quickMessage ? <p className="text-sm text-emerald-200">{quickMessage}</p> : null}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="section-shell grid gap-12 md:grid-cols-3">
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

      <section className="bg-white py-24">
        <div className="section-shell">
          <div className="mb-12">
            <div className="tire-line mb-4" />
            <p className="industrial-kicker">{locale === "zh" ? "行业方案" : "Sector Expertise"}</p>
            <h2 className="mt-2 text-4xl font-bold uppercase tracking-tight">
              {locale === "zh" ? "场景化运输解决方案" : "Industry-Specific Solutions"}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {solutionBlocks.map((item) => (
              <article key={item.title} className="industrial-panel overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-slate-900 to-slate-700" />
                <div className="space-y-4 p-6">
                  <h3 className="text-2xl font-semibold uppercase tracking-tight">{item.title}</h3>
                  <p className="text-sm leading-7 text-slate-500">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-24 text-white">
        <div className="section-shell">
          <h2 className="text-4xl font-bold uppercase tracking-tight">{t(locale, "section_latest_articles")}</h2>
          {articles.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={withLang(`/articles/${article.slug}`, locale)}
                  className="rounded-sm border border-white/10 bg-white/5 p-6 transition hover:border-primary/70 hover:bg-white/10"
                >
                  <h3 className="line-clamp-2 text-2xl font-semibold uppercase tracking-tight">{article.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-300">{article.excerpt}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-slate-300">{t(locale, "empty_articles")}</p>
          )}
        </div>
      </section>
    </div>
  );
}
