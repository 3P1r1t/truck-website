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

type ExportLang = "zh" | "en";
type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
type InquiryTag = (typeof INQUIRY_TAGS)[number];

const STATUS_LABELS: Record<ExportLang, Record<InquiryStatus, string>> = {
  zh: {
    PENDING: "\u5f85\u8ddf\u8fdb",
    FOLLOWING: "\u8ddf\u8fdb\u4e2d",
    WAITING_REPLY: "\u5f85\u56de\u590d",
    INTERESTED: "\u5df2\u610f\u5411",
    CONVERTED: "\u5df2\u6210\u4ea4",
    ABANDONED: "\u5df2\u6218\u8d25",
  },
  en: {
    PENDING: "Pending",
    FOLLOWING: "Following",
    WAITING_REPLY: "Waiting Reply",
    INTERESTED: "Interested",
    CONVERTED: "Converted",
    ABANDONED: "Abandoned",
  },
};

const TAG_LABELS: Record<ExportLang, Record<InquiryTag, string>> = {
  zh: {
    HIGH: "\u9ad8\u610f\u5411",
    MEDIUM: "\u4e2d\u610f\u5411",
    LOW: "\u4f4e\u610f\u5411",
  },
  en: {
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
  },
};

const HEADER_LABELS: Record<ExportLang, string[]> = {
  zh: [
    "\u5ba2\u6237\u59d3\u540d",
    "\u5ba2\u6237\u90ae\u7bb1",
    "\u5ba2\u6237\u7535\u8bdd",
    "\u5ba2\u6237\u56fd\u5bb6",
    "\u5ba2\u6237\u6765\u6e90",
    "\u5ba2\u6237\u72b6\u6001",
    "\u5ba2\u6237\u6807\u7b7e",
    "\u4e0b\u6b21\u8ddf\u8fdb\u65f6\u95f4",
    "\u5ba2\u6237\u7559\u8a00",
    "\u8ddf\u8fdb\u8bb0\u5f55",
    "\u610f\u5411\u5907\u6ce8",
  ],
  en: [
    "Full Name",
    "Email",
    "Phone",
    "Country",
    "Source",
    "Status",
    "Tag",
    "Next Follow-up Time",
    "Message",
    "Follow-up Logs",
    "Intent Notes",
  ],
};

const SOURCE_LABELS: Record<ExportLang, Record<"GENERAL" | "PRODUCT", string>> = {
  zh: {
    GENERAL: "\u901a\u7528\u7ebf\u7d22",
    PRODUCT: "\u4ea7\u54c1\u7ebf\u7d22",
  },
  en: {
    GENERAL: "General Lead",
    PRODUCT: "Product Lead",
  },
};

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatFollowUpLogs(value: unknown, lang: ExportLang) {
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
      const fromLabel = STATUS_LABELS[lang][fromStatus as InquiryStatus] || fromStatus;
      const toLabel = STATUS_LABELS[lang][toStatus as InquiryStatus] || toStatus;
      const statusPart = fromStatus && toStatus ? `${fromLabel}->${toLabel}` : "";
      return [at, adminUsername, statusPart, note].filter(Boolean).join(" ");
    })
    .filter(Boolean);

  return lines.join(" | ");
}

function resolveExportLang(request: NextRequest): ExportLang {
  const lang = (request.nextUrl.searchParams.get("lang") || "").toLowerCase();
  return lang.startsWith("en") ? "en" : "zh";
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const lang = resolveExportLang(request);
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

    if (status && INQUIRY_STATUSES.includes(status as InquiryStatus)) {
      where.status = status;
    }
    if (statuses.length > 0) {
      const validStatuses = statuses.filter((item) => INQUIRY_STATUSES.includes(item as InquiryStatus));
      if (validStatuses.length > 0) {
        where.status = { in: validStatuses };
      }
    }
    if (tag && INQUIRY_TAGS.includes(tag as InquiryTag)) {
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

    const header = HEADER_LABELS[lang];
    const csvRows = rows.map((item) => {
      const decoded = decodeInquiryIntentNotes(item.intentNotes);
      const sourceType = decoded.sourceType === "GENERAL" ? "GENERAL" : "PRODUCT";
      const sourceLabel = SOURCE_LABELS[lang][sourceType];
      const statusLabel = STATUS_LABELS[lang][item.status as InquiryStatus] || item.status;
      const tagLabel = TAG_LABELS[lang][item.tag as InquiryTag] || item.tag;
      const followUpLogs = formatFollowUpLogs(item.followUpLogs, lang);

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
