"use client";

import { useMemo, useState } from "react";
import { deleteInquiry, updateInquiryIntent, updateInquiryWorkflow, useInquiriesAdmin } from "@/lib/api";
import { Inquiry } from "@/lib/types";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type StatusAction = { status: Inquiry["status"]; zh: string; en: string };

const STATUS_LABEL: Record<Inquiry["status"], { zh: string; en: string }> = {
  PENDING: { zh: "������", en: "Pending" },
  FOLLOWING: { zh: "������", en: "Following" },
  WAITING_REPLY: { zh: "���ظ�", en: "Waiting Reply" },
  INTERESTED: { zh: "������", en: "Interested" },
  CONVERTED: { zh: "�ѳɽ�", en: "Converted" },
  ABANDONED: { zh: "�ѷ���", en: "Abandoned" },
};

const TAG_LABEL: Record<Inquiry["tag"], { zh: string; en: string }> = {
  HIGH: { zh: "������", en: "High" },
  MEDIUM: { zh: "�е�����", en: "Medium" },
  LOW: { zh: "������", en: "Low" },
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
  PENDING: [{ status: "FOLLOWING", zh: "��ʼ����", en: "Start Follow-up" }],
  FOLLOWING: [
    { status: "WAITING_REPLY", zh: "��Ǵ��ظ�", en: "Mark Waiting" },
    { status: "INTERESTED", zh: "���������", en: "Mark Interested" },
    { status: "ABANDONED", zh: "����ѷ���", en: "Mark Abandoned" },
  ],
  WAITING_REPLY: [
    { status: "FOLLOWING", zh: "�ٴθ���", en: "Follow-up Again" },
    { status: "INTERESTED", zh: "���������", en: "Mark Interested" },
    { status: "ABANDONED", zh: "����ѷ���", en: "Mark Abandoned" },
  ],
  INTERESTED: [
    { status: "CONVERTED", zh: "�ѳɽ�", en: "Mark Converted" },
    { status: "ABANDONED", zh: "�ѷ���", en: "Mark Abandoned" },
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
      <h1 className="text-3xl font-bold">{locale === "zh" ? "ѯ�̹���" : "Inquiry Management"}</h1>

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2">{locale === "zh" ? "��Ʒ" : "Product"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "�ͻ�" : "Customer"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "״̬" : "Status"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "��ǩ" : "Tag"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "�´θ���" : "Next Follow-up"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "����" : "Message"}</th>
              <th className="px-3 py-2">{locale === "zh" ? "����" : "Actions"}</th>
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
                  {inquiry.nextFollowUpAt ? new Date(inquiry.nextFollowUpAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US") : "-"}
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
                      <span className="text-xs text-muted-foreground">{locale === "zh" ? "�޿�ִ����ת" : "No transitions"}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => openEditor(inquiry)}>
                      {locale === "zh" ? "��������" : "Follow-up Detail"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(inquiry)}>
                      {locale === "zh" ? "ɾ��" : "Delete"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-muted-foreground">
                  {locale === "zh" ? "����ѯ��" : "No inquiries"}
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
                ? `${locale === "zh" ? "״̬��ת" : "Status Transition"}: ${statusText(editing?.status || "PENDING")} -> ${statusText(targetStatus)}`
                : locale === "zh"
                  ? "��������"
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
                setError(err?.message || (locale === "zh" ? "����ʧ��" : "Save failed"));
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "�����ǩ" : "Intent Tag"}</label>
              <select className="h-10 w-full rounded border px-3" value={tag} onChange={(e) => setTag(e.target.value as Inquiry["tag"])}>
                {(["HIGH", "MEDIUM", "LOW"] as Inquiry["tag"][]).map((item) => (
                  <option key={item} value={item}>
                    {tagText(item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "�´θ���ʱ��" : "Next Follow-up Time"}</label>
              <input
                className="h-10 w-full rounded border px-3"
                type="datetime-local"
                value={nextFollowUpAt}
                onChange={(e) => setNextFollowUpAt(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "����ע" : "Intent Notes"}</label>
              <textarea
                className="w-full rounded border px-3 py-2 text-sm"
                rows={3}
                value={intentNotes}
                onChange={(e) => setIntentNotes(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{locale === "zh" ? "������¼" : "Follow-up Note"}</label>
              <textarea
                className="w-full rounded border px-3 py-2 text-sm"
                rows={3}
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
              />
            </div>

            {targetStatus === "ABANDONED" || editing?.status === "ABANDONED" ? (
              <div className="space-y-1">
                <label className="text-sm font-medium">{locale === "zh" ? "����ԭ��" : "Abandon Reason"}</label>
                <textarea
                  className="w-full rounded border px-3 py-2 text-sm"
                  rows={2}
                  value={abandonReason}
                  onChange={(e) => setAbandonReason(e.target.value)}
                  placeholder={locale === "zh" ? "���磺�۸�� / ����Ҫ / ���� / ���" : "e.g. too expensive / no need / bought elsewhere"}
                />
              </div>
            ) : null}

            {editing?.followUpLogs && editing.followUpLogs.length > 0 ? (
              <div className="space-y-2 rounded border p-3">
                <p className="text-sm font-medium">{locale === "zh" ? "���������¼" : "Recent Follow-up Logs"}</p>
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
                            {fromStatus && toStatus ? `${statusText(fromStatus as Inquiry["status"])} -> ${statusText(toStatus as Inquiry["status"])}` : "-"}
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
              <Button disabled={saving}>{saving ? (locale === "zh" ? "������..." : "Saving...") : locale === "zh" ? "ȷ��" : "Save"}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setTargetStatus(null);
                }}
              >
                {locale === "zh" ? "ȡ��" : "Cancel"}
              </Button>
            </div>
          </form>

          {editing && currentActions.length > 0 && !targetStatus ? (
            <div className="space-y-2 border-t pt-3">
              <p className="text-sm font-medium">{locale === "zh" ? "�����ת" : "Quick Transitions"}</p>
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
            <DialogTitle>{locale === "zh" ? "ɾ��ѯ��" : "Delete Inquiry"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {locale === "zh" ? "ȷ��ɾ����ѯ�̼�¼���˲������ɻָ���" : "Are you sure to delete this inquiry? This action cannot be undone."}
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
              {locale === "zh" ? "ȷ��ɾ��" : "Delete"}
            </Button>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {locale === "zh" ? "ȡ��" : "Cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
