// ============================================
// Snap System
// Provides snapping functionality for player
// and route placement
// ============================================

import type { Point } from "../dsl/types";

// ============================================
// Types
// ============================================

export interface SnapConfig {
  enabled: boolean;
  snapToLOS: boolean; // Line of Scrimmage (y = 0)
  snapToHash: boolean; // Hash marks (x = 0.33, 0.67)
  snapToGrid: boolean; // Grid lines
  gridSpacing: number; // Grid spacing in normalized coords
  threshold: number; // Snap threshold distance
}

export interface SnapResult {
  point: Point;
  snappedToLOS: boolean;
  snappedToHashLeft: boolean;
  snappedToHashRight: boolean;
  snappedToGridX: boolean;
  snappedToGridY: boolean;
}

// ============================================
// Constants
// ============================================

export const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  snapToLOS: true,
  snapToHash: true,
  snapToGrid: false,
  gridSpacing: 0.05, // 5% of field width/height
  threshold: 0.02, // 2% snap threshold
};

// Hash mark positions (normalized)
const HASH_LEFT = 0.33;
const HASH_RIGHT = 0.67;

// LOS position
const LOS_Y = 0;

// ============================================
// Snap Functions
// ============================================

/**
 * Apply snapping to a point based on configuration
 */
export function snapPoint(point: Point, config: SnapConfig): SnapResult {
  if (!config.enabled) {
    return {
      point,
      snappedToLOS: false,
      snappedToHashLeft: false,
      snappedToHashRight: false,
      snappedToGridX: false,
      snappedToGridY: false,
    };
  }

  let x = point.x;
  let y = point.y;
  let snappedToLOS = false;
  let snappedToHashLeft = false;
  let snappedToHashRight = false;
  let snappedToGridX = false;
  let snappedToGridY = false;

  // Snap to LOS (y = 0)
  if (config.snapToLOS && Math.abs(y - LOS_Y) < config.threshold) {
    y = LOS_Y;
    snappedToLOS = true;
  }

  // Snap to left hash
  if (config.snapToHash && Math.abs(x - HASH_LEFT) < config.threshold) {
    x = HASH_LEFT;
    snappedToHashLeft = true;
  }

  // Snap to right hash
  if (config.snapToHash && Math.abs(x - HASH_RIGHT) < config.threshold) {
    x = HASH_RIGHT;
    snappedToHashRight = true;
  }

  // Snap to grid
  if (config.snapToGrid) {
    const gridX = Math.round(x / config.gridSpacing) * config.gridSpacing;
    const gridY = Math.round(y / config.gridSpacing) * config.gridSpacing;

    if (Math.abs(x - gridX) < config.threshold) {
      x = gridX;
      snappedToGridX = true;
    }

    if (Math.abs(y - gridY) < config.threshold) {
      y = gridY;
      snappedToGridY = true;
    }
  }

  // Snap to center line (x = 0.5)
  if (config.snapToHash && Math.abs(x - 0.5) < config.threshold) {
    x = 0.5;
  }

  return {
    point: { x, y },
    snappedToLOS,
    snappedToHashLeft,
    snappedToHashRight,
    snappedToGridX,
    snappedToGridY,
  };
}

/**
 * Get visual snap indicators (for rendering snap guides)
 */
export function getSnapIndicators(
  point: Point,
  config: SnapConfig
): { type: "los" | "hash-left" | "hash-right" | "center" | "grid"; position: number }[] {
  if (!config.enabled) return [];

  const indicators: { type: "los" | "hash-left" | "hash-right" | "center" | "grid"; position: number }[] = [];

  // Check LOS proximity
  if (config.snapToLOS && Math.abs(point.y - LOS_Y) < config.threshold * 2) {
    indicators.push({ type: "los", position: LOS_Y });
  }

  // Check hash mark proximity
  if (config.snapToHash) {
    if (Math.abs(point.x - HASH_LEFT) < config.threshold * 2) {
      indicators.push({ type: "hash-left", position: HASH_LEFT });
    }
    if (Math.abs(point.x - HASH_RIGHT) < config.threshold * 2) {
      indicators.push({ type: "hash-right", position: HASH_RIGHT });
    }
    if (Math.abs(point.x - 0.5) < config.threshold * 2) {
      indicators.push({ type: "center", position: 0.5 });
    }
  }

  return indicators;
}
