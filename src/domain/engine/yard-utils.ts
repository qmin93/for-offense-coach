// ============================================
// Yard Conversion Utilities
// Convert between normalized coordinates and yards
// ============================================

import type { Point } from "@/domain/dsl/types";

// ============================================
// Constants
// ============================================

export const YARD_CONSTANTS = {
  // Conversion factors (1 yard in normalized units)
  YARD_TO_NORMALIZED_X: 0.06,  // 1 yard = 0.06 normalized X
  YARD_TO_NORMALIZED_Y: 0.02,  // 1 yard = 0.02 normalized Y

  // Half-yard snap increments
  HALF_YARD_SNAP_X: 0.03,      // 0.5 yards in X
  HALF_YARD_SNAP_Y: 0.01,      // 0.5 yards in Y

  // Default viewport (yards from LOS)
  DEFAULT_VIEWPORT_MIN: 0,     // LOS
  DEFAULT_VIEWPORT_MAX: 25,    // 25 yards downfield

  // Field dimensions in yards
  FIELD_WIDTH_YARDS: 53.33,    // Standard football field width
  HASH_TO_SIDELINE_YARDS: 18.5, // College hash marks
} as const;

// ============================================
// Yard Point Interface
// ============================================

export interface YardPoint {
  xYards: number;  // Yards from center (negative = left, positive = right)
  yYards: number;  // Yards from LOS (negative = backfield, positive = downfield)
}

// ============================================
// Conversion Functions
// ============================================

/**
 * Convert normalized Y coordinate to yards from LOS
 * Y=0 is LOS, positive Y is downfield
 */
export function normalizedYToYards(normalizedY: number): number {
  return normalizedY / YARD_CONSTANTS.YARD_TO_NORMALIZED_Y;
}

/**
 * Convert yards from LOS to normalized Y coordinate
 */
export function yardsToNormalizedY(yards: number): number {
  return yards * YARD_CONSTANTS.YARD_TO_NORMALIZED_Y;
}

/**
 * Convert normalized X coordinate to yards from center
 * X=0.5 is center, <0.5 is left, >0.5 is right
 */
export function normalizedXToYards(normalizedX: number): number {
  // Center (0.5) = 0 yards, each 0.06 = 1 yard
  return (normalizedX - 0.5) / YARD_CONSTANTS.YARD_TO_NORMALIZED_X;
}

/**
 * Convert yards from center to normalized X coordinate
 */
export function yardsToNormalizedX(yards: number): number {
  return 0.5 + (yards * YARD_CONSTANTS.YARD_TO_NORMALIZED_X);
}

/**
 * Convert a Point (normalized) to YardPoint
 */
export function toYardPoint(point: Point): YardPoint {
  return {
    xYards: normalizedXToYards(point.x),
    yYards: normalizedYToYards(point.y),
  };
}

/**
 * Convert a YardPoint to normalized Point
 */
export function fromYardPoint(yardPoint: YardPoint): Point {
  return {
    x: yardsToNormalizedX(yardPoint.xYards),
    y: yardsToNormalizedY(yardPoint.yYards),
  };
}

// ============================================
// Formatting Functions
// ============================================

/**
 * Format yards for display (e.g., "8.5 yds", "-3 yds")
 */
export function formatYards(yards: number, options?: {
  decimals?: number;
  showSign?: boolean;
  suffix?: string;
}): string {
  const { decimals = 1, showSign = false, suffix = "yds" } = options || {};

  const rounded = Math.round(yards * Math.pow(10, decimals)) / Math.pow(10, decimals);
  const sign = showSign && rounded > 0 ? "+" : "";

  // Show integer if no decimal part
  const formatted = rounded === Math.floor(rounded)
    ? rounded.toString()
    : rounded.toFixed(decimals);

  return `${sign}${formatted} ${suffix}`;
}

/**
 * Format a distance (always positive, for route lengths etc.)
 */
export function formatDistance(yards: number): string {
  return formatYards(Math.abs(yards), { decimals: 1 });
}

// ============================================
// Snapping Functions
// ============================================

/**
 * Snap a normalized Y value to nearest half-yard
 */
export function snapToHalfYardY(normalizedY: number): number {
  const snap = YARD_CONSTANTS.HALF_YARD_SNAP_Y;
  return Math.round(normalizedY / snap) * snap;
}

/**
 * Snap a normalized X value to nearest half-yard
 */
export function snapToHalfYardX(normalizedX: number): number {
  const snap = YARD_CONSTANTS.HALF_YARD_SNAP_X;
  return Math.round(normalizedX / snap) * snap;
}

/**
 * Snap a Point to half-yard grid
 */
export function snapToHalfYard(point: Point): Point {
  return {
    x: snapToHalfYardX(point.x),
    y: snapToHalfYardY(point.y),
  };
}

// ============================================
// Viewport Functions
// ============================================

/**
 * Calculate normalized Y range for a yard viewport
 */
export function viewportToNormalizedY(
  minYards: number,
  maxYards: number
): { minY: number; maxY: number } {
  return {
    minY: yardsToNormalizedY(minYards),
    maxY: yardsToNormalizedY(maxYards),
  };
}

/**
 * Check if a normalized Y is within viewport
 */
export function isInViewport(
  normalizedY: number,
  minYards: number,
  maxYards: number
): boolean {
  const yards = normalizedYToYards(normalizedY);
  return yards >= minYards && yards <= maxYards;
}

/**
 * Generate yard line positions for viewport
 * Returns array of { yards, normalizedY, isMajor }
 */
export function getYardLinesInViewport(
  minYards: number,
  maxYards: number,
  options?: {
    majorInterval?: number;  // Default 5 (every 5 yards is major)
    minorInterval?: number;  // Default 1 (every 1 yard)
  }
): Array<{ yards: number; normalizedY: number; isMajor: boolean; is10Yard: boolean }> {
  const { majorInterval = 5, minorInterval = 1 } = options || {};
  const lines: Array<{ yards: number; normalizedY: number; isMajor: boolean; is10Yard: boolean }> = [];

  // Start from first yard line at or after minYards
  const startYard = Math.ceil(minYards / minorInterval) * minorInterval;

  for (let yard = startYard; yard <= maxYards; yard += minorInterval) {
    lines.push({
      yards: yard,
      normalizedY: yardsToNormalizedY(yard),
      isMajor: yard % majorInterval === 0,
      is10Yard: yard % 10 === 0,
    });
  }

  return lines;
}

// ============================================
// Distance Calculation
// ============================================

/**
 * Calculate distance between two points in yards
 */
export function distanceInYards(from: Point, to: Point): number {
  const fromYards = toYardPoint(from);
  const toYards = toYardPoint(to);

  const dx = toYards.xYards - fromYards.xYards;
  const dy = toYards.yYards - fromYards.yYards;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points (in degrees, 0 = up/north)
 */
export function angleInDegrees(from: Point, to: Point): number {
  const fromYards = toYardPoint(from);
  const toYards = toYardPoint(to);

  const dx = toYards.xYards - fromYards.xYards;
  const dy = toYards.yYards - fromYards.yYards;

  // atan2 gives angle from positive X axis, we want from positive Y (north/upfield)
  const radians = Math.atan2(dx, dy);
  let degrees = radians * (180 / Math.PI);

  // Normalize to 0-360
  if (degrees < 0) degrees += 360;

  return degrees;
}

/**
 * Format angle for display
 */
export function formatAngle(degrees: number): string {
  return `${Math.round(degrees)}°`;
}
