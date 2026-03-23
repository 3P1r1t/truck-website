export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { articleUpdateSchema } from "@/lib/validation";
import { fail, ok, slugify } from "@/lib/utils";
import { getLocale } from "@/lib/api-helpers";
import { mapArticle } from "@/lib/transformers";
import { requireAdmin } from "@/lib/admin-auth";

async function findArticle(identifier: string) {
  return prisma.article.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
  });
}

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const locale = getLocale(request);
    const admin = await requireAdmin(request);
    const article = await findArticle(params.slug);
    if (!article) {
      return fail("Article not found", 404);
    }

    if (!article.isActive && !admin) {
      return fail("Article not found", 404);
    }

    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return ok(mapArticle(article, locale));
  } catch (error) {
    console.error("GET /api/articles/[slug] failed", error);
    return fail("Failed to fetch article", 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const existing = await findArticle(params.slug);
    if (!existing) {
      return fail("Article not found", 404);
    }

    const json = await request.json();
    const parsed = articleUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;
    const updated = await prisma.article.update({
      where: { id: existing.id },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.titleZh !== undefined ? { titleZh: payload.titleZh || null } : {}),
        ...(payload.slug !== undefined || payload.title !== undefined
          ? { slug: (payload.slug || slugify(payload.title || existing.title)).trim() }
          : {}),
        ...(payload.excerpt !== undefined ? { excerpt: payload.excerpt || null } : {}),
        ...(payload.excerptZh !== undefined ? { excerptZh: payload.excerptZh || null } : {}),
        ...(payload.content !== undefined ? { content: payload.content } : {}),
        ...(payload.contentZh !== undefined ? { contentZh: payload.contentZh || null } : {}),
        ...(payload.coverImage !== undefined ? { coverImage: payload.coverImage || null } : {}),
        ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId || null } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        ...(payload.publishedAt !== undefined
          ? { publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null }
          : {}),
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_ARTICLE",
        entity: "Article",
        entityId: existing.id,
      },
    });

    return ok(mapArticle(updated, getLocale(request)));
  } catch (error: any) {
    if (error?.code === "P2002") {
      return fail("Article slug already exists", 409);
    }
    console.error("PUT /api/articles/[slug] failed", error);
    return fail("Failed to update article", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const existing = await findArticle(params.slug);
    if (!existing) {
      return fail("Article not found", 404);
    }

    await prisma.article.delete({ where: { id: existing.id } });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE_ARTICLE",
        entity: "Article",
        entityId: existing.id,
      },
    });

    return ok({ id: existing.id });
  } catch (error) {
    console.error("DELETE /api/articles/[slug] failed", error);
    return fail("Failed to delete article", 500);
  }
}


