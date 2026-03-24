"use client";

import { useMemo, useState } from "react";
import { submitInquiry, useProducts, useSettings } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { getSettingValueByLocale } from "@/lib/i18n";
import { buildWhatsAppLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const locale = useLocale();
  const { products } = useProducts({ lang: locale, pageSize: 100 });
  const { settings } = useSettings(locale);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    productId: "",
    fullName: "",
    email: "",
    phone: "",
    country: "",
    detail: "",
  });

  const supportEmail = settings.support_email || "support@example.com";
  const supportPhone = settings.support_phone || "+1-000-000-0000";
  const whatsappNumber = settings.whatsapp_number || supportPhone;
  const whatsappMessage = getSettingValueByLocale(
    settings,
    "whatsapp_message",
    locale,
    locale === "zh" ? "您好，我想咨询卡车方案。" : "Hello, I would like to discuss truck options."
  );
  const whatsappLink = buildWhatsAppLink(whatsappNumber, whatsappMessage);
  const address = getSettingValueByLocale(settings, "contact_address", locale, "");

  const selectedProduct = useMemo(() => products.find((item) => item.id === form.productId), [products, form.productId]);

  return (
    <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{locale === "zh" ? "联系我们" : "Contact Us"}</h1>
        <p className="text-muted-foreground">
          {locale === "zh" ? "提交询盘后，我们将尽快与您联系。" : "Submit your inquiry and our team will contact you soon."}
        </p>
        <div className="rounded border p-4 text-sm text-muted-foreground">
          <p>Email: {supportEmail}</p>
          <p>{locale === "zh" ? "电话" : "Phone"}: {supportPhone}</p>
          {whatsappLink ? (
            <p>
              WhatsApp: <a className="text-green-700 hover:underline" href={whatsappLink} target="_blank" rel="noreferrer">{whatsappNumber}</a>
            </p>
          ) : null}
          <p>{locale === "zh" ? "地址" : "Address"}: {address}</p>
        </div>
      </div>

      <form
        className="space-y-3 rounded border p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setSubmitting(true);
          setError("");
          setMessage("");
          try {
            await submitInquiry({
              productId: form.productId,
              fullName: form.fullName,
              email: form.email,
              phone: form.phone || undefined,
              country: form.country || undefined,
              message: form.detail || undefined,
            });
            setMessage(locale === "zh" ? "提交成功，我们会尽快联系您。" : "Submitted successfully. We will contact you soon.");
            setForm({ productId: "", fullName: "", email: "", phone: "", country: "", detail: "" });
          } catch (err: any) {
            setError(err?.message || "Submit failed");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="space-y-1">
          <Label>{locale === "zh" ? "意向车型" : "Interested Product"}</Label>
          <select
            required
            className="h-10 w-full rounded border px-3"
            value={form.productId}
            onChange={(e) => setForm((old) => ({ ...old, productId: e.target.value }))}
          >
            <option value="">{locale === "zh" ? "请选择" : "Select"}</option>
            {products.map((product) => (
              <option value={product.id} key={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>{locale === "zh" ? "姓名" : "Full Name"}</Label>
            <Input required value={form.fullName} onChange={(e) => setForm((old) => ({ ...old, fullName: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" required value={form.email} onChange={(e) => setForm((old) => ({ ...old, email: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>{locale === "zh" ? "电话" : "Phone"}</Label>
            <Input value={form.phone} onChange={(e) => setForm((old) => ({ ...old, phone: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>{locale === "zh" ? "国家" : "Country"}</Label>
            <Input value={form.country} onChange={(e) => setForm((old) => ({ ...old, country: e.target.value }))} />
          </div>
        </div>

        <div className="space-y-1">
          <Label>{locale === "zh" ? "留言" : "Message"}</Label>
          <textarea
            rows={4}
            className="w-full rounded border px-3 py-2 text-sm"
            value={form.detail}
            onChange={(e) => setForm((old) => ({ ...old, detail: e.target.value }))}
            placeholder={selectedProduct ? selectedProduct.name : ""}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <Button disabled={submitting}>{submitting ? (locale === "zh" ? "提交中..." : "Submitting...") : (locale === "zh" ? "提交询盘" : "Submit Inquiry")}</Button>
      </form>
    </div>
  );
}
