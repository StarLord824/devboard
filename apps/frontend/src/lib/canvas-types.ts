// Types for the canvas element data model
// All coordinates are in WORLD space (virtual canvas, not screen pixels)

export type ElementType =
  | "path"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "image";
export type ToolType =
  | "select"
  | "pen"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "eraser"
  | "pan";
export type BackgroundPattern = "plain" | "grid" | "dots";

export interface ElementStyle {
  stroke: string;
  fill: string; // hex or 'transparent'
  strokeWidth: number;
  opacity: number; // 0–1
  lineDash: number[]; // [] = solid, [5,5] = dashed
}

export interface CanvasElement {
  id: string;
  type: ElementType;

  // Bounding box in world coordinates
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // radians

  style: ElementStyle;

  // Type-specific fields
  points?: [number, number][]; // path: absolute world coords
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  src?: string; // image: base64 or R2 URL

  // Metadata
  createdBy: string; // userId or 'local' in Phase 1
  createdAt: number; // unix timestamp ms
  lockedBy?: string | null;
}

export interface Camera {
  x: number; // world x of top-left viewport corner
  y: number; // world y of top-left viewport corner
}

export interface CanvasSettings {
  canvasColor: string; // background fill color
  backgroundPattern: BackgroundPattern;
}

export type CanvasLayer = "static" | "active" | "cursor" | "overlay";
