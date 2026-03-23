"use client";

import { useMemo, useState } from "react";
import {
  addProductImageByUrl,
  createBrand,
  createCategory,
  createFuelType,
  createProduct,
  deleteBrand,
  deleteCategory,
  deleteFuelType,
  deleteProduct,
  deleteProductImage,
  updateBrand,
  updateCategory,
  updateFuelType,
  updateProduct,
  useBrands,
  useCategories,
  useFuelTypes,
  useProducts,
} from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { Product } from "@/lib/types";
import { formatPriceRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/ProductForm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TabKey = "products" | "brands" | "categories" | "fuel-types";
type NameDraft = { id?: string; name: string; nameZh: string; isActive?: boolean };

function NameEditor({
  locale,
  title,
  open,
  draft,
  onChange,
  onClose,
  onSubmit,
  showStatus,
}: {
  locale: "en" | "zh";
  title: string;
  open: boolean;
  draft: NameDraft;
  onChange: (next: NameDraft) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  showStatus?: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setError("");
            try {
              await onSubmit();
            } catch (err: any) {
              setError(err?.message || (locale === "zh" ? "保存失败" : "Save failed"));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="space-y-1">
            <label className="text-sm font-medium">Name(EN)</label>
            <input
              className="h-10 w-full rounded border px-3"
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Name(Zh)</label>
            <input
              className="h-10 w-full rounded border px-3"
              value={draft.nameZh}
              onChange={(e) => onChange({ ...draft, nameZh: e.target.value })}
            />
          </div>

          {showStatus ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.isActive ?? true}
                onChange={(e) => onChange({ ...draft, isActive: e.target.checked })}
              />
              {locale === "zh" ? "启用" : "Active"}
            </label>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex gap-2">
            <Button disabled={submitting}>{submitting ? (locale === "zh" ? "保存中..." : "Saving...") : (locale === "zh" ? "确定" : "Save")}</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              {locale === "zh" ? "取消" : "Cancel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminProductsPage() {
  const locale = useLocale();
  const { products, mutate: mutateProducts } = useProducts({ lang: locale, pageSize: 200, includeInactive: true });
  const { brands, mutate: mutateBrands } = useBrands(locale, true);
  const { categories, mutate: mutateCategories } = useCategories(locale, true, true);
  const { fuelTypes, mutate: mutateFuelTypes } = useFuelTypes(locale);

  const [tab, setTab] = useState<TabKey>("products");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");

  const [brandEditorOpen, setBrandEditorOpen] = useState(false);
  const [brandDraft, setBrandDraft] = useState<NameDraft>({ name: "", nameZh: "", isActive: true });

  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState<NameDraft>({ name: "", nameZh: "", isActive: true });

  const [fuelTypeEditorOpen, setFuelTypeEditorOpen] = useState(false);
  const [fuelTypeDraft, setFuelTypeDraft] = useState<NameDraft>({ name: "", nameZh: "" });

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId]
  );

  const fuelTypeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    fuelTypes.forEach((item) => {
      map.set(item.key, item.name);
      map.set(item.nameEn, item.name);
    });
    return map;
  }, [fuelTypes]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "products", label: locale === "zh" ? "产品列表" : "Products" },
    { key: "brands", label: locale === "zh" ? "品牌管理" : "Brands" },
    { key: "categories", label: locale === "zh" ? "分类管理" : "Categories" },
    { key: "fuel-types", label: locale === "zh" ? "燃料类型" : "Fuel Types" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{locale === "zh" ? "产品管理" : "Product Management"}</h1>

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((item) => (
          <Button
            key={item.key}
            variant={tab === item.key ? "default" : "outline"}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {tab === "products" ? (
        <section className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{locale === "zh" ? "产品列表" : "Products"}</h2>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
            >
              {locale === "zh" ? "新增产品" : "New Product"}
            </Button>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-3 py-2">{locale === "zh" ? "名称" : "Name"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? "品牌" : "Brand"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? "分类" : "Category"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? "燃料" : "Fuel"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? "价格" : "Price"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? "状态" : "Status"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? "操作" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="px-3 py-2">{product.name}</td>
                    <td className="px-3 py-2">{product.brand?.name || "-"}</td>
                    <td className="px-3 py-2">{product.category?.name || "-"}</td>
                    <td className="px-3 py-2">{fuelTypeNameMap.get(product.fuelType || "") || product.fuelType || "-"}</td>
                    <td className="px-3 py-2">
                      {formatPriceRange(
                        product.basePrice,
                        product.maxPrice,
                        product.currency,
                        locale === "zh" ? "zh-CN" : "en-US"
                      )}
                    </td>
                    <td className="px-3 py-2">{product.isActive ? (locale === "zh" ? "启用" : "Active") : (locale === "zh" ? "停用" : "Inactive")}</td>
                    <td className="space-x-2 px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingProduct(product);
                          setProductModalOpen(true);
                        }}
                      >
                        {locale === "zh" ? "编辑" : "Edit"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedProductId(product.id)}>
                        {locale === "zh" ? "图片" : "Images"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!window.confirm(locale === "zh" ? "确认删除该产品？" : "Delete this product?")) return;
                          await deleteProduct(product.id);
                          await mutateProducts();
                        }}
                      >
                        {locale === "zh" ? "删除" : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={7}>
                      {locale === "zh" ? "暂无产品" : "No products"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "brands" ? (
        <section className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{locale === "zh" ? "品牌管理" : "Brands"}</h2>
            <Button
              onClick={() => {
                setBrandDraft({ name: "", nameZh: "", isActive: true });
                setBrandEditorOpen(true);
              }}
            >
              {locale === "zh" ? "新增品牌" : "New Brand"}
            </Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-3 py-2">Name(EN)</th>
                  <th className="px-3 py-2">Name(Zh)</th>
                  <th className="px-3 py-2">{locale === "zh" ? "状态" : "Status"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? "操作" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} className="border-b">
                    <td className="px-3 py-2">{brand.nameEn}</td>
                    <td className="px-3 py-2">{brand.nameZh || "-"}</td>
                    <td className="px-3 py-2">{brand.isActive ? (locale === "zh" ? "启用" : "Active") : (locale === "zh" ? "停用" : "Inactive")}</td>
                    <td className="space-x-2 px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBrandDraft({ id: brand.id, name: brand.nameEn, nameZh: brand.nameZh || "", isActive: brand.isActive });
                          setBrandEditorOpen(true);
                        }}
                      >
                        {locale === "zh" ? "编辑" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!window.confirm(locale === "zh" ? "确认删除该品牌？" : "Delete this brand?")) return;
                          await deleteBrand(brand.id);
                          await mutateBrands();
                        }}
                      >
                        {locale === "zh" ? "删除" : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "categories" ? (
        <section className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{locale === "zh" ? "分类管理" : "Categories"}</h2>
            <Button
              onClick={() => {
                setCategoryDraft({ name: "", nameZh: "", isActive: true });
                setCategoryEditorOpen(true);
              }}
            >
              {locale === "zh" ? "新增分类" : "New Category"}
            </Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-3 py-2">Name(EN)</th>
                  <th className="px-3 py-2">Name(Zh)</th>
                  <th className="px-3 py-2">{locale === "zh" ? "状态" : "Status"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? "操作" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b">
                    <td className="px-3 py-2">{category.nameEn}</td>
                    <td className="px-3 py-2">{category.nameZh || "-"}</td>
                    <td className="px-3 py-2">{category.isActive ? (locale === "zh" ? "启用" : "Active") : (locale === "zh" ? "停用" : "Inactive")}</td>
                    <td className="space-x-2 px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCategoryDraft({ id: category.id, name: category.nameEn, nameZh: category.nameZh || "", isActive: category.isActive });
                          setCategoryEditorOpen(true);
                        }}
                      >
                        {locale === "zh" ? "编辑" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!window.confirm(locale === "zh" ? "确认删除该分类？" : "Delete this category?")) return;
                          await deleteCategory(category.id);
                          await mutateCategories();
                        }}
                      >
                        {locale === "zh" ? "删除" : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "fuel-types" ? (
        <section className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{locale === "zh" ? "燃料类型" : "Fuel Types"}</h2>
            <Button
              onClick={() => {
                setFuelTypeDraft({ name: "", nameZh: "" });
                setFuelTypeEditorOpen(true);
              }}
            >
              {locale === "zh" ? "新增燃料类型" : "New Fuel Type"}
            </Button>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-3 py-2">Name(EN)</th>
                  <th className="px-3 py-2">Name(Zh)</th>
                  <th className="px-3 py-2">{locale === "zh" ? "操作" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {fuelTypes.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-3 py-2">{item.nameEn}</td>
                    <td className="px-3 py-2">{item.nameZh || "-"}</td>
                    <td className="space-x-2 px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFuelTypeDraft({ id: item.id, name: item.nameEn, nameZh: item.nameZh || "" });
                          setFuelTypeEditorOpen(true);
                        }}
                      >
                        {locale === "zh" ? "编辑" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!window.confirm(locale === "zh" ? "确认删除该燃料类型？" : "Delete this fuel type?")) return;
                          await deleteFuelType(item.id);
                          await mutateFuelTypes();
                        }}
                      >
                        {locale === "zh" ? "删除" : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {fuelTypes.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={3}>
                      {locale === "zh" ? "暂无燃料类型" : "No fuel types"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <Dialog open={productModalOpen} onOpenChange={(next) => !next && setProductModalOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? (locale === "zh" ? "编辑产品" : "Edit Product") : (locale === "zh" ? "新增产品" : "New Product")}</DialogTitle>
          </DialogHeader>
          <ProductForm
            key={editingProduct?.id || "create"}
            locale={locale}
            brands={brands}
            categories={categories}
            fuelTypes={fuelTypes}
            initial={editingProduct || undefined}
            onCancel={() => setProductModalOpen(false)}
            onSubmit={async (payload) => {
              if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
              } else {
                await createProduct(payload);
              }
              await mutateProducts();
              setProductModalOpen(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(next) => !next && setSelectedProductId("") }>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {locale === "zh" ? "图片管理" : "Image Manager"}
              {selectedProduct ? ` - ${selectedProduct.name}` : ""}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded border p-3">
                  <h3 className="font-medium">{locale === "zh" ? "本地上传" : "Upload Image"}</h3>
                  <ImageUploader productId={selectedProduct.id} onUploaded={mutateProducts} />
                </div>
                <div className="space-y-2 rounded border p-3">
                  <h3 className="font-medium">{locale === "zh" ? "添加图片链接" : "Add Image URL"}</h3>
                  <input
                    className="h-10 w-full rounded border px-3"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  {imageError ? <p className="text-sm text-destructive">{imageError}</p> : null}
                  <Button
                    onClick={async () => {
                      try {
                        setImageError("");
                        await addProductImageByUrl(selectedProduct.id, { imageUrl, imageType: "detail" });
                        setImageUrl("");
                        await mutateProducts();
                      } catch (err: any) {
                        setImageError(err?.message || (locale === "zh" ? "添加失败" : "Failed to add image URL"));
                      }
                    }}
                  >
                    {locale === "zh" ? "添加" : "Add"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {selectedProduct.images.map((image) => (
                  <div key={image.id} className="space-y-2 rounded border p-2">
                    <img src={image.url} alt={image.altText || "img"} className="h-28 w-full rounded object-cover" />
                    <div className="flex items-center justify-between text-xs">
                      <span>{image.isPrimary ? (locale === "zh" ? "主图" : "Main") : (locale === "zh" ? "详情图" : "Detail")}</span>
                      <button
                        className="text-red-600"
                        onClick={async () => {
                          if (!window.confirm(locale === "zh" ? "确认删除该图片？" : "Delete this image?")) return;
                          await deleteProductImage(selectedProduct.id, image.id);
                          await mutateProducts();
                        }}
                      >
                        {locale === "zh" ? "删除" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <NameEditor
        locale={locale}
        title={brandDraft.id ? (locale === "zh" ? "编辑品牌" : "Edit Brand") : (locale === "zh" ? "新增品牌" : "New Brand")}
        open={brandEditorOpen}
        draft={brandDraft}
        showStatus
        onChange={setBrandDraft}
        onClose={() => setBrandEditorOpen(false)}
        onSubmit={async () => {
          if (brandDraft.id) {
            await updateBrand(brandDraft.id, {
              name: brandDraft.name,
              nameZh: brandDraft.nameZh,
              isActive: brandDraft.isActive,
            });
          } else {
            await createBrand({ name: brandDraft.name, nameZh: brandDraft.nameZh, isActive: brandDraft.isActive });
          }
          await mutateBrands();
          setBrandEditorOpen(false);
        }}
      />

      <NameEditor
        locale={locale}
        title={categoryDraft.id ? (locale === "zh" ? "编辑分类" : "Edit Category") : (locale === "zh" ? "新增分类" : "New Category")}
        open={categoryEditorOpen}
        draft={categoryDraft}
        showStatus
        onChange={setCategoryDraft}
        onClose={() => setCategoryEditorOpen(false)}
        onSubmit={async () => {
          if (categoryDraft.id) {
            await updateCategory(categoryDraft.id, {
              name: categoryDraft.name,
              nameZh: categoryDraft.nameZh,
              isActive: categoryDraft.isActive,
            });
          } else {
            await createCategory({ name: categoryDraft.name, nameZh: categoryDraft.nameZh, isActive: categoryDraft.isActive });
          }
          await mutateCategories();
          setCategoryEditorOpen(false);
        }}
      />

      <NameEditor
        locale={locale}
        title={fuelTypeDraft.id ? (locale === "zh" ? "编辑燃料类型" : "Edit Fuel Type") : (locale === "zh" ? "新增燃料类型" : "New Fuel Type")}
        open={fuelTypeEditorOpen}
        draft={fuelTypeDraft}
        onChange={setFuelTypeDraft}
        onClose={() => setFuelTypeEditorOpen(false)}
        onSubmit={async () => {
          if (fuelTypeDraft.id) {
            await updateFuelType(fuelTypeDraft.id, {
              name: fuelTypeDraft.name,
              nameZh: fuelTypeDraft.nameZh,
            });
          } else {
            await createFuelType({ name: fuelTypeDraft.name, nameZh: fuelTypeDraft.nameZh });
          }
          await mutateFuelTypes();
          setFuelTypeEditorOpen(false);
        }}
      />
    </div>
  );
}
