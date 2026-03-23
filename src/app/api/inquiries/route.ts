export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquiryCreateSchema } from "@/lib/validation";
import { fail, ok, parsePagination } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";
import { getLocale } from "@/lib/api-helpers";
import { pickLocalized } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = inquiryCreateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: payload.productId },
      select: { id: true, isActive: true },
    });

    if (!product || !product.isActive) {
      return fail("Product not found", 404);
    }

    const created = await prisma.inquiry.create({
      data: {
        productId: payload.productId,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone || null,
        country: payload.country || null,
        message: payload.message || null,
      },
    });

    return ok(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/inquiries failed", error);
    return fail("Failed to submit inquiry", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const locale = getLocale(request);
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = parsePagination(searchParams);

    const status = searchParams.get("status");
    const productId = searchParams.get("productId");

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (productId) {
      where.productId = productId;
    }

    const [items, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              nameZh: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.inquiry.count({ where }),
    ]);

    const mapped = items.map((item) => ({
      ...item,
      product: item.product
        ? {
            id: item.product.id,
            slug: item.product.slug,
            name: pickLocalized(item.product.name, item.product.nameZh, locale),
          }
        : null,
    }));

    return ok(mapped, { pagination: { page, pageSize, total } });
  } catch (error) {
    console.error("GET /api/inquiries failed", error);
    return fail("Failed to fetch inquiries", 500);
  }
}


