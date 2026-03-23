"use client";

import { useState } from "react";
import { Brand, Category, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductPayload = {
  brandId: string;
  categoryId: string;
  name: string;
  nameZh?: string;
  slug?: string;
  description?: string;
  descriptionZh?: string;
  shortDescription?: string;
  shortDescriptionZh?: string;
  basePrice: number;
  currency: string;
  fuelType?: string;
  enginePower?: number;
  wheelbase?: number;
  driveType?: string;
  cargoLengthMm?: number;
  cargoVolumeCubicM?: number;
  batteryCapacityKwh?: number;
  emissionStandard?: string;
  weightKg?: number;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
};

export function ProductForm({
  brands,
  categories,
  initial,
  onSubmit,
  onCancel,
}: {
  brands: Brand[];
  categories: Category[];
  initial?: Product;
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<ProductPayload>({
    brandId: initial?.brand?.id || brands[0]?.id || "",
    categoryId: initial?.category?.id || categories[0]?.id || "",
    name: initial?.nameEn || "",
    nameZh: initial?.nameZh || "",
    slug: initial?.slug || "",
    description: initial?.descriptionEn || "",
    descriptionZh: initial?.descriptionZh || "",
    shortDescription: initial?.shortDescriptionEn || "",
    shortDescriptionZh: initial?.shortDescriptionZh || "",
    basePrice: initial?.basePrice || 0,
    currency: initial?.currency || "USD",
    fuelType: initial?.fuelType || "",
    enginePower: initial?.enginePower || undefined,
    wheelbase: initial?.wheelbase || undefined,
    driveType: initial?.driveType || "",
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

  const update = (key: keyof ProductPayload, value: any) => {
    setForm((old) => ({ ...old, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
          await onSubmit(form);
        } catch (err: any) {
          setError(err?.message || "Submit failed");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Name (EN)</Label>
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Name (ZH)</Label>
          <Input value={form.nameZh || ""} onChange={(e) => update("nameZh", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Brand</Label>
          <select className="h-10 w-full rounded border px-3" value={form.brandId} onChange={(e) => update("brandId", e.target.value)}>
            {brands.map((brand) => (
              <option value={brand.id} key={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <select className="h-10 w-full rounded border px-3" value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label>Base Price</Label>
          <Input type="number" value={form.basePrice} onChange={(e) => update("basePrice", Number(e.target.value))} required />
        </div>
        <div className="space-y-1">
          <Label>Currency</Label>
          <Input value={form.currency} onChange={(e) => update("currency", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Fuel Type</Label>
          <Input value={form.fuelType || ""} onChange={(e) => update("fuelType", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Short Description (EN)</Label>
          <textarea className="w-full rounded border px-3 py-2 text-sm" rows={3} value={form.shortDescription || ""} onChange={(e) => update("shortDescription", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Short Description (ZH)</Label>
          <textarea className="w-full rounded border px-3 py-2 text-sm" rows={3} value={form.shortDescriptionZh || ""} onChange={(e) => update("shortDescriptionZh", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Description (EN)</Label>
          <textarea className="w-full rounded border px-3 py-2 text-sm" rows={5} value={form.description || ""} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Description (ZH)</Label>
          <textarea className="w-full rounded border px-3 py-2 text-sm" rows={5} value={form.descriptionZh || ""} onChange={(e) => update("descriptionZh", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} />
          Active
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
