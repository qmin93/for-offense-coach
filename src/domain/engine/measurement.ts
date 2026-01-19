// ============================================
// Route/Block Measurement Utilities
// Calculate distances and angles in yards
// ============================================

import type { Point, RouteAction, BlockAction, MotionAction } from "@/domain/dsl/types";
import {
  distanceInYards,
  angleInDegrees,
  formatYards,
  formatAngle,
  toYardPoint,
} from "./yard-utils";

// ============================================
// Types
// ============================================

export interface MeasurementData {
  distanceYards: number;
  angleDeg: number;
  breakPointYards?: number; // Distance to first major break
  totalLegCount?: number;
  segments?: SegmentMeasurement[];
}

export interface SegmentMeasurement {
  fromIndex: number;
  toIndex: number;
  distanceYards: number;
  angleDeg: number;
}

export interface FormattedMeasurement {
  distanceText: string;  // "8.5 yds"
  angleText: string;     // "45°"
  breakText?: string;    // "Break: 5 yds"
  fullText: string;      // "8.5 yds @ 45°"
}

// ============================================
// Route Measurement
// ============================================

/**
 * Measure a route action (total distance, angle, break point)
 */
export function measureRoute(action: RouteAction): MeasurementData {
  const points = action.route.controlPoints;
  if (points.length < 2) {
    return { distanceYards: 0, angleDeg: 0 };
  }

  // Calculate total distance
  let totalDistance = 0;
  const segments: SegmentMeasurement[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const segDistance = distanceInYards(points[i], points[i + 1]);
    const segAngle = angleInDegrees(points[i], points[i + 1]);

    totalDistance += segDistance;
    segments.push({
      fromIndex: i,
      toIndex: i + 1,
      distanceYards: segDistance,
      angleDeg: segAngle,
    });
  }

  // Calculate overall angle (start to end)
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const overallAngle = angleInDegrees(startPoint, endPoint);

  // Calculate break point (distance to first direction change > 30°)
  let breakPointYards: number | undefined;
  if (segments.length >= 2) {
    let accumulatedDistance = 0;
    for (let i = 0; i < segments.length - 1; i++) {
      accumulatedDistance += segments[i].distanceYards;
      const angleDiff = Math.abs(segments[i].angleDeg - segments[i + 1].angleDeg);
      // Normalize angle difference to 0-180
      const normalizedDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff;
      if (normalizedDiff > 30) {
        breakPointYards = accumulatedDistance;
        break;
      }
    }
  }

  return {
    distanceYards: totalDistance,
    angleDeg: overallAngle,
    breakPointYards,
    totalLegCount: segments.length,
    segments,
  };
}

// ============================================
// Block Measurement
// ============================================

/**
 * Measure a block action (distance, angle)
 */
export function measureBlock(action: BlockAction): MeasurementData {
  const points = action.block.pathPoints;
  if (!points || points.length < 2) {
    return { distanceYards: 0, angleDeg: 0 };
  }

  // Calculate total distance
  let totalDistance = 0;
  const segments: SegmentMeasurement[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const segDistance = distanceInYards(points[i], points[i + 1]);
    const segAngle = angleInDegrees(points[i], points[i + 1]);

    totalDistance += segDistance;
    segments.push({
      fromIndex: i,
      toIndex: i + 1,
      distanceYards: segDistance,
      angleDeg: segAngle,
    });
  }

  // Calculate overall angle (start to end)
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const overallAngle = angleInDegrees(startPoint, endPoint);

  return {
    distanceYards: totalDistance,
    angleDeg: overallAngle,
    segments,
  };
}

// ============================================
// Motion Measurement
// ============================================

/**
 * Measure a motion action (distance, angle)
 */
export function measureMotion(action: MotionAction): MeasurementData {
  const points = action.motion.pathPoints;
  if (points.length < 2) {
    return { distanceYards: 0, angleDeg: 0 };
  }

  // Calculate total distance
  let totalDistance = 0;
  const segments: SegmentMeasurement[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const segDistance = distanceInYards(points[i], points[i + 1]);
    const segAngle = angleInDegrees(points[i], points[i + 1]);

    totalDistance += segDistance;
    segments.push({
      fromIndex: i,
      toIndex: i + 1,
      distanceYards: segDistance,
      angleDeg: segAngle,
    });
  }

  // Calculate overall angle
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const overallAngle = angleInDegrees(startPoint, endPoint);

  return {
    distanceYards: totalDistance,
    angleDeg: overallAngle,
    segments,
  };
}

// ============================================
// Formatting
// ============================================

/**
 * Format measurement data for display
 */
export function formatMeasurement(data: MeasurementData): FormattedMeasurement {
  const distanceText = formatYards(data.distanceYards);
  const angleText = formatAngle(data.angleDeg);

  let breakText: string | undefined;
  if (data.breakPointYards !== undefined) {
    breakText = `Break: ${formatYards(data.breakPointYards)}`;
  }

  const fullText = `${distanceText} @ ${angleText}`;

  return {
    distanceText,
    angleText,
    breakText,
    fullText,
  };
}

/**
 * Get a position for displaying measurement label
 * Returns midpoint of the action path
 */
export function getMeasurementLabelPosition(points: Point[]): Point {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }
  if (points.length === 1) {
    return points[0];
  }

  // Find midpoint by accumulated distance
  let totalDistance = 0;
  const distances: number[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const d = distanceInYards(points[i], points[i + 1]);
    distances.push(d);
    totalDistance += d;
  }

  const halfDistance = totalDistance / 2;
  let accumulated = 0;

  for (let i = 0; i < distances.length; i++) {
    if (accumulated + distances[i] >= halfDistance) {
      // Interpolate within this segment
      const ratio = (halfDistance - accumulated) / distances[i];
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * ratio,
        y: points[i].y + (points[i + 1].y - points[i].y) * ratio,
      };
    }
    accumulated += distances[i];
  }

  // Fallback to last point
  return points[points.length - 1];
}

/**
 * Calculate depth (Y distance from LOS) for a point
 */
export function getDepthYards(point: Point): number {
  const yardPoint = toYardPoint(point);
  return yardPoint.yYards;
}

/**
 * Get formatted depth text
 */
export function formatDepth(point: Point): string {
  const depth = getDepthYards(point);
  if (depth < 0) {
    return `${Math.abs(depth).toFixed(1)} behind LOS`;
  } else if (depth === 0) {
    return "At LOS";
  } else {
    return `${depth.toFixed(1)} yds deep`;
  }
}
