/**
 * Helper to compute luminance and return appropriate contrasting colors.
 */

function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
}

export function getLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function isDarkColor(hex: string) {
  return getLuminance(hex) < 0.3;
}

export function getThemeColors(canvasColor: string) {
  const isDark = isDarkColor(canvasColor);

  return {
    isDark,
    uiBackground: isDark ? "rgba(30,30,40,0.92)" : "rgba(255,255,255,0.92)",
    uiText: isDark ? "#f3f4f6" : "#374151",
    uiBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)",
    iconHoverBg: isDark ? "rgba(255,255,255,0.1)" : "#f0f9ff",
    patternStroke: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
    patternDotFill: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)",
  };
}
