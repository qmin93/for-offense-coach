// ============================================
// Defense Formation Presets
// 12 standard defensive alignments
// ============================================

import type { DefensePreset } from "../dsl/types";

// LOS is at y=0
// Defense players are positioned ABOVE the LOS (negative y values)
// D-Line: y ≈ -0.06 (1야드 앞)
// LBs: y ≈ -0.14 ~ -0.20 (3-5야드 깊이)
// Secondary: y ≈ -0.20 ~ -0.45 (다양한 깊이)

export const DEFENSE_PRESETS: DefensePreset[] = [
  // ============================================
  // Front-Based Presets (1-8)
  // ============================================

  // 1. Even 4-2 (Box 6)
  {
    id: "def_even_4_2",
    name: "Even 4-2",
    family: "front",
    front: "even",
    boxCount: 6,
    shell: "unknown",
    tags: ["base", "4-man", "even"],
    alignments: [
      // D-Line (4) - 1야드 앞 (LOS 기준)
      { role: "DE", label: "DE", x: 0.30, y: -0.06, technique: "5" },
      { role: "DT", label: "3T", x: 0.42, y: -0.06, technique: "3" },
      { role: "DT", label: "1T", x: 0.58, y: -0.06, technique: "1" },
      { role: "DE", label: "DE", x: 0.70, y: -0.06, technique: "5" },
      // Linebackers (2) - 4-5야드 깊이
      { role: "ILB", label: "Will", x: 0.38, y: -0.18 },
      { role: "ILB", label: "Mike", x: 0.62, y: -0.18 },
      // Secondary (5)
      { role: "CB", label: "CB", x: 0.10, y: -0.08 },
      { role: "CB", label: "CB", x: 0.90, y: -0.08 },
      { role: "SS", label: "SS", x: 0.35, y: -0.28 },
      { role: "FS", label: "FS", x: 0.50, y: -0.38 },
      { role: "SS", label: "$", x: 0.65, y: -0.28 },
    ],
  },

  // 2. Even 4-3 (Box 7)
  {
    id: "def_even_4_3",
    name: "Even 4-3",
    family: "front",
    front: "even",
    boxCount: 7,
    shell: "unknown",
    tags: ["base", "4-man", "even"],
    alignments: [
      // D-Line (4)
      { role: "DE", label: "DE", x: 0.30, y: -0.06, technique: "5" },
      { role: "DT", label: "3T", x: 0.42, y: -0.06, technique: "3" },
      { role: "DT", label: "1T", x: 0.58, y: -0.06, technique: "1" },
      { role: "DE", label: "DE", x: 0.70, y: -0.06, technique: "5" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.28, y: -0.16 },
      { role: "MLB", label: "Mike", x: 0.50, y: -0.18 },
      { role: "OLB", label: "Will", x: 0.72, y: -0.16 },
      // Secondary (4)
      { role: "CB", label: "CB", x: 0.10, y: -0.08 },
      { role: "CB", label: "CB", x: 0.90, y: -0.08 },
      { role: "SS", label: "SS", x: 0.40, y: -0.28 },
      { role: "FS", label: "FS", x: 0.60, y: -0.38 },
    ],
  },

  // 3. Over (3T Strong)
  {
    id: "def_over",
    name: "Over (3T Strong)",
    family: "front",
    front: "over",
    boxCount: 7,
    shell: "unknown",
    tags: ["over", "4-man", "strong"],
    alignments: [
      // D-Line (4) - shifted to strong side
      { role: "DE", label: "DE", x: 0.28, y: -0.06, technique: "5" },
      { role: "DT", label: "3T", x: 0.40, y: -0.06, technique: "3" },
      { role: "NT", label: "1T", x: 0.52, y: -0.06, technique: "1" },
      { role: "DE", label: "DE", x: 0.68, y: -0.06, technique: "5" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.22, y: -0.14 },
      { role: "MLB", label: "Mike", x: 0.50, y: -0.18 },
      { role: "OLB", label: "Will", x: 0.74, y: -0.14 },
      // Secondary (4)
      { role: "CB", label: "CB", x: 0.10, y: -0.08 },
      { role: "CB", label: "CB", x: 0.90, y: -0.08 },
      { role: "SS", label: "SS", x: 0.35, y: -0.28 },
      { role: "FS", label: "FS", x: 0.60, y: -0.38 },
    ],
  },

  // 4. Under (3T Weak)
  {
    id: "def_under",
    name: "Under (3T Weak)",
    family: "front",
    front: "under",
    boxCount: 7,
    shell: "unknown",
    tags: ["under", "4-man", "weak"],
    alignments: [
      // D-Line (4) - 3T to weak side
      { role: "DE", label: "DE", x: 0.32, y: -0.06, technique: "5" },
      { role: "NT", label: "1T", x: 0.48, y: -0.06, technique: "1" },
      { role: "DT", label: "3T", x: 0.60, y: -0.06, technique: "3" },
      { role: "DE", label: "DE", x: 0.72, y: -0.06, technique: "5" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.26, y: -0.14 },
      { role: "MLB", label: "Mike", x: 0.50, y: -0.18 },
      { role: "OLB", label: "Will", x: 0.78, y: -0.14 },
      // Secondary (4)
      { role: "CB", label: "CB", x: 0.10, y: -0.08 },
      { role: "CB", label: "CB", x: 0.90, y: -0.08 },
      { role: "SS", label: "SS", x: 0.65, y: -0.28 },
      { role: "FS", label: "FS", x: 0.40, y: -0.38 },
    ],
  },

  // 5. Odd 3-3 Stack (Box 6)
  {
    id: "def_odd_3_3_stack",
    name: "Odd 3-3 Stack",
    family: "front",
    front: "odd",
    boxCount: 6,
    shell: "unknown",
    tags: ["odd", "3-man", "stack"],
    alignments: [
      // D-Line (3)
      { role: "DE", label: "DE", x: 0.32, y: -0.06, technique: "5" },
      { role: "NT", label: "0T", x: 0.50, y: -0.06, technique: "0" },
      { role: "DE", label: "DE", x: 0.68, y: -0.06, technique: "5" },
      // Linebackers (3) - stacked behind D-line
      { role: "OLB", label: "Sam", x: 0.32, y: -0.16 },
      { role: "MLB", label: "Mike", x: 0.50, y: -0.16 },
      { role: "OLB", label: "Will", x: 0.68, y: -0.16 },
      // Secondary (5)
      { role: "CB", label: "CB", x: 0.10, y: -0.08 },
      { role: "CB", label: "CB", x: 0.90, y: -0.08 },
      { role: "SS", label: "SS", x: 0.35, y: -0.28 },
      { role: "FS", label: "FS", x: 0.50, y: -0.40 },
      { role: "SS", label: "$", x: 0.65, y: -0.28 },
    ],
  },

  // 6. Odd 3-4 (Box 7)
  {
    id: "def_odd_3_4",
    name: "Odd 3-4",
    family: "front",
    front: "odd",
    boxCount: 7,
    shell: "unknown",
    tags: ["odd", "3-man", "base"],
    alignments: [
      // D-Line (3)
      { role: "DE", label: "DE", x: 0.34, y: -0.06, technique: "5" },
      { role: "NT", label: "0T", x: 0.50, y: -0.06, technique: "0" },
      { role: "DE", label: "DE", x: 0.66, y: -0.06, technique: "5" },
      // Linebackers (4)
      { role: "OLB", label: "Jack", x: 0.24, y: -0.12 },
      { role: "ILB", label: "Will", x: 0.40, y: -0.18 },
      { role: "ILB", label: "Mike", x: 0.60, y: -0.18 },
      { role: "OLB", label: "Sam", x: 0.76, y: -0.12 },
      // Secondary (4)
      { role: "CB", label: "CB", x: 0.10, y: -0.08 },
      { role: "CB", label: "CB", x: 0.90, y: -0.08 },
      { role: "SS", label: "SS", x: 0.40, y: -0.30 },
      { role: "FS", label: "FS", x: 0.60, y: -0.38 },
    ],
  },

  // 7. Bear (5-man front)
  {
    id: "def_bear",
    name: "Bear (5-man)",
    family: "front",
    front: "bear",
    boxCount: 7,
    shell: "unknown",
    tags: ["bear", "5-man", "goal-line"],
    alignments: [
      // D-Line (5) - nose-tackle over center, DTs in gaps
      { role: "DE", label: "DE", x: 0.28, y: -0.06, technique: "5" },
      { role: "DT", label: "3T", x: 0.38, y: -0.06, technique: "3" },
      { role: "NT", label: "0T", x: 0.50, y: -0.06, technique: "0" },
      { role: "DT", label: "3T", x: 0.62, y: -0.06, technique: "3" },
      { role: "DE", label: "DE", x: 0.72, y: -0.06, technique: "5" },
      // Linebackers (2)
      { role: "ILB", label: "Will", x: 0.40, y: -0.18 },
      { role: "ILB", label: "Mike", x: 0.60, y: -0.18 },
      // Secondary (4)
      { role: "CB", label: "CB", x: 0.10, y: -0.08 },
      { role: "CB", label: "CB", x: 0.90, y: -0.08 },
      { role: "SS", label: "SS", x: 0.40, y: -0.28 },
      { role: "FS", label: "FS", x: 0.60, y: -0.36 },
    ],
  },

  // 8. Mint/Tite (4i-0-4i)
  {
    id: "def_tite",
    name: "Mint/Tite (4i-0-4i)",
    family: "front",
    front: "tite",
    boxCount: 6,
    shell: "unknown",
    tags: ["tite", "mint", "gap-control"],
    alignments: [
      // D-Line (3) - tight alignment
      { role: "DE", label: "4i", x: 0.40, y: -0.06, technique: "4i" },
      { role: "NT", label: "0T", x: 0.50, y: -0.06, technique: "0" },
      { role: "DE", label: "4i", x: 0.60, y: -0.06, technique: "4i" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.28, y: -0.12 },
      { role: "MLB", label: "Mike", x: 0.50, y: -0.20 },
      { role: "OLB", label: "Will", x: 0.72, y: -0.12 },
      // Secondary (5)
      { role: "CB", label: "CB", x: 0.10, y: -0.08 },
      { role: "CB", label: "CB", x: 0.90, y: -0.08 },
      { role: "SS", label: "SS", x: 0.35, y: -0.28 },
      { role: "FS", label: "FS", x: 0.50, y: -0.40 },
      { role: "SS", label: "$", x: 0.65, y: -0.28 },
    ],
  },

  // ============================================
  // Shell-Based Presets (9-12)
  // ============================================

  // 9. 2-4-5 Nickel (Box 6)
  {
    id: "def_nickel_2_4_5",
    name: "2-4-5 Nickel",
    family: "shell",
    front: "even",
    boxCount: 6,
    shell: "nickel",
    tags: ["nickel", "pass", "sub-package"],
    alignments: [
      // D-Line (2)
      { role: "DE", label: "DE", x: 0.36, y: -0.06, technique: "3" },
      { role: "DE", label: "DE", x: 0.64, y: -0.06, technique: "3" },
      // Linebackers (4)
      { role: "OLB", label: "Edge", x: 0.26, y: -0.08 },
      { role: "ILB", label: "Will", x: 0.42, y: -0.18 },
      { role: "ILB", label: "Mike", x: 0.58, y: -0.18 },
      { role: "OLB", label: "Edge", x: 0.74, y: -0.08 },
      // Secondary (5) - nickel added
      { role: "CB", label: "CB", x: 0.08, y: -0.08 },
      { role: "CB", label: "CB", x: 0.92, y: -0.08 },
      { role: "Nickel", label: "Nickel", x: 0.24, y: -0.22 },
      { role: "SS", label: "SS", x: 0.50, y: -0.28 },
      { role: "FS", label: "FS", x: 0.50, y: -0.42 },
    ],
  },

  // 10. 4-1-6 Dime (Box 5)
  {
    id: "def_dime_4_1_6",
    name: "4-1-6 Dime",
    family: "shell",
    front: "even",
    boxCount: 5,
    shell: "dime",
    tags: ["dime", "pass", "prevent"],
    alignments: [
      // D-Line (4)
      { role: "DE", label: "DE", x: 0.32, y: -0.06, technique: "5" },
      { role: "DT", label: "3T", x: 0.44, y: -0.06, technique: "3" },
      { role: "DT", label: "1T", x: 0.56, y: -0.06, technique: "1" },
      { role: "DE", label: "DE", x: 0.68, y: -0.06, technique: "5" },
      // Linebacker (1)
      { role: "MLB", label: "Mike", x: 0.50, y: -0.18 },
      // Secondary (6) - dime and nickel added
      { role: "CB", label: "CB", x: 0.06, y: -0.08 },
      { role: "CB", label: "CB", x: 0.94, y: -0.08 },
      { role: "Nickel", label: "Nickel", x: 0.22, y: -0.20 },
      { role: "Dime", label: "Dime", x: 0.78, y: -0.20 },
      { role: "SS", label: "SS", x: 0.40, y: -0.32 },
      { role: "FS", label: "FS", x: 0.60, y: -0.38 },
    ],
  },

  // 11. Cover 1 Shell (Man Free)
  {
    id: "def_cover_1",
    name: "Cover 1 Shell",
    family: "shell",
    front: "even",
    boxCount: 7,
    shell: "cover1",
    tags: ["cover1", "man", "single-high"],
    alignments: [
      // D-Line (4)
      { role: "DE", label: "DE", x: 0.30, y: -0.06, technique: "5" },
      { role: "DT", label: "3T", x: 0.42, y: -0.06, technique: "3" },
      { role: "DT", label: "1T", x: 0.58, y: -0.06, technique: "1" },
      { role: "DE", label: "DE", x: 0.70, y: -0.06, technique: "5" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.28, y: -0.14 },
      { role: "MLB", label: "Mike", x: 0.50, y: -0.18 },
      { role: "OLB", label: "Will", x: 0.72, y: -0.14 },
      // Secondary (4) - press man with single high safety
      { role: "CB", label: "CB", x: 0.10, y: -0.04 },
      { role: "CB", label: "CB", x: 0.90, y: -0.04 },
      { role: "SS", label: "SS", x: 0.30, y: -0.22 },
      { role: "FS", label: "FS", x: 0.50, y: -0.45 },
    ],
  },

  // 12. Cover 3 Shell (3-Deep Zone)
  {
    id: "def_cover_3",
    name: "Cover 3 Shell",
    family: "shell",
    front: "even",
    boxCount: 7,
    shell: "cover3",
    tags: ["cover3", "zone", "3-deep"],
    alignments: [
      // D-Line (4)
      { role: "DE", label: "DE", x: 0.30, y: -0.06, technique: "5" },
      { role: "DT", label: "3T", x: 0.42, y: -0.06, technique: "3" },
      { role: "DT", label: "1T", x: 0.58, y: -0.06, technique: "1" },
      { role: "DE", label: "DE", x: 0.70, y: -0.06, technique: "5" },
      // Linebackers (3)
      { role: "OLB", label: "Sam", x: 0.28, y: -0.14 },
      { role: "MLB", label: "Mike", x: 0.50, y: -0.18 },
      { role: "OLB", label: "Will", x: 0.72, y: -0.14 },
      // Secondary (4) - 3-deep shell (CBs 깊이 배치)
      { role: "CB", label: "CB", x: 0.15, y: -0.35 },
      { role: "CB", label: "CB", x: 0.85, y: -0.35 },
      { role: "SS", label: "SS", x: 0.35, y: -0.20 },
      { role: "FS", label: "FS", x: 0.50, y: -0.45 },
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

export function getDefensePresetsByFront(front: string): DefensePreset[] {
  return DEFENSE_PRESETS.filter((p) => p.front === front);
}

export function getDefensePresetsByBoxCount(boxCount: number): DefensePreset[] {
  return DEFENSE_PRESETS.filter((p) => p.boxCount === boxCount);
}

export function getDefensePresetsByShell(shell: string): DefensePreset[] {
  return DEFENSE_PRESETS.filter((p) => p.shell === shell);
}
