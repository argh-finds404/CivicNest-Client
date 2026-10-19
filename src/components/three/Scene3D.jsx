import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Float, PresentationControls } from "@react-three/drei";
import { MODELS } from "./modelRegistry";

/**
 * A small interactive 3D scene for a page header. Drag to turn the model
 * (it springs back), it floats gently, and rendering stops while the scene is
 * off-screen. Loaded lazily through PageArt3D, so three.js is only downloaded
 * on pages that show one.
 */
export default function Scene3D({ model, label }) {
  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const Model = MODELS[model];

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!Model) return null;
  const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div ref={wrapRef} className="cn-scene3d" role="img" aria-label={label}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.1, 6.6], fov: 34 }}
        onCreated={({ camera }) => camera.lookAt(0, -0.15, 0)}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        <hemisphereLight args={["#ffffff", "#0a3d35", 1.15]} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} />
        <directionalLight position={[-5, 2, -3]} intensity={0.45} color="#9fe3cf" />
        <PresentationControls
          global={false}
          cursor
          snap
          speed={1.4}
          zoom={1}
          polar={[-0.12, 0.25]}
          azimuth={[-0.7, 0.7]}
        >
          <Float speed={still ? 0 : 1.6} rotationIntensity={still ? 0 : 0.25} floatIntensity={still ? 0 : 0.55}>
            <group position={[0, -0.1, 0]}>
              <Model animate={!still} />
            </group>
          </Float>
        </PresentationControls>
        <ContactShadows position={[0, -1.25, 0]} opacity={0.38} scale={7} blur={2.6} far={3} frames={1} color="#062a24" />
      </Canvas>
      <span className="cn-scene3d-hint" aria-hidden="true">
        <i className="ri-drag-move-2-line" /> Drag to turn
      </span>
    </div>
  );
}
