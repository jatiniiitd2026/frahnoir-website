/**
 * Centralised texture configuration.
 *
 * The MVP renders with placeholder materials so the 3D scroll reveal works
 * without any image assets. When you are ready to apply real artwork, flip
 * `USE_TEXTURES` to `true`. Every mesh reads its path from `TEXTURE_PATHS`, so
 * swapping assets is a one-line change per panel.
 *
 * Two path sets are provided:
 *  - `REQUESTED_PATHS`  – the simple flat names from the original brief.
 *  - `EXISTING_PATHS`   – the real starter textures already shipped in
 *                         /public/textures/velvet_ember (see public/README.txt).
 *
 * `TEXTURE_PATHS` points at the existing real files so toggling `USE_TEXTURES`
 * works immediately. Point it at `REQUESTED_PATHS` once you drop those files in.
 */

export const USE_TEXTURES = false;

export type BoxFace = "front" | "left" | "right" | "back" | "top";
export type TextureKey = `box-${BoxFace}` | "bottle-label";

/** Flat names from the brief — drop these files into /public/textures/. */
export const REQUESTED_PATHS: Record<TextureKey, string> = {
  "box-front": "/textures/velvet-box-front.png",
  "box-left": "/textures/velvet-box-left.png",
  "box-right": "/textures/velvet-box-right.png",
  "box-back": "/textures/velvet-box-back.png",
  "box-top": "/textures/velvet-box-top.png",
  "bottle-label": "/textures/velvet-bottle-label.png",
};

/** Real starter textures already present in the repo. */
export const EXISTING_PATHS: Record<TextureKey, string> = {
  "box-front": "/textures/velvet_ember/velvet_ember_box_front.png",
  "box-left": "/textures/velvet_ember/velvet_ember_box_left_character.png",
  "box-right": "/textures/velvet_ember/velvet_ember_box_right_recommended.png",
  "box-back": "/textures/velvet_ember/velvet_ember_box_back_legal.png",
  "box-top": "/textures/velvet_ember/velvet_ember_box_top.png",
  "bottle-label": "/textures/velvet_ember/velvet_ember_bottle_label_wrap.png",
};

/** Active map consumed by the meshes. */
export const TEXTURE_PATHS: Record<TextureKey, string> = EXISTING_PATHS;
