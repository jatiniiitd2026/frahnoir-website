"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

import { computeSceneState } from "@/lib/scrollTimeline";
import {
  getLeatherBumpTexture,
  getLeatherMapTexture,
} from "@/lib/leatherTexture";
import {
  LEATHER_BUMP_SCALE,
  LEATHER_BUMP_SCALE_TEXTURED,
} from "@/lib/debug";
import { TEXTURE_PATHS, USE_TEXTURES, type BoxFace } from "@/lib/textures";

/** Outer box dimensions, shared with the bottle/scene for placement. */
export const BOX = {
  width: 2.2,
  height: 3.0,
  depth: 1.4,
  thickness: 0.08,
};

const PLACEHOLDER_COLORS: Record<BoxFace | "bottom", string> = {
  front: "#62141a",
  left: "#3a0d12",
  right: "#3a0d12",
  back: "#260a0e",
  top: "#4c1016",
  bottom: "#1a080a",
};

/**
 * Per-face material. The USE_TEXTURES branch is on a module constant, so the
 * hook order stays stable across renders. Placeholder uses sheen + soft
 * clearcoat + a subtle leather grain bump to read as deep burgundy leather /
 * board rather than flat plastic.
 */
function FaceMaterial({
  face,
  bump,
  grain,
}: {
  face: BoxFace | "bottom";
  bump: THREE.Texture | null;
  grain: THREE.Texture | null;
}) {
  if (USE_TEXTURES && face !== "bottom") {
    return <TexturedFaceMaterial face={face} bump={bump} />;
  }
  return (
    <meshPhysicalMaterial
      color={PLACEHOLDER_COLORS[face]}
      map={grain ?? undefined}
      roughness={0.72}
      metalness={0.07}
      sheen={1}
      sheenRoughness={0.55}
      sheenColor={"#c85a4e"}
      clearcoat={0.24}
      clearcoatRoughness={0.65}
      bumpMap={bump ?? undefined}
      bumpScale={LEATHER_BUMP_SCALE}
      envMapIntensity={0.85}
    />
  );
}

function TexturedFaceMaterial({
  face,
  bump,
}: {
  face: BoxFace;
  bump: THREE.Texture | null;
}) {
  const map = useTexture(TEXTURE_PATHS[`box-${face}`]);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  // Grain adds surface relief only — the artwork colour map is left untouched.
  return (
    <meshPhysicalMaterial
      map={map}
      roughness={0.64}
      metalness={0.07}
      sheen={0.6}
      sheenRoughness={0.55}
      sheenColor={"#c0524a"}
      clearcoat={0.22}
      clearcoatRoughness={0.65}
      bumpMap={bump ?? undefined}
      bumpScale={LEATHER_BUMP_SCALE_TEXTURED}
      envMapIntensity={0.8}
    />
  );
}

/**
 * Gold foil brand decal (crest + "VELVET EMBER" wordmark) on a transparent
 * plane, floated slightly proud of the front leather face so the leather shows
 * around it (no z-fighting). Aspect is read from the image so nothing stretches.
 */
const BRAND_LOGO =
  "/textures/velvet_ember/velvet_ember_logo_label_transparent_gold.png";

function BrandDecal({
  position,
  width,
}: {
  position: [number, number, number];
  width: number;
}) {
  const tex = useTexture(BRAND_LOGO);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const img = tex.image as { width: number; height: number } | undefined;
  const aspect = img && img.width ? img.width / img.height : 892 / 765;

  return (
    <mesh position={position}>
      <planeGeometry args={[width, width / aspect]} />
      <meshStandardMaterial
        map={tex}
        transparent
        alphaTest={0.04}
        metalness={0.55}
        roughness={0.34}
        envMapIntensity={1.6}
        emissive={"#7a5a1e"}
        emissiveMap={tex}
        emissiveIntensity={0.35}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Thin gold trim — warm foil edge (physical metal, controlled shine). */
function GoldTrim() {
  return (
    <meshPhysicalMaterial
      color="#c9a24b"
      roughness={0.24}
      metalness={1}
      clearcoat={0.4}
      clearcoatRoughness={0.3}
      envMapIntensity={1.6}
    />
  );
}

export default function PerfumeBox({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const flapRef = useRef<THREE.Group>(null);

  // Shared leather grain textures (created once, client-side).
  const bump = useMemo(() => getLeatherBumpTexture(), []);
  const grain = useMemo(() => getLeatherMapTexture(), []);

  const { width: w, height: h, depth: d, thickness: t } = BOX;
  const R = 0.032; // panel edge radius — visibly soft, catches highlights

  useFrame((state) => {
    const { flapAngle, boxPos, boxRotationY } = computeSceneState(
      progressRef.current,
      state.clock.elapsedTime,
    );
    if (flapRef.current) flapRef.current.rotation.x = flapAngle;
    if (rootRef.current) {
      rootRef.current.position.set(boxPos[0], boxPos[1], boxPos[2]);
      rootRef.current.rotation.y = boxRotationY;
    }
  });

  return (
    <group ref={rootRef}>
      {/* Back panel */}
      <RoundedBox
        args={[w, h, t]}
        radius={R}
        smoothness={4}
        position={[0, 0, -d / 2 + t / 2]}
        castShadow
        receiveShadow
      >
        <FaceMaterial face="back" bump={bump} grain={grain} />
      </RoundedBox>

      {/* Left panel */}
      <RoundedBox
        args={[t, h, d]}
        radius={R}
        smoothness={4}
        position={[-w / 2 + t / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <FaceMaterial face="left" bump={bump} grain={grain} />
      </RoundedBox>

      {/* Right panel */}
      <RoundedBox
        args={[t, h, d]}
        radius={R}
        smoothness={4}
        position={[w / 2 - t / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <FaceMaterial face="right" bump={bump} grain={grain} />
      </RoundedBox>

      {/* Bottom panel (placeholder only — no artwork supplied) */}
      <RoundedBox
        args={[w, t, d]}
        radius={R}
        smoothness={4}
        position={[0, -h / 2 + t / 2, 0]}
        castShadow
        receiveShadow
      >
        <FaceMaterial face="bottom" bump={bump} grain={grain} />
      </RoundedBox>

      {/*
        Hinged lid = the front "flap". It is a separate group pivoting on the
        bottom-front edge. It carries the front face and the top face as one
        rigid L-shaped lid, so opening it clears the way for the bottle to rise.
      */}
      <group ref={flapRef} position={[0, -h / 2, d / 2]}>
        {/* Front face — the panel the user sees first */}
        <RoundedBox
          args={[w, h, t]}
          radius={R}
          smoothness={4}
          position={[0, h / 2, 0]}
          castShadow
          receiveShadow
        >
          <FaceMaterial face="front" bump={bump} grain={grain} />
        </RoundedBox>

        {/* Gold foil brand mark on the front face (rides with the lid; faces
            the camera when the box is closed at intro + final showcase). */}
        <BrandDecal position={[0, h / 2 + 0.15, t / 2 + 0.012]} width={1.7} />

        {/* Top face, rigidly attached so the whole lid swings open together */}
        <RoundedBox
          args={[w, t, d]}
          radius={R}
          smoothness={4}
          position={[0, h - t / 2, -d / 2]}
          castShadow
          receiveShadow
        >
          <FaceMaterial face="top" bump={bump} grain={grain} />
        </RoundedBox>

        {/* Slim gold seam along the flap's leading edge */}
        <mesh position={[0, h, 0]}>
          <boxGeometry args={[w + 0.02, t * 0.6, t * 0.6]} />
          <GoldTrim />
        </mesh>
      </group>
    </group>
  );
}
