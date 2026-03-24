"use client";

import { useMemo, useState } from "react";
import { submitInquiry, useSettings } from "@/lib/api";
import { getSettingValueByLocale } from "@/lib/i18n";
import { t } from "@/lib/site-dictionary";
import { useLocale } from "@/lib/use-locale";
import { buildWhatsAppLink, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContactProductOption = {
  id: string;
  name: string;
};

type CountryOption = {
  value: string;
  en: string;
  zh: string;
};

type ContactMethodCardProps = {
  title?: string;
  sourceType?: "GENERAL" | "PRODUCT";
  defaultProductId?: string;
  defaultProductName?: string;
  allowProductSelect?: boolean;
  productOptions?: ContactProductOption[];
  contextNote?: string;
  className?: string;
  dark?: boolean;
};

const COUNTRY_OPTIONS: CountryOption[] = [
  { value: "CN", en: "China", zh: "中国" },
  { value: "US", en: "United States", zh: "美国" },
  { value: "CA", en: "Canada", zh: "加拿大" },
  { value: "MX", en: "Mexico", zh: "墨西哥" },
  { value: "BR", en: "Brazil", zh: "巴西" },
  { value: "AR", en: "Argentina", zh: "阿根廷" },
  { value: "GB", en: "United Kingdom", zh: "英国" },
  { value: "DE", en: "Germany", zh: "德国" },
  { value: "FR", en: "France", zh: "法国" },
  { value: "IT", en: "Italy", zh: "意大利" },
  { value: "ES", en: "Spain", zh: "西班牙" },
  { value: "RU", en: "Russia", zh: "俄罗斯" },
  { value: "TR", en: "Turkey", zh: "土耳其" },
  { value: "SA", en: "Saudi Arabia", zh: "沙特阿拉伯" },
  { value: "AE", en: "United Arab Emirates", zh: "阿联酋" },
  { value: "EG", en: "Egypt", zh: "埃及" },
  { value: "ZA", en: "South Africa", zh: "南非" },
  { value: "NG", en: "Nigeria", zh: "尼日利亚" },
  { value: "IN", en: "India", zh: "印度" },
  { value: "PK", en: "Pakistan", zh: "巴基斯坦" },
  { value: "TH", en: "Thailand", zh: "泰国" },
  { value: "VN", en: "Vietnam", zh: "越南" },
  { value: "MY", en: "Malaysia", zh: "马来西亚" },
  { value: "ID", en: "Indonesia", zh: "印度尼西亚" },
  { value: "PH", en: "Philippines", zh: "菲律宾" },
  { value: "JP", en: "Japan", zh: "日本" },
  { value: "KR", en: "South Korea", zh: "韩国" },
  { value: "AU", en: "Australia", zh: "澳大利亚" },
  { value: "NZ", en: "New Zealand", zh: "新西兰" },
  { value: "OTHER", en: "Other", zh: "其他" },
];

export function ContactMethodCard({
  title,
  sourceType = "GENERAL",
  defaultProductId,
  defaultProductName,
  allowProductSelect = false,
  productOptions = [],
  contextNote,
  className,
  dark = false,
}: ContactMethodCardProps) {
  const locale = useLocale();
  const { settings } = useSettings(locale);

  const [mode, setMode] = useState<"FORM" | "WHATSAPP">("FORM");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    productId: defaultProductId || "",
    fullName: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  });

  const selectedProductName = useMemo(() => {
    if (defaultProductName) {
      return defaultProductName;
    }
    const selected = productOptions.find((item) => item.id === form.productId);
    return selected?.name || "";
  }, [defaultProductName, form.productId, productOptions]);

  const supportPhone = settings.support_phone || "+86-188-0000-0000";
  const whatsappNumber = settings.whatsapp_number || supportPhone;
  const defaultWhatsAppMessage = getSettingValueByLocale(
    settings,
    "whatsapp_message",
    locale,
    locale === "zh" ? "您好，我想咨询卡车方案。" : "Hello, I would like to discuss truck options."
  );

  const whatsappText = [
    defaultWhatsAppMessage,
    selectedProductName ? `${locale === "zh" ? "意向车型" : "Interested model"}: ${selectedProductName}` : "",
    contextNote || "",
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappLink = buildWhatsAppLink(whatsappNumber, whatsappText);

  return (
    <div className={cn("space-y-4", className)}>
      {title ? <h3 className={cn("text-2xl font-semibold uppercase tracking-tight", dark ? "text-white" : "")}>{title}</h3> : null}

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={mode === "FORM" ? "default" : "outline"}
          className="h-10 rounded-sm text-xs font-semibold uppercase tracking-[0.14em]"
          onClick={() => setMode("FORM")}
        >
          {t(locale, "contact_option_form")}
        </Button>
        <Button
          type="button"
          variant={mode === "WHATSAPP" ? "default" : "outline"}
          className="h-10 rounded-sm text-xs font-semibold uppercase tracking-[0.14em]"
          onClick={() => setMode("WHATSAPP")}
        >
          {t(locale, "contact_option_whatsapp")}
        </Button>
      </div>

      {mode === "WHATSAPP" ? (
        <div className={cn("rounded-sm border p-4 text-sm", dark ? "border-white/20 bg-white/10 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-600")}>
          <p>{locale === "zh" ? "点击下方按钮，直接通过 WhatsApp 联系我们。" : "Click the button below to contact us directly on WhatsApp."}</p>
          <div className="mt-3">
            {whatsappLink ? (
              <Button asChild className="h-10 rounded-sm text-xs font-semibold uppercase tracking-[0.14em]">
                <a href={whatsappLink} target="_blank" rel="noreferrer">
                  {t(locale, "contact_start_whatsapp")}
                </a>
              </Button>
            ) : (
              <p className="text-sm text-destructive">{locale === "zh" ? "未配置 WhatsApp 联系方式" : "WhatsApp number is not configured"}</p>
            )}
          </div>
        </div>
      ) : (
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setSuccess("");
            setError("");

            try {
              const finalProductId = defaultProductId || (allowProductSelect ? form.productId || undefined : undefined);
              const finalSourceType = finalProductId ? "PRODUCT" : sourceType;
              const mergedMessage = [
                selectedProductName ? `${locale === "zh" ? "意向车型" : "Interested model"}: ${selectedProductName}` : "",
                contextNote || "",
                form.message.trim(),
              ]
                .filter(Boolean)
                .join("\n");

              await submitInquiry({
                productId: finalProductId,
                sourceType: finalSourceType,
                fullName: form.fullName,
                email: form.email,
                phone: form.phone || undefined,
                country: form.country || undefined,
                message: mergedMessage || undefined,
              });

              setSuccess(t(locale, "inquiry_success"));
              setForm((old) => ({
                ...old,
                productId: defaultProductId || "",
                fullName: "",
                email: "",
                phone: "",
                country: "",
                message: "",
              }));
            } catch (err: any) {
              setError(err?.message || "Submit failed");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {allowProductSelect && !defaultProductId ? (
            <div className="space-y-1">
              <Label className={cn("text-[11px] font-semibold uppercase tracking-[0.15em]", dark ? "text-slate-200" : "")}> 
                {locale === "zh" ? "意向车型" : "Interested Product"}
              </Label>
              <select
                className="h-10 w-full rounded-sm border border-input bg-white px-3 text-sm text-slate-900"
                value={form.productId}
                onChange={(e) => setForm((old) => ({ ...old, productId: e.target.value }))}
              >
                <option value="">{locale === "zh" ? "通用询盘（未指定车型）" : "General Inquiry (No Model Selected)"}</option>
                {productOptions.map((product) => (
                  <option value={product.id} key={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className={cn("text-[11px] font-semibold uppercase tracking-[0.15em]", dark ? "text-slate-200" : "")}>{t(locale, "inquiry_name")}</Label>
              <Input required value={form.fullName} onChange={(e) => setForm((old) => ({ ...old, fullName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className={cn("text-[11px] font-semibold uppercase tracking-[0.15em]", dark ? "text-slate-200" : "")}>{t(locale, "inquiry_email")}</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm((old) => ({ ...old, email: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className={cn("text-[11px] font-semibold uppercase tracking-[0.15em]", dark ? "text-slate-200" : "")}>{t(locale, "inquiry_phone")}</Label>
              <Input value={form.phone} onChange={(e) => setForm((old) => ({ ...old, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className={cn("text-[11px] font-semibold uppercase tracking-[0.15em]", dark ? "text-slate-200" : "")}>{t(locale, "inquiry_country")}</Label>
              <select
                className="h-10 w-full rounded-sm border border-input bg-white px-3 text-sm text-slate-900"
                value={form.country}
                onChange={(e) => setForm((old) => ({ ...old, country: e.target.value }))}
              >
                <option value="">{locale === "zh" ? "请选择国家" : "Select Country"}</option>
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country.value} value={country.value}>
                    {locale === "zh" ? country.zh : country.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className={cn("text-[11px] font-semibold uppercase tracking-[0.15em]", dark ? "text-slate-200" : "")}>{t(locale, "inquiry_message")}</Label>
            <textarea
              rows={4}
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm text-slate-900"
              value={form.message}
              onChange={(e) => setForm((old) => ({ ...old, message: e.target.value }))}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

          <Button className="h-11 rounded-sm text-xs font-semibold uppercase tracking-[0.15em]" disabled={submitting}>
            {submitting ? t(locale, "loading") : t(locale, "inquiry_submit")}
          </Button>
        </form>
      )}
    </div>
  );
}
