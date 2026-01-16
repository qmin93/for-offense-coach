// ============================================
// Landmark Generation Utilities
// For EMOL/Gap overlay in Block mode
// ============================================

import type {
  FieldLandmark,
  FieldLandmarkId,
  Formation,
  Player,
  Strength,
  Point,
} from "../dsl/types";
import { GAP_X } from "../dsl/types";
import { computeOffensiveStrength } from "./defense-presets";

// Constants for landmark positioning
const CENTER_X = 0.5;
const YARD_TO_NORMALIZED = 0.06; // ~1 yard in normalized coords
const LOS_Y = 0; // Line of scrimmage

/**
 * Get side sign based on strength
 * +1 for strong side (right by default), -1 for weak side
 */
function getSideSign(side: "strong" | "weak", strength: Strength): number {
  if (strength === "none" || strength === "right") {
    return side === "strong" ? 1 : -1;
  }
  // strength === "left"
  return side === "strong" ? -1 : 1;
}

/**
 * Build gap landmarks (A, B, C, D gaps) based on OL positions
 */
export function buildGapLandmarks(
  formation: Formation | null,
  strengthOverride?: Strength
): FieldLandmark[] {
  const strength = strengthOverride ??
    (formation ? computeOffensiveStrength(formation) : "right");

  const landmarks: FieldLandmark[] = [];

  // A gaps (inside guard-center)
  landmarks.push({
    id: "A_GAP_STRONG",
    label: "A",
    displayLabel: "A (S)",
    x: CENTER_X + getSideSign("strong", strength) * GAP_X.A * YARD_TO_NORMALIZED,
    y: LOS_Y,
    side: "strong",
    type: "gap",
  });
  landmarks.push({
    id: "A_GAP_WEAK",
    label: "A",
    displayLabel: "A (W)",
    x: CENTER_X + getSideSign("weak", strength) * GAP_X.A * YARD_TO_NORMALIZED,
    y: LOS_Y,
    side: "weak",
    type: "gap",
  });

  // B gaps (guard-tackle)
  landmarks.push({
    id: "B_GAP_STRONG",
    label: "B",
    displayLabel: "B (S)",
    x: CENTER_X + getSideSign("strong", strength) * GAP_X.B * YARD_TO_NORMALIZED,
    y: LOS_Y,
    side: "strong",
    type: "gap",
  });
  landmarks.push({
    id: "B_GAP_WEAK",
    label: "B",
    displayLabel: "B (W)",
    x: CENTER_X + getSideSign("weak", strength) * GAP_X.B * YARD_TO_NORMALIZED,
    y: LOS_Y,
    side: "weak",
    type: "gap",
  });

  // C gaps (tackle-TE/edge)
  landmarks.push({
    id: "C_GAP_STRONG",
    label: "C",
    displayLabel: "C (S)",
    x: CENTER_X + getSideSign("strong", strength) * GAP_X.C * YARD_TO_NORMALIZED,
    y: LOS_Y,
    side: "strong",
    type: "gap",
  });
  landmarks.push({
    id: "C_GAP_WEAK",
    label: "C",
    displayLabel: "C (W)",
    x: CENTER_X + getSideSign("weak", strength) * GAP_X.C * YARD_TO_NORMALIZED,
    y: LOS_Y,
    side: "weak",
    type: "gap",
  });

  // D gap (outside edge - only on strong side typically)
  landmarks.push({
    id: "D_GAP",
    label: "D",
    displayLabel: "D",
    x: CENTER_X + getSideSign("strong", strength) * GAP_X.D * YARD_TO_NORMALIZED,
    y: LOS_Y,
    side: "strong",
    type: "gap",
  });

  return landmarks;
}

/**
 * Build EMOL (End Man On Line) landmarks
 * EMOL is typically the outermost player on LOS (tackle or TE)
 */
export function buildEmolLandmarks(
  formation: Formation | null,
  strengthOverride?: Strength
): FieldLandmark[] {
  const strength = strengthOverride ??
    (formation ? computeOffensiveStrength(formation) : "right");

  const landmarks: FieldLandmark[] = [];

  // Find OL/TE positions from formation
  let strongEmolX = CENTER_X + getSideSign("strong", strength) * GAP_X.C * YARD_TO_NORMALIZED;
  let weakEmolX = CENTER_X + getSideSign("weak", strength) * GAP_X.C * YARD_TO_NORMALIZED;

  if (formation) {
    const players = formation.defaults.players;

    // Find tackles
    const rt = players.find(p => p.role === "RT");
    const lt = players.find(p => p.role === "LT");

    // Find TE if present
    const te = players.find(p => p.role === "Y" && p.label === "TE");

    // Determine strong/weak side tackles
    const strongTackle = strength === "left" ? lt : rt;
    const weakTackle = strength === "left" ? rt : lt;

    // Strong EMOL: TE if present on strong side, else strong tackle
    if (te && ((strength === "right" && te.alignment.x > 0.5) ||
               (strength === "left" && te.alignment.x < 0.5))) {
      strongEmolX = te.alignment.x;
    } else if (strongTackle) {
      strongEmolX = strongTackle.alignment.x;
    }

    // Weak EMOL: weak side tackle
    if (weakTackle) {
      weakEmolX = weakTackle.alignment.x;
    }
  }

  landmarks.push({
    id: "EMOL_STRONG",
    label: "EMOL",
    displayLabel: "EMOL (S)",
    x: strongEmolX,
    y: LOS_Y - 0.02, // Slightly behind LOS for visibility
    side: "strong",
    type: "emol",
  });

  landmarks.push({
    id: "EMOL_WEAK",
    label: "EMOL",
    displayLabel: "EMOL (W)",
    x: weakEmolX,
    y: LOS_Y - 0.02,
    side: "weak",
    type: "emol",
  });

  return landmarks;
}

/**
 * Build all field landmarks (gaps + EMOL)
 */
export function buildAllLandmarks(
  formation: Formation | null,
  strengthOverride?: Strength
): FieldLandmark[] {
  return [
    ...buildGapLandmarks(formation, strengthOverride),
    ...buildEmolLandmarks(formation, strengthOverride),
  ];
}

/**
 * Get landmark by ID
 */
export function getLandmarkById(
  landmarks: FieldLandmark[],
  id: FieldLandmarkId
): FieldLandmark | undefined {
  return landmarks.find(l => l.id === id);
}

/**
 * Get landmark coordinates as Point
 */
export function getLandmarkPoint(landmark: FieldLandmark): Point {
  return { x: landmark.x, y: landmark.y };
}

/**
 * Format landmark for block target display
 * e.g., "A Gap (Strong)" or "EMOL (Weak)"
 */
export function formatLandmarkTarget(landmark: FieldLandmark): string {
  const sideLabel = landmark.side === "strong" ? "Strong" :
                    landmark.side === "weak" ? "Weak" : "";

  if (landmark.type === "gap") {
    return `${landmark.label} Gap${sideLabel ? ` (${sideLabel})` : ""}`;
  }
  return `${landmark.label}${sideLabel ? ` (${sideLabel})` : ""}`;
}

/**
 * Check if a block target landmark ID is valid
 */
export function isValidLandmarkTarget(id: string): id is FieldLandmarkId {
  const validIds: FieldLandmarkId[] = [
    "EMOL_STRONG", "EMOL_WEAK",
    "A_GAP_STRONG", "A_GAP_WEAK",
    "B_GAP_STRONG", "B_GAP_WEAK",
    "C_GAP_STRONG", "C_GAP_WEAK",
    "D_GAP",
  ];
  return validIds.includes(id as FieldLandmarkId);
}
