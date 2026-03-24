import { Locale, pickLocalized } from "@/lib/i18n";
import { toNumber } from "@/lib/utils";
import type { Product, Brand, Category, ProductImage } from "@prisma/client";

type ProductWithRelations = Product & {
  brand?: Brand | null;
  category?: Category | null;
  images?: ProductImage[];
};

export function mapBrand(brand: Brand, locale: Locale) {
  return {
    id: brand.id,
    slug: brand.slug,
    name: pickLocalized(brand.name, brand.nameZh, locale),
    nameEn: brand.name,
    nameZh: brand.nameZh,
    description: pickLocalized(brand.description, brand.descriptionZh, locale),
    descriptionEn: brand.description,
    descriptionZh: brand.descriptionZh,
    logoUrl: brand.logoUrl,
    isActive: brand.isActive,
    sortOrder: brand.sortOrder,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}

export function mapCategory(category: Category, locale: Locale) {
  return {
    id: category.id,
    slug: category.slug,
    name: pickLocalized(category.name, category.nameZh, locale),
    nameEn: category.name,
    nameZh: category.nameZh,
    description: pickLocalized(category.description, category.descriptionZh, locale),
    descriptionEn: category.description,
    descriptionZh: category.descriptionZh,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function mapProduct(product: ProductWithRelations, locale: Locale) {
  const images = (product.images || []).map((image) => ({
    id: image.id,
    url: image.imageUrl,
    altText: image.altText,
    isPrimary: image.isPrimary,
    sortOrder: image.sortOrder,
    createdAt: image.createdAt,
  }));

  return {
    id: product.id,
    slug: product.slug,
    name: pickLocalized(product.name, product.nameZh, locale),
    nameEn: product.name,
    nameZh: product.nameZh,
    description: pickLocalized(product.description, product.descriptionZh, locale),
    descriptionEn: product.description,
    descriptionZh: product.descriptionZh,
    shortDescription: pickLocalized(product.shortDescription, product.shortDescriptionZh, locale),
    shortDescriptionEn: product.shortDescription,
    shortDescriptionZh: product.shortDescriptionZh,
    basePrice: toNumber(product.basePrice),
    maxPrice: toNumber(product.maxPrice),
    currency: product.currency,
    fuelType: product.fuelType,
    enginePower: product.enginePower,
    wheelbase: product.wheelbase,
    driveType: product.driveType,
    cargoLengthMm: product.cargoLengthMm,
    cargoVolumeCubicM: product.cargoVolumeCubicM !== null ? toNumber(product.cargoVolumeCubicM) : null,
    batteryCapacityKwh: product.batteryCapacityKwh,
    emissionStandard: product.emissionStandard,
    weightKg: product.weightKg,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
    viewCount: product.viewCount,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    brand: product.brand ? mapBrand(product.brand, locale) : null,
    category: product.category ? mapCategory(product.category, locale) : null,
    images,
    imageUrls: images.map((image) => image.url),
  };
}

export function mapSettingRecord(items: { key: string; value: string }[]) {
  return items.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
}
