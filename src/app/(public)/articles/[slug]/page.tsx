"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useArticle } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { renderArticleContent } from "@/lib/article-content";
import { formatDate } from "@/lib/utils";

export default function ArticleDetailPage() {
  const locale = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const { article, isLoading } = useArticle(slug, locale);

  if (isLoading) {
    return <div className="section-shell py-10">{t(locale, "loading")}</div>;
  }

  if (!article) {
    return <div className="section-shell py-10">{t(locale, "not_found")}</div>;
  }

  return (
    <div className="bg-slate-50 py-10">
      <article className="section-shell">
        <div className="industrial-panel overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-4xl font-bold uppercase tracking-tight">{article.title}</h1>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {formatDate(article.publishedAt || article.createdAt, locale === "zh" ? "zh-CN" : "en-US")} · {article.viewCount} {t(locale, "article_reads")}
            </p>
          </div>

          {article.coverImage ? (
            <div className="relative aspect-video border-y border-slate-100 bg-slate-200">
              <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
            </div>
          ) : null}

          <div className="p-6 md:p-8">
            <div
              className="article-content space-y-4 text-sm leading-7 text-slate-600"
              dangerouslySetInnerHTML={{ __html: renderArticleContent(article.content) }}
            />
          </div>
        </div>
      </article>
    </div>
  );
}
