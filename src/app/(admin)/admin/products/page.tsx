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
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminMessage } from "@/components/admin/AdminMessageProvider";

type TabKey = "products" | "brands" | "categories" | "fuel-types" | "drive-types";
type NameDraft = { id?: string; name: string; nameZh: string; isActive?: boolean };

type DeleteTarget =
  | { type: "product"; id: string }
  | { type: "brand"; id: string }
  | { type: "category"; id: string }
  | { type: "fuel"; id: string }
  | { type: "drive"; id: string }
  | { type: "image"; productId: string; imageId: string };

const ZH = {
  title: "产品管理",
  products: "产品列表",
  brands: "品牌管理",
  categories: "分类管理",
  fuelTypes: "燃料类型",
  driveTypes: "驱动类型",
  newProduct: "新增产品",
  editProduct: "编辑产品",
  name: "名称",
  brand: "品牌",
  category: "分类",
  fuel: "燃料",
  drive: "驱动",
  price: "价格",
  status: "状态",
  actions: "操作",
  image: "图片",
  active: "启用",
  inactive: "停用",
  edit: "编辑",
  del: "删除",
  cancel: "取消",
  save: "确定",
  saving: "保存中...",
  saveFailed: "保存失败",
  noProducts: "暂无产品",
  noItems: "暂无数据",
  imageManager: "图片管理",
  uploadLocal: "本地上传",
  addImageUrl: "添加图片链接",
  add: "添加",
  addFailed: "添加失败",
  mainImage: "主图",
  detailImage: "详情图",
};

function NameEditor({
  locale,
  open,
  title,
  draft,
  onChange,
  onClose,
  onSubmit,
  showStatus,
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
  const { pushMessage } = useAdminMessage();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setError("");
            try {
              await onSubmit();
              pushMessage(locale === "zh" ? "保存成功" : "Saved", "success");
            } catch (err: any) {
              const message = err?.message || (locale === "zh" ? ZH.saveFailed : "Save failed");
              setError(message);
              pushMessage(message, "error");
            } finally {
              setSaving(false);
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
            <label className="text-sm font-medium">Name(ZH)</label>
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
              {locale === "zh" ? ZH.active : "Active"}
            </label>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button disabled={saving}>
              {saving ? (locale === "zh" ? ZH.saving : "Saving...") : locale === "zh" ? ZH.save : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              {locale === "zh" ? ZH.cancel : "Cancel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminProductsPage() {
  const locale = useLocale();
  const { pushMessage } = useAdminMessage();
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
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

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
            <Button
              onClick={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
            >
              {locale === "zh" ? ZH.newProduct : "New Product"}
            </Button>
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
                    <td className="px-3 py-2">
                      {formatPriceRange(product.basePrice, product.maxPrice, product.currency, locale === "zh" ? "zh-CN" : "en-US")}
                    </td>
                    <td className="px-3 py-2">
                      {product.isActive ? (locale === "zh" ? ZH.active : "Active") : locale === "zh" ? ZH.inactive : "Inactive"}
                    </td>
                    <td className="space-x-2 px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingProduct(product);
                          setProductModalOpen(true);
                        }}
                      >
                        {locale === "zh" ? ZH.edit : "Edit"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedProductId(product.id)}>
                        {locale === "zh" ? ZH.image : "Images"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ type: "product", id: product.id })}>
                        {locale === "zh" ? ZH.del : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={8}>
                      {locale === "zh" ? ZH.noProducts : "No products"}
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
            <h2 className="text-xl font-semibold">{locale === "zh" ? ZH.brands : "Brands"}</h2>
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
                  <th className="px-3 py-2">Name(ZH)</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.status : "Status"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.actions : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-3 py-2">{item.nameEn}</td>
                    <td className="px-3 py-2">{item.nameZh || "-"}</td>
                    <td className="px-3 py-2">
                      {item.isActive ? (locale === "zh" ? ZH.active : "Active") : locale === "zh" ? ZH.inactive : "Inactive"}
                    </td>
                    <td className="space-x-2 px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBrandDraft({ id: item.id, name: item.nameEn, nameZh: item.nameZh || "", isActive: item.isActive });
                          setBrandEditorOpen(true);
                        }}
                      >
                        {locale === "zh" ? ZH.edit : "Edit"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ type: "brand", id: item.id })}>
                        {locale === "zh" ? ZH.del : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {brands.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={4}>
                      {locale === "zh" ? ZH.noItems : "No data"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "categories" ? (
        <section className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{locale === "zh" ? ZH.categories : "Categories"}</h2>
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
                  <th className="px-3 py-2">Name(ZH)</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.status : "Status"}</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.actions : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-3 py-2">{item.nameEn}</td>
                    <td className="px-3 py-2">{item.nameZh || "-"}</td>
                    <td className="px-3 py-2">
                      {item.isActive ? (locale === "zh" ? ZH.active : "Active") : locale === "zh" ? ZH.inactive : "Inactive"}
                    </td>
                    <td className="space-x-2 px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCategoryDraft({ id: item.id, name: item.nameEn, nameZh: item.nameZh || "", isActive: item.isActive });
                          setCategoryEditorOpen(true);
                        }}
                      >
                        {locale === "zh" ? ZH.edit : "Edit"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ type: "category", id: item.id })}>
                        {locale === "zh" ? ZH.del : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={4}>
                      {locale === "zh" ? ZH.noItems : "No data"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "fuel-types" || tab === "drive-types" ? (
        <section className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {tab === "fuel-types" ? (locale === "zh" ? ZH.fuelTypes : "Fuel Types") : locale === "zh" ? ZH.driveTypes : "Drive Types"}
            </h2>
            <Button
              onClick={() => {
                if (tab === "fuel-types") {
                  setFuelTypeDraft({ name: "", nameZh: "" });
                  setFuelTypeEditorOpen(true);
                } else {
                  setDriveTypeDraft({ name: "", nameZh: "" });
                  setDriveTypeEditorOpen(true);
                }
              }}
            >
              {tab === "fuel-types"
                ? locale === "zh"
                  ? "新增燃料类型"
                  : "New Fuel Type"
                : locale === "zh"
                  ? "新增驱动类型"
                  : "New Drive Type"}
            </Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-3 py-2">Name(EN)</th>
                  <th className="px-3 py-2">Name(ZH)</th>
                  <th className="px-3 py-2">{locale === "zh" ? ZH.actions : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {(tab === "fuel-types" ? fuelTypes : driveTypes).map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-3 py-2">{item.nameEn}</td>
                    <td className="px-3 py-2">{item.nameZh || "-"}</td>
                    <td className="space-x-2 px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (tab === "fuel-types") {
                            setFuelTypeDraft({ id: item.id, name: item.nameEn, nameZh: item.nameZh || "" });
                            setFuelTypeEditorOpen(true);
                          } else {
                            setDriveTypeDraft({ id: item.id, name: item.nameEn, nameZh: item.nameZh || "" });
                            setDriveTypeEditorOpen(true);
                          }
                        }}
                      >
                        {locale === "zh" ? ZH.edit : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteTarget({ type: tab === "fuel-types" ? "fuel" : "drive", id: item.id })}
                      >
                        {locale === "zh" ? ZH.del : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {(tab === "fuel-types" ? fuelTypes : driveTypes).length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={3}>
                      {locale === "zh" ? ZH.noItems : "No data"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <Dialog open={productModalOpen} onOpenChange={(v) => !v && setProductModalOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? (locale === "zh" ? ZH.editProduct : "Edit Product") : locale === "zh" ? ZH.newProduct : "New Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            key={editingProduct?.id || "create"}
            locale={locale}
            brands={brands}
            categories={categories}
            fuelTypes={fuelTypes}
            driveTypes={driveTypes}
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
              pushMessage(locale === "zh" ? "产品保存成功" : "Product saved successfully", "success");
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(v) => !v && setSelectedProductId("")}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {locale === "zh" ? ZH.imageManager : "Image Manager"}
              {selectedProduct ? ` - ${selectedProduct.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded border p-3">
                  <h3 className="font-medium">{locale === "zh" ? ZH.uploadLocal : "Upload Image"}</h3>
                  <ImageUploader productId={selectedProduct.id} onUploaded={mutateProducts} />
                </div>
                <div className="space-y-2 rounded border p-3">
                  <h3 className="font-medium">{locale === "zh" ? ZH.addImageUrl : "Add Image URL"}</h3>
                  <input className="h-10 w-full rounded border px-3" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                  {imageError ? <p className="text-sm text-destructive">{imageError}</p> : null}
                  <Button
                    onClick={async () => {
                      try {
                        setImageError("");
                        await addProductImageByUrl(selectedProduct.id, { imageUrl, imageType: "detail" });
                        setImageUrl("");
                        await mutateProducts();
                        pushMessage(locale === "zh" ? "图片添加成功" : "Image added successfully", "success");
                      } catch (err: any) {
                        const message = err?.message || (locale === "zh" ? ZH.addFailed : "Failed to add image URL");
                        setImageError(message);
                        pushMessage(message, "error");
                      }
                    }}
                  >
                    {locale === "zh" ? ZH.add : "Add"}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {selectedProduct.images.map((image) => (
                  <div key={image.id} className="space-y-2 rounded border p-2">
                    <img src={image.url} alt={image.altText || "img"} className="h-28 w-full rounded object-cover" />
                    <div className="flex items-center justify-between text-xs">
                      <span>{image.isPrimary ? (locale === "zh" ? ZH.mainImage : "Main") : locale === "zh" ? ZH.detailImage : "Detail"}</span>
                      <button
                        type="button"
                        className="text-red-600"
                        onClick={() => setDeleteTarget({ type: "image", productId: selectedProduct.id, imageId: image.id })}
                      >
                        {locale === "zh" ? ZH.del : "Delete"}
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
        title={brandDraft.id ? (locale === "zh" ? "编辑品牌" : "Edit Brand") : locale === "zh" ? "新增品牌" : "New Brand"}
        open={brandEditorOpen}
        draft={brandDraft}
        showStatus
        onChange={setBrandDraft}
        onClose={() => setBrandEditorOpen(false)}
        onSubmit={async () => {
          if (brandDraft.id) {
            await updateBrand(brandDraft.id, { name: brandDraft.name, nameZh: brandDraft.nameZh, isActive: brandDraft.isActive });
          } else {
            await createBrand({ name: brandDraft.name, nameZh: brandDraft.nameZh, isActive: brandDraft.isActive });
          }
          await mutateBrands();
          setBrandEditorOpen(false);
        }}
      />

      <NameEditor
        locale={locale}
        title={categoryDraft.id ? (locale === "zh" ? "编辑分类" : "Edit Category") : locale === "zh" ? "新增分类" : "New Category"}
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
        title={fuelTypeDraft.id ? (locale === "zh" ? "编辑燃料类型" : "Edit Fuel Type") : locale === "zh" ? "新增燃料类型" : "New Fuel Type"}
        open={fuelTypeEditorOpen}
        draft={fuelTypeDraft}
        onChange={setFuelTypeDraft}
        onClose={() => setFuelTypeEditorOpen(false)}
        onSubmit={async () => {
          if (fuelTypeDraft.id) {
            await updateFuelType(fuelTypeDraft.id, { name: fuelTypeDraft.name, nameZh: fuelTypeDraft.nameZh });
          } else {
            await createFuelType({ name: fuelTypeDraft.name, nameZh: fuelTypeDraft.nameZh });
          }
          await mutateFuelTypes();
          setFuelTypeEditorOpen(false);
        }}
      />

      <NameEditor
        locale={locale}
        title={driveTypeDraft.id ? (locale === "zh" ? "编辑驱动类型" : "Edit Drive Type") : locale === "zh" ? "新增驱动类型" : "New Drive Type"}
        open={driveTypeEditorOpen}
        draft={driveTypeDraft}
        onChange={setDriveTypeDraft}
        onClose={() => setDriveTypeEditorOpen(false)}
        onSubmit={async () => {
          if (driveTypeDraft.id) {
            await updateDriveType(driveTypeDraft.id, { name: driveTypeDraft.name, nameZh: driveTypeDraft.nameZh });
          } else {
            await createDriveType({ name: driveTypeDraft.name, nameZh: driveTypeDraft.nameZh });
          }
          await mutateDriveTypes();
          setDriveTypeEditorOpen(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        title={locale === "zh" ? "确认删除" : "Confirm Delete"}
        description={locale === "zh" ? "确认执行删除操作？此操作不可恢复。" : "Are you sure to delete this item? This action cannot be undone."}
        confirmText={locale === "zh" ? "确认删除" : "Delete"}
        cancelText={locale === "zh" ? "取消" : "Cancel"}
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            if (deleteTarget.type === "product") {
              await deleteProduct(deleteTarget.id);
              await mutateProducts();
            } else if (deleteTarget.type === "brand") {
              await deleteBrand(deleteTarget.id);
              await mutateBrands();
            } else if (deleteTarget.type === "category") {
              await deleteCategory(deleteTarget.id);
              await mutateCategories();
            } else if (deleteTarget.type === "fuel") {
              await deleteFuelType(deleteTarget.id);
              await mutateFuelTypes();
            } else if (deleteTarget.type === "drive") {
              await deleteDriveType(deleteTarget.id);
              await mutateDriveTypes();
            } else {
              await deleteProductImage(deleteTarget.productId, deleteTarget.imageId);
              await mutateProducts();
            }

            setDeleteTarget(null);
            pushMessage(locale === "zh" ? "删除成功" : "Deleted successfully", "success");
          } catch (err: any) {
            pushMessage(err?.message || (locale === "zh" ? "删除失败" : "Delete failed"), "error");
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}

