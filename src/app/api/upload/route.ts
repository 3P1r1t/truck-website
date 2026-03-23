export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";
import { isAllowedImageType, saveUploadedFile } from "@/lib/upload";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = String(formData.get("folder") || "general").trim() || "general";

    if (!file) {
      return fail("File is required", 400);
    }

    if (!isAllowedImageType(file.type)) {
      return fail("Unsupported file type", 400);
    }

    const uploaded = await saveUploadedFile(file, folder);
    return ok(uploaded, { status: 201 });
  } catch (error) {
    console.error("POST /api/upload failed", error);
    return fail("Failed to upload file", 500);
  }
}


