import type { SceneMode } from "@/lib/sceneStore";

/** Panel size in world units (16:10, like the cover artwork). */
export const PANEL_W = 5.0;
export const PANEL_H = PANEL_W / 1.6;
export const RING_RADIUS = 5.2;

export interface Target {
  x: number;
  y: number;
  z: number;
  rotY: number;
  rotZ: number;
  scale: number;
  opacity: number;
  active: number;
}

/**
 * Where a panel with ring offset `k` (0 = active, ±1 = neighbours) should be,
 * per scene mode and layout. Pure function so it can be unit-tested.
 */
export function computeTarget(k: number, n: number, mode: SceneMode, desktop: boolean, aspect = 1.6): Target {
  const step = (Math.PI * 2) / Math.max(n, 6);
  const far = Math.abs(k) >= 3 || k === 99;

  if (mode === "ambient") {
    const theta = k * step;
    return {
      x: 0.6 + Math.sin(theta) * (RING_RADIUS + 1.5),
      y: -0.6 - k * 0.35,
      z: Math.cos(theta) * (RING_RADIUS + 1.5) - (RING_RADIUS + 5),
      rotY: theta,
      rotZ: 0,
      scale: 0.85,
      opacity: far ? 0 : 0.1,
      active: 0,
    };
  }

  if (mode === "detail") {
    // Below desktop the page shows the cover in HTML, so the panels step aside entirely.
    if (!desktop) return { x: 0, y: 2, z: -6, rotY: 0, rotZ: 0, scale: 0.6, opacity: 0, active: 0 };
    if (k === 0) {
      return { x: 3.1, y: 0.05, z: 0.3, rotY: -0.38, rotZ: 0.01, scale: 0.88, opacity: 1, active: 1 };
    }
    const theta = k * step;
    const cx = 3.1;
    return {
      x: cx + Math.sin(theta) * RING_RADIUS,
      y: -k * 0.45,
      z: Math.cos(theta) * RING_RADIUS - RING_RADIUS + 0.4,
      rotY: theta - 0.36,
      rotZ: 0,
      scale: 0.9,
      opacity: far ? 0 : Math.abs(k) === 1 ? 0.22 : 0.08,
      active: 0,
    };
  }

  // gallery
  const theta = k * step;
  const center = desktop ? { x: -0.35, y: -0.15, z: 1.3 } : { x: 0, y: 0.85, z: 1.2 };
  const radius = desktop ? RING_RADIUS : RING_RADIUS * 0.75;
  // Phones and tablets: size the panel from the viewport aspect so it fills ~55-75% of the width.
  const scale = desktop ? 1 : Math.min(0.85, Math.max(0.62, 0.45 + aspect * 0.45));
  const x = center.x + Math.sin(theta) * radius;
  const z = center.z + Math.cos(theta) * radius - radius;
  const y = center.y - k * 0.4;
  const opacity = far ? 0 : k === 0 ? 1 : Math.abs(k) === 1 ? 0.8 : 0.45;
  return {
    x,
    y,
    z,
    rotY: theta + (k === 0 && desktop ? -0.05 : 0),
    rotZ: k === 0 ? (desktop ? 0.004 : 0) : -k * 0.012,
    scale: k === 0 ? scale : scale * 0.9,
    opacity,
    active: k === 0 ? 1 : 0,
  };
}
