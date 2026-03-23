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
    return <div className="container mx-auto px-4 py-8">{t(locale, "loading")}</div>;
  }

  if (!article) {
    return <div className="container mx-auto px-4 py-8">{t(locale, "not_found")}</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">{article.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatDate(article.publishedAt || article.createdAt, locale === "zh" ? "zh-CN" : "en-US")} · {article.viewCount} {t(locale, "article_reads")}
      </p>

      {article.coverImage ? (
        <div className="relative mt-6 aspect-video overflow-hidden rounded border bg-muted">
          <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
        </div>
      ) : null}

      <article
        className="article-content mt-8 space-y-4 leading-7 text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: renderArticleContent(article.content) }}
      />
    </div>
  );
}
