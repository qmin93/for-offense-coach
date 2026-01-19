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
          drill: {
            name: "Zone Step Drill",
            purpose: "OL lateral zone step technique",
            phase: "indy",
            url: "https://www.youtube.com/watch?v=1KbJmHBxhLI",
            source: "youtube",
            tags: ["OL", "zone"],
          },
        },
        {
          id: "fp_iz_read",
          name: "RB read & press",
          drill: {
            name: "Zone Read Drill",
            purpose: "RB presses hole and reads combo",
            phase: "group",
            url: "https://www.youtube.com/watch?v=qK8hvCPMW5I",
            source: "youtube",
            tags: ["RB", "read"],
          },
        },
        {
          id: "fp_iz_combo",
          name: "Combo block timing",
          drill: {
            name: "OL Combo Drill",
            purpose: "Double team to LB climb technique",
            phase: "group",
            url: "https://www.youtube.com/watch?v=CJlQ3kGQXXg",
            source: "youtube",
            tags: ["OL", "combo"],
          },
        },
      ],
    },
    searchAlias: "inside zone run",
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
          drill: {
            name: "Lead Block Drill",
            purpose: "FB iso through A-gap on LB",
            phase: "group",
            url: "https://www.youtube.com/watch?v=_VB4BwjQ7wg",
            source: "youtube",
            tags: ["FB", "lead", "iso"],
          },
        },
        {
          id: "fp_iso_ol",
          name: "OL down blocking",
          drill: {
            name: "Base Block Drill",
            purpose: "Secure down blocks at POA",
            phase: "indy",
            url: "https://www.youtube.com/watch?v=Y5D_LCGvH4Y",
            source: "youtube",
            tags: ["OL", "base"],
          },
        },
      ],
    },
    searchAlias: "iso isolation run",
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
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
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
          drill: {
            name: "Kick Block Drill",
            purpose: "FB/TE kick block on EMOL",
            phase: "group",
            url: "https://www.youtube.com/watch?v=5lhQp1YQOS0",
            source: "youtube",
            tags: ["FB", "TE", "kickout"],
          },
        },
        {
          id: "fp_power_pull",
          name: "Puller path",
          drill: {
            name: "Pull & Lead Drill",
            purpose: "Guard pull path to playside LB",
            phase: "indy",
            url: "https://www.youtube.com/watch?v=_u1ySj9E2PU",
            source: "youtube",
            tags: ["OL", "pull"],
          },
        },
        {
          id: "fp_power_rb",
          name: "RB patience",
          drill: {
            name: "Press & Cut Drill",
            purpose: "RB follows puller's hip",
            phase: "group",
            url: "https://www.youtube.com/watch?v=vg3YThN8rkY",
            source: "youtube",
            tags: ["RB", "gap"],
          },
        },
      ],
    },
    searchAlias: "power run gap scheme",
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
    searchAlias: "Counter run play",
    installFocus: {
      failurePoints: [
        {
          id: "fp_counter_timing",
          name: "Puller timing & path",
          drill: {
            id: "drill_pull_kick",
            name: "Pull & Kick Drill",
            purpose: "Guard/Tackle pull coordination",
            phase: "group",
            tags: ["OL", "pull", "kickout"],
          },
          videoRefs: [{ platform: "instagram", url: "https://instagram.com/p/counter1", accountName: "@olinedrills", hashtags: ["#counterdrill"] }],
        },
        {
          id: "fp_counter_rb",
          name: "RB press & cut decision",
          drill: {
            id: "drill_press_read",
            name: "Press Read Drill",
            purpose: "RB reads kick block and cuts",
            phase: "group",
            tags: ["RB", "read", "cutback"],
          },
        },
        {
          id: "fp_counter_kicklog",
          name: "Kick vs Log recognition",
          drill: {
            id: "drill_de_read",
            name: "DE Read Drill",
            purpose: "Kick or log based on DE",
            phase: "group",
            tags: ["OL", "kick", "log"],
          },
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
        { roleName: "BACKSIDE", appliesTo: ["LT", "LG"], defaultBlock: { scheme: "reach" } },
        { roleName: "PIN_TE", appliesTo: ["Y"], defaultBlock: { scheme: "seal" } },
        { roleName: "PIN_OL", appliesTo: ["RT"], defaultBlock: { scheme: "seal" } },
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
        { roleName: "BACKSIDE", appliesTo: ["LT", "LG", "C"], defaultBlock: { scheme: "reach" } },
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
        { roleName: "SEAL", appliesTo: ["Y"], defaultBlock: { scheme: "seal" } },
        { roleName: "ARC", appliesTo: ["H"], defaultBlock: { scheme: "arc" } },
        { roleName: "STALK", appliesTo: ["X"], defaultBlock: { scheme: "seal" } },
        { roleName: "MOTION", appliesTo: ["Z"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "FAKE", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
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
        { roleName: "LEAD_FB", appliesTo: ["FB"], defaultBlock: { scheme: "pull_lead" } },
        { roleName: "LEAD_RB", appliesTo: ["RB"], defaultBlock: { scheme: "pull_lead" } },
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

  // ============================================
  // Dive - FB Dive play
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_dive",
    name: "FB Dive",
    conceptType: "run",
    summary: "Quick hitting FB dive",
    badges: ["youth_friendly"],
    requirements: {
      preferredStructures: ["I", "ace"],
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "MAN", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "down" } },
        { roleName: "BALL", appliesTo: ["FB"], defaultBlock: { scheme: "down" } },
        { roleName: "FAKE", appliesTo: ["RB"], defaultBlock: { scheme: "down" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd", "even"],
      bestWhenBox: ["6", "7"],
      aim: "a_gap",
      category: "gap",
    },
  },

  // ============================================
  // Lead - Lead play with FB
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_lead",
    name: "Lead",
    conceptType: "run",
    summary: "FB leads for RB",
    badges: ["youth_friendly"],
    requirements: {
      preferredStructures: ["I", "ace"],
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "MAN", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "down" } },
        { roleName: "LEAD", appliesTo: ["FB"], defaultBlock: { scheme: "kick" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "down" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd", "even"],
      bestWhenBox: ["7", "8"],
      aim: "b_gap",
      category: "gap",
    },
  },

  // ============================================
  // Draw - Delayed handoff
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_draw",
    name: "Draw",
    conceptType: "run",
    summary: "Delayed handoff from pass look",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "3x1"],
      needsPuller: "none",
      boxTolerance: "6_ok",
    },
    template: {
      roles: [
        { roleName: "DRAW_SET", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "pass_set" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
      bestWhenBox: ["6"],
      aim: "a_b_gap",
      category: "gap",
    },
  },

  // ============================================
  // Speed Option - Quick pitch option
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_speed_option",
    name: "Speed Option",
    conceptType: "run",
    summary: "Quick pitch option to perimeter",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "3x1"],
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "REACH", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "reach" } },
        { roleName: "PITCH", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "READ", appliesTo: ["QB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
      bestWhenBox: ["6", "7"],
      aim: "c_gap",
      category: "perimeter",
    },
  },

  // ============================================
  // Load Option - Option with lead blocker
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_load_option",
    name: "Load Option",
    conceptType: "run",
    summary: "Option with FB lead blocker",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["I", "ace"],
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "ZONE", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "LOAD", appliesTo: ["FB"], defaultBlock: { scheme: "kick" } },
        { roleName: "PITCH", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "READ", appliesTo: ["QB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd", "even"],
      bestWhenBox: ["7", "8"],
      aim: "b_c_gap",
      category: "perimeter",
    },
  },

  // ============================================
  // Blast - Power without pulling guard
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_blast",
    name: "Blast",
    conceptType: "run",
    summary: "FB kicks out, RB follows",
    badges: ["youth_friendly"],
    requirements: {
      preferredStructures: ["I", "ace"],
      needsPuller: "none",
      boxTolerance: "8_risky",
    },
    template: {
      roles: [
        { roleName: "MAN", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "down" } },
        { roleName: "KICKOUT", appliesTo: ["FB"], defaultBlock: { scheme: "kick" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "down" } },
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

  // ============================================
  // Belly - Misdirection dive
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_belly",
    name: "Belly",
    conceptType: "run",
    summary: "Misdirection inside run",
    badges: ["youth_friendly"],
    requirements: {
      preferredStructures: ["I", "ace"],
      needsPuller: "none",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "ZONE", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "FAKE", appliesTo: ["FB"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd", "even"],
      bestWhenBox: ["6", "7"],
      aim: "b_gap",
      category: "zone",
    },
  },

  // ============================================
  // G/T Counter - Counter with both guards
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_gt_counter",
    name: "G/T Counter",
    conceptType: "run",
    summary: "Counter with guard and tackle pull",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "I"],
      needsPuller: "GT",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "PULL_G", appliesTo: ["RG"], defaultBlock: { scheme: "pull_lead" } },
        { roleName: "PULL_T", appliesTo: ["RT"], defaultBlock: { scheme: "wrap" } },
        { roleName: "DOWN", appliesTo: ["LT", "LG", "C"], defaultBlock: { scheme: "down" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd"],
      bestWhenBox: ["7", "8"],
      aim: "b_gap",
      category: "gap",
    },
  },

  // ============================================
  // Power Read - Power with RPO
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_power_read",
    name: "Power Read",
    conceptType: "run",
    summary: "Power blocking with QB read option",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "3x1"],
      needsPuller: "G",
      boxTolerance: "7_ok",
    },
    template: {
      roles: [
        { roleName: "PULL", appliesTo: ["LG"], defaultBlock: { scheme: "pull_lead" } },
        { roleName: "DOWN", appliesTo: ["LT", "C", "RG", "RT"], defaultBlock: { scheme: "down" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "READ_KEY", appliesTo: ["QB"], defaultBlock: { scheme: "zone_step" } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["odd", "even"],
      bestWhenBox: ["7", "8"],
      aim: "b_c_gap",
      category: "gap",
    },
  },

  // ============================================
  // Weak Zone - Zone to weak side
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_weak_zone",
    name: "Weak Zone",
    conceptType: "run",
    summary: "Zone run to weak side",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["3x1", "ace"],
      needsPuller: "none",
      boxTolerance: "6_ok",
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
      aim: "weak_a_b_gap",
      category: "zone",
    },
  },

  // ============================================
  // RPO Stick - Zone with stick RPO
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_rpo_stick",
    name: "RPO Stick",
    conceptType: "run",
    summary: "Inside zone with stick route option",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "3x1"],
      needsPuller: "none",
      boxTolerance: "6_ok",
    },
    template: {
      roles: [
        { roleName: "ZONE", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "STICK", appliesTo: ["Y"], defaultRoute: { pattern: "hitch", depth: 5 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
      bestWhenBox: ["6", "7"],
      aim: "a_b_gap",
      category: "zone",
    },
  },

  // ============================================
  // RPO Slant - Zone with slant option
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_run_rpo_slant",
    name: "RPO Slant",
    conceptType: "run",
    summary: "Inside zone with slant route option",
    badges: ["nfl_style"],
    requirements: {
      preferredStructures: ["2x2", "3x1"],
      needsPuller: "none",
      boxTolerance: "6_ok",
    },
    template: {
      roles: [
        { roleName: "ZONE", appliesTo: ["LT", "LG", "C", "RG", "RT"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "BALL", appliesTo: ["RB"], defaultBlock: { scheme: "zone_step" } },
        { roleName: "SLANT", appliesTo: ["Z"], defaultRoute: { pattern: "slant", depth: 6 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", runLandmarks: true },
    },
    runHints: {
      bestVsFront: ["even", "odd"],
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
