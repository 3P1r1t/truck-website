import { mkdir, access, writeFile, unlink } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";

const DEFAULT_UPLOAD_DIR = "public/uploads";

async function ensureDir(dir: string) {
  try {
    await access(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
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

export async function saveUploadedFile(file: File, subDirectory = "") {
  const uploadDir = process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR;
  const relativeDir = subDirectory ? `${uploadDir}/${subDirectory}` : uploadDir;
  const absDir = join(process.cwd(), relativeDir);

  await ensureDir(absDir);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = extname(file.name || "") || ".bin";
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const filePath = join(absDir, filename);

  await writeFile(filePath, buffer);

  const publicBase = relativeDir.startsWith("public") ? relativeDir.slice("public".length) : `/${relativeDir}`;
  return {
    filename,
    path: `${publicBase.replace(/\\/g, "/")}/${filename}`.replace(/\/\/+/, "/"),
    size: file.size,
    mimeType: file.type,
  };
}

export async function removeUploadedFile(publicPath: string) {
  if (!publicPath.startsWith("/uploads/")) {
    return;
  }

  const filePath = join(process.cwd(), "public", publicPath);
  try {
    await unlink(filePath);
  } catch {
    // ignore missing file
  }
}
