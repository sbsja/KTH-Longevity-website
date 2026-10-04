"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneMode } from "@/lib/sceneStore";

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/**
 * Camera composition per mode, plus a subtle pointer parallax on desktop.
 * Gallery: looking straight down the spine. Detail: shifted so the page column
 * has room on the left. Ambient: pulled back and calm.
 */
export function CameraRig({ desktop, reducedMotion, mode }: { desktop: boolean; reducedMotion: boolean; mode: SceneMode }) {
  const camera = useThree((s) => s.camera);
  const pointer = useThree((s) => s.pointer);
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const base = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const parallax = desktop && !reducedMotion ? 1 : 0;
    if (mode === "gallery") {
      base.set(0, desktop ? 0.15 : 0.6, desktop ? 10.5 : 11.5);
      target.set(0, desktop ? -0.1 : 0.55, 0);
    } else if (mode === "detail") {
      base.set(desktop ? 0.9 : 0, desktop ? 0.1 : 1.2, desktop ? 10.8 : 12.5);
      target.set(desktop ? 1.1 : 0, desktop ? 0 : 1.0, 0);
    } else {
      base.set(0.4, 0.4, 13.5);
      target.set(0.4, 0.5, 0);
    }
    const px = pointer.x * 0.45 * parallax;
    const py = pointer.y * 0.25 * parallax;
    const lambda = reducedMotion ? 60 : 3.2;
    camera.position.x = damp(camera.position.x, base.x + px, lambda, dt);
    camera.position.y = damp(camera.position.y, base.y + py, lambda, dt);
    camera.position.z = damp(camera.position.z, base.z, lambda, dt);
    look.current.x = damp(look.current.x, target.x + px * 0.3, lambda, dt);
    look.current.y = damp(look.current.y, target.y + py * 0.3, lambda, dt);
    look.current.z = damp(look.current.z, target.z, lambda, dt);
    camera.lookAt(look.current);
  });
  return null;
}
