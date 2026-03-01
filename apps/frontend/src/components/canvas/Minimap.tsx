"use client";

// Minimap — a thumbnail overview of all canvas elements.
// Briefly appears when the user zooms or pans (fades after 2 seconds).

import { useEffect, useRef } from "react";
import type { CanvasElement } from "@/lib/canvas-types";
import { useCanvasStore } from "@/stores/canvasStore";
import { renderElement } from "./elements/renderer";

interface MinimapProps {
  elements: Map<string, CanvasElement>;
  elementOrder: string[];
}

const MINIMAP_W = 160;
const MINIMAP_H = 100;

export default function Minimap({ elements, elementOrder }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { zoom, camera } = useCanvasStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, MINIMAP_W, MINIMAP_H);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, MINIMAP_W, MINIMAP_H);

    if (elementOrder.length === 0) return;

    // Compute bounding box of all elements
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const id of elementOrder) {
      const el = elements.get(id);
      if (!el) continue;
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    }

    const contentW = maxX - minX || 1;
    const contentH = maxY - minY || 1;
    const scale =
      Math.min((MINIMAP_W - 8) / contentW, (MINIMAP_H - 8) / contentH) * 0.9;

    ctx.save();
    ctx.translate(4, 4);
    ctx.scale(scale, scale);
    ctx.translate(-minX, -minY);

    for (const id of elementOrder) {
      const el = elements.get(id);
      if (!el) continue;
      renderElement(ctx, {
        ...el,
        style: { ...el.style, strokeWidth: el.style.strokeWidth / scale },
      });
    }

    // Draw viewport indicator
    const vpX = camera.x;
    const vpY = camera.y;
    const vpW = MINIMAP_W / zoom;
    const vpH = MINIMAP_H / zoom;

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2 / scale;
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.7;
    ctx.strokeRect(vpX, vpY, vpW, vpH);

    ctx.restore();
  }, [elements, elementOrder, zoom, camera]);

  return (
    <div
      className="absolute bottom-6 right-6 z-30 rounded-xl overflow-hidden"
      style={{
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        border: "1px solid rgba(0,0,0,0.1)",
        animation: "fade-in 0.2s ease",
      }}
    >
      <canvas
        ref={canvasRef}
        width={MINIMAP_W}
        height={MINIMAP_H}
        style={{ display: "block" }}
      />
    </div>
  );
}
