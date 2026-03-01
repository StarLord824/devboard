"use client";

// CanvasEngine — The core rendering engine and event handler.
// Uses 4 stacked HTML5 canvases:
//   STATIC  (z=1) — committed elements. Redrawn on state or viewport change.
//   ACTIVE  (z=2) — element currently being drawn. Cleared every mousemove.
//   CURSOR  (z=3) — remote collaborator cursors (Phase 4).
//   OVERLAY (z=4) — selection handles, resize knobs.
//
// RENDERING FIX: renderAll is stored in a ref so the RAF callback always
// calls the latest version, avoiding stale closure bugs.

import { useEffect, useRef, useCallback, useState } from "react";
import type { CanvasElement, ToolType } from "@/lib/canvas-types";
import {
  screenToWorld,
  clampZoom,
  getViewportBounds,
  isInViewport,
} from "@/lib/viewport";
import { renderElement } from "./elements/renderer";
import { simplifyPath } from "@/lib/simplify-path";
import { useCanvasStore } from "@/stores/canvasStore";
import { nanoid } from "nanoid";

interface UseCanvasEngineOptions {
  elements: Map<string, CanvasElement>;
  elementOrder: string[];
  onCommitElement: (element: CanvasElement) => void;
  onUpdateElement: (id: string, partial: Partial<CanvasElement>) => void;
  onDeleteElements: (ids: string[]) => void;
}

export const COLOR_PALETTE = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#64748b",
  "#6b7280",
];

const DEFAULT_TOOL_STYLE = {
  stroke: "#000000",
  fill: "transparent",
  strokeWidth: 2,
  opacity: 1,
  lineDash: [] as number[],
};

export function useCanvasEngine({
  elements,
  elementOrder,
  onCommitElement,
  onUpdateElement,
  onDeleteElements,
}: UseCanvasEngineOptions) {
  // ── Canvas refs ─────────────────────────────────────────────────────────
  const staticRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Zustand state ───────────────────────────────────────────────────────
  const activeTool = useCanvasStore((s) => s.activeTool);
  const zoom = useCanvasStore((s) => s.zoom);
  const camera = useCanvasStore((s) => s.camera);
  const selectedElementIds = useCanvasStore((s) => s.selectedElementIds);
  const isPanMode = useCanvasStore((s) => s.isPanMode);
  const canvasColor = useCanvasStore((s) => s.canvasColor);
  const backgroundPattern = useCanvasStore((s) => s.backgroundPattern);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const setCamera = useCanvasStore((s) => s.setCamera);
  const setSelectedElementIds = useCanvasStore((s) => s.setSelectedElementIds);
  const setIsPanMode = useCanvasStore((s) => s.setIsPanMode);
  const clearSelection = useCanvasStore((s) => s.clearSelection);

  // ── Drawing state (refs to avoid re-renders during drawing) ─────────────
  const isDrawing = useRef(false);
  const drawStart = useRef<{ wx: number; wy: number } | null>(null);
  const currentPoints = useRef<[number, number][]>([]);
  const activeElement = useRef<CanvasElement | null>(null);

  // ── Pan state ───────────────────────────────────────────────────────────
  const isPanning = useRef(false);
  const panStart = useRef<{
    sx: number;
    sy: number;
    cx: number;
    cy: number;
  } | null>(null);

  // ── Stroke settings ─────────────────────────────────────────────────────
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDERING — using a ref to always have the latest render function
  // ══════════════════════════════════════════════════════════════════════════

  const renderAllRef = useRef<() => void>(() => {});
  const rafId = useRef<number>(0);
  const isDirty = useRef(false);

  // markDirty schedules a single RAF paint. The RAF callback reads from
  // renderAllRef, which always points to the latest renderAll closure.
  const markDirty = useCallback(() => {
    if (!isDirty.current) {
      isDirty.current = true;
      rafId.current = requestAnimationFrame(() => {
        isDirty.current = false;
        renderAllRef.current();
      });
    }
  }, []);

  // Update renderAllRef every time dependencies change
  useEffect(() => {
    renderAllRef.current = () => {
      // ── Static Layer ──────────────────────────────────────────────────
      const staticCanvas = staticRef.current;
      if (staticCanvas) {
        const ctx = staticCanvas.getContext("2d");
        if (ctx) {
          const w = staticCanvas.width;
          const h = staticCanvas.height;
          ctx.clearRect(0, 0, w, h);

          // Background fill
          ctx.fillStyle = canvasColor;
          ctx.fillRect(0, 0, w, h);

          // Background pattern
          if (backgroundPattern !== "plain") {
            const spacing = 30 * zoom;
            const offsetX =
              (((-camera.x * zoom) % spacing) + spacing) % spacing;
            const offsetY =
              (((-camera.y * zoom) % spacing) + spacing) % spacing;

            if (backgroundPattern === "grid") {
              ctx.save();
              ctx.strokeStyle = "rgba(0,0,0,0.08)";
              ctx.lineWidth = 1;
              for (let x = offsetX; x < w; x += spacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
              }
              for (let y = offsetY; y < h; y += spacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
              }
              ctx.restore();
            } else if (backgroundPattern === "dots") {
              ctx.save();
              ctx.fillStyle = "rgba(0,0,0,0.15)";
              for (let x = offsetX; x < w; x += spacing) {
                for (let y = offsetY; y < h; y += spacing) {
                  ctx.beginPath();
                  ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
              ctx.restore();
            }
          }

          // Draw committed elements
          const viewBounds = getViewportBounds(w, h, camera, zoom);
          ctx.save();
          ctx.scale(zoom, zoom);
          ctx.translate(-camera.x, -camera.y);
          for (const id of elementOrder) {
            const el = elements.get(id);
            if (!el) continue;
            if (!isInViewport(el.x, el.y, el.width, el.height, viewBounds))
              continue;
            renderElement(ctx, el);
          }
          ctx.restore();
        }
      }

      // ── Active Layer (currently drawn stroke/shape) ───────────────────
      const activeCanvas = activeRef.current;
      if (activeCanvas) {
        const ctx = activeCanvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
          const el = activeElement.current;
          if (el) {
            ctx.save();
            ctx.scale(zoom, zoom);
            ctx.translate(-camera.x, -camera.y);
            renderElement(ctx, el);
            ctx.restore();
          }
        }
      }

      // ── Overlay Layer (selection handles) ─────────────────────────────
      const overlayCanvas = overlayRef.current;
      if (overlayCanvas) {
        const ctx = overlayCanvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          if (selectedElementIds.length > 0) {
            ctx.save();
            ctx.scale(zoom, zoom);
            ctx.translate(-camera.x, -camera.y);
            for (const id of selectedElementIds) {
              const el = elements.get(id);
              if (!el) continue;
              const pad = 4 / zoom;
              const x = el.x - pad;
              const y = el.y - pad;
              const bw = el.width + pad * 2;
              const bh = el.height + pad * 2;
              const hs = 8 / zoom;
              ctx.strokeStyle = "#3b82f6";
              ctx.lineWidth = 1.5 / zoom;
              ctx.setLineDash([]);
              ctx.strokeRect(x, y, bw, bh);
              ctx.fillStyle = "#ffffff";
              for (const [hx, hy] of [
                [x, y],
                [x + bw, y],
                [x, y + bh],
                [x + bw, y + bh],
                [x + bw / 2, y],
                [x + bw / 2, y + bh],
                [x, y + bh / 2],
                [x + bw, y + bh / 2],
              ]) {
                ctx.beginPath();
                ctx.rect(hx - hs / 2, hy - hs / 2, hs, hs);
                ctx.fill();
                ctx.stroke();
              }
            }
            ctx.restore();
          }
        }
      }
    };
  }, [
    elements,
    elementOrder,
    zoom,
    camera,
    canvasColor,
    backgroundPattern,
    selectedElementIds,
  ]);

  // Trigger repaint whenever any rendering dependency changes
  useEffect(() => {
    markDirty();
  }, [
    elements,
    elementOrder,
    zoom,
    camera,
    canvasColor,
    backgroundPattern,
    selectedElementIds,
    markDirty,
  ]);

  // ── Resize handler ──────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      for (const ref of [staticRef, activeRef, cursorRef, overlayRef]) {
        if (ref.current) {
          ref.current.width = width;
          ref.current.height = height;
        }
      }
      markDirty();
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [markDirty]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENT HANDLERS
  // ══════════════════════════════════════════════════════════════════════════

  const getWorldPos = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const canvas = overlayRef.current;
      if (!canvas) return { wx: 0, wy: 0 };
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const { x: wx, y: wy } = screenToWorld(sx, sy, camera, zoom);
      return { wx, wy };
    },
    [camera, zoom],
  );

  // ── Keyboard Shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsPanMode(true);
      }
      if (e.key === "Escape") clearSelection();
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        setSelectedElementIds(elementOrder);
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElementIds.length > 0) {
          onDeleteElements(selectedElementIds);
          clearSelection();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        const dupes: CanvasElement[] = [];
        for (const id of selectedElementIds) {
          const el = elements.get(id);
          if (!el) continue;
          dupes.push({
            ...el,
            id: nanoid(),
            x: el.x + 20,
            y: el.y + 20,
            createdAt: Date.now(),
          });
        }
        dupes.forEach(onCommitElement);
        setSelectedElementIds(dupes.map((d) => d.id));
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsPanMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [
    selectedElementIds,
    elementOrder,
    elements,
    onDeleteElements,
    onCommitElement,
    clearSelection,
    setSelectedElementIds,
    setIsPanMode,
  ]);

  // ── Wheel Zoom (zoom toward cursor) ────────────────────────────────────
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const canvas = overlayRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wx = sx / zoom + camera.x;
      const wy = sy / zoom + camera.y;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newZoom = clampZoom(zoom * factor);
      setZoom(newZoom);
      setCamera({ x: wx - sx / newZoom, y: wy - sy / newZoom });
    },
    [zoom, camera, setZoom, setCamera],
  );

  // ── Mouse Down ─────────────────────────────────────────────────────────
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const tool = isPanMode ? "pan" : activeTool;
      const { wx, wy } = getWorldPos(e);

      // Pan
      if (tool === "pan") {
        isPanning.current = true;
        panStart.current = {
          sx: e.clientX,
          sy: e.clientY,
          cx: camera.x,
          cy: camera.y,
        };
        return;
      }

      // Select
      if (tool === "select") {
        const reversed = [...elementOrder].reverse();
        for (const id of reversed) {
          const el = elements.get(id);
          if (!el) continue;
          if (
            wx >= el.x &&
            wx <= el.x + el.width &&
            wy >= el.y &&
            wy <= el.y + el.height
          ) {
            if (e.shiftKey) {
              useCanvasStore.getState().addSelectedElementId(id);
            } else {
              setSelectedElementIds([id]);
            }
            return;
          }
        }
        clearSelection();
        return;
      }

      // Start drawing
      isDrawing.current = true;
      drawStart.current = { wx, wy };
      currentPoints.current = [[wx, wy]];

      const elType =
        tool === "eraser" ? "path" : (tool as CanvasElement["type"]);
      const newEl: CanvasElement = {
        id: nanoid(),
        type: elType,
        x: wx,
        y: wy,
        width: 0,
        height: 0,
        rotation: 0,
        style: {
          stroke: strokeColor,
          fill: "transparent",
          strokeWidth: strokeWidth,
          opacity: 1,
          lineDash: [],
        },
        points: elType === "path" ? [[wx, wy]] : undefined,
        createdBy: "local",
        createdAt: Date.now(),
      };
      activeElement.current = newEl;
      markDirty();
    },
    [
      activeTool,
      isPanMode,
      camera,
      elements,
      elementOrder,
      strokeColor,
      strokeWidth,
      getWorldPos,
      clearSelection,
      setSelectedElementIds,
      markDirty,
    ],
  );

  // ── Mouse Move ─────────────────────────────────────────────────────────
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Pan
      if (isPanning.current && panStart.current) {
        const dx = (e.clientX - panStart.current.sx) / zoom;
        const dy = (e.clientY - panStart.current.sy) / zoom;
        setCamera({ x: panStart.current.cx - dx, y: panStart.current.cy - dy });
        return;
      }
      if (!isDrawing.current || !activeElement.current || !drawStart.current)
        return;
      const { wx, wy } = getWorldPos(e);
      const startW = drawStart.current;
      const el = activeElement.current;

      if (el.type === "path") {
        currentPoints.current.push([wx, wy]);
        activeElement.current = { ...el, points: [...currentPoints.current] };
      } else {
        const x = Math.min(startW.wx, wx);
        const y = Math.min(startW.wy, wy);
        const w = Math.abs(wx - startW.wx);
        const h = Math.abs(wy - startW.wy);
        activeElement.current = { ...el, x, y, width: w, height: h };
      }
      markDirty();
    },
    [zoom, getWorldPos, setCamera, markDirty],
  );

  // ── Mouse Up ───────────────────────────────────────────────────────────
  const onMouseUp = useCallback(() => {
    if (isPanning.current) {
      isPanning.current = false;
      panStart.current = null;
      return;
    }
    if (!isDrawing.current || !activeElement.current) return;
    isDrawing.current = false;

    let el = activeElement.current;
    activeElement.current = null;

    // Simplify freehand path
    if (el.type === "path" && el.points && el.points.length > 2) {
      const simplified = simplifyPath(el.points);
      const xs = simplified.map((p) => p[0]);
      const ys = simplified.map((p) => p[1]);
      el = {
        ...el,
        points: simplified,
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
    }

    // Discard tiny accidental shapes (but keep all paths)
    if (el.type !== "path" && el.width < 2 && el.height < 2) {
      markDirty();
      return;
    }

    onCommitElement(el);
    markDirty();
  }, [onCommitElement, markDirty]);

  const getCursor = () => {
    if (isPanMode || isPanning.current) return "grab";
    if (activeTool === "pan") return "grab";
    if (activeTool === "eraser") return "cell";
    if (activeTool === "text") return "text";
    if (activeTool === "select") return "default";
    return "crosshair";
  };

  return {
    containerRef,
    staticRef,
    activeRef,
    cursorRef,
    overlayRef,
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    getCursor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
  };
}
