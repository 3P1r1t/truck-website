"use client";

import Link from "next/link";
import { ArrowRight, Award, Headphones, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/public/ProductCard";
import { useArticles, useProducts, useSettings } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { getSettingValueByLocale, Locale } from "@/lib/i18n";

function withLang(path: string, locale: Locale) {
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

export default function HomePage() {
  const locale = useLocale();
  const { settings } = useSettings(locale);
  const { products } = useProducts({ lang: locale, featured: true, pageSize: 4 });
  const { articles } = useArticles({ lang: locale, pageSize: 3 });

  const heroTitle = getSettingValueByLocale(settings, "home_hero_title", locale, "Tengyu International Truck Factory");
  const heroSubtitle = getSettingValueByLocale(
    settings,
    "home_hero_subtitle",
    locale,
    "Specialized in remanufacturing commercial vehicles and trailers."
  );

  return (
    <div>
      <section className="bg-gradient-to-r from-primary/90 to-primary py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl font-bold md:text-5xl">{heroTitle}</h1>
            <p className="text-lg text-white/85">{heroSubtitle}</p>
            <div className="flex gap-3">
              <Button asChild variant="secondary" size="lg">
                <Link href={withLang("/products", locale)}>
                  {t(locale, "hero_cta_primary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white bg-transparent text-white hover:bg-white/10">
                <Link href={withLang("/contact", locale)}>{t(locale, "hero_cta_secondary")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-14">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 md:grid-cols-4">
          {[
            { icon: Truck, titleEn: "Vehicle Portfolio", titleZh: "车型矩阵", descEn: "Light to heavy trucks", descZh: "覆盖轻型到重型卡车" },
            { icon: Award, titleEn: "Quality", titleZh: "品质保障", descEn: "Verified suppliers and models", descZh: "车型与供应商严格筛选" },
            { icon: Headphones, titleEn: "Support", titleZh: "服务支持", descEn: "Fast pre-sales response", descZh: "快速售前与询盘响应" },
            { icon: Shield, titleEn: "Assurance", titleZh: "交付保障", descEn: "Structured purchase process", descZh: "流程清晰可控" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="rounded border bg-background p-5 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{locale === "zh" ? item.titleZh : item.titleEn}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{locale === "zh" ? item.descZh : item.descEn}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t(locale, "section_featured_products")}</h2>
          <Link className="text-sm text-primary" href={withLang("/products", locale)}>
            {t(locale, "hero_cta_primary")}
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t(locale, "empty_products")}</p>
        )}
      </section>

      <section className="container mx-auto px-4 pb-14">
        <h2 className="mb-6 text-2xl font-bold">{t(locale, "section_latest_articles")}</h2>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {articles.map((article) => (
              <Link key={article.id} href={withLang(`/articles/${article.slug}`, locale)} className="rounded border p-4 hover:bg-muted/30">
                <h3 className="line-clamp-2 font-semibold">{article.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t(locale, "empty_articles")}</p>
        )}
      </section>

      <section className="bg-primary py-14 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">{t(locale, "section_contact_title")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-white/85">{t(locale, "section_contact_subtitle")}</p>
          <Button asChild className="mt-6" variant="secondary">
            <Link href={withLang("/contact", locale)}>{t(locale, "section_contact_button")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
