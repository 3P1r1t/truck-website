export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getLocale } from "@/lib/api-helpers";
import { fail, ok, slugify } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1),
  nameZh: z.string().optional().nullable(),
  slug: z.string().optional(),
});

function mapDriveType(item: { id: string; key: string; value: string; labelZh: string | null }, locale: "en" | "zh") {
  const nameEn = item.value;
  const nameZh = item.labelZh;
  return {
    id: item.id,
    key: item.key,
    nameEn,
    nameZh,
    name: locale === "zh" ? nameZh || nameEn : nameEn,
  };
}

export async function GET(request: NextRequest) {
  try {
    const locale = getLocale(request);
    const items = await prisma.setting.findMany({
      where: { group: "drive_types" },
      orderBy: [{ key: "asc" }],
      select: {
        id: true,
        key: true,
        value: true,
        labelZh: true,
      },
    });

    return ok(items.map((item) => mapDriveType(item, locale)));
  } catch (error) {
    console.error("GET /api/drive-types failed", error);
    return fail("Failed to fetch drive types", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const json = await request.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;
    const driveSlug = payload.slug?.trim() || slugify(payload.name);
    const key = `drive_type_${driveSlug}`;

    const created = await prisma.setting.create({
      data: {
        key,
        value: payload.name.trim(),
        label: payload.name.trim(),
        labelZh: payload.nameZh?.trim() || null,
        group: "drive_types",
        type: "drive_type",
      },
      select: {
        id: true,
        key: true,
        value: true,
        labelZh: true,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE_DRIVE_TYPE",
        entity: "Setting",
        entityId: created.id,
        details: { key: created.key },
      },
    });

    return ok(mapDriveType(created, getLocale(request)), { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return fail("Drive type key already exists", 409);
    }
    console.error("POST /api/drive-types failed", error);
    return fail("Failed to create drive type", 500);
  }
}
