"use client";

// Toolbar — floating left-side panel for tool selection, color, and width.

import { useCanvasStore } from "@/stores/canvasStore";
import { ToolType } from "@/lib/canvas-types";
import { COLOR_PALETTE } from "./CanvasEngine";
import {
  MousePointer2,
  Pen,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  Eraser,
  Hand,
  Settings,
  Undo2,
  Redo2,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useState } from "react";

interface ToolbarProps {
  strokeColor: string;
  onStrokeColorChange: (c: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (w: number) => void;
}

const TOOLS: { tool: ToolType; icon: React.ReactNode; label: string }[] = [
  { tool: "select", icon: <MousePointer2 size={18} />, label: "Select (V)" },
  { tool: "pen", icon: <Pen size={18} />, label: "Pen (P)" },
  { tool: "rect", icon: <Square size={18} />, label: "Rectangle (R)" },
  { tool: "ellipse", icon: <Circle size={18} />, label: "Ellipse (O)" },
  { tool: "line", icon: <Minus size={18} />, label: "Line (L)" },
  { tool: "arrow", icon: <ArrowRight size={18} />, label: "Arrow (A)" },
  { tool: "text", icon: <Type size={18} />, label: "Text (T)" },
  { tool: "eraser", icon: <Eraser size={18} />, label: "Eraser (E)" },
  { tool: "pan", icon: <Hand size={18} />, label: "Pan (H)" },
];

export default function Toolbar({
  strokeColor,
  onStrokeColorChange,
  strokeWidth,
  onStrokeWidthChange,
}: ToolbarProps) {
  const { activeTool, setActiveTool, setSettingsPanelOpen, settingsPanelOpen } =
    useCanvasStore();
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div
      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderRadius: 16,
        padding: "10px 8px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
        border: "1px solid rgba(0,0,0,0.07)",
      }}
    >
      {/* Tool buttons */}
      {TOOLS.map(({ tool, icon, label }) => (
        <button
          key={tool}
          title={label}
          onClick={() => setActiveTool(tool)}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
          style={{
            background: activeTool === tool ? "#3b82f6" : "transparent",
            color: activeTool === tool ? "#fff" : "#374151",
          }}
        >
          {icon}
        </button>
      ))}

      <div className="w-full h-px bg-gray-200 my-1" />

      {/* Color palette */}
      <div className="flex flex-col gap-1 items-center">
        {COLOR_PALETTE.slice(0, 6).map((c) => (
          <button
            key={c}
            onClick={() => onStrokeColorChange(c)}
            title={c}
            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: c,
              borderColor: strokeColor === c ? "#3b82f6" : "rgba(0,0,0,0.15)",
            }}
          />
        ))}

        {/* Custom color picker button */}
        <button
          onClick={() => setShowColorPicker((p) => !p)}
          title="Custom color"
          className="w-6 h-6 rounded-full border-2 border-dashed flex items-center justify-center text-xs"
          style={{
            borderColor: "#3b82f6",
            background: strokeColor,
            color: "#fff",
          }}
        >
          +
        </button>
      </div>

      {/* Floating color picker */}
      {showColorPicker && (
        <div
          className="absolute left-14 top-0"
          style={{
            zIndex: 999,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
        >
          <HexColorPicker color={strokeColor} onChange={onStrokeColorChange} />
          <div className="p-2 bg-white text-xs flex items-center gap-2">
            <span>Width:</span>
            <input
              type="range"
              min={1}
              max={40}
              value={strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className="w-24"
            />
            <span>{strokeWidth}px</span>
          </div>
        </div>
      )}

      <div className="w-full h-px bg-gray-200 my-1" />

      {/* Settings button */}
      <button
        title="Canvas Settings"
        onClick={() => setSettingsPanelOpen(!settingsPanelOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
        style={{
          background: settingsPanelOpen ? "#f0f9ff" : "transparent",
          color: settingsPanelOpen ? "#3b82f6" : "#374151",
        }}
      >
        <Settings size={18} />
      </button>
    </div>
  );
}
