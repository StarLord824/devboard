
import { z } from "zod";

export const ShapeSchema = z.object({
  id: z.string(),
  type: z.enum(["rect", "circle", "text", "path", "image"]),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  rotation: z.number().optional(),
  scaleX: z.number().optional(),
  scaleY: z.number().optional(),
  text: z.string().optional(),
  points: z.array(z.number()).optional(), // For paths
});

export type Shape = z.infer<typeof ShapeSchema>;

export const CanvasStateSchema = z.object({
    shapes: z.record(z.string(), ShapeSchema)
});

export type CanvasState = z.infer<typeof CanvasStateSchema>;
