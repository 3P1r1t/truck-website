"use client";

import { useState } from "react";
import { createArticle, deleteArticle, updateArticle, useArticles } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { Article } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminArticlesPage() {
  const locale = useLocale();
  const { articles, mutate } = useArticles({ lang: locale, pageSize: 200 });
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    titleZh: "",
    slug: "",
    excerpt: "",
    excerptZh: "",
    content: "",
    contentZh: "",
    coverImage: "",
    isActive: true,
  });

  const resetForm = () =>
    setForm({
      title: "",
      titleZh: "",
      slug: "",
      excerpt: "",
      excerptZh: "",
      content: "",
      contentZh: "",
      coverImage: "",
      isActive: true,
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{locale === "zh" ? "文章管理" : "Article Management"}</h1>
        <Button
          onClick={() => {
            setCreating((v) => !v);
            setEditing(null);
            resetForm();
          }}
        >
          {creating ? "Close" : "New"}
        </Button>
      </div>

      {(creating || editing) && (
        <form
          className="space-y-3 rounded border p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (editing) {
              await updateArticle(editing.slug, form);
            } else {
              await createArticle(form);
            }
            await mutate();
            setCreating(false);
            setEditing(null);
            resetForm();
          }}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Title EN</Label>
              <Input required value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Title ZH</Label>
              <Input value={form.titleZh} onChange={(e) => setForm((v) => ({ ...v, titleZh: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => setForm((v) => ({ ...v, slug: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Excerpt EN</Label>
              <textarea className="w-full rounded border px-3 py-2 text-sm" rows={3} value={form.excerpt} onChange={(e) => setForm((v) => ({ ...v, excerpt: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Excerpt ZH</Label>
              <textarea className="w-full rounded border px-3 py-2 text-sm" rows={3} value={form.excerptZh} onChange={(e) => setForm((v) => ({ ...v, excerptZh: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Content EN</Label>
              <textarea className="w-full rounded border px-3 py-2 text-sm" rows={8} value={form.content} onChange={(e) => setForm((v) => ({ ...v, content: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Content ZH</Label>
              <textarea className="w-full rounded border px-3 py-2 text-sm" rows={8} value={form.contentZh} onChange={(e) => setForm((v) => ({ ...v, contentZh: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Cover Image URL</Label>
            <Input value={form.coverImage} onChange={(e) => setForm((v) => ({ ...v, coverImage: e.target.value }))} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((v) => ({ ...v, isActive: e.target.checked }))} />
            Active
          </label>

          <div className="flex gap-2">
            <Button>Save</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Views</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b">
                <td className="px-3 py-2">{article.title}</td>
                <td className="px-3 py-2">{article.slug}</td>
                <td className="px-3 py-2">{article.isActive ? "Active" : "Inactive"}</td>
                <td className="px-3 py-2">{article.viewCount}</td>
                <td className="space-x-2 px-3 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(article);
                      setCreating(false);
                      setForm({
                        title: article.titleEn,
                        titleZh: article.titleZh || "",
                        slug: article.slug,
                        excerpt: article.excerptEn || "",
                        excerptZh: article.excerptZh || "",
                        content: article.contentEn,
                        contentZh: article.contentZh || "",
                        coverImage: article.coverImage || "",
                        isActive: article.isActive,
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!window.confirm("Delete this article?")) return;
                      await deleteArticle(article.slug);
                      await mutate();
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                  No articles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
