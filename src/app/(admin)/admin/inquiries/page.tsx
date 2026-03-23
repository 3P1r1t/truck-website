"use client";

import { deleteInquiry, updateInquiryIntent, updateInquiryStatus, useInquiriesAdmin } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";

const STATUSES = ["NEW", "IN_PROGRESS", "RESPONDED", "COMPLETED", "CLOSED"] as const;
const INTENTS = ["NONE", "LOW", "MEDIUM", "HIGH"] as const;

export default function AdminInquiriesPage() {
  const locale = useLocale();
  const { inquiries, mutate } = useInquiriesAdmin({ lang: locale, pageSize: 200 });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{locale === "zh" ? "询盘管理" : "Inquiry Management"}</h1>

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Intent</th>
              <th className="px-3 py-2">Message</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b align-top">
                <td className="px-3 py-2">{inquiry.product?.name || inquiry.productId}</td>
                <td className="px-3 py-2">{inquiry.fullName}</td>
                <td className="px-3 py-2">{inquiry.email}</td>
                <td className="px-3 py-2">
                  <select
                    className="h-8 rounded border px-2"
                    value={inquiry.status}
                    onChange={async (e) => {
                      await updateInquiryStatus(inquiry.id, e.target.value as any);
                      await mutate();
                    }}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    className="h-8 rounded border px-2"
                    value={inquiry.intentLevel}
                    onChange={async (e) => {
                      await updateInquiryIntent(inquiry.id, e.target.value as any, inquiry.intentNotes || "");
                      await mutate();
                    }}
                  >
                    {INTENTS.map((intent) => (
                      <option key={intent} value={intent}>
                        {intent}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="max-w-[220px] px-3 py-2 text-muted-foreground">{inquiry.message}</td>
                <td className="space-x-2 px-3 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const notes = window.prompt("Intent notes", inquiry.intentNotes || "") || "";
                      await updateInquiryIntent(inquiry.id, inquiry.intentLevel, notes);
                      await mutate();
                    }}
                  >
                    Notes
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!window.confirm("Delete this inquiry?")) return;
                      await deleteInquiry(inquiry.id);
                      await mutate();
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-muted-foreground">
                  No inquiries
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
