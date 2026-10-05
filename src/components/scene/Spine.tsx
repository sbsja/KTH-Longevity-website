"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const NODES = 230; // per strand
const HEIGHT = 20;
const RADIUS = 0.64;
const TURNS = 5.6;
const RUNG_EVERY = 7;

/**
 * The central sculptural form: a vertical double helix built from instanced
 * spheres and rungs, in an iridescent clear-coated metal. Procedural, no assets.
 */
export function Spine({ drift }: { drift: boolean }) {
  const group = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const rungsRef = useRef<THREE.InstancedMesh>(null);
  const time = useRef(0);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#3aa3b9"),
        metalness: 0.78,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.18,
        iridescence: 0.8,
        iridescenceIOR: 1.4,
        iridescenceThicknessRange: [140, 520],
        envMapIntensity: 1.4,
      }),
    [],
  );
  const rungMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#175998"),
        metalness: 0.55,
        roughness: 0.38,
        emissive: new THREE.Color("#0f3f6e"),
        emissiveIntensity: 0.25,
        iridescence: 0.4,
        envMapIntensity: 1,
      }),
    [],
  );
  const nodeGeometry = useMemo(() => new THREE.IcosahedronGeometry(0.082, 2), []);
  const rungGeometry = useMemo(() => new THREE.CylinderGeometry(0.018, 0.018, 1, 7), []);

  const rungCount = Math.floor(NODES / RUNG_EVERY);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const nodes = nodesRef.current;
    const rungs = rungsRef.current;
    if (!nodes || !rungs) return;
    let r = 0;
    for (let i = 0; i < NODES; i++) {
      const t = i / (NODES - 1);
      const y = (t - 0.5) * HEIGHT;
      const a = t * Math.PI * 2 * TURNS;
      const wobble = 1 + 0.35 * Math.sin(i * 0.63) + 0.2 * Math.sin(i * 0.21) + (i % 13 === 0 ? 0.7 : 0);
      for (let s = 0; s < 2; s++) {
        const ang = a + s * Math.PI;
        dummy.position.set(Math.cos(ang) * RADIUS, y, Math.sin(ang) * RADIUS);
        dummy.scale.setScalar(wobble);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        nodes.setMatrixAt(i * 2 + s, dummy.matrix);
      }
      if (i % RUNG_EVERY === 2 && r < rungCount) {
        dummy.position.set(0, y, 0);
        dummy.rotation.set(0, -a, Math.PI / 2);
        dummy.scale.set(1, RADIUS * 2, 1);
        dummy.updateMatrix();
        rungs.setMatrixAt(r++, dummy.matrix);
      }
    }
    nodes.instanceMatrix.needsUpdate = true;
    rungs.instanceMatrix.needsUpdate = true;
    nodes.computeBoundingSphere();
    rungs.computeBoundingSphere();
  }, [rungCount]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    if (drift) time.current += dt;
    const g = group.current;
    if (!g) return;
    g.rotation.y = time.current * 0.07;
    g.rotation.z = 0.07 + Math.sin(time.current * 0.21) * 0.015;
    g.position.y = Math.sin(time.current * 0.17) * 0.12;
  });

  return (
    <group ref={group} position={[1.0, 0, -1.9]} rotation={[0, 0, 0.07]}>
      <instancedMesh ref={nodesRef} args={[nodeGeometry, material, NODES * 2]} frustumCulled={false} />
      <instancedMesh ref={rungsRef} args={[rungGeometry, rungMaterial, rungCount]} frustumCulled={false} />
    </group>
  );
}
