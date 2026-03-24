"use client";

import { useMemo, useState } from "react";
import { deleteInquiry, updateInquiryIntent, updateInquiryWorkflow, useInquiriesAdmin } from "@/lib/api";
import { Inquiry } from "@/lib/types";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type StatusAction = { status: Inquiry["status"]; zh: string; en: string };

const ZH = {
  pageTitle: "\u8BE2\u76D8\u7BA1\u7406",
  product: "\u4EA7\u54C1",
  customer: "\u5BA2\u6237",
  status: "\u72B6\u6001",
  tag: "\u6807\u7B7E",
  nextFollowUp: "\u4E0B\u6B21\u8DDF\u8FDB",
  message: "\u7559\u8A00",
  actions: "\u64CD\u4F5C",
  noTransitions: "\u65E0\u53EF\u6267\u884C\u6D41\u8F6C",
  followUpDetail: "\u8DDF\u8FDB\u8BE6\u60C5",
  delete: "\u5220\u9664",
  noInquiries: "\u6682\u65E0\u8BE2\u76D8",
  statusTransition: "\u72B6\u6001\u6D41\u8F6C",
  intentTag: "\u610F\u5411\u6807\u7B7E",
  nextFollowUpTime: "\u4E0B\u6B21\u8DDF\u8FDB\u65F6\u95F4",
  intentNotes: "\u610F\u5411\u5907\u6CE8",
  followUpNote: "\u8DDF\u8FDB\u8BB0\u5F55",
  abandonReason: "\u653E\u5F03\u539F\u56E0",
  abandonReasonHint: "\u4F8B\u5982\uFF1A\u4EF7\u683C\u9AD8 / \u4E0D\u9700\u8981 / \u5DF2\u8D2D\u4E70 / \u9519\u53F7",
  recentLogs: "\u6700\u8FD1\u8DDF\u8FDB\u8BB0\u5F55",
  saveFailed: "\u4FDD\u5B58\u5931\u8D25",
  saving: "\u4FDD\u5B58\u4E2D...",
  save: "\u786E\u5B9A",
  cancel: "\u53D6\u6D88",
  quickTransitions: "\u5FEB\u6377\u6D41\u8F6C",
  deleteTitle: "\u5220\u9664\u8BE2\u76D8",
  deleteConfirm: "\u786E\u8BA4\u5220\u9664\u8BE5\u8BE2\u76D8\u8BB0\u5F55\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\u3002",
  deleteConfirmBtn: "\u786E\u8BA4\u5220\u9664",
};

const STATUS_LABEL: Record<Inquiry["status"], { zh: string; en: string }> = {
  PENDING: { zh: "\u5F85\u8DDF\u8FDB", en: "Pending" },
  FOLLOWING: { zh: "\u8DDF\u8FDB\u4E2D", en: "Following" },
  WAITING_REPLY: { zh: "\u5F85\u56DE\u590D", en: "Waiting Reply" },
  INTERESTED: { zh: "\u5DF2\u610F\u5411", en: "Interested" },
  CONVERTED: { zh: "\u5DF2\u6210\u4EA4", en: "Converted" },
  ABANDONED: { zh: "\u5DF2\u653E\u5F03", en: "Abandoned" },
};

const TAG_LABEL: Record<Inquiry["tag"], { zh: string; en: string }> = {
  HIGH: { zh: "\u9AD8\u610F\u5411", en: "High" },
  MEDIUM: { zh: "\u4E2D\u7B49\u610F\u5411", en: "Medium" },
  LOW: { zh: "\u4F4E\u610F\u5411", en: "Low" },
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
  PENDING: [{ status: "FOLLOWING", zh: "\u5F00\u59CB\u8DDF\u8FDB", en: "Start Follow-up" }],
  FOLLOWING: [
    { status: "WAITING_REPLY", zh: "\u6807\u8BB0\u5F85\u56DE\u590D", en: "Mark Waiting" },
    { status: "INTERESTED", zh: "\u6807\u8BB0\u5DF2\u610F\u5411", en: "Mark Interested" },
    { status: "ABANDONED", zh: "\u6807\u8BB0\u5DF2\u653E\u5F03", en: "Mark Abandoned" },
  ],
  WAITING_REPLY: [
    { status: "FOLLOWING", zh: "\u518D\u6B21\u8DDF\u8FDB", en: "Follow-up Again" },
    { status: "INTERESTED", zh: "\u6807\u8BB0\u5DF2\u610F\u5411", en: "Mark Interested" },
    { status: "ABANDONED", zh: "\u6807\u8BB0\u5DF2\u653E\u5F03", en: "Mark Abandoned" },
  ],
  INTERESTED: [
    { status: "CONVERTED", zh: "\u5DF2\u6210\u4EA4", en: "Mark Converted" },
    { status: "ABANDONED", zh: "\u5DF2\u653E\u5F03", en: "Mark Abandoned" },
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

export default function AdminInquiriesPage() {
  const locale = useLocale();
  const { inquiries, mutate } = useInquiriesAdmin({ lang: locale, pageSize: 200 });

  const [editing, setEditing] = useState<Inquiry | null>(null);
  const [targetStatus, setTargetStatus] = useState<Inquiry["status"] | null>(null);
  const [tag, setTag] = useState<Inquiry["tag"]>("MEDIUM");
  const [intentNotes, setIntentNotes] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [abandonReason, setAbandonReason] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const statusText = useMemo(
    () => (value: Inquiry["status"]) => (locale === "zh" ? STATUS_LABEL[value].zh : STATUS_LABEL[value].en),
    [locale]
  );

  const tagText = useMemo(
    () => (value: Inquiry["tag"]) => (locale === "zh" ? TAG_LABEL[value].zh : TAG_LABEL[value].en),
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{locale === "zh" ? ZH.pageTitle : "Inquiry Management"}</h1>

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2">{locale === "zh" ? ZH.product : "Product"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.customer : "Customer"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.status : "Status"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.tag : "Tag"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.nextFollowUp : "Next Follow-up"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.message : "Message"}</th>
              <th className="px-3 py-2">{locale === "zh" ? ZH.actions : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b align-top">
                <td className="px-3 py-2">{inquiry.product?.name || inquiry.productId}</td>
                <td className="px-3 py-2">
                  <div>{inquiry.fullName}</div>
                  <div className="text-xs text-muted-foreground">{inquiry.email}</div>
                </td>
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
                <td className="max-w-[220px] px-3 py-2 text-muted-foreground">{inquiry.message || "-"}</td>
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
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-muted-foreground">
                  {locale === "zh" ? ZH.noInquiries : "No inquiries"}
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
              } catch (err: any) {
                setError(err?.message || (locale === "zh" ? ZH.saveFailed : "Save failed"));
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
                <label className="text-sm font-medium">{locale === "zh" ? ZH.abandonReason : "Abandon Reason"}</label>
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

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "zh" ? ZH.deleteTitle : "Delete Inquiry"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {locale === "zh" ? ZH.deleteConfirm : "Are you sure to delete this inquiry? This action cannot be undone."}
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
              {locale === "zh" ? ZH.deleteConfirmBtn : "Delete"}
            </Button>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {locale === "zh" ? ZH.cancel : "Cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
