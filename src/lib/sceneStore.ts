"use client";

import { useSyncExternalStore } from "react";

export type SceneStatus = "idle" | "loading" | "ready" | "unavailable";
export type SceneMode = "gallery" | "detail" | "ambient";

export interface SceneState {
  status: SceneStatus;
  mode: SceneMode;
  /** prefers-reduced-motion */
  reducedMotion: boolean;
  /** min-width: 1024px, where the scene owns the viewport and the wheel */
  desktop: boolean;
  /** Canvas is on screen (mobile pages scroll past it) */
  visible: boolean;
}

const initial: SceneState = {
  status: "idle",
  mode: "gallery",
  reducedMotion: false,
  desktop: true,
  visible: true,
};

let state: SceneState = initial;
const listeners = new Set<() => void>();

function set(partial: Partial<SceneState>) {
  const next = { ...state, ...partial };
  let changed = false;
  for (const k of Object.keys(partial) as (keyof SceneState)[]) {
    if (next[k] !== state[k]) changed = true;
  }
  if (!changed) return;
  state = next;
  for (const l of listeners) l();
}

export const sceneStore = {
  getState: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  setStatus: (status: SceneStatus) => set({ status }),
  setMode: (mode: SceneMode) => set({ mode }),
  setReducedMotion: (reducedMotion: boolean) => set({ reducedMotion }),
  setDesktop: (desktop: boolean) => set({ desktop }),
  setVisible: (visible: boolean) => set({ visible }),
};

const getServerSnapshot = () => initial;

export function useSceneState(): SceneState {
  return useSyncExternalStore(sceneStore.subscribe, sceneStore.getState, getServerSnapshot);
}
