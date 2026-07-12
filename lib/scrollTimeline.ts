/**
 * Single source of truth for the scroll-driven 3D choreography.
 *
 * The page scroll is normalised to a global progress value `p` in [0, 1].
 * `computeSceneState(p, time)` maps that progress (plus a clock for idle
 * motion) to every animatable property in the scene. Both the R3F scene and
 * the HTML overlay read from the same phase definitions, so the timeline can
 * be re-tuned in one place.
 *
 * Phase ranges (global progress):
 *   0.00–0.25  closed box intro (subtle idle rotation)
 *   0.25–0.45  box rotates to show the side panel
 *   0.45–0.65  camera pushes in and the front flap opens
 *   0.65–0.82  bottle rises out of the box
 *   0.82–1.00  camera backs out into the final side-by-side showcase
 *
 * >>> The FINAL camera + product framing all live in the `FINAL_*` constants
 *     below — this file is the place to tune the ending composition. <<<
 */

export type PhaseName =
  | "idle"
  | "rotateSide"
  | "pushFlap"
  | "bottleRise"
  | "finalDisplay";

export const PHASES: Record<PhaseName, [number, number]> = {
  idle: [0.0, 0.25],
  rotateSide: [0.25, 0.45],
  pushFlap: [0.45, 0.65],
  bottleRise: [0.65, 0.82],
  finalDisplay: [0.82, 1.0],
};

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const lerp3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/** Smooth ease-in-out so phase transitions never snap. */
export const smoothstep = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** Local 0→1 progress inside a phase range. */
export function phaseProgress(p: number, [start, end]: [number, number]) {
  return clamp((p - start) / (end - start));
}

// --- Tunable target values -------------------------------------------------

const SIDE_ANGLE = -Math.PI * 0.2; // box yaw that reveals the right/side panel
const FLAP_OPEN_ANGLE = Math.PI * 0.62; // ~111° — front flap falls open

// Camera distance per stage.
const CAMERA_Z_FAR = 5.6; // intro — closer so the leather grain reads on load
const CAMERA_Z_NEAR = 4.0; // push-in: close-up leather/foil inspection moment
const CAMERA_Z_RISE = 6.0; // ease back as the bottle lifts so it stays in frame
const CAMERA_Z_HERO = 7.4; // FINAL — backed out so the whole product is visible

// Final showcase poses (local space, inside the scaled product group).
const FINAL_PRODUCT_SCALE = 0.72; // product fits ~45% of the viewport, uncropped
const FINAL_BOX_POS: [number, number, number] = [-0.8, 0, -0.3]; // left / back
const FINAL_BOX_ROT = -0.33; // slightly angled three-quarter view
const FINAL_BOTTLE_POS: [number, number, number] = [0.95, -0.3, 0.35]; // right / front, seated

// Bottle keyframes (local space).
const BOTTLE_HIDDEN: [number, number, number] = [0, -0.4, 0]; // tucked in the box
const BOTTLE_LIFTED: [number, number, number] = [0, 0.8, 0.45]; // risen above box

export interface SceneState {
  // Camera
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  lookAtX: number;
  lookAtY: number;
  /** Uniform scale on the parent product group. */
  productScale: number;
  /** Vertical offset on the product group (keeps the base grounded when scaled). */
  productY: number;
  // Box
  boxPos: [number, number, number];
  boxRotationY: number;
  flapAngle: number;
  // Bottle
  bottlePos: [number, number, number];
  bottleRotationY: number;
  bottleScale: number;
}

export function computeSceneState(p: number, time: number): SceneState {
  const rotateSide = smoothstep(phaseProgress(p, PHASES.rotateSide));
  const pushFlap = smoothstep(phaseProgress(p, PHASES.pushFlap));
  const bottleRise = smoothstep(phaseProgress(p, PHASES.bottleRise));
  const fin = smoothstep(phaseProgress(p, PHASES.finalDisplay));

  // Idle wobble only matters before the deliberate turn; fade it as we rotate.
  const idleWobble = Math.sin(time * 0.6) * 0.05 * (1 - rotateSide);

  // --- Box -----------------------------------------------------------------
  let boxRotationY = lerp(0, SIDE_ANGLE, rotateSide);
  boxRotationY = lerp(boxRotationY, FINAL_BOX_ROT, fin);
  boxRotationY += idleWobble;

  const boxPos = lerp3([0, 0, 0], FINAL_BOX_POS, fin);

  // Flap opens during push/flap, then closes again for a clean final showcase.
  const flapAngle = lerp(0, FLAP_OPEN_ANGLE, pushFlap) * (1 - fin);

  // --- Bottle --------------------------------------------------------------
  const risePos = lerp3(BOTTLE_HIDDEN, BOTTLE_LIFTED, bottleRise);
  const bottlePos = lerp3(risePos, FINAL_BOTTLE_POS, fin);
  const bottleRotationY = lerp(0, -0.12, fin); // slight angle to catch the light
  const bottleScale = lerp(0.85, 1, bottleRise);

  // --- Camera --------------------------------------------------------------
  let cameraZ = lerp(CAMERA_Z_FAR, CAMERA_Z_NEAR, pushFlap);
  cameraZ = lerp(cameraZ, CAMERA_Z_RISE, bottleRise);
  cameraZ = lerp(cameraZ, CAMERA_Z_HERO, fin);

  let cameraY = lerp(0.35, 0.9, bottleRise);
  cameraY = lerp(cameraY, 1.1, fin);

  // Off-axis during the build for a 3/4 read, recentred for the final hero.
  const cameraX = lerp(1.1, 0.0, fin);

  const lookAtX = lerp(0, -0.12, fin); // aim at the composition centre
  const lookAtY = lerp(0.5, 0.15, fin);

  const productScale = lerp(1, FINAL_PRODUCT_SCALE, fin);
  const productY = lerp(0, -0.35, fin); // re-seat the shrunk product on the base

  return {
    cameraX,
    cameraY,
    cameraZ,
    lookAtX,
    lookAtY,
    productScale,
    productY,
    boxPos,
    boxRotationY,
    flapAngle,
    bottlePos,
    bottleRotationY,
    bottleScale,
  };
}
