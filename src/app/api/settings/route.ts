export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/utils";
import { mapSettingRecord } from "@/lib/transformers";

export async function GET(request: NextRequest) {
  try {
    const group = request.nextUrl.searchParams.get("group");

    const items = await prisma.setting.findMany({
      where: group ? { group } : undefined,
      orderBy: [{ group: "asc" }, { key: "asc" }],
      select: {
        key: true,
        value: true,
      },
    });

    return ok(mapSettingRecord(items));
  } catch (error) {
    console.error("GET /api/settings failed", error);
    return fail("Failed to fetch settings", 500);
  }
}


