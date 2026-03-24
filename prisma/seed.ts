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

async function upsertSampleProducts(brandIds: { volvoId: string; scaniaId: string }, categoryIds: { lightId: string; heavyId: string }) {
  const productA = await prisma.product.upsert({
    where: { slug: "volvo-fl-280" },
    create: {
      brandId: brandIds.volvoId,
      categoryId: categoryIds.lightId,
      name: "Volvo FL 280",
      nameZh: "Volvo FL 280",
      slug: "volvo-fl-280",
      description: "Compact truck ideal for city distribution and logistics.",
      descriptionZh: "Compact truck ideal for city distribution and logistics.",
      shortDescription: "Compact truck for urban logistics.",
      shortDescriptionZh: "Compact truck for urban logistics.",
      basePrice: 35000,
      maxPrice: 42000,
      currency: "USD",
      fuelType: "fuel_type_diesel",
      enginePower: 280,
      wheelbase: 3150,
      driveType: "drive_type_4x2",
      cargoLengthMm: 5000,
      cargoVolumeCubicM: 12.5,
      emissionStandard: "EURO-6",
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
    },
    update: {
      brandId: brandIds.volvoId,
      categoryId: categoryIds.lightId,
      name: "Volvo FL 280",
      nameZh: "Volvo FL 280",
      description: "Compact truck ideal for city distribution and logistics.",
      descriptionZh: "Compact truck ideal for city distribution and logistics.",
      shortDescription: "Compact truck for urban logistics.",
      shortDescriptionZh: "Compact truck for urban logistics.",
      basePrice: 35000,
      maxPrice: 42000,
      currency: "USD",
      fuelType: "fuel_type_diesel",
      enginePower: 280,
      wheelbase: 3150,
      driveType: "drive_type_4x2",
      cargoLengthMm: 5000,
      cargoVolumeCubicM: 12.5,
      emissionStandard: "EURO-6",
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
    },
  });

  const productB = await prisma.product.upsert({
    where: { slug: "scania-r-520" },
    create: {
      brandId: brandIds.scaniaId,
      categoryId: categoryIds.heavyId,
      name: "Scania R 520",
      nameZh: "Scania R 520",
      slug: "scania-r-520",
      description: "Long-haul heavy truck with high torque and comfort cabin.",
      descriptionZh: "Long-haul heavy truck with high torque and comfort cabin.",
      shortDescription: "High-power long-haul heavy truck.",
      shortDescriptionZh: "High-power long-haul heavy truck.",
      basePrice: 95000,
      maxPrice: 120000,
      currency: "USD",
      fuelType: "fuel_type_diesel",
      enginePower: 520,
      wheelbase: 3700,
      driveType: "drive_type_6x4",
      cargoLengthMm: 8000,
      cargoVolumeCubicM: 25,
      emissionStandard: "EURO-5",
      isFeatured: true,
      isActive: true,
      sortOrder: 2,
    },
    update: {
      brandId: brandIds.scaniaId,
      categoryId: categoryIds.heavyId,
      name: "Scania R 520",
      nameZh: "Scania R 520",
      description: "Long-haul heavy truck with high torque and comfort cabin.",
      descriptionZh: "Long-haul heavy truck with high torque and comfort cabin.",
      shortDescription: "High-power long-haul heavy truck.",
      shortDescriptionZh: "High-power long-haul heavy truck.",
      basePrice: 95000,
      maxPrice: 120000,
      currency: "USD",
      fuelType: "fuel_type_diesel",
      enginePower: 520,
      wheelbase: 3700,
      driveType: "drive_type_6x4",
      cargoLengthMm: 8000,
      cargoVolumeCubicM: 25,
      emissionStandard: "EURO-5",
      isFeatured: true,
      isActive: true,
      sortOrder: 2,
    },
  });

  const sampleImages = [
    {
      productId: productA.id,
      imageUrl: "https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg",
      altText: "Volvo FL 280 sample image",
      isPrimary: true,
      sortOrder: 1,
    },
    {
      productId: productA.id,
      imageUrl: "https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg",
      altText: "Volvo FL 280 detail image",
      isPrimary: false,
      sortOrder: 2,
    },
    {
      productId: productB.id,
      imageUrl: "https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg",
      altText: "Scania R 520 sample image",
      isPrimary: true,
      sortOrder: 1,
    },
    {
      productId: productB.id,
      imageUrl: "https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg",
      altText: "Scania R 520 detail image",
      isPrimary: false,
      sortOrder: 2,
    },
  ];

  for (const image of sampleImages) {
    const existing = await prisma.productImage.findFirst({
      where: {
        productId: image.productId,
        imageUrl: image.imageUrl,
      },
    });

    if (!existing) {
      await prisma.productImage.create({ data: image });
    }
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

  const volvo = await prisma.brand.upsert({
    where: { slug: "volvo" },
    create: {
      name: "Volvo",
      nameZh: "Volvo",
      slug: "volvo",
      description: "Swedish commercial vehicle manufacturer",
      descriptionZh: "Swedish commercial vehicle manufacturer",
      isActive: true,
      sortOrder: 1,
    },
    update: {
      name: "Volvo",
      nameZh: "Volvo",
      description: "Swedish commercial vehicle manufacturer",
      descriptionZh: "Swedish commercial vehicle manufacturer",
      isActive: true,
      sortOrder: 1,
    },
  });

  const scania = await prisma.brand.upsert({
    where: { slug: "scania" },
    create: {
      name: "Scania",
      nameZh: "Scania",
      slug: "scania",
      description: "Global heavy truck manufacturer",
      descriptionZh: "Global heavy truck manufacturer",
      isActive: true,
      sortOrder: 2,
    },
    update: {
      name: "Scania",
      nameZh: "Scania",
      description: "Global heavy truck manufacturer",
      descriptionZh: "Global heavy truck manufacturer",
      isActive: true,
      sortOrder: 2,
    },
  });

  const lightTruck = await prisma.category.upsert({
    where: { slug: "light-trucks" },
    create: {
      name: "Light Trucks",
      nameZh: "Light Trucks",
      slug: "light-trucks",
      description: "Urban and short-haul transport trucks",
      descriptionZh: "Urban and short-haul transport trucks",
      isActive: true,
      sortOrder: 1,
    },
    update: {
      name: "Light Trucks",
      nameZh: "Light Trucks",
      description: "Urban and short-haul transport trucks",
      descriptionZh: "Urban and short-haul transport trucks",
      isActive: true,
      sortOrder: 1,
    },
  });

  const heavyTruck = await prisma.category.upsert({
    where: { slug: "heavy-trucks" },
    create: {
      name: "Heavy Trucks",
      nameZh: "Heavy Trucks",
      slug: "heavy-trucks",
      description: "Long-haul and high-load transport trucks",
      descriptionZh: "Long-haul and high-load transport trucks",
      isActive: true,
      sortOrder: 2,
    },
    update: {
      name: "Heavy Trucks",
      nameZh: "Heavy Trucks",
      description: "Long-haul and high-load transport trucks",
      descriptionZh: "Long-haul and high-load transport trucks",
      isActive: true,
      sortOrder: 2,
    },
  });

  await upsertSampleProducts(
    { volvoId: volvo.id, scaniaId: scania.id },
    { lightId: lightTruck.id, heavyId: heavyTruck.id }
  );

  await upsertSettings([
    {
      key: "default_language",
      value: "en",
      group: "i18n",
      label: "Default Language",
      labelZh: "Default Language",
    },
    {
      key: "site_title_en",
      value: "Global Commercial Vehicles",
      group: "site",
      label: "Site Title (EN)",
      labelZh: "Site Title (EN)",
    },
    {
      key: "site_title_zh",
      value: "Global Commercial Vehicles",
      group: "site",
      label: "Site Title (ZH)",
      labelZh: "Site Title (ZH)",
    },
    {
      key: "header_title_en",
      value: "Global Commercial Vehicles",
      group: "site",
      label: "Header Title (EN)",
      labelZh: "Header Title (EN)",
    },
    {
      key: "header_title_zh",
      value: "Global Commercial Vehicles",
      group: "site",
      label: "Header Title (ZH)",
      labelZh: "Header Title (ZH)",
    },
    {
      key: "footer_copyright_text_en",
      value: "Global Commercial Vehicles. All rights reserved.",
      group: "site",
      label: "Footer Copyright (EN)",
      labelZh: "Footer Copyright (EN)",
    },
    {
      key: "footer_copyright_text_zh",
      value: "Global Commercial Vehicles. All rights reserved.",
      group: "site",
      label: "Footer Copyright (ZH)",
      labelZh: "Footer Copyright (ZH)",
    },
    {
      key: "support_email",
      value: "support@globaltrucks.com",
      group: "contact",
      label: "Support Email",
      labelZh: "Support Email",
    },
    {
      key: "support_phone",
      value: "+1-800-TRUCKS",
      group: "contact",
      label: "Support Phone",
      labelZh: "Support Phone",
    },
    {
      key: "contact_address_en",
      value: "No. 123 Logistics Avenue, Beijing",
      group: "contact",
      label: "Contact Address (EN)",
      labelZh: "Contact Address (EN)",
    },
    {
      key: "contact_address_zh",
      value: "No. 123 Logistics Avenue, Beijing",
      group: "contact",
      label: "Contact Address (ZH)",
      labelZh: "Contact Address (ZH)",
    },
    {
      key: "home_hero_title_en",
      value: "Professional Commercial Vehicle Solutions",
      group: "home",
      label: "Home Hero Title (EN)",
      labelZh: "Home Hero Title (EN)",
    },
    {
      key: "home_hero_title_zh",
      value: "Professional Commercial Vehicle Solutions",
      group: "home",
      label: "Home Hero Title (ZH)",
      labelZh: "Home Hero Title (ZH)",
    },
    {
      key: "home_hero_subtitle_en",
      value: "Find global trucks and get efficient inquiry support.",
      group: "home",
      label: "Home Hero Subtitle (EN)",
      labelZh: "Home Hero Subtitle (EN)",
    },
    {
      key: "home_hero_subtitle_zh",
      value: "Find global trucks and get efficient inquiry support.",
      group: "home",
      label: "Home Hero Subtitle (ZH)",
      labelZh: "Home Hero Subtitle (ZH)",
    },
    {
      key: "about_intro_en",
      value: "We provide integrated procurement and support for commercial fleets.",
      group: "about",
      label: "About Intro (EN)",
      labelZh: "About Intro (EN)",
    },
    {
      key: "about_intro_zh",
      value: "We provide integrated procurement and support for commercial fleets.",
      group: "about",
      label: "About Intro (ZH)",
      labelZh: "About Intro (ZH)",
    },
    {
      key: "about_image_url",
      value: "",
      type: "image",
      group: "about",
      label: "About Image URL",
      labelZh: "About Image URL",
    },
    {
      key: "fuel_type_diesel",
      value: "Diesel",
      type: "fuel_type",
      group: "fuel_types",
      label: "Diesel",
      labelZh: "Diesel",
    },
    {
      key: "fuel_type_lng",
      value: "LNG",
      type: "fuel_type",
      group: "fuel_types",
      label: "LNG",
      labelZh: "LNG",
    },
    {
      key: "fuel_type_electric",
      value: "Electric",
      type: "fuel_type",
      group: "fuel_types",
      label: "Electric",
      labelZh: "Electric",
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
