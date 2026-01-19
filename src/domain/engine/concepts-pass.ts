// ============================================
// Pass Concept Library (20 Concepts)
// Based on PRD & Business Plan
// ============================================

import type { Concept } from "../dsl/types";

export const PASS_CONCEPTS: Concept[] = [
  // ============================================
  // Quick Game (Quick)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_stick",
    name: "Stick",
    conceptType: "pass",
    summary: "Flat defender conflict - hitch/flat combo",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1"],
      personnelHints: ["11", "12"],
    },
    template: {
      roles: [
        { roleName: "STICK", appliesTo: ["Y"], defaultRoute: { pattern: "hitch", depth: 6 } },
        { roleName: "FLAT", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
        { roleName: "CLEAR", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "BACKSIDE_CLEAR", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", defaultSide: "right" },
    },
    passHints: { category: "quick", manBeater: false, zoneBeater: true, stress: ["flat_conflict"] },
    searchAlias: "Stick route concept",
    installFocus: {
      failurePoints: [
        {
          id: "fp_stick_depth",
          name: "Stick route depth consistency",
          drill: {
            id: "drill_6yd_hitch",
            name: "6-Yard Hitch Drill",
            purpose: "Consistent 6yd depth on stick route",
            phase: "indy",
            tags: ["WR", "route", "hitch"],
          },
          videoRefs: [{ platform: "instagram", url: "https://instagram.com/p/stick1", accountName: "@qbdrills", hashtags: ["#stickroute"] }],
        },
        {
          id: "fp_flat_timing",
          name: "Flat route timing vs zone",
          drill: {
            id: "drill_flat_timing",
            name: "Flat Timing Drill",
            purpose: "RB timing on flat route",
            phase: "group",
            tags: ["RB", "route", "flat", "timing"],
          },
        },
      ],
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_spacing",
    name: "Spacing",
    conceptType: "pass",
    summary: "Horizontal stretch - 5 receivers across",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["2x2", "3x1", "empty"],
    },
    template: {
      roles: [
        { roleName: "OUTSIDE", appliesTo: ["Z"], defaultRoute: { pattern: "speed_out", depth: 5 } },
        { roleName: "BACKSIDE_OUT", appliesTo: ["X"], defaultRoute: { pattern: "speed_out", depth: 5 } },
        { roleName: "SLOT", appliesTo: ["H"], defaultRoute: { pattern: "hitch", depth: 6 } },
        { roleName: "SLOT_WEAK", appliesTo: ["Y"], defaultRoute: { pattern: "hitch", depth: 6 } },
        { roleName: "MIDDLE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 3 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "quick", zoneBeater: true, stress: ["horizontal"] },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_slant_flat",
    name: "Slant/Flat",
    conceptType: "pass",
    summary: "High-low on flat defender",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "SLANT", appliesTo: ["Z"], defaultRoute: { pattern: "slant", depth: 6, breakAngleDeg: 45 } },
        { roleName: "BACKSIDE_SLANT", appliesTo: ["X"], defaultRoute: { pattern: "slant", depth: 6 } },
        { roleName: "FLAT", appliesTo: ["H"], defaultRoute: { pattern: "arrow", depth: 2 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
        { roleName: "SEAM", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 12 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "quick", manBeater: true, zoneBeater: true, stress: ["flat_conflict"] },
  },

  // ============================================
  // Intermediate
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_mesh",
    name: "Mesh",
    conceptType: "pass",
    summary: "Crossing routes - man beater",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["2x2", "3x1", "bunch"],
    },
    template: {
      roles: [
        { roleName: "MESH1", appliesTo: ["H"], defaultRoute: { pattern: "shallow", depth: 2, direction: "inside" } },
        { roleName: "MESH2", appliesTo: ["Y"], defaultRoute: { pattern: "shallow", depth: 3, direction: "inside" } },
        { roleName: "CLEAR", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "BACKSIDE_CLEAR", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "FLAT", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "intermediate", manBeater: true, stress: ["crossing", "rub"] },
    installFocus: {
      failurePoints: [
        {
          id: "fp_mesh_depth",
          name: "Mesh point depth",
          drill: { name: "Mesh Point Drill", purpose: "Crossers at correct depth (2-3 yds)", phase: "group" },
        },
        {
          id: "fp_mesh_eye",
          name: "QB mesh read",
          drill: { name: "Mesh Read Drill", purpose: "QB reads inside-out on mesh", phase: "group" },
        },
      ],
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_drive",
    name: "Drive (Shallow Cross)",
    conceptType: "pass",
    summary: "Shallow + dig combo",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "SHALLOW", appliesTo: ["Y"], defaultRoute: { pattern: "shallow", depth: 2 } },
        { roleName: "DIG", appliesTo: ["Z"], defaultRoute: { pattern: "dig", depth: 12 } },
        { roleName: "CLEAR", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "PROTECT", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 1 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "intermediate", manBeater: true, zoneBeater: true },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_levels",
    name: "Levels",
    conceptType: "pass",
    summary: "3 level zone stretch",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["3x1", "bunch"],
    },
    template: {
      roles: [
        { roleName: "DEEP", appliesTo: ["Z"], defaultRoute: { pattern: "dig", depth: 15 } },
        { roleName: "INTERMEDIATE", appliesTo: ["Y"], defaultRoute: { pattern: "out", depth: 10 } },
        { roleName: "SHORT", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "BACKSIDE_CLEAR", appliesTo: ["X"], defaultRoute: { pattern: "post", depth: 18 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "intermediate", zoneBeater: true, stress: ["vertical_layers"] },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_curl_flat",
    name: "Curl/Flat",
    conceptType: "pass",
    summary: "Curl + flat - high/low",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2"],
    },
    template: {
      roles: [
        { roleName: "CURL", appliesTo: ["Z"], defaultRoute: { pattern: "curl", depth: 12 } },
        { roleName: "BACKSIDE_CURL", appliesTo: ["X"], defaultRoute: { pattern: "curl", depth: 12 } },
        { roleName: "FLAT", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "SEAM", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 15 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "intermediate", zoneBeater: true, stress: ["flat_conflict"] },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_smash",
    name: "Smash",
    conceptType: "pass",
    summary: "Corner/hitch combo",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "bunch"],
    },
    template: {
      roles: [
        { roleName: "CORNER", appliesTo: ["Z"], defaultRoute: { pattern: "corner", depth: 12 } },
        { roleName: "HITCH", appliesTo: ["H"], defaultRoute: { pattern: "hitch", depth: 5 } },
        { roleName: "BACKSIDE_CLEAR", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "SEAM", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 15 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "intermediate", zoneBeater: true, stress: ["corner_flat"] },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_all_curls",
    name: "All Curls",
    conceptType: "pass",
    summary: "4 curls - zone soft spots",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 4,
      preferredStructures: ["2x2"],
    },
    template: {
      roles: [
        { roleName: "CURL_OUTSIDE", appliesTo: ["Z"], defaultRoute: { pattern: "curl", depth: 12 } },
        { roleName: "CURL_BACKSIDE", appliesTo: ["X"], defaultRoute: { pattern: "curl", depth: 12 } },
        { roleName: "CURL_SLOT", appliesTo: ["H"], defaultRoute: { pattern: "curl", depth: 10 } },
        { roleName: "CURL_TE", appliesTo: ["Y"], defaultRoute: { pattern: "curl", depth: 10 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "intermediate", zoneBeater: true, stress: ["zone_windows"] },
  },

  // ============================================
  // Deep
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_flood",
    name: "Flood",
    conceptType: "pass",
    summary: "3-level outside stretch vs zone",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["3x1", "bunch"],
    },
    template: {
      roles: [
        { roleName: "CLEAR", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "INTERMEDIATE", appliesTo: ["Y"], defaultRoute: { pattern: "deep_out", depth: 12 } },
        { roleName: "FLAT", appliesTo: ["H"], defaultRoute: { pattern: "arrow", depth: 2 } },
        { roleName: "BACKSIDE_POST", appliesTo: ["X"], defaultRoute: { pattern: "post", depth: 18 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment", defaultSide: "right" },
    },
    passHints: { category: "deep", zoneBeater: true, stress: ["horizontal", "flat_conflict"] },
    installFocus: {
      failurePoints: [
        {
          id: "fp_flood_clear",
          name: "Clear route depth",
          drill: { name: "Vertical Stem Drill", purpose: "18yd vertical stem on clear", phase: "indy" },
        },
        {
          id: "fp_flood_timing",
          name: "3-level timing",
          drill: { name: "Flood Timing Drill", purpose: "All 3 levels break simultaneously", phase: "group" },
        },
      ],
    },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_verts",
    name: "4 Verts",
    conceptType: "pass",
    summary: "4 vertical routes - stress deep",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 4,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "OUTSIDE", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "SEAM_STRONG", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 18 } },
        { roleName: "SEAM_WEAK", appliesTo: ["H"], defaultRoute: { pattern: "seam", depth: 18 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", stress: ["vertical", "deep_middle"] },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_dagger",
    name: "Dagger",
    conceptType: "pass",
    summary: "Post + dig - MOF attack",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2"],
    },
    template: {
      roles: [
        { roleName: "POST", appliesTo: ["Z"], defaultRoute: { pattern: "post", depth: 15 } },
        { roleName: "DIG", appliesTo: ["Y"], defaultRoute: { pattern: "dig", depth: 12 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "FLAT", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", zoneBeater: true, stress: ["mof", "high_low"] },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_y_cross",
    name: "Y-Cross",
    conceptType: "pass",
    summary: "Over route + crossing",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["3x1"],
    },
    template: {
      roles: [
        { roleName: "OVER", appliesTo: ["Y"], defaultRoute: { pattern: "cross", depth: 15 } },
        { roleName: "CLEAR", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "UNDER", appliesTo: ["H"], defaultRoute: { pattern: "shallow", depth: 3 } },
        { roleName: "BACKSIDE_POST", appliesTo: ["X"], defaultRoute: { pattern: "post", depth: 18 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", manBeater: true, stress: ["crossing", "mof"] },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_sail",
    name: "Sail",
    conceptType: "pass",
    summary: "Corner/out/flat - outside layer",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["3x1", "2x2"],
    },
    template: {
      roles: [
        { roleName: "CORNER", appliesTo: ["Z"], defaultRoute: { pattern: "corner", depth: 15 } },
        { roleName: "OUT", appliesTo: ["Y"], defaultRoute: { pattern: "out", depth: 8 } },
        { roleName: "FLAT", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
        { roleName: "BACKSIDE_POST", appliesTo: ["X"], defaultRoute: { pattern: "post", depth: 18 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["H"], defaultRoute: { pattern: "shallow", depth: 3 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", zoneBeater: true, stress: ["outside_layers"] },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_post_dig",
    name: "Post/Dig",
    conceptType: "pass",
    summary: "MOF read - post over dig",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2"],
    },
    template: {
      roles: [
        { roleName: "POST", appliesTo: ["Z"], defaultRoute: { pattern: "post", depth: 15 } },
        { roleName: "DIG", appliesTo: ["Y"], defaultRoute: { pattern: "dig", depth: 12 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "FLAT", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", zoneBeater: true, stress: ["mof"] },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_hitch_seam",
    name: "Hitch/Seam",
    conceptType: "pass",
    summary: "Seam stress with underneath",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2"],
    },
    template: {
      roles: [
        { roleName: "SEAM_STRONG", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 15 } },
        { roleName: "SEAM_WEAK", appliesTo: ["H"], defaultRoute: { pattern: "seam", depth: 15 } },
        { roleName: "HITCH", appliesTo: ["Z"], defaultRoute: { pattern: "hitch", depth: 6 } },
        { roleName: "HITCH_BACK", appliesTo: ["X"], defaultRoute: { pattern: "hitch", depth: 6 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", stress: ["seam"] },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_switch_verts",
    name: "Switch Verts",
    conceptType: "pass",
    summary: "Leverage confusion - switch releases",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["3x1"],
    },
    template: {
      roles: [
        { roleName: "SWITCH_OUT", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "SWITCH_IN", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 15 } },
        { roleName: "BACKSIDE", appliesTo: ["X"], defaultRoute: { pattern: "post", depth: 15 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "PROTECT", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 1 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", manBeater: true, stress: ["leverage"] },
  },

  // ============================================
  // Screens
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_rb_screen",
    name: "RB Screen",
    conceptType: "pass",
    summary: "Slow screen to RB",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 1,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "SCREEN", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: -2 } },
        { roleName: "CLEAR_GO", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "BLOCK_CRACK", appliesTo: ["Y"], defaultRoute: { pattern: "hitch", depth: 2 } },
        { roleName: "BLOCK_STALK", appliesTo: ["H"], defaultRoute: { pattern: "hitch", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "screen", stress: ["pressure_beater"] },
  },
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_wr_screen",
    name: "WR Screen",
    conceptType: "pass",
    summary: "Quick screen to WR",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 1,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "SCREEN", appliesTo: ["Z"], defaultRoute: { pattern: "flat", depth: 0 } },
        { roleName: "BLOCK_STALK", appliesTo: ["H"], defaultRoute: { pattern: "hitch", depth: 2 } },
        { roleName: "BLOCK_CRACK", appliesTo: ["Y"], defaultRoute: { pattern: "hitch", depth: 2 } },
        { roleName: "BACKSIDE_CLEAR", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "screen", stress: ["quick_game"] },
  },

  // ============================================
  // Four Verticals - Deep stretch
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_four_verts",
    name: "Four Verts",
    conceptType: "pass",
    summary: "4 receivers run vertical routes",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 4,
      preferredStructures: ["2x2", "empty"],
    },
    template: {
      roles: [
        { roleName: "X_VERT", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 25 } },
        { roleName: "Z_VERT", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 25 } },
        { roleName: "SLOT_VERT", appliesTo: ["H"], defaultRoute: { pattern: "seam", depth: 20 } },
        { roleName: "Y_VERT", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 20 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", stress: ["cover3", "cover1"] },
  },

  // ============================================
  // China (Bench) - TE option route
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_china",
    name: "China",
    conceptType: "pass",
    summary: "TE option route with flat",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["ace", "2x2"],
    },
    template: {
      roles: [
        { roleName: "BENCH", appliesTo: ["Y"], defaultRoute: { pattern: "curl", depth: 12 } },
        { roleName: "FLAT", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 2 } },
        { roleName: "CLEAR", appliesTo: ["Z"], defaultRoute: { pattern: "corner", depth: 18 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "intermediate", stress: ["cover2", "cover4"] },
  },

  // ============================================
  // Snag - Triangle concept
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_snag",
    name: "Snag",
    conceptType: "pass",
    summary: "Triangle read concept",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["3x1", "bunch"],
    },
    template: {
      roles: [
        { roleName: "SNAG", appliesTo: ["Y"], defaultRoute: { pattern: "hitch", depth: 5 } },
        { roleName: "CORNER", appliesTo: ["Z"], defaultRoute: { pattern: "corner", depth: 12 } },
        { roleName: "FLAT", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 2 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "quick", stress: ["cover3", "cover2"] },
  },

  // ============================================
  // Texas - RB angle route
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_texas",
    name: "Texas",
    conceptType: "pass",
    summary: "RB angle route concept",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["2x2", "ace"],
    },
    template: {
      roles: [
        { roleName: "ANGLE", appliesTo: ["RB"], defaultRoute: { pattern: "arrow", depth: 6 } },
        { roleName: "CLEAR_GO", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "OUT", appliesTo: ["X"], defaultRoute: { pattern: "out", depth: 12 } },
        { roleName: "SEAM", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 15 } },
        { roleName: "CHECK_SHALLOW", appliesTo: ["H"], defaultRoute: { pattern: "shallow", depth: 3 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "intermediate", stress: ["man", "cover1"] },
  },

  // ============================================
  // Double Slant - Quick game
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_double_slant",
    name: "Double Slant",
    conceptType: "pass",
    summary: "Two quick slants",
    badges: ["nfl_style", "youth_friendly"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "FRONT_SLANT", appliesTo: ["Z"], defaultRoute: { pattern: "slant", depth: 5 } },
        { roleName: "BACK_SLANT", appliesTo: ["H"], defaultRoute: { pattern: "slant", depth: 7 } },
        { roleName: "FLAT", appliesTo: ["Y"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "quick", stress: ["cover2", "cover4"] },
  },

  // ============================================
  // Out - Quick outs
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_out",
    name: "Quick Out",
    conceptType: "pass",
    summary: "Quick 5-yard out routes",
    badges: ["nfl_style", "youth_friendly"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "OUT", appliesTo: ["Z"], defaultRoute: { pattern: "out", depth: 5 } },
        { roleName: "BACKSIDE_OUT", appliesTo: ["X"], defaultRoute: { pattern: "out", depth: 5 } },
        { roleName: "SEAM", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 15 } },
        { roleName: "FLAT", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "quick", stress: ["cover3", "soft_corner"] },
  },

  // ============================================
  // Dragon - Deep crossers
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_dragon",
    name: "Dragon",
    conceptType: "pass",
    summary: "Deep crossing routes",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "DEEP_CROSS", appliesTo: ["Z"], defaultRoute: { pattern: "cross", depth: 18 } },
        { roleName: "SHALLOW", appliesTo: ["Y"], defaultRoute: { pattern: "shallow", depth: 3 } },
        { roleName: "CLEAR", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 25 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "PROTECT", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 1 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", stress: ["cover3", "man"] },
  },

  // ============================================
  // Follow - Delayed dig
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_follow",
    name: "Follow",
    conceptType: "pass",
    summary: "Drag + delayed dig concept",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["3x1", "bunch"],
    },
    template: {
      roles: [
        { roleName: "DRAG", appliesTo: ["Y"], defaultRoute: { pattern: "shallow", depth: 3 } },
        { roleName: "FOLLOW_DIG", appliesTo: ["H"], defaultRoute: { pattern: "dig", depth: 12 } },
        { roleName: "CLEAR", appliesTo: ["Z"], defaultRoute: { pattern: "post", depth: 18 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "intermediate", stress: ["man", "cover1"] },
  },

  // ============================================
  // Whip - Quick whip routes
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_whip",
    name: "Whip",
    conceptType: "pass",
    summary: "Quick inside whip routes",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "WHIP", appliesTo: ["H"], defaultRoute: { pattern: "whip", depth: 6 } },
        { roleName: "OUT", appliesTo: ["Z"], defaultRoute: { pattern: "out", depth: 10 } },
        { roleName: "FLAT", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "SEAM", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 15 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "quick", stress: ["man", "cover1"] },
  },

  // ============================================
  // Scissors - Double-move crossers
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_scissors",
    name: "Scissors",
    conceptType: "pass",
    summary: "Crossing corner and post routes",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "CORNER", appliesTo: ["Y"], defaultRoute: { pattern: "corner", depth: 15 } },
        { roleName: "POST", appliesTo: ["H"], defaultRoute: { pattern: "post", depth: 18 } },
        { roleName: "FLAT", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "CLEAR_GO", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 18 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", stress: ["cover2", "cover4"] },
  },

  // ============================================
  // Shake - Double move concept
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_shake",
    name: "Shake",
    conceptType: "pass",
    summary: "Double move routes with hitch-and-go",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "HITCH_GO", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "DIG", appliesTo: ["Y"], defaultRoute: { pattern: "dig", depth: 12 } },
        { roleName: "WHEEL", appliesTo: ["RB"], defaultRoute: { pattern: "wheel", depth: 15 } },
        { roleName: "BACKSIDE_POST", appliesTo: ["X"], defaultRoute: { pattern: "post", depth: 18 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", stress: ["man", "cover1"] },
  },

  // ============================================
  // Comeback - Deep comeback routes
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_comeback",
    name: "Comeback",
    conceptType: "pass",
    summary: "Deep comeback routes",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["2x2"],
    },
    template: {
      roles: [
        { roleName: "COMEBACK", appliesTo: ["Z"], defaultRoute: { pattern: "curl", depth: 16 } },
        { roleName: "BACKSIDE_COMEBACK", appliesTo: ["X"], defaultRoute: { pattern: "curl", depth: 16 } },
        { roleName: "FLAT", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "SEAM", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 15 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "intermediate", stress: ["cover3", "soft_corner"] },
  },

  // ============================================
  // Mills - Deep vertical stretch
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_mills",
    name: "Mills",
    conceptType: "pass",
    summary: "Post/dig vertical stretch concept",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "POST", appliesTo: ["Z"], defaultRoute: { pattern: "post", depth: 18 } },
        { roleName: "DIG", appliesTo: ["H"], defaultRoute: { pattern: "dig", depth: 12 } },
        { roleName: "FLAT", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 20 } },
        { roleName: "SEAM", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 15 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", manBeater: true, stress: ["cover2", "cover3"] },
  },

  // ============================================
  // Bubble Screen - Quick lateral pass
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_bubble",
    name: "Bubble Screen",
    conceptType: "pass",
    summary: "Quick bubble screen to slot",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1", "trips"],
    },
    template: {
      roles: [
        { roleName: "BUBBLE", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 1 } },
        { roleName: "STALK_BLOCK", appliesTo: ["Z"], defaultRoute: { pattern: "hitch", depth: 2 } },
        { roleName: "BACKSIDE_BLOCK", appliesTo: ["X"], defaultRoute: { pattern: "hitch", depth: 2 } },
        { roleName: "BLOCK", appliesTo: ["Y"], defaultRoute: { pattern: "hitch", depth: 2 } },
        { roleName: "LEAD_BLOCK", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 1 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "screen", zoneBeater: true, stress: ["box_numbers"] },
  },

  // ============================================
  // Smoke Screen - Pre-snap read screen
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_smoke",
    name: "Smoke Screen",
    conceptType: "pass",
    summary: "Pre-snap read quick screen",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "SMOKE", appliesTo: ["Z"], defaultRoute: { pattern: "flat", depth: 0 } },
        { roleName: "STALK_BLOCK", appliesTo: ["H"], defaultRoute: { pattern: "hitch", depth: 2 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 15 } },
        { roleName: "BLOCK", appliesTo: ["Y"], defaultRoute: { pattern: "hitch", depth: 2 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "screen", zoneBeater: true, stress: ["soft_corner"] },
  },

  // ============================================
  // Now Screen - Fast quick screen
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_now",
    name: "Now Screen",
    conceptType: "pass",
    summary: "Fast WR screen off RPO look",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "NOW", appliesTo: ["Z"], defaultRoute: { pattern: "flat", depth: 1 } },
        { roleName: "CRACK_BLOCK", appliesTo: ["H"], defaultRoute: { pattern: "hitch", depth: 2 } },
        { roleName: "BACKSIDE_GO", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "BLOCK", appliesTo: ["Y"], defaultRoute: { pattern: "hitch", depth: 2 } },
        { roleName: "FAKE_RUN", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 3 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "screen", stress: ["overhang"] },
  },

  // ============================================
  // Tunnel Screen - Interior screen
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_tunnel",
    name: "Tunnel Screen",
    conceptType: "pass",
    summary: "Interior tunnel screen to slot",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1", "trips"],
    },
    template: {
      roles: [
        { roleName: "TUNNEL", appliesTo: ["H"], defaultRoute: { pattern: "shallow", depth: 2, direction: "inside" } },
        { roleName: "CLEAR", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 15 } },
        { roleName: "BACKSIDE_CLEAR", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 15 } },
        { roleName: "LEAD_BLOCK", appliesTo: ["Y"], defaultRoute: { pattern: "flat", depth: 2 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 3 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "screen", stress: ["aggressive_lb"] },
  },

  // ============================================
  // Slow Screen - Delayed RB screen
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_slow_screen",
    name: "Slow Screen",
    conceptType: "pass",
    summary: "Delayed RB screen with OL release",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 1,
      preferredStructures: ["2x2", "ace", "I"],
    },
    template: {
      roles: [
        { roleName: "SCREEN", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 0 } },
        { roleName: "CLEAR", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "BACKSIDE_CLEAR", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "SEAM", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 15 } },
        { roleName: "SWING", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 4 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "screen", stress: ["blitz", "pressure"] },
  },

  // ============================================
  // Option Route (Choice) - 3rd Down
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_option",
    name: "Option Route",
    conceptType: "pass",
    summary: "Coverage-read option routes",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "OPTION", appliesTo: ["H"], defaultRoute: { pattern: "hitch", depth: 8 } },
        { roleName: "CLEAR", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "BACKSIDE_DIG", appliesTo: ["X"], defaultRoute: { pattern: "dig", depth: 12 } },
        { roleName: "SEAM", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 14 } },
        { roleName: "FLAT", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 3 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "intermediate", manBeater: true, zoneBeater: true, stress: ["3rd_down"] },
  },

  // ============================================
  // Pivot - Quick pivot route
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_pivot",
    name: "Pivot",
    conceptType: "pass",
    summary: "Quick pivot routes underneath",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1", "bunch"],
    },
    template: {
      roles: [
        { roleName: "PIVOT", appliesTo: ["H"], defaultRoute: { pattern: "out", depth: 5 } },
        { roleName: "WHEEL", appliesTo: ["RB"], defaultRoute: { pattern: "wheel", depth: 12 } },
        { roleName: "CLEAR_GO", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 18 } },
        { roleName: "BACKSIDE_DIG", appliesTo: ["X"], defaultRoute: { pattern: "dig", depth: 10 } },
        { roleName: "SEAM", appliesTo: ["Y"], defaultRoute: { pattern: "seam", depth: 14 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "quick", manBeater: true, stress: ["flat_conflict"] },
  },

  // ============================================
  // Fade - Redzone fade route
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_fade",
    name: "Fade",
    conceptType: "pass",
    summary: "Back shoulder fade for redzone",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "FADE", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 12 } },
        { roleName: "FLAT", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "BACKSIDE_SLANT", appliesTo: ["X"], defaultRoute: { pattern: "slant", depth: 6 } },
        { roleName: "DRAG", appliesTo: ["Y"], defaultRoute: { pattern: "shallow", depth: 3 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", stress: ["redzone", "man"] },
  },

  // ============================================
  // Smash Fade - Corner/Fade combo
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_smash_fade",
    name: "Smash Fade",
    conceptType: "pass",
    summary: "Corner hitch + fade combo for redzone",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "FADE", appliesTo: ["Z"], defaultRoute: { pattern: "go", depth: 12 } },
        { roleName: "HITCH", appliesTo: ["H"], defaultRoute: { pattern: "hitch", depth: 5 } },
        { roleName: "BACKSIDE_FADE", appliesTo: ["X"], defaultRoute: { pattern: "go", depth: 12 } },
        { roleName: "FLAT", appliesTo: ["Y"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "deep", stress: ["redzone", "cover2"] },
  },

  // ============================================
  // Spacing Z (Redzone) - Compressed spacing
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_spacing_z",
    name: "Spacing Z",
    conceptType: "pass",
    summary: "Redzone spacing concept with compressed routes",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 3,
      preferredStructures: ["2x2", "3x1", "bunch"],
    },
    template: {
      roles: [
        { roleName: "CORNER", appliesTo: ["Z"], defaultRoute: { pattern: "out", depth: 5 } },
        { roleName: "FLAT", appliesTo: ["H"], defaultRoute: { pattern: "flat", depth: 2 } },
        { roleName: "SIT", appliesTo: ["Y"], defaultRoute: { pattern: "hitch", depth: 4 } },
        { roleName: "BACKSIDE_FLAT", appliesTo: ["X"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 1 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "quick", zoneBeater: true, stress: ["redzone", "goalline"] },
  },

  // ============================================
  // Hitch - Basic hitch routes
  // ============================================
  {
    schemaVersion: "1.0",
    type: "concept",
    id: "concept_pass_hitch",
    name: "Hitch",
    conceptType: "pass",
    summary: "Quick hitch routes vs soft coverage",
    badges: ["nfl_style"],
    requirements: {
      minEligibleReceivers: 2,
      preferredStructures: ["2x2", "3x1"],
    },
    template: {
      roles: [
        { roleName: "HITCH", appliesTo: ["Z"], defaultRoute: { pattern: "hitch", depth: 5 } },
        { roleName: "BACKSIDE_HITCH", appliesTo: ["X"], defaultRoute: { pattern: "hitch", depth: 5 } },
        { roleName: "SEAM", appliesTo: ["H"], defaultRoute: { pattern: "seam", depth: 12 } },
        { roleName: "FLAT", appliesTo: ["Y"], defaultRoute: { pattern: "flat", depth: 3 } },
        { roleName: "CHECK_RELEASE", appliesTo: ["RB"], defaultRoute: { pattern: "flat", depth: 2 } },
      ],
      buildPolicy: { placementStrategy: "relative_to_alignment" },
    },
    passHints: { category: "quick", zoneBeater: true, stress: ["soft_corner", "off_coverage"] },
  },
];

export function getPassConceptById(id: string): Concept | undefined {
  return PASS_CONCEPTS.find((c) => c.id === id);
}

export function getPassConceptsByCategory(category: string): Concept[] {
  return PASS_CONCEPTS.filter((c) => c.passHints?.category === category);
}

export function getPassConceptsForFormation(structure: string): Concept[] {
  return PASS_CONCEPTS.filter((c) =>
    c.requirements?.preferredStructures?.includes(structure as any)
  );
}
