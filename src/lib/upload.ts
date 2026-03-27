import { unlink } from "fs/promises";
import { randomUUID } from "crypto";
import { extname, join } from "path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { EnvValidationError, getRequiredEnvMap } from "@/lib/env";

const DEFAULT_MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const PRESIGNED_URL_EXPIRES_IN_SECONDS = 300;

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
};

type CreatePresignedUploadOptions = {
  folder?: string;
  settingKey?: string;
  maxUploadSize?: number | null;
  fileSize?: number;
};

export type PresignedUpload = {
  filename: string;
  key: string;
  path: string;
  size: number;
  mimeType: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
};

export class UploadValidationError extends Error {
  statusCode = 400;
}

export class UploadConfigError extends Error {
  statusCode = 500;
}

let r2ConfigCache: R2Config | null = null;
let r2ClientCache: S3Client | null = null;

function getMaxUploadSize() {
  const parsed = Number(process.env.MAX_UPLOAD_SIZE);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return DEFAULT_MAX_UPLOAD_SIZE;
}

function normalizeSubDirectory(subDirectory: string) {
  return subDirectory
    .split(/[\\/]+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .filter((segment) => /^[a-zA-Z0-9_-]+$/.test(segment))
    .join("/");
}

function normalizeToken(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
}

function sanitizeExtension(filename: string, mimeType: string) {
  const ext = extname(filename || "").toLowerCase();
  if (/^\.[a-z0-9]{1,10}$/.test(ext)) {
    return ext;
  }

  const mimeFallback: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/ogg": ".ogg",
    "video/quicktime": ".mov",
    "video/x-msvideo": ".avi",
  };

  return mimeFallback[mimeType] || ".bin";
}

function getR2Config(): R2Config {
  if (r2ConfigCache) {
    return r2ConfigCache;
  }

  try {
    const env = getRequiredEnvMap(
      ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_BASE_URL"],
      "R2 uploads"
    );

    r2ConfigCache = {
      accountId: env.R2_ACCOUNT_ID,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      bucket: env.R2_BUCKET,
      publicBaseUrl: env.R2_PUBLIC_BASE_URL.replace(/\/+$/, ""),
    };

    return r2ConfigCache;
  } catch (error) {
    if (error instanceof EnvValidationError) {
      throw new UploadConfigError(error.message);
    }
    throw error;
  }
}

function getOptionalR2Config() {
  try {
    return getR2Config();
  } catch {
    return null;
  }
}

function getR2Client() {
  if (r2ClientCache) {
    return r2ClientCache;
  }

  const config = getR2Config();
  r2ClientCache = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return r2ClientCache;
}

function buildObjectKey(fileName: string, fileType: string, folder?: string, settingKey?: string) {
  const cleanFolder = normalizeSubDirectory(folder || "general") || "general";
  const cleanSettingKey = normalizeToken(settingKey || "");
  const ext = sanitizeExtension(fileName, fileType);

  const segments = [cleanFolder];
  if (cleanSettingKey) {
    segments.push(cleanSettingKey);
  }
  segments.push(`${Date.now()}-${randomUUID()}${ext}`);

  return segments.join("/");
}

export function buildPublicFileUrl(key: string) {
  const config = getR2Config();
  return `${config.publicBaseUrl}/${key.replace(/^\/+/, "")}`;
}

export function isAllowedImageType(mimeType: string) {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType);
}

export function isAllowedMediaType(mimeType: string) {
  return [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
  ].includes(mimeType);
}

export async function createPresignedUpload(
  fileName: string,
  fileType: string,
  options: CreatePresignedUploadOptions = {}
): Promise<PresignedUpload> {
  const maxUploadSize = options.maxUploadSize === undefined ? getMaxUploadSize() : options.maxUploadSize;
  const fileSize = Number(options.fileSize || 0);

  if (!fileType) {
    throw new UploadValidationError("File type is required");
  }

  if (typeof maxUploadSize === "number" && maxUploadSize > 0 && fileSize > maxUploadSize) {
    throw new UploadValidationError(`File exceeds max upload size (${maxUploadSize} bytes)`);
  }

  const config = getR2Config();
  const key = buildObjectKey(fileName, fileType, options.folder, options.settingKey);
  const filename = key.split("/").pop() || key;
  const uploadUrl = await getSignedUrl(
    getR2Client(),
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: fileType,
    }),
    { expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS }
  );

  return {
    filename,
    key,
    path: buildPublicFileUrl(key),
    size: fileSize,
    mimeType: fileType,
    uploadUrl,
    method: "PUT",
    headers: {
      "Content-Type": fileType,
    },
  };
}

function resolveR2KeyFromPublicPath(publicPath: string) {
  const input = (publicPath || "").trim();
  if (!input) {
    return null;
  }

  const config = getOptionalR2Config();
  if (!config) {
    return null;
  }

  const normalizedBase = config.publicBaseUrl.replace(/\/+$/, "");
  if (input.startsWith(`${normalizedBase}/`)) {
    return decodeURIComponent(input.slice(normalizedBase.length + 1));
  }

  try {
    const baseUrl = new URL(normalizedBase);
    const fileUrl = new URL(input);
    if (baseUrl.origin !== fileUrl.origin) {
      return null;
    }

    const basePath = baseUrl.pathname.replace(/\/+$/, "");
    if (!fileUrl.pathname.startsWith(`${basePath}/`)) {
      return null;
    }

    return decodeURIComponent(fileUrl.pathname.slice(basePath.length + 1));
  } catch {
    return null;
  }
}

export async function removeUploadedFile(publicPath: string) {
  const key = resolveR2KeyFromPublicPath(publicPath);

  if (key) {
    try {
      const config = getR2Config();
      await getR2Client().send(
        new DeleteObjectCommand({
          Bucket: config.bucket,
          Key: key,
        })
      );
    } catch (error) {
      console.error("Failed to delete file from R2", { publicPath, error });
    }
    return;
  }

  if (!publicPath.startsWith("/uploads/")) {
    return;
  }

  const filePath = join(process.cwd(), "public", publicPath.replace(/^\/+/, ""));
  try {
    await unlink(filePath);
  } catch {
    // ignore local missing file
  }
}
