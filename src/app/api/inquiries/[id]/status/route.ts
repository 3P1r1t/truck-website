export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquiryStatusSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";

type InquiryStatus = "PENDING" | "FOLLOWING" | "WAITING_REPLY" | "INTERESTED" | "CONVERTED" | "ABANDONED";

const STATUS_TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  PENDING: ["FOLLOWING"],
  FOLLOWING: ["WAITING_REPLY", "INTERESTED", "ABANDONED"],
  WAITING_REPLY: ["FOLLOWING", "INTERESTED", "ABANDONED"],
  INTERESTED: ["CONVERTED", "ABANDONED"],
  CONVERTED: [],
  ABANDONED: [],
};

function canTransition(from: InquiryStatus, to: InquiryStatus) {
  if (from === to) {
    return true;
  }
  return STATUS_TRANSITIONS[from].includes(to);
}

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
    const parsed = inquiryStatusSchema.safeParse(json);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Invalid payload", 400, parsed.error.issues);
    }

    const existing = await prisma.inquiry.findUnique({ where: { id: params.id } });
    if (!existing) {
      return fail("Inquiry not found", 404);
    }

    const fromStatus = existing.status as InquiryStatus;
    const toStatus = parsed.data.status as InquiryStatus;

    if (!canTransition(fromStatus, toStatus)) {
      return fail(`Invalid transition: ${fromStatus} -> ${toStatus}`, 400);
    }

    const nextFollowUpAt =
      parsed.data.nextFollowUpAt !== undefined
        ? parsed.data.nextFollowUpAt
          ? new Date(parsed.data.nextFollowUpAt)
          : null
        : undefined;

    const followUpLogs = getFollowUpLogs(existing.followUpLogs);
    const note = parsed.data.note?.trim() || null;
    if (note || fromStatus !== toStatus || parsed.data.nextFollowUpAt !== undefined) {
      followUpLogs.push({
        at: new Date().toISOString(),
        adminId: admin.id,
        adminUsername: admin.username,
        fromStatus,
        toStatus,
        note,
        nextFollowUpAt: nextFollowUpAt ? nextFollowUpAt.toISOString() : null,
      });
    }

    const updated = await prisma.inquiry.update({
      where: { id: params.id },
      data: {
        status: toStatus,
        ...(parsed.data.tag !== undefined ? { tag: parsed.data.tag } : {}),
        ...(parsed.data.intentNotes !== undefined ? { intentNotes: parsed.data.intentNotes || null } : {}),
        ...(nextFollowUpAt !== undefined ? { nextFollowUpAt } : {}),
        ...(parsed.data.abandonReason !== undefined
          ? { abandonReason: parsed.data.abandonReason || null }
          : toStatus !== "ABANDONED"
            ? { abandonReason: null }
            : {}),
        followUpLogs,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_INQUIRY_STATUS",
        entity: "Inquiry",
        entityId: params.id,
        details: {
          fromStatus,
          toStatus,
          tag: parsed.data.tag,
          nextFollowUpAt: nextFollowUpAt ? nextFollowUpAt.toISOString() : undefined,
        },
      },
    });

    return ok({
      ...updated,
      followUpLogs: getFollowUpLogs(updated.followUpLogs),
    });
  } catch (error) {
    console.error("PATCH /api/inquiries/[id]/status failed", error);
    return fail("Failed to update inquiry status", 500);
  }
}
