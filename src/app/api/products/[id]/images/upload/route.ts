export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";

const DETAIL_IMAGE_LIMIT = 10;

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

    const payload = (await request.json().catch(() => null)) as
      | {
          imageUrl?: string;
          imageType?: string;
          altText?: string;
        }
      | null;

    const imageUrl = String(payload?.imageUrl || "").trim();
    const imageTypeRaw = String(payload?.imageType || "detail").toLowerCase();
    const imageType = imageTypeRaw === "main" ? "main" : imageTypeRaw === "detail" ? "detail" : null;
    const altText = String(payload?.altText || "").trim() || null;

    if (!imageUrl) {
      return fail("imageUrl is required", 400);
    }
    if (!/^https?:\/\/|^\//.test(imageUrl)) {
      return fail("imageUrl must be an absolute URL or root path", 400);
    }

    if (!imageType) {
      return fail("imageType must be main or detail", 400);
    }

    if (imageType === "detail") {
      const count = await prisma.productImage.count({ where: { productId, isPrimary: false } });
      if (count >= DETAIL_IMAGE_LIMIT) {
        return fail(`A product can have at most ${DETAIL_IMAGE_LIMIT} detail images`, 400);
      }
    }

    const image = await prisma.$transaction(async (tx) => {
      if (imageType === "main") {
        await tx.productImage.updateMany({ where: { productId, isPrimary: true }, data: { isPrimary: false } });
      }

      const maxSort = await tx.productImage.aggregate({
        where: { productId },
        _max: { sortOrder: true },
      });

      return tx.productImage.create({
        data: {
          productId,
          imageUrl,
          altText,
          isPrimary: imageType === "main",
          sortOrder: (maxSort._max.sortOrder || 0) + 1,
        },
      });
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "UPLOAD_PRODUCT_IMAGE",
        entity: "ProductImage",
        entityId: image.id,
        details: { productId, imageType, imageUrl },
      },
    });

    return ok(
      {
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText,
        isPrimary: image.isPrimary,
        sortOrder: image.sortOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products/[id]/images/upload failed", error);
    return fail("Failed to upload image", 500);
  }
}
