export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { adminUserPasswordSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/utils";
import { requireSuperAdmin } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const actor = await requireSuperAdmin(request);
    if (!actor) {
      return fail("Forbidden", 403);
    }

    const json = await request.json();
    const parsed = adminUserPasswordSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const existing = await prisma.admin.findUnique({ where: { id: params.id } });
    if (!existing) {
      return fail("Admin user not found", 404);
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
    const updated = await prisma.admin.update({
      where: { id: params.id },
      data: { passwordHash },
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
        action: "RESET_ADMIN_PASSWORD",
        entity: "Admin",
        entityId: params.id,
      },
    });

    return ok(updated);
  } catch (error) {
    console.error("PATCH /api/admin/users/[id]/password failed", error);
    return fail("Failed to reset admin user password", 500);
  }
}


