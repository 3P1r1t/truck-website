export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { settingsUpdateSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const group = request.nextUrl.searchParams.get("group");
    const items = await prisma.setting.findMany({
      where: group ? { group } : undefined,
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    return ok(items);
  } catch (error) {
    console.error("GET /api/admin/settings failed", error);
    return fail("Failed to fetch settings", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const json = await request.json();
    const parsed = settingsUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    await prisma.$transaction(
      parsed.data.items.map((item) =>
        prisma.setting.upsert({
          where: { key: item.key },
          create: {
            key: item.key,
            value: item.value,
            type: item.type || "text",
            group: item.group || null,
            label: item.label || null,
            labelZh: item.labelZh || null,
            description: item.description || null,
          },
          update: {
            value: item.value,
            type: item.type || "text",
            group: item.group || null,
            label: item.label || null,
            labelZh: item.labelZh || null,
            description: item.description || null,
          },
        })
      )
    );

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_SETTINGS",
        entity: "Setting",
        details: { count: parsed.data.items.length },
      },
    });

    const items = await prisma.setting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    return ok(items);
  } catch (error) {
    console.error("PUT /api/admin/settings failed", error);
    return fail("Failed to update settings", 500);
  }
}


