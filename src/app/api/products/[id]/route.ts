export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productUpdateSchema } from "@/lib/validation";
import { fail, ok, slugify } from "@/lib/utils";
import { getLocale } from "@/lib/api-helpers";
import { mapProduct } from "@/lib/transformers";
import { requireAdmin } from "@/lib/admin-auth";

async function generateUniqueProductSlug(name: string, excludeId: string) {
  const base = slugify(name).trim() || "product";
  let candidate = base;
  let suffix = 1;

  while (true) {
    const exists = await prisma.product.findFirst({
      where: {
        slug: candidate,
        id: { not: excludeId },
      },
      select: { id: true },
    });

    if (!exists) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

async function findProduct(identifier: string) {
  return prisma.product.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    include: {
      brand: true,
      category: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const locale = getLocale(request);
    const product = await findProduct(params.id);
    if (!product) {
      return fail("Product not found", 404);
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return ok(mapProduct(product, locale));
  } catch (error) {
    console.error("GET /api/products/[id] failed", error);
    return fail("Failed to fetch product", 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const existing = await findProduct(params.id);
    if (!existing) {
      return fail("Product not found", 404);
    }

    const json = await request.json();
    const parsed = productUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;
    const hasPriceUpdate = payload.basePrice !== undefined || payload.maxPrice !== undefined;
    const nextBasePrice = payload.basePrice !== undefined ? payload.basePrice : Number(existing.basePrice);
    const nextMaxPriceRaw = payload.maxPrice !== undefined ? payload.maxPrice : Number(existing.maxPrice);
    const nextMaxPrice = Math.max(nextMaxPriceRaw ?? nextBasePrice, nextBasePrice);
    const nextSlug =
      payload.name !== undefined ? await generateUniqueProductSlug(payload.name, existing.id) : undefined;

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: {
        ...(payload.brandId !== undefined ? { brandId: payload.brandId } : {}),
        ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.nameZh !== undefined ? { nameZh: payload.nameZh || null } : {}),
        ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
        ...(payload.description !== undefined ? { description: payload.description || null } : {}),
        ...(payload.descriptionZh !== undefined ? { descriptionZh: payload.descriptionZh || null } : {}),
        ...(payload.shortDescription !== undefined ? { shortDescription: payload.shortDescription || null } : {}),
        ...(payload.shortDescriptionZh !== undefined
          ? { shortDescriptionZh: payload.shortDescriptionZh || null }
          : {}),
        ...(hasPriceUpdate ? { basePrice: nextBasePrice, maxPrice: nextMaxPrice } : {}),
        ...(payload.currency !== undefined ? { currency: payload.currency || "USD" } : {}),
        ...(payload.fuelType !== undefined ? { fuelType: payload.fuelType || null } : {}),
        ...(payload.enginePower !== undefined ? { enginePower: payload.enginePower ?? null } : {}),
        ...(payload.wheelbase !== undefined ? { wheelbase: payload.wheelbase ?? null } : {}),
        ...(payload.driveType !== undefined ? { driveType: payload.driveType || null } : {}),
        ...(payload.cargoLengthMm !== undefined ? { cargoLengthMm: payload.cargoLengthMm ?? null } : {}),
        ...(payload.cargoVolumeCubicM !== undefined
          ? { cargoVolumeCubicM: payload.cargoVolumeCubicM ?? null }
          : {}),
        ...(payload.batteryCapacityKwh !== undefined
          ? { batteryCapacityKwh: payload.batteryCapacityKwh ?? null }
          : {}),
        ...(payload.emissionStandard !== undefined
          ? { emissionStandard: payload.emissionStandard || null }
          : {}),
        ...(payload.weightKg !== undefined ? { weightKg: payload.weightKg ?? null } : {}),
        ...(payload.isFeatured !== undefined ? { isFeatured: payload.isFeatured } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
      },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_PRODUCT",
        entity: "Product",
        entityId: existing.id,
      },
    });

    return ok(mapProduct(updated, getLocale(request)));
  } catch (error: any) {
    console.error("PUT /api/products/[id] failed", error);
    return fail("Failed to update product", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const existing = await findProduct(params.id);
    if (!existing) {
      return fail("Product not found", 404);
    }

    await prisma.product.delete({ where: { id: existing.id } });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE_PRODUCT",
        entity: "Product",
        entityId: existing.id,
      },
    });

    return ok({ id: existing.id });
  } catch (error) {
    console.error("DELETE /api/products/[id] failed", error);
    return fail("Failed to delete product", 500);
  }
}


