"use client";

import { useEffect, useState } from "react";
import { adminGetSettings, adminUpdateSettings } from "@/lib/api";
import { SettingItem } from "@/lib/types";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const locale = useLocale();
  const [items, setItems] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminGetSettings();
      setItems(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
              await adminUpdateSettings(items);
              setMessage(locale === "zh" ? "保存成功" : "Saved");
            } catch (err: any) {
              setError(err?.message || "Save failed");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving..." : locale === "zh" ? "保存" : "Save"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                <th className="px-3 py-2">Key</th>
                <th className="px-3 py-2">Group</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.key} className="border-b align-top">
                  <td className="px-3 py-2 font-mono text-xs">{item.key}</td>
                  <td className="px-3 py-2">{item.group}</td>
                  <td className="px-3 py-2">{locale === "zh" ? item.labelZh || item.label : item.label || item.labelZh}</td>
                  <td className="px-3 py-2">
                    <textarea
                      rows={item.value.length > 120 ? 4 : 2}
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={item.value}
                      onChange={(e) => {
                        const next = [...items];
                        next[index] = { ...item, value: e.target.value };
                        setItems(next);
                      }}
                    />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-muted-foreground">
                    No settings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
