export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { brandUpdateSchema } from "@/lib/validation";
import { fail, ok, slugify } from "@/lib/utils";
import { getLocale } from "@/lib/api-helpers";
import { mapBrand } from "@/lib/transformers";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const locale = getLocale(request);
    const brand = await prisma.brand.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!brand) {
      return fail("Brand not found", 404);
    }

    return ok(mapBrand(brand, locale));
  } catch (error) {
    console.error("GET /api/brands/[id] failed", error);
    return fail("Failed to fetch brand", 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const existing = await prisma.brand.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!existing) {
      return fail("Brand not found", 404);
    }

    const json = await request.json();
    const parsed = brandUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;
    const updated = await prisma.brand.update({
      where: { id: existing.id },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.nameZh !== undefined ? { nameZh: payload.nameZh || null } : {}),
        ...(payload.slug !== undefined || payload.name !== undefined
          ? { slug: (payload.slug || slugify(payload.name || existing.name)).trim() }
          : {}),
        ...(payload.description !== undefined ? { description: payload.description || null } : {}),
        ...(payload.descriptionZh !== undefined ? { descriptionZh: payload.descriptionZh || null } : {}),
        ...(payload.logoUrl !== undefined ? { logoUrl: payload.logoUrl || null } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_BRAND",
        entity: "Brand",
        entityId: existing.id,
      },
    });

    return ok(updated);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return fail("Brand slug already exists", 409);
    }
    console.error("PUT /api/brands/[id] failed", error);
    return fail("Failed to update brand", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const existing = await prisma.brand.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!existing) {
      return fail("Brand not found", 404);
    }

    const productsCount = await prisma.product.count({ where: { brandId: existing.id } });
    if (productsCount > 0) {
      return fail("Cannot delete brand with existing products", 409);
    }

    await prisma.brand.delete({ where: { id: existing.id } });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE_BRAND",
        entity: "Brand",
        entityId: existing.id,
      },
    });

    return ok({ id: existing.id });
  } catch (error) {
    console.error("DELETE /api/brands/[id] failed", error);
    return fail("Failed to delete brand", 500);
  }
}


