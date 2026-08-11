import * as THREE from "three";

/**
 * Gold box brand decal generated on a canvas: thin gold frame + the crest
 * (composited from the existing transparent-gold crest PNG) + the "SWEET SIN"
 * wordmark + subtitle. This is the ONLY place the 3D box shows the product
 * name, so changing it here changes it on both phone and desktop and nowhere
 * else. Reliable + artifact-tolerant: if the crest image fails to load, the
 * wordmark still renders (never blank).
 */
let cache: THREE.CanvasTexture | null = null;

// The standalone crest PNG is an incomplete crop (missing the shield), so we
// take the COMPLETE crest from the logo_label sheet and crop out its wordmark.
const CREST_SRC =
  "/textures/velvet_ember/velvet_ember_logo_label_transparent_gold.png";

export function getBoxBrandTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (cache) return cache;

  const w = 900;
  const h = 765;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const gold = () => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#f6e6b4");
    g.addColorStop(0.5, "#d9b45a");
    g.addColorStop(1, "#b8892f");
    return g;
  };

  // Frame + text first (crest is composited on load, above the wordmark).
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#c9a24b";
  ctx.lineWidth = 4;
  ctx.strokeRect(26, 26, w - 52, h - 52);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(44, 44, w - 88, h - 88);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = gold();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  try {
    ctx.letterSpacing = "6px";
  } catch {
    /* letterSpacing unsupported — falls back to default tracking */
  }
  ctx.font = "700 120px Georgia, 'Times New Roman', serif";
  ctx.fillText("SWEET SIN", w / 2, h * 0.7);

  ctx.shadowBlur = 3;
  try {
    ctx.letterSpacing = "10px";
  } catch {
    /* no-op */
  }
  ctx.font = "500 34px Georgia, 'Times New Roman', serif";
  ctx.fillText("EAU DE EXTRAIT", w / 2, h * 0.82);
  try {
    ctx.letterSpacing = "0px";
  } catch {
    /* no-op */
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache = tex;

  // Composite the COMPLETE crest above the wordmark once it loads.
  const img = new Image();
  img.onload = () => {
    // Source-crop the crest emblem out of the logo sheet (excludes the sheet's
    // frame border and the baked "VELVET EMBER" wordmark below it).
    const cropX = img.width * 0.1;
    const cropY = img.height * 0.05;
    const cropW = img.width * 0.8;
    const cropH = img.height * 0.72;
    const aspect = cropW / cropH;
    const destW = w * 0.62;
    const destH = destW / aspect;
    const destX = (w - destW) / 2;
    const destY = h * 0.07;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, destX, destY, destW, destH);
    tex.needsUpdate = true;
  };
  img.onerror = () => {
    /* keep wordmark-only — never blank */
  };
  img.src = CREST_SRC;

  return tex;
}
