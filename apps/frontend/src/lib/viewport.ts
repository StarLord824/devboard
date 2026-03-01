// Viewport coordinate transform utilities.
// All canvas elements are stored in WORLD coordinates.
// Rendering converts world → screen. Mouse events convert screen → world.

import type { Camera } from "./canvas-types";

/**
 * Convert a world coordinate to a screen (pixel) coordinate.
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: Camera,
  zoom: number,
): { x: number; y: number } {
  return {
    x: (worldX - camera.x) * zoom,
    y: (worldY - camera.y) * zoom,
  };
}

/**
 * Convert a screen (pixel) coordinate to a world coordinate.
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: Camera,
  zoom: number,
): { x: number; y: number } {
  return {
    x: screenX / zoom + camera.x,
    y: screenY / zoom + camera.y,
  };
}

/**
 * Clamp zoom to practical limits.
 */
export function clampZoom(zoom: number): number {
  return Math.min(Math.max(zoom, 0.05), 20);
}

/**
 * Get the world bounding box of the current viewport.
 */
export function getViewportBounds(
  width: number,
  height: number,
  camera: Camera,
  zoom: number,
) {
  return {
    left: camera.x,
    top: camera.y,
    right: camera.x + width / zoom,
    bottom: camera.y + height / zoom,
  };
}

/**
 * Check if an element's bounding box intersects the viewport
 * (used for viewport culling — skip off-screen elements).
 */
export function isInViewport(
  elX: number,
  elY: number,
  elW: number,
  elH: number,
  viewportBounds: ReturnType<typeof getViewportBounds>,
  padding = 50,
): boolean {
  return (
    elX + elW + padding >= viewportBounds.left &&
    elX - padding <= viewportBounds.right &&
    elY + elH + padding >= viewportBounds.top &&
    elY - padding <= viewportBounds.bottom
  );
}
