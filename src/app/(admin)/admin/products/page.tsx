"use client";

import { useMemo, useState } from "react";
import {
  addProductImageByUrl,
  createBrand,
  createCategory,
  createDriveType,
  createFuelType,
  createProduct,
  deleteBrand,
  deleteCategory,
  deleteDriveType,
  deleteFuelType,
  deleteProduct,
  deleteProductImage,
  updateBrand,
  updateCategory,
  updateDriveType,
  updateFuelType,
  updateProduct,
  useBrands,
  useCategories,
  useDriveTypes,
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

type TabKey = "products" | "brands" | "categories" | "fuel-types" | "drive-types";
type NameDraft = { id?: string; name: string; nameZh: string; isActive?: boolean };

const ZH = {
  title: "\u4EA7\u54C1\u7BA1\u7406",
  products: "\u4EA7\u54C1\u5217\u8868",
  brands: "\u54C1\u724C\u7BA1\u7406",
  categories: "\u5206\u7C7B\u7BA1\u7406",
  fuelTypes: "\u71C3\u6599\u7C7B\u578B",
  driveTypes: "\u9A71\u52A8\u7C7B\u578B",
  newProduct: "\u65B0\u589E\u4EA7\u54C1",
  editProduct: "\u7F16\u8F91\u4EA7\u54C1",
  name: "\u540D\u79F0",
  brand: "\u54C1\u724C",
  category: "\u5206\u7C7B",
  fuel: "\u71C3\u6599",
  drive: "\u9A71\u52A8",
  price: "\u4EF7\u683C",
  status: "\u72B6\u6001",
  actions: "\u64CD\u4F5C",
  image: "\u56FE\u7247",
  active: "\u542F\u7528",
  inactive: "\u505C\u7528",
  edit: "\u7F16\u8F91",
  del: "\u5220\u9664",
  cancel: "\u53D6\u6D88",
  save: "\u786E\u5B9A",
  saving: "\u4FDD\u5B58\u4E2D...",
  saveFailed: "\u4FDD\u5B58\u5931\u8D25",
  noProducts: "\u6682\u65E0\u4EA7\u54C1",
  noItems: "\u6682\u65E0\u6570\u636E",
  imageManager: "\u56FE\u7247\u7BA1\u7406",
  uploadLocal: "\u672C\u5730\u4E0A\u4F20",
  addImageUrl: "\u6DFB\u52A0\u56FE\u7247\u94FE\u63A5",
  add: "\u6DFB\u52A0",
  addFailed: "\u6DFB\u52A0\u5931\u8D25",
  mainImage: "\u4E3B\u56FE",
  detailImage: "\u8BE6\u60C5\u56FE",
};

function NameEditor({
  locale, open, title, draft, onChange, onClose, onSubmit, showStatus,
}: {
  locale: "en" | "zh";
  open: boolean;
  title: string;
  draft: NameDraft;
  onChange: (next: NameDraft) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  showStatus?: boolean;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setError("");
            try { await onSubmit(); } catch (err: any) { setError(err?.message || (locale === "zh" ? ZH.saveFailed : "Save failed")); }
            finally { setSaving(false); }
          }}
        >
          <div className="space-y-1"><label className="text-sm font-medium">Name(EN)</label><input className="h-10 w-full rounded border px-3" value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} required /></div>
          <div className="space-y-1"><label className="text-sm font-medium">Name(ZH)</label><input className="h-10 w-full rounded border px-3" value={draft.nameZh} onChange={(e) => onChange({ ...draft, nameZh: e.target.value })} /></div>
          {showStatus ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isActive ?? true} onChange={(e) => onChange({ ...draft, isActive: e.target.checked })} />{locale === "zh" ? ZH.active : "Active"}</label> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button disabled={saving}>{saving ? (locale === "zh" ? ZH.saving : "Saving...") : locale === "zh" ? ZH.save : "Save"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>{locale === "zh" ? ZH.cancel : "Cancel"}</Button>
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
  const { driveTypes, mutate: mutateDriveTypes } = useDriveTypes(locale);

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
  const [driveTypeEditorOpen, setDriveTypeEditorOpen] = useState(false);
  const [driveTypeDraft, setDriveTypeDraft] = useState<NameDraft>({ name: "", nameZh: "" });

  const selectedProduct = useMemo(() => products.find((p) => p.id === selectedProductId), [products, selectedProductId]);
  const fuelMap = useMemo(() => new Map(fuelTypes.flatMap((x) => [[x.key, x.name], [x.nameEn, x.name]] as const)), [fuelTypes]);
  const driveMap = useMemo(() => new Map(driveTypes.flatMap((x) => [[x.key, x.name], [x.nameEn, x.name]] as const)), [driveTypes]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "products", label: locale === "zh" ? ZH.products : "Products" },
    { key: "brands", label: locale === "zh" ? ZH.brands : "Brands" },
    { key: "categories", label: locale === "zh" ? ZH.categories : "Categories" },
    { key: "fuel-types", label: locale === "zh" ? ZH.fuelTypes : "Fuel Types" },
    { key: "drive-types", label: locale === "zh" ? ZH.driveTypes : "Drive Types" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{locale === "zh" ? ZH.title : "Product Management"}</h1>

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((item) => (
          <Button key={item.key} variant={tab === item.key ? "default" : "outline"} onClick={() => setTab(item.key)}>
            {item.label}
          </Button>
        ))}
      </div>

      {tab === "products" ? (
        <section className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{locale === "zh" ? ZH.products : "Products"}</h2>
            <Button onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}>{locale === "zh" ? ZH.newProduct : "New Product"}</Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-3 py-2">{locale === "zh" ? ZH.name : "Name"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.brand : "Brand"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.category : "Category"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.fuel : "Fuel"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.drive : "Drive"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.price : "Price"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.status : "Status"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.actions : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="px-3 py-2">{product.name}</td>
                    <td className="px-3 py-2">{product.brand?.name || "-"}</td>
                    <td className="px-3 py-2">{product.category?.name || "-"}</td>
                    <td className="px-3 py-2">{fuelMap.get(product.fuelType || "") || product.fuelType || "-"}</td>
                    <td className="px-3 py-2">{driveMap.get(product.driveType || "") || product.driveType || "-"}</td>
                    <td className="px-3 py-2">{formatPriceRange(product.basePrice, product.maxPrice, product.currency, locale === "zh" ? "zh-CN" : "en-US")}</td>
                    <td className="px-3 py-2">{product.isActive ? (locale === "zh" ? ZH.active : "Active") : (locale === "zh" ? ZH.inactive : "Inactive")}</td>
                    <td className="space-x-2 px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingProduct(product); setProductModalOpen(true); }}>{locale === "zh" ? ZH.edit : "Edit"}</Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedProductId(product.id)}>{locale === "zh" ? ZH.image : "Images"}</Button>
                      <Button size="sm" variant="destructive" onClick={async () => { await deleteProduct(product.id); await mutateProducts(); }}>{locale === "zh" ? ZH.del : "Delete"}</Button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 ? (
                  <tr><td className="px-3 py-4 text-muted-foreground" colSpan={8}>{locale === "zh" ? ZH.noProducts : "No products"}</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "brands" ? (
        <section className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{locale === "zh" ? ZH.brands : "Brands"}</h2>
            <Button onClick={() => { setBrandDraft({ name: "", nameZh: "", isActive: true }); setBrandEditorOpen(true); }}>{locale === "zh" ? "\u65B0\u589E\u54C1\u724C" : "New Brand"}</Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30 text-left"><th className="px-3 py-2">Name(EN)</th><th className="px-3 py-2">Name(ZH)</th><th className="px-3 py-2">{locale === "zh" ? ZH.status : "Status"}</th><th className="px-3 py-2">{locale === "zh" ? ZH.actions : "Actions"}</th></tr></thead>
              <tbody>
                {brands.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-3 py-2">{item.nameEn}</td><td className="px-3 py-2">{item.nameZh || "-"}</td>
                    <td className="px-3 py-2">{item.isActive ? (locale === "zh" ? ZH.active : "Active") : (locale === "zh" ? ZH.inactive : "Inactive")}</td>
                    <td className="space-x-2 px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => { setBrandDraft({ id: item.id, name: item.nameEn, nameZh: item.nameZh || "", isActive: item.isActive }); setBrandEditorOpen(true); }}>{locale === "zh" ? ZH.edit : "Edit"}</Button>
                      <Button size="sm" variant="destructive" onClick={async () => { await deleteBrand(item.id); await mutateBrands(); }}>{locale === "zh" ? ZH.del : "Delete"}</Button>
                    </td>
                  </tr>
                ))}
                {brands.length === 0 ? <tr><td className="px-3 py-4 text-muted-foreground" colSpan={4}>{locale === "zh" ? ZH.noItems : "No data"}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "categories" ? (
        <section className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{locale === "zh" ? ZH.categories : "Categories"}</h2>
            <Button onClick={() => { setCategoryDraft({ name: "", nameZh: "", isActive: true }); setCategoryEditorOpen(true); }}>{locale === "zh" ? "\u65B0\u589E\u5206\u7C7B" : "New Category"}</Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30 text-left"><th className="px-3 py-2">Name(EN)</th><th className="px-3 py-2">Name(ZH)</th><th className="px-3 py-2">{locale === "zh" ? ZH.status : "Status"}</th><th className="px-3 py-2">{locale === "zh" ? ZH.actions : "Actions"}</th></tr></thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-3 py-2">{item.nameEn}</td><td className="px-3 py-2">{item.nameZh || "-"}</td>
                    <td className="px-3 py-2">{item.isActive ? (locale === "zh" ? ZH.active : "Active") : (locale === "zh" ? ZH.inactive : "Inactive")}</td>
                    <td className="space-x-2 px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => { setCategoryDraft({ id: item.id, name: item.nameEn, nameZh: item.nameZh || "", isActive: item.isActive }); setCategoryEditorOpen(true); }}>{locale === "zh" ? ZH.edit : "Edit"}</Button>
                      <Button size="sm" variant="destructive" onClick={async () => { await deleteCategory(item.id); await mutateCategories(); }}>{locale === "zh" ? ZH.del : "Delete"}</Button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 ? <tr><td className="px-3 py-4 text-muted-foreground" colSpan={4}>{locale === "zh" ? ZH.noItems : "No data"}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "fuel-types" || tab === "drive-types" ? (
        <section className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{tab === "fuel-types" ? (locale === "zh" ? ZH.fuelTypes : "Fuel Types") : (locale === "zh" ? ZH.driveTypes : "Drive Types")}</h2>
            <Button onClick={() => {
              if (tab === "fuel-types") { setFuelTypeDraft({ name: "", nameZh: "" }); setFuelTypeEditorOpen(true); }
              else { setDriveTypeDraft({ name: "", nameZh: "" }); setDriveTypeEditorOpen(true); }
            }}>{tab === "fuel-types" ? (locale === "zh" ? "\u65B0\u589E\u71C3\u6599\u7C7B\u578B" : "New Fuel Type") : (locale === "zh" ? "\u65B0\u589E\u9A71\u52A8\u7C7B\u578B" : "New Drive Type")}</Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30 text-left"><th className="px-3 py-2">Name(EN)</th><th className="px-3 py-2">Name(ZH)</th><th className="px-3 py-2">{locale === "zh" ? ZH.actions : "Actions"}</th></tr></thead>
              <tbody>
                {(tab === "fuel-types" ? fuelTypes : driveTypes).map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-3 py-2">{item.nameEn}</td><td className="px-3 py-2">{item.nameZh || "-"}</td>
                    <td className="space-x-2 px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        if (tab === "fuel-types") { setFuelTypeDraft({ id: item.id, name: item.nameEn, nameZh: item.nameZh || "" }); setFuelTypeEditorOpen(true); }
                        else { setDriveTypeDraft({ id: item.id, name: item.nameEn, nameZh: item.nameZh || "" }); setDriveTypeEditorOpen(true); }
                      }}>{locale === "zh" ? ZH.edit : "Edit"}</Button>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        if (tab === "fuel-types") { await deleteFuelType(item.id); await mutateFuelTypes(); }
                        else { await deleteDriveType(item.id); await mutateDriveTypes(); }
                      }}>{locale === "zh" ? ZH.del : "Delete"}</Button>
                    </td>
                  </tr>
                ))}
                {(tab === "fuel-types" ? fuelTypes : driveTypes).length === 0 ? <tr><td className="px-3 py-4 text-muted-foreground" colSpan={3}>{locale === "zh" ? ZH.noItems : "No data"}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <Dialog open={productModalOpen} onOpenChange={(v) => !v && setProductModalOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingProduct ? (locale === "zh" ? ZH.editProduct : "Edit Product") : locale === "zh" ? ZH.newProduct : "New Product"}</DialogTitle></DialogHeader>
          <ProductForm
            key={editingProduct?.id || "create"}
            locale={locale}
            brands={brands}
            categories={categories}
            fuelTypes={fuelTypes}
            driveTypes={driveTypes}
            initial={editingProduct || undefined}
            onCancel={() => setProductModalOpen(false)}
            onSubmit={async (payload) => { if (editingProduct) await updateProduct(editingProduct.id, payload); else await createProduct(payload); await mutateProducts(); setProductModalOpen(false); setEditingProduct(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(v) => !v && setSelectedProductId("")}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{locale === "zh" ? ZH.imageManager : "Image Manager"}{selectedProduct ? ` - ${selectedProduct.name}` : ""}</DialogTitle></DialogHeader>
          {selectedProduct ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded border p-3"><h3 className="font-medium">{locale === "zh" ? ZH.uploadLocal : "Upload Image"}</h3><ImageUploader productId={selectedProduct.id} onUploaded={mutateProducts} /></div>
                <div className="space-y-2 rounded border p-3">
                  <h3 className="font-medium">{locale === "zh" ? ZH.addImageUrl : "Add Image URL"}</h3>
                  <input className="h-10 w-full rounded border px-3" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                  {imageError ? <p className="text-sm text-destructive">{imageError}</p> : null}
                  <Button onClick={async () => { try { setImageError(""); await addProductImageByUrl(selectedProduct.id, { imageUrl, imageType: "detail" }); setImageUrl(""); await mutateProducts(); } catch (err: any) { setImageError(err?.message || (locale === "zh" ? ZH.addFailed : "Failed to add image URL")); } }}>{locale === "zh" ? ZH.add : "Add"}</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {selectedProduct.images.map((image) => (
                  <div key={image.id} className="space-y-2 rounded border p-2">
                    <img src={image.url} alt={image.altText || "img"} className="h-28 w-full rounded object-cover" />
                    <div className="flex items-center justify-between text-xs">
                      <span>{image.isPrimary ? (locale === "zh" ? ZH.mainImage : "Main") : locale === "zh" ? ZH.detailImage : "Detail"}</span>
                      <button className="text-red-600" onClick={async () => { await deleteProductImage(selectedProduct.id, image.id); await mutateProducts(); }}>{locale === "zh" ? ZH.del : "Delete"}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <NameEditor locale={locale} title={brandDraft.id ? (locale === "zh" ? "\u7F16\u8F91\u54C1\u724C" : "Edit Brand") : locale === "zh" ? "\u65B0\u589E\u54C1\u724C" : "New Brand"} open={brandEditorOpen} draft={brandDraft} showStatus onChange={setBrandDraft} onClose={() => setBrandEditorOpen(false)} onSubmit={async () => { if (brandDraft.id) await updateBrand(brandDraft.id, { name: brandDraft.name, nameZh: brandDraft.nameZh, isActive: brandDraft.isActive }); else await createBrand({ name: brandDraft.name, nameZh: brandDraft.nameZh, isActive: brandDraft.isActive }); await mutateBrands(); setBrandEditorOpen(false); }} />
      <NameEditor locale={locale} title={categoryDraft.id ? (locale === "zh" ? "\u7F16\u8F91\u5206\u7C7B" : "Edit Category") : locale === "zh" ? "\u65B0\u589E\u5206\u7C7B" : "New Category"} open={categoryEditorOpen} draft={categoryDraft} showStatus onChange={setCategoryDraft} onClose={() => setCategoryEditorOpen(false)} onSubmit={async () => { if (categoryDraft.id) await updateCategory(categoryDraft.id, { name: categoryDraft.name, nameZh: categoryDraft.nameZh, isActive: categoryDraft.isActive }); else await createCategory({ name: categoryDraft.name, nameZh: categoryDraft.nameZh, isActive: categoryDraft.isActive }); await mutateCategories(); setCategoryEditorOpen(false); }} />
      <NameEditor locale={locale} title={fuelTypeDraft.id ? (locale === "zh" ? "\u7F16\u8F91\u71C3\u6599\u7C7B\u578B" : "Edit Fuel Type") : locale === "zh" ? "\u65B0\u589E\u71C3\u6599\u7C7B\u578B" : "New Fuel Type"} open={fuelTypeEditorOpen} draft={fuelTypeDraft} onChange={setFuelTypeDraft} onClose={() => setFuelTypeEditorOpen(false)} onSubmit={async () => { if (fuelTypeDraft.id) await updateFuelType(fuelTypeDraft.id, { name: fuelTypeDraft.name, nameZh: fuelTypeDraft.nameZh }); else await createFuelType({ name: fuelTypeDraft.name, nameZh: fuelTypeDraft.nameZh }); await mutateFuelTypes(); setFuelTypeEditorOpen(false); }} />
      <NameEditor locale={locale} title={driveTypeDraft.id ? (locale === "zh" ? "\u7F16\u8F91\u9A71\u52A8\u7C7B\u578B" : "Edit Drive Type") : locale === "zh" ? "\u65B0\u589E\u9A71\u52A8\u7C7B\u578B" : "New Drive Type"} open={driveTypeEditorOpen} draft={driveTypeDraft} onChange={setDriveTypeDraft} onClose={() => setDriveTypeEditorOpen(false)} onSubmit={async () => { if (driveTypeDraft.id) await updateDriveType(driveTypeDraft.id, { name: driveTypeDraft.name, nameZh: driveTypeDraft.nameZh }); else await createDriveType({ name: driveTypeDraft.name, nameZh: driveTypeDraft.nameZh }); await mutateDriveTypes(); setDriveTypeEditorOpen(false); }} />
    </div>
  );
}
