export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";
import { decodeInquiryIntentNotes } from "@/lib/inquiry-source";

const INQUIRY_STATUSES = [
  "PENDING",
  "FOLLOWING",
  "WAITING_REPLY",
  "INTERESTED",
  "CONVERTED",
  "ABANDONED",
] as const;

const INQUIRY_TAGS = ["HIGH", "MEDIUM", "LOW"] as const;

const STATUS_ZH: Record<(typeof INQUIRY_STATUSES)[number], string> = {
  PENDING: "待跟进",
  FOLLOWING: "跟进中",
  WAITING_REPLY: "待回复",
  INTERESTED: "已意向",
  CONVERTED: "已成交",
  ABANDONED: "已战败",
};

const TAG_ZH: Record<(typeof INQUIRY_TAGS)[number], string> = {
  HIGH: "高意向",
  MEDIUM: "中意向",
  LOW: "低意向",
};

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatFollowUpLogs(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    return "";
  }

  const lines = value
    .map((entry) => {
      const item = entry as Record<string, unknown>;
      const at = typeof item.at === "string" ? item.at : "";
      const adminUsername = typeof item.adminUsername === "string" ? item.adminUsername : "";
      const fromStatus = typeof item.fromStatus === "string" ? item.fromStatus : "";
      const toStatus = typeof item.toStatus === "string" ? item.toStatus : "";
      const note = typeof item.note === "string" ? item.note : "";
      const statusPart =
        fromStatus && toStatus ? `${STATUS_ZH[fromStatus as keyof typeof STATUS_ZH] || fromStatus}->${STATUS_ZH[toStatus as keyof typeof STATUS_ZH] || toStatus}` : "";
      return [at, adminUsername, statusPart, note].filter(Boolean).join(" ");
    })
    .filter(Boolean);

  return lines.join(" | ");
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const statuses = (searchParams.get("statuses") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const tag = searchParams.get("tag");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: any = {};

    if (status && INQUIRY_STATUSES.includes(status as (typeof INQUIRY_STATUSES)[number])) {
      where.status = status;
    }
    if (statuses.length > 0) {
      const validStatuses = statuses.filter((item) =>
        INQUIRY_STATUSES.includes(item as (typeof INQUIRY_STATUSES)[number])
      );
      if (validStatuses.length > 0) {
        where.status = { in: validStatuses };
      }
    }
    if (tag && INQUIRY_TAGS.includes(tag as (typeof INQUIRY_TAGS)[number])) {
      where.tag = tag;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
      }
    }

    const rows = await prisma.inquiry.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: 5000,
    });

    const header = [
      "客户姓名",
      "客户邮箱",
      "客户电话",
      "客户国家",
      "客户来源",
      "客户状态",
      "客户标签",
      "下次跟进时间",
      "客户留言",
      "跟进记录",
      "意向备注",
    ];

    const csvRows = rows.map((item) => {
      const decoded = decodeInquiryIntentNotes(item.intentNotes);
      const sourceType = decoded.sourceType || "PRODUCT";
      const sourceLabel = sourceType === "GENERAL" ? "通用线索" : "产品线索";
      const statusLabel = STATUS_ZH[item.status as keyof typeof STATUS_ZH] || item.status;
      const tagLabel = TAG_ZH[item.tag as keyof typeof TAG_ZH] || item.tag;
      const followUpLogs = formatFollowUpLogs(item.followUpLogs);

      return [
        item.fullName,
        item.email,
        item.phone || "",
        item.country || "",
        sourceLabel,
        statusLabel,
        tagLabel,
        item.nextFollowUpAt ? item.nextFollowUpAt.toISOString() : "",
        item.message || "",
        followUpLogs,
        decoded.intentNotes || "",
      ];
    });

    const content = [header, ...csvRows]
      .map((line) => line.map((cell) => csvEscape(cell)).join(","))
      .join("\r\n");

    return new NextResponse(`\uFEFF${content}`, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/inquiries/export failed", error);
    return fail("Failed to export leads", 500);
  }
}
