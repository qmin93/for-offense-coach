// ============================================
// Defense Formation Presets
// Tech-based positioning with gap anchors
// ============================================

import type { DefensePreset, DefenseTechValue, Strength, Formation } from "../dsl/types";
import { techToNormalizedX } from "../dsl/types";

// ============================================
// Coordinate System
// ============================================
// LOS is at y=0
// Y > 0 = downfield (defense territory, top of screen)
// Y < 0 = backfield (offense territory, bottom of screen)
//
// Defense players are positioned ABOVE the LOS (POSITIVE y values)
// D-Line: y ≈ 0.04-0.06 (just past LOS)
// LBs: y ≈ 0.12-0.18 (4-5 yards deep)
// Secondary: y ≈ 0.20-0.45 (deep coverage)

// ============================================
// Offensive Strength Calculation
// ============================================

/**
 * Compute offensive strength based on formation
 * Rules:
 * 1. If TE exists, TE side = Strong
 * 2. If no TE but Trips, Trips side = Strong
 * 3. Fallback: Right = Strong
 */
export function computeOffensiveStrength(formation: Formation): Strength {
  const players = formation.defaults.players;

  // Check for TE (Y role with inline position, typically x > 0.65 or x < 0.35)
  const te = players.find(p => p.role === "Y" && p.label === "TE");
  if (te) {
    return te.alignment.x > 0.5 ? "right" : "left";
  }

  // Count receivers on each side
  const receivers = players.filter(p => ["X", "Y", "Z", "H"].includes(p.role as string));
  const leftCount = receivers.filter(p => p.alignment.x < 0.4).length;
  const rightCount = receivers.filter(p => p.alignment.x > 0.6).length;

  // Trips check
  if (rightCount >= 3) return "right";
  if (leftCount >= 3) return "left";

  // Fallback to right
  return "right";
}

/**
 * Get side sign for tech positioning
 * @param side "strong" or "weak"
 * @param strength "left" or "right" (offensive strength)
 * @returns +1 or -1 for x-coordinate offset direction
 */
export function getSideSign(side: "strong" | "weak", strength: Strength): 1 | -1 {
  const strongSign: 1 | -1 = strength === "right" ? 1 : -1;
  return side === "strong" ? strongSign : (strongSign === 1 ? -1 : 1);
}

/**
 * Build DL position from tech
 */
export function buildDLPosition(
  tech: DefenseTechValue,
  side: "strong" | "weak",
  strength: Strength
): { x: number; y: number } {
  const sideSign = getSideSign(side, strength);
  return {
    x: techToNormalizedX(tech, sideSign),
    y: 0.04, // Just past LOS
  };
}

export const DEFENSE_PRESETS: DefensePreset[] = [
  // ============================================
  // Front-Based Presets (6 fronts)
  // ============================================

  // 1. Even 4-3 (Base)
  {
    id: "def_even",
    name: "Even (4-3)",
    family: "front",
    front: "even",
    boxCount: 7,
    shell: "unknown",
    threeTechSide: "strong", // Default 3T to strong side
    tags: ["base", "4-man", "even"],
    alignments: [
      // D-Line (4) - just past LOS
      { role: "DE", label: "DE", x: 0.28, y: 0.04, technique: "5" },
      { role: "DT", label: "3T", x: 0.42, y: 0.04, technique: "3" },
      { role: "DT", label: "1T", x: 0.58, y: 0.04, technique: "1" },
      { role: "DE", label: "DE", x: 0.72, y: 0.04, technique: "5" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.26, y: 0.14 },
      { role: "MLB", label: "Mike", x: 0.50, y: 0.16 },
      { role: "OLB", label: "Will", x: 0.74, y: 0.14 },
      // Secondary (4)
      { role: "CB", label: "CB", x: 0.08, y: 0.06 },
      { role: "CB", label: "CB", x: 0.92, y: 0.06 },
      { role: "SS", label: "SS", x: 0.38, y: 0.28 },
      { role: "FS", label: "FS", x: 0.62, y: 0.36 },
    ],
  },

  // 2. Over (3T Strong)
  {
    id: "def_over",
    name: "Over",
    family: "front",
    front: "over",
    boxCount: 7,
    shell: "unknown",
    threeTechSide: "strong", // Over = 3T to strong side
    tags: ["over", "4-man", "strong"],
    alignments: [
      // D-Line shifted strong
      { role: "DE", label: "DE", x: 0.26, y: 0.04, technique: "5" },
      { role: "DT", label: "3T", x: 0.38, y: 0.04, technique: "3" },
      { role: "NT", label: "1T", x: 0.52, y: 0.04, technique: "1" },
      { role: "DE", label: "DE", x: 0.70, y: 0.04, technique: "5" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.22, y: 0.12 },
      { role: "MLB", label: "Mike", x: 0.50, y: 0.16 },
      { role: "OLB", label: "Will", x: 0.76, y: 0.12 },
      // Secondary (4)
      { role: "CB", label: "CB", x: 0.08, y: 0.06 },
      { role: "CB", label: "CB", x: 0.92, y: 0.06 },
      { role: "SS", label: "SS", x: 0.35, y: 0.26 },
      { role: "FS", label: "FS", x: 0.60, y: 0.36 },
    ],
  },

  // 3. Under (3T Weak)
  {
    id: "def_under",
    name: "Under",
    family: "front",
    front: "under",
    boxCount: 7,
    shell: "unknown",
    threeTechSide: "weak", // Under = 3T to weak side
    tags: ["under", "4-man", "weak"],
    alignments: [
      // D-Line shifted weak
      { role: "DE", label: "DE", x: 0.30, y: 0.04, technique: "5" },
      { role: "NT", label: "1T", x: 0.48, y: 0.04, technique: "1" },
      { role: "DT", label: "3T", x: 0.62, y: 0.04, technique: "3" },
      { role: "DE", label: "DE", x: 0.74, y: 0.04, technique: "5" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.24, y: 0.12 },
      { role: "MLB", label: "Mike", x: 0.50, y: 0.16 },
      { role: "OLB", label: "Will", x: 0.78, y: 0.12 },
      // Secondary (4)
      { role: "CB", label: "CB", x: 0.08, y: 0.06 },
      { role: "CB", label: "CB", x: 0.92, y: 0.06 },
      { role: "SS", label: "SS", x: 0.65, y: 0.26 },
      { role: "FS", label: "FS", x: 0.40, y: 0.36 },
    ],
  },

  // 4. Odd 3-4
  {
    id: "def_odd",
    name: "Odd (3-4)",
    family: "front",
    front: "odd",
    boxCount: 7,
    shell: "unknown",
    tags: ["odd", "3-man", "base"],
    alignments: [
      // D-Line (3)
      { role: "DE", label: "DE", x: 0.32, y: 0.04, technique: "5" },
      { role: "NT", label: "0T", x: 0.50, y: 0.04, technique: "0" },
      { role: "DE", label: "DE", x: 0.68, y: 0.04, technique: "5" },
      // Linebackers (4)
      { role: "OLB", label: "Jack", x: 0.22, y: 0.10 },
      { role: "ILB", label: "Will", x: 0.40, y: 0.16 },
      { role: "ILB", label: "Mike", x: 0.60, y: 0.16 },
      { role: "OLB", label: "Sam", x: 0.78, y: 0.10 },
      // Secondary (4)
      { role: "CB", label: "CB", x: 0.08, y: 0.06 },
      { role: "CB", label: "CB", x: 0.92, y: 0.06 },
      { role: "SS", label: "SS", x: 0.40, y: 0.28 },
      { role: "FS", label: "FS", x: 0.60, y: 0.36 },
    ],
  },

  // 5. Bear (5-man front, short yardage)
  {
    id: "def_bear",
    name: "Bear",
    family: "front",
    front: "bear",
    boxCount: 8,
    shell: "unknown",
    tags: ["bear", "5-man", "goal-line"],
    alignments: [
      // D-Line (5) - heavy front
      { role: "DE", label: "DE", x: 0.26, y: 0.04, technique: "5" },
      { role: "DT", label: "3T", x: 0.36, y: 0.04, technique: "3" },
      { role: "NT", label: "0T", x: 0.50, y: 0.04, technique: "0" },
      { role: "DT", label: "3T", x: 0.64, y: 0.04, technique: "3" },
      { role: "DE", label: "DE", x: 0.74, y: 0.04, technique: "5" },
      // Linebackers (2)
      { role: "ILB", label: "Will", x: 0.38, y: 0.14 },
      { role: "ILB", label: "Mike", x: 0.62, y: 0.14 },
      // Secondary (4)
      { role: "CB", label: "CB", x: 0.08, y: 0.06 },
      { role: "CB", label: "CB", x: 0.92, y: 0.06 },
      { role: "SS", label: "SS", x: 0.40, y: 0.26 },
      { role: "FS", label: "FS", x: 0.60, y: 0.32 },
    ],
  },

  // 6. Mint/Tite (4i-0-4i gap control)
  {
    id: "def_mint",
    name: "Mint/Tite",
    family: "front",
    front: "tite",
    boxCount: 6,
    shell: "unknown",
    tags: ["tite", "mint", "gap-control"],
    alignments: [
      // D-Line (3) - tight alignment
      { role: "DE", label: "4i", x: 0.40, y: 0.04, technique: "4i" },
      { role: "NT", label: "0T", x: 0.50, y: 0.04, technique: "0" },
      { role: "DE", label: "4i", x: 0.60, y: 0.04, technique: "4i" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.26, y: 0.10 },
      { role: "MLB", label: "Mike", x: 0.50, y: 0.18 },
      { role: "OLB", label: "Will", x: 0.74, y: 0.10 },
      // Secondary (5)
      { role: "CB", label: "CB", x: 0.08, y: 0.06 },
      { role: "CB", label: "CB", x: 0.92, y: 0.06 },
      { role: "SS", label: "SS", x: 0.35, y: 0.26 },
      { role: "FS", label: "FS", x: 0.50, y: 0.38 },
      { role: "SS", label: "$", x: 0.65, y: 0.26 },
    ],
  },

  // ============================================
  // Shell-Based Presets (2 coverage shells)
  // ============================================

  // 7. Cover 1 (Man Free / Single High)
  {
    id: "def_cover1",
    name: "Cover 1",
    family: "shell",
    front: "even",
    boxCount: 7,
    shell: "cover1",
    tags: ["cover1", "man", "single-high"],
    alignments: [
      // D-Line (4)
      { role: "DE", label: "DE", x: 0.28, y: 0.04, technique: "5" },
      { role: "DT", label: "3T", x: 0.42, y: 0.04, technique: "3" },
      { role: "DT", label: "1T", x: 0.58, y: 0.04, technique: "1" },
      { role: "DE", label: "DE", x: 0.72, y: 0.04, technique: "5" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.26, y: 0.12 },
      { role: "MLB", label: "Mike", x: 0.50, y: 0.16 },
      { role: "OLB", label: "Will", x: 0.74, y: 0.12 },
      // Secondary (4) - press corners, single high safety
      { role: "CB", label: "CB", x: 0.08, y: 0.02 },
      { role: "CB", label: "CB", x: 0.92, y: 0.02 },
      { role: "SS", label: "SS", x: 0.30, y: 0.20 },
      { role: "FS", label: "FS", x: 0.50, y: 0.42 },
    ],
  },

  // 8. Cover 3 (3-Deep Zone / Cloud)
  {
    id: "def_cover3",
    name: "Cover 3",
    family: "shell",
    front: "even",
    boxCount: 7,
    shell: "cover3",
    tags: ["cover3", "zone", "3-deep"],
    alignments: [
      // D-Line (4)
      { role: "DE", label: "DE", x: 0.28, y: 0.04, technique: "5" },
      { role: "DT", label: "3T", x: 0.42, y: 0.04, technique: "3" },
      { role: "DT", label: "1T", x: 0.58, y: 0.04, technique: "1" },
      { role: "DE", label: "DE", x: 0.72, y: 0.04, technique: "5" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.26, y: 0.12 },
      { role: "MLB", label: "Mike", x: 0.50, y: 0.16 },
      { role: "OLB", label: "Will", x: 0.74, y: 0.12 },
      // Secondary (4) - deep thirds coverage
      { role: "CB", label: "CB", x: 0.15, y: 0.32 },
      { role: "CB", label: "CB", x: 0.85, y: 0.32 },
      { role: "SS", label: "SS", x: 0.35, y: 0.18 },
      { role: "FS", label: "FS", x: 0.50, y: 0.42 },
    ],
  },

  // ============================================
  // Additional Presets (Nickel, Dime, etc.)
  // ============================================

  // 9. Nickel 4-2-5 (Spread offense counter)
  {
    id: "def_nickel",
    name: "Nickel 4-2-5",
    family: "shell",
    front: "even",
    boxCount: 6,
    shell: "nickel",
    tags: ["nickel", "spread", "pass"],
    alignments: [
      // D-Line (4)
      { role: "DE", label: "DE", x: 0.28, y: 0.04, technique: "5" },
      { role: "DT", label: "3T", x: 0.42, y: 0.04, technique: "3" },
      { role: "DT", label: "1T", x: 0.58, y: 0.04, technique: "1" },
      { role: "DE", label: "DE", x: 0.72, y: 0.04, technique: "5" },
      // Linebackers (2)
      { role: "ILB", label: "Mike", x: 0.44, y: 0.14 },
      { role: "ILB", label: "Will", x: 0.56, y: 0.14 },
      // Secondary (5) - Nickel back added
      { role: "CB", label: "CB", x: 0.08, y: 0.06 },
      { role: "CB", label: "CB", x: 0.92, y: 0.06 },
      { role: "Nickel", label: "$", x: 0.78, y: 0.12 },
      { role: "SS", label: "SS", x: 0.32, y: 0.26 },
      { role: "FS", label: "FS", x: 0.55, y: 0.38 },
    ],
  },

  // 10. Dime 4-1-6 (Prevent / 3rd & Long)
  {
    id: "def_dime",
    name: "Dime 4-1-6",
    family: "shell",
    front: "even",
    boxCount: 5,
    shell: "dime",
    tags: ["dime", "prevent", "3rd-long"],
    alignments: [
      // D-Line (4)
      { role: "DE", label: "DE", x: 0.28, y: 0.04, technique: "5" },
      { role: "DT", label: "3T", x: 0.42, y: 0.04, technique: "3" },
      { role: "DT", label: "1T", x: 0.58, y: 0.04, technique: "1" },
      { role: "DE", label: "DE", x: 0.72, y: 0.04, technique: "5" },
      // Linebacker (1)
      { role: "MLB", label: "Mike", x: 0.50, y: 0.14 },
      // Secondary (6) - Dime back added
      { role: "CB", label: "CB", x: 0.08, y: 0.08 },
      { role: "CB", label: "CB", x: 0.92, y: 0.08 },
      { role: "Nickel", label: "$", x: 0.22, y: 0.12 },
      { role: "Dime", label: "D", x: 0.78, y: 0.12 },
      { role: "SS", label: "SS", x: 0.35, y: 0.32 },
      { role: "FS", label: "FS", x: 0.65, y: 0.32 },
    ],
  },

  // 11. Cover 2 (Tampa 2 style)
  {
    id: "def_cover2",
    name: "Cover 2",
    family: "shell",
    front: "even",
    boxCount: 7,
    shell: "cover2",
    tags: ["cover2", "zone", "2-high"],
    alignments: [
      // D-Line (4)
      { role: "DE", label: "DE", x: 0.28, y: 0.04, technique: "5" },
      { role: "DT", label: "3T", x: 0.42, y: 0.04, technique: "3" },
      { role: "DT", label: "1T", x: 0.58, y: 0.04, technique: "1" },
      { role: "DE", label: "DE", x: 0.72, y: 0.04, technique: "5" },
      // Linebackers (3) - Tampa 2 MLB drops deep
      { role: "OLB", label: "Sam", x: 0.26, y: 0.12 },
      { role: "MLB", label: "Mike", x: 0.50, y: 0.18 },
      { role: "OLB", label: "Will", x: 0.74, y: 0.12 },
      // Secondary (4) - Two high safeties
      { role: "CB", label: "CB", x: 0.12, y: 0.12 },
      { role: "CB", label: "CB", x: 0.88, y: 0.12 },
      { role: "SS", label: "SS", x: 0.30, y: 0.38 },
      { role: "FS", label: "FS", x: 0.70, y: 0.38 },
    ],
  },

  // 12. Cover 4 (Quarters)
  {
    id: "def_cover4",
    name: "Cover 4 (Quarters)",
    family: "shell",
    front: "even",
    boxCount: 7,
    shell: "cover4",
    tags: ["cover4", "quarters", "2-high"],
    alignments: [
      // D-Line (4)
      { role: "DE", label: "DE", x: 0.28, y: 0.04, technique: "5" },
      { role: "DT", label: "3T", x: 0.42, y: 0.04, technique: "3" },
      { role: "DT", label: "1T", x: 0.58, y: 0.04, technique: "1" },
      { role: "DE", label: "DE", x: 0.72, y: 0.04, technique: "5" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.26, y: 0.12 },
      { role: "MLB", label: "Mike", x: 0.50, y: 0.16 },
      { role: "OLB", label: "Will", x: 0.74, y: 0.12 },
      // Secondary (4) - Quarters coverage
      { role: "CB", label: "CB", x: 0.18, y: 0.28 },
      { role: "CB", label: "CB", x: 0.82, y: 0.28 },
      { role: "SS", label: "SS", x: 0.35, y: 0.36 },
      { role: "FS", label: "FS", x: 0.65, y: 0.36 },
    ],
  },
];

// ============================================
// Helper Functions
// ============================================

export function getDefensePresetById(id: string): DefensePreset | undefined {
  return DEFENSE_PRESETS.find((p) => p.id === id);
}

export function getDefensePresetsByFamily(family: "front" | "shell"): DefensePreset[] {
  return DEFENSE_PRESETS.filter((p) => p.family === family);
}

export function getDefensePresetsByBoxCount(boxCount: number): DefensePreset[] {
  return DEFENSE_PRESETS.filter((p) => p.boxCount === boxCount);
}

export function getDefensePresetsByShell(shell: string): DefensePreset[] {
  return DEFENSE_PRESETS.filter((p) => p.shell === shell);
}

// ============================================
// Tech Label Generation
// ============================================

/**
 * Generate tech label for display (e.g., "3T", "5T", "N", "9")
 */
export function techToLabel(tech: DefenseTechValue | undefined): string | null {
  if (!tech) return null;
  if (tech === "0") return "N"; // Nose tackle
  return `${tech}T`;
}

/**
 * Resolve 3-tech position based on front and context
 * Over = strong, Under = weak, Even = configurable
 */
export function resolveThreeTechSide(
  front: DefensePreset["front"],
  contextThreeTech?: "strong" | "weak" | "none"
): "strong" | "weak" | "none" {
  // If context specifies, use that
  if (contextThreeTech && contextThreeTech !== "none") {
    return contextThreeTech;
  }

  // Default by front type
  switch (front) {
    case "over":
      return "strong";
    case "under":
      return "weak";
    case "even":
    case "odd":
    case "okie":
      return "strong"; // Default for even fronts
    case "bear":
    case "tite":
    case "mint":
      return "none"; // These don't have a single 3T
    default:
      return "strong";
  }
}

// ============================================
// Shell Position Builders
// ============================================

/**
 * Build 1-high shell positions (Cover 1/3 style)
 */
export function build1HighShell(): Array<{ role: string; label: string; x: number; y: number }> {
  return [
    { role: "FS", label: "FS", x: 0.50, y: 0.42 },  // Single high safety
    { role: "CB", label: "CB", x: 0.10, y: 0.08 },  // Press corner
    { role: "CB", label: "CB", x: 0.90, y: 0.08 },  // Press corner
    { role: "SS", label: "SS", x: 0.35, y: 0.22 },  // Strong overhang
  ];
}

/**
 * Build 2-high shell positions (Cover 2/4 style)
 */
export function build2HighShell(): Array<{ role: string; label: string; x: number; y: number }> {
  return [
    { role: "SS", label: "SS", x: 0.35, y: 0.38 },  // High safety left
    { role: "FS", label: "FS", x: 0.65, y: 0.38 },  // High safety right
    { role: "CB", label: "CB", x: 0.12, y: 0.12 },  // Flat/buzz corner
    { role: "CB", label: "CB", x: 0.88, y: 0.12 },  // Flat/buzz corner
  ];
}

// ============================================
// Fine-tuned Tech Positioning (Optional)
// ============================================

// Additional offset adjustments for more realistic spacing
const TECH_FINE_TUNE: Partial<Record<DefenseTechValue, number>> = {
  "1": 0.00,
  "3": 0.005,
  "5": 0.01,
  "9": 0.02,
  "4i": 0.003,
  "2i": 0.002,
};

/**
 * Get fine-tuned tech position (more accurate spacing)
 */
export function techToNormalizedXFine(tech: DefenseTechValue, sideSign: 1 | -1): number {
  const baseX = techToNormalizedX(tech, sideSign);
  const fineTune = TECH_FINE_TUNE[tech] ?? 0;
  return baseX + sideSign * fineTune;
}

// ============================================
// Quick Chips for UI Selection
// ============================================

/**
 * Quick chips for front selection
 */
export const FRONT_CHIPS: Array<{ value: DefensePreset["front"]; label: string }> = [
  { value: "even", label: "Even" },
  { value: "odd", label: "Odd" },
  { value: "over", label: "Over" },
  { value: "under", label: "Under" },
  { value: "bear", label: "Bear" },
  { value: "tite", label: "Tite" },
];

/**
 * Quick chips for shell selection
 */
export const SHELL_CHIPS: Array<{ value: DefensePreset["shell"]; label: string }> = [
  { value: "cover1", label: "Cov 1" },
  { value: "cover2", label: "Cov 2" },
  { value: "cover3", label: "Cov 3" },
  { value: "cover4", label: "Cov 4" },
  { value: "nickel", label: "Nickel" },
  { value: "dime", label: "Dime" },
];

/**
 * Box count chips
 */
export const BOX_CHIPS: Array<{ value: 5 | 6 | 7 | 8; label: string }> = [
  { value: 5, label: "5-Box" },
  { value: 6, label: "6-Box" },
  { value: 7, label: "7-Box" },
  { value: 8, label: "8-Box" },
];

/**
 * Convert preset alignments to Player array for rendering
 */
export function presetToDefensePlayers(preset: DefensePreset): Array<{
  id: string;
  role: string;
  label: string;
  x: number;
  y: number;
  technique?: string;
}> {
  return preset.alignments.map((align, idx) => ({
    id: `def_${preset.id}_${idx}`,
    role: align.role,
    label: align.label,
    x: align.x,
    y: align.y,
    technique: align.technique,
  }));
}
