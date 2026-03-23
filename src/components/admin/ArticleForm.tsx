"use client";

import { useRef, useState } from "react";
import { Locale } from "@/lib/i18n";
import { Article } from "@/lib/types";
import { uploadAsset } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ArticlePayload = {
  title: string;
  titleZh?: string;
  excerpt?: string;
  excerptZh?: string;
  content: string;
  contentZh?: string;
  coverImage?: string;
  isActive: boolean;
};

function insertAtCursor(target: HTMLTextAreaElement | null, text: string, fallback: string) {
  if (!target) {
    return `${fallback}${fallback ? "\n" : ""}${text}`;
  }

  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? target.value.length;
  const head = target.value.slice(0, start);
  const tail = target.value.slice(end);
  return `${head}${text}${tail}`;
}

export function ArticleForm({
  locale,
  initial,
  onSubmit,
  onCancel,
}: {
  locale: Locale;
  initial?: Article;
  onSubmit: (payload: ArticlePayload) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<ArticlePayload>({
    title: initial?.titleEn || "",
    titleZh: initial?.titleZh || "",
    excerpt: initial?.excerptEn || "",
    excerptZh: initial?.excerptZh || "",
    content: initial?.contentEn || "",
    contentZh: initial?.contentZh || "",
    coverImage: initial?.coverImage || "",
    isActive: initial?.isActive ?? true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<"cover" | "zh" | "en" | "">("");
  const [error, setError] = useState("");

  const zhContentRef = useRef<HTMLTextAreaElement | null>(null);
  const enContentRef = useRef<HTMLTextAreaElement | null>(null);
  const zhImageInputRef = useRef<HTMLInputElement | null>(null);
  const enImageInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const patch = (next: Partial<ArticlePayload>) => {
    setForm((old) => ({ ...old, ...next }));
  };

  const uploadAndInsertImage = async (file: File, target: "zh" | "en") => {
    setUploading(target);
    setError("");
    try {
      const uploaded = await uploadAsset(file, "articles");
      const markdown = `\n![${target === "zh" ? "图片" : "Image"}](${uploaded.path})\n`;

      if (target === "zh") {
        patch({ contentZh: insertAtCursor(zhContentRef.current, markdown, form.contentZh || "") });
      } else {
        patch({ content: insertAtCursor(enContentRef.current, markdown, form.content || "") });
      }
    } catch (err: any) {
      setError(err?.message || (locale === "zh" ? "上传失败" : "Upload failed"));
    } finally {
      setUploading("");
    }
  };

  const uploadCover = async (file: File) => {
    setUploading("cover");
    setError("");
    try {
      const uploaded = await uploadAsset(file, "articles");
      patch({ coverImage: uploaded.path });
    } catch (err: any) {
      setError(err?.message || (locale === "zh" ? "封面上传失败" : "Cover upload failed"));
    } finally {
      setUploading("");
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
          await onSubmit(form);
        } catch (err: any) {
          setError(err?.message || (locale === "zh" ? "提交失败" : "Submit failed"));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <section className="space-y-3 rounded border p-4">
        <h3 className="font-semibold">{locale === "zh" ? "中文内容" : "Chinese Content"}</h3>
        <div className="space-y-1">
          <Label>{locale === "zh" ? "标题(中文)" : "Title (ZH)"}</Label>
          <Input value={form.titleZh || ""} onChange={(e) => patch({ titleZh: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>{locale === "zh" ? "摘要(中文)" : "Excerpt (ZH)"}</Label>
          <textarea
            className="w-full rounded border px-3 py-2 text-sm"
            rows={4}
            value={form.excerptZh || ""}
            onChange={(e) => patch({ excerptZh: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label>{locale === "zh" ? "正文(中文)" : "Content (ZH)"}</Label>
            <div>
              <input
                ref={zhImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  await uploadAndInsertImage(file, "zh");
                  event.currentTarget.value = "";
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => zhImageInputRef.current?.click()}>
                {uploading === "zh"
                  ? locale === "zh"
                    ? "上传中..."
                    : "Uploading..."
                  : locale === "zh"
                    ? "上传图片并插入"
                    : "Upload & Insert Image"}
              </Button>
            </div>
          </div>
          <textarea
            ref={zhContentRef}
            className="w-full rounded border px-3 py-2 text-sm"
            rows={10}
            value={form.contentZh || ""}
            onChange={(e) => patch({ contentZh: e.target.value })}
            placeholder={locale === "zh" ? "支持插入 Markdown 图片语法：![描述](图片链接)" : "Supports markdown image syntax: ![alt](image-url)"}
          />
        </div>
      </section>

      <section className="space-y-3 rounded border p-4">
        <h3 className="font-semibold">{locale === "zh" ? "英文内容" : "English Content"}</h3>
        <div className="space-y-1">
          <Label>Title(EN)</Label>
          <Input required value={form.title} onChange={(e) => patch({ title: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>{locale === "zh" ? "摘要(英文)" : "Excerpt (EN)"}</Label>
          <textarea
            className="w-full rounded border px-3 py-2 text-sm"
            rows={4}
            value={form.excerpt || ""}
            onChange={(e) => patch({ excerpt: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label>{locale === "zh" ? "正文(英文)" : "Content (EN)"}</Label>
            <div>
              <input
                ref={enImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  await uploadAndInsertImage(file, "en");
                  event.currentTarget.value = "";
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => enImageInputRef.current?.click()}>
                {uploading === "en"
                  ? locale === "zh"
                    ? "上传中..."
                    : "Uploading..."
                  : locale === "zh"
                    ? "上传图片并插入"
                    : "Upload & Insert Image"}
              </Button>
            </div>
          </div>
          <textarea
            ref={enContentRef}
            required
            className="w-full rounded border px-3 py-2 text-sm"
            rows={10}
            value={form.content || ""}
            onChange={(e) => patch({ content: e.target.value })}
            placeholder={locale === "zh" ? "支持插入 Markdown 图片语法：![描述](图片链接)" : "Supports markdown image syntax: ![alt](image-url)"}
          />
        </div>
      </section>

      <section className="space-y-3 rounded border p-4">
        <h3 className="font-semibold">{locale === "zh" ? "发布设置" : "Publishing"}</h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-1">
          <div className="space-y-1">
            <Label>{locale === "zh" ? "封面图 URL" : "Cover Image URL"}</Label>
            <Input value={form.coverImage || ""} onChange={(e) => patch({ coverImage: e.target.value })} placeholder="/uploads/articles/..." />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              await uploadCover(file);
              event.currentTarget.value = "";
            }}
          />
          <Button type="button" variant="outline" onClick={() => coverInputRef.current?.click()}>
            {uploading === "cover"
              ? locale === "zh"
                ? "上传中..."
                : "Uploading..."
              : locale === "zh"
                ? "上传封面"
                : "Upload Cover"}
          </Button>
          {form.coverImage ? <span className="text-xs text-muted-foreground">{form.coverImage}</span> : null}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => patch({ isActive: e.target.checked })} />
          {locale === "zh" ? "启用发布" : "Active"}
        </label>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        <Button disabled={submitting}>{submitting ? (locale === "zh" ? "保存中..." : "Saving...") : locale === "zh" ? "确定" : "Save"}</Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {locale === "zh" ? "取消" : "Cancel"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
