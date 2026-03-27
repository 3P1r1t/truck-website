"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteInquiry,
  downloadInquiriesCsv,
  updateInquiryIntent,
  updateInquiryWorkflow,
  useInquiriesAdmin,
} from "@/lib/api";
import { Inquiry } from "@/lib/types";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminMessage } from "@/components/admin/AdminMessageProvider";

type StatusAction = { status: Inquiry["status"]; zh: string; en: string };

const ZH = {
  pageTitle: "线索管理",
  source: "来源",
  customerName: "客户姓名",
  email: "客户邮箱",
  phone: "客户电话",
  country: "客户国家",
  status: "客户状态",
  tag: "客户标签",
  nextFollowUp: "下次跟进",
  message: "客户留言",
  intentNotes: "意向备注",
  createdAt: "创建时间",
  actions: "操作",
  noTransitions: "无可执行流转",
  followUpDetail: "跟进详情",
  delete: "删除",
  noLeads: "暂无线索",
  statusTransition: "状态流转",
  intentTag: "意向标签",
  nextFollowUpTime: "下次跟进时间",
  followUpNote: "跟进记录",
  abandonReason: "战败原因",
  abandonReasonHint: "例如：价格高 / 暂无需求 / 已在他处采购",
  recentLogs: "最近跟进记录",
  saving: "保存中...",
  save: "确定",
  cancel: "取消",
  quickTransitions: "快捷流转",
  deleteTitle: "删除线索",
  deleteConfirm: "确认删除该线索记录？此操作不可恢复。",
  deleteConfirmBtn: "确认删除",
  filters: "筛选条件",
  dateFrom: "开始日期",
  dateTo: "结束日期",
  convertedOnly: "仅看已成交",
  defeatedOnly: "仅看已战败",
  clearFilters: "清空筛选",
  exportCsv: "导出 CSV",
  exporting: "导出中...",
  leadAlert: "检测到新线索入池",
  sourceGeneral: "通用线索",
  sourceProduct: "产品线索",
};

const STATUS_LABEL: Record<Inquiry["status"], { zh: string; en: string }> = {
  PENDING: { zh: "待跟进", en: "Pending" },
  FOLLOWING: { zh: "跟进中", en: "Following" },
  WAITING_REPLY: { zh: "待回复", en: "Waiting Reply" },
  INTERESTED: { zh: "已意向", en: "Interested" },
  CONVERTED: { zh: "已成交", en: "Converted" },
  ABANDONED: { zh: "已战败", en: "Lost" },
};

const TAG_LABEL: Record<Inquiry["tag"], { zh: string; en: string }> = {
  HIGH: { zh: "高意向", en: "High" },
  MEDIUM: { zh: "中意向", en: "Medium" },
  LOW: { zh: "低意向", en: "Low" },
};

const SOURCE_LABEL: Record<"GENERAL" | "PRODUCT", { zh: string; en: string }> = {
  GENERAL: { zh: ZH.sourceGeneral, en: "General Lead" },
  PRODUCT: { zh: ZH.sourceProduct, en: "Product Lead" },
};

const STATUS_COLOR: Record<Inquiry["status"], string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",
  FOLLOWING: "bg-blue-100 text-blue-700 border-blue-200",
  WAITING_REPLY: "bg-amber-100 text-amber-700 border-amber-200",
  INTERESTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CONVERTED: "bg-green-100 text-green-700 border-green-200",
  ABANDONED: "bg-red-100 text-red-700 border-red-200",
};

const TAG_COLOR: Record<Inquiry["tag"], string> = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
};

const STATUS_ACTIONS: Record<Inquiry["status"], StatusAction[]> = {
  PENDING: [{ status: "FOLLOWING", zh: "开始跟进", en: "Start Follow-up" }],
  FOLLOWING: [
    { status: "WAITING_REPLY", zh: "标记待回复", en: "Mark Waiting" },
    { status: "INTERESTED", zh: "标记已意向", en: "Mark Interested" },
    { status: "ABANDONED", zh: "标记已战败", en: "Mark Lost" },
  ],
  WAITING_REPLY: [
    { status: "FOLLOWING", zh: "再次跟进", en: "Follow-up Again" },
    { status: "INTERESTED", zh: "标记已意向", en: "Mark Interested" },
    { status: "ABANDONED", zh: "标记已战败", en: "Mark Lost" },
  ],
  INTERESTED: [
    { status: "CONVERTED", zh: "标记已成交", en: "Mark Converted" },
    { status: "ABANDONED", zh: "标记已战败", en: "Mark Lost" },
  ],
  CONVERTED: [],
  ABANDONED: [],
};

function toLocalInputValue(value?: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function toIsoOrNull(value: string) {
  if (!value) {
    return null;
  }
  return new Date(value).toISOString();
}

function playLeadAlertSound() {
  try {
    const AudioContextRef = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextRef) return;
    const audioContext = new AudioContextRef();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.26);
  } catch {
    // ignore audio errors in browsers that block autoplay
  }
}

export default function AdminInquiriesPage() {
  const locale = useLocale("zh");
  const { pushMessage } = useAdminMessage();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tagFilter, setTagFilter] = useState<"" | Inquiry["tag"]>("");
  const [convertedOnly, setConvertedOnly] = useState(false);
  const [defeatedOnly, setDefeatedOnly] = useState(false);
  const [exporting, setExporting] = useState(false);

  const statusFilters = useMemo(() => {
    const list: Inquiry["status"][] = [];
    if (convertedOnly) list.push("CONVERTED");
    if (defeatedOnly) list.push("ABANDONED");
    return list;
  }, [convertedOnly, defeatedOnly]);

  const { inquiries, mutate, isLoading } = useInquiriesAdmin({
    lang: locale,
    pageSize: 200,
    statuses: statusFilters.length > 0 ? statusFilters : undefined,
    tag: tagFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const initializedRef = useRef(false);
  const latestCreatedAtRef = useRef("");

  useEffect(() => {
    const poll = () => {
      if (document.visibilityState !== "visible") return;
      if (!navigator.onLine) return;
      mutate();
    };

    const timer = window.setInterval(poll, 20000);
    const handleFocus = () => poll();

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [mutate]);

  useEffect(() => {
    if (!inquiries.length) return;

    const newest = inquiries[0].createdAt;
    if (!initializedRef.current) {
      initializedRef.current = true;
      latestCreatedAtRef.current = newest;
      return;
    }

    const newestTs = new Date(newest).getTime();
    const latestTs = new Date(latestCreatedAtRef.current).getTime();
    if (newestTs > latestTs) {
      latestCreatedAtRef.current = newest;
      playLeadAlertSound();
      pushMessage(locale === "zh" ? ZH.leadAlert : "New lead received", "info");
    }
  }, [inquiries, locale, pushMessage]);

  const [editing, setEditing] = useState<Inquiry | null>(null);
  const [targetStatus, setTargetStatus] = useState<Inquiry["status"] | null>(null);
  const [tag, setTag] = useState<Inquiry["tag"]>("MEDIUM");
  const [intentNotes, setIntentNotes] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [abandonReason, setAbandonReason] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const statusText = useMemo(
    () => (value: Inquiry["status"]) => (locale === "zh" ? STATUS_LABEL[value].zh : STATUS_LABEL[value].en),
    [locale]
  );

  const tagText = useMemo(
    () => (value: Inquiry["tag"]) => (locale === "zh" ? TAG_LABEL[value].zh : TAG_LABEL[value].en),
    [locale]
  );

  const sourceText = useMemo(
    () => (value: "GENERAL" | "PRODUCT") => (locale === "zh" ? SOURCE_LABEL[value].zh : SOURCE_LABEL[value].en),
    [locale]
  );

  const openEditor = (item: Inquiry, actionStatus?: Inquiry["status"]) => {
    setEditing(item);
    setTargetStatus(actionStatus || null);
    setTag(item.tag || "MEDIUM");
    setIntentNotes(item.intentNotes || "");
    setNextFollowUpAt(toLocalInputValue(item.nextFollowUpAt));
    setFollowUpNote("");
    setAbandonReason(item.abandonReason || "");
    setError("");
  };

  const currentActions = editing ? STATUS_ACTIONS[editing.status] : [];

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await downloadInquiriesCsv({
        statuses: statusFilters.length > 0 ? statusFilters : undefined,
        tag: tagFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        lang: locale,
      });

      const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      pushMessage(locale === "zh" ? "CSV 导出成功" : "CSV exported successfully", "success");
    } catch (err: any) {
      pushMessage(err?.message || (locale === "zh" ? "导出失败" : "Export failed"), "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{locale === "zh" ? ZH.pageTitle : "Lead Management"}</h1>

      <div className="rounded border p-4">
        <div className="mb-3 font-medium">{locale === "zh" ? ZH.filters : "Filters"}</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{locale === "zh" ? ZH.dateFrom : "Date From"}</label>
            <input className="h-10 w-full rounded border px-3" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{locale === "zh" ? ZH.dateTo : "Date To"}</label>
            <input className="h-10 w-full rounded border px-3" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{locale === "zh" ? ZH.tag : "Tag"}</label>
            <select className="h-10 w-full rounded border px-3" value={tagFilter} onChange={(e) => setTagFilter(e.target.value as "" | Inquiry["tag"])}>
              <option value="">{locale === "zh" ? "全部标签" : "All Tags"}</option>
              <option value="HIGH">{tagText("HIGH")}</option>
              <option value="MEDIUM">{tagText("MEDIUM")}</option>
              <option value="LOW">{tagText("LOW")}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm md:pt-7">
            <input type="checkbox" checked={convertedOnly} onChange={(e) => setConvertedOnly(e.target.checked)} />
            {locale === "zh" ? ZH.convertedOnly : "Converted only"}
          </label>
          <label className="flex items-center gap-2 text-sm md:pt-7">
            <input type="checkbox" checked={defeatedOnly} onChange={(e) => setDefeatedOnly(e.target.checked)} />
            {locale === "zh" ? ZH.defeatedOnly : "Lost only"}
          </label>
          <div className="flex gap-2 md:pt-7">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setTagFilter("");
                setConvertedOnly(false);
                setDefeatedOnly(false);
              }}
            >
              {locale === "zh" ? ZH.clearFilters : "Clear"}
            </Button>
            <Button type="button" onClick={handleExportCsv} disabled={exporting}>
              {exporting ? (locale === "zh" ? ZH.exporting : "Exporting...") : locale === "zh" ? ZH.exportCsv : "Export CSV"}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2">{locale === "zh" ? ZH.source : "Source"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.customerName : "Name"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.email : "Email"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.phone : "Phone"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.country : "Country"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.status : "Status"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.tag : "Tag"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.nextFollowUp : "Next Follow-up"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.intentNotes : "Intent Notes"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.message : "Message"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.createdAt : "Created At"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.actions : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b align-top">
                <td className="px-3 py-2">
                  <span className="inline-flex rounded-full border bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {sourceText((inquiry.sourceType as "GENERAL" | "PRODUCT") || "PRODUCT")}
                  </span>
                </td>
                <td className="px-3 py-2">{inquiry.fullName}</td>
                <td className="px-3 py-2">{inquiry.email}</td>
                <td className="px-3 py-2">{inquiry.phone || "-"}</td>
                <td className="px-3 py-2">{inquiry.country || "-"}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${STATUS_COLOR[inquiry.status]}`}>
                    {statusText(inquiry.status)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${TAG_COLOR[inquiry.tag]}`}>
                    {tagText(inquiry.tag)}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {inquiry.nextFollowUpAt
                    ? new Date(inquiry.nextFollowUpAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")
                    : "-"}
                </td>
                <td className="max-w-[220px] px-3 py-2 text-muted-foreground">{inquiry.intentNotes || "-"}</td>
                <td className="max-w-[220px] px-3 py-2 text-muted-foreground">{inquiry.message || "-"}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {new Date(inquiry.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}
                </td>
                <td className="space-y-2 px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    {STATUS_ACTIONS[inquiry.status].map((action) => (
                      <Button key={action.status} size="sm" variant="outline" onClick={() => openEditor(inquiry, action.status)}>
                        {locale === "zh" ? action.zh : action.en}
                      </Button>
                    ))}
                    {STATUS_ACTIONS[inquiry.status].length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {locale === "zh" ? ZH.noTransitions : "No transitions"}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => openEditor(inquiry)}>
                      {locale === "zh" ? ZH.followUpDetail : "Follow-up Detail"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(inquiry)}>
                      {locale === "zh" ? ZH.delete : "Delete"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && inquiries.length === 0 && (
              <tr>
                <td colSpan={12} className="px-3 py-4 text-muted-foreground">
                  {locale === "zh" ? ZH.noLeads : "No leads"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(next) => !next && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {targetStatus
                ? `${locale === "zh" ? ZH.statusTransition : "Status Transition"}: ${statusText(editing?.status || "PENDING")} -> ${statusText(targetStatus)}`
                : locale === "zh"
                  ? ZH.followUpDetail
                  : "Follow-up Detail"}
            </DialogTitle>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!editing) return;
              setSaving(true);
              setError("");
              try {
                if (targetStatus) {
                  await updateInquiryWorkflow(editing.id, {
                    status: targetStatus,
                    tag,
                    intentNotes: intentNotes.trim(),
                    note: followUpNote.trim(),
                    nextFollowUpAt: toIsoOrNull(nextFollowUpAt),
                    abandonReason: (targetStatus === "ABANDONED" ? abandonReason : "").trim(),
                  });
                } else {
                  await updateInquiryIntent(editing.id, {
                    tag,
                    intentNotes: intentNotes.trim(),
                    nextFollowUpAt: toIsoOrNull(nextFollowUpAt),
                    abandonReason: abandonReason.trim(),
                    followUpNote: followUpNote.trim(),
                  });
                }
                await mutate();
                setEditing(null);
                setTargetStatus(null);
                pushMessage(locale === "zh" ? "线索更新成功" : "Lead updated successfully", "success");
              } catch (err: any) {
                const message = err?.message || (locale === "zh" ? "保存失败" : "Save failed");
                setError(message);
                pushMessage(message, "error");
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? ZH.intentTag : "Intent Tag"}</label>
              <select className="h-10 w-full rounded border px-3" value={tag} onChange={(e) => setTag(e.target.value as Inquiry["tag"])}>
                {(["HIGH", "MEDIUM", "LOW"] as Inquiry["tag"][]).map((item) => (
                  <option key={item} value={item}>
                    {tagText(item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? ZH.nextFollowUpTime : "Next Follow-up Time"}</label>
              <input
                className="h-10 w-full rounded border px-3"
                type="datetime-local"
                value={nextFollowUpAt}
                onChange={(e) => setNextFollowUpAt(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? ZH.intentNotes : "Intent Notes"}</label>
              <textarea
                className="w-full rounded border px-3 py-2 text-sm"
                rows={3}
                value={intentNotes}
                onChange={(e) => setIntentNotes(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? ZH.followUpNote : "Follow-up Note"}</label>
              <textarea
                className="w-full rounded border px-3 py-2 text-sm"
                rows={3}
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
              />
            </div>

            {targetStatus === "ABANDONED" || editing?.status === "ABANDONED" ? (
              <div className="space-y-1">
                <label className="text-sm font-medium">{locale === "zh" ? ZH.abandonReason : "Lost Reason"}</label>
                <textarea
                  className="w-full rounded border px-3 py-2 text-sm"
                  rows={2}
                  value={abandonReason}
                  onChange={(e) => setAbandonReason(e.target.value)}
                  placeholder={locale === "zh" ? ZH.abandonReasonHint : "e.g. too expensive / no need / bought elsewhere"}
                />
              </div>
            ) : null}

            {editing?.followUpLogs && editing.followUpLogs.length > 0 ? (
              <div className="space-y-2 rounded border p-3">
                <p className="text-sm font-medium">{locale === "zh" ? ZH.recentLogs : "Recent Follow-up Logs"}</p>
                <div className="max-h-40 space-y-2 overflow-y-auto text-xs text-muted-foreground">
                  {editing.followUpLogs
                    .slice()
                    .reverse()
                    .slice(0, 8)
                    .map((item, index) => {
                      const log = item as Record<string, unknown>;
                      const at = typeof log.at === "string" ? log.at : "";
                      const note = typeof log.note === "string" ? log.note : "";
                      const fromStatus = typeof log.fromStatus === "string" ? log.fromStatus : "";
                      const toStatus = typeof log.toStatus === "string" ? log.toStatus : "";
                      return (
                        <div key={`${at}-${index}`} className="rounded bg-muted/40 px-2 py-1">
                          <div>{at ? new Date(at).toLocaleString(locale === "zh" ? "zh-CN" : "en-US") : "-"}</div>
                          <div>
                            {fromStatus && toStatus
                              ? `${statusText(fromStatus as Inquiry["status"])} -> ${statusText(toStatus as Inquiry["status"])}`
                              : "-"}
                          </div>
                          {note ? <div>{note}</div> : null}
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex gap-2">
              <Button disabled={saving}>
                {saving ? (locale === "zh" ? ZH.saving : "Saving...") : locale === "zh" ? ZH.save : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setTargetStatus(null);
                }}
              >
                {locale === "zh" ? ZH.cancel : "Cancel"}
              </Button>
            </div>
          </form>

          {editing && currentActions.length > 0 && !targetStatus ? (
            <div className="space-y-2 border-t pt-3">
              <p className="text-sm font-medium">{locale === "zh" ? ZH.quickTransitions : "Quick Transitions"}</p>
              <div className="flex flex-wrap gap-2">
                {currentActions.map((action) => (
                  <Button key={action.status} variant="outline" size="sm" onClick={() => setTargetStatus(action.status)}>
                    {locale === "zh" ? action.zh : action.en}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        title={locale === "zh" ? ZH.deleteTitle : "Delete Lead"}
        description={locale === "zh" ? ZH.deleteConfirm : "Are you sure to delete this lead? This action cannot be undone."}
        confirmText={locale === "zh" ? ZH.deleteConfirmBtn : "Delete"}
        cancelText={locale === "zh" ? ZH.cancel : "Cancel"}
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await deleteInquiry(deleteTarget.id);
            await mutate();
            setDeleteTarget(null);
            pushMessage(locale === "zh" ? "线索删除成功" : "Lead deleted successfully", "success");
          } catch (err: any) {
            pushMessage(err?.message || (locale === "zh" ? "删除失败" : "Delete failed"), "error");
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}

