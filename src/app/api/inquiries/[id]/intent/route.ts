export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquiryIntentSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";
import { decodeInquiryIntentNotes, encodeInquiryIntentNotes } from "@/lib/inquiry-source";

function getFollowUpLogs(value: unknown) {
  return Array.isArray(value) ? [...value] : [];
}

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

    const nextFollowUpAt =
      parsed.data.nextFollowUpAt !== undefined
        ? parsed.data.nextFollowUpAt
          ? new Date(parsed.data.nextFollowUpAt)
          : null
        : undefined;

    const followUpLogs = getFollowUpLogs(existing.followUpLogs);
    const followUpNote = parsed.data.followUpNote?.trim() || null;
    if (followUpNote || parsed.data.nextFollowUpAt !== undefined) {
      followUpLogs.push({
        at: new Date().toISOString(),
        adminId: admin.id,
        adminUsername: admin.username,
        fromStatus: existing.status,
        toStatus: existing.status,
        note: followUpNote,
        nextFollowUpAt: nextFollowUpAt ? nextFollowUpAt.toISOString() : null,
      });
    }

    const sourceType = decodeInquiryIntentNotes(existing.intentNotes).sourceType || "PRODUCT";

    const updated = await prisma.inquiry.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.tag !== undefined ? { tag: parsed.data.tag } : {}),
        ...(parsed.data.intentNotes !== undefined
          ? { intentNotes: encodeInquiryIntentNotes(parsed.data.intentNotes || null, sourceType) }
          : {}),
        ...(nextFollowUpAt !== undefined ? { nextFollowUpAt } : {}),
        ...(parsed.data.abandonReason !== undefined ? { abandonReason: parsed.data.abandonReason || null } : {}),
        ...(followUpNote || parsed.data.nextFollowUpAt !== undefined ? { followUpLogs } : {}),
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_INQUIRY_INTENT",
        entity: "Inquiry",
        entityId: params.id,
        details: {
          tag: parsed.data.tag,
          hasFollowUpNote: Boolean(followUpNote),
          nextFollowUpAt: nextFollowUpAt ? nextFollowUpAt.toISOString() : undefined,
        },
      },
    });

    const decoded = decodeInquiryIntentNotes(updated.intentNotes);

    return ok({
      ...updated,
      sourceType: decoded.sourceType || sourceType,
      intentNotes: decoded.intentNotes || null,
      followUpLogs: getFollowUpLogs(updated.followUpLogs),
    });
  } catch (error) {
    console.error("PATCH /api/inquiries/[id]/intent failed", error);
    return fail("Failed to update inquiry", 500);
  }
}
