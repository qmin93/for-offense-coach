// ============================================
// Concept Packs - Weekly Release System
// Each pack contains 6-10 concepts released weekly
// ============================================

import type { ConceptPack } from "../dsl/types";
import { isPackNew } from "../dsl/types";

// ============================================
// Base Pack (Always available - Free tier)
// ============================================

export const BASE_PACK: ConceptPack = {
  schemaVersion: "1.0",
  type: "concept_pack",
  id: "pack_base",
  name: "Foundation Pack",
  version: "1.0.0",
  meta: {
    releaseWeek: 0,
    releaseYear: 2025,
    releaseDate: "2025-01-01",
    theme: "Core Concepts",
    description: "Essential run and pass concepts every offense needs",
  },
  content: {
    runConceptIds: [
      "concept_run_inside_zone",
      "concept_run_outside_zone",
      "concept_run_power",
      "concept_run_duo",
      "concept_run_counter",
    ],
    passConceptIds: [
      "concept_pass_stick",
      "concept_pass_mesh",
      "concept_pass_flood",
      "concept_pass_smash",
      "concept_pass_verts",
    ],
    familyIds: [
      "family_inside_zone",
      "family_power",
      "family_mesh",
    ],
  },
  isNew: false,
  tags: ["base", "essential", "foundation"],
};

// ============================================
// Weekly Packs (Team/Season tier)
// ============================================

export const CONCEPT_PACKS: ConceptPack[] = [
  BASE_PACK,

  // Week 1 - Zone Running Focus
  {
    schemaVersion: "1.0",
    type: "concept_pack",
    id: "pack_2025_w01",
    name: "Week 1 - Zone Running",
    version: "1.0.0",
    meta: {
      releaseWeek: 1,
      releaseYear: 2025,
      releaseDate: "2025-01-06",
      theme: "Zone Running",
      description: "Zone blocking schemes and variations",
    },
    content: {
      runConceptIds: [
        "concept_run_split_zone",
        "concept_run_mid_zone",
        "concept_run_stretch",
        "concept_run_zone_read",
      ],
      passConceptIds: [
        "concept_pass_spacing",
        "concept_pass_slant_flat",
      ],
      familyIds: ["family_inside_zone", "family_outside_zone"],
    },
    tags: ["zone", "running", "read_option"],
    changelog: ["Initial release"],
  },

  // Week 2 - Gap Scheme Focus
  {
    schemaVersion: "1.0",
    type: "concept_pack",
    id: "pack_2025_w02",
    name: "Week 2 - Gap Schemes",
    version: "1.0.0",
    meta: {
      releaseWeek: 2,
      releaseYear: 2025,
      releaseDate: "2025-01-13",
      theme: "Gap Schemes",
      description: "Power, counter, and pull schemes",
    },
    content: {
      runConceptIds: [
        "concept_run_trap",
        "concept_run_pin_pull",
        "concept_run_buck_sweep",
        "concept_run_wham",
      ],
      passConceptIds: [
        "concept_pass_drive",
        "concept_pass_levels",
      ],
      familyIds: ["family_power", "family_duo"],
    },
    tags: ["gap", "power", "pulling"],
    changelog: ["Initial release"],
  },

  // Week 3 - Quick Game
  {
    schemaVersion: "1.0",
    type: "concept_pack",
    id: "pack_2025_w03",
    name: "Week 3 - Quick Game",
    version: "1.0.0",
    meta: {
      releaseWeek: 3,
      releaseYear: 2025,
      releaseDate: "2025-01-20",
      theme: "Quick Passing",
      description: "3-step drop quick game concepts",
    },
    content: {
      runConceptIds: [
        "concept_run_iso",
        "concept_run_qb_power",
      ],
      passConceptIds: [
        "concept_pass_curl_flat",
        "concept_pass_all_curls",
        "concept_pass_rb_screen",
        "concept_pass_wr_screen",
      ],
      familyIds: ["family_slant_flat"],
    },
    tags: ["quick_game", "rhythm", "screens"],
    changelog: ["Initial release"],
  },

  // Week 4 - Deep Attack
  {
    schemaVersion: "1.0",
    type: "concept_pack",
    id: "pack_2025_w04",
    name: "Week 4 - Deep Attack",
    version: "1.0.0",
    meta: {
      releaseWeek: 4,
      releaseYear: 2025,
      releaseDate: "2025-01-27",
      theme: "Vertical Passing",
      description: "Deep passing concepts and vertical routes",
    },
    content: {
      runConceptIds: [
        "concept_run_jet_sweep",
        "concept_run_toss",
      ],
      passConceptIds: [
        "concept_pass_dagger",
        "concept_pass_y_cross",
        "concept_pass_sail",
        "concept_pass_post_dig",
        "concept_pass_hitch_seam",
        "concept_pass_switch_verts",
      ],
      familyIds: ["family_verts", "family_smash"],
    },
    tags: ["deep", "vertical", "explosive"],
    changelog: ["Initial release"],
  },

  // Week 5 - RPO & Read Game (Current/New)
  {
    schemaVersion: "1.0",
    type: "concept_pack",
    id: "pack_2025_w05",
    name: "Week 5 - RPO & Reads",
    version: "1.0.0",
    meta: {
      releaseWeek: 5,
      releaseYear: 2025,
      releaseDate: "2026-01-15", // Set to recent date for "New" badge testing
      theme: "RPO & Read Game",
      description: "Run-pass options and QB read concepts",
    },
    content: {
      runConceptIds: [
        "concept_run_rpo_base",
        "concept_run_insert",
      ],
      passConceptIds: [],
      familyIds: [],
    },
    tags: ["rpo", "read_game", "dual_threat"],
    changelog: ["Initial release - RPO fundamentals"],
  },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Get all concept packs
 */
export function getAllConceptPacks(): ConceptPack[] {
  return CONCEPT_PACKS;
}

/**
 * Get base pack (free tier)
 */
export function getBasePack(): ConceptPack {
  return BASE_PACK;
}

/**
 * Get concept pack by ID
 */
export function getConceptPackById(id: string): ConceptPack | undefined {
  return CONCEPT_PACKS.find((pack) => pack.id === id);
}

/**
 * Get all "new" packs (released within 7 days)
 */
export function getNewConceptPacks(): ConceptPack[] {
  return CONCEPT_PACKS.filter((pack) => isPackNew(pack));
}

/**
 * Get packs by release year
 */
export function getPacksByYear(year: number): ConceptPack[] {
  return CONCEPT_PACKS.filter((pack) => pack.meta.releaseYear === year);
}

/**
 * Get pack containing a specific concept
 */
export function getPackByConceptId(conceptId: string): ConceptPack | undefined {
  return CONCEPT_PACKS.find(
    (pack) =>
      pack.content.runConceptIds.includes(conceptId) ||
      pack.content.passConceptIds.includes(conceptId)
  );
}

/**
 * Check if a concept is in the base pack (free tier)
 */
export function isConceptInBasePack(conceptId: string): boolean {
  return (
    BASE_PACK.content.runConceptIds.includes(conceptId) ||
    BASE_PACK.content.passConceptIds.includes(conceptId)
  );
}

/**
 * Get all concept IDs available for a plan tier
 */
export function getAvailableConceptIds(tier: "free" | "team" | "season"): string[] {
  if (tier === "free") {
    return [
      ...BASE_PACK.content.runConceptIds,
      ...BASE_PACK.content.passConceptIds,
    ];
  }

  // Team and Season have access to all packs
  const allIds: string[] = [];
  for (const pack of CONCEPT_PACKS) {
    allIds.push(...pack.content.runConceptIds);
    allIds.push(...pack.content.passConceptIds);
  }
  return [...new Set(allIds)]; // Remove duplicates
}

/**
 * Check if a concept is accessible for a plan tier
 */
export function isConceptAccessible(conceptId: string, tier: "free" | "team" | "season"): boolean {
  if (tier === "team" || tier === "season") return true;
  return isConceptInBasePack(conceptId);
}

/**
 * Get pack release info for display
 */
export function getPackReleaseInfo(pack: ConceptPack): {
  weekLabel: string;
  isNew: boolean;
  totalConcepts: number;
} {
  return {
    weekLabel: pack.id === "pack_base" ? "Base" : `W${pack.meta.releaseWeek}`,
    isNew: isPackNew(pack),
    totalConcepts:
      pack.content.runConceptIds.length + pack.content.passConceptIds.length,
  };
}

/**
 * Get latest pack
 */
export function getLatestPack(): ConceptPack {
  return CONCEPT_PACKS.reduce((latest, pack) => {
    if (pack.id === "pack_base") return latest;
    const latestDate = new Date(latest.meta.releaseDate);
    const packDate = new Date(pack.meta.releaseDate);
    return packDate > latestDate ? pack : latest;
  }, CONCEPT_PACKS[1]); // Start with first non-base pack
}

/**
 * Get packs sorted by release date (newest first)
 */
export function getPacksSortedByDate(): ConceptPack[] {
  return [...CONCEPT_PACKS]
    .filter((p) => p.id !== "pack_base")
    .sort((a, b) => {
      const dateA = new Date(a.meta.releaseDate);
      const dateB = new Date(b.meta.releaseDate);
      return dateB.getTime() - dateA.getTime();
    });
}
