"use client";

import { useMemo, useState } from "react";
import { deleteInquiry, updateInquiryIntent, updateInquiryStatus, useInquiriesAdmin } from "@/lib/api";
import { Inquiry } from "@/lib/types";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUSES = ["NEW", "IN_PROGRESS", "RESPONDED", "COMPLETED", "CLOSED"] as const;
const INTENTS = ["NONE", "LOW", "MEDIUM", "HIGH"] as const;

const STATUS_LABEL: Record<(typeof STATUSES)[number], { zh: string; en: string }> = {
  NEW: { zh: "新建", en: "New" },
  IN_PROGRESS: { zh: "跟进中", en: "In Progress" },
  RESPONDED: { zh: "已回复", en: "Responded" },
  COMPLETED: { zh: "已完成", en: "Completed" },
  CLOSED: { zh: "已关闭", en: "Closed" },
};

const INTENT_LABEL: Record<(typeof INTENTS)[number], { zh: string; en: string }> = {
  NONE: { zh: "未评估", en: "None" },
  LOW: { zh: "低", en: "Low" },
  MEDIUM: { zh: "中", en: "Medium" },
  HIGH: { zh: "高", en: "High" },
};

export default function AdminInquiriesPage() {
  const locale = useLocale();
  const { inquiries, mutate } = useInquiriesAdmin({ lang: locale, pageSize: 200 });

  const [editing, setEditing] = useState<Inquiry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState<Inquiry["status"]>("NEW");
  const [intentLevel, setIntentLevel] = useState<Inquiry["intentLevel"]>("NONE");
  const [intentNotes, setIntentNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const statusText = useMemo(
    () => (value: Inquiry["status"]) => (locale === "zh" ? STATUS_LABEL[value].zh : STATUS_LABEL[value].en),
    [locale]
  );
  const intentText = useMemo(
    () => (value: Inquiry["intentLevel"]) => (locale === "zh" ? INTENT_LABEL[value].zh : INTENT_LABEL[value].en),
    [locale]
  );

  const openEditor = (item: Inquiry) => {
    setEditing(item);
    setStatus(item.status);
    setIntentLevel(item.intentLevel);
    setIntentNotes(item.intentNotes || "");
    setError("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{locale === "zh" ? "询盘管理" : "Inquiry Management"}</h1>

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2">{locale === "zh" ? "产品" : "Product"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "姓名" : "Name"}</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">{locale === "zh" ? "状态" : "Status"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "意向" : "Intent"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "留言" : "Message"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "操作" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b align-top">
                <td className="px-3 py-2">{inquiry.product?.name || inquiry.productId}</td>
                <td className="px-3 py-2">{inquiry.fullName}</td>
                <td className="px-3 py-2">{inquiry.email}</td>
                <td className="px-3 py-2">{statusText(inquiry.status)}</td>
                <td className="px-3 py-2">{intentText(inquiry.intentLevel)}</td>
                <td className="max-w-[220px] px-3 py-2 text-muted-foreground">{inquiry.message || "-"}</td>
                <td className="space-x-2 px-3 py-2">
                  <Button size="sm" variant="outline" onClick={() => openEditor(inquiry)}>
                    {locale === "zh" ? "处理" : "Handle"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(inquiry)}>
                    {locale === "zh" ? "删除" : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-muted-foreground">
                  {locale === "zh" ? "暂无询盘" : "No inquiries"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(next) => !next && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "zh" ? "询盘处理" : "Inquiry Handling"}</DialogTitle>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!editing) return;
              setSaving(true);
              setError("");
              try {
                await updateInquiryStatus(editing.id, status);
                await updateInquiryIntent(editing.id, intentLevel, intentNotes.trim());
                await mutate();
                setEditing(null);
              } catch (err: any) {
                setError(err?.message || (locale === "zh" ? "保存失败" : "Save failed"));
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "状态" : "Status"}</label>
              <select
                className="h-10 w-full rounded border px-3"
                value={status}
                onChange={(e) => setStatus(e.target.value as Inquiry["status"])}
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {statusText(item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "意向等级" : "Intent Level"}</label>
              <select
                className="h-10 w-full rounded border px-3"
                value={intentLevel}
                onChange={(e) => setIntentLevel(e.target.value as Inquiry["intentLevel"])}
              >
                {INTENTS.map((item) => (
                  <option key={item} value={item}>
                    {intentText(item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "意向备注" : "Intent Notes"}</label>
              <textarea
                className="w-full rounded border px-3 py-2 text-sm"
                rows={4}
                value={intentNotes}
                onChange={(e) => setIntentNotes(e.target.value)}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex gap-2">
              <Button disabled={saving}>{saving ? (locale === "zh" ? "保存中..." : "Saving...") : (locale === "zh" ? "确定" : "Save")}</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                {locale === "zh" ? "取消" : "Cancel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "zh" ? "删除询盘" : "Delete Inquiry"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {locale === "zh" ? "确认删除该询盘记录？此操作不可恢复。" : "Are you sure to delete this inquiry? This action cannot be undone."}
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteInquiry(deleteTarget.id);
                await mutate();
                setDeleteTarget(null);
              }}
            >
              {locale === "zh" ? "确认删除" : "Delete"}
            </Button>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {locale === "zh" ? "取消" : "Cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
