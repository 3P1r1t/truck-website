"use client";

import { useEffect, useMemo, useState } from "react";
import { adminGetSettings, adminUpdateSettings, uploadAsset } from "@/lib/api";
import { SettingItem } from "@/lib/types";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";

const REQUIRED_SETTINGS: SettingItem[] = [
  {
    key: "about_image_url",
    value: "",
    type: "image",
    group: "about",
    label: "About Image URL",
    labelZh: "关于我们图片",
    description: "Image used in About intro section",
  },
];

function mergeRequired(items: SettingItem[]) {
  const map = new Map(items.map((item) => [item.key, item]));
  REQUIRED_SETTINGS.forEach((required) => {
    if (!map.has(required.key)) {
      map.set(required.key, required);
    }
  });
  return Array.from(map.values()).sort((a, b) => {
    const ag = a.group || "zzzz";
    const bg = b.group || "zzzz";
    if (ag === bg) return a.key.localeCompare(b.key);
    return ag.localeCompare(bg);
  });
}

export default function AdminSettingsPage() {
  const locale = useLocale();
  const [items, setItems] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminGetSettings();
      setItems(mergeRequired(data));
      setError("");
    } catch (err: any) {
      setError(err?.message || (locale === "zh" ? "加载失败" : "Failed to load settings"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, SettingItem[]>();
    items.forEach((item) => {
      const group = item.group || "ungrouped";
      if (!map.has(group)) {
        map.set(group, []);
      }
      map.get(group)!.push(item);
    });
    return Array.from(map.entries()).map(([group, rows]) => ({ group, rows }));
  }, [items]);

  const updateItem = (index: number, next: Partial<SettingItem>) => {
    setItems((old) => {
      const list = [...old];
      list[index] = { ...list[index], ...next };
      return list;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{locale === "zh" ? "站点配置" : "Site Settings"}</h1>
        <Button
          disabled={saving || loading}
          onClick={async () => {
            setSaving(true);
            setMessage("");
            setError("");
            try {
              const saved = await adminUpdateSettings(items);
              setItems(mergeRequired(saved));
              setMessage(locale === "zh" ? "保存成功" : "Saved");
            } catch (err: any) {
              setError(err?.message || (locale === "zh" ? "保存失败" : "Save failed"));
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? (locale === "zh" ? "保存中..." : "Saving...") : (locale === "zh" ? "保存" : "Save")}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-green-600">{message}</p> : null}

      {loading ? (
        <p className="text-muted-foreground">{locale === "zh" ? "加载中..." : "Loading..."}</p>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ group, rows }) => {
            const isOpen = Boolean(expanded[group]);
            return (
              <section key={group} className="rounded border">
                <button
                  className="flex w-full items-center justify-between border-b px-4 py-3 text-left"
                  onClick={() => setExpanded((old) => ({ ...old, [group]: !old[group] }))}
                >
                  <span className="font-semibold">{group}</span>
                  <span className="text-xs text-muted-foreground">{isOpen ? (locale === "zh" ? "收起" : "Collapse") : (locale === "zh" ? "展开" : "Expand")}</span>
                </button>

                {isOpen ? (
                  <div className="space-y-3 p-4">
                    {rows.map((item) => {
                      const index = items.findIndex((entry) => entry.key === item.key);
                      const isImage = item.type === "image" || item.key.includes("image");
                      return (
                        <div key={item.key} className="space-y-2 rounded border p-3">
                          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="font-mono text-xs text-muted-foreground">{item.key}</div>
                              <div className="font-medium">{locale === "zh" ? item.labelZh || item.label || item.key : item.label || item.labelZh || item.key}</div>
                            </div>
                          </div>

                          {isImage ? (
                            <div className="space-y-2">
                              <input
                                className="h-10 w-full rounded border px-3 text-sm"
                                value={item.value}
                                onChange={(e) => updateItem(index, { value: e.target.value })}
                                placeholder="/uploads/..."
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id={`upload-${item.key}`}
                                  onChange={async (event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    setUploadingKey(item.key);
                                    try {
                                      const uploaded = await uploadAsset(file, "settings");
                                      updateItem(index, { value: uploaded.path });
                                    } catch (err: any) {
                                      setError(err?.message || (locale === "zh" ? "上传失败" : "Upload failed"));
                                    } finally {
                                      setUploadingKey("");
                                      event.currentTarget.value = "";
                                    }
                                  }}
                                />
                                <label htmlFor={`upload-${item.key}`}>
                                  <Button type="button" variant="outline" size="sm" asChild>
                                    <span>{uploadingKey === item.key ? (locale === "zh" ? "上传中..." : "Uploading...") : (locale === "zh" ? "上传图片" : "Upload Image")}</span>
                                  </Button>
                                </label>
                                {item.value ? <span className="text-xs text-muted-foreground">{item.value}</span> : null}
                              </div>
                            </div>
                          ) : (
                            <textarea
                              rows={item.value.length > 120 ? 4 : 2}
                              className="w-full rounded border px-3 py-2 text-sm"
                              value={item.value}
                              onChange={(e) => updateItem(index, { value: e.target.value })}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
