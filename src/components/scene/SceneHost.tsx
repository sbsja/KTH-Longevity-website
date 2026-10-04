"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Component, useEffect, type ReactNode } from "react";
import { findItemByHref } from "@/content/featured";
import { galleryStore } from "@/lib/galleryStore";
import { sceneStore, useSceneState } from "@/lib/sceneStore";
import { DESKTOP_QUERY, REDUCED_MOTION_QUERY, useMediaQuery } from "@/lib/useMediaQuery";
import styles from "./SceneHost.module.css";

/* The WebGL scene is loaded only in the browser, after the HTML is interactive. */
const Scene = dynamic(() => import("./Scene"), { ssr: false });

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    if (!gl) return false;
    // Software renderers tend to be too slow for a full-viewport scene.
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
    if (/swiftshader|software/i.test(renderer)) return false;
    return true;
  } catch {
    return false;
  }
}

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("3D scene unavailable, using the HTML gallery.", error);
    sceneStore.setStatus("unavailable");
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Hosts the persistent 3D scene behind every page. It never unmounts between
 * routes, which is what keeps the gallery position and the visual continuity
 * when a panel opens into its page.
 */
export function SceneHost() {
  const pathname = usePathname();
  const { status } = useSceneState();
  const desktop = useMediaQuery(DESKTOP_QUERY, true);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY, false);

  useEffect(() => {
    sceneStore.setDesktop(desktop);
  }, [desktop]);
  useEffect(() => {
    sceneStore.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  // Route → scene mode. Event pages keep their panel in view; other pages calm the scene.
  useEffect(() => {
    const isHome = pathname === "/";
    const item = isHome ? undefined : findItemByHref(pathname);
    if (item) galleryStore.focusItem(item.id);
    const mode = isHome ? "gallery" : item && item.kind === "event" ? "detail" : "ambient";
    sceneStore.setMode(mode);
    document.documentElement.dataset.scenePage = isHome ? "true" : "false";
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.scene = status;
  }, [status]);

  useEffect(() => {
    if (sceneStore.getState().status !== "idle") return;
    sceneStore.setStatus(webglAvailable() ? "loading" : "unavailable");
  }, []);

  // Pause rendering when the canvas has scrolled out of view or the tab is hidden.
  useEffect(() => {
    const onVisibility = () => sceneStore.setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const showScene = status === "loading" || status === "ready";

  return (
    <div className={styles.host} aria-hidden="true" data-status={status}>
      <div className={styles.backdrop} />
      {showScene && (
        <SceneErrorBoundary>
          <Scene />
        </SceneErrorBoundary>
      )}
    </div>
  );
}
