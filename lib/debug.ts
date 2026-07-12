/**
 * TEMPORARY visual-debug switch for the 3D leather/material polish.
 *
 * While `DEBUG_VISUAL_LEATHER` is true the leather grain, bump relief and
 * clearcoat are exaggerated and an on-screen badge is shown, so the effect is
 * unmistakable. Set it to `false` (or tune the values below) once confirmed —
 * that alone dials the whole effect back to production-subtle.
 */
export const DEBUG_VISUAL_LEATHER = false;

/** Bump strength for placeholder leather panels. */
export const LEATHER_BUMP_SCALE = DEBUG_VISUAL_LEATHER ? 0.07 : 0.055;

/** Bump strength when real artwork textures are the color map (combine, don't replace). */
export const LEATHER_BUMP_SCALE_TEXTURED = DEBUG_VISUAL_LEATHER ? 0.05 : 0.04;

/** How strongly the leather grain color map modulates the base tone. */
export const LEATHER_GRAIN_STRENGTH = DEBUG_VISUAL_LEATHER ? 1 : 0.9;
