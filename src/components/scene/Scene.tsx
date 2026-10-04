"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { sceneStore, useSceneState } from "@/lib/sceneStore";
import { useGalleryState } from "@/lib/galleryStore";
import { Backdrop } from "./Backdrop";
import { CameraRig } from "./CameraRig";
import { Lighting } from "./Lighting";
import { PanelRing } from "./PanelRing";
import { Particles } from "./Particles";
import { Spine } from "./Spine";

const INK = "#060f0e";

function CameraSetup({ desktop }: { desktop: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useEffect(() => {
    camera.fov = desktop ? 32 : 50;
    camera.updateProjectionMatrix();
  }, [camera, desktop]);
  return null;
}

/** Drives the frame loop: continuous while motion is allowed, on demand otherwise. */
function FrameloopControl({ demand }: { demand: boolean }) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    setFrameloop(demand ? "demand" : "always");
    invalidate();
  }, [demand, setFrameloop, invalidate]);
  return null;
}

export default function Scene() {
  const { desktop, reducedMotion, visible, mode } = useSceneState();
  const { paused } = useGalleryState();
  // Reduced motion renders single frames; a visitor pause stops drift but keeps travel smooth.
  const demand = reducedMotion || !visible;
  const drift = !paused && !reducedMotion;

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 32, position: [0, 0.2, 10.5], near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", stencil: false }}
      frameloop="always"
      onCreated={(state) => {
        state.gl.setClearColor(INK, 1);
        state.gl.toneMapping = THREE.ACESFilmicToneMapping;
        state.gl.toneMappingExposure = 1.05;
        if (process.env.NODE_ENV !== "production") {
          (window as unknown as { __kthScene?: unknown }).__kthScene = state;
        }
        sceneStore.setStatus("ready");
      }}
    >
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, 11, 30]} />
      <Backdrop desktop={desktop} />
      <CameraSetup desktop={desktop} />
      <FrameloopControl demand={demand} />
      <Lighting />
      <CameraRig desktop={desktop} reducedMotion={reducedMotion} mode={mode} />
      <Spine drift={drift} />
      <Particles count={desktop ? 1400 : 600} drift={drift} />
      <PanelRing desktop={desktop} reducedMotion={reducedMotion} mode={mode} />
    </Canvas>
  );
}
