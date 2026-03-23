"use client";

import { useMemo, useState } from "react";
import {
  addProductImageByUrl,
  createBrand,
  createCategory,
  createProduct,
  deleteBrand,
  deleteCategory,
  deleteProduct,
  deleteProductImage,
  updateBrand,
  updateCategory,
  updateProduct,
  useBrands,
  useCategories,
  useProducts,
} from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/ProductForm";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminProductsPage() {
  const locale = useLocale();
  const { products, mutate: mutateProducts } = useProducts({ lang: locale, pageSize: 200 });
  const { brands, mutate: mutateBrands } = useBrands(locale);
  const { categories, mutate: mutateCategories } = useCategories(locale, true);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");

  const [brandName, setBrandName] = useState("");
  const [brandNameZh, setBrandNameZh] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryNameZh, setCategoryNameZh] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId]
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{locale === "zh" ? "产品管理" : "Product Management"}</h1>
        <Button onClick={() => {
          setEditingProduct(null);
          setCreatingProduct((v) => !v);
        }}>
          {creatingProduct ? (locale === "zh" ? "关闭表单" : "Close Form") : (locale === "zh" ? "新建产品" : "New Product")}
        </Button>
      </div>

      {(creatingProduct || editingProduct) && (
        <div className="rounded border p-4">
          <ProductForm
            brands={brands}
            categories={categories}
            initial={editingProduct || undefined}
            onCancel={() => {
              setCreatingProduct(false);
              setEditingProduct(null);
            }}
            onSubmit={async (payload) => {
              if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
              } else {
                await createProduct(payload);
              }
              await mutateProducts();
              setCreatingProduct(false);
              setEditingProduct(null);
            }}
          />
        </div>
      )}

      <section className="rounded border">
        <div className="border-b px-4 py-3 font-semibold">{locale === "zh" ? "产品列表" : "Products"}</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Brand</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="px-3 py-2">{product.name}</td>
                  <td className="px-3 py-2">{product.brand?.name || "-"}</td>
                  <td className="px-3 py-2">{product.category?.name || "-"}</td>
                  <td className="px-3 py-2">
                    {product.currency} {product.basePrice}
                  </td>
                  <td className="px-3 py-2">{product.isActive ? "Active" : "Inactive"}</td>
                  <td className="px-3 py-2 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingProduct(product);
                        setCreatingProduct(false);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      Images
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (!window.confirm("Delete this product?")) return;
                        await deleteProduct(product.id);
                        await mutateProducts();
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-muted-foreground" colSpan={6}>
                    No products
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedProduct && (
        <section className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Image Manager - {selectedProduct.name}</h2>
            <Button variant="outline" onClick={() => setSelectedProductId("")}>Close</Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded border p-3">
              <h3 className="font-medium">Upload Image</h3>
              <ImageUploader productId={selectedProduct.id} onUploaded={mutateProducts} />
            </div>
            <div className="space-y-2 rounded border p-3">
              <h3 className="font-medium">Add Image URL</h3>
              <input
                className="h-10 w-full rounded border px-3"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
              {imageError && <p className="text-sm text-destructive">{imageError}</p>}
              <Button
                onClick={async () => {
                  try {
                    setImageError("");
                    await addProductImageByUrl(selectedProduct.id, { imageUrl, imageType: "detail" });
                    setImageUrl("");
                    await mutateProducts();
                  } catch (err: any) {
                    setImageError(err?.message || "Failed to add image URL");
                  }
                }}
              >
                Add URL
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {selectedProduct.images.map((image) => (
              <div key={image.id} className="space-y-2 rounded border p-2">
                <img src={image.url} alt={image.altText || "img"} className="h-28 w-full rounded object-cover" />
                <div className="flex items-center justify-between text-xs">
                  <span>{image.isPrimary ? "Main" : "Detail"}</span>
                  <button
                    className="text-red-600"
                    onClick={async () => {
                      if (!window.confirm("Delete this image?")) return;
                      await deleteProductImage(selectedProduct.id, image.id);
                      await mutateProducts();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded border p-4">
          <h2 className="text-lg font-semibold">{locale === "zh" ? "品牌管理" : "Brands"}</h2>
          <div className="flex gap-2">
            <input
              className="h-10 flex-1 rounded border px-3"
              placeholder="Name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
            <input
              className="h-10 flex-1 rounded border px-3"
              placeholder="Name Zh"
              value={brandNameZh}
              onChange={(e) => setBrandNameZh(e.target.value)}
            />
            <Button
              onClick={async () => {
                await createBrand({ name: brandName, nameZh: brandNameZh });
                setBrandName("");
                setBrandNameZh("");
                await mutateBrands();
              }}
            >
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <div>{brand.name}</div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const name = window.prompt("Brand name", brand.nameEn);
                      if (!name) return;
                      const nameZh = window.prompt("Brand name zh", brand.nameZh || "") || "";
                      await updateBrand(brand.id, { name, nameZh });
                      await mutateBrands();
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!window.confirm("Delete this brand?")) return;
                      await deleteBrand(brand.id);
                      await mutateBrands();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded border p-4">
          <h2 className="text-lg font-semibold">{locale === "zh" ? "分类管理" : "Categories"}</h2>
          <div className="flex gap-2">
            <input
              className="h-10 flex-1 rounded border px-3"
              placeholder="Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <input
              className="h-10 flex-1 rounded border px-3"
              placeholder="Name Zh"
              value={categoryNameZh}
              onChange={(e) => setCategoryNameZh(e.target.value)}
            />
            <Button
              onClick={async () => {
                await createCategory({ name: categoryName, nameZh: categoryNameZh });
                setCategoryName("");
                setCategoryNameZh("");
                await mutateCategories();
              }}
            >
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <div>{category.name}</div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const name = window.prompt("Category name", category.nameEn);
                      if (!name) return;
                      const nameZh = window.prompt("Category name zh", category.nameZh || "") || "";
                      await updateCategory(category.id, { name, nameZh });
                      await mutateCategories();
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!window.confirm("Delete this category?")) return;
                      await deleteCategory(category.id);
                      await mutateCategories();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
