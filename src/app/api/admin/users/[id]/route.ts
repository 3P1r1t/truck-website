export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/utils";
import { requireSuperAdmin } from "@/lib/admin-auth";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const actor = await requireSuperAdmin(request);
    if (!actor) {
      return fail("Forbidden", 403);
    }

    if (actor.id === params.id) {
      return fail("You cannot delete yourself", 400);
    }

    const existing = await prisma.admin.findUnique({ where: { id: params.id } });
    if (!existing) {
      return fail("Admin user not found", 404);
    }

    await prisma.admin.delete({ where: { id: params.id } });

    await prisma.adminLog.create({
      data: {
        adminId: actor.id,
        action: "DELETE_ADMIN_USER",
        entity: "Admin",
        entityId: params.id,
      },
    });

    return ok({ id: params.id });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] failed", error);
    return fail("Failed to delete admin user", 500);
  }
}


