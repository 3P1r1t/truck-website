export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { categoryCreateSchema } from "@/lib/validation";
import { fail, ok, parsePagination, slugify } from "@/lib/utils";
import { getLocale, boolParam } from "@/lib/api-helpers";
import { mapCategory } from "@/lib/transformers";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const locale = getLocale(request);
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = parsePagination(searchParams);

    const includeInactiveRequested = boolParam(searchParams, "includeInactive", false);
    const includeChildrenRequested = boolParam(searchParams, "includeChildren", true);
    const admin = includeInactiveRequested || includeChildrenRequested ? await requireAdmin(request) : null;

    const includeInactive = includeInactiveRequested && Boolean(admin);
    const includeChildren = includeChildrenRequested || Boolean(admin);

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const parentId = searchParams.get("parentId");
    if (parentId) {
      where.parentId = parentId;
    } else if (!includeChildren) {
      where.parentId = null;
    }

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        skip,
        take: pageSize,
      }),
      prisma.category.count({ where }),
    ]);

    return ok(items.map((item) => mapCategory(item, locale)), {
      pagination: { page, pageSize, total },
    });
  } catch (error) {
    console.error("GET /api/categories failed", error);
    return fail("Failed to fetch categories", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const json = await request.json();
    const parsed = categoryCreateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;
    const slug = payload.slug?.trim() || slugify(payload.name);

    if (payload.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: payload.parentId } });
      if (!parent) {
        return fail("Parent category not found", 404);
      }
    }

    const created = await prisma.category.create({
      data: {
        name: payload.name,
        nameZh: payload.nameZh || null,
        slug,
        description: payload.description || null,
        descriptionZh: payload.descriptionZh || null,
        parentId: payload.parentId || null,
        sortOrder: payload.sortOrder ?? 0,
        isActive: payload.isActive ?? true,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE_CATEGORY",
        entity: "Category",
        entityId: created.id,
        details: { slug: created.slug },
      },
    });

    return ok(created, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return fail("Category slug already exists", 409);
    }
    console.error("POST /api/categories failed", error);
    return fail("Failed to create category", 500);
  }
}


