export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getLocale } from "@/lib/api-helpers";
import { fail, ok, slugify } from "@/lib/utils";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  nameZh: z.string().optional().nullable(),
  slug: z.string().optional(),
});

function mapFuelType(item: { id: string; key: string; value: string; labelZh: string | null }, locale: "en" | "zh") {
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

async function findFuelType(id: string) {
  return prisma.setting.findFirst({
    where: {
      id,
      group: "fuel_types",
    },
    select: {
      id: true,
      key: true,
      value: true,
      labelZh: true,
    },
  });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const existing = await findFuelType(params.id);
    if (!existing) {
      return fail("Fuel type not found", 404);
    }

    const json = await request.json();
    const parsed = updateSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;
    const nextName = payload.name?.trim() || existing.value;
    const nextSlug = payload.slug?.trim() || slugify(nextName);
    const nextKey = `fuel_type_${nextSlug}`;

    const updated = await prisma.setting.update({
      where: { id: existing.id },
      data: {
        key: nextKey,
        value: nextName,
        label: nextName,
        labelZh: payload.nameZh !== undefined ? payload.nameZh?.trim() || null : existing.labelZh,
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
        action: "UPDATE_FUEL_TYPE",
        entity: "Setting",
        entityId: updated.id,
        details: { key: updated.key },
      },
    });

    return ok(mapFuelType(updated, getLocale(request)));
  } catch (error: any) {
    if (error?.code === "P2002") {
      return fail("Fuel type key already exists", 409);
    }
    console.error("PUT /api/fuel-types/[id] failed", error);
    return fail("Failed to update fuel type", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const existing = await findFuelType(params.id);
    if (!existing) {
      return fail("Fuel type not found", 404);
    }

    await prisma.setting.delete({ where: { id: existing.id } });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE_FUEL_TYPE",
        entity: "Setting",
        entityId: existing.id,
        details: { key: existing.key },
      },
    });

    return ok({ id: existing.id });
  } catch (error) {
    console.error("DELETE /api/fuel-types/[id] failed", error);
    return fail("Failed to delete fuel type", 500);
  }
}
