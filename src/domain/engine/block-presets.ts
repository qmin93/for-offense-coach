// ============================================
// Block Presets (Auto OL Rules)
// Standard blocking schemes for offensive line
// ============================================

import type { BlockScheme, BlockStyle, OffenseRole, GapName } from "../dsl/types";

export interface BlockAssignment {
  role: OffenseRole;
  scheme: BlockScheme;
  style: BlockStyle;
  angleDeg: number;
  targetGap?: GapName;
  notes?: string;
}

export interface BlockPreset {
  id: string;
  name: string;
  description: string;
  category: "zone" | "gap" | "pass_pro";
  assignments: BlockAssignment[];
}

export const BLOCK_PRESETS: BlockPreset[] = [
  // ============================================
  // Zone Blocking Schemes
  // ============================================
  {
    id: "block_inside_zone",
    name: "Inside Zone Rules",
    description: "Covered/Uncovered rules, combo to Mike",
    category: "zone",
    assignments: [
      { role: "LT", scheme: "zone_step", style: "zone_step", angleDeg: 45, notes: "Covered: base, Uncovered: combo" },
      { role: "LG", scheme: "combo", style: "combo", angleDeg: 30, targetGap: "A_weak", notes: "Combo to Mike" },
      { role: "C", scheme: "zone_step", style: "zone_step", angleDeg: 0, notes: "Covered: base, Uncovered: climb" },
      { role: "RG", scheme: "combo", style: "combo", angleDeg: 330, targetGap: "A_strong", notes: "Combo to Mike" },
      { role: "RT", scheme: "zone_step", style: "zone_step", angleDeg: 315, notes: "Covered: base, Uncovered: combo" },
    ],
  },
  {
    id: "block_duo",
    name: "Duo Rules",
    description: "Double teams at point of attack",
    category: "zone",
    assignments: [
      { role: "LT", scheme: "down", style: "down", angleDeg: 60, notes: "Down block" },
      { role: "LG", scheme: "combo", style: "combo", angleDeg: 45, targetGap: "B_weak", notes: "Double to BSLB" },
      { role: "C", scheme: "combo", style: "combo", angleDeg: 0, notes: "Double to Mike" },
      { role: "RG", scheme: "combo", style: "combo", angleDeg: 315, targetGap: "B_strong", notes: "Double to PSLB" },
      { role: "RT", scheme: "down", style: "down", angleDeg: 300, notes: "Down block" },
    ],
  },
  {
    id: "block_oz_stretch",
    name: "OZ Stretch Rules",
    description: "Reach and overtake, bounce to cutback",
    category: "zone",
    assignments: [
      { role: "LT", scheme: "reach", style: "reach", angleDeg: 90, notes: "Overtake, seal inside" },
      { role: "LG", scheme: "reach", style: "reach", angleDeg: 75, notes: "Reach or hinge" },
      { role: "C", scheme: "reach", style: "reach", angleDeg: 60, notes: "Reach or scoop" },
      { role: "RG", scheme: "zone_step", style: "zone_step", angleDeg: 330, notes: "Zone step playside" },
      { role: "RT", scheme: "zone_step", style: "zone_step", angleDeg: 315, notes: "Zone step playside" },
    ],
  },

  // ============================================
  // Gap Blocking Schemes
  // ============================================
  {
    id: "block_power",
    name: "Power/Counter",
    description: "Kick out, pull and lead",
    category: "gap",
    assignments: [
      { role: "LT", scheme: "down", style: "down", angleDeg: 45, notes: "Down block" },
      { role: "LG", scheme: "pull_lead", style: "pull_pass", angleDeg: 270, notes: "Pull and lead through hole" },
      { role: "C", scheme: "down", style: "down", angleDeg: 30, notes: "Back block" },
      { role: "RG", scheme: "down", style: "down", angleDeg: 315, notes: "Down on DT" },
      { role: "RT", scheme: "kick", style: "drive", angleDeg: 300, notes: "Kick out EMOL" },
    ],
  },
  {
    id: "block_trap",
    name: "Trap Rules",
    description: "Let defender cross, trap with pulling guard",
    category: "gap",
    assignments: [
      { role: "LT", scheme: "down", style: "down", angleDeg: 60, notes: "Down block" },
      { role: "LG", scheme: "trap", style: "drive", angleDeg: 315, notes: "Pull and trap 3T" },
      { role: "C", scheme: "climb", style: "zone_step", angleDeg: 0, notes: "Let cross, climb to LB" },
      { role: "RG", scheme: "down", style: "down", angleDeg: 315, notes: "Down block" },
      { role: "RT", scheme: "down", style: "down", angleDeg: 300, notes: "Down block" },
    ],
  },

  // ============================================
  // Pass Protection Schemes
  // ============================================
  {
    id: "block_pass_slide",
    name: "Pass Pro (Slide)",
    description: "Zone slide protection",
    category: "pass_pro",
    assignments: [
      { role: "LT", scheme: "sift", style: "pull_pass", angleDeg: 90, notes: "Slide left, pick up rush" },
      { role: "LG", scheme: "sift", style: "pull_pass", angleDeg: 75, notes: "Slide left, pick up rush" },
      { role: "C", scheme: "sift", style: "pull_pass", angleDeg: 60, notes: "Slide left, pick up A gap" },
      { role: "RG", scheme: "sift", style: "pull_pass", angleDeg: 45, notes: "Slide left, pick up rush" },
      { role: "RT", scheme: "sift", style: "pull_pass", angleDeg: 30, notes: "Anchor on DE" },
    ],
  },
  {
    id: "block_pass_man",
    name: "Pass Pro (Man)",
    description: "Man blocking, big-on-big",
    category: "pass_pro",
    assignments: [
      { role: "LT", scheme: "sift", style: "pull_pass", angleDeg: 270, notes: "DE, check LB" },
      { role: "LG", scheme: "sift", style: "pull_pass", angleDeg: 315, notes: "DT, check LB" },
      { role: "C", scheme: "sift", style: "pull_pass", angleDeg: 0, notes: "NT, check Mike" },
      { role: "RG", scheme: "sift", style: "pull_pass", angleDeg: 45, notes: "DT, check LB" },
      { role: "RT", scheme: "sift", style: "pull_pass", angleDeg: 90, notes: "DE, check LB" },
    ],
  },
];

// ============================================
// Helper Functions
// ============================================

export function getBlockPresetById(id: string): BlockPreset | undefined {
  return BLOCK_PRESETS.find((p) => p.id === id);
}

export function getBlockPresetsByCategory(category: "zone" | "gap" | "pass_pro"): BlockPreset[] {
  return BLOCK_PRESETS.filter((p) => p.category === category);
}

// Get angle description for display
export function getAngleDescription(angleDeg: number): string {
  if (angleDeg >= 345 || angleDeg < 15) return "Straight";
  if (angleDeg >= 15 && angleDeg < 75) return "Inside Right";
  if (angleDeg >= 75 && angleDeg < 105) return "Right";
  if (angleDeg >= 105 && angleDeg < 165) return "Outside Right";
  if (angleDeg >= 165 && angleDeg < 195) return "Back";
  if (angleDeg >= 195 && angleDeg < 255) return "Outside Left";
  if (angleDeg >= 255 && angleDeg < 285) return "Left";
  if (angleDeg >= 285 && angleDeg < 345) return "Inside Left";
  return "Unknown";
}

// Normalize angle to 0-359 range
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

// Snap angle to nearest increment (e.g., 15 degrees)
export function snapAngle(angle: number, increment: number = 15): number {
  return Math.round(angle / increment) * increment;
}
