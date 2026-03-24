"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ProductGallery } from "@/components/public/ProductGallery";
import { InquiryForm } from "@/components/public/InquiryForm";
import { useDriveTypes, useFuelTypes, useProduct } from "@/lib/api";
import { formatPriceRange } from "@/lib/utils";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";

export default function ProductDetailPage() {
  const locale = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const { product, isLoading } = useProduct(slug, locale);
  const { fuelTypes } = useFuelTypes(locale);
  const { driveTypes } = useDriveTypes(locale);

  const fuelTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    fuelTypes.forEach((item) => {
      map.set(item.key, item.name);
      map.set(item.nameEn, item.name);
    });
    return map;
  }, [fuelTypes]);

  const driveTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    driveTypes.forEach((item) => {
      map.set(item.key, item.name);
      map.set(item.nameEn, item.name);
    });
    return map;
  }, [driveTypes]);

  if (isLoading) {
    return <div className="section-shell py-10">{t(locale, "loading")}</div>;
  }

  if (!product) {
    return <div className="section-shell py-10">{t(locale, "not_found")}</div>;
  }

  const specRows: Array<[string, string]> = [
    [locale === "zh" ? "品牌" : "Brand", product.brand?.name || "-"],
    [locale === "zh" ? "分类" : "Category", product.category?.name || "-"],
    [
      locale === "zh" ? "燃料类型" : "Fuel Type",
      fuelTypeMap.get(product.fuelType || "") || product.fuelType || "-",
    ],
    [locale === "zh" ? "发动机功率" : "Engine Power", product.enginePower ? `${product.enginePower} hp` : "-"],
    [locale === "zh" ? "轴距" : "Wheelbase", product.wheelbase ? `${product.wheelbase} mm` : "-"],
    [
      locale === "zh" ? "驱动形式" : "Drive",
      driveTypeMap.get(product.driveType || "") || product.driveType || "-",
    ],
    [locale === "zh" ? "货箱长度" : "Cargo Length", product.cargoLengthMm ? `${product.cargoLengthMm} mm` : "-"],
    [locale === "zh" ? "货箱容积" : "Cargo Volume", product.cargoVolumeCubicM ? `${product.cargoVolumeCubicM} m³` : "-"],
    [locale === "zh" ? "电池容量" : "Battery", product.batteryCapacityKwh ? `${product.batteryCapacityKwh} kWh` : "-"],
    [locale === "zh" ? "排放标准" : "Emission", product.emissionStandard || "-"],
    [locale === "zh" ? "整备质量" : "Weight", product.weightKg ? `${product.weightKg} kg` : "-"],
  ];

  return (
    <div className="bg-slate-50 pb-14">
      <section className="bg-slate-950 py-14 text-white">
        <div className="section-shell">
          <p className="industrial-kicker text-red-300">{product.category?.name || "Commercial Vehicles"}</p>
          <h1 className="mt-3 text-5xl font-bold uppercase tracking-tight">{product.name}</h1>
          <p className="mt-4 max-w-3xl text-slate-300">{product.shortDescription || product.description}</p>
          <p className="mt-6 text-3xl font-semibold text-white">
            {formatPriceRange(
              product.basePrice,
              product.maxPrice,
              product.currency,
              locale === "zh" ? "zh-CN" : "en-US"
            )}
          </p>
        </div>
      </section>

      <section className="section-shell -mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} />
        <InquiryForm productId={product.id} productName={product.name} />
      </section>

      <section className="section-shell mt-10 space-y-8">
        <div className="industrial-panel overflow-hidden">
          <h2 className="border-b border-slate-100 px-5 py-4 text-2xl font-semibold uppercase tracking-tight">
            {t(locale, "product_specs")}
          </h2>
          {specRows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-2 border-b px-5 py-3 text-sm last:border-b-0">
              <span className="text-slate-500">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>

        {product.description ? (
          <div className="industrial-panel p-5">
            <h2 className="text-2xl font-semibold uppercase tracking-tight">{locale === "zh" ? "产品描述" : "Description"}</h2>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{product.description}</div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

