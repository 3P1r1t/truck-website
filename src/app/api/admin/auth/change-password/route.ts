export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { adminChangePasswordSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const json = await request.json();
    const parsed = adminChangePasswordSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const existing = await prisma.admin.findUnique({ where: { id: admin.id } });
    if (!existing) {
      return fail("Admin not found", 404);
    }

    const matched = await bcrypt.compare(parsed.data.currentPassword, existing.passwordHash);
    if (!matched) {
      return fail("Current password is incorrect", 401);
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "CHANGE_PASSWORD",
        entity: "Admin",
        entityId: admin.id,
      },
    });

    return ok({ id: admin.id });
  } catch (error) {
    console.error("PATCH /api/admin/auth/change-password failed", error);
    return fail("Failed to change password", 500);
  }
}


