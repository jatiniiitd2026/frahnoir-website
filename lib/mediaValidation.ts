import {
  MAX_FILE_SIZE,
  fileExtension,
  isAllowedExtension,
  isAllowedMimeType,
} from "@/lib/media";

/**
 * SERVER-SIDE deep validation for uploaded media. A file is accepted only when
 * its declared MIME, its filename extension, AND its magic bytes all agree and
 * all land in the allowlist. SVG and everything else are rejected.
 */

type CanonMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "video/mp4"
  | "video/webm";

/** Canonical storage extension per validated MIME (never from the filename). */
const MIME_TO_EXT: Record<CanonMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/** Extensions that legitimately map to a given canonical MIME. */
const EXT_TO_MIME: Record<string, CanonMime> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
};

function ascii(bytes: Uint8Array, start: number, end: number): string {
  let s = "";
  for (let i = start; i < end && i < bytes.length; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return s;
}

/** Detect the true type from the leading bytes; null if unrecognised. */
export function sniffMime(bytes: Uint8Array): CanonMime | null {
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  // GIF: "GIF8"
  if (ascii(bytes, 0, 4) === "GIF8") return "image/gif";
  // WEBP: "RIFF"...."WEBP"
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") {
    return "image/webp";
  }
  // WEBM: EBML header 1A 45 DF A3
  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "video/webm";
  }
  // MP4: "ftyp" box within the first bytes (usually at offset 4)
  if (ascii(bytes, 4, 8) === "ftyp") return "video/mp4";
  return null;
}

export interface MediaValidationResult {
  ok: boolean;
  /** Canonical storage extension (only when ok). */
  ext?: string;
  /** Canonical content-type to store with (only when ok). */
  contentType?: string;
  error?: string;
}

/** Validate a single uploaded File: size + MIME + extension + magic bytes. */
export async function validateMediaFile(
  file: File,
): Promise<MediaValidationResult> {
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "Each file must be 8 MB or smaller." };
  }

  const declared = file.type;
  if (!isAllowedMimeType(declared)) {
    return { ok: false, error: "Unsupported file type." };
  }

  const ext = fileExtension(file.name);
  if (!isAllowedExtension(ext)) {
    return { ok: false, error: "Unsupported file extension." };
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const sniffed = sniffMime(header);
  if (!sniffed) {
    return { ok: false, error: "File content is not a supported media type." };
  }

  // All three signals must agree.
  const extMime = EXT_TO_MIME[ext];
  if (sniffed !== declared || sniffed !== extMime) {
    return {
      ok: false,
      error: "File type, extension and contents do not match.",
    };
  }

  return {
    ok: true,
    ext: MIME_TO_EXT[sniffed],
    contentType: sniffed,
  };
}
