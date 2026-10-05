"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Light for an aqueous, luminous world: soft white from above, cyan from the
 * lower left, pale aqua from the right, and a navy floor in the reflection
 * environment so the glassy helix keeps dark edges against the bright field.
 * No HDR downloads: the environment is rendered once from the light formers.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.9} color="#e9fbf8" />
      <pointLight position={[-6.5, -3.5, 4]} intensity={55} color="#69c9dd" distance={40} decay={2} />
      <pointLight position={[6.5, 5.5, 2.5]} intensity={40} color="#ffffff" distance={40} decay={2} />
      <pointLight position={[0.5, 1, 6]} intensity={12} color="#c6f0ef" distance={30} decay={2} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 7, -2]} scale={[12, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.6} color="#69c9dd" position={[-5, -2, 2]} scale={[7, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.2} color="#c6f0ef" position={[5, 3, 1]} scale={[5, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.9} color="#08283d" position={[0, -7, 0]} scale={[14, 5, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}
