"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Two brand lights (Tiffany from lower left, pale yellow from upper right) and a
 * small procedural environment so the metallic spine has something to reflect.
 * No HDR downloads: the environment is rendered once from the light formers.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} color="#9fd9d2" />
      <pointLight position={[-6.5, -3.5, 4]} intensity={60} color="#81d8d0" distance={40} decay={2} />
      <pointLight position={[6.5, 5.5, 2.5]} intensity={42} color="#ffea95" distance={40} decay={2} />
      <pointLight position={[0.5, 1, 6]} intensity={14} color="#f2f6f4" distance={30} decay={2} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#81d8d0" position={[-5, -2, 2]} scale={[7, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.8} color="#ffea95" position={[5, 4, 1]} scale={[5, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="circle" intensity={1.2} color="#f2f6f4" position={[0, 7, -3]} scale={3} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.6} color="#103430" position={[0, -7, 0]} scale={[12, 4, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}
