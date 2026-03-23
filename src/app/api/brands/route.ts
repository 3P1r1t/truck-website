export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { brandCreateSchema } from "@/lib/validation";
import { fail, ok, parsePagination, slugify } from "@/lib/utils";
import { getLocale, boolParam } from "@/lib/api-helpers";
import { mapBrand } from "@/lib/transformers";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const locale = getLocale(request);
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = parsePagination(searchParams);

    const includeInactiveRequested = boolParam(searchParams, "includeInactive", false);
    const admin = includeInactiveRequested ? await requireAdmin(request) : null;
    const includeInactive = includeInactiveRequested && Boolean(admin);

    const where = includeInactive ? {} : { isActive: true };
    const [items, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.brand.count({ where }),
    ]);

    return ok(items.map((item) => mapBrand(item, locale)), {
      pagination: { page, pageSize, total },
    });
  } catch (error) {
    console.error("GET /api/brands failed", error);
    return fail("Failed to fetch brands", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const json = await request.json();
    const parsed = brandCreateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;
    const slug = payload.slug?.trim() || slugify(payload.name);

    const created = await prisma.brand.create({
      data: {
        name: payload.name,
        nameZh: payload.nameZh || null,
        slug,
        description: payload.description || null,
        descriptionZh: payload.descriptionZh || null,
        logoUrl: payload.logoUrl || null,
        isActive: payload.isActive ?? true,
        sortOrder: payload.sortOrder ?? 0,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE_BRAND",
        entity: "Brand",
        entityId: created.id,
        details: { slug: created.slug },
      },
    });

    return ok(created, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return fail("Brand slug already exists", 409);
    }
    console.error("POST /api/brands failed", error);
    return fail("Failed to create brand", 500);
  }
}


