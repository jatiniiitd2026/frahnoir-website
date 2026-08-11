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
function SceneAnimator({
  progressRef,
  children,
}: {
  progressRef: React.MutableRefObject<number>;
  children: ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3(0, 0.5, 0));

  useFrame((state, delta) => {
    const s = computeSceneState(progressRef.current, state.clock.elapsedTime);

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
}: {
  variant?: "scroll" | "static";
}) {
  // Static mode parks progress at the final showcase (full product in frame).
  const progressRef = useRef(variant === "static" ? 1 : 0);

  useEffect(() => {
    if (variant !== "scroll") return; // static mode: no scroll hijacking
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

  const isStatic = variant === "static";

  return (
    <Canvas
      // scroll: fixed full-viewport (z-10, above backdrop/below overlay).
      // static: fills its height-controlled parent, no fixed positioning.
      className={isStatic ? "!absolute inset-0" : "!fixed inset-0 z-10"}
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true, // transparent clear so the burgundy backdrop shows through
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      // static starts near the final pose to avoid a big intro pan.
      camera={
        isStatic
          ? { position: [0, 1.1, 7.4], fov: 34 }
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

        {/* Glossy black pedestal under the product (static — does not rotate) */}
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

        <SceneAnimator progressRef={progressRef}>
          <PerfumeBox progressRef={progressRef} />
          <PerfumeBottle progressRef={progressRef} />
        </SceneAnimator>

        {/* Contact shadow grounding the product on the pedestal */}
        <ContactShadows
          position={[0, -1.51, 0]}
          opacity={0.7}
          scale={10}
          blur={2.6}
          far={4}
          color="#000000"
        />
      </Suspense>
    </Canvas>
  );
}
