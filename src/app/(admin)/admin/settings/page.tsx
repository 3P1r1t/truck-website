"use client";

import { useEffect, useMemo, useState } from "react";
import { adminGetSettings, adminUpdateSettings, uploadAsset } from "@/lib/api";
import { SettingItem } from "@/lib/types";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { useAdminMessage } from "@/components/admin/AdminMessageProvider";

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
    type: "media",
    group: "home",
    label: "Home Hero Media URL",
    labelZh: "首页主视觉媒体",
    description: "Hero background image or video on homepage",
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
    key: "home_capability_title_en",
    value: "Core Capabilities",
    type: "text",
    group: "home",
    label: "Capabilities Title (EN)",
    labelZh: "首页能力区标题(英文)",
  },
  {
    key: "home_capability_title_zh",
    value: "核心能力",
    type: "text",
    group: "home",
    label: "Capabilities Title (ZH)",
    labelZh: "首页能力区标题(中文)",
  },
  {
    key: "home_capability_subtitle_en",
    value: "Powered by remanufacturing standards and engineering delivery for global fleets.",
    type: "text",
    group: "home",
    label: "Capabilities Subtitle (EN)",
    labelZh: "首页能力区副标题(英文)",
  },
  {
    key: "home_capability_subtitle_zh",
    value: "以再制造体系和工程能力支撑全球运输业务。",
    type: "text",
    group: "home",
    label: "Capabilities Subtitle (ZH)",
    labelZh: "首页能力区副标题(中文)",
  },
  {
    key: "home_solutions_kicker_en",
    value: "Sector Expertise",
    type: "text",
    group: "home",
    label: "Solutions Kicker (EN)",
    labelZh: "解决方案副标题(英文)",
  },
  {
    key: "home_solutions_kicker_zh",
    value: "行业方案",
    type: "text",
    group: "home",
    label: "Solutions Kicker (ZH)",
    labelZh: "解决方案副标题(中文)",
  },
  {
    key: "home_solutions_title_en",
    value: "Industry-Specific Solutions",
    type: "text",
    group: "home",
    label: "Solutions Title (EN)",
    labelZh: "解决方案标题(英文)",
  },
  {
    key: "home_solutions_title_zh",
    value: "场景化运输解决方案",
    type: "text",
    group: "home",
    label: "Solutions Title (ZH)",
    labelZh: "解决方案标题(中文)",
  },
  {
    key: "home_solutions_learn_more_en",
    value: "Learn More",
    type: "text",
    group: "home",
    label: "Solutions Learn More (EN)",
    labelZh: "解决方案按钮文案(英文)",
  },
  {
    key: "home_solutions_learn_more_zh",
    value: "了解详情",
    type: "text",
    group: "home",
    label: "Solutions Learn More (ZH)",
    labelZh: "解决方案按钮文案(中文)",
  },
  {
    key: "home_solutions_dialog_title_en",
    value: "Solution Consultation",
    type: "text",
    group: "home",
    label: "Solutions Dialog Title (EN)",
    labelZh: "解决方案弹窗标题(英文)",
  },
  {
    key: "home_solutions_dialog_title_zh",
    value: "方案咨询",
    type: "text",
    group: "home",
    label: "Solutions Dialog Title (ZH)",
    labelZh: "解决方案弹窗标题(中文)",
  },
  {
    key: "home_solution_1_title_en",
    value: "Urban Distribution",
    type: "text",
    group: "home",
    label: "Solution 1 Title (EN)",
    labelZh: "方案1标题(英文)",
  },
  {
    key: "home_solution_1_title_zh",
    value: "城市配送",
    type: "text",
    group: "home",
    label: "Solution 1 Title (ZH)",
    labelZh: "方案1标题(中文)",
  },
  {
    key: "home_solution_1_desc_en",
    value: "Optimized for city routes with flexible body configurations and efficient fuel strategy.",
    type: "text",
    group: "home",
    label: "Solution 1 Description (EN)",
    labelZh: "方案1描述(英文)",
  },
  {
    key: "home_solution_1_desc_zh",
    value: "适配城市多场景运输，支持灵活上装与高效油耗策略。",
    type: "text",
    group: "home",
    label: "Solution 1 Description (ZH)",
    labelZh: "方案1描述(中文)",
  },
  {
    key: "home_solution_1_image_url",
    value: "",
    type: "image",
    group: "home",
    label: "Solution 1 Image URL",
    labelZh: "方案1图片",
  },
  {
    key: "home_solution_2_title_en",
    value: "Cross-Border Logistics",
    type: "text",
    group: "home",
    label: "Solution 2 Title (EN)",
    labelZh: "方案2标题(英文)",
  },
  {
    key: "home_solution_2_title_zh",
    value: "跨境干线",
    type: "text",
    group: "home",
    label: "Solution 2 Title (ZH)",
    labelZh: "方案2标题(中文)",
  },
  {
    key: "home_solution_2_desc_en",
    value: "Stable long-haul platform with remote diagnostics and strong uptime management.",
    type: "text",
    group: "home",
    label: "Solution 2 Description (EN)",
    labelZh: "方案2描述(英文)",
  },
  {
    key: "home_solution_2_desc_zh",
    value: "长途工况稳定可靠，支持远程诊断和持续出勤管理。",
    type: "text",
    group: "home",
    label: "Solution 2 Description (ZH)",
    labelZh: "方案2描述(中文)",
  },
  {
    key: "home_solution_2_image_url",
    value: "",
    type: "image",
    group: "home",
    label: "Solution 2 Image URL",
    labelZh: "方案2图片",
  },
  {
    key: "home_solution_3_title_en",
    value: "Heavy Construction",
    type: "text",
    group: "home",
    label: "Solution 3 Title (EN)",
    labelZh: "方案3标题(英文)",
  },
  {
    key: "home_solution_3_title_zh",
    value: "工程重载",
    type: "text",
    group: "home",
    label: "Solution 3 Title (ZH)",
    labelZh: "方案3标题(中文)",
  },
  {
    key: "home_solution_3_desc_en",
    value: "Reinforced chassis and high torque output for complex engineering and mining environments.",
    type: "text",
    group: "home",
    label: "Solution 3 Description (EN)",
    labelZh: "方案3描述(英文)",
  },
  {
    key: "home_solution_3_desc_zh",
    value: "强化底盘与高扭矩输出，适配矿区和重型工程作业。",
    type: "text",
    group: "home",
    label: "Solution 3 Description (ZH)",
    labelZh: "方案3描述(中文)",
  },
  {
    key: "home_solution_3_image_url",
    value: "",
    type: "image",
    group: "home",
    label: "Solution 3 Image URL",
    labelZh: "方案3图片",
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
    key: "about_profile_kicker_en",
    value: "Company Profile",
    type: "text",
    group: "about",
    label: "About Profile Kicker (EN)",
    labelZh: "关于我们简介标签(英文)",
  },
  {
    key: "about_profile_kicker_zh",
    value: "企业介绍",
    type: "text",
    group: "about",
    label: "About Profile Kicker (ZH)",
    labelZh: "关于我们简介标签(中文)",
  },
  {
    key: "about_profile_title_en",
    value: "Tengyu Remanufacturing System",
    type: "text",
    group: "about",
    label: "About Profile Title (EN)",
    labelZh: "关于我们简介标题(英文)",
  },
  {
    key: "about_profile_title_zh",
    value: "腾宇商用车再制造",
    type: "text",
    group: "about",
    label: "About Profile Title (ZH)",
    labelZh: "关于我们简介标题(中文)",
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
  const requiredMap = new Map(REQUIRED_SETTINGS.map((item) => [item.key, item]));
  const merged = items.map((item) => {
    const required = requiredMap.get(item.key);
    if (!required) {
      return item;
    }

    return {
      ...item,
      type: required.type ?? item.type,
      group: required.group ?? item.group,
      label: required.label ?? item.label,
      labelZh: required.labelZh ?? item.labelZh,
      description: required.description ?? item.description,
    };
  });

  const existingKeys = new Set(merged.map((item) => item.key));
  REQUIRED_SETTINGS.forEach((required) => {
    if (!existingKeys.has(required.key)) {
      merged.push(required);
    }
  });

  return merged.sort((a, b) => {
    const ag = a.group || "zzzz";
    const bg = b.group || "zzzz";
    if (ag === bg) return a.key.localeCompare(b.key);
    return ag.localeCompare(bg);
  });
}

function isVideoAsset(url: string) {
  const normalized = (url || "").split("?")[0].split("#")[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov|m4v|avi)$/.test(normalized);
}

export default function AdminSettingsPage() {
  const locale = useLocale();
  const { pushMessage } = useAdminMessage();
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
      const message = err?.message || (locale === "zh" ? "加载失败" : "Failed to load settings");
      setError(message);
      pushMessage(message, "error");
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
              const successMessage = locale === "zh" ? "保存成功" : "Saved";
              setMessage(successMessage);
              pushMessage(successMessage, "success");
            } catch (err: any) {
              const message = err?.message || (locale === "zh" ? "保存失败" : "Save failed");
              setError(message);
              pushMessage(message, "error");
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
                      const isHeroMedia = item.key === "home_hero_image_url";
                      const isMediaUploadField =
                        item.type === "image" || item.type === "media" || item.key.includes("image") || isHeroMedia;
                      const mediaPath = (item.value || "").trim();
                      const isVideoMedia = isVideoAsset(mediaPath);
                      return (
                        <div key={item.key} className="space-y-2 rounded border p-3">
                          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="font-mono text-xs text-muted-foreground">{item.key}</div>
                              <div className="font-medium">{locale === "zh" ? item.labelZh || item.label || item.key : item.label || item.labelZh || item.key}</div>
                            </div>
                          </div>

                          {isMediaUploadField ? (
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
                                  accept={isHeroMedia ? "image/*,video/*" : "image/*"}
                                  className="hidden"
                                  id={`upload-${item.key}`}
                                  onChange={async (event) => {
                                    const inputEl = event.currentTarget as HTMLInputElement;
                                    const file = inputEl.files?.[0];
                                    // Clear immediately so re-selecting the same file always works.
                                    inputEl.value = "";
                                    if (!file) return;
                                    setUploadingKey(item.key);
                                    try {
                                      const uploaded = await uploadAsset(file, "settings", item.key);
                                      updateItem(index, { value: uploaded.path });
                                      pushMessage(locale === "zh" ? "上传成功" : "Upload succeeded", "success");
                                    } catch (err: any) {
                                      const message = err?.message || (locale === "zh" ? "上传失败" : "Upload failed");
                                      setError(message);
                                      pushMessage(message, "error");
                                    } finally {
                                      setUploadingKey("");
                                    }
                                  }}
                                />
                                <label htmlFor={`upload-${item.key}`}>
                                  <Button type="button" variant="outline" size="sm" asChild>
                                    <span>
                                      {uploadingKey === item.key
                                        ? (locale === "zh" ? "上传中..." : "Uploading...")
                                        : isHeroMedia
                                          ? (locale === "zh" ? "上传图片/视频" : "Upload Media")
                                          : (locale === "zh" ? "上传图片" : "Upload Image")}
                                    </span>
                                  </Button>
                                </label>
                                {item.value ? <span className="text-xs text-muted-foreground">{item.value}</span> : null}
                              </div>
                              {mediaPath ? (
                                <div className="overflow-hidden rounded border bg-slate-50 p-2">
                                  {isVideoMedia ? (
                                    <video src={mediaPath} controls className="h-40 w-full rounded object-contain md:h-56" />
                                  ) : (
                                    <img
                                      src={mediaPath}
                                      alt={item.label || item.key}
                                      className="h-40 w-full rounded object-contain md:h-56"
                                    />
                                  )}
                                </div>
                              ) : null}
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
