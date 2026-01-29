// ============================================
// Formation Packages
// Grouped formations with shared philosophy
// ============================================

import type { FormationPackage, FormationPackagePhilosophy, Personnel } from "@/domain/dsl/types";

// ============================================
// Package Definitions
// ============================================

export const FORMATION_PACKAGES: FormationPackage[] = [
  // ============================================
  // 1. Trips Package (Spread the Defense)
  // ============================================
  {
    id: "pkg_trips",
    name: "Trips Package",
    philosophy: "spread_the_defense",
    summary: "3 receivers to one side. Forces defense to declare strength, creates 1-on-1 matchups, and opens backside iso routes.",
    formations: [
      {
        formationId: "formation_trips_right",
        role: "base",
        notes: "Primary formation - 3 WRs to the right",
      },
      {
        formationId: "formation_trips_left",
        role: "variation",
        notes: "Mirror - 3 WRs to the left",
      },
      {
        formationId: "formation_empty_trips",
        role: "complement",
        situationBias: ["passing_down", "2_minute"],
        notes: "5 eligible - maximum pressure on coverage",
      },
      {
        formationId: "formation_bunch_right",
        role: "complement",
        situationBias: ["redzone", "short_yardage"],
        notes: "Condensed version - pick plays, rub routes",
      },
    ],
    personnel: ["11"],
    tags: ["spread", "passing", "horizontal_stretch"],
    installOrder: 2,
    strengthVs: {
      defense: ["nickel", "dime"],
      coverage: ["man", "cover_1"],
      front: ["even"],
    },
    weaknessVs: {
      coverage: ["cover_3_sky"],
      front: ["bear"],
    },
  },

  // ============================================
  // 2. 2x2 Package (Balance & Flexibility)
  // ============================================
  {
    id: "pkg_2x2",
    name: "2x2 Package",
    philosophy: "balance_flexibility",
    summary: "Balanced 2 receivers each side. Hard to predict play direction, supports both run and pass equally.",
    formations: [
      {
        formationId: "formation_pro_right",
        role: "base",
        notes: "TE attached - run strength to right",
      },
      {
        formationId: "formation_pro_left",
        role: "variation",
        notes: "TE attached - run strength to left",
      },
      {
        formationId: "formation_split_back",
        role: "complement",
        situationBias: ["neutral_down"],
        notes: "2 backs - power run looks, PA opportunities",
      },
      {
        formationId: "formation_twins_right",
        role: "variation",
        notes: "Detached TE/WR - better pass releases",
      },
    ],
    personnel: ["11", "12", "21"],
    tags: ["balanced", "multiple", "run_pass"],
    installOrder: 1,
    strengthVs: {
      defense: ["base_43", "base_34"],
      coverage: ["cover_2", "cover_4"],
    },
    weaknessVs: {
      defense: ["dime"],
    },
  },

  // ============================================
  // 3. Bunch Package (Condensed Power)
  // ============================================
  {
    id: "pkg_bunch",
    name: "Bunch Package",
    philosophy: "condensed_power",
    summary: "3 receivers stacked tight. Creates natural picks/rubs, hard to press, excellent in tight spaces.",
    formations: [
      {
        formationId: "formation_bunch_right",
        role: "base",
        notes: "Primary bunch to right",
      },
      {
        formationId: "formation_bunch_left",
        role: "variation",
        notes: "Mirror bunch to left",
      },
      {
        formationId: "formation_tight_bunch",
        role: "complement",
        situationBias: ["redzone", "goal_line"],
        notes: "Extra tight split for maximum rub",
      },
      {
        formationId: "formation_nub_trips",
        role: "complement",
        notes: "Spread out slightly - confuse coverage calls",
      },
    ],
    personnel: ["11"],
    tags: ["condensed", "redzone", "picks", "rubs"],
    installOrder: 3,
    strengthVs: {
      coverage: ["man", "cover_1", "press"],
      defense: ["nickel"],
    },
    weaknessVs: {
      coverage: ["zone", "cover_3"],
    },
  },

  // ============================================
  // 4. Empty Package (Maximum Spread)
  // ============================================
  {
    id: "pkg_empty",
    name: "Empty Package",
    philosophy: "spread_the_defense",
    summary: "No backs in backfield. 5 eligible receivers, maximum horizontal stress, quick game emphasis.",
    formations: [
      {
        formationId: "formation_empty_trips",
        role: "base",
        notes: "3x2 empty - trips side dominant",
      },
      {
        formationId: "formation_empty_spread",
        role: "variation",
        notes: "Balanced 3x2 with even splits",
      },
      {
        formationId: "formation_empty_quads",
        role: "complement",
        situationBias: ["2_minute", "passing_down"],
        notes: "4x1 empty - overload one side",
      },
    ],
    personnel: ["10", "11"],
    tags: ["empty", "passing", "quick_game", "5_eligible"],
    installOrder: 5,
    strengthVs: {
      defense: ["dime", "quarters"],
      coverage: ["man", "cover_1"],
    },
    weaknessVs: {
      front: ["bear", "odd"],
      defense: ["zero_blitz"],
    },
  },

  // ============================================
  // 5. 12 Personnel Package (Heavy)
  // ============================================
  {
    id: "pkg_12_personnel",
    name: "12 Personnel Package",
    philosophy: "personnel_based",
    summary: "1 RB, 2 TEs. Run-first identity, forces base defense, play-action opportunities.",
    formations: [
      {
        formationId: "formation_12_pro",
        role: "base",
        notes: "Both TEs attached - power run set",
      },
      {
        formationId: "formation_12_spread",
        role: "variation",
        notes: "One TE detached - passing look",
      },
      {
        formationId: "formation_12_wing",
        role: "complement",
        situationBias: ["short_yardage", "goal_line"],
        notes: "Wing TE for power/counter",
      },
      {
        formationId: "formation_12_heavy",
        role: "complement",
        situationBias: ["goal_line"],
        notes: "Both TEs tight - max run blocking",
      },
    ],
    personnel: ["12"],
    tags: ["heavy", "run_first", "play_action", "base_defense"],
    installOrder: 4,
    strengthVs: {
      defense: ["base_43", "nickel"],
      front: ["odd", "under"],
    },
    weaknessVs: {
      defense: ["bear", "goal_line"],
    },
  },

  // ============================================
  // 6. Motion Package (Misdirection)
  // ============================================
  {
    id: "pkg_motion",
    name: "Motion Package",
    philosophy: "misdirection",
    summary: "Formations designed for pre-snap motion. Diagnose coverage, create blocking angles, confuse assignments.",
    formations: [
      {
        formationId: "formation_wing_motion",
        role: "base",
        notes: "Orbit motion from wing",
      },
      {
        formationId: "formation_jet_motion",
        role: "variation",
        notes: "Jet sweep action",
      },
      {
        formationId: "formation_shift_motion",
        role: "complement",
        notes: "Full shift + motion combo",
      },
    ],
    personnel: ["11", "12"],
    tags: ["motion", "misdirection", "coverage_read", "angles"],
    installOrder: 6,
    strengthVs: {
      coverage: ["zone", "cover_3", "cover_4"],
      defense: ["base_43"],
    },
    weaknessVs: {
      coverage: ["man_lock"],
    },
  },
];

// ============================================
// Package Utilities
// ============================================

export function getPackageById(packageId: string): FormationPackage | undefined {
  return FORMATION_PACKAGES.find((p) => p.id === packageId);
}

export function getPackageByFormation(formationId: string): FormationPackage | undefined {
  return FORMATION_PACKAGES.find((p) =>
    p.formations.some((f) => f.formationId === formationId)
  );
}

export function getPackagesByPhilosophy(philosophy: FormationPackagePhilosophy): FormationPackage[] {
  return FORMATION_PACKAGES.filter((p) => p.philosophy === philosophy);
}

export function getPackagesForPersonnel(personnel: Personnel): FormationPackage[] {
  return FORMATION_PACKAGES.filter((p) =>
    p.personnel?.includes(personnel)
  );
}

export function getPackagesForSituation(situation: string): FormationPackage[] {
  return FORMATION_PACKAGES.filter((p) =>
    p.formations.some((f) => f.situationBias?.includes(situation))
  );
}

// Get related formations within a package
export function getPackageFormations(packageId: string): {
  base: string[];
  variations: string[];
  complements: string[];
} {
  const pkg = getPackageById(packageId);
  if (!pkg) return { base: [], variations: [], complements: [] };

  return {
    base: pkg.formations.filter((f) => f.role === "base").map((f) => f.formationId),
    variations: pkg.formations.filter((f) => f.role === "variation").map((f) => f.formationId),
    complements: pkg.formations.filter((f) => f.role === "complement").map((f) => f.formationId),
  };
}

// Check if formation is strong vs a defense configuration
export function isPackageStrongVs(
  packageId: string,
  config: { defense?: string; coverage?: string; front?: string }
): boolean {
  const pkg = getPackageById(packageId);
  if (!pkg || !pkg.strengthVs) return false;

  let matchCount = 0;
  if (config.defense && pkg.strengthVs.defense?.includes(config.defense)) matchCount++;
  if (config.coverage && pkg.strengthVs.coverage?.includes(config.coverage)) matchCount++;
  if (config.front && pkg.strengthVs.front?.includes(config.front)) matchCount++;

  return matchCount > 0;
}

// Get recommended packages for a defensive look
export function getRecommendedPackages(
  defense?: string,
  coverage?: string,
  front?: string
): FormationPackage[] {
  return FORMATION_PACKAGES.filter((pkg) =>
    isPackageStrongVs(pkg.id, { defense, coverage, front })
  ).sort((a, b) => (a.installOrder || 99) - (b.installOrder || 99));
}

// Package philosophy descriptions
export const PHILOSOPHY_DESCRIPTIONS: Record<FormationPackagePhilosophy, string> = {
  spread_the_defense: "Maximize horizontal spacing to stretch the defense and create 1-on-1 matchups",
  condensed_power: "Stack receivers tight for picks, rubs, and leverage at the point of attack",
  balance_flexibility: "Balanced formations that support both run and pass without tipping tendency",
  misdirection: "Motion-heavy sets designed to create pre-snap confusion and diagnose coverage",
  personnel_based: "Built around specific personnel groupings (12, 21, 13) to force defensive adjustments",
};
