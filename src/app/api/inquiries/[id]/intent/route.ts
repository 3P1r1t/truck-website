export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquiryIntentSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const json = await request.json();
    const parsed = inquiryIntentSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const existing = await prisma.inquiry.findUnique({ where: { id: params.id } });
    if (!existing) {
      return fail("Inquiry not found", 404);
    }

    const updated = await prisma.inquiry.update({
      where: { id: params.id },
      data: {
        intentLevel: parsed.data.intentLevel,
        intentNotes: parsed.data.intentNotes || null,
        intentUpdatedAt: new Date(),
        status: "COMPLETED",
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_INQUIRY_INTENT",
        entity: "Inquiry",
        entityId: params.id,
        details: {
          intentLevel: parsed.data.intentLevel,
        },
      },
    });

    return ok(updated);
  } catch (error) {
    console.error("PATCH /api/inquiries/[id]/intent failed", error);
    return fail("Failed to update inquiry intent", 500);
  }
}


