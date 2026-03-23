import { AdminRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBearerToken, verifyAdminToken, JwtAdminPayload } from "@/lib/jwt";

export async function requireAdmin(request: NextRequest): Promise<JwtAdminPayload | null> {
  const token = parseBearerToken(request.headers.get("authorization"));
  if (!token) {
    return null;
  }

  try {
    const payload = verifyAdminToken(token);
    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: { id: true, username: true, email: true, role: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      return null;
    }

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    };
  } catch {
    return null;
  }
}

export async function requireSuperAdmin(request: NextRequest): Promise<JwtAdminPayload | null> {
  const payload = await requireAdmin(request);
  if (!payload) {
    return null;
  }
  return payload.role === AdminRole.SUPER_ADMIN ? payload : null;
}

export function isAdminRole(role: string | undefined | null) {
  return role === AdminRole.ADMIN || role === AdminRole.SUPER_ADMIN;
}
