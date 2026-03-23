"use client";

import { useState } from "react";
import { createArticle, deleteArticle, updateArticle, useArticles } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { Article } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default function AdminArticlesPage() {
  const locale = useLocale();
  const { articles, mutate } = useArticles({ lang: locale, pageSize: 200, includeInactive: true });

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{locale === "zh" ? "文章管理" : "Article Management"}</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
        >
          {locale === "zh" ? "新增文章" : "New Article"}
        </Button>
      </div>

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2">{locale === "zh" ? "标题" : "Title"}</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">{locale === "zh" ? "状态" : "Status"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "浏览" : "Views"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "操作" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b">
                <td className="px-3 py-2">{article.title}</td>
                <td className="px-3 py-2">{article.slug}</td>
                <td className="px-3 py-2">{article.isActive ? (locale === "zh" ? "启用" : "Active") : (locale === "zh" ? "停用" : "Inactive")}</td>
                <td className="px-3 py-2">{article.viewCount}</td>
                <td className="space-x-2 px-3 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(article);
                      setEditorOpen(true);
                    }}
                  >
                    {locale === "zh" ? "编辑" : "Edit"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!window.confirm(locale === "zh" ? "确认删除该文章？" : "Delete this article?")) return;
                      await deleteArticle(article.slug);
                      await mutate();
                    }}
                  >
                    {locale === "zh" ? "删除" : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
            {articles.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                  {locale === "zh" ? "暂无文章" : "No articles"}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog open={editorOpen} onOpenChange={(next) => !next && setEditorOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? (locale === "zh" ? "编辑文章" : "Edit Article") : (locale === "zh" ? "新增文章" : "New Article")}</DialogTitle>
          </DialogHeader>

          <ArticleForm
            key={editing?.id || "create-article"}
            locale={locale}
            initial={editing || undefined}
            onCancel={() => setEditorOpen(false)}
            onSubmit={async (payload) => {
              if (editing) {
                await updateArticle(editing.slug, payload);
              } else {
                await createArticle(payload);
              }
              await mutate();
              setEditorOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
