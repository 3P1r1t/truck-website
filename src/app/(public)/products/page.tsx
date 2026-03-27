"use client";

import { useState } from "react";
import { ProductCard } from "@/components/public/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBrands, useCategories, useProducts } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";

export default function ProductsPage() {
  const locale = useLocale();

  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return new URL(window.location.href).searchParams.get("category") || "";
  });

  const { products, isLoading } = useProducts({
    lang: locale,
    search: search || undefined,
    brandId: brandId || undefined,
    categoryId: categoryId || undefined,
    pageSize: 100,
  });
  const { brands } = useBrands(locale);
  const { categories } = useCategories(locale, true);

  return (
    <div className="bg-slate-50 pb-16">
      <section className="bg-slate-950 py-16 text-white">
        <div className="section-shell">
          <div className="tire-line mb-4" />
          <h1 className="text-5xl font-bold uppercase tracking-tight">{t(locale, "nav_products")}</h1>
          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-300">
            {products.length} {t(locale, "common_items")}
          </p>
        </div>
      </section>

      <section className="section-shell -mt-8">
        <div className="industrial-panel p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(locale, "filter_search")}
              className="h-11"
            />
            <select
              className="h-11 rounded-sm border border-input bg-white px-3 text-sm"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
            >
              <option value="">{t(locale, "filter_all_brands")}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-sm border border-input bg-white px-3 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">{t(locale, "filter_all_categories")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              className="h-11 rounded-sm text-xs font-semibold uppercase tracking-[0.15em]"
              onClick={() => {
                setSearch("");
                setBrandId("");
                setCategoryId("");
              }}
            >
              {t(locale, "filter_reset")}
            </Button>
          </div>
        </div>
      </section>

      <section className="section-shell mt-8">
        {isLoading ? (
          <p className="text-slate-500">{t(locale, "loading")}</p>
        ) : products.length === 0 ? (
          <p className="text-slate-500">{t(locale, "empty_products")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
