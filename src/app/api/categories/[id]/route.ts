export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { categoryUpdateSchema } from "@/lib/validation";
import { fail, ok, slugify } from "@/lib/utils";
import { getLocale } from "@/lib/api-helpers";
import { mapCategory } from "@/lib/transformers";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const locale = getLocale(request);
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!category) {
      return fail("Category not found", 404);
    }

    return ok(mapCategory(category, locale));
  } catch (error) {
    console.error("GET /api/categories/[id] failed", error);
    return fail("Failed to fetch category", 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!existing) {
      return fail("Category not found", 404);
    }

    const json = await request.json();
    const parsed = categoryUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;

    if (payload.parentId === existing.id) {
      return fail("Category cannot reference itself as parent", 400);
    }

    if (payload.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: payload.parentId } });
      if (!parent) {
        return fail("Parent category not found", 404);
      }
    }

    const updated = await prisma.category.update({
      where: { id: existing.id },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.nameZh !== undefined ? { nameZh: payload.nameZh || null } : {}),
        ...(payload.slug !== undefined || payload.name !== undefined
          ? { slug: (payload.slug || slugify(payload.name || existing.name)).trim() }
          : {}),
        ...(payload.description !== undefined ? { description: payload.description || null } : {}),
        ...(payload.descriptionZh !== undefined ? { descriptionZh: payload.descriptionZh || null } : {}),
        ...(payload.parentId !== undefined ? { parentId: payload.parentId || null } : {}),
        ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_CATEGORY",
        entity: "Category",
        entityId: existing.id,
      },
    });

    return ok(updated);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return fail("Category slug already exists", 409);
    }
    console.error("PUT /api/categories/[id] failed", error);
    return fail("Failed to update category", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!existing) {
      return fail("Category not found", 404);
    }

    const childrenCount = await prisma.category.count({ where: { parentId: existing.id } });
    if (childrenCount > 0) {
      return fail("Cannot delete category with child categories", 409);
    }

    const productsCount = await prisma.product.count({ where: { categoryId: existing.id } });
    if (productsCount > 0) {
      return fail("Cannot delete category with existing products", 409);
    }

    await prisma.category.delete({ where: { id: existing.id } });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE_CATEGORY",
        entity: "Category",
        entityId: existing.id,
      },
    });

    return ok({ id: existing.id });
  } catch (error) {
    console.error("DELETE /api/categories/[id] failed", error);
    return fail("Failed to delete category", 500);
  }
}


