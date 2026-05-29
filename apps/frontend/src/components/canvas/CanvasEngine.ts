"use client";

// CanvasEngine — The core rendering engine and event handler.
// Uses 4 stacked HTML5 canvases.

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
import { getThemeColors } from "@/lib/color-utils";

interface UseCanvasEngineOptions {
  elements: Map<string, CanvasElement>;
  elementOrder: string[];
  onCommitElement: (element: CanvasElement) => void;
  onUpdateElement: (id: string, partial: Partial<CanvasElement>) => void;
  onDeleteElements: (ids: string[]) => void;
  onAwarenessUpdate?: (pos: { x: number; y: number }) => void;
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

// Canvas boundaries
const CANVAS_BOUNDS = 5000;
const clampCamera = (val: number) =>
  Math.max(-CANVAS_BOUNDS, Math.min(CANVAS_BOUNDS, val));

export function useCanvasEngine({
  elements,
  elementOrder,
  onCommitElement,
  onUpdateElement,
  onDeleteElements,
  onAwarenessUpdate,
}: UseCanvasEngineOptions) {
  const staticRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Drawing state
  const isDrawing = useRef(false);
  const drawStart = useRef<{ wx: number; wy: number } | null>(null);
  const currentPoints = useRef<[number, number][]>([]);
  const activeElement = useRef<CanvasElement | null>(null);

  // Pan state
  const isPanning = useRef(false);
  const panStart = useRef<{
    sx: number;
    sy: number;
    cx: number;
    cy: number;
  } | null>(null);

  // Drag & Resize state
  const dragAction = useRef<{
    mode: "drag" | "resize";
    handle?: string; // e.g., 'nw', 'se'
    startX: number;
    startY: number;
    originalElements: Map<string, CanvasElement>;
  } | null>(null);

  // ── Stroke settings ─────────────────────────────────────────────────────
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [lineDash, setLineDash] = useState<number[]>([]);

  const renderAllRef = useRef<() => void>(() => {});
  const rafId = useRef<number>(0);
  const isDirty = useRef(false);

  const markDirty = useCallback(() => {
    if (!isDirty.current) {
      isDirty.current = true;
      rafId.current = requestAnimationFrame(() => {
        isDirty.current = false;
        renderAllRef.current();
      });
    }
  }, []);

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
            const theme = getThemeColors(canvasColor);
            const spacing = 30 * zoom;
            const offsetX =
              (((-camera.x * zoom) % spacing) + spacing) % spacing;
            const offsetY =
              (((-camera.y * zoom) % spacing) + spacing) % spacing;

            if (backgroundPattern === "grid") {
              ctx.save();
              ctx.strokeStyle = theme.patternStroke;
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
              ctx.fillStyle = theme.patternDotFill;
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

          const viewBounds = getViewportBounds(w, h, camera, zoom);
          ctx.save();
          ctx.scale(zoom, zoom);
          ctx.translate(-camera.x, -camera.y);
          for (const id of elementOrder) {
            const el = elements.get(id);
            if (!el) continue;
            // hide elements currently being dragged/resized (rendered in active layer instead)
            if (
              dragAction.current &&
              dragAction.current.originalElements.has(id)
            )
              continue;

            if (!isInViewport(el.x, el.y, el.width, el.height, viewBounds))
              continue;
            renderElement(ctx, el);
          }
          ctx.restore();
        }
      }

      // ── Active Layer ───────────────────────────────────────────────────
      const activeCanvas = activeRef.current;
      if (activeCanvas) {
        const ctx = activeCanvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);

          ctx.save();
          ctx.scale(zoom, zoom);
          ctx.translate(-camera.x, -camera.y);

          // Currently drawn stroke
          if (activeElement.current) {
            renderElement(ctx, activeElement.current);
          }

          // Currently dragged/resized elements
          if (dragAction.current) {
            for (const id of selectedElementIds) {
              const el = elements.get(id);
              if (el) renderElement(ctx, el);
            }
          }

          ctx.restore();
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
              // Handles
              for (const [hx, hy] of [
                [x, y],
                [x + bw / 2, y],
                [x + bw, y],
                [x, y + bh / 2],
                [x + bw, y + bh / 2],
                [x, y + bh],
                [x + bw / 2, y + bh],
                [x + bw, y + bh],
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

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

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

  // Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsPanMode(true);
      }

      if (!e.ctrlKey && !e.metaKey) {
        const k = e.key.toLowerCase();
        if (k === "v") useCanvasStore.getState().setActiveTool("select");
        if (k === "p") useCanvasStore.getState().setActiveTool("pen");
        if (k === "r") useCanvasStore.getState().setActiveTool("rect");
        if (k === "o") useCanvasStore.getState().setActiveTool("ellipse");
        if (k === "l") useCanvasStore.getState().setActiveTool("line");
        if (k === "a") useCanvasStore.getState().setActiveTool("arrow");
        if (k === "t") useCanvasStore.getState().setActiveTool("text");
        if (k === "e") useCanvasStore.getState().setActiveTool("eraser");
        if (k === "h") useCanvasStore.getState().setActiveTool("pan");
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

  // Wheel Zoom
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.cancelable) e.preventDefault();
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
      setCamera({
        x: clampCamera(wx - sx / newZoom),
        y: clampCamera(wy - sy / newZoom),
      });
    },
    [zoom, camera, setZoom, setCamera],
  );

  // Hit test handles
  const getHandleAt = (wx: number, wy: number): string | null => {
    if (selectedElementIds.length === 0) return null;
    const hs = 10 / zoom; // slightly larger hit area
    const pad = 4 / zoom;

    // For single selection, check handles
    if (selectedElementIds.length === 1) {
      const el = elements.get(selectedElementIds[0]);
      if (!el) return null;
      const x = el.x - pad;
      const y = el.y - pad;
      const bw = el.width + pad * 2;
      const bh = el.height + pad * 2;

      const handles = [
        { id: "nw", cx: x, cy: y },
        { id: "n", cx: x + bw / 2, cy: y },
        { id: "ne", cx: x + bw, cy: y },
        { id: "w", cx: x, cy: y + bh / 2 },
        { id: "e", cx: x + bw, cy: y + bh / 2 },
        { id: "sw", cx: x, cy: y + bh },
        { id: "s", cx: x + bw / 2, cy: y + bh },
        { id: "se", cx: x + bw, cy: y + bh },
      ];

      for (const h of handles) {
        if (Math.abs(wx - h.cx) <= hs && Math.abs(wy - h.cy) <= hs) {
          return h.id;
        }
      }
    }
    return null;
  };

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
        // 1. Check resize handle
        const handle = getHandleAt(wx, wy);
        if (handle && selectedElementIds.length === 1) {
          const id = selectedElementIds[0];
          const el = elements.get(id);
          if (el) {
            dragAction.current = {
              mode: "resize",
              handle,
              startX: wx,
              startY: wy,
              originalElements: new Map([[id, { ...el }]]),
            };
            markDirty(); // Trigger active layer render
            return;
          }
        }

        // 2. Check drag on existing selection
        const isOverSelected = selectedElementIds.some((id) => {
          const el = elements.get(id);
          if (!el) return false;
          return (
            wx >= el.x &&
            wx <= el.x + el.width &&
            wy >= el.y &&
            wy <= el.y + el.height
          );
        });

        if (isOverSelected) {
          const originals = new Map();
          selectedElementIds.forEach((id) => {
            const el = elements.get(id);
            if (el) originals.set(id, { ...el });
          });
          dragAction.current = {
            mode: "drag",
            startX: wx,
            startY: wy,
            originalElements: originals,
          };
          markDirty();
          return;
        }

        // 3. New selection
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
              // Start drag immediately on new selection
              dragAction.current = {
                mode: "drag",
                startX: wx,
                startY: wy,
                originalElements: new Map([[id, { ...el }]]),
              };
              markDirty();
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

      if (tool === "eraser") {
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
            onDeleteElements([id]);
            return;
          }
        }
        return; // keep isDrawing=true for drag erasing
      }

      const elType = tool === "pen" ? "path" : (tool as CanvasElement["type"]);

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
          lineDash: lineDash,
        },
        points: elType === "path" ? [[wx, wy]] : undefined,
        createdBy: "local",
        createdAt: Date.now(),
      };
      activeElement.current = newEl;
      clearSelection();
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
      selectedElementIds,
      getWorldPos,
      clearSelection,
      setSelectedElementIds,
      onDeleteElements,
      markDirty,
    ],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Always broadcast world-space cursor position to collaborators
      const pos = getWorldPos(e);
      onAwarenessUpdate?.({ x: pos.wx, y: pos.wy });

      // Pan
      if (isPanning.current && panStart.current) {
        const dx = (e.clientX - panStart.current.sx) / zoom;
        const dy = (e.clientY - panStart.current.sy) / zoom;
        setCamera({
          x: clampCamera(panStart.current.cx - dx),
          y: clampCamera(panStart.current.cy - dy),
        });
        return;
      }

      // Drag / Resize
      if (dragAction.current) {
        const { wx, wy } = getWorldPos(e);
        const { mode, handle, startX, startY, originalElements } =
          dragAction.current;
        const dx = wx - startX;
        const dy = wy - startY;

        if (mode === "drag") {
          selectedElementIds.forEach((id) => {
            const orig = originalElements.get(id);
            if (orig) {
              onUpdateElement(id, { x: orig.x + dx, y: orig.y + dy });
            }
          });
        } else if (
          mode === "resize" &&
          handle &&
          selectedElementIds.length === 1
        ) {
          const id = selectedElementIds[0];
          const orig = originalElements.get(id);
          if (orig) {
            let nx = orig.x,
              ny = orig.y,
              nw = orig.width,
              nh = orig.height;

            // Adjust bounds based on handle
            if (handle.includes("e")) nw += dx;
            if (handle.includes("s")) nh += dy;
            if (handle.includes("w")) {
              nx += dx;
              nw -= dx;
            }
            if (handle.includes("n")) {
              ny += dy;
              nh -= dy;
            }

            // Normalize negative dimensions
            if (nw < 0 && orig.type !== "line") {
              nx += nw;
              nw = Math.abs(nw);
            }
            if (nh < 0 && orig.type !== "line") {
              ny += nh;
              nh = Math.abs(nh);
            }

            onUpdateElement(id, { x: nx, y: ny, width: nw, height: nh });
          }
        }
        markDirty();
        return;
      }

      // Drawing or Erasing
      if (!isDrawing.current || !drawStart.current) return;
      const { wx, wy } = getWorldPos(e);

      if (activeTool === "eraser") {
        const toDelete: string[] = [];
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
            toDelete.push(id);
          }
        }
        if (toDelete.length > 0) onDeleteElements(toDelete);
        return;
      }

      const startW = drawStart.current;
      const el = activeElement.current;
      if (!el) return;

      if (el.type === "path") {
        currentPoints.current.push([wx, wy]);
        activeElement.current = { ...el, points: [...currentPoints.current] };
      } else {
        let w = Math.abs(wx - startW.wx);
        let h = Math.abs(wy - startW.wy);

        if (e.shiftKey && (el.type === "rect" || el.type === "ellipse")) {
          const maxDim = Math.max(w, h);
          w = maxDim;
          h = maxDim;
        }

        const x = wx < startW.wx ? startW.wx - w : startW.wx;
        const y = wy < startW.wy ? startW.wy - h : startW.wy;

        activeElement.current = { ...el, x, y, width: w, height: h };
      }
      markDirty();
    },
    [
      zoom,
      getWorldPos,
      setCamera,
      selectedElementIds,
      onUpdateElement,
      markDirty,
      onAwarenessUpdate,
    ],
  );

  const onMouseUp = useCallback(() => {
    if (isPanning.current) {
      isPanning.current = false;
      panStart.current = null;
      return;
    }

    if (dragAction.current) {
      dragAction.current = null;
      markDirty();
      return;
    }

    if (!isDrawing.current || !activeElement.current) return;
    isDrawing.current = false;

    let el = activeElement.current;
    activeElement.current = null;

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

    // Discard tiny shapes
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
    if (activeTool === "select") return "default"; // could dynamically show resize arrows
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
    lineDash,
    setLineDash,
  };
}
