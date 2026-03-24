"use client";

import Link from "next/link";
import Image from "next/image";
import { useArticles } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { formatDate } from "@/lib/utils";
import { Locale } from "@/lib/i18n";

function withLang(path: string, locale: Locale) {
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

export default function ArticlesPage() {
  const locale = useLocale();
  const { articles, isLoading } = useArticles({ lang: locale, pageSize: 50 });

  return (
    <div className="bg-slate-50 pb-16">
      <section className="bg-slate-950 py-16 text-white">
        <div className="section-shell">
          <div className="tire-line mb-4" />
          <h1 className="text-5xl font-bold uppercase tracking-tight">{t(locale, "nav_articles")}</h1>
          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-300">
            {articles.length} {t(locale, "common_items")}
          </p>
        </div>
      </section>

      <section className="section-shell mt-8">
        {isLoading ? (
          <p className="text-slate-500">{t(locale, "loading")}</p>
        ) : articles.length === 0 ? (
          <p className="text-slate-500">{t(locale, "empty_articles")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {articles.map((article) => (
              <Link key={article.id} href={withLang(`/articles/${article.slug}`, locale)} className="industrial-panel overflow-hidden transition hover:-translate-y-1">
                <div className="relative aspect-video bg-slate-200">
                  {article.coverImage ? <Image src={article.coverImage} alt={article.title} fill className="object-cover" /> : null}
                </div>
                <div className="space-y-3 p-5">
                  <h3 className="line-clamp-2 text-2xl font-semibold uppercase tracking-tight">{article.title}</h3>
                  <p className="line-clamp-3 text-sm leading-7 text-slate-500">{article.excerpt}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {formatDate(article.publishedAt || article.createdAt, locale === "zh" ? "zh-CN" : "en-US")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
