// ============================================
// Overlay Collision Avoidance
// Prevents label overlap in defense/landmark overlays
// ============================================

import type { FieldLandmark, Player, OverlayDensity } from "../dsl/types";

// ============================================
// Types
// ============================================

export type OverlayKind = "DEF_TECH" | "LANDMARK" | "LEGEND";

export interface OverlayLabel {
  id: string;
  kind: OverlayKind;
  text: string;
  x: number;        // SVG x coordinate
  y: number;        // SVG y coordinate
  w: number;        // Estimated width in SVG units
  h: number;        // Estimated height in SVG units
  priority: number; // Higher = more important (100=defense, 80=EMOL, 60=gap)
  visible: boolean; // Whether to render this label
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ============================================
// Priority Values
// ============================================

const PRIORITY = {
  DEF_TECH: 100,
  EMOL: 80,
  GAP_AB: 70,
  GAP_CD: 60,
  LEGEND: 50,
} as const;

// ============================================
// Collision Detection
// ============================================

/**
 * Check if two bounding boxes overlap
 */
function boxesOverlap(a: BoundingBox, b: BoundingBox, margin: number = 2): boolean {
  return !(
    a.x + a.w + margin < b.x ||
    b.x + b.w + margin < a.x ||
    a.y + a.h + margin < b.y ||
    b.y + b.h + margin < a.y
  );
}

/**
 * Get bounding box for an overlay label
 */
function getLabelBox(label: OverlayLabel): BoundingBox {
  return {
    x: label.x - label.w / 2,
    y: label.y - label.h / 2,
    w: label.w,
    h: label.h,
  };
}

// ============================================
// Collision Avoidance Algorithm
// ============================================

/**
 * Apply greedy collision avoidance to overlay labels
 * Higher priority labels are placed first; lower priority labels
 * are hidden if they would overlap with already-placed labels.
 *
 * @param labels - Array of overlay labels to process
 * @returns Array of labels with visibility updated
 */
export function resolveOverlayCollisions(labels: OverlayLabel[]): OverlayLabel[] {
  // Sort by priority descending (higher priority first)
  const sorted = [...labels].sort((a, b) => b.priority - a.priority);

  // Track placed bounding boxes
  const placedBoxes: BoundingBox[] = [];

  // Process each label
  return sorted.map((label) => {
    const box = getLabelBox(label);

    // Check for overlap with any already-placed label
    const hasCollision = placedBoxes.some((placed) => boxesOverlap(box, placed));

    if (hasCollision) {
      // Hide this label due to collision
      return { ...label, visible: false };
    }

    // No collision, place this label
    placedBoxes.push(box);
    return { ...label, visible: true };
  });
}

// ============================================
// Label Creation Helpers
// ============================================

/**
 * Create overlay labels for defense tech (3T/5T/N/9)
 */
export function createDefenseTechLabels(
  players: Player[],
  toSvgPoint: (p: { x: number; y: number }) => { x: number; y: number }
): OverlayLabel[] {
  const dlPlayers = players.filter(
    (p) =>
      p.unit === "defense" &&
      p.alignment &&
      ["DE", "DT", "NT"].includes(p.role)
  );

  return dlPlayers.map((player) => {
    const pos = toSvgPoint(player.alignment);
    const label = player.role === "NT" ? "N" : player.label;

    return {
      id: `def-${player.id}`,
      kind: "DEF_TECH" as const,
      text: label,
      x: pos.x,
      y: pos.y - 32, // Above player
      w: 24,
      h: 14,
      priority: PRIORITY.DEF_TECH,
      visible: true,
    };
  });
}

/**
 * Create overlay labels for field landmarks
 */
export function createLandmarkLabels(
  landmarks: FieldLandmark[],
  toSvgPoint: (p: { x: number; y: number }) => { x: number; y: number }
): OverlayLabel[] {
  return landmarks.map((landmark) => {
    const pos = toSvgPoint({ x: landmark.x, y: landmark.y });
    const isEmol = landmark.type === "emol";
    const isAB = landmark.label === "A" || landmark.label === "B";

    return {
      id: `lm-${landmark.id}`,
      kind: "LANDMARK" as const,
      text: landmark.displayLabel,
      x: pos.x,
      y: pos.y,
      w: isEmol ? 40 : 28,
      h: isEmol ? 24 : 20,
      priority: isEmol ? PRIORITY.EMOL : isAB ? PRIORITY.GAP_AB : PRIORITY.GAP_CD,
      visible: true,
    };
  });
}

/**
 * Create all overlay labels and resolve collisions
 */
export function createResolvedOverlayLabels(
  players: Player[],
  landmarks: FieldLandmark[],
  toSvgPoint: (p: { x: number; y: number }) => { x: number; y: number }
): OverlayLabel[] {
  const defenseLabels = createDefenseTechLabels(players, toSvgPoint);
  const landmarkLabels = createLandmarkLabels(landmarks, toSvgPoint);

  const allLabels = [...defenseLabels, ...landmarkLabels];
  return resolveOverlayCollisions(allLabels);
}

/**
 * Check visibility of a specific label after collision resolution
 */
export function isLabelVisible(
  resolvedLabels: OverlayLabel[],
  id: string
): boolean {
  const label = resolvedLabels.find((l) => l.id === id);
  return label?.visible ?? false;
}
