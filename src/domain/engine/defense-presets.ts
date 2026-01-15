// ============================================
// Defense Formation Presets
// 8 focused presets (reduced from 12)
// ============================================

import type { DefensePreset } from "../dsl/types";

// LOS is at y=0
// COORDINATE SYSTEM:
// Y > 0 = downfield (defense territory, top of screen)
// Y < 0 = backfield (offense territory, bottom of screen)
//
// Defense players are positioned ABOVE the LOS (POSITIVE y values)
// D-Line: y ≈ 0.04-0.06 (just past LOS)
// LBs: y ≈ 0.12-0.18 (4-5 yards deep)
// Secondary: y ≈ 0.20-0.45 (deep coverage)

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
