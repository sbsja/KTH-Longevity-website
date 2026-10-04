"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { featured } from "@/content/featured";
import type { GalleryItem } from "@/content/types";
import { galleryStore, ringOffset } from "@/lib/galleryStore";
import type { SceneMode } from "@/lib/sceneStore";
import { computeTarget, PANEL_H, PANEL_W, RING_RADIUS, type Target } from "./layout";
import { createPanelMaterial } from "./panelMaterial";

/** Element that receives the projected rectangle of the active panel as CSS variables. */
export const HUD_ELEMENT_ID = "gallery-hud";

function damp(c: number, t: number, lambda: number, dt: number) {
  return THREE.MathUtils.lerp(c, t, 1 - Math.exp(-lambda * dt));
}

/** Load cover textures without suspending; a panel without a texture shows its tint. */
function useCoverTextures(items: GalleryItem[]) {
  const [textures, setTextures] = useState<Map<string, THREE.Texture>>(() => new Map());
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const loaded = new Map<string, THREE.Texture>();
    let cancelled = false;
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    for (const item of items) {
      loader.load(
        `/covers/${item.cover.id}.svg`,
        (tex) => {
          if (cancelled) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = Math.min(4, maxAniso);
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.generateMipmaps = true;
          tex.needsUpdate = true;
          loaded.set(item.id, tex);
          setTextures(new Map(loaded));
        },
        undefined,
        () => {
          /* keep the tinted slab */
        },
      );
    }
    return () => {
      cancelled = true;
      for (const t of loaded.values()) t.dispose();
    };
  }, [items, gl]);
  return textures;
}

/**
 * The ring of gallery panels around the spine. Items sit on a helix; the active
 * item lands at a fixed front position and its neighbours remain visible at an
 * angle on both sides. Every transform is damped per frame.
 */
export function PanelRing({ desktop, reducedMotion, mode }: { desktop: boolean; reducedMotion: boolean; mode: SceneMode }) {
  const textures = useCoverTextures(featured);
  const geometry = useMemo(() => new THREE.PlaneGeometry(PANEL_W, PANEL_H), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Read gallery state through a ref so travel never re-renders the scene tree.
  const gallery = useRef(galleryStore.getState());
  const itemsRef = useRef(galleryStore.items());
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    return galleryStore.subscribe(() => {
      gallery.current = galleryStore.getState();
      itemsRef.current = galleryStore.items();
      invalidate();
    });
  }, [invalidate]);

  return (
    <group>
      {featured.map((item) => (
        <Panel
          key={item.id}
          item={item}
          geometry={geometry}
          texture={textures.get(item.id) ?? null}
          gallery={gallery}
          itemsRef={itemsRef}
          desktop={desktop}
          reducedMotion={reducedMotion}
          mode={mode}
        />
      ))}
    </group>
  );
}

const corners = [
  new THREE.Vector3(-PANEL_W / 2, PANEL_H / 2, 0),
  new THREE.Vector3(PANEL_W / 2, PANEL_H / 2, 0),
  new THREE.Vector3(PANEL_W / 2, -PANEL_H / 2, 0),
  new THREE.Vector3(-PANEL_W / 2, -PANEL_H / 2, 0),
];
const tmp = new THREE.Vector3();
const lastRect = { l: -1, t: -1, w: -1, h: -1 };

/** Project the active panel to CSS pixels so the HTML title can sit exactly on it. */
function publishRect(group: THREE.Group, camera: THREE.Camera, width: number, height: number) {
  const el = document.getElementById(HUD_ELEMENT_ID);
  if (!el) return;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  group.updateMatrixWorld();
  for (const c of corners) {
    tmp.copy(c).applyMatrix4(group.matrixWorld).project(camera);
    const sx = (tmp.x * 0.5 + 0.5) * width;
    const sy = (-tmp.y * 0.5 + 0.5) * height;
    minX = Math.min(minX, sx);
    maxX = Math.max(maxX, sx);
    minY = Math.min(minY, sy);
    maxY = Math.max(maxY, sy);
  }
  const l = Math.round(minX),
    t = Math.round(minY),
    w = Math.round(maxX - minX),
    h = Math.round(maxY - minY);
  if (l === lastRect.l && t === lastRect.t && w === lastRect.w && h === lastRect.h) return;
  Object.assign(lastRect, { l, t, w, h });
  el.style.setProperty("--panel-left", `${l}px`);
  el.style.setProperty("--panel-top", `${t}px`);
  el.style.setProperty("--panel-width", `${w}px`);
  el.style.setProperty("--panel-height", `${h}px`);
}

function Panel({
  item,
  geometry,
  texture,
  gallery,
  itemsRef,
  desktop,
  reducedMotion,
  mode,
}: {
  item: GalleryItem;
  geometry: THREE.PlaneGeometry;
  texture: THREE.Texture | null;
  gallery: React.RefObject<ReturnType<typeof galleryStore.getState>>;
  itemsRef: React.RefObject<GalleryItem[]>;
  desktop: boolean;
  reducedMotion: boolean;
  mode: SceneMode;
}) {
  const router = useRouter();
  const group = useRef<THREE.Group>(null);
  const cover = useMemo(() => createPanelMaterial({ aspect: 1.6, radius: 0.07 }), []);
  const slab = useMemo(() => createPanelMaterial({ aspect: 1.6, radius: 0.075, tint: "#081e1b", rim: 0.25 }), []);
  const time = useRef(0);
  const current = useRef<Target>({ x: 0, y: -3, z: -RING_RADIUS, rotY: 0, rotZ: 0, scale: 0.9, opacity: 0, active: 0 });
  const hover = useRef(false);
  const size = useThree((s) => s.size);

  useEffect(() => {
    cover.uniforms.uMap.value = texture;
    cover.uniforms.uHasMap.value = texture ? 1 : 0;
    cover.material.needsUpdate = true;
  }, [texture, cover]);

  useEffect(
    () => () => {
      cover.material.dispose();
      slab.material.dispose();
    },
    [cover, slab],
  );

  useFrame(({ camera }, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    time.current += dt;
    const g = group.current;
    if (!g) return;

    const items = itemsRef.current;
    const n = items.length;
    const myIndex = items.findIndex((it) => it.id === item.id);
    const inFilter = myIndex >= 0;
    const k = inFilter ? ringOffset(gallery.current.activeIndex, myIndex, n) : 99;
    const t = computeTarget(k, n, mode, desktop, size.width / size.height);

    const lambda = reducedMotion ? 80 : 4.2;
    const c = current.current;
    c.x = damp(c.x, t.x, lambda, dt);
    c.y = damp(c.y, t.y, lambda, dt);
    c.z = damp(c.z, t.z, lambda, dt);
    c.rotY = damp(c.rotY, t.rotY, lambda, dt);
    c.rotZ = damp(c.rotZ, t.rotZ, lambda, dt);
    c.scale = damp(c.scale, t.scale * (hover.current && k === 0 && mode === "gallery" ? 1.012 : 1), lambda, dt);
    c.opacity = damp(c.opacity, t.opacity, lambda * 1.2, dt);
    c.active = damp(c.active, t.active, lambda, dt);

    g.position.set(c.x, c.y, c.z);
    g.rotation.set(0, c.rotY, c.rotZ);
    g.scale.setScalar(c.scale);
    g.visible = c.opacity > 0.01;

    cover.uniforms.uOpacity.value = c.opacity;
    cover.uniforms.uActive.value = c.active;
    cover.uniforms.uTime.value = time.current;
    slab.uniforms.uOpacity.value = c.opacity * 0.85;
    slab.uniforms.uActive.value = c.active;
    slab.uniforms.uTime.value = time.current;

    if (k === 0 && mode === "gallery") publishRect(g, camera, size.width, size.height);
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (mode !== "gallery") return;
    const items = itemsRef.current;
    const myIndex = items.findIndex((it) => it.id === item.id);
    if (myIndex < 0) return;
    if (myIndex === gallery.current.activeIndex) {
      galleryStore.markNavigation(true);
      router.push(item.href);
    } else {
      galleryStore.setIndex(myIndex);
    }
  };

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (mode !== "gallery") return;
    hover.current = true;
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    hover.current = false;
    document.body.style.cursor = "";
  };

  return (
    <group ref={group} visible={false}>
      <mesh geometry={geometry} position={[0, 0, -0.06]} scale={[1.008, 1.013, 1]} renderOrder={1}>
        <primitive object={slab.material} attach="material" />
      </mesh>
      <mesh geometry={geometry} onClick={onClick} onPointerOver={onOver} onPointerOut={onOut} renderOrder={2}>
        <primitive object={cover.material} attach="material" />
      </mesh>
    </group>
  );
}
