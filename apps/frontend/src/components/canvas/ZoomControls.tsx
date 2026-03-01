"use client";

import { useCanvasStore } from "@/stores/canvasStore";
import { getThemeColors } from "@/lib/color-utils";
import { Minus, Plus } from "lucide-react";
import { clampZoom } from "@/lib/viewport";

export default function ZoomControls() {
  const { zoom, setZoom, canvasColor, setCamera } = useCanvasStore();
  const theme = getThemeColors(canvasColor);

  return (
    <div
      className="absolute bottom-6 left-6 z-30 flex items-center gap-1"
      style={{
        background: theme.uiBackground,
        backdropFilter: "blur(12px)",
        borderRadius: 12,
        padding: "4px 6px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        border: `1px solid ${theme.uiBorder}`,
      }}
    >
      <button
        onClick={() => setZoom(clampZoom(zoom / 1.2))}
        className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
        style={{ color: theme.uiText }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = theme.iconHoverBg)
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        title="Zoom Out"
      >
        <Minus size={16} />
      </button>

      <span
        className="text-xs font-medium w-12 text-center select-none cursor-pointer hover:opacity-70 transition-opacity"
        style={{ color: theme.uiText }}
        onClick={() => {
          setZoom(1);
          setCamera({ x: 0, y: 0 });
        }}
        title="Reset Zoom to 100%"
      >
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={() => setZoom(clampZoom(zoom * 1.2))}
        className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
        style={{ color: theme.uiText }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = theme.iconHoverBg)
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        title="Zoom In"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
