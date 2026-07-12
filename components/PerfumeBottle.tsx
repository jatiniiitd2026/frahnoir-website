"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { computeSceneState } from "@/lib/scrollTimeline";
import {
  getLeatherBumpTexture,
  getLeatherMapTexture,
} from "@/lib/leatherTexture";
import { LEATHER_BUMP_SCALE } from "@/lib/debug";
import { TEXTURE_PATHS, USE_TEXTURES } from "@/lib/textures";

/**
 * Premium bottle assembled from separate parts so each gets its own material:
 *   glossy black base · red leather body/label wrap · glossy black shoulder
 *   cone · neck · glossy black cap · thin gold seam rings.
 * Geometry is centred on the group origin (spans y ≈ ±1.2) so the timeline can
 * position it cleanly.
 */

// Shared glossy-black material props (cap, base, shoulder, neck).
const BLACK_GLOSS = {
  color: "#050505",
  roughness: 0.18,
  metalness: 0.55,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  envMapIntensity: 1.6,
} as const;

function LeatherLabelMaterial({
  bump,
  grain,
}: {
  bump: THREE.Texture | null;
  grain: THREE.Texture | null;
}) {
  if (USE_TEXTURES) return <TexturedLabelMaterial bump={bump} />;
  return (
    <meshPhysicalMaterial
      color="#6e1519"
      map={grain ?? undefined}
      roughness={0.7}
      metalness={0.08}
      sheen={1}
      sheenRoughness={0.55}
      sheenColor={"#c0524a"}
      clearcoat={0.22}
      clearcoatRoughness={0.65}
      bumpMap={bump ?? undefined}
      bumpScale={LEATHER_BUMP_SCALE}
      envMapIntensity={0.85}
    />
  );
}

function TexturedLabelMaterial({ bump }: { bump: THREE.Texture | null }) {
  const map = useTexture(TEXTURE_PATHS["bottle-label"]);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return (
    <meshPhysicalMaterial
      map={map}
      roughness={0.6}
      metalness={0.1}
      sheen={0.5}
      sheenColor={"#c0524a"}
      bumpMap={bump ?? undefined}
      bumpScale={0.008}
      envMapIntensity={0.9}
    />
  );
}

export default function PerfumeBottle({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bump = useMemo(() => getLeatherBumpTexture(), []);
  const grain = useMemo(() => getLeatherMapTexture(), []);

  useFrame((state) => {
    const { bottlePos, bottleRotationY, bottleScale } = computeSceneState(
      progressRef.current,
      state.clock.elapsedTime,
    );
    const g = groupRef.current;
    if (!g) return;
    g.position.set(bottlePos[0], bottlePos[1], bottlePos[2]);
    g.rotation.y = bottleRotationY;
    g.scale.setScalar(bottleScale);
  });

  return (
    <group ref={groupRef}>
      {/* Glossy black base */}
      <mesh position={[0, -1.095, 0]} castShadow>
        <cylinderGeometry args={[0.54, 0.55, 0.22, 64]} />
        <meshPhysicalMaterial {...BLACK_GLOSS} />
      </mesh>

      {/* Red leather body / label wrap */}
      <mesh position={[0, -0.31, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.35, 64]} />
        <LeatherLabelMaterial bump={bump} grain={grain} />
      </mesh>

      {/* Thin gold seam rings top & bottom of the label */}
      <mesh position={[0, 0.37, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.012, 12, 64]} />
        <meshPhysicalMaterial color="#c9a24b" roughness={0.24} metalness={1} clearcoat={0.4} clearcoatRoughness={0.3} envMapIntensity={1.6} />
      </mesh>
      <mesh position={[0, -0.985, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.012, 12, 64]} />
        <meshPhysicalMaterial color="#c9a24b" roughness={0.24} metalness={1} clearcoat={0.4} clearcoatRoughness={0.3} envMapIntensity={1.6} />
      </mesh>

      {/* Glossy black shoulder cone */}
      <mesh position={[0, 0.475, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 0.22, 64]} />
        <meshPhysicalMaterial {...BLACK_GLOSS} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.645, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.12, 48]} />
        <meshPhysicalMaterial {...BLACK_GLOSS} />
      </mesh>

      {/* Glossy black cap with a softly bevelled top */}
      <mesh position={[0, 0.955, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.33, 0.5, 64]} />
        <meshPhysicalMaterial {...BLACK_GLOSS} />
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.34, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
        <meshPhysicalMaterial {...BLACK_GLOSS} />
      </mesh>
    </group>
  );
}
