// ============================================
// Defense Formation Presets (12 Presets)
// Based on PRD & GoArmy Edge-style coach tools
// ============================================

import type {
  DefensePreset,
  DefenseFront,
  DefenseShell,
  DefenseTechValue,
  Formation,
  Strength,
} from "../dsl/types";

// ============================================
// Helper Functions
// ============================================

// Convert yards from center to normalized x (0-1 scale)
const CENTER_X = 0.5;
const YARD_TO_X = 0.06; // ~1 yard in normalized coords

function xFromCenter(yardsFromCenter: number): number {
  return CENTER_X + yardsFromCenter * YARD_TO_X;
}

// Convert yards in front of LOS (defense side) to normalized y
// Positive yards = above LOS (toward defense end zone)
const LOS_Y = 0;
const YARD_TO_Y = 0.03; // ~1 yard in normalized y coords

function yAboveLOS(yards: number): number {
  return LOS_Y + yards * YARD_TO_Y;
}

// Alias for backward compatibility in secondary positioning
function yBehindLOS(yardsBack: number): number {
  return yAboveLOS(yardsBack);
}

// DL should be 1 yard off the LOS
const DL_Y = yAboveLOS(1);

// ============================================
// ALIGNMENT ANCHORS (NON-NEGOTIABLE)
// ============================================
// DE alignment anchor = OT (LT/RT), NOT the widest offensive player (WR/X/Z)
// This follows DSL "Offensive Surface" principle.
//
// Standard OL splits:
// - C (Center): 0 yards from center
// - G (Guards): ~1-1.5 yards from center (inside shoulder at ~1)
// - OT (Tackles): ~3.5-4 yards from center (LT at -4, RT at +4)
//
// ============================================
// TECHNIQUE-TO-COORDINATE MAPPING (STANDARD)
// ============================================
// 0-tech:  Head-up on center     = 0 yards
// 1-tech:  Shade of center       = 0.5 yards from center
// 2i-tech: Inside shoulder of G  = 1 yard from center
// 2-tech:  Head-up on guard      = 1.25 yards from center
// 3-tech:  Outside shoulder of G = 2 yards from center
// 4i-tech: Inside shoulder of OT = 3 yards from center
// 4-tech:  Head-up on tackle     = 3.5 yards from center
// 5-tech:  Outside shoulder of OT = 4.5 yards from center
// 6-tech:  Inside shade of TE    = 5.5 yards from center
// 7-tech:  Head-up on TE         = 6 yards from center
// 9-tech:  Wide outside          = 8 yards from center
// ============================================

// Technique coordinate mapping (yards from center)
// Exported for use in other modules (e.g., auto-build, rendering)
export const TECH_X: Record<string, number> = {
  "0": 0,
  "1": 0.5,
  "2i": 1,
  "2": 1.25,
  "3": 2,
  "4i": 3,
  "4": 3.5,
  "5": 4.5,
  "6": 5.5,
  "7": 6,
  "9": 8,
};

// Helper to get x position for technique
function techX(tech: string, side: "left" | "right" = "right"): number {
  const base = TECH_X[tech] ?? 4.5;
  return side === "left" ? xFromCenter(-base) : xFromCenter(base);
}

const OT_WIDTH = 4; // OT is at ~4 yards from center
const DE_WIDTH = 4.5; // 5-tech = OT outside shoulder (~4.5 yards from center)

// ============================================
// Defense Preset Definitions
// ============================================

export const DEFENSE_PRESETS: DefensePreset[] = [
  // ============================================
  // Even Front Presets (4-down)
  // ============================================
  {
    id: "defense_4_2",
    name: "Even 4-2 (Base)",
    family: "front",
    front: "even",
    boxCount: 6,
    shell: "unknown",
    tags: ["base", "balanced"],
    alignments: [
      // DL (4-man front) - 5-tech DEs, 3T/1T interior
      { role: "DE", label: "DE", x: techX("5", "left"), y: DL_Y, technique: "5" },
      { role: "DT", label: "3T", x: techX("3", "left"), y: DL_Y, technique: "3" },
      { role: "DT", label: "1T", x: techX("1", "right"), y: DL_Y, technique: "1" },
      { role: "DE", label: "DE", x: techX("5", "right"), y: DL_Y, technique: "5" },
      // LBs (2)
      { role: "ILB", label: "Mike", x: xFromCenter(-2), y: yBehindLOS(4) },
      { role: "ILB", label: "Will", x: xFromCenter(2), y: yBehindLOS(4) },
      // Secondary (5)
      { role: "CB", label: "CB", x: xFromCenter(-15), y: yBehindLOS(7) },
      { role: "CB", label: "CB", x: xFromCenter(15), y: yBehindLOS(7) },
      { role: "SS", label: "SS", x: xFromCenter(-6), y: yBehindLOS(10) },
      { role: "FS", label: "FS", x: xFromCenter(0), y: yBehindLOS(12) },
      { role: "Nickel", label: "$", x: xFromCenter(6), y: yBehindLOS(8) },
    ],
  },
  {
    id: "defense_4_3",
    name: "Even 4-3",
    family: "front",
    front: "even",
    boxCount: 7,
    shell: "unknown",
    tags: ["base", "balanced", "run_stop"],
    alignments: [
      // DL (4-man front) - 5-tech DEs, 3T/1T interior
      { role: "DE", label: "DE", x: techX("5", "left"), y: DL_Y, technique: "5" },
      { role: "DT", label: "3T", x: techX("3", "left"), y: DL_Y, technique: "3" },
      { role: "DT", label: "1T", x: techX("1", "right"), y: DL_Y, technique: "1" },
      { role: "DE", label: "DE", x: techX("5", "right"), y: DL_Y, technique: "5" },
      // LBs (3)
      { role: "OLB", label: "Sam", x: xFromCenter(-5), y: yBehindLOS(3.5) },
      { role: "MLB", label: "Mike", x: xFromCenter(0), y: yBehindLOS(4) },
      { role: "OLB", label: "Will", x: xFromCenter(5), y: yBehindLOS(3.5) },
      // Secondary (4)
      { role: "CB", label: "CB", x: xFromCenter(-15), y: yBehindLOS(7) },
      { role: "CB", label: "CB", x: xFromCenter(15), y: yBehindLOS(7) },
      { role: "SS", label: "SS", x: xFromCenter(-4), y: yBehindLOS(10) },
      { role: "FS", label: "FS", x: xFromCenter(4), y: yBehindLOS(12) },
    ],
  },
  {
    id: "defense_over",
    name: "Over (3T Strong)",
    family: "front",
    front: "over",
    boxCount: 7,
    shell: "unknown",
    threeTechSide: "strong",
    tags: ["even", "strong_side_heavy"],
    alignments: [
      // DL - Over = 3T to strong side (right), 1T shade weak
      { role: "DE", label: "DE", x: techX("5", "left"), y: DL_Y, technique: "5" },
      { role: "DT", label: "1T", x: techX("1", "left"), y: DL_Y, technique: "1" },
      { role: "DT", label: "3T", x: techX("3", "right"), y: DL_Y, technique: "3" },
      { role: "DE", label: "DE", x: techX("5", "right"), y: DL_Y, technique: "5" },
      // LBs (3)
      { role: "OLB", label: "Sam", x: xFromCenter(-5), y: yBehindLOS(3.5) },
      { role: "MLB", label: "Mike", x: xFromCenter(0), y: yBehindLOS(4) },
      { role: "OLB", label: "Will", x: xFromCenter(5), y: yBehindLOS(3.5) },
      // Secondary
      { role: "CB", label: "CB", x: xFromCenter(-15), y: yBehindLOS(7) },
      { role: "CB", label: "CB", x: xFromCenter(15), y: yBehindLOS(7) },
      { role: "SS", label: "SS", x: xFromCenter(-4), y: yBehindLOS(10) },
      { role: "FS", label: "FS", x: xFromCenter(4), y: yBehindLOS(12) },
    ],
  },
  {
    id: "defense_under",
    name: "Under (3T Weak)",
    family: "front",
    front: "under",
    boxCount: 7,
    shell: "unknown",
    threeTechSide: "weak",
    tags: ["even", "weak_side_heavy"],
    alignments: [
      // DL - Under = 3T to weak side (left), 1T shade strong
      { role: "DE", label: "DE", x: techX("5", "left"), y: DL_Y, technique: "5" },
      { role: "DT", label: "3T", x: techX("3", "left"), y: DL_Y, technique: "3" },
      { role: "DT", label: "1T", x: techX("1", "right"), y: DL_Y, technique: "1" },
      { role: "DE", label: "DE", x: techX("5", "right"), y: DL_Y, technique: "5" },
      // LBs (3)
      { role: "OLB", label: "Sam", x: xFromCenter(-5), y: yBehindLOS(3.5) },
      { role: "MLB", label: "Mike", x: xFromCenter(0), y: yBehindLOS(4) },
      { role: "OLB", label: "Will", x: xFromCenter(5), y: yBehindLOS(3.5) },
      // Secondary
      { role: "CB", label: "CB", x: xFromCenter(-15), y: yBehindLOS(7) },
      { role: "CB", label: "CB", x: xFromCenter(15), y: yBehindLOS(7) },
      { role: "SS", label: "SS", x: xFromCenter(-4), y: yBehindLOS(10) },
      { role: "FS", label: "FS", x: xFromCenter(4), y: yBehindLOS(12) },
    ],
  },

  // ============================================
  // Odd Front Presets (3-down)
  // ============================================
  {
    id: "defense_3_3_stack",
    name: "Odd 3-3 Stack",
    family: "front",
    front: "odd",
    boxCount: 6,
    shell: "unknown",
    tags: ["odd", "spread_defense", "athletic"],
    alignments: [
      // DL (3-man front) - 5-tech DEs, 0-tech NT
      { role: "DE", label: "DE", x: techX("5", "left"), y: DL_Y, technique: "5" },
      { role: "NT", label: "NT", x: techX("0", "right"), y: DL_Y, technique: "0" },
      { role: "DE", label: "DE", x: techX("5", "right"), y: DL_Y, technique: "5" },
      // LBs (3) - stacked behind DL
      { role: "OLB", label: "Sam", x: xFromCenter(-4), y: yBehindLOS(3) },
      { role: "MLB", label: "Mike", x: xFromCenter(0), y: yBehindLOS(4) },
      { role: "OLB", label: "Will", x: xFromCenter(4), y: yBehindLOS(3) },
      // Secondary (5)
      { role: "CB", label: "CB", x: xFromCenter(-15), y: yBehindLOS(7) },
      { role: "CB", label: "CB", x: xFromCenter(15), y: yBehindLOS(7) },
      { role: "SS", label: "SS", x: xFromCenter(-6), y: yBehindLOS(10) },
      { role: "FS", label: "FS", x: xFromCenter(0), y: yBehindLOS(12) },
      { role: "Nickel", label: "$", x: xFromCenter(6), y: yBehindLOS(8) },
    ],
  },
  {
    id: "defense_3_4",
    name: "Odd 3-4",
    family: "front",
    front: "odd",
    boxCount: 7,
    shell: "unknown",
    tags: ["odd", "run_stop", "versatile"],
    alignments: [
      // DL (3-man front) - 5-tech DEs, 0-tech NT
      { role: "DE", label: "DE", x: techX("5", "left"), y: DL_Y, technique: "5" },
      { role: "NT", label: "NT", x: techX("0", "right"), y: DL_Y, technique: "0" },
      { role: "DE", label: "DE", x: techX("5", "right"), y: DL_Y, technique: "5" },
      // LBs (4) - OLBs on edges, ILBs inside
      { role: "OLB", label: "Sam", x: xFromCenter(-6), y: yBehindLOS(2.5) },
      { role: "ILB", label: "Mike", x: xFromCenter(-1.5), y: yBehindLOS(4) },
      { role: "ILB", label: "Will", x: xFromCenter(1.5), y: yBehindLOS(4) },
      { role: "OLB", label: "Jack", x: xFromCenter(6), y: yBehindLOS(2.5) },
      // Secondary (4)
      { role: "CB", label: "CB", x: xFromCenter(-15), y: yBehindLOS(7) },
      { role: "CB", label: "CB", x: xFromCenter(15), y: yBehindLOS(7) },
      { role: "SS", label: "SS", x: xFromCenter(-4), y: yBehindLOS(10) },
      { role: "FS", label: "FS", x: xFromCenter(4), y: yBehindLOS(12) },
    ],
  },

  // ============================================
  // Specialty Fronts
  // ============================================
  {
    id: "defense_bear",
    name: "Bear (5-man)",
    family: "front",
    front: "bear",
    boxCount: 7,
    shell: "unknown",
    tags: ["goal_line", "short_yardage", "heavy"],
    alignments: [
      // DL (5-man front) - 5-tech DEs, double 3T, 0-tech NT
      { role: "DE", label: "DE", x: techX("5", "left"), y: DL_Y, technique: "5" },
      { role: "DT", label: "3T", x: techX("3", "left"), y: DL_Y, technique: "3" },
      { role: "NT", label: "NT", x: techX("0", "right"), y: DL_Y, technique: "0" },
      { role: "DT", label: "3T", x: techX("3", "right"), y: DL_Y, technique: "3" },
      { role: "DE", label: "DE", x: techX("5", "right"), y: DL_Y, technique: "5" },
      // LBs (2) - in B gaps
      { role: "MLB", label: "Mike", x: xFromCenter(-3), y: yBehindLOS(3.5) },
      { role: "MLB", label: "Will", x: xFromCenter(3), y: yBehindLOS(3.5) },
      // Secondary (4) - tighter coverage for short yardage
      { role: "CB", label: "CB", x: xFromCenter(-12), y: yBehindLOS(5) },
      { role: "CB", label: "CB", x: xFromCenter(12), y: yBehindLOS(5) },
      { role: "SS", label: "SS", x: xFromCenter(-6), y: yBehindLOS(8) },
      { role: "FS", label: "FS", x: xFromCenter(6), y: yBehindLOS(8) },
    ],
  },
  {
    id: "defense_tite",
    name: "Mint/Tite (4i-0-4i)",
    family: "front",
    front: "tite",
    boxCount: 6,
    shell: "unknown",
    tags: ["spread_defense", "athletic", "run_fit"],
    alignments: [
      // DL (3-man front - tight techniques) - 4i-tech DEs, 0-tech NT
      { role: "DE", label: "DE", x: techX("4i", "left"), y: DL_Y, technique: "4i" },
      { role: "NT", label: "NT", x: techX("0", "right"), y: DL_Y, technique: "0" },
      { role: "DE", label: "DE", x: techX("4i", "right"), y: DL_Y, technique: "4i" },
      // LBs (3) - Apex players on edge for run/pass
      { role: "OLB", label: "Apex", x: xFromCenter(-6), y: yBehindLOS(3) },
      { role: "MLB", label: "Mike", x: xFromCenter(0), y: yBehindLOS(4) },
      { role: "OLB", label: "Apex", x: xFromCenter(6), y: yBehindLOS(3) },
      // Secondary (5)
      { role: "CB", label: "CB", x: xFromCenter(-15), y: yBehindLOS(7) },
      { role: "CB", label: "CB", x: xFromCenter(15), y: yBehindLOS(7) },
      { role: "SS", label: "SS", x: xFromCenter(-8), y: yBehindLOS(10) },
      { role: "FS", label: "FS", x: xFromCenter(0), y: yBehindLOS(12) },
      { role: "Nickel", label: "$", x: xFromCenter(8), y: yBehindLOS(8) },
    ],
  },

  // ============================================
  // Sub-Package Presets (Nickel/Dime)
  // ============================================
  {
    id: "defense_nickel",
    name: "2-4-5 Nickel",
    family: "shell",
    front: "even",
    boxCount: 6,
    shell: "nickel",
    tags: ["pass_defense", "spread", "sub_package"],
    alignments: [
      // DL (4-man front) - 5-tech DEs, 3T/1T interior
      { role: "DE", label: "DE", x: techX("5", "left"), y: DL_Y, technique: "5" },
      { role: "DT", label: "3T", x: techX("3", "left"), y: DL_Y, technique: "3" },
      { role: "DT", label: "1T", x: techX("1", "right"), y: DL_Y, technique: "1" },
      { role: "DE", label: "DE", x: techX("5", "right"), y: DL_Y, technique: "5" },
      // LBs (2) - ILBs in box
      { role: "ILB", label: "Mike", x: xFromCenter(-2), y: yBehindLOS(4) },
      { role: "ILB", label: "Will", x: xFromCenter(2), y: yBehindLOS(4) },
      // Secondary (5) - Nickel DB in slot
      { role: "CB", label: "CB", x: xFromCenter(-15), y: yBehindLOS(7) },
      { role: "CB", label: "CB", x: xFromCenter(15), y: yBehindLOS(7) },
      { role: "Nickel", label: "$", x: xFromCenter(-8), y: yBehindLOS(5) },
      { role: "SS", label: "SS", x: xFromCenter(5), y: yBehindLOS(10) },
      { role: "FS", label: "FS", x: xFromCenter(0), y: yBehindLOS(12) },
    ],
  },
  {
    id: "defense_dime",
    name: "4-1-6 Dime",
    family: "shell",
    front: "even",
    boxCount: 5,
    shell: "dime",
    tags: ["pass_defense", "prevent", "sub_package"],
    alignments: [
      // DL (4-man front) - 5-tech DEs, 3T/1T interior
      { role: "DE", label: "DE", x: techX("5", "left"), y: DL_Y, technique: "5" },
      { role: "DT", label: "3T", x: techX("3", "left"), y: DL_Y, technique: "3" },
      { role: "DT", label: "1T", x: techX("1", "right"), y: DL_Y, technique: "1" },
      { role: "DE", label: "DE", x: techX("5", "right"), y: DL_Y, technique: "5" },
      // LB (1) - single MLB in center
      { role: "MLB", label: "Mike", x: xFromCenter(0), y: yBehindLOS(4) },
      // Secondary (6) - Nickel + Dime DBs
      { role: "CB", label: "CB", x: xFromCenter(-15), y: yBehindLOS(7) },
      { role: "CB", label: "CB", x: xFromCenter(15), y: yBehindLOS(7) },
      { role: "Nickel", label: "$", x: xFromCenter(-8), y: yBehindLOS(5) },
      { role: "Dime", label: "$$", x: xFromCenter(8), y: yBehindLOS(5) },
      { role: "SS", label: "SS", x: xFromCenter(-4), y: yBehindLOS(10) },
      { role: "FS", label: "FS", x: xFromCenter(4), y: yBehindLOS(12) },
    ],
  },

  // ============================================
  // Coverage Shell Presets
  // ============================================
  {
    id: "defense_cover1",
    name: "Cover 1 Shell",
    family: "shell",
    front: "even",
    boxCount: 7,
    shell: "cover1",
    tags: ["man_coverage", "single_high"],
    alignments: [
      // DL - 5-tech DEs, 3T/1T interior
      { role: "DE", label: "DE", x: techX("5", "left"), y: DL_Y, technique: "5" },
      { role: "DT", label: "3T", x: techX("3", "left"), y: DL_Y, technique: "3" },
      { role: "DT", label: "1T", x: techX("1", "right"), y: DL_Y, technique: "1" },
      { role: "DE", label: "DE", x: techX("5", "right"), y: DL_Y, technique: "5" },
      // LBs (3) - in box for man/blitz
      { role: "OLB", label: "Sam", x: xFromCenter(-5), y: yBehindLOS(3.5) },
      { role: "MLB", label: "Mike", x: xFromCenter(0), y: yBehindLOS(4) },
      { role: "OLB", label: "Will", x: xFromCenter(5), y: yBehindLOS(3.5) },
      // Secondary (4) - press man with single high safety
      { role: "CB", label: "CB", x: xFromCenter(-14), y: yBehindLOS(2) },  // Press
      { role: "CB", label: "CB", x: xFromCenter(14), y: yBehindLOS(2) },   // Press
      { role: "SS", label: "SS", x: xFromCenter(-6), y: yBehindLOS(8) },   // Robber/Rat
      { role: "FS", label: "FS", x: xFromCenter(0), y: yBehindLOS(14) },   // Deep middle
    ],
  },
  {
    id: "defense_cover3",
    name: "Cover 3 Shell",
    family: "shell",
    front: "even",
    boxCount: 7,
    shell: "cover3",
    tags: ["zone_coverage", "single_high", "run_support"],
    alignments: [
      // DL - 5-tech DEs, 3T/1T interior
      { role: "DE", label: "DE", x: techX("5", "left"), y: DL_Y, technique: "5" },
      { role: "DT", label: "3T", x: techX("3", "left"), y: DL_Y, technique: "3" },
      { role: "DT", label: "1T", x: techX("1", "right"), y: DL_Y, technique: "1" },
      { role: "DE", label: "DE", x: techX("5", "right"), y: DL_Y, technique: "5" },
      // LBs (3) - curl/flat droppers
      { role: "OLB", label: "Sam", x: xFromCenter(-5), y: yBehindLOS(3.5) },
      { role: "MLB", label: "Mike", x: xFromCenter(0), y: yBehindLOS(4) },
      { role: "OLB", label: "Will", x: xFromCenter(5), y: yBehindLOS(3.5) },
      // Secondary (4) - Cover 3 deep thirds + flat
      { role: "CB", label: "CB", x: xFromCenter(-14), y: yBehindLOS(10) }, // Deep 1/3 left
      { role: "CB", label: "CB", x: xFromCenter(14), y: yBehindLOS(10) },  // Deep 1/3 right
      { role: "SS", label: "SS", x: xFromCenter(-8), y: yBehindLOS(5) },   // Flat/curl dropper
      { role: "FS", label: "FS", x: xFromCenter(0), y: yBehindLOS(14) },   // Deep middle 1/3
    ],
  },
];

// ============================================
// Helper Functions
// ============================================

export function getDefensePresetById(id: string): DefensePreset | undefined {
  return DEFENSE_PRESETS.find((p) => p.id === id);
}

export function getDefensePresetsByFront(front: DefenseFront): DefensePreset[] {
  return DEFENSE_PRESETS.filter((p) => p.front === front);
}

export function getDefensePresetsByFamily(family: "front" | "shell"): DefensePreset[] {
  return DEFENSE_PRESETS.filter((p) => p.family === family);
}

export function getDefensePresetsByBoxCount(boxCount: number): DefensePreset[] {
  return DEFENSE_PRESETS.filter((p) => p.boxCount === boxCount);
}

export function getDefensePresetsByShell(shell: DefenseShell): DefensePreset[] {
  return DEFENSE_PRESETS.filter((p) => p.shell === shell);
}

// Preset display grouping for UI
export interface DefensePresetGroup {
  label: string;
  presets: DefensePreset[];
}

export function getDefensePresetGroups(): DefensePresetGroup[] {
  return [
    {
      label: "Even Fronts (4-down)",
      presets: DEFENSE_PRESETS.filter((p) =>
        p.front === "even" || p.front === "over" || p.front === "under"
      ),
    },
    {
      label: "Odd Fronts (3-down)",
      presets: DEFENSE_PRESETS.filter((p) =>
        p.front === "odd" || p.front === "bear" || p.front === "tite"
      ),
    },
    {
      label: "Sub-Packages",
      presets: DEFENSE_PRESETS.filter((p) =>
        p.shell === "nickel" || p.shell === "dime"
      ),
    },
    {
      label: "Coverage Shells",
      presets: DEFENSE_PRESETS.filter((p) =>
        p.shell === "cover1" || p.shell === "cover3"
      ),
    },
  ];
}

// ============================================
// Technique Label Helper
// ============================================

export function techToLabel(tech: DefenseTechValue | undefined): string {
  if (!tech) return "";
  const labels: Record<DefenseTechValue, string> = {
    "0": "0T",
    "1": "1T",
    "2i": "2i",
    "2": "2T",
    "3": "3T",
    "4i": "4i",
    "5": "5T",
    "7": "7T",
    "9": "9T",
  };
  return labels[tech] || tech;
}

// ============================================
// Offensive Strength Computation
// ============================================

export function computeOffensiveStrength(formation: Formation): Strength {
  // Get formation meta strength if defined
  if (formation.meta?.strength) {
    return formation.meta.strength;
  }

  // Compute from player positions - strength is to the side with TE/more receivers
  const players = formation.defaults.players;
  const CENTER_X = 0.5;

  // Find TE position (Y role often is TE in pro-style formations)
  const tePlayer = players.find((p) => p.role === "Y" && p.label?.includes("TE"));
  if (tePlayer) {
    return tePlayer.alignment.x > CENTER_X ? "right" : "left";
  }

  // Count receivers on each side
  const receivers = players.filter((p) =>
    ["X", "Y", "Z", "H"].includes(p.role as string)
  );
  const leftCount = receivers.filter((p) => p.alignment.x < CENTER_X).length;
  const rightCount = receivers.filter((p) => p.alignment.x > CENTER_X).length;

  if (rightCount > leftCount) return "right";
  if (leftCount > rightCount) return "left";

  // Default to right
  return "right";
}

// ============================================
// Context to Defense Preset Mapping
// Maps PreContext settings to best matching defense preset
// ============================================

export interface ContextDefenseInput {
  boxCount?: 5 | 6 | 7 | 8 | "unknown";
  front?: "even" | "odd" | "over" | "under" | "bear" | "unknown";
  threeTech?: "strong" | "weak" | "none" | "unknown";
  shell?: "1high" | "2high" | "unknown";
}

/**
 * Find the best matching defense preset for given context settings.
 * Returns null if no meaningful context is provided (all unknown).
 *
 * Priority:
 * 1. Exact front + box match (e.g., even front + 7 box → 4-3)
 * 2. Front type match (e.g., odd front → 3-4 or 3-3)
 * 3. Box count match (e.g., 6 box → Nickel or 4-2)
 * 4. Shell match (e.g., 1high → Cover 1)
 */
export function getDefensePresetForContext(context: ContextDefenseInput): DefensePreset | null {
  const { boxCount, front, threeTech, shell } = context;

  // If all settings are unknown, return null
  if (
    (boxCount === "unknown" || boxCount === undefined) &&
    (front === "unknown" || front === undefined) &&
    (shell === "unknown" || shell === undefined)
  ) {
    return null;
  }

  // Score each preset based on context match
  let bestPreset: DefensePreset | null = null;
  let bestScore = -1;

  for (const preset of DEFENSE_PRESETS) {
    let score = 0;

    // Front type match (highest priority for structure)
    if (front && front !== "unknown") {
      if (preset.front === front) {
        score += 30;
      } else if (
        // Over/Under are variants of even
        (front === "over" || front === "under") && preset.front === "even"
      ) {
        score += 15;
      } else if (
        // Map even to any 4-down, odd to any 3-down
        (front === "even" && (preset.front === "even" || preset.front === "over" || preset.front === "under"))
      ) {
        score += 20;
      } else if (
        front === "odd" && (preset.front === "odd" || preset.front === "bear")
      ) {
        score += 20;
      }
    }

    // Box count match
    if (boxCount && boxCount !== "unknown") {
      if (preset.boxCount === boxCount) {
        score += 25;
      } else if (Math.abs(preset.boxCount - boxCount) === 1) {
        score += 10; // Close match
      }
    }

    // 3-Tech side match (for Over/Under)
    if (threeTech && threeTech !== "unknown") {
      if (preset.threeTechSide === threeTech) {
        score += 15;
      }
    }

    // Shell match
    if (shell && shell !== "unknown") {
      if (
        (shell === "1high" && preset.shell === "cover1") ||
        (shell === "2high" && (preset.shell === "cover2" || preset.shell === "cover3"))
      ) {
        score += 20;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestPreset = preset;
    }
  }

  return bestPreset;
}

/**
 * Check if the context has any meaningful defense settings
 */
export function hasDefenseContext(context: ContextDefenseInput): boolean {
  return (
    (context.boxCount !== undefined && context.boxCount !== "unknown") ||
    (context.front !== undefined && context.front !== "unknown") ||
    (context.shell !== undefined && context.shell !== "unknown")
  );
}
