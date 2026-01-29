// ============================================
// Path Utilities for Curve Routes/Motion
// Quadratic Bezier helpers
// ============================================

import type { Point } from "../dsl/types";

/**
 * Generate default quadratic control point
 * Places it at midpoint + perpendicular offset
 */
export function defaultQuadraticControl(
  start: Point,
  end: Point,
  bend: number = 0.05  // Default offset amount in normalized coords
): Point {
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;

  const vx = end.x - start.x;
  const vy = end.y - start.y;
  const len = Math.hypot(vx, vy) || 1;

  // Perpendicular (normalized)
  const nx = -vy / len;
  const ny = vx / len;

  // bend: positive = one side, negative = other side
  return {
    x: mx + nx * bend,
    y: my + ny * bend,
  };
}

/**
 * Calculate tangent at end of quadratic bezier curve
 * Used for arrow direction
 * B'(t) = 2(1-t)(C-S) + 2t(E-C)
 * At t=1: B'(1) = 2(E-C)
 */
export function quadTangentAtEnd(
  start: Point,
  control: Point,
  end: Point
): Point {
  return {
    x: end.x - control.x,
    y: end.y - control.y,
  };
}

/**
 * Calculate tangent at start of quadratic bezier curve
 * At t=0: B'(0) = 2(C-S)
 */
export function quadTangentAtStart(
  start: Point,
  control: Point,
  end: Point
): Point {
  return {
    x: control.x - start.x,
    y: control.y - start.y,
  };
}

/**
 * Get angle in radians from tangent vector
 */
export function tangentToAngle(tangent: Point): number {
  return Math.atan2(tangent.y, tangent.x);
}

/**
 * Convert points to SVG path string
 */
export function toSvgPathString(
  points: Point[],
  curveMode: boolean,
  curveControl?: Point,
  toSvg: (p: Point) => { x: number; y: number } = (p) => p
): { pathD: string; endAngle: number } {
  if (points.length < 2) {
    return { pathD: "", endAngle: 0 };
  }

  const svgPoints = points.map(toSvg);
  const start = svgPoints[0];
  const end = svgPoints[svgPoints.length - 1];

  // Simple 2-point case with curve control
  if (curveMode && curveControl && points.length === 2) {
    const c = toSvg(curveControl);
    const tangent = quadTangentAtEnd(start, c, end);
    return {
      pathD: `M ${start.x} ${start.y} Q ${c.x} ${c.y} ${end.x} ${end.y}`,
      endAngle: tangentToAngle(tangent),
    };
  }

  // 3+ points with curve mode (quadratic through middle point)
  if (curveMode && points.length === 3) {
    const control = svgPoints[1];
    const tangent = quadTangentAtEnd(start, control, end);
    return {
      pathD: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
      endAngle: tangentToAngle(tangent),
    };
  }

  // 4+ points with curve mode: use catmull-rom to cubic bezier
  if (curveMode && points.length >= 4) {
    let pathD = `M ${start.x} ${start.y}`;
    const tension = 0.5;

    for (let i = 0; i < svgPoints.length - 1; i++) {
      const p0 = svgPoints[Math.max(0, i - 1)];
      const p1 = svgPoints[i];
      const p2 = svgPoints[i + 1];
      const p3 = svgPoints[Math.min(svgPoints.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
      const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
      const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
      const cp2y = p2.y - (p3.y - p1.y) * tension / 3;

      pathD += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
    }

    const prev = svgPoints[svgPoints.length - 2];
    return {
      pathD,
      endAngle: Math.atan2(end.y - prev.y, end.x - prev.x),
    };
  }

  // Polyline (straight segments)
  const pathD = svgPoints.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, "");

  const prev = svgPoints[svgPoints.length - 2];
  return {
    pathD,
    endAngle: Math.atan2(end.y - prev.y, end.x - prev.x),
  };
}

/**
 * Check if a point should trigger curve mode auto-conversion
 * (when user drags the curve control handle)
 */
export function shouldConvertToCurve(
  points: Point[],
  curveControl: Point | undefined
): boolean {
  return points.length === 2 && curveControl !== undefined;
}
