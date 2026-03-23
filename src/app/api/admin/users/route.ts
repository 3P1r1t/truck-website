export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { adminCreateUserSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/utils";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const users = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
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

    return ok(users);
  } catch (error) {
    console.error("GET /api/admin/users failed", error);
    return fail("Failed to fetch admin users", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireSuperAdmin(request);
    if (!actor) {
      return fail("Forbidden", 403);
    }

    const json = await request.json();
    const parsed = adminCreateUserSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const payload = parsed.data;
    const passwordHash = await bcrypt.hash(payload.password, 10);

    const created = await prisma.admin.create({
      data: {
        username: payload.username,
        email: payload.email,
        passwordHash,
        role: payload.role || "ADMIN",
        isActive: true,
      },
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
        action: "CREATE_ADMIN_USER",
        entity: "Admin",
        entityId: created.id,
      },
    });

    return ok(created, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return fail("Username or email already exists", 409);
    }
    console.error("POST /api/admin/users failed", error);
    return fail("Failed to create admin user", 500);
  }
}


