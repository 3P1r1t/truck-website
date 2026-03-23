"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ProductGallery } from "@/components/public/ProductGallery";
import { InquiryForm } from "@/components/public/InquiryForm";
import { useFuelTypes, useProduct } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";

export default function ProductDetailPage() {
  const locale = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const { product, isLoading } = useProduct(slug, locale);
  const { fuelTypes } = useFuelTypes(locale);

  const fuelTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    fuelTypes.forEach((item) => {
      map.set(item.key, item.name);
      map.set(item.nameEn, item.name);
    });
    return map;
  }, [fuelTypes]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">{t(locale, "loading")}</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8">{t(locale, "not_found")}</div>;
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-2 text-muted-foreground">{product.shortDescription || product.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} />
        <div className="space-y-6">
          <div>
            <p className="text-3xl font-bold text-primary">
              {formatPrice(product.basePrice, product.currency, locale === "zh" ? "zh-CN" : "en-US")}
            </p>
          </div>

          <InquiryForm productId={product.id} />
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-2xl font-semibold">{t(locale, "product_specs")}</h2>
        <div className="overflow-hidden rounded border">
          {[
            [locale === "zh" ? "品牌" : "Brand", product.brand?.name || "-"],
            [locale === "zh" ? "分类" : "Category", product.category?.name || "-"],
            [locale === "zh" ? "燃料类型" : "Fuel Type", fuelTypeMap.get(product.fuelType || "") || product.fuelType || "-"],
            [locale === "zh" ? "发动机功率" : "Engine Power", product.enginePower ? `${product.enginePower} hp` : "-"],
            [locale === "zh" ? "轴距" : "Wheelbase", product.wheelbase ? `${product.wheelbase} mm` : "-"],
            [locale === "zh" ? "驱动形式" : "Drive", product.driveType || "-"],
            [locale === "zh" ? "货箱长度" : "Cargo Length", product.cargoLengthMm ? `${product.cargoLengthMm} mm` : "-"],
            [locale === "zh" ? "货箱容积" : "Cargo Volume", product.cargoVolumeCubicM ? `${product.cargoVolumeCubicM} m³` : "-"],
            [locale === "zh" ? "电池容量" : "Battery", product.batteryCapacityKwh ? `${product.batteryCapacityKwh} kWh` : "-"],
            [locale === "zh" ? "排放标准" : "Emission", product.emissionStandard || "-"],
            [locale === "zh" ? "整备质量" : "Weight", product.weightKg ? `${product.weightKg} kg` : "-"],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-2 border-b px-4 py-2 text-sm last:border-b-0">
              <span className="text-muted-foreground">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </section>

      {product.description ? (
        <section>
          <h2 className="mb-3 text-2xl font-semibold">{locale === "zh" ? "产品描述" : "Description"}</h2>
          <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{product.description}</div>
        </section>
      ) : null}
    </div>
  );
}
