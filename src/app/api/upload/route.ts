export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";
import {
  createPresignedUpload,
  isAllowedImageType,
  isAllowedMediaType,
  UploadConfigError,
  UploadValidationError,
} from "@/lib/upload";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return fail("Unauthorized", 401);
    }

    const payload = (await request.json().catch(() => null)) as
      | {
          fileName?: string;
          fileType?: string;
          fileSize?: number;
          folder?: string;
          settingKey?: string;
        }
      | null;

    const fileName = String(payload?.fileName || "").trim();
    const fileType = String(payload?.fileType || "").trim();
    const fileSize = Number(payload?.fileSize || 0);
    const folder = String(payload?.folder || "general").trim() || "general";
    const settingKey = String(payload?.settingKey || "").trim();

    if (!fileName || !fileType || !Number.isFinite(fileSize) || fileSize <= 0) {
      return fail("fileName, fileType and fileSize are required", 400);
    }

    const noSizeLimit = settingKey === "home_hero_image_url";
    const imageOnlyUpload = folder === "products" || (folder === "settings" && settingKey !== "home_hero_image_url");

    if (imageOnlyUpload && !isAllowedImageType(fileType)) {
      return fail("Unsupported image type", 400);
    }

    if (!imageOnlyUpload && !isAllowedMediaType(fileType)) {
      return fail("Unsupported file type", 400);
    }

    const uploaded = await createPresignedUpload(fileName, fileType, {
      folder,
      settingKey,
      fileSize,
      maxUploadSize: noSizeLimit ? null : undefined,
    });

    return ok(uploaded, { status: 201 });
  } catch (error) {
    if (error instanceof UploadConfigError) {
      return fail(error.message, 500);
    }
    if (error instanceof UploadValidationError) {
      return fail(error.message, 400);
    }
    console.error("POST /api/upload failed", error);
    return fail("Failed to upload file", 500);
  }
}
