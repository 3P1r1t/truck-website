"use client";

import { useEffect, useState } from "react";
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
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    setCategoryId(url.searchParams.get("category") || "");
  }, []);

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">{t(locale, "nav_products")}</h1>
      <p className="mb-6 text-muted-foreground">
        {products.length} {t(locale, "common_items")}
      </p>

      <div className="mb-6 grid grid-cols-1 gap-3 rounded border bg-muted/30 p-4 md:grid-cols-4">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t(locale, "filter_search")} />
        <select className="h-10 rounded border px-3" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
          <option value="">{t(locale, "filter_all_brands")}</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <select className="h-10 rounded border px-3" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">{t(locale, "filter_all_categories")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setBrandId("");
            setCategoryId("");
          }}
        >
          {t(locale, "filter_reset")}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t(locale, "loading")}</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">{t(locale, "empty_products")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
