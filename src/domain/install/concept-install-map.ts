// ============================================
// Concept Install Map
// Automatically links concepts to relevant drills
// ============================================

import type { Concept } from "../dsl/types";
import {
  ALL_DRILLS,
  getDrillById,
  type Drill,
} from "../engine/install-drills";

// ============================================
// Types
// ============================================

export interface ConceptInstallMapping {
  conceptFamily: string;
  drillIds: string[];
  teachingCues: string[];
  failurePoints: string[];
}

export interface InstallFocusComplete {
  teachingCues: string[];
  failurePoints: Array<{
    id: string;
    name: string;
    drill?: Drill;
  }>;
  drills: Drill[];
}

// ============================================
// Family-based Drill Mappings
// Based on MEGA EXPANSION PLAN rules
// ============================================

// Zone family: OL zone step, combo, reach + RB press/read + QB mesh + WR stalk
const ZONE_DRILLS = [
  "drill_zone_step",
  "drill_combo_block",
  "drill_reach_block",
  "drill_zone_read",
  "drill_mesh_point",
  "drill_press_cut",
];

// Gap/Power family: OL pull, kickout/log, down block + RB aiming point + TE down block
const GAP_DRILLS = [
  "drill_pull_kick",
  "drill_down_block",
  "drill_trap_path",
  "drill_press_cut",
  "drill_zone_read", // RB read still applies
];

// Quick Game: WR route stem, release + QB 3-step + OL pass set
const QUICK_DRILLS = [
  "drill_6yd_hitch",
  "drill_slant_release",
  "drill_qb_footwork",
  "drill_pass_set",
  "drill_flat_route",
];

// Dropback: QB 5/7-step + WR top of route + OL pass set + TE chip
const DROPBACK_DRILLS = [
  "drill_qb_footwork",
  "drill_comeback_curl",
  "drill_dig_cross",
  "drill_vertical_stem",
  "drill_pass_set",
  "drill_pocket_move",
];

// Screens: OL screen release + RB/WR screen catch + QB ball handling
const SCREEN_DRILLS = [
  "drill_toss_sweep",
  "drill_flat_route",
  "drill_qb_footwork",
];

// RPO: QB rpo read + OL run rules + WR spacing
const RPO_DRILLS = [
  "drill_read_key",
  "drill_mesh_point",
  "drill_zone_step",
  "drill_6yd_hitch",
  "drill_high_low",
];

// Perimeter: OL reach + RB edge + WR/TE seal
const PERIMETER_DRILLS = [
  "drill_reach_block",
  "drill_toss_sweep",
  "drill_zone_read",
];

// ============================================
// Teaching Cues by Family
// ============================================

const ZONE_CUES = [
  "First step is a flat step laterally, not a bucket step",
  "Eyes on combo target, then climb to 2nd level",
  "RB: Press the line, one cut, go - trust your eyes",
  "Communication: 'Combo' call between adjacent linemen",
  "Zone footwork: overtake, not shoot-the-gap",
];

const GAP_CUES = [
  "Down blockers: First step toward playside gap",
  "Pullers: Flat path, head on a swivel for EMOL",
  "Kick vs Log decision based on DE technique",
  "RB: Follow puller's hip, be patient",
  "Finish every block - drive through contact",
];

const QUICK_CUES = [
  "QB: 3-step timing - plant and throw",
  "WR: Sell vertical, snap break at depth",
  "Hot route vs blitz - know your adjustment",
  "OL: Quick set, hands ready immediately",
  "Ball placement beats coverage",
];

const DROPBACK_CUES = [
  "QB: 5/7-step rhythm, hitch in pocket",
  "WR: Top of route - snap hips, create separation",
  "Read progression: Work inside-out or high-low",
  "OL: Kick step, mirror the rusher",
  "Find throwing windows between zones",
];

const SCREEN_CUES = [
  "Sell pass protection first, then release",
  "WR/RB: Expect the ball quickly, turn upfield",
  "OL: Get out in space, find color",
  "QB: Ball handling - look pass off before screen",
  "Timing is everything - don't release early",
];

const RPO_CUES = [
  "Read the key defender pre-snap",
  "Zone blocking rules stay the same",
  "Quick throw = give, no throw = run",
  "QB eyes can manipulate defender",
  "Keep route timing tight to LOS",
];

// ============================================
// Failure Points by Family
// ============================================

const ZONE_FAILURES = [
  "OL takes bucket step instead of flat step",
  "RB doesn't press LOS before cutting",
  "Combo blocks don't get movement before climb",
  "Poor hand placement on initial punch",
  "RB makes second cut instead of one-cut",
];

const GAP_FAILURES = [
  "Puller takes too deep a path",
  "Kick/Log decision made too late",
  "Down blockers don't get proper angle",
  "RB doesn't follow puller's hip",
  "Trap puller telegraphs the play",
];

const QUICK_FAILURES = [
  "QB doesn't hit 3-step timing",
  "WR breaks at wrong depth",
  "Hot route adjustment missed vs blitz",
  "Ball placement too high/low",
  "OL doesn't recognize quick pressure",
];

const DROPBACK_FAILURES = [
  "QB drifts in pocket instead of stepping up",
  "WR rounds off routes at top",
  "Read progression abandoned too quickly",
  "OL oversets and gives up inside rush",
  "No adjustments vs coverage rotation",
];

const SCREEN_FAILURES = [
  "OL releases too early (tipping play)",
  "WR/RB looks back before catching",
  "QB stares at screen target",
  "Blockers don't get to 2nd level",
  "Poor timing between throw and blocks",
];

const RPO_FAILURES = [
  "QB doesn't read correct key",
  "Linemen get downfield on pass",
  "Route timing not synced with mesh",
  "RB and QB miscommunication on mesh",
  "Throw made despite pull read",
];

// ============================================
// Main Mapping Function
// ============================================

export function getConceptFamily(concept: Concept): string {
  // Run concepts
  if (concept.conceptType === "run") {
    const category = concept.runHints?.category;
    if (category === "zone") return "zone";
    if (category === "gap") return "gap";
    if (category === "perimeter") return "perimeter";
    return "gap"; // default for run
  }

  // Pass concepts
  if (concept.conceptType === "pass") {
    const category = concept.passHints?.category;
    if (category === "quick") return "quick";
    if (category === "intermediate") return "dropback";
    if (category === "deep") return "dropback";
    if (category === "screen") return "screen";
    return "dropback"; // default for pass
  }

  // RPO (hybrid)
  if (concept.id.includes("rpo")) return "rpo";

  return "zone"; // fallback
}

export function getDrillsForFamily(family: string): string[] {
  switch (family) {
    case "zone":
      return ZONE_DRILLS;
    case "gap":
      return GAP_DRILLS;
    case "quick":
      return QUICK_DRILLS;
    case "dropback":
      return DROPBACK_DRILLS;
    case "screen":
      return SCREEN_DRILLS;
    case "rpo":
      return RPO_DRILLS;
    case "perimeter":
      return PERIMETER_DRILLS;
    default:
      return ZONE_DRILLS;
  }
}

export function getCuesForFamily(family: string): string[] {
  switch (family) {
    case "zone":
      return ZONE_CUES;
    case "gap":
      return GAP_CUES;
    case "quick":
      return QUICK_CUES;
    case "dropback":
      return DROPBACK_CUES;
    case "screen":
      return SCREEN_CUES;
    case "rpo":
      return RPO_CUES;
    case "perimeter":
      return [...ZONE_CUES.slice(0, 2), ...GAP_CUES.slice(0, 3)];
    default:
      return ZONE_CUES;
  }
}

export function getFailuresForFamily(family: string): string[] {
  switch (family) {
    case "zone":
      return ZONE_FAILURES;
    case "gap":
      return GAP_FAILURES;
    case "quick":
      return QUICK_FAILURES;
    case "dropback":
      return DROPBACK_FAILURES;
    case "screen":
      return SCREEN_FAILURES;
    case "rpo":
      return RPO_FAILURES;
    case "perimeter":
      return [...ZONE_FAILURES.slice(0, 2), ...GAP_FAILURES.slice(0, 3)];
    default:
      return ZONE_FAILURES;
  }
}

// ============================================
// Auto-attach Install Focus
// ============================================

export function attachDefaultInstall(concept: Concept): Concept {
  // If already has complete installFocus, return as-is
  if (
    concept.installFocus &&
    concept.installFocus.failurePoints &&
    concept.installFocus.failurePoints.length >= 3
  ) {
    return concept;
  }

  const family = getConceptFamily(concept);
  const drillIds = getDrillsForFamily(family);
  const cues = getCuesForFamily(family);
  const failures = getFailuresForFamily(family);

  // Build failure points with drills
  const failurePoints = failures.slice(0, 5).map((failure, idx) => {
    const drill = getDrillById(drillIds[idx]);
    return {
      id: `fp_${concept.id}_${idx}`,
      name: failure,
      drill: drill
        ? {
            id: drill.id,
            name: drill.name,
            purpose: drill.purpose,
            phase: drill.phase,
            tags: drill.tags,
          }
        : {
            // Fallback drill for type safety
            id: `drill_placeholder_${idx}`,
            name: "Practice Drill",
            purpose: failure,
            phase: "group" as const,
            tags: [],
          },
    };
  });

  return {
    ...concept,
    installFocus: {
      ...concept.installFocus,
      failurePoints,
    },
  } as Concept;
}

// ============================================
// Get Complete Install Focus for Display
// ============================================

export function getCompleteInstallFocus(
  concept: Concept
): InstallFocusComplete {
  const family = getConceptFamily(concept);
  const drillIds = getDrillsForFamily(family);
  const cues = getCuesForFamily(family);
  const failures = getFailuresForFamily(family);

  // Get drills from IDs
  const drills = drillIds
    .map((id) => getDrillById(id))
    .filter((d): d is Drill => d !== undefined);

  // Build failure points
  const failurePoints = failures.map((failure, idx) => ({
    id: `fp_${concept.id}_${idx}`,
    name: failure,
    drill: drills[idx],
  }));

  // Merge with existing installFocus if present
  const existingCues = (concept.installFocus as any)?.teachingCues || [];
  const existingFailures = concept.installFocus?.failurePoints || [];

  return {
    teachingCues: [...new Set([...existingCues, ...cues])].slice(0, 8),
    failurePoints:
      existingFailures.length > 0
        ? existingFailures.map((fp: any, idx: number) => ({
            id: fp.id || `fp_${concept.id}_${idx}`,
            name: fp.name,
            drill: fp.drill
              ? getDrillById(fp.drill.id || fp.drill.name) || fp.drill
              : drills[idx],
          }))
        : failurePoints,
    drills,
  };
}

// ============================================
// Utility: Validate Install Focus Gate
// ============================================

export function validateInstallFocusGate(
  concept: Concept
): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const installFocus = getCompleteInstallFocus(concept);

  if (installFocus.teachingCues.length < 3) {
    issues.push(
      `Teaching cues: ${installFocus.teachingCues.length}/3 (need 3+)`
    );
  }

  if (installFocus.failurePoints.length < 3) {
    issues.push(
      `Failure points: ${installFocus.failurePoints.length}/3 (need 3+)`
    );
  }

  if (installFocus.drills.length < 3) {
    issues.push(`Drills: ${installFocus.drills.length}/3 (need 3+)`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
