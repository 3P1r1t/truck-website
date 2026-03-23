export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productCreateSchema } from "@/lib/validation";
import { fail, ok, parsePagination, slugify } from "@/lib/utils";
import { getLocale, boolParam } from "@/lib/api-helpers";
import { mapProduct } from "@/lib/transformers";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const locale = getLocale(request);
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = parsePagination(searchParams);

    const includeInactiveRequested = boolParam(searchParams, "includeInactive", false);
    const admin = includeInactiveRequested ? await requireAdmin(request) : null;
    const includeInactive = includeInactiveRequested && Boolean(admin);

    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    const brandId = searchParams.get("brandId");
    const categoryId = searchParams.get("categoryId");
    const fuelType = searchParams.get("fuelType");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    if (brandId) {
      where.brandId = brandId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (fuelType) {
      where.fuelType = fuelType;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameZh: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { descriptionZh: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { shortDescriptionZh: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return ok(items.map((item) => mapProduct(item, locale)), {
      pagination: { page, pageSize, total },
    });
  } catch (error) {
    console.error("GET /api/products failed", error);
    return fail("Failed to fetch products", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const locale = getLocale(request);
    const json = await request.json();
    const parsed = productCreateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;
    const slug = payload.slug?.trim() || slugify(payload.name);

    const created = await prisma.product.create({
      data: {
        brandId: payload.brandId,
        categoryId: payload.categoryId,
        name: payload.name,
        nameZh: payload.nameZh || null,
        slug,
        description: payload.description || null,
        descriptionZh: payload.descriptionZh || null,
        shortDescription: payload.shortDescription || null,
        shortDescriptionZh: payload.shortDescriptionZh || null,
        basePrice: payload.basePrice,
        currency: payload.currency || "USD",
        fuelType: payload.fuelType || null,
        enginePower: payload.enginePower ?? null,
        wheelbase: payload.wheelbase ?? null,
        driveType: payload.driveType || null,
        cargoLengthMm: payload.cargoLengthMm ?? null,
        cargoVolumeCubicM: payload.cargoVolumeCubicM ?? null,
        batteryCapacityKwh: payload.batteryCapacityKwh ?? null,
        emissionStandard: payload.emissionStandard || null,
        weightKg: payload.weightKg ?? null,
        isFeatured: payload.isFeatured ?? false,
        isActive: payload.isActive ?? true,
        sortOrder: payload.sortOrder ?? 0,
      },
      include: {
        brand: true,
        category: true,
        images: true,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE_PRODUCT",
        entity: "Product",
        entityId: created.id,
        details: { slug: created.slug },
      },
    });

    return ok(mapProduct(created, locale), { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return fail("Product slug already exists", 409);
    }
    console.error("POST /api/products failed", error);
    return fail("Failed to create product", 500);
  }
}


