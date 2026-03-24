"use client";

import { useState } from "react";
import { Brand, Category, DriveTypeOption, FuelTypeOption, Product } from "@/lib/types";
import { Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminMessage } from "@/components/admin/AdminMessageProvider";

type ProductPayload = {
  brandId: string;
  categoryId: string;
  name: string;
  nameZh?: string;
  description?: string;
  descriptionZh?: string;
  shortDescription?: string;
  shortDescriptionZh?: string;
  basePrice: number;
  maxPrice?: number;
  currency: "RMB" | "USD" | "EUR";
  fuelType?: string;
  driveType?: string;
  enginePower?: number;
  wheelbase?: number;
  cargoLengthMm?: number;
  cargoVolumeCubicM?: number;
  batteryCapacityKwh?: number;
  emissionStandard?: string;
  weightKg?: number;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
};

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b pb-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
    </div>
  );
}

function RequiredMark() {
  return <span className="ml-1 text-destructive">*</span>;
}

export function ProductForm({
  locale,
  brands,
  categories,
  fuelTypes,
  driveTypes,
  initial,
  onSubmit,
  onCancel,
}: {
  locale: Locale;
  brands: Brand[];
  categories: Category[];
  fuelTypes: FuelTypeOption[];
  driveTypes: DriveTypeOption[];
  initial?: Product;
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onCancel?: () => void;
}) {
  const { pushMessage } = useAdminMessage();
  const [form, setForm] = useState<ProductPayload>({
    brandId: initial?.brand?.id || brands[0]?.id || "",
    categoryId: initial?.category?.id || categories[0]?.id || "",
    name: initial?.nameEn || "",
    nameZh: initial?.nameZh || "",
    description: initial?.descriptionEn || "",
    descriptionZh: initial?.descriptionZh || "",
    shortDescription: initial?.shortDescriptionEn || "",
    shortDescriptionZh: initial?.shortDescriptionZh || "",
    basePrice: initial?.basePrice || 0,
    maxPrice: initial?.maxPrice || initial?.basePrice || 0,
    currency: (initial?.currency as "RMB" | "USD" | "EUR") || "USD",
    fuelType: initial?.fuelType || "",
    driveType: initial?.driveType || "",
    enginePower: initial?.enginePower || undefined,
    wheelbase: initial?.wheelbase || undefined,
    cargoLengthMm: initial?.cargoLengthMm || undefined,
    cargoVolumeCubicM: initial?.cargoVolumeCubicM || undefined,
    batteryCapacityKwh: initial?.batteryCapacityKwh || undefined,
    emissionStandard: initial?.emissionStandard || "",
    weightKg: initial?.weightKg || undefined,
    isFeatured: initial?.isFeatured || false,
    isActive: initial?.isActive ?? true,
    sortOrder: initial?.sortOrder || 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof ProductPayload>(key: K, value: ProductPayload[K]) => {
    setForm((old) => ({ ...old, [key]: value }));
  };
  const toOptionalNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : undefined;
  };

  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
          await onSubmit(form);
        } catch (err: any) {
          const message = err?.message || (locale === "zh" ? "\u63D0\u4EA4\u5931\u8D25" : "Submit failed");
          setError(message);
          pushMessage(message, "error");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <section className="space-y-4 rounded border p-4">
        <SectionTitle title={locale === "zh" ? "\u57FA\u7840\u4FE1\u606F" : "Basic Information"} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>
              Name(EN)
              <RequiredMark />
            </Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>
              Name(ZH)
              <RequiredMark />
            </Label>
            <Input value={form.nameZh || ""} onChange={(e) => update("nameZh", e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>
              {locale === "zh" ? "\u54C1\u724C" : "Brand"}
              <RequiredMark />
            </Label>
            <select
              className="h-10 w-full rounded border px-3"
              value={form.brandId}
              onChange={(e) => update("brandId", e.target.value)}
              required
            >
              {brands.map((brand) => (
                <option value={brand.id} key={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>
              {locale === "zh" ? "\u5206\u7C7B" : "Category"}
              <RequiredMark />
            </Label>
            <select
              className="h-10 w-full rounded border px-3"
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              required
            >
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded border p-4">
        <SectionTitle title={locale === "zh" ? "\u4EF7\u683C\u4E0E\u5C5E\u6027" : "Pricing & Attributes"} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>
              {locale === "zh" ? "\u6700\u4F4E\u4EF7" : "Min Price"}
              <RequiredMark />
            </Label>
            <Input type="number" value={form.basePrice} onChange={(e) => update("basePrice", Number(e.target.value))} required />
          </div>
          <div className="space-y-1">
            <Label>
              {locale === "zh" ? "\u6700\u9AD8\u4EF7" : "Max Price"}
              <RequiredMark />
            </Label>
            <Input type="number" value={form.maxPrice ?? 0} onChange={(e) => update("maxPrice", Number(e.target.value))} required />
          </div>
          <div className="space-y-1">
            <Label>
              {locale === "zh" ? "\u8D27\u5E01" : "Currency"}
              <RequiredMark />
            </Label>
            <select
              className="h-10 w-full rounded border px-3"
              value={form.currency}
              onChange={(e) => update("currency", e.target.value as ProductPayload["currency"])}
              required
            >
              <option value="RMB">RMB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>{locale === "zh" ? "\u71C3\u6599\u7C7B\u578B" : "Fuel Type"}</Label>
            <select
              className="h-10 w-full rounded border px-3"
              value={form.fuelType || ""}
              onChange={(e) => update("fuelType", e.target.value)}
            >
              <option value="">{locale === "zh" ? "\u8BF7\u9009\u62E9" : "Select"}</option>
              {fuelTypes.map((item) => (
                <option key={item.id} value={item.key}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>{locale === "zh" ? "\u9A71\u52A8\u5F62\u5F0F" : "Drive Type"}</Label>
            <select
              className="h-10 w-full rounded border px-3"
              value={form.driveType || ""}
              onChange={(e) => update("driveType", e.target.value)}
            >
              <option value="">{locale === "zh" ? "\u8BF7\u9009\u62E9" : "Select"}</option>
              {driveTypes.map((item) => (
                <option key={item.id} value={item.key}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded border p-4">
        <SectionTitle title={locale === "zh" ? "\u63CF\u8FF0\u4FE1\u606F" : "Descriptions"} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Short Description (EN)</Label>
            <textarea
              className="w-full rounded border px-3 py-2 text-sm"
              rows={3}
              value={form.shortDescription || ""}
              onChange={(e) => update("shortDescription", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Short Description (ZH)</Label>
            <textarea
              className="w-full rounded border px-3 py-2 text-sm"
              rows={3}
              value={form.shortDescriptionZh || ""}
              onChange={(e) => update("shortDescriptionZh", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Description (EN)</Label>
            <textarea
              className="w-full rounded border px-3 py-2 text-sm"
              rows={5}
              value={form.description || ""}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Description (ZH)</Label>
            <textarea
              className="w-full rounded border px-3 py-2 text-sm"
              rows={5}
              value={form.descriptionZh || ""}
              onChange={(e) => update("descriptionZh", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded border p-4">
        <SectionTitle title={locale === "zh" ? "\u6280\u672F\u53C2\u6570" : "Technical Specifications"} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>{locale === "zh" ? "\u53D1\u52A8\u673A\u529F\u7387(HP)" : "Engine Power (HP)"}</Label>
            <Input
              type="number"
              value={form.enginePower ?? ""}
              onChange={(e) => update("enginePower", toOptionalNumber(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>{locale === "zh" ? "\u8F74\u8DDD(mm)" : "Wheelbase (mm)"}</Label>
            <Input
              type="number"
              value={form.wheelbase ?? ""}
              onChange={(e) => update("wheelbase", toOptionalNumber(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>{locale === "zh" ? "\u8D27\u7BB1\u957F\u5EA6(mm)" : "Cargo Length (mm)"}</Label>
            <Input
              type="number"
              value={form.cargoLengthMm ?? ""}
              onChange={(e) => update("cargoLengthMm", toOptionalNumber(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>{locale === "zh" ? "\u8D27\u7BB1\u5BB9\u79EF(m\u00B3)" : "Cargo Volume (m\u00B3)"}</Label>
            <Input
              type="number"
              value={form.cargoVolumeCubicM ?? ""}
              onChange={(e) => update("cargoVolumeCubicM", toOptionalNumber(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>{locale === "zh" ? "\u7535\u6C60\u5BB9\u91CF(kWh)" : "Battery Capacity (kWh)"}</Label>
            <Input
              type="number"
              value={form.batteryCapacityKwh ?? ""}
              onChange={(e) => update("batteryCapacityKwh", toOptionalNumber(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>{locale === "zh" ? "\u6574\u5907\u8D28\u91CF(kg)" : "Weight (kg)"}</Label>
            <Input
              type="number"
              value={form.weightKg ?? ""}
              onChange={(e) => update("weightKg", toOptionalNumber(e.target.value))}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>{locale === "zh" ? "\u6392\u653E\u6807\u51C6" : "Emission Standard"}</Label>
            <Input
              value={form.emissionStandard || ""}
              onChange={(e) => update("emissionStandard", e.target.value)}
              placeholder={locale === "zh" ? "\u4F8B\u5982\uff1aEURO-5 / EURO-6" : "e.g. EURO-5 / EURO-6"}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded border p-4">
        <SectionTitle title={locale === "zh" ? "\u5C55\u793A\u8BBE\u7F6E" : "Display Settings"} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>{locale === "zh" ? "\u6392\u5E8F" : "Sort Order"}</Label>
            <Input type="number" value={form.sortOrder} onChange={(e) => update("sortOrder", Number(e.target.value) || 0)} />
          </div>
          <div className="flex items-center gap-6 pt-7">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} />
              {locale === "zh" ? "\u9996\u9875\u63A8\u8350" : "Featured"}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} />
              {locale === "zh" ? "\u542F\u7528" : "Active"}
            </label>
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button disabled={submitting}>
          {submitting ? (locale === "zh" ? "\u4FDD\u5B58\u4E2D..." : "Saving...") : locale === "zh" ? "\u786E\u5B9A" : "Save"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {locale === "zh" ? "\u53D6\u6D88" : "Cancel"}
          </Button>
        )}
      </div>
    </form>
  );
}
