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

  const supportEmail = settings.support_email || "sales@tengyutruck.com";
  const supportPhone = settings.support_phone || "+86-188-0000-0000";
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
    <div className="bg-slate-50 pb-16">
      <section className="bg-slate-950 py-16 text-white">
        <div className="section-shell">
          <div className="tire-line mb-4" />
          <h1 className="text-5xl font-bold uppercase tracking-tight">{locale === "zh" ? "联系我们" : "Contact Us"}</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            {locale === "zh" ? "提交询盘后，我们会尽快为您匹配车型与方案。" : "Submit your inquiry and we will quickly match your fleet plan."}
          </p>
        </div>
      </section>

      <section className="section-shell -mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="industrial-panel p-6">
          <h2 className="text-3xl font-semibold uppercase tracking-tight">{locale === "zh" ? "联系方式" : "Contact Details"}</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p>Email: {supportEmail}</p>
            <p>{locale === "zh" ? "电话" : "Phone"}: {supportPhone}</p>
            {whatsappLink ? (
              <p>
                WhatsApp:{" "}
                <a className="text-primary hover:underline" href={whatsappLink} target="_blank" rel="noreferrer">
                  {whatsappNumber}
                </a>
              </p>
            ) : null}
            <p>{locale === "zh" ? "地址" : "Address"}: {address}</p>
          </div>
        </div>

        <form
          className="industrial-panel space-y-3 p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setError("");
            setMessage("");
            try {
              const sourceType = form.productId ? "PRODUCT" : "GENERAL";
              await submitInquiry({
                productId: form.productId || undefined,
                sourceType,
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
            <Label className="text-[11px] font-semibold uppercase tracking-[0.15em]">{locale === "zh" ? "意向车型" : "Interested Product"}</Label>
            <select
              className="h-10 w-full rounded-sm border border-input bg-white px-3"
              value={form.productId}
              onChange={(e) => setForm((old) => ({ ...old, productId: e.target.value }))}
            >
              <option value="">{locale === "zh" ? "通用询盘（未指定车型）" : "General Inquiry (No Model Selected)"}</option>
              {products.map((product) => (
                <option value={product.id} key={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.15em]">{locale === "zh" ? "姓名" : "Full Name"}</Label>
              <Input required value={form.fullName} onChange={(e) => setForm((old) => ({ ...old, fullName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.15em]">Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm((old) => ({ ...old, email: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.15em]">{locale === "zh" ? "电话" : "Phone"}</Label>
              <Input value={form.phone} onChange={(e) => setForm((old) => ({ ...old, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.15em]">{locale === "zh" ? "国家" : "Country"}</Label>
              <Input value={form.country} onChange={(e) => setForm((old) => ({ ...old, country: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.15em]">{locale === "zh" ? "留言" : "Message"}</Label>
            <textarea
              rows={4}
              className="w-full rounded-sm border border-input px-3 py-2 text-sm"
              value={form.detail}
              onChange={(e) => setForm((old) => ({ ...old, detail: e.target.value }))}
              placeholder={selectedProduct ? selectedProduct.name : ""}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

          <Button className="h-11 rounded-sm text-xs font-semibold uppercase tracking-[0.16em]" disabled={submitting}>
            {submitting ? (locale === "zh" ? "提交中..." : "Submitting...") : (locale === "zh" ? "提交询盘" : "Submit Inquiry")}
          </Button>
        </form>
      </section>
    </div>
  );
}
