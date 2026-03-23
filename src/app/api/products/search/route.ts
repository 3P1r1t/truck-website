export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok, parsePagination } from "@/lib/utils";
import { getLocale } from "@/lib/api-helpers";
import { mapProduct } from "@/lib/transformers";

export async function GET(request: NextRequest) {
  try {
    const locale = getLocale(request);
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = parsePagination(searchParams);
    const q = (searchParams.get("q") || "").trim();

    if (q.length < 2) {
      return fail("Search query must be at least 2 characters", 400);
    }

    const where = {
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { nameZh: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { descriptionZh: { contains: q, mode: "insensitive" as const } },
        { shortDescription: { contains: q, mode: "insensitive" as const } },
        { shortDescriptionZh: { contains: q, mode: "insensitive" as const } },
      ],
    };

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
    console.error("GET /api/products/search failed", error);
    return fail("Failed to search products", 500);
  }
}


