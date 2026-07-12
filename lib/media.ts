/**
 * Shared, CLIENT-SAFE media constants + helpers for reviews/blog.
 * (No server imports — safe to use from client components.)
 * Deep validation with magic-byte sniffing lives in lib/mediaValidation.ts
 * and runs server-side only.
 */

export const MAX_REVIEW_FILES = 4;
export const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB per file

/** The ONLY MIME types accepted (SVG is intentionally excluded). */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
] as const;

/** The ONLY file extensions accepted. */
export const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "mp4",
  "webm",
] as const;

/** `accept` attribute for the file input (explicit, not image/*|video/*). */
export const ACCEPTED_MEDIA = ALLOWED_MIME_TYPES.join(",");

export function isAllowedMimeType(type: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(type);
}

export function fileExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export function isAllowedExtension(ext: string): boolean {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

/** Best-effort video detection for rendering <video> vs <img>. */
export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}
