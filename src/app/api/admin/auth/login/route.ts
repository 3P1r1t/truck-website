export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { adminLoginSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/utils";
import { signAdminToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = adminLoginSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const { username, password } = parsed.data;

    const admin = await prisma.admin.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    if (!admin) {
      return fail("Invalid username or password", 401);
    }

    if (!admin.isActive) {
      return fail("Admin account is disabled", 403);
    }

    const passMatched = await bcrypt.compare(password, admin.passwordHash);
    if (!passMatched) {
      return fail("Invalid username or password", 401);
    }

    const token = signAdminToken({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    });

    return ok({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/auth/login failed", error);
    return fail("Failed to login", 500);
  }
}


