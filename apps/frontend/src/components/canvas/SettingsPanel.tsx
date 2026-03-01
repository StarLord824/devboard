"use client";

// SettingsPanel — canvas appearance settings: background color and pattern.
// These settings are persisted per-board via the API (Phase 2+).
// For Phase 1, they live in the Zustand store.

import { useCanvasStore } from "@/stores/canvasStore";
import type { BackgroundPattern } from "@/lib/canvas-types";
import { COLOR_PALETTE } from "./CanvasEngine";
import { X } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useState } from "react";

const PATTERNS: {
  value: BackgroundPattern;
  label: string;
  preview: React.ReactNode;
}[] = [
  {
    value: "plain",
    label: "Plain",
    preview: (
      <svg width="40" height="28" viewBox="0 0 40 28">
        <rect width="40" height="28" fill="#fff" rx="4" />
      </svg>
    ),
  },
  {
    value: "grid",
    label: "Grid",
    preview: (
      <svg width="40" height="28" viewBox="0 0 40 28">
        <rect width="40" height="28" fill="#fff" rx="4" />
        {[10, 20, 30].map((x) => (
          <line
            key={`v${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2="28"
            stroke="#ddd"
            strokeWidth="0.8"
          />
        ))}
        {[9, 18].map((y) => (
          <line
            key={`h${y}`}
            x1="0"
            y1={y}
            x2="40"
            y2={y}
            stroke="#ddd"
            strokeWidth="0.8"
          />
        ))}
      </svg>
    ),
  },
  {
    value: "dots",
    label: "Dots",
    preview: (
      <svg width="40" height="28" viewBox="0 0 40 28">
        <rect width="40" height="28" fill="#fff" rx="4" />
        {[10, 20, 30].flatMap((x) =>
          [9, 18].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="#aaa" />
          )),
        )}
      </svg>
    ),
  },
];

export default function SettingsPanel() {
  const {
    canvasColor,
    setCanvasColor,
    backgroundPattern,
    setBackgroundPattern,
    setSettingsPanelOpen,
  } = useCanvasStore();
  const [showCustomColor, setShowCustomColor] = useState(false);

  return (
    <div
      className="absolute bottom-6 left-16 z-30"
      style={{
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(16px)",
        borderRadius: 16,
        padding: 20,
        minWidth: 240,
        boxShadow: "0 8px 48px rgba(0,0,0,0.16)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">Canvas Settings</h3>
        <button
          onClick={() => setSettingsPanelOpen(false)}
          className="text-gray-400 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      </div>

      {/* Background Color */}
      <section className="mb-4">
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
          Background Color
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {[
            "#ffffff",
            "#f8fafc",
            "#fef9ef",
            "#f0fdf4",
            "#eff6ff",
            "#fdf2f8",
            "#1e1e2e",
            "#0f172a",
          ].map((c) => (
            <button
              key={c}
              onClick={() => setCanvasColor(c)}
              title={c}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: c,
                borderColor: canvasColor === c ? "#3b82f6" : "rgba(0,0,0,0.12)",
              }}
            />
          ))}
          <button
            onClick={() => setShowCustomColor((p) => !p)}
            className="w-7 h-7 rounded-full border-2 border-dashed text-xs flex items-center justify-center"
            style={{
              borderColor: "#3b82f6",
              background: canvasColor,
              color: "#777",
            }}
            title="Custom color"
          >
            +
          </button>
        </div>
        {showCustomColor && (
          <HexColorPicker
            color={canvasColor}
            onChange={setCanvasColor}
            style={{ width: "100%" }}
          />
        )}
      </section>

      {/* Background Pattern */}
      <section>
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
          Pattern
        </p>
        <div className="flex gap-3">
          {PATTERNS.map(({ value, label, preview }) => (
            <button
              key={value}
              onClick={() => setBackgroundPattern(value)}
              title={label}
              className="flex flex-col items-center gap-1"
            >
              <div
                style={{
                  borderRadius: 8,
                  border:
                    backgroundPattern === value
                      ? "2px solid #3b82f6"
                      : "2px solid transparent",
                  overflow: "hidden",
                }}
              >
                {preview}
              </div>
              <span className="text-xs text-gray-500">{label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
