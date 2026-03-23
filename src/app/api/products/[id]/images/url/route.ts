export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const DETAIL_IMAGE_LIMIT = 10;

const schema = z.object({
  imageUrl: z.string().url(),
  imageType: z.enum(["main", "detail"]).default("detail"),
  altText: z.string().optional().nullable(),
});

async function resolveProductId(identifier: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    select: { id: true },
  });
  return product?.id;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const productId = await resolveProductId(params.id);
    if (!productId) {
      return fail("Product not found", 404);
    }

    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;

    if (payload.imageType === "detail") {
      const count = await prisma.productImage.count({ where: { productId, isPrimary: false } });
      if (count >= DETAIL_IMAGE_LIMIT) {
        return fail(`A product can have at most ${DETAIL_IMAGE_LIMIT} detail images`, 400);
      }
    }

    const image = await prisma.$transaction(async (tx) => {
      if (payload.imageType === "main") {
        await tx.productImage.updateMany({ where: { productId, isPrimary: true }, data: { isPrimary: false } });
      }

      const maxSort = await tx.productImage.aggregate({
        where: { productId },
        _max: { sortOrder: true },
      });

      return tx.productImage.create({
        data: {
          productId,
          imageUrl: payload.imageUrl,
          altText: payload.altText || null,
          isPrimary: payload.imageType === "main",
          sortOrder: (maxSort._max.sortOrder || 0) + 1,
        },
      });
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "ADD_PRODUCT_IMAGE_BY_URL",
        entity: "ProductImage",
        entityId: image.id,
        details: { productId, imageType: payload.imageType },
      },
    });

    return ok(image, { status: 201 });
  } catch (error) {
    console.error("POST /api/products/[id]/images/url failed", error);
    return fail("Failed to add image by URL", 500);
  }
}


