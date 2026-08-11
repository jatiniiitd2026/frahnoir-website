"use client";

import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import PerfumeBox from "./PerfumeBox";
import PerfumeBottle from "./PerfumeBottle";
import { computeSceneState } from "@/lib/scrollTimeline";

/**
 * Reads the shared scroll progress every frame and drives the camera + the
 * parent product group (uniform scale + grounding offset). The box and bottle
 * position/rotate themselves from the same timeline. Camera values are eased
 * toward their targets so quick scroll jumps still feel smooth.
 */
// Local bounding box of the final side-by-side product composition.
const COMP_W = 3.35; // box(-1.9..0.3) + bottle(0.45..1.45)
const COMP_H = 3.2;
const COMP_CX = -0.225; // horizontal centre of the composition (local units)
const STATIC_SCALE = 0.62; // smaller product for phones

function SceneAnimator({
  progressRef,
  children,
  staticMode = false,
}: {
  progressRef: React.MutableRefObject<number>;
  children: ReactNode;
  staticMode?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3(0, 0.5, 0));

  useFrame((state, delta) => {
    const s = computeSceneState(progressRef.current, state.clock.elapsedTime);

    // --- Static (mobile) mode: frame the WHOLE product to fit the contained
    // hero at any aspect ratio, centred and not too large. ---
    if (staticMode && groupRef.current) {
      groupRef.current.scale.setScalar(
        THREE.MathUtils.damp(groupRef.current.scale.x, STATIC_SCALE, 6, delta),
      );
      groupRef.current.position.y = THREE.MathUtils.damp(
        groupRef.current.position.y,
        0,
        6,
        delta,
      );

      const aspect = state.size.width / Math.max(1, state.size.height);
      const persp = camera as THREE.PerspectiveCamera;
      const tanHalfFov = Math.tan((persp.fov * Math.PI) / 360);
      const worldW = COMP_W * STATIC_SCALE;
      const worldH = COMP_H * STATIC_SCALE;
      // z needed so the product occupies ~80% width AND ~64% height.
      const zForWidth = worldW / 0.8 / (2 * tanHalfFov * aspect);
      const zForHeight = worldH / 0.64 / (2 * tanHalfFov);
      const z = THREE.MathUtils.clamp(Math.max(zForWidth, zForHeight), 6, 16);
      const cx = COMP_CX * STATIC_SCALE;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, cx, 5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.35, 5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 5, delta);
      lookAt.current.x = THREE.MathUtils.damp(lookAt.current.x, cx, 5, delta);
      lookAt.current.y = THREE.MathUtils.damp(lookAt.current.y, -0.05, 5, delta);
      camera.lookAt(lookAt.current);
      return;
    }

    if (groupRef.current) {
      const sc = THREE.MathUtils.damp(
        groupRef.current.scale.x,
        s.productScale,
        6,
        delta,
      );
      groupRef.current.scale.setScalar(sc);
      groupRef.current.position.y = THREE.MathUtils.damp(
        groupRef.current.position.y,
        s.productY,
        6,
        delta,
      );
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, s.cameraX, 5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, s.cameraY, 5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, s.cameraZ, 5, delta);

    lookAt.current.x = THREE.MathUtils.damp(lookAt.current.x, s.lookAtX, 5, delta);
    lookAt.current.y = THREE.MathUtils.damp(lookAt.current.y, s.lookAtY, 5, delta);
    camera.lookAt(lookAt.current);
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * `scroll` (default): fixed full-screen canvas driven by the #scroll-stage
 *   ScrollTrigger — the desktop cinematic hero (unchanged).
 * `static`: an absolutely-positioned canvas that fills its (height-controlled)
 *   parent and holds the final showcase pose. Used inside the mobile hero so
 *   the 3D never takes over the whole screen.
 */
export default function PerfumeScene({
  variant = "scroll",
  progressRef: externalProgressRef,
}: {
  variant?: "scroll" | "static" | "mobile-scroll";
  /** Required for "mobile-scroll": progress (0–1) driven by the mobile hero. */
  progressRef?: React.MutableRefObject<number>;
}) {
  // static parks at the final showcase (1); scroll starts at 0.
  const internalRef = useRef(variant === "static" ? 1 : 0);
  // mobile-scroll reads progress from the caller; others use the internal ref.
  const progressRef =
    variant === "mobile-scroll" && externalProgressRef
      ? externalProgressRef
      : internalRef;

  useEffect(() => {
    if (variant !== "scroll") return; // static / mobile-scroll: no ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: "#scroll-stage",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    // Recalculate once layout settles (fonts, images, viewport).
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      trigger.kill();
      window.removeEventListener("load", refresh);
    };
  }, [variant]);

  // Both non-desktop variants use the contained, mobile-fit camera framing.
  const isStatic = variant !== "scroll";

  return (
    <Canvas
      // scroll: fixed full-viewport (z-10, above backdrop/below overlay).
      // static: fills its height-controlled parent (never fixed), sits behind
      // the mobile content and ignores pointer events so buttons stay clickable.
      className={
        isStatic
          ? "!absolute inset-0 h-full w-full pointer-events-none z-0"
          : "!fixed inset-0 z-10"
      }
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true, // transparent clear so the burgundy backdrop shows through
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      // static starts near the mobile-fit pose to avoid a big intro pan.
      camera={
        isStatic
          ? { position: [0, 0.35, 9], fov: 34 }
          : { position: [1.8, 0.1, 6], fov: 33 }
      }
    >
      <Suspense fallback={null}>
        {/* Soft warm fill so shadows stay rich but never crushed */}
        <ambientLight intensity={0.45} color="#ffd9b3" />
        <hemisphereLight args={["#ffcaa0", "#1a0509", 0.5]} />

        {/* Warm amber KEY light from the upper-left */}
        <directionalLight
          position={[-6, 7, 4]}
          intensity={3.4}
          color="#ffb066"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
        />
        {/* Deep red RIM light from the side/back to carve the silhouette */}
        <spotLight
          position={[6.5, 3.5, -5]}
          angle={0.7}
          penumbra={0.85}
          intensity={160}
          color="#c01526"
        />
        {/* Gentle warm FILL from the front-right */}
        <pointLight position={[4, 1.5, 5]} intensity={26} color="#ffd9a0" />
        {/* Small raking HIGHLIGHT to reveal leather grain + bevelled edges */}
        <pointLight position={[-1.6, 2.4, 3.6]} intensity={22} color="#fff2d8" />

        {/* Procedural environment (no external HDR fetch) for glossy reflections */}
        <Environment resolution={256}>
          <Lightformer
            intensity={2.4}
            position={[-4, 4, 4]}
            scale={[10, 5, 1]}
            color="#ffe2bd"
          />
          <Lightformer
            intensity={1.6}
            position={[5, 1, -3]}
            scale={[7, 7, 1]}
            color="#c01526"
          />
          <Lightformer
            intensity={1}
            position={[4, 2, 4]}
            scale={[5, 5, 1]}
            color="#fff4e2"
          />
        </Environment>

        {/* Pedestal + contact shadow. Grouped so they scale WITH the product in
            static/mobile mode (stays grounded); desktop keeps scale 1 → unchanged. */}
        <group scale={isStatic ? STATIC_SCALE : 1}>
          {/* Glossy black pedestal under the product (does not rotate) */}
          <mesh position={[0, -1.72, 0]} receiveShadow>
            <cylinderGeometry args={[2.4, 2.75, 0.4, 64]} />
            <meshPhysicalMaterial
              color="#070406"
              roughness={0.07}
              metalness={0.45}
              clearcoat={1}
              clearcoatRoughness={0.05}
              envMapIntensity={1.3}
            />
          </mesh>
          <ContactShadows
            position={[0, -1.51, 0]}
            opacity={0.7}
            scale={10}
            blur={2.6}
            far={4}
            color="#000000"
          />
        </group>

        <SceneAnimator progressRef={progressRef} staticMode={isStatic}>
          <PerfumeBox progressRef={progressRef} />
          <PerfumeBottle progressRef={progressRef} />
        </SceneAnimator>
      </Suspense>
    </Canvas>
  );
}
