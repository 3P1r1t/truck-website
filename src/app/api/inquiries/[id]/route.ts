export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";
import { getLocale } from "@/lib/api-helpers";
import { pickLocalized } from "@/lib/i18n";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const locale = getLocale(request);
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
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
    });

    if (!inquiry) {
      return fail("Inquiry not found", 404);
    }

    return ok({
      ...inquiry,
      product: inquiry.product
        ? {
            id: inquiry.product.id,
            slug: inquiry.product.slug,
            name: pickLocalized(inquiry.product.name, inquiry.product.nameZh, locale),
          }
        : null,
    });
  } catch (error) {
    console.error("GET /api/inquiries/[id] failed", error);
    return fail("Failed to fetch inquiry", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const existing = await prisma.inquiry.findUnique({ where: { id: params.id } });
    if (!existing) {
      return fail("Inquiry not found", 404);
    }

    await prisma.inquiry.delete({ where: { id: params.id } });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE_INQUIRY",
        entity: "Inquiry",
        entityId: params.id,
      },
    });

    return ok({ id: params.id });
  } catch (error) {
    console.error("DELETE /api/inquiries/[id] failed", error);
    return fail("Failed to delete inquiry", 500);
  }
}


