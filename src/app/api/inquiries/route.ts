export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquiryCreateSchema } from "@/lib/validation";
import { fail, ok, parsePagination } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";
import { getLocale } from "@/lib/api-helpers";
import { pickLocalized } from "@/lib/i18n";
import {
  decodeInquiryIntentNotes,
  encodeInquiryIntentNotes,
  normalizeInquirySourceType,
  type InquirySourceType,
} from "@/lib/inquiry-source";

const INQUIRY_STATUSES = [
  "PENDING",
  "FOLLOWING",
  "WAITING_REPLY",
  "INTERESTED",
  "CONVERTED",
  "ABANDONED",
] as const;
const INQUIRY_TAGS = ["HIGH", "MEDIUM", "LOW"] as const;

const DEFAULT_GENERAL_NAME = "General Inquiry Lead";
const DEFAULT_PRODUCT_NAME = "Website Visitor";

async function resolveInquiryProduct(productId?: string | null) {
  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product || !product.isActive) {
      return null;
    }

    return product;
  }

  return prisma.product.findFirst({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, isActive: true },
  });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = inquiryCreateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;

    const inferredSourceType: InquirySourceType = payload.productId
      ? normalizeInquirySourceType(payload.sourceType || "PRODUCT")
      : "GENERAL";

    const product = await resolveInquiryProduct(payload.productId);
    if (!product) {
      return fail("Product not found", 404);
    }

    const created = await prisma.inquiry.create({
      data: {
        productId: product.id,
        fullName:
          payload.fullName?.trim() ||
          (inferredSourceType === "GENERAL" ? DEFAULT_GENERAL_NAME : DEFAULT_PRODUCT_NAME),
        email: payload.email,
        phone: payload.phone || null,
        country: payload.country || null,
        message: payload.message || null,
        intentNotes: encodeInquiryIntentNotes(null, inferredSourceType),
        followUpLogs: [],
      },
    });

    return ok(
      {
        ...created,
        sourceType: inferredSourceType,
        intentNotes: "",
      },
      { status: 201 }
    );
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
    const statuses = (searchParams.get("statuses") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const tag = searchParams.get("tag");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const productId = searchParams.get("productId");

    const where: any = {};
    if (status && INQUIRY_STATUSES.includes(status as (typeof INQUIRY_STATUSES)[number])) {
      where.status = status;
    }
    if (statuses.length > 0) {
      const validStatuses = statuses.filter((item) =>
        INQUIRY_STATUSES.includes(item as (typeof INQUIRY_STATUSES)[number])
      );
      if (validStatuses.length > 0) {
        where.status = { in: validStatuses };
      }
    }
    if (tag && INQUIRY_TAGS.includes(tag as (typeof INQUIRY_TAGS)[number])) {
      where.tag = tag;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
      }
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
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.inquiry.count({ where }),
    ]);

    const mapped = items.map((item) => {
      const decoded = decodeInquiryIntentNotes(item.intentNotes);
      return {
        ...item,
        sourceType: decoded.sourceType || "PRODUCT",
        intentNotes: decoded.intentNotes || null,
        followUpLogs: Array.isArray(item.followUpLogs) ? item.followUpLogs : [],
        product: item.product
          ? {
              id: item.product.id,
              slug: item.product.slug,
              name: pickLocalized(item.product.name, item.product.nameZh, locale),
            }
          : null,
      };
    });

    return ok(mapped, { pagination: { page, pageSize, total } });
  } catch (error) {
    console.error("GET /api/inquiries failed", error);
    return fail("Failed to fetch inquiries", 500);
  }
}
