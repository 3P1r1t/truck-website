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
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">{t(locale, "nav_articles")}</h1>
      <p className="mb-6 text-muted-foreground">
        {articles.length} {t(locale, "common_items")}
      </p>

      {isLoading ? (
        <p className="text-muted-foreground">{t(locale, "loading")}</p>
      ) : articles.length === 0 ? (
        <p className="text-muted-foreground">{t(locale, "empty_articles")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} href={withLang(`/articles/${article.slug}`, locale)} className="overflow-hidden rounded border hover:bg-muted/30">
              <div className="relative aspect-video bg-muted">
                {article.coverImage ? (
                  <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
                ) : null}
              </div>
              <div className="space-y-2 p-4">
                <h3 className="line-clamp-2 font-semibold">{article.title}</h3>
                <p className="line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(article.publishedAt || article.createdAt, locale === "zh" ? "zh-CN" : "en-US")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
