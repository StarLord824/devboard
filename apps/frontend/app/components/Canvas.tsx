"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Stage, Layer, Rect, Line, Group } from "react-konva";
import Konva from "konva";

// ─── Snapping Config ──────────────────────────────────────
const GRID_SIZE = 20;
const SNAP_THRESHOLD = 8;
const GUIDE_COLOR = "#6366f1";
const GUIDE_DASH = [4, 4];
const GUIDE_STROKE_WIDTH = 1;

// ─── Types ───────────────────────────────────────────────
interface CanvasShape {
  id: string;
  type: "rect" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

interface SnapGuide {
  orientation: "horizontal" | "vertical";
  position: number;
  start: number;
  end: number;
}

interface SnapResult {
  x: number;
  y: number;
  guides: SnapGuide[];
}

const userColor =
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

// ─── Snap Logic ──────────────────────────────────────────

function computeSnap(
  dragging: { x: number; y: number; width: number; height: number },
  others: CanvasShape[],
  gridSize: number,
  threshold: number,
  snapToGrid: boolean,
  snapToObjects: boolean
): SnapResult {
  let snappedX = dragging.x;
  let snappedY = dragging.y;
  const guides: SnapGuide[] = [];
  const dw = dragging.width;
  const dh = dragging.height;

  // ── Grid Snap ──
  if (snapToGrid) {
    snappedX = Math.round(dragging.x / gridSize) * gridSize;
    snappedY = Math.round(dragging.y / gridSize) * gridSize;
  }

  // ── Object Snap (Smart Guides) ──
  if (snapToObjects && others.length > 0) {
    const dragLeft = dragging.x;
    const dragRight = dragging.x + dw;
    const dragCenterX = dragging.x + dw / 2;
    const dragTop = dragging.y;
    const dragBottom = dragging.y + dh;
    const dragCenterY = dragging.y + dh / 2;

    let bestDx: number | null = null;
    let bestDy: number | null = null;
    let bestDistX = threshold + 1;
    let bestDistY = threshold + 1;

    const verticalSnaps: {
      position: number;
      targetShape: CanvasShape;
    }[] = [];
    const horizontalSnaps: {
      position: number;
      targetShape: CanvasShape;
    }[] = [];

    for (const other of others) {
      const ow = other.width;
      const oh = other.height;
      const oLeft = other.x;
      const oRight = other.x + ow;
      const oCenterX = other.x + ow / 2;
      const oTop = other.y;
      const oBottom = other.y + oh;
      const oCenterY = other.y + oh / 2;

      // Vertical alignment checks (x-axis)
      if (Math.abs(dragLeft - oLeft) < threshold)
        verticalSnaps.push({ position: oLeft, targetShape: other });
      if (Math.abs(dragLeft - oRight) < threshold)
        verticalSnaps.push({ position: oRight, targetShape: other });
      if (Math.abs(dragRight - oLeft) < threshold)
        verticalSnaps.push({
          position: oLeft - dw,
          targetShape: other,
        });
      if (Math.abs(dragRight - oRight) < threshold)
        verticalSnaps.push({
          position: oRight - dw,
          targetShape: other,
        });
      if (Math.abs(dragCenterX - oCenterX) < threshold)
        verticalSnaps.push({
          position: oCenterX - dw / 2,
          targetShape: other,
        });

      // Horizontal alignment checks (y-axis)
      if (Math.abs(dragTop - oTop) < threshold)
        horizontalSnaps.push({ position: oTop, targetShape: other });
      if (Math.abs(dragTop - oBottom) < threshold)
        horizontalSnaps.push({ position: oBottom, targetShape: other });
      if (Math.abs(dragBottom - oTop) < threshold)
        horizontalSnaps.push({
          position: oTop - dh,
          targetShape: other,
        });
      if (Math.abs(dragBottom - oBottom) < threshold)
        horizontalSnaps.push({
          position: oBottom - dh,
          targetShape: other,
        });
      if (Math.abs(dragCenterY - oCenterY) < threshold)
        horizontalSnaps.push({
          position: oCenterY - dh / 2,
          targetShape: other,
        });
    }

    // Best vertical snap
    for (const snap of verticalSnaps) {
      const dist = Math.abs(dragging.x - snap.position);
      if (dist < bestDistX) {
        bestDistX = dist;
        bestDx = snap.position;
      }
    }

    // Best horizontal snap
    for (const snap of horizontalSnaps) {
      const dist = Math.abs(dragging.y - snap.position);
      if (dist < bestDistY) {
        bestDistY = dist;
        bestDy = snap.position;
      }
    }

    // Apply & generate guide lines
    if (bestDx !== null) {
      snappedX = bestDx;
      const finalLeft = snappedX;
      const finalRight = snappedX + dw;
      const finalCenterX = snappedX + dw / 2;

      for (const snap of verticalSnaps) {
        if (Math.abs(snap.position - bestDx) < 1) {
          const other = snap.targetShape;
          const ow = other.width;
          const oh = other.height;
          const oLeft = other.x;
          const oRight = other.x + ow;
          const oCenterX = other.x + ow / 2;

          let guideX = oLeft;
          if (Math.abs(finalLeft - oLeft) < 2) guideX = oLeft;
          else if (Math.abs(finalLeft - oRight) < 2) guideX = oRight;
          else if (Math.abs(finalRight - oLeft) < 2) guideX = oLeft;
          else if (Math.abs(finalRight - oRight) < 2) guideX = oRight;
          else if (Math.abs(finalCenterX - oCenterX) < 2)
            guideX = oCenterX;

          const minY = Math.min(snappedY, other.y);
          const maxY = Math.max(snappedY + dh, other.y + oh);

          guides.push({
            orientation: "vertical",
            position: guideX,
            start: minY - 10,
            end: maxY + 10,
          });
        }
      }
    }

    if (bestDy !== null) {
      snappedY = bestDy;
      const finalTop = snappedY;
      const finalBottom = snappedY + dh;
      const finalCenterY = snappedY + dh / 2;

      for (const snap of horizontalSnaps) {
        if (Math.abs(snap.position - bestDy) < 1) {
          const other = snap.targetShape;
          const ow = other.width;
          const oh = other.height;
          const oTop = other.y;
          const oBottom = other.y + oh;
          const oCenterY = other.y + oh / 2;

          let guideY = oTop;
          if (Math.abs(finalTop - oTop) < 2) guideY = oTop;
          else if (Math.abs(finalTop - oBottom) < 2) guideY = oBottom;
          else if (Math.abs(finalBottom - oTop) < 2) guideY = oTop;
          else if (Math.abs(finalBottom - oBottom) < 2) guideY = oBottom;
          else if (Math.abs(finalCenterY - oCenterY) < 2)
            guideY = oCenterY;

          const minX = Math.min(snappedX, other.x);
          const maxX = Math.max(snappedX + dw, other.x + ow);

          guides.push({
            orientation: "horizontal",
            position: guideY,
            start: minX - 10,
            end: maxX + 10,
          });
        }
      }
    }
  }

  return { x: snappedX, y: snappedY, guides };
}

// ─── Component ────────────────────────────────────────────

export default function CanvasBoard({
  slug,
  userName,
}: {
  slug: string;
  userName: string;
}) {
  const [shapes, setShapes] = useState<CanvasShape[]>([]);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapToObjects, setSnapToObjects] = useState(true);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Resize ──
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedShapeId) {
          setShapes((prev) => prev.filter((s) => s.id !== selectedShapeId));
          setSelectedShapeId(null);
        }
      }
      if (e.key === "Escape") {
        setSelectedShapeId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedShapeId]);

  // ── Grid lines (memoized) ──
  const gridLinesV = useMemo(() => {
    if (!snapToGrid) return [];
    const count = Math.ceil(stageSize.width / GRID_SIZE) + 1;
    return Array.from({ length: count }, (_, i) => i * GRID_SIZE);
  }, [snapToGrid, stageSize.width]);

  const gridLinesH = useMemo(() => {
    if (!snapToGrid) return [];
    const count = Math.ceil(stageSize.height / GRID_SIZE) + 1;
    return Array.from({ length: count }, (_, i) => i * GRID_SIZE);
  }, [snapToGrid, stageSize.height]);

  // ── Drag handlers ──
  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, shapeId: string) => {
      const node = e.target;
      const shape = shapes.find((s) => s.id === shapeId);
      if (!shape) return;

      const otherShapes = shapes.filter((s) => s.id !== shapeId);
      const result = computeSnap(
        { x: node.x(), y: node.y(), width: shape.width, height: shape.height },
        otherShapes,
        GRID_SIZE,
        SNAP_THRESHOLD,
        snapToGrid,
        snapToObjects
      );

      node.x(result.x);
      node.y(result.y);
      setSnapGuides(result.guides);
    },
    [shapes, snapToGrid, snapToObjects]
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, shapeId: string) => {
      setSnapGuides([]);
      setShapes((prev) =>
        prev.map((s) =>
          s.id === shapeId ? { ...s, x: e.target.x(), y: e.target.y() } : s
        )
      );
    },
    []
  );

  // ── Add shape ──
  const addShape = useCallback(
    (type: "rect" | "circle") => {
      const id = crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 12);
      const rawX = 120 + Math.random() * (stageSize.width - 300);
      const rawY = 120 + Math.random() * (stageSize.height - 300);
      const x = snapToGrid ? Math.round(rawX / GRID_SIZE) * GRID_SIZE : rawX;
      const y = snapToGrid ? Math.round(rawY / GRID_SIZE) * GRID_SIZE : rawY;

      const shape: CanvasShape = {
        id,
        type,
        x,
        y,
        width: type === "circle" ? 80 : 140,
        height: type === "circle" ? 80 : 100,
        fill: userColor,
      };

      setShapes((prev) => [...prev, shape]);
      setSelectedShapeId(id);
    },
    [snapToGrid, stageSize]
  );

  // ── Delete selected ──
  const deleteSelected = useCallback(() => {
    if (!selectedShapeId) return;
    setShapes((prev) => prev.filter((s) => s.id !== selectedShapeId));
    setSelectedShapeId(null);
  }, [selectedShapeId]);

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      ref={containerRef}
      style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)" }}
    >
      {/* ─── Floating Toolbar ─── */}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl"
        style={{
          background: "rgba(22, 33, 62, 0.85)",
          backdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Add Rect */}
        <ToolbarButton
          onClick={() => addShape("rect")}
          title="Add Rectangle (R)"
          active={false}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect
              x="2"
              y="3"
              width="14"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </ToolbarButton>

        {/* Add Circle */}
        <ToolbarButton
          onClick={() => addShape("circle")}
          title="Add Circle (C)"
          active={false}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Grid Snap Toggle */}
        <ToolbarButton
          onClick={() => setSnapToGrid((v) => !v)}
          title={`Grid Snap: ${snapToGrid ? "ON" : "OFF"}`}
          active={snapToGrid}
          activeColor="#e94560"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="6" y1="1" x2="6" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="12" y1="1" x2="12" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="1" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="1" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <rect x="1" y="1" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </ToolbarButton>

        {/* Object Snap Toggle */}
        <ToolbarButton
          onClick={() => setSnapToObjects((v) => !v)}
          title={`Align Snap: ${snapToObjects ? "ON" : "OFF"}`}
          active={snapToObjects}
          activeColor="#6366f1"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="10" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <line x1="8" y1="4.5" x2="13.5" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Delete */}
        <ToolbarButton
          onClick={deleteSelected}
          title="Delete Selected (Del)"
          active={false}
          disabled={!selectedShapeId}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M3 5h12M7 5V3h4v2M5 5v10a1 1 0 001 1h6a1 1 0 001-1V5"
              stroke={selectedShapeId ? "#ef4444" : "currentColor"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </ToolbarButton>
      </div>

      {/* ─── Bottom Status Bar ─── */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <StatusPill
          label={`GRID ${GRID_SIZE}px`}
          active={snapToGrid}
          color="#e94560"
        />
        <StatusPill label="ALIGN" active={snapToObjects} color="#818cf8" />
        <span className="text-[10px] font-mono text-gray-600 ml-2">
          {shapes.length} object{shapes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ─── Konva Stage ─── */}
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedShapeId(null);
          }
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedShapeId(null);
          }
        }}
      >
        {/* Grid Layer */}
        <Layer listening={false} opacity={0.06}>
          {gridLinesV.map((x) => (
            <Line
              key={`gv-${x}`}
              points={[x, 0, x, stageSize.height]}
              stroke="#fff"
              strokeWidth={x % (GRID_SIZE * 5) === 0 ? 1 : 0.5}
            />
          ))}
          {gridLinesH.map((y) => (
            <Line
              key={`gh-${y}`}
              points={[0, y, stageSize.width, y]}
              stroke="#fff"
              strokeWidth={y % (GRID_SIZE * 5) === 0 ? 1 : 0.5}
            />
          ))}
        </Layer>

        {/* Shapes Layer */}
        <Layer>
          {shapes.map((shape) => {
            const isSelected = shape.id === selectedShapeId;

            return (
              <Group key={shape.id}>
                {/* Selection glow */}
                {isSelected && (
                  <Rect
                    x={shape.x - 4}
                    y={shape.y - 4}
                    width={shape.width + 8}
                    height={shape.height + 8}
                    cornerRadius={shape.type === "circle" ? shape.width : 6}
                    stroke={GUIDE_COLOR}
                    strokeWidth={2}
                    dash={[6, 3]}
                    listening={false}
                    shadowColor={GUIDE_COLOR}
                    shadowBlur={16}
                    shadowOpacity={0.5}
                  />
                )}
                <Rect
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.fill}
                  cornerRadius={shape.type === "circle" ? shape.width / 2 : 6}
                  draggable
                  shadowColor="rgba(0,0,0,0.5)"
                  shadowBlur={isSelected ? 20 : 10}
                  shadowOffset={{ x: 0, y: isSelected ? 8 : 4 }}
                  shadowOpacity={isSelected ? 0.5 : 0.25}
                  onClick={() => setSelectedShapeId(shape.id)}
                  onTap={() => setSelectedShapeId(shape.id)}
                  onDragStart={() => setSelectedShapeId(shape.id)}
                  onDragMove={(e) => handleDragMove(e, shape.id)}
                  onDragEnd={(e) => handleDragEnd(e, shape.id)}
                  onMouseEnter={(e) => {
                    const stage = e.target.getStage();
                    if (stage) stage.container().style.cursor = "grab";
                  }}
                  onMouseLeave={(e) => {
                    const stage = e.target.getStage();
                    if (stage) stage.container().style.cursor = "default";
                  }}
                />
              </Group>
            );
          })}
        </Layer>

        {/* Snap Guides Layer */}
        <Layer listening={false}>
          {snapGuides.map((guide, i) =>
            guide.orientation === "vertical" ? (
              <Line
                key={`sg-${i}`}
                points={[guide.position, guide.start, guide.position, guide.end]}
                stroke={GUIDE_COLOR}
                strokeWidth={GUIDE_STROKE_WIDTH}
                dash={GUIDE_DASH}
              />
            ) : (
              <Line
                key={`sg-${i}`}
                points={[guide.start, guide.position, guide.end, guide.position]}
                stroke={GUIDE_COLOR}
                strokeWidth={GUIDE_STROKE_WIDTH}
                dash={GUIDE_DASH}
              />
            )
          )}
          {/* Diamond indicators on snap lines */}
          {snapGuides.map((guide, i) => {
            const cx =
              guide.orientation === "vertical"
                ? guide.position
                : (guide.start + guide.end) / 2;
            const cy =
              guide.orientation === "horizontal"
                ? guide.position
                : (guide.start + guide.end) / 2;
            return (
              <Group key={`sp-${i}`} x={cx} y={cy} rotation={45}>
                <Rect
                  width={6}
                  height={6}
                  offsetX={3}
                  offsetY={3}
                  fill={GUIDE_COLOR}
                  opacity={0.9}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {/* ─── Empty State ─── */}
      {shapes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="22"
                  height="22"
                  rx="4"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <line x1="14" y1="9" x2="14" y2="19" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="9" y1="14" x2="19" y2="14" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">Click the toolbar to add shapes</p>
            <p className="text-gray-600 text-xs mt-1">Shapes will snap to grid &amp; align to each other</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function ToolbarButton({
  onClick,
  title,
  active,
  activeColor,
  disabled,
  children,
}: {
  onClick: () => void;
  title: string;
  active: boolean;
  activeColor?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const color = activeColor ?? "#e94560";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="group relative p-2.5 rounded-xl transition-all duration-200"
      style={{
        color: disabled
          ? "rgba(255,255,255,0.15)"
          : active
          ? color
          : "rgba(255,255,255,0.5)",
        background: active ? `${color}22` : "transparent",
        boxShadow: active ? `0 0 12px ${color}33` : "none",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span className="block transition-transform group-hover:scale-110">
        {children}
      </span>
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 mx-0.5" style={{ background: "rgba(255,255,255,0.1)" }} />;
}

function StatusPill({
  label,
  active,
  color,
}: {
  label: string;
  active: boolean;
  color: string;
}) {
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium tracking-wider"
      style={{
        background: active ? `${color}15` : "rgba(255,255,255,0.03)",
        color: active ? color : "rgba(255,255,255,0.25)",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: active ? color : "rgba(255,255,255,0.2)" }}
      />
      {label}
    </span>
  );
}
