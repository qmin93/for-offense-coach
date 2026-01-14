// ============================================
// Run Concept Library (20 Concepts)
// Based on PRD & Business Plan
// ============================================

import type { Concept } from "../dsl/types";

export const RUN_CONCEPTS: Concept[] = [
  // ============================================
  // Core Inside (Zone)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_inside_zone",
    name: "Inside Zone",
    conceptType: "run",
    summary: "Zone blocking - A/B gap",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "3x1", "ace", "I"],
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "ZONE", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
      bestWhenBox: ["6", "7"],
      aim: "a_b_gap",
      category: "zone",
    },
    installFocus: {
      failurePoints: [
        {
          id: "fp_iz_footwork",
          name: "OL zone footwork",
          drill: { name: "Zone Step Drill", purpose: "OL lateral zone step technique", phase: "indy" },
        },
        {
          id: "fp_iz_read",
          name: "RB read & press",
          drill: { name: "Zone Read Drill", purpose: "RB presses hole and reads combo", phase: "group" },
        },
      ],
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_split_zone",
    name: "Split Zone",
    conceptType: "run",
    summary: "Zone + H-back slice",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["ace", "2x2"],
      needsTE: true,
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "ZONE", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "SPLIT", appliesTo: ["Y", "H"], defaultBlock: { scheme: "wham" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
      bestVs3T: ["strong"],
      bestWhenBox: ["7"],
      aim: "b_gap",
      category: "zone",
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_duo",
    name: "Duo",
    conceptType: "run",
    summary: "Double teams - vertical push",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "ace", "I"],
      needsPuller: "none",
      boxTolerance: "6_ok",
    },
    template: {
      roles: [
        { roleName: "COMBO", appliesTo: ["LG", "C", "RG"], defaultBlock: { scheme: "combo" } },
        { roleName: "DOWN", appliesTo: ["LT", "RT"], defaultBlock: { scheme: "down" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even"],
      bestWhenBox: ["6", "7"],
      aim: "a_b_gap",
      category: "zone",
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_iso",
    name: "Iso (Lead)",
    conceptType: "run",
    summary: "FB lead through A-gap",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["I", "ace"],
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "DOWN", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "down" } },
        { roleName: "LEAD", appliesTo: ["FB", "H"], defaultBlock: { scheme: "pull_lead" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd"],
      bestWhenBox: ["6", "7"],
      aim: "a_gap",
      category: "gap",
    },
    installFocus: {
      failurePoints: [
        {
          id: "fp_iso_lead",
          name: "FB lead path",
          drill: { name: "Lead Block Drill", purpose: "FB iso through A-gap on LB", phase: "group" },
        },
      ],
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_mid_zone",
    name: "Mid Zone",
    conceptType: "run",
    summary: "Zone to B-gap - vertical push",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "ace"],
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "COMBO", appliesTo: ["LG", "C", "RG"], defaultBlock: { scheme: "combo" } },
        { roleName: "ZONE", appliesTo: ["LT", "RT"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even"],
      bestWhenBox: ["7"],
      aim: "b_gap",
      category: "zone",
    },
  },

  // ============================================
  // Gap/Pull
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_power",
    name: "Power",
    conceptType: "run",
    summary: "G-pull + kick - gap scheme",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["I", "ace", "2x2"],
      needsPuller: "G",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "DOWN", appliesTo: ["LT", "LG", "C", "RT"], defaultBlock: { scheme: "down" } },
        { roleName: "KICK", appliesTo: ["FB", "H"], defaultBlock: { scheme: "kick" } },
        { roleName: "PULL", appliesTo: ["RG"], defaultBlock: { scheme: "pull_lead" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd", "even"],
      bestVs3T: ["weak"],
      bestWhenBox: ["7"],
      aim: "c_gap",
      category: "gap",
    },
    installFocus: {
      failurePoints: [
        {
          id: "fp_power_kick",
          name: "Kick block timing",
          drill: { name: "Kick Block Drill", purpose: "FB/TE kick block on EMOL", phase: "group" },
        },
        {
          id: "fp_power_pull",
          name: "Puller path",
          drill: { name: "Pull & Lead Drill", purpose: "Guard pull path to playside LB", phase: "indy" },
        },
        {
          id: "fp_power_rb",
          name: "RB patience",
          drill: { name: "Press & Cut Drill", purpose: "RB follows puller's hip", phase: "group" },
        },
      ],
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_counter",
    name: "Counter (GT)",
    conceptType: "run",
    summary: "Guard + Tackle pull - misdirection",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["I", "ace", "2x2"],
      needsPuller: "GT",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "DOWN", appliesTo: ["LT", "LG", "C"], defaultBlock: { scheme: "down" } },
        { roleName: "KICK", appliesTo: ["RT"], defaultBlock: { scheme: "pull_kick" } },
        { roleName: "WRAP", appliesTo: ["RG"], defaultBlock: { scheme: "wrap" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
      bestVs3T: ["strong"],
      bestWhenBox: ["7", "8"],
      aim: "b_c_gap",
      category: "gap",
    },
    installFocus: {
      failurePoints: [
        {
          id: "fp_counter_timing",
          name: "Puller timing & path",
          drill: { name: "Pull & Kick Drill", purpose: "Guard/Tackle pull coordination", phase: "group" },
          videoRefs: [{ platform: "instagram", url: "https://instagram.com/p/counter1", accountName: "@olinedrills", hashtags: ["#counterdrill"] }],
        },
        {
          id: "fp_counter_rb",
          name: "RB press & cut decision",
          drill: { name: "Press Read Drill", purpose: "RB reads kick block and cuts", phase: "group" },
        },
        {
          id: "fp_counter_kicklog",
          name: "Kick vs Log recognition",
          drill: { name: "DE Read Drill", purpose: "Kick or log based on DE", phase: "group" },
        },
      ],
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_trap",
    name: "Trap",
    conceptType: "run",
    summary: "Trap penetrating DT",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["I", "ace"],
      needsPuller: "G",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "DOWN", appliesTo: ["LT", "C", "RG", "RT"], defaultBlock: { scheme: "down" } },
        { roleName: "TRAP", appliesTo: ["LG"], defaultBlock: { scheme: "trap" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even"],
      bestVs3T: ["strong", "weak"],
      bestWhenBox: ["7"],
      aim: "b_gap",
      category: "gap",
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_pin_pull",
    name: "Pin-Pull",
    conceptType: "run",
    summary: "Pin + pull - perimeter gap",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["ace", "3x1"],
      needsTE: true,
      needsPuller: "G",
      boxTolerance: "6_ok",
    },
    template: {
      roles: [
        { roleName: "PIN", appliesTo: ["Y", "RT"], defaultBlock: { scheme: "seal" } },
        { roleName: "PULL", appliesTo: ["RG", "C"], defaultBlock: { scheme: "pull_lead" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
      bestWhenBox: ["6"],
      aim: "edge",
      category: "gap",
    },
  },

  // ============================================
  // Perimeter
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_outside_zone",
    name: "Outside Zone",
    conceptType: "run",
    summary: "Zone to edge - stretch",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "ace", "3x1"],
      needsPuller: "none",
      boxTolerance: "6_ok",
    },
    template: {
      roles: [
        { roleName: "REACH", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "reach" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
      bestWhenBox: ["6"],
      aim: "edge",
      category: "zone",
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_stretch",
    name: "Stretch (Wide Zone)",
    conceptType: "run",
    summary: "Fast flow to edge",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "ace"],
      needsPuller: "none",
      boxTolerance: "6_ok",
    },
    template: {
      roles: [
        { roleName: "REACH", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "reach" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd"],
      bestWhenBox: ["6"],
      aim: "edge",
      category: "zone",
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_toss",
    name: "Toss",
    conceptType: "run",
    summary: "Pitch to RB - edge run",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["I", "ace"],
      needsPuller: "G",
      boxTolerance: "6_ok",
    },
    template: {
      roles: [
        { roleName: "CRACK", appliesTo: ["Z", "Y"], defaultBlock: { scheme: "seal" } },
        { roleName: "LEAD", appliesTo: ["FB", "H"], defaultBlock: { scheme: "pull_lead" } },
        { roleName: "PULL", appliesTo: ["RG", "RT"], defaultBlock: { scheme: "pull_lead" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd"],
      bestWhenBox: ["6"],
      aim: "edge",
      category: "perimeter",
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_jet_sweep",
    name: "Jet Sweep",
    conceptType: "run",
    summary: "Motion + handoff - speed sweep",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "3x1"],
      needsPuller: "none",
      boxTolerance: "6_ok",
    },
    template: {
      roles: [
        { roleName: "REACH", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "reach" } },
        { roleName: "SEAL", appliesTo: ["Y", "H"], defaultBlock: { scheme: "seal" } },
        { roleName: "MOTION", appliesTo: ["Z", "X"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
      bestWhenBox: ["6"],
      aim: "edge",
      category: "perimeter",
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_buck_sweep",
    name: "Buck Sweep",
    conceptType: "run",
    summary: "Both guards pull - perimeter",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["I", "ace"],
      needsPuller: "G",
      boxTolerance: "6_ok",
    },
    template: {
      roles: [
        { roleName: "DOWN", appliesTo: ["LT", "C", "RT"], defaultBlock: { scheme: "down" } },
        { roleName: "PULL", appliesTo: ["LG", "RG"], defaultBlock: { scheme: "pull_lead" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd"],
      bestWhenBox: ["6", "7"],
      aim: "edge",
      category: "gap",
    },
  },

  // ============================================
  // Specialty
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_wham",
    name: "Wham",
    conceptType: "run",
    summary: "TE/FB wham on DT",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["ace", "I"],
      needsTE: true,
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "DOWN", appliesTo: ["LT", "LG", "RG", "RT"], defaultBlock: { scheme: "down" } },
        { roleName: "WHAM", appliesTo: ["Y", "FB", "H"], defaultBlock: { scheme: "wham" } },
        { roleName: "CLIMB", appliesTo: ["C"], defaultBlock: { scheme: "climb" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd"],
      bestVs3T: ["strong", "weak"],
      bestWhenBox: ["7"],
      aim: "a_b_gap",
      category: "gap",
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_qb_power",
    name: "QB Power",
    conceptType: "run",
    summary: "Power with QB as ball carrier",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "ace"],
      needsPuller: "G",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "DOWN", appliesTo: ["LT", "LG", "C", "RT"], defaultBlock: { scheme: "down" } },
        { roleName: "PULL", appliesTo: ["RG"], defaultBlock: { scheme: "pull_lead" } },
        { roleName: "LEAD", appliesTo: ["RB", "FB"], defaultBlock: { scheme: "pull_lead" } },
        { roleName: "BALL", appliesTo: ["QB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd", "even"],
      bestWhenBox: ["7", "8"],
      aim: "c_gap",
      category: "gap",
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_zone_read",
    name: "Zone Read",
    conceptType: "run",
    summary: "Zone + QB read on DE",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "3x1"],
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "ZONE", appliesTo: ["LT", "LG", "C", "RG"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "READ", appliesTo: ["RT"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
      bestWhenBox: ["7"],
      aim: "a_b_gap",
      category: "zone",
    },
    installFocus: {
      failurePoints: [
        {
          id: "fp_zr_mesh",
          name: "Mesh point timing",
          drill: { name: "Mesh Point Drill", purpose: "QB-RB mesh timing", phase: "group" },
        },
        {
          id: "fp_zr_read",
          name: "QB read key",
          drill: { name: "Read Key Drill", purpose: "QB reads EMOL for give/keep", phase: "group" },
        },
      ],
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_rpo_base",
    name: "RPO (Run Base)",
    conceptType: "run",
    summary: "Run with pass tag option",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "3x1"],
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "ZONE", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
      bestWhenBox: ["7", "8"],
      aim: "a_b_gap",
      category: "zone",
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_insert",
    name: "Insert",
    conceptType: "run",
    summary: "WR/RB insert blocker",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "3x1"],
      needsPuller: "none",
      boxTolerance: "6_ok",
    },
    template: {
      roles: [
        { roleName: "ZONE", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "INSERT", appliesTo: ["H", "RB"], defaultBlock: { scheme: "sift" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd"],
      bestWhenBox: ["6", "7"],
      aim: "a_b_gap",
      category: "zone",
    },
  },
];

export function getRunConceptById(id: string): Concept | undefined {
  return RUN_CONCEPTS.find((c) => c.id === id);
}

export function getRunConceptsByCategory(category: string): Concept[] {
  return RUN_CONCEPTS.filter((c) => c.runHints?.category === category);
}

export function getRunConceptsForFormation(structure: string): Concept[] {
  return RUN_CONCEPTS.filter((c) =>
    c.requirements?.preferredStructures?.includes(structure as any)
  );
}
