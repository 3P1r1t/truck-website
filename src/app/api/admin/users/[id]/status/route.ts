export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminUserStatusSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/utils";
import { requireSuperAdmin } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const actor = await requireSuperAdmin(request);
    if (!actor) {
      return fail("Forbidden", 403);
    }

    const json = await request.json();
    const parsed = adminUserStatusSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const existing = await prisma.admin.findUnique({ where: { id: params.id } });
    if (!existing) {
      return fail("Admin user not found", 404);
    }

    if (existing.id === actor.id && !parsed.data.isActive) {
      return fail("You cannot disable yourself", 400);
    }

    const updated = await prisma.admin.update({
      where: { id: params.id },
      data: { isActive: parsed.data.isActive },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: actor.id,
        action: "UPDATE_ADMIN_STATUS",
        entity: "Admin",
        entityId: params.id,
        details: { isActive: parsed.data.isActive },
      },
    });

    return ok(updated);
  } catch (error) {
    console.error("PATCH /api/admin/users/[id]/status failed", error);
    return fail("Failed to update admin user status", 500);
  }
}


