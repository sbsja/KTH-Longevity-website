"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createBackdropMaterial } from "./backdropMaterial";

/*
 * One large plane far behind the spine, the particles and the panel ring. It is
 * drawn first, writes no depth and reads none, so it can never occlude or relight
 * anything in front of it.
 *
 * The procedural field is static, so it is rendered once into a texture (and again
 * only when the layout switches between desktop and phone). Per frame the backdrop
 * costs a single texture lookup; the sense of life comes from the existing camera
 * parallax and particles, not from a new animation loop.
 */
const PLANE_Z = -22;
const PLANE_SIZE = new THREE.Vector2(56, 40);

/** Visible height at the plane for the gallery camera: 2 · distance · tan(fov / 2). */
function viewHeightAt(fovDeg: number, cameraZ: number) {
  return 2 * (cameraZ - PLANE_Z) * Math.tan((fovDeg * Math.PI) / 360);
}

export function Backdrop({ desktop }: { desktop: boolean }) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const display = useMemo(
    () => new THREE.MeshBasicMaterial({ fog: false, toneMapped: false, depthWrite: false, depthTest: false }),
    [],
  );
  const mesh = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const node = mesh.current;
    const width = desktop ? 2560 : 1536;
    const height = Math.round(width * (PLANE_SIZE.y / PLANE_SIZE.x));
    const target = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.UnsignedByteType,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    // sRGB storage keeps the dark gradients free of banding at 8 bits.
    target.texture.colorSpace = THREE.SRGBColorSpace;

    const { material, uniforms } = createBackdropMaterial(PLANE_SIZE);
    uniforms.uViewH.value = desktop ? viewHeightAt(32, 10.5) : viewHeightAt(50, 11.5);
    uniforms.uDetail.value = desktop ? 1 : 0.6;

    const bakeScene = new THREE.Scene();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    bakeScene.add(quad);
    const bakeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const previous = gl.getRenderTarget();
    gl.setRenderTarget(target);
    gl.render(bakeScene, bakeCamera);
    gl.setRenderTarget(previous);

    quad.geometry.dispose();
    material.dispose();

    display.map = target.texture;
    display.needsUpdate = true;
    if (node) node.visible = true;
    invalidate();

    return () => {
      if (node) node.visible = false;
      display.map = null;
      target.dispose();
    };
  }, [desktop, gl, display, invalidate]);

  useEffect(() => () => display.dispose(), [display]);

  return (
    <mesh ref={mesh} position={[0.4, 0, PLANE_Z]} renderOrder={-10} frustumCulled={false} visible={false}>
      <planeGeometry args={[PLANE_SIZE.x, PLANE_SIZE.y]} />
      <primitive object={display} attach="material" />
    </mesh>
  );
}
