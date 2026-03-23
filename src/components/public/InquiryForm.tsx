"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>{t(locale, "inquiry_title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <Label>{t(locale, "inquiry_name")}</Label>
            <Input required value={form.fullName} onChange={(e) => setForm((v) => ({ ...v, fullName: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>{t(locale, "inquiry_email")}</Label>
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>{t(locale, "inquiry_phone")}</Label>
              <Input value={form.phone} onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>{t(locale, "inquiry_country")}</Label>
              <Input value={form.country} onChange={(e) => setForm((v) => ({ ...v, country: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>{t(locale, "inquiry_message")}</Label>
            <textarea
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.message}
              onChange={(e) => setForm((v) => ({ ...v, message: e.target.value }))}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button className="w-full" disabled={submitting}>
            {submitting ? t(locale, "loading") : t(locale, "inquiry_submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
