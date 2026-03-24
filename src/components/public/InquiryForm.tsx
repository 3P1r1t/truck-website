"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InquiryForm({ productId }: { productId: string }) {
  const locale = useLocale();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      await submitInquiry({
        productId,
        sourceType: "PRODUCT",
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        country: form.country || undefined,
        message: form.message || undefined,
      });

      setSuccess(t(locale, "inquiry_success"));
      setForm({ fullName: "", email: "", phone: "", country: "", message: "" });
    } catch (err: any) {
      setError(err?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="industrial-panel p-5">
      <h3 className="text-2xl font-semibold uppercase tracking-tight">{t(locale, "inquiry_title")}</h3>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold uppercase tracking-[0.15em]">{t(locale, "inquiry_name")}</Label>
          <Input required value={form.fullName} onChange={(e) => setForm((v) => ({ ...v, fullName: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold uppercase tracking-[0.15em]">{t(locale, "inquiry_email")}</Label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.15em]">{t(locale, "inquiry_phone")}</Label>
            <Input value={form.phone} onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.15em]">{t(locale, "inquiry_country")}</Label>
            <Input value={form.country} onChange={(e) => setForm((v) => ({ ...v, country: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold uppercase tracking-[0.15em]">{t(locale, "inquiry_message")}</Label>
          <textarea
            rows={4}
            className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
            value={form.message}
            onChange={(e) => setForm((v) => ({ ...v, message: e.target.value }))}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
        <Button className="h-11 w-full rounded-sm text-xs font-semibold uppercase tracking-[0.15em]" disabled={submitting}>
          {submitting ? t(locale, "loading") : t(locale, "inquiry_submit")}
        </Button>
      </form>
    </div>
  );
}
