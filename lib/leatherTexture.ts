import * as THREE from "three";

import { DEBUG_VISUAL_LEATHER, LEATHER_GRAIN_STRENGTH } from "@/lib/debug";

/**
 * Procedural leather grain, generated on a canvas (no asset files). Higher
 * contrast than a pure bump map so the grain is visible as TONAL variation
 * (used as a color `map`), not only as lighting-dependent relief (`bumpMap`).
 *
 * Two texture views share one canvas:
 *   - getLeatherMapTexture()  → sRGB, multiplies the base burgundy = visible grain
 *   - getLeatherBumpTexture() → linear, drives surface relief
 */

let canvasCache: HTMLCanvasElement | null = null;
let bumpCache: THREE.CanvasTexture | null = null;
let mapCache: THREE.CanvasTexture | null = null;

function buildCanvas(size = 512): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;

  // Base ~0.82 grey so the color map mostly preserves the burgundy while
  // adding lighter/darker leather patches.
  ctx.fillStyle = "#d2d2d2";
  ctx.fillRect(0, 0, size, size);

  // Stronger, multi-scale mottling (contrast tuned up vs. the old subtle pass).
  const strong = 0.9 + LEATHER_GRAIN_STRENGTH * 0.5;
  const layers = [
    { count: 26, radius: size * 0.17, alpha: 0.1 * strong },
    { count: 80, radius: size * 0.07, alpha: 0.1 * strong },
    { count: 320, radius: size * 0.025, alpha: 0.12 * strong },
  ];
  for (const { count, radius, alpha } of layers) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = radius * (0.5 + Math.random());
      const shade = Math.random() > 0.5 ? 255 : 70;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${shade},${shade},${shade},${alpha})`);
      grad.addColorStop(1, `rgba(${shade},${shade},${shade},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Fine pore speckle.
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  const speck = DEBUG_VISUAL_LEATHER ? 24 : 14;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * speck;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function getCanvas(): HTMLCanvasElement {
  if (!canvasCache) canvasCache = buildCanvas();
  return canvasCache;
}

/** Grayscale relief map (linear). */
export function getLeatherBumpTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (!bumpCache) {
    bumpCache = new THREE.CanvasTexture(getCanvas());
    bumpCache.wrapS = bumpCache.wrapT = THREE.RepeatWrapping;
    bumpCache.repeat.set(2, 2.6);
    bumpCache.anisotropy = 4;
  }
  return bumpCache;
}

/** sRGB grain map — multiplies the material's base color for visible mottling. */
export function getLeatherMapTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (!mapCache) {
    mapCache = new THREE.CanvasTexture(getCanvas());
    mapCache.colorSpace = THREE.SRGBColorSpace;
    mapCache.wrapS = mapCache.wrapT = THREE.RepeatWrapping;
    mapCache.repeat.set(2, 2.6);
    mapCache.anisotropy = 4;
  }
  return mapCache;
}
