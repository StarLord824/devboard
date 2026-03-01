// Element rendering functions for the STATIC and ACTIVE canvas layers.
// Each function receives a 2D context already transformed for viewport (zoom/pan).

import type { CanvasElement } from "@/lib/canvas-types";

function applyStyle(ctx: CanvasRenderingContext2D, element: CanvasElement) {
  const { style } = element;
  ctx.globalAlpha = style.opacity;
  ctx.strokeStyle = style.stroke;
  ctx.fillStyle = style.fill === "transparent" ? "rgba(0,0,0,0)" : style.fill;
  ctx.lineWidth = style.strokeWidth;
  ctx.setLineDash(style.lineDash);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

export function renderElement(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
) {
  ctx.save();
  applyStyle(ctx, el);

  // Apply rotation around element center
  if (el.rotation !== 0) {
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(el.rotation);
    ctx.translate(-cx, -cy);
  }

  switch (el.type) {
    case "path":
      renderPath(ctx, el);
      break;
    case "rect":
      renderRect(ctx, el);
      break;
    case "ellipse":
      renderEllipse(ctx, el);
      break;
    case "line":
      renderLine(ctx, el);
      break;
    case "arrow":
      renderArrow(ctx, el);
      break;
    case "text":
      renderText(ctx, el);
      break;
    case "image":
      // Image caching is handled by CanvasEngine separately
      break;
  }

  ctx.restore();
}

function renderPath(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  if (!el.points || el.points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(el.points[0][0], el.points[0][1]);
  for (let i = 1; i < el.points.length; i++) {
    ctx.lineTo(el.points[i][0], el.points[i][1]);
  }
  ctx.stroke();
}

function renderRect(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  ctx.beginPath();
  ctx.rect(el.x, el.y, el.width, el.height);
  if (el.style.fill !== "transparent") ctx.fill();
  ctx.stroke();
}

function renderEllipse(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  ctx.beginPath();
  ctx.ellipse(
    el.x + el.width / 2,
    el.y + el.height / 2,
    Math.abs(el.width / 2),
    Math.abs(el.height / 2),
    0,
    0,
    Math.PI * 2,
  );
  if (el.style.fill !== "transparent") ctx.fill();
  ctx.stroke();
}

function renderLine(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  ctx.beginPath();
  ctx.moveTo(el.x, el.y);
  ctx.lineTo(el.x + el.width, el.y + el.height);
  ctx.stroke();
}

function renderArrow(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  const endX = el.x + el.width;
  const endY = el.y + el.height;
  const angle = Math.atan2(endY - el.y, endX - el.x);
  const headLen = Math.max(12, el.style.strokeWidth * 4);

  ctx.beginPath();
  ctx.moveTo(el.x, el.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLen * Math.cos(angle - Math.PI / 6),
    endY - headLen * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLen * Math.cos(angle + Math.PI / 6),
    endY - headLen * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
}

function renderText(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  if (!el.text) return;
  const fontSize = el.fontSize ?? 18;
  const fontFamily = el.fontFamily ?? "Inter, sans-serif";
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = el.style.stroke; // text uses stroke color
  ctx.globalAlpha = el.style.opacity;
  ctx.fillText(el.text, el.x, el.y + fontSize);
}
