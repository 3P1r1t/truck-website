export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { articleCreateSchema } from "@/lib/validation";
import { fail, ok, parsePagination } from "@/lib/utils";
import { getLocale, boolParam } from "@/lib/api-helpers";
import { mapArticle } from "@/lib/transformers";
import { requireAdmin } from "@/lib/admin-auth";

async function generateNextArticleSlug() {
  let counter = (await prisma.article.count()) + 1;
  while (true) {
    const candidate = `article-${counter}`;
    const exists = await prisma.article.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) {
      return candidate;
    }
    counter += 1;
  }
}

export async function GET(request: NextRequest) {
  try {
    const locale = getLocale(request);
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = parsePagination(searchParams);

    const includeInactiveRequested = boolParam(searchParams, "includeInactive", false);
    const admin = includeInactiveRequested ? await requireAdmin(request) : null;
    const includeInactive = includeInactiveRequested && Boolean(admin);

    const search = searchParams.get("search");

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { titleZh: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { excerptZh: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { contentZh: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    return ok(items.map((item) => mapArticle(item, locale)), {
      pagination: { page, pageSize, total },
    });
  } catch (error) {
    console.error("GET /api/articles failed", error);
    return fail("Failed to fetch articles", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const locale = getLocale(request);
    const json = await request.json();
    const parsed = articleCreateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;
    const slug = await generateNextArticleSlug();

    const created = await prisma.article.create({
      data: {
        title: payload.title,
        titleZh: payload.titleZh || null,
        slug,
        excerpt: payload.excerpt || null,
        excerptZh: payload.excerptZh || null,
        content: payload.content,
        contentZh: payload.contentZh || null,
        coverImage: payload.coverImage || null,
        categoryId: payload.categoryId || null,
        isActive: payload.isActive ?? true,
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : new Date(),
        authorId: admin.id,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE_ARTICLE",
        entity: "Article",
        entityId: created.id,
      },
    });

    return ok(mapArticle(created, locale), { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return fail("Article slug already exists", 409);
    }
    console.error("POST /api/articles failed", error);
    return fail("Failed to create article", 500);
  }
}


