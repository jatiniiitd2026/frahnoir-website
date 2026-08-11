import * as THREE from "three";

/**
 * Gold "Frahnoir" wordmark drawn on a transparent canvas (no external font
 * fetch — uses a system serif). Applied as a small decal on the bottle so the
 * brand reads in gold on the 3D bottle.
 */
let cache: THREE.CanvasTexture | null = null;

export function getFrahnoirTextTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (cache) return cache;

  const w = 512;
  const h = 170;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "italic 600 104px Georgia, 'Times New Roman', serif";

  // Vertical gold gradient for a foil-like sheen.
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#f6e6b4");
  grad.addColorStop(0.5, "#d9b45a");
  grad.addColorStop(1, "#b8892f");
  ctx.fillStyle = grad;

  // Soft shadow so it stays legible on the dark leather.
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillText("Frahnoir", w / 2, h / 2 + 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache = tex;
  return tex;
}
