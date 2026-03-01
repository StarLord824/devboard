"use client";

// CanvasLayers — renders the 4 stacked canvas elements
// and wires up the engine hook with the Yjs-backed element state (Phase 1: local Map).

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import type { CanvasElement } from "@/lib/canvas-types";
import { useCanvasEngine, COLOR_PALETTE } from "./CanvasEngine";
import { useCanvasStore } from "@/stores/canvasStore";
import { ToolType, BackgroundPattern } from "@/lib/canvas-types";
import { nanoid } from "nanoid";
import Toolbar from "./Toolbar";
import SettingsPanel from "./SettingsPanel";
import Minimap from "./Minimap";
import ZoomControls from "./ZoomControls";

const LAYER_STYLE: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  touchAction: "none",
};

export default function CanvasLayers({ boardId }: { boardId: string }) {
  // ── Phase 1: local state (will be replaced by Yjs Y.Map in Phase 4) ──────
  const [elements, setElements] = useState<Map<string, CanvasElement>>(
    new Map(),
  );
  const [elementOrder, setElementOrder] = useState<string[]>([]);

  const onCommitElement = useCallback((el: CanvasElement) => {
    setElements((prev) => new Map(prev).set(el.id, el));
    setElementOrder((prev) => [...prev, el.id]);
  }, []);

  const onUpdateElement = useCallback(
    (id: string, partial: Partial<CanvasElement>) => {
      setElements((prev) => {
        const next = new Map(prev);
        const existing = next.get(id);
        if (existing) next.set(id, { ...existing, ...partial });
        return next;
      });
    },
    [],
  );

  const onDeleteElements = useCallback((ids: string[]) => {
    setElements((prev) => {
      const next = new Map(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setElementOrder((prev) => prev.filter((id) => !ids.includes(id)));
  }, []);

  const engine = useCanvasEngine({
    elements,
    elementOrder,
    onCommitElement,
    onUpdateElement,
    onDeleteElements,
  });

  const { settingsPanelOpen } = useCanvasStore();

  // Minimap visibility on zoom/scroll
  const [showMinimap, setShowMinimap] = useState(false);
  const minimapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerMinimap = useCallback(() => {
    setShowMinimap(true);
    if (minimapTimer.current) clearTimeout(minimapTimer.current);
    minimapTimer.current = setTimeout(() => setShowMinimap(false), 2000);
  }, []);

  // Wrap onWheel to trigger minimap visibility
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      engine.onWheel(e);
      triggerMinimap();
    },
    [engine, triggerMinimap],
  );

  return (
    <div
      ref={engine.containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ cursor: engine.getCursor() }}
    >
      {/* Layer stack — lowest z-index first */}
      <canvas ref={engine.staticRef} style={{ ...LAYER_STYLE, zIndex: 1 }} />
      <canvas ref={engine.activeRef} style={{ ...LAYER_STYLE, zIndex: 2 }} />
      <canvas ref={engine.cursorRef} style={{ ...LAYER_STYLE, zIndex: 3 }} />
      <canvas
        ref={engine.overlayRef}
        style={{ ...LAYER_STYLE, zIndex: 4 }}
        onWheel={handleWheel}
        onMouseDown={engine.onMouseDown}
        onMouseMove={engine.onMouseMove}
        onMouseUp={engine.onMouseUp}
        onMouseLeave={engine.onMouseUp}
      />

      {/* Toolbar */}
      <Toolbar
        strokeColor={engine.strokeColor}
        onStrokeColorChange={engine.setStrokeColor}
        strokeWidth={engine.strokeWidth}
        onStrokeWidthChange={engine.setStrokeWidth}
        lineDash={engine.lineDash}
        onLineDashChange={engine.setLineDash}
      />

      {/* Zoom Controls */}
      <ZoomControls />

      {/* Settings Panel */}
      {settingsPanelOpen && <SettingsPanel />}

      {/* Minimap — appears temporarily when zooming/panning */}
      {showMinimap && (
        <Minimap elements={elements} elementOrder={elementOrder} />
      )}
    </div>
  );
}
