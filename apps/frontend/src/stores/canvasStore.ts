// Zustand store for local UI state ONLY.
// NEVER put canvas element data here — that lives in Yjs Y.Doc.
// This state is ephemeral and resets on every page load.

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ToolType, BackgroundPattern } from "@/lib/canvas-types";

interface Camera {
  x: number;
  y: number;
}

interface CanvasUIState {
  // Active drawing tool
  activeTool: ToolType;

  // Viewport
  zoom: number;
  camera: Camera;

  // Selection
  selectedElementIds: string[];

  // Mode flags
  isPanMode: boolean; // true when space is held

  // Sidebar / panels
  sidebarOpen: boolean;
  settingsPanelOpen: boolean;

  // Canvas appearance (persisted per-board via API, mirrored here)
  canvasColor: string;
  backgroundPattern: BackgroundPattern;

  // Active page (will be used in Phase 3+ with multi-page boards)
  activePageId: string | null;
}

interface CanvasUIActions {
  setActiveTool: (tool: ToolType) => void;
  setZoom: (zoom: number) => void;
  setCamera: (camera: Camera) => void;
  setSelectedElementIds: (ids: string[]) => void;
  addSelectedElementId: (id: string) => void;
  clearSelection: () => void;
  setIsPanMode: (isPan: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setSettingsPanelOpen: (open: boolean) => void;
  setCanvasColor: (color: string) => void;
  setBackgroundPattern: (pattern: BackgroundPattern) => void;
  setActivePageId: (pageId: string | null) => void;
  resetViewport: () => void;
}

const DEFAULT_STATE: CanvasUIState = {
  activeTool: "pen",
  zoom: 1,
  camera: { x: 0, y: 0 },
  selectedElementIds: [],
  isPanMode: false,
  sidebarOpen: true,
  settingsPanelOpen: false,
  canvasColor: "#ffffff",
  backgroundPattern: "dots",
  activePageId: null,
};

export const useCanvasStore = create<CanvasUIState & CanvasUIActions>()(
  immer((set) => ({
    ...DEFAULT_STATE,

    setActiveTool: (tool) =>
      set((s) => {
        s.activeTool = tool;
        if (tool !== "select") s.selectedElementIds = [];
      }),

    setZoom: (zoom) =>
      set((s) => {
        s.zoom = zoom;
      }),

    setCamera: (camera) =>
      set((s) => {
        s.camera = camera;
      }),

    setSelectedElementIds: (ids) =>
      set((s) => {
        s.selectedElementIds = ids;
      }),

    addSelectedElementId: (id) =>
      set((s) => {
        if (!s.selectedElementIds.includes(id)) s.selectedElementIds.push(id);
      }),

    clearSelection: () =>
      set((s) => {
        s.selectedElementIds = [];
      }),

    setIsPanMode: (isPan) =>
      set((s) => {
        s.isPanMode = isPan;
      }),

    setSidebarOpen: (open) =>
      set((s) => {
        s.sidebarOpen = open;
      }),

    setSettingsPanelOpen: (open) =>
      set((s) => {
        s.settingsPanelOpen = open;
      }),

    setCanvasColor: (color) =>
      set((s) => {
        s.canvasColor = color;
      }),

    setBackgroundPattern: (pattern) =>
      set((s) => {
        s.backgroundPattern = pattern;
      }),

    setActivePageId: (pageId) =>
      set((s) => {
        s.activePageId = pageId;
      }),

    resetViewport: () =>
      set((s) => {
        s.zoom = DEFAULT_STATE.zoom;
        s.camera = { ...DEFAULT_STATE.camera };
      }),
  })),
);
