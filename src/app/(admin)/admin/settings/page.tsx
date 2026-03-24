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
  {
    key: "home_hero_image_url",
    value: "",
    type: "image",
    group: "home",
    label: "Home Hero Image URL",
    labelZh: "首页主视觉图片",
    description: "Hero background image on homepage",
  },
  {
    key: "home_hero_title_line1_en",
    value: "Driving Your",
    type: "text",
    group: "home",
    label: "Hero Title Line 1 (EN)",
    labelZh: "首页主标题第一行(英文)",
  },
  {
    key: "home_hero_title_line1_zh",
    value: "驱动",
    type: "text",
    group: "home",
    label: "Hero Title Line 1 (ZH)",
    labelZh: "首页主标题第一行(中文)",
  },
  {
    key: "home_hero_title_line2_en",
    value: "Success Forward",
    type: "text",
    group: "home",
    label: "Hero Title Line 2 (EN)",
    labelZh: "首页主标题第二行(英文)",
  },
  {
    key: "home_hero_title_line2_zh",
    value: "成功前行",
    type: "text",
    group: "home",
    label: "Hero Title Line 2 (ZH)",
    labelZh: "首页主标题第二行(中文)",
  },
  {
    key: "home_hero_title_line1_color",
    value: "#FFFFFF",
    type: "text",
    group: "home",
    label: "Hero Title Line 1 Color",
    labelZh: "首页主标题第一行颜色",
  },
  {
    key: "home_hero_title_line2_color",
    value: "#8B1D21",
    type: "text",
    group: "home",
    label: "Hero Title Line 2 Color",
    labelZh: "首页主标题第二行颜色",
  },
  {
    key: "header_top_notice_en",
    value: "TENGYU GLOBAL: OPERATING IN 50+ COUNTRIES",
    type: "text",
    group: "site",
    label: "Header Top Notice (EN)",
    labelZh: "顶部公告(英文)",
  },
  {
    key: "header_top_notice_zh",
    value: "TENGYU GLOBAL: 服务覆盖 50+ 国家与地区",
    type: "text",
    group: "site",
    label: "Header Top Notice (ZH)",
    labelZh: "顶部公告(中文)",
  },
  {
    key: "whatsapp_number",
    value: "",
    type: "text",
    group: "contact",
    label: "WhatsApp Number",
    labelZh: "WhatsApp 号码",
    description: "International format, e.g. +8613800000000",
  },
  {
    key: "whatsapp_message_en",
    value: "Hello, I would like to discuss truck options.",
    type: "text",
    group: "contact",
    label: "WhatsApp Message (EN)",
    labelZh: "WhatsApp 默认消息(英文)",
  },
  {
    key: "whatsapp_message_zh",
    value: "您好，我想咨询卡车方案。",
    type: "text",
    group: "contact",
    label: "WhatsApp Message (ZH)",
    labelZh: "WhatsApp 默认消息(中文)",
  },
  {
    key: "about_card_1_title_en",
    value: "Quality Connects Us",
    type: "text",
    group: "about",
    label: "About Card 1 Title (EN)",
    labelZh: "关于卡片1标题(英文)",
  },
  {
    key: "about_card_1_title_zh",
    value: "质量连接你我",
    type: "text",
    group: "about",
    label: "About Card 1 Title (ZH)",
    labelZh: "关于卡片1标题(中文)",
  },
  {
    key: "about_card_1_body_en",
    value: "Every delivered commercial vehicle goes through strict testing and auditing before handover.",
    type: "text",
    group: "about",
    label: "About Card 1 Body (EN)",
    labelZh: "关于卡片1内容(英文)",
  },
  {
    key: "about_card_1_body_zh",
    value: "我们坚持严格质量标准，每台交付车辆都经过完整检测与审核。",
    type: "text",
    group: "about",
    label: "About Card 1 Body (ZH)",
    labelZh: "关于卡片1内容(中文)",
  },
  {
    key: "about_card_2_title_en",
    value: "Remanufacturing Capability",
    type: "text",
    group: "about",
    label: "About Card 2 Title (EN)",
    labelZh: "关于卡片2标题(英文)",
  },
  {
    key: "about_card_2_title_zh",
    value: "再制造能力",
    type: "text",
    group: "about",
    label: "关于卡片2标题(中文)",
    labelZh: "关于卡片2标题(中文)",
  },
  {
    key: "about_card_2_body_en",
    value: "Our process includes deep cleaning, chassis repair, engine and transmission remanufacturing, circuit checks, and component replacement.",
    type: "text",
    group: "about",
    label: "About Card 2 Body (EN)",
    labelZh: "关于卡片2内容(英文)",
  },
  {
    key: "about_card_2_body_zh",
    value: "覆盖整车清洗、底盘检修、发动机与变速箱再制造、线路检测及易损件更换。",
    type: "text",
    group: "about",
    label: "About Card 2 Body (ZH)",
    labelZh: "关于卡片2内容(中文)",
  },
  {
    key: "about_card_3_title_en",
    value: "Customized Solutions",
    type: "text",
    group: "about",
    label: "About Card 3 Title (EN)",
    labelZh: "关于卡片3标题(英文)",
  },
  {
    key: "about_card_3_title_zh",
    value: "定制化方案",
    type: "text",
    group: "about",
    label: "About Card 3 Title (ZH)",
    labelZh: "关于卡片3标题(中文)",
  },
  {
    key: "about_card_3_body_en",
    value: "We tailor dump trucks, tractor heads, mixers, tankers, and trailers to match specific business scenarios.",
    type: "text",
    group: "about",
    label: "About Card 3 Body (EN)",
    labelZh: "关于卡片3内容(英文)",
  },
  {
    key: "about_card_3_body_zh",
    value: "可按场景定制自卸车、牵引车、搅拌车、罐车及挂车配置，精准匹配业务需求。",
    type: "text",
    group: "about",
    label: "About Card 3 Body (ZH)",
    labelZh: "关于卡片3内容(中文)",
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





