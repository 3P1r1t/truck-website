import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
        type: setting.type ?? 'text',
        group: setting.group,
        label: setting.label,
        labelZh: setting.labelZh,
        description: setting.description,
      },
      update: {
        value: setting.value,
        type: setting.type ?? 'text',
        group: setting.group,
        label: setting.label,
        labelZh: setting.labelZh,
        description: setting.description,
      },
    });
  }
}

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.admin.upsert({
    where: { username: 'admin' },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    update: {
      email: 'admin@example.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  const volvo = await prisma.brand.upsert({
    where: { slug: 'volvo' },
    create: {
      name: 'Volvo',
      nameZh: '沃尔沃',
      slug: 'volvo',
      description: 'Swedish commercial vehicle manufacturer',
      descriptionZh: '瑞典商用车制造商',
      isActive: true,
      sortOrder: 1,
    },
    update: {},
  });

  const scania = await prisma.brand.upsert({
    where: { slug: 'scania' },
    create: {
      name: 'Scania',
      nameZh: '斯堪尼亚',
      slug: 'scania',
      description: 'Global heavy truck manufacturer',
      descriptionZh: '全球重卡制造商',
      isActive: true,
      sortOrder: 2,
    },
    update: {},
  });

  const lightTruck = await prisma.category.upsert({
    where: { slug: 'light-trucks' },
    create: {
      name: 'Light Trucks',
      nameZh: '轻型卡车',
      slug: 'light-trucks',
      description: 'Urban and short-haul transport trucks',
      descriptionZh: '城市与短途运输卡车',
      isActive: true,
      sortOrder: 1,
    },
    update: {},
  });

  const heavyTruck = await prisma.category.upsert({
    where: { slug: 'heavy-trucks' },
    create: {
      name: 'Heavy Trucks',
      nameZh: '重型卡车',
      slug: 'heavy-trucks',
      description: 'Long-haul and high-load transport trucks',
      descriptionZh: '长途与重载运输卡车',
      isActive: true,
      sortOrder: 2,
    },
    update: {},
  });

  const productA = await prisma.product.upsert({
    where: { slug: 'volvo-fl-280' },
    create: {
      brandId: volvo.id,
      categoryId: lightTruck.id,
      name: 'Volvo FL 280',
      nameZh: '沃尔沃 FL 280',
      slug: 'volvo-fl-280',
      description: 'Compact truck ideal for city distribution and logistics.',
      descriptionZh: '适用于城市配送与物流运输的紧凑型卡车。',
      shortDescription: 'Compact truck for urban logistics.',
      shortDescriptionZh: '城市物流紧凑型卡车。',
      basePrice: 35000,
      currency: 'USD',
      fuelType: 'diesel',
      enginePower: 280,
      wheelbase: 3150,
      driveType: '4x2',
      cargoLengthMm: 5000,
      cargoVolumeCubicM: 12.5,
      emissionStandard: 'EURO-6',
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
    },
    update: {},
  });

  const productB = await prisma.product.upsert({
    where: { slug: 'scania-r-520' },
    create: {
      brandId: scania.id,
      categoryId: heavyTruck.id,
      name: 'Scania R 520',
      nameZh: '斯堪尼亚 R 520',
      slug: 'scania-r-520',
      description: 'Long-haul heavy truck with high torque and comfort cabin.',
      descriptionZh: '高扭矩长途重卡，兼顾动力与驾乘舒适。',
      shortDescription: 'High-power long-haul heavy truck.',
      shortDescriptionZh: '高功率长途运输重卡。',
      basePrice: 95000,
      currency: 'USD',
      fuelType: 'diesel',
      enginePower: 520,
      wheelbase: 3700,
      driveType: '6x4',
      cargoLengthMm: 8000,
      cargoVolumeCubicM: 25.0,
      emissionStandard: 'EURO-5',
      isFeatured: true,
      isActive: true,
      sortOrder: 2,
    },
    update: {},
  });

  const sampleImages = [
    {
      productId: productA.id,
      imageUrl: 'https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg',
      altText: 'Volvo FL 280 sample image',
      isPrimary: true,
      sortOrder: 1,
    },
    {
      productId: productA.id,
      imageUrl: 'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg',
      altText: 'Volvo FL 280 detail image',
      isPrimary: false,
      sortOrder: 2,
    },
    {
      productId: productB.id,
      imageUrl: 'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg',
      altText: 'Scania R 520 sample image',
      isPrimary: true,
      sortOrder: 1,
    },
    {
      productId: productB.id,
      imageUrl: 'https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg',
      altText: 'Scania R 520 detail image',
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

  await upsertSettings([
    {
      key: 'default_language',
      value: 'en',
      group: 'i18n',
      label: 'Default Language',
      labelZh: '默认语言',
    },
    {
      key: 'site_title_en',
      value: 'Global Commercial Vehicles',
      group: 'site',
      label: 'Site Title (EN)',
      labelZh: '网站标题（英文）',
    },
    {
      key: 'site_title_zh',
      value: '全球商用车平台',
      group: 'site',
      label: 'Site Title (ZH)',
      labelZh: '网站标题（中文）',
    },
    {
      key: 'header_title_en',
      value: 'Global Commercial Vehicles',
      group: 'site',
      label: 'Header Title (EN)',
      labelZh: '页头标题（英文）',
    },
    {
      key: 'header_title_zh',
      value: '全球商用车平台',
      group: 'site',
      label: 'Header Title (ZH)',
      labelZh: '页头标题（中文）',
    },
    {
      key: 'footer_copyright_text_en',
      value: 'Global Commercial Vehicles. All rights reserved.',
      group: 'site',
      label: 'Footer Copyright (EN)',
      labelZh: '页脚版权（英文）',
    },
    {
      key: 'footer_copyright_text_zh',
      value: '全球商用车平台 版权所有。',
      group: 'site',
      label: 'Footer Copyright (ZH)',
      labelZh: '页脚版权（中文）',
    },
    {
      key: 'support_email',
      value: 'support@globaltrucks.com',
      group: 'contact',
      label: 'Support Email',
      labelZh: '支持邮箱',
    },
    {
      key: 'support_phone',
      value: '+1-800-TRUCKS',
      group: 'contact',
      label: 'Support Phone',
      labelZh: '支持电话',
    },
    {
      key: 'contact_address_en',
      value: 'No. 123 Logistics Avenue, Beijing',
      group: 'contact',
      label: 'Contact Address (EN)',
      labelZh: '联系地址（英文）',
    },
    {
      key: 'contact_address_zh',
      value: '北京市物流大道123号',
      group: 'contact',
      label: 'Contact Address (ZH)',
      labelZh: '联系地址（中文）',
    },
    {
      key: 'home_hero_title_en',
      value: 'Professional Commercial Vehicle Solutions',
      group: 'home',
      label: 'Home Hero Title (EN)',
      labelZh: '首页主标题（英文）',
    },
    {
      key: 'home_hero_title_zh',
      value: '专业商用车解决方案',
      group: 'home',
      label: 'Home Hero Title (ZH)',
      labelZh: '首页主标题（中文）',
    },
    {
      key: 'home_hero_subtitle_en',
      value: 'Find global trucks and get efficient inquiry support.',
      group: 'home',
      label: 'Home Hero Subtitle (EN)',
      labelZh: '首页副标题（英文）',
    },
    {
      key: 'home_hero_subtitle_zh',
      value: '聚合全球卡车车型，快速获取询盘支持。',
      group: 'home',
      label: 'Home Hero Subtitle (ZH)',
      labelZh: '首页副标题（中文）',
    },
    {
      key: 'about_intro_en',
      value: 'We provide integrated procurement and support for commercial fleets.',
      group: 'about',
      label: 'About Intro (EN)',
      labelZh: '关于介绍（英文）',
    },
    {
      key: 'about_intro_zh',
      value: '我们为商用车车队提供一体化采购与服务支持。',
      group: 'about',
      label: 'About Intro (ZH)',
      labelZh: '关于介绍（中文）',
    },
  ]);

  console.log('Seed complete: admin, brands, categories, products, images, settings');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
