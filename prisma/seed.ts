import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SettingSeed = {
  key: string;
  value: string;
  type?: string;
  group?: string;
  label?: string;
  labelZh?: string;
  description?: string;
};

type BrandSeed = {
  slug: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  sortOrder: number;
};

type CategorySeed = {
  slug: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  sortOrder: number;
};

type ProductSeed = {
  slug: string;
  name: string;
  nameZh: string;
  brandSlug: string;
  categorySlug: string;
  basePrice: number;
  maxPrice: number;
  driveType?: string;
  fuelType?: string;
  enginePower?: number;
  wheelbase?: number;
  cargoLengthMm?: number;
  cargoVolumeCubicM?: number;
  emissionStandard?: string;
  weightKg?: number;
  description?: string;
  descriptionZh?: string;
  sortOrder: number;
};

async function upsertSettings(settings: SettingSeed[]) {
  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: {
        key: setting.key,
        value: setting.value,
        type: setting.type ?? "text",
        group: setting.group,
        label: setting.label,
        labelZh: setting.labelZh,
        description: setting.description,
      },
      update: {
        value: setting.value,
        type: setting.type ?? "text",
        group: setting.group,
        label: setting.label,
        labelZh: setting.labelZh,
        description: setting.description,
      },
    });
  }
}

async function upsertBrands(seeds: BrandSeed[]) {
  const brandIds = new Map<string, string>();
  for (const seed of seeds) {
    const brand = await prisma.brand.upsert({
      where: { slug: seed.slug },
      create: {
        slug: seed.slug,
        name: seed.name,
        nameZh: seed.nameZh,
        description: seed.description,
        descriptionZh: seed.descriptionZh,
        isActive: true,
        sortOrder: seed.sortOrder,
      },
      update: {
        name: seed.name,
        nameZh: seed.nameZh,
        description: seed.description,
        descriptionZh: seed.descriptionZh,
        isActive: true,
        sortOrder: seed.sortOrder,
      },
      select: { id: true },
    });
    brandIds.set(seed.slug, brand.id);
  }
  return brandIds;
}

async function upsertCategories(seeds: CategorySeed[]) {
  const categoryIds = new Map<string, string>();
  for (const seed of seeds) {
    const category = await prisma.category.upsert({
      where: { slug: seed.slug },
      create: {
        slug: seed.slug,
        name: seed.name,
        nameZh: seed.nameZh,
        description: seed.description,
        descriptionZh: seed.descriptionZh,
        isActive: true,
        sortOrder: seed.sortOrder,
      },
      update: {
        name: seed.name,
        nameZh: seed.nameZh,
        description: seed.description,
        descriptionZh: seed.descriptionZh,
        isActive: true,
        sortOrder: seed.sortOrder,
      },
      select: { id: true },
    });
    categoryIds.set(seed.slug, category.id);
  }
  return categoryIds;
}

async function upsertProducts(products: ProductSeed[], brandIds: Map<string, string>, categoryIds: Map<string, string>) {
  const keepSlugs = products.map((item) => item.slug);

  await prisma.product.deleteMany({
    where: {
      slug: {
        notIn: keepSlugs,
      },
    },
  });

  for (let index = 0; index < products.length; index += 1) {
    const seed = products[index];
    const brandId = brandIds.get(seed.brandSlug);
    const categoryId = categoryIds.get(seed.categorySlug);
    if (!brandId || !categoryId) {
      continue;
    }

    const descriptionEn = seed.description || "Catalog model from Tengyu remanufacturing truck factory brochure: " + seed.name + ".";
    const descriptionZh = seed.descriptionZh || "腾宇再制造卡车图册车型：" + seed.nameZh + "。";

    const product = await prisma.product.upsert({
      where: { slug: seed.slug },
      create: {
        slug: seed.slug,
        name: seed.name,
        nameZh: seed.nameZh,
        brandId,
        categoryId,
        description: descriptionEn,
        descriptionZh,
        shortDescription: seed.name,
        shortDescriptionZh: seed.nameZh,
        basePrice: seed.basePrice,
        maxPrice: seed.maxPrice,
        currency: "USD",
        fuelType: seed.fuelType || "fuel_type_diesel",
        driveType: seed.driveType || null,
        enginePower: seed.enginePower ?? null,
        wheelbase: seed.wheelbase ?? null,
        cargoLengthMm: seed.cargoLengthMm ?? null,
        cargoVolumeCubicM: seed.cargoVolumeCubicM ?? null,
        batteryCapacityKwh: null,
        emissionStandard: seed.emissionStandard || "EURO-5",
        weightKg: seed.weightKg ?? null,
        isFeatured: index < 8,
        isActive: true,
        sortOrder: seed.sortOrder,
      },
      update: {
        name: seed.name,
        nameZh: seed.nameZh,
        brandId,
        categoryId,
        description: descriptionEn,
        descriptionZh,
        shortDescription: seed.name,
        shortDescriptionZh: seed.nameZh,
        basePrice: seed.basePrice,
        maxPrice: seed.maxPrice,
        currency: "USD",
        fuelType: seed.fuelType || "fuel_type_diesel",
        driveType: seed.driveType || null,
        enginePower: seed.enginePower ?? null,
        wheelbase: seed.wheelbase ?? null,
        cargoLengthMm: seed.cargoLengthMm ?? null,
        cargoVolumeCubicM: seed.cargoVolumeCubicM ?? null,
        batteryCapacityKwh: null,
        emissionStandard: seed.emissionStandard || "EURO-5",
        weightKg: seed.weightKg ?? null,
        isFeatured: index < 8,
        isActive: true,
        sortOrder: seed.sortOrder,
      },
      select: { id: true, name: true },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    const pageNo = String(seed.sortOrder + 4).padStart(2, "0");
    const imageUrl = "/assets/pdf-extract/images/page-" + pageNo + "-img-1.jpeg";

    await prisma.productImage.create({
      data: {
        productId: product.id,
        imageUrl,
        altText: product.name + " catalog image",
        isPrimary: true,
        sortOrder: 1,
      },
    });
  }
}

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.admin.upsert({
    where: { username: "admin" },
    create: {
      username: "admin",
      email: "admin@example.com",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    update: {
      email: "admin@example.com",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  const brandSeeds: BrandSeed[] = [
    {
      slug: "sinotruk-howo",
      name: "SINOTRUK HOWO",
      nameZh: "中国重汽 HOWO",
      description: "SINOTRUK HOWO commercial truck series",
      descriptionZh: "中国重汽 HOWO 商用车系列",
      sortOrder: 1,
    },
    {
      slug: "sinotruk-nx",
      name: "SINOTRUK NX",
      nameZh: "中国重汽 NX",
      description: "SINOTRUK NX remanufactured series",
      descriptionZh: "中国重汽 NX 再制造系列",
      sortOrder: 2,
    },
    {
      slug: "sinotruk-howo-tx",
      name: "SINOTRUK HOWO TX",
      nameZh: "中国重汽 HOWO TX",
      description: "SINOTRUK HOWO TX heavy-duty series",
      descriptionZh: "中国重汽 HOWO TX 重卡系列",
      sortOrder: 3,
    },
    {
      slug: "shacman",
      name: "SHACMAN",
      nameZh: "陕汽",
      description: "SHACMAN heavy truck series",
      descriptionZh: "陕汽重卡系列",
      sortOrder: 4,
    },
    {
      slug: "tengyu-custom",
      name: "TENGYU CUSTOM",
      nameZh: "腾宇定制",
      description: "Customized remanufacturing solutions",
      descriptionZh: "定制化再制造解决方案",
      sortOrder: 5,
    },
  ];

  const categorySeeds: CategorySeed[] = [
    {
      slug: "dump-trucks",
      name: "Dump Trucks",
      nameZh: "自卸车",
      description: "Remanufactured dump truck solutions",
      descriptionZh: "再制造自卸车方案",
      sortOrder: 1,
    },
    {
      slug: "tractor-trucks",
      name: "Tractor Trucks",
      nameZh: "牵引车",
      description: "Remanufactured tractor truck solutions",
      descriptionZh: "再制造牵引车方案",
      sortOrder: 2,
    },
    {
      slug: "mixer-trucks",
      name: "Mixer Trucks",
      nameZh: "搅拌车",
      description: "Remanufactured concrete mixer solutions",
      descriptionZh: "再制造混凝土搅拌车方案",
      sortOrder: 3,
    },
    {
      slug: "sprinkler-trucks",
      name: "Sprinkler Trucks",
      nameZh: "洒水车",
      description: "Remanufactured sprinkler truck solutions",
      descriptionZh: "再制造洒水车方案",
      sortOrder: 4,
    },
    {
      slug: "van-trucks",
      name: "Van Trucks",
      nameZh: "厢式车",
      description: "Remanufactured van truck solutions",
      descriptionZh: "再制造厢式车方案",
      sortOrder: 5,
    },
    {
      slug: "warehouse-trucks",
      name: "Warehouse Trucks",
      nameZh: "仓栅车",
      description: "Remanufactured warehouse truck solutions",
      descriptionZh: "再制造仓栅车方案",
      sortOrder: 6,
    },
    {
      slug: "tanker-trucks",
      name: "Tanker Trucks",
      nameZh: "罐车",
      description: "Remanufactured tanker truck solutions",
      descriptionZh: "再制造罐车方案",
      sortOrder: 7,
    },
    {
      slug: "semi-trailers",
      name: "Semi Trailers",
      nameZh: "半挂车",
      description: "Semi trailer options",
      descriptionZh: "半挂车车型",
      sortOrder: 8,
    },
    {
      slug: "customized-services",
      name: "Customized Services",
      nameZh: "定制服务",
      description: "Customized remanufacturing and configuration service",
      descriptionZh: "定制化再制造与配置服务",
      sortOrder: 9,
    },
  ];

  const productSeeds: ProductSeed[] = [
    {
      slug: "sinotruk-howo-6x4-dump-truck",
      name: "SINOTRUK HOWO 6X4 DUMP TRUCK",
      nameZh: "中国重汽 HOWO 6X4 自卸车",
      brandSlug: "sinotruk-howo",
      categorySlug: "dump-trucks",
      basePrice: 42000,
      maxPrice: 62000,
      driveType: "drive_type_6x4",
      enginePower: 400,
      wheelbase: 3600,
      cargoLengthMm: 6800,
      cargoVolumeCubicM: 18,
      weightKg: 18000,
      sortOrder: 1,
    },
    {
      slug: "sinotruk-howo-8x4-dump-truck",
      name: "SINOTRUK HOWO 8X4 DUMP TRUCK",
      nameZh: "中国重汽 HOWO 8X4 自卸车",
      brandSlug: "sinotruk-howo",
      categorySlug: "dump-trucks",
      basePrice: 48000,
      maxPrice: 68000,
      driveType: "drive_type_8x4",
      enginePower: 430,
      wheelbase: 4200,
      cargoLengthMm: 7600,
      cargoVolumeCubicM: 22,
      weightKg: 20500,
      sortOrder: 2,
    },
    {
      slug: "sinotruk-howo-6x4-tractor-truck",
      name: "SINOTRUK HOWO 6X4 TRACTOR TRUCK",
      nameZh: "中国重汽 HOWO 6X4 牵引车",
      brandSlug: "sinotruk-howo",
      categorySlug: "tractor-trucks",
      basePrice: 45000,
      maxPrice: 70000,
      driveType: "drive_type_6x4",
      enginePower: 430,
      wheelbase: 3200,
      cargoLengthMm: undefined,
      cargoVolumeCubicM: undefined,
      weightKg: 15000,
      sortOrder: 3,
    },
    {
      slug: "sinotruk-howo-4x2-tractor-truck",
      name: "SINOTRUK HOWO 4X2 TRACTOR TRUCK",
      nameZh: "中国重汽 HOWO 4X2 牵引车",
      brandSlug: "sinotruk-howo",
      categorySlug: "tractor-trucks",
      basePrice: 39000,
      maxPrice: 59000,
      driveType: "drive_type_4x2",
      enginePower: 340,
      wheelbase: 3200,
      cargoLengthMm: undefined,
      cargoVolumeCubicM: undefined,
      weightKg: 12500,
      sortOrder: 4,
    },
    {
      slug: "sinotruk-nx-6x4-dump-truck",
      name: "SINOTRUK NX 6X4 DUMP TRUCK",
      nameZh: "中国重汽 NX 6X4 自卸车",
      brandSlug: "sinotruk-nx",
      categorySlug: "dump-trucks",
      basePrice: 43000,
      maxPrice: 63000,
      driveType: "drive_type_6x4",
      enginePower: 400,
      wheelbase: 3600,
      cargoLengthMm: 6800,
      cargoVolumeCubicM: 18,
      weightKg: 18000,
      sortOrder: 5,
    },
    {
      slug: "sinotruk-nx-8x4-dump-truck",
      name: "SINOTRUK NX 8X4 DUMP TRUCK",
      nameZh: "中国重汽 NX 8X4 自卸车",
      brandSlug: "sinotruk-nx",
      categorySlug: "dump-trucks",
      basePrice: 49000,
      maxPrice: 69000,
      driveType: "drive_type_8x4",
      enginePower: 430,
      wheelbase: 4200,
      cargoLengthMm: 7600,
      cargoVolumeCubicM: 22,
      weightKg: 20500,
      sortOrder: 6,
    },
    {
      slug: "sinotruk-nx-6x4-tractor-truck",
      name: "SINOTRUK NX 6X4 TRACTOR TRUCK",
      nameZh: "中国重汽 NX 6X4 牵引车",
      brandSlug: "sinotruk-nx",
      categorySlug: "tractor-trucks",
      basePrice: 46000,
      maxPrice: 71000,
      driveType: "drive_type_6x4",
      enginePower: 430,
      wheelbase: 3200,
      cargoLengthMm: undefined,
      cargoVolumeCubicM: undefined,
      weightKg: 15000,
      sortOrder: 7,
    },
    {
      slug: "sinotruk-nx-4x2-tractor-truck",
      name: "SINOTRUK NX 4X2 TRACTOR TRUCK",
      nameZh: "中国重汽 NX 4X2 牵引车",
      brandSlug: "sinotruk-nx",
      categorySlug: "tractor-trucks",
      basePrice: 40000,
      maxPrice: 60000,
      driveType: "drive_type_4x2",
      enginePower: 340,
      wheelbase: 3200,
      cargoLengthMm: undefined,
      cargoVolumeCubicM: undefined,
      weightKg: 12500,
      sortOrder: 8,
    },
    {
      slug: "sinotruk-howo-12-square-mixing-tank-truck-6x4",
      name: "SINOTRUK HOWO 12 SQUARE MIXING TANK TRUCK",
      nameZh: "中国重汽 HOWO 12方搅拌罐卡车",
      brandSlug: "sinotruk-howo",
      categorySlug: "mixer-trucks",
      basePrice: 56000,
      maxPrice: 78000,
      driveType: "drive_type_6x4",
      enginePower: 380,
      wheelbase: 3600,
      cargoLengthMm: undefined,
      cargoVolumeCubicM: 12,
      weightKg: 18500,
      sortOrder: 9,
    },
    {
      slug: "sinotruk-howo-12-square-mixing-tank-truck-8x4",
      name: "SINOTRUK HOWO 12 SQUARE MIXING TANK TRUCK",
      nameZh: "中国重汽 HOWO 12方搅拌罐卡车",
      brandSlug: "sinotruk-howo",
      categorySlug: "mixer-trucks",
      basePrice: 59000,
      maxPrice: 80000,
      driveType: "drive_type_8x4",
      enginePower: 400,
      wheelbase: 4200,
      cargoLengthMm: undefined,
      cargoVolumeCubicM: 12,
      weightKg: 19800,
      sortOrder: 10,
    },
    {
      slug: "sinotruk-howo-20-square-sprinkler-truck",
      name: "SINOTRUK HOWO 20 SQUARE SPRINKLER TRUCK",
      nameZh: "中国重汽 HOWO 20方洒水车",
      brandSlug: "sinotruk-howo",
      categorySlug: "sprinkler-trucks",
      basePrice: 45000,
      maxPrice: 68000,
      driveType: "drive_type_6x4",
      enginePower: 360,
      wheelbase: 3600,
      cargoLengthMm: undefined,
      cargoVolumeCubicM: 20,
      weightKg: 17000,
      sortOrder: 11,
    },
    {
      slug: "sinotruk-howo-6x4-van-truck",
      name: "SINOTRUK HOWO 6X4 VAN TRUCK",
      nameZh: "中国重汽 HOWO 6X4 厢式车",
      brandSlug: "sinotruk-howo",
      categorySlug: "van-trucks",
      basePrice: 39000,
      maxPrice: 58000,
      driveType: "drive_type_6x4",
      enginePower: 350,
      wheelbase: 3600,
      cargoLengthMm: 7200,
      cargoVolumeCubicM: 26,
      weightKg: 16500,
      sortOrder: 12,
    },
    {
      slug: "sinotruk-howo-6x4-warehouse-truck",
      name: "SINOTRUK HOWO 6X4 WAREHOUSE TRUCK",
      nameZh: "中国重汽 HOWO 6X4 仓栅车",
      brandSlug: "sinotruk-howo",
      categorySlug: "warehouse-trucks",
      basePrice: 38000,
      maxPrice: 56000,
      driveType: "drive_type_6x4",
      enginePower: 350,
      wheelbase: 3600,
      cargoLengthMm: 7800,
      cargoVolumeCubicM: 28,
      weightKg: 16000,
      sortOrder: 13,
    },
    {
      slug: "sinotruk-howo-tx-6x4-tractor-truck",
      name: "SINOTRUK HOWO TX 6X4 TRACTOR TRUCK",
      nameZh: "中国重汽 HOWO TX 6X4 牵引车",
      brandSlug: "sinotruk-howo-tx",
      categorySlug: "tractor-trucks",
      basePrice: 47000,
      maxPrice: 72000,
      driveType: "drive_type_6x4",
      enginePower: 430,
      wheelbase: 3200,
      cargoLengthMm: undefined,
      cargoVolumeCubicM: undefined,
      weightKg: 15200,
      sortOrder: 14,
    },
    {
      slug: "sinotruk-howo-tx-6x4-dump-truck",
      name: "SINOTRUK HOWO TX 6X4 DUMP TRUCK",
      nameZh: "中国重汽 HOWO TX 6X4 自卸车",
      brandSlug: "sinotruk-howo-tx",
      categorySlug: "dump-trucks",
      basePrice: 50000,
      maxPrice: 72000,
      driveType: "drive_type_6x4",
      enginePower: 430,
      wheelbase: 3600,
      cargoLengthMm: 7000,
      cargoVolumeCubicM: 20,
      weightKg: 19000,
      sortOrder: 15,
    },
    {
      slug: "sinotruk-howo-tx-8x4-dump-truck",
      name: "SINOTRUK HOWO TX 8X4 DUMP TRUCK",
      nameZh: "中国重汽 HOWO TX 8X4 自卸车",
      brandSlug: "sinotruk-howo-tx",
      categorySlug: "dump-trucks",
      basePrice: 54000,
      maxPrice: 76000,
      driveType: "drive_type_8x4",
      enginePower: 460,
      wheelbase: 4200,
      cargoLengthMm: 7800,
      cargoVolumeCubicM: 24,
      weightKg: 21000,
      sortOrder: 16,
    },
    {
      slug: "sinotruk-howo-tx-8x4-tanker",
      name: "SINOTRUK HOWO TX 8X4 TANKER",
      nameZh: "中国重汽 HOWO TX 8X4 罐车",
      brandSlug: "sinotruk-howo-tx",
      categorySlug: "tanker-trucks",
      basePrice: 52000,
      maxPrice: 76000,
      driveType: "drive_type_8x4",
      enginePower: 430,
      wheelbase: 4200,
      cargoLengthMm: undefined,
      cargoVolumeCubicM: 24,
      weightKg: 20000,
      sortOrder: 17,
    },
    {
      slug: "shacman-f3000-tractor",
      name: "SHACMAN F3000 TRACTOR",
      nameZh: "陕汽 F3000 牵引车",
      brandSlug: "shacman",
      categorySlug: "tractor-trucks",
      basePrice: 43000,
      maxPrice: 68000,
      driveType: "drive_type_6x4",
      enginePower: 420,
      wheelbase: 3200,
      cargoLengthMm: undefined,
      cargoVolumeCubicM: undefined,
      weightKg: 15000,
      sortOrder: 18,
    },
    {
      slug: "shacman-6x4-dump-truck",
      name: "SHACMAN 6X4 DUMP TRUCK",
      nameZh: "陕汽 6X4 自卸车",
      brandSlug: "shacman",
      categorySlug: "dump-trucks",
      basePrice: 44000,
      maxPrice: 66000,
      driveType: "drive_type_6x4",
      enginePower: 400,
      wheelbase: 3600,
      cargoLengthMm: 6800,
      cargoVolumeCubicM: 18,
      weightKg: 18000,
      sortOrder: 19,
    },
    {
      slug: "shacman-8x4-dump-truck",
      name: "SHACMAN 8X4 DUMP TRUCK",
      nameZh: "陕汽 8X4 自卸车",
      brandSlug: "shacman",
      categorySlug: "dump-trucks",
      basePrice: 49000,
      maxPrice: 70000,
      driveType: "drive_type_8x4",
      enginePower: 430,
      wheelbase: 4200,
      cargoLengthMm: 7600,
      cargoVolumeCubicM: 22,
      weightKg: 20500,
      sortOrder: 20,
    },
    {
      slug: "semi-trailer",
      name: "SEMI TRAILER",
      nameZh: "半挂车",
      brandSlug: "tengyu-custom",
      categorySlug: "semi-trailers",
      basePrice: 15000,
      maxPrice: 32000,
      driveType: undefined,
      enginePower: undefined,
      wheelbase: undefined,
      cargoLengthMm: 13000,
      cargoVolumeCubicM: 32,
      weightKg: 8000,
      sortOrder: 21,
    },
    {
      slug: "customized-services",
      name: "CUSTOMIZED SERVICES",
      nameZh: "定制化服务",
      brandSlug: "tengyu-custom",
      categorySlug: "customized-services",
      basePrice: 30000,
      maxPrice: 90000,
      driveType: undefined,
      enginePower: undefined,
      wheelbase: undefined,
      cargoLengthMm: undefined,
      cargoVolumeCubicM: undefined,
      weightKg: undefined,
      sortOrder: 22,
    },
  ];

  const brandIds = await upsertBrands(brandSeeds);
  const categoryIds = await upsertCategories(categorySeeds);
  await upsertProducts(productSeeds, brandIds, categoryIds);

  await upsertSettings([
    {
      key: "default_language",
      value: "en",
      group: "i18n",
      label: "Default Language",
      labelZh: "默认语言",
    },
    {
      key: "site_title_en",
      value: "Tengyu International Truck Factory",
      group: "site",
      label: "Site Title (EN)",
      labelZh: "网站标题(英文)",
    },
    {
      key: "site_title_zh",
      value: "腾宇国际卡车工厂",
      group: "site",
      label: "Site Title (ZH)",
      labelZh: "网站标题(中文)",
    },
    {
      key: "header_title_en",
      value: "Tengyu International Truck Factory",
      group: "site",
      label: "Header Title (EN)",
      labelZh: "页头标题(英文)",
    },
    {
      key: "header_title_zh",
      value: "腾宇国际卡车工厂",
      group: "site",
      label: "Header Title (ZH)",
      labelZh: "页头标题(中文)",
    },
    {
      key: "footer_copyright_text_en",
      value: "Tengyu International Truck Factory. All rights reserved.",
      group: "site",
      label: "Footer Copyright (EN)",
      labelZh: "页脚版权(英文)",
    },
    {
      key: "footer_copyright_text_zh",
      value: "腾宇国际卡车工厂 版权所有。",
      group: "site",
      label: "Footer Copyright (ZH)",
      labelZh: "页脚版权(中文)",
    },
    {
      key: "support_email",
      value: "sales@tengyutruck.com",
      group: "contact",
      label: "Support Email",
      labelZh: "联系邮箱",
    },
    {
      key: "support_phone",
      value: "+86 18800000000",
      group: "contact",
      label: "Support Phone",
      labelZh: "联系电话",
    },
    {
      key: "whatsapp_number",
      value: "+86 18800000000",
      group: "contact",
      label: "WhatsApp Number",
      labelZh: "WhatsApp 号码",
    },
    {
      key: "whatsapp_message_en",
      value: "Hello, I would like to discuss truck options.",
      group: "contact",
      label: "WhatsApp Message (EN)",
      labelZh: "WhatsApp 默认消息(英文)",
    },
    {
      key: "whatsapp_message_zh",
      value: "您好，我想咨询卡车方案。",
      group: "contact",
      label: "WhatsApp Message (ZH)",
      labelZh: "WhatsApp 默认消息(中文)",
    },
    {
      key: "contact_address_en",
      value: "Shandong, China",
      group: "contact",
      label: "Contact Address (EN)",
      labelZh: "联系地址(英文)",
    },
    {
      key: "contact_address_zh",
      value: "中国山东",
      group: "contact",
      label: "Contact Address (ZH)",
      labelZh: "联系地址(中文)",
    },
    {
      key: "home_hero_title_en",
      value: "Tengyu International Truck Factory",
      group: "home",
      label: "Home Hero Title (EN)",
      labelZh: "首页主标题(英文)",
    },
    {
      key: "home_hero_title_zh",
      value: "腾宇国际卡车工厂",
      group: "home",
      label: "Home Hero Title (ZH)",
      labelZh: "首页主标题(中文)",
    },
    {
      key: "home_hero_subtitle_en",
      value:
        "Specialized in remanufacturing commercial vehicles and trailers, including dump trucks, tractor trucks, and tankers.",
      group: "home",
      label: "Home Hero Subtitle (EN)",
      labelZh: "首页副标题(英文)",
    },
    {
      key: "home_hero_subtitle_zh",
      value: "专注再制造商用车与挂车，覆盖自卸车、牵引车、罐车等车型。",
      group: "home",
      label: "Home Hero Subtitle (ZH)",
      labelZh: "首页副标题(中文)",
    },
    {
      key: "home_hero_image_url",
      value: "/assets/site/home-hero.jpg",
      type: "image",
      group: "home",
      label: "Home Hero Image URL",
      labelZh: "首页主视觉图片",
    },
    {
      key: "about_intro_en",
      value:
        "Tengyu International Truck Factory specializes in remanufacturing a wide range of commercial vehicles and trailers, delivering high-performance and durable customized solutions for construction, transportation, and engineering industries.",
      group: "about",
      label: "About Intro (EN)",
      labelZh: "关于我们介绍(英文)",
    },
    {
      key: "about_intro_zh",
      value:
        "腾宇国际卡车工厂专注于各类商用车与挂车再制造，为建筑、运输、工程等行业提供高性能、耐用的定制化解决方案。",
      group: "about",
      label: "About Intro (ZH)",
      labelZh: "关于我们介绍(中文)",
    },
    {
      key: "about_card_1_title_en",
      value: "Quality Connects Us",
      group: "about",
      label: "About Card 1 Title (EN)",
      labelZh: "关于卡片1标题(英文)",
    },
    {
      key: "about_card_1_title_zh",
      value: "质量连接你我",
      group: "about",
      label: "About Card 1 Title (ZH)",
      labelZh: "关于卡片1标题(中文)",
    },
    {
      key: "about_card_1_body_en",
      value: "Every delivered commercial vehicle goes through strict testing and auditing before handover.",
      group: "about",
      label: "About Card 1 Body (EN)",
      labelZh: "关于卡片1内容(英文)",
    },
    {
      key: "about_card_1_body_zh",
      value: "我们坚持严格质量标准，每台交付车辆都经过完整检测与审核。",
      group: "about",
      label: "About Card 1 Body (ZH)",
      labelZh: "关于卡片1内容(中文)",
    },
    {
      key: "about_card_2_title_en",
      value: "Remanufacturing Capability",
      group: "about",
      label: "About Card 2 Title (EN)",
      labelZh: "关于卡片2标题(英文)",
    },
    {
      key: "about_card_2_title_zh",
      value: "再制造能力",
      group: "about",
      label: "About Card 2 Title (ZH)",
      labelZh: "关于卡片2标题(中文)",
    },
    {
      key: "about_card_2_body_en",
      value:
        "Our process includes deep cleaning, chassis repair, engine and transmission remanufacturing, circuit checks, and component replacement.",
      group: "about",
      label: "About Card 2 Body (EN)",
      labelZh: "关于卡片2内容(英文)",
    },
    {
      key: "about_card_2_body_zh",
      value: "覆盖整车清洗、底盘检修、发动机与变速箱再制造、线路检测及易损件更换。",
      group: "about",
      label: "About Card 2 Body (ZH)",
      labelZh: "关于卡片2内容(中文)",
    },
    {
      key: "about_card_3_title_en",
      value: "Customized Solutions",
      group: "about",
      label: "About Card 3 Title (EN)",
      labelZh: "关于卡片3标题(英文)",
    },
    {
      key: "about_card_3_title_zh",
      value: "定制化方案",
      group: "about",
      label: "About Card 3 Title (ZH)",
      labelZh: "关于卡片3标题(中文)",
    },
    {
      key: "about_card_3_body_en",
      value: "We tailor dump trucks, tractor heads, mixers, tankers, and trailers to match specific business scenarios.",
      group: "about",
      label: "About Card 3 Body (EN)",
      labelZh: "关于卡片3内容(英文)",
    },
    {
      key: "about_card_3_body_zh",
      value: "可按场景定制自卸车、牵引车、搅拌车、罐车及挂车配置，精准匹配业务需求。",
      group: "about",
      label: "About Card 3 Body (ZH)",
      labelZh: "关于卡片3内容(中文)",
    },
    {
      key: "about_image_url",
      value: "/assets/site/about-factory.jpg",
      type: "image",
      group: "about",
      label: "About Image URL",
      labelZh: "关于我们图片",
    },
    {
      key: "fuel_type_diesel",
      value: "Diesel",
      type: "fuel_type",
      group: "fuel_types",
      label: "Diesel",
      labelZh: "柴油",
    },
    {
      key: "fuel_type_lng",
      value: "LNG",
      type: "fuel_type",
      group: "fuel_types",
      label: "LNG",
      labelZh: "液化天然气",
    },
    {
      key: "fuel_type_electric",
      value: "Electric",
      type: "fuel_type",
      group: "fuel_types",
      label: "Electric",
      labelZh: "纯电",
    },
    {
      key: "drive_type_4x2",
      value: "4x2",
      type: "drive_type",
      group: "drive_types",
      label: "4x2",
      labelZh: "4x2",
    },
    {
      key: "drive_type_6x4",
      value: "6x4",
      type: "drive_type",
      group: "drive_types",
      label: "6x4",
      labelZh: "6x4",
    },
    {
      key: "drive_type_8x4",
      value: "8x4",
      type: "drive_type",
      group: "drive_types",
      label: "8x4",
      labelZh: "8x4",
    },
  ]);

  console.log("Seed complete: admin, brands, categories, products, images, settings");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
