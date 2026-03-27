export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";
import { removeUploadedFile } from "@/lib/upload";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      select: { id: true },
    });

    if (!product) {
      return fail("Product not found", 404);
    }

    const image = await prisma.productImage.findFirst({
      where: {
        id: params.imageId,
        productId: product.id,
      },
    });

    if (!image) {
      return fail("Image not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.productImage.delete({ where: { id: image.id } });

      if (image.isPrimary) {
        const nextImage = await tx.productImage.findFirst({
          where: { productId: product.id },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        });

        if (nextImage) {
          await tx.productImage.update({
            where: { id: nextImage.id },
            data: { isPrimary: true },
          });
        }
      }
    });

    await removeUploadedFile(image.imageUrl);

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE_PRODUCT_IMAGE",
        entity: "ProductImage",
        entityId: image.id,
        details: { productId: product.id },
      },
    });

    return ok({ id: image.id });
  } catch (error) {
    console.error("DELETE /api/products/[id]/images/[imageId] failed", error);
    return fail("Failed to delete image", 500);
  }
}


