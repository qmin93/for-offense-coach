// ============================================
// Formation Presets
// Based on DSL Specification document
// ============================================

import type { Formation } from "../dsl/types";

export const FORMATIONS: Formation[] = [
  // ============================================
  // 2x2 Formations
  // Stance Rules: X/Z ON LOS, H/Y OFF (0.5 yards back)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_2x2",
    name: "2x2 (Doubles)",
    meta: {
      personnelHint: ["11", "10"],
      structure: "2x2",
      strength: "right",
      requiredRoster: { minWR: 3, minTE: 0, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "balanced", "quick_game"],
      riskTags: [],
      complexity: 1,
      description: "Balanced spread formation. Good for any offense.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        // X/Z: ON LOS (wide receivers)
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        // H/Y: OFF LOS (1 yard back - slot receivers, ensures valid LOS spacing)
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.22, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.78, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "normal",
      },
    },
  },

  // ============================================
  // 3x1 Formations (Trips)
  // Stance Rules: X/Z ON LOS, H/Y OFF (0.5 yards back)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_trips_right",
    name: "Trips Right",
    meta: {
      personnelHint: ["11", "10"],
      structure: "3x1",
      strength: "right",
      requiredRoster: { minWR: 3, minTE: 0, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "pass_heavy", "quick_game"],
      riskTags: [],
      complexity: 2,
      description: "3 receivers to one side. Creates coverage stress.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        // X: ON LOS (backside wide)
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        // Z: ON LOS (trips side outside)
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        // Y/H: OFF LOS (trips side inside slots, 1 yard depth for valid LOS)
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.75, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.82, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "normal",
      },
    },
  },
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_trips_left",
    name: "Trips Left",
    meta: {
      personnelHint: ["11", "10"],
      structure: "3x1",
      strength: "left",
      requiredRoster: { minWR: 3, minTE: 0, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "pass_heavy", "quick_game"],
      riskTags: [],
      complexity: 2,
      description: "3 receivers to one side. Creates coverage stress.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        // X: ON LOS (trips side outside)
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        // H/Y: OFF LOS (trips side inside slots, 1 yard depth for valid LOS)
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.18, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.25, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
        // Z: ON LOS (backside wide)
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "normal",
      },
    },
  },

  // ============================================
  // Bunch Formations
  // Stance: Bunch point man ON LOS, inside guys OFF
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_bunch_right",
    name: "Bunch Right",
    meta: {
      personnelHint: ["11", "10"],
      structure: "bunch",
      strength: "right",
      requiredRoster: { minWR: 3, minTE: 0, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "pass_heavy", "quick_game"],
      riskTags: ["complex_rules"],
      complexity: 3,
      description: "Tight receiver cluster. Great vs man coverage with picks.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        // X: ON LOS (backside)
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        // Z: ON LOS (bunch point)
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.78, y: 0, onLOS: true, depthYards: 0 } },
        // Y/H: OFF LOS (bunch inside, stacked)
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.75, y: -0.02, onLOS: false, depthYards: 1 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.82, y: -0.02, onLOS: false, depthYards: 1 } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "reduced",
      },
    },
  },

  // ============================================
  // Ace / Pro Formations (12 Personnel with TE)
  // TE is ON LOS (attached), X/Z ON LOS
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_ace_right",
    name: "Ace Right",
    meta: {
      personnelHint: ["11", "12"],
      structure: "ace",
      strength: "right",
      requiredRoster: { minWR: 2, minTE: 1, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["balanced", "play_action", "run_heavy"],
      riskTags: ["te_blocking"],
      complexity: 2,
      description: "Pro-style with attached TE. Balanced run/pass.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        // TE: ON LOS (attached to OL)
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.68, y: 0, stance: "three_point", onLOS: true, depthYards: 0 } },
        // X/Z: ON LOS
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        // H: OFF LOS (weak side slot for 11 personnel)
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.22, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "normal",
      },
    },
  },

  // ============================================
  // I Formation (21 Personnel)
  // TE ON LOS, X/Z ON LOS
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_i_right",
    name: "I-Formation Right",
    meta: {
      personnelHint: ["21", "22"],
      structure: "I",
      strength: "right",
      requiredRoster: { minWR: 2, minTE: 1, minRB: 1, needsFB: true, olPullRequired: true },
      styleTags: ["power", "run_heavy", "play_action"],
      riskTags: ["te_blocking", "ol_athletic"],
      complexity: 3,
      description: "Power run formation with FB lead. Great for short yardage.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.12 } },
        { id: "p_fb", role: "FB", label: "FB", alignment: { x: 0.5, y: -0.28 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.42 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        // TE: ON LOS (attached)
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.68, y: 0, stance: "three_point", onLOS: true, depthYards: 0 } },
        // X/Z: ON LOS
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "normal",
      },
    },
  },

  // ============================================
  // Empty Formation
  // All receivers ON LOS (5-wide split)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_empty",
    name: "Empty",
    meta: {
      personnelHint: ["10", "11"],
      structure: "empty",
      strength: "right",
      requiredRoster: { minWR: 4, minTE: 0, minRB: 0, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "pass_heavy", "quick_game"],
      riskTags: ["qb_exposure"],
      complexity: 2,
      description: "5-wide spread. Maximum pass protection stress on defense.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        // All 5 receivers ON LOS in Empty
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.08, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.22, y: 0, splitPreset: "slot", onLOS: true, depthYards: 0 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.35, y: -0.01, splitPreset: "slot", onLOS: false, depthYards: 0.5 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.78, y: 0, splitPreset: "slot", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.92, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "normal",
      },
    },
  },

  // ============================================
  // Bunch Left
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_bunch_left",
    name: "Bunch Left",
    meta: {
      personnelHint: ["11", "10"],
      structure: "bunch",
      strength: "left",
      requiredRoster: { minWR: 3, minTE: 0, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "pass_heavy", "quick_game"],
      riskTags: ["complex_rules"],
      complexity: 3,
      description: "Tight receiver cluster to the left. Great vs man coverage.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.22, y: 0, onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.18, y: -0.02, onLOS: false, depthYards: 1 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.25, y: -0.02, onLOS: false, depthYards: 1 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "reduced" },
    },
  },

  // ============================================
  // Pistol Doubles
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_pistol_doubles",
    name: "Pistol Doubles",
    meta: {
      personnelHint: ["11", "10"],
      structure: "2x2",
      strength: "right",
      requiredRoster: { minWR: 3, minTE: 0, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["balanced", "run_heavy", "play_action"],
      riskTags: [],
      complexity: 2,
      description: "Pistol alignment with balanced 2x2 receivers. Good for zone read.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.12 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.32 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.22, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.78, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // Pistol Trips
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_pistol_trips",
    name: "Pistol Trips",
    meta: {
      personnelHint: ["11", "10"],
      structure: "3x1",
      strength: "right",
      requiredRoster: { minWR: 3, minTE: 0, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "run_heavy", "quick_game"],
      riskTags: [],
      complexity: 2,
      description: "Pistol with trips to one side. Great for RPOs.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.12 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.32 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.75, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.82, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // Singleback Ace (Balanced TE)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_singleback",
    name: "Singleback",
    meta: {
      personnelHint: ["11", "12"],
      structure: "ace",
      strength: "right",
      requiredRoster: { minWR: 2, minTE: 1, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["balanced", "run_heavy", "play_action"],
      riskTags: [],
      complexity: 1,
      description: "Classic singleback set with TE. Versatile run/pass.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.68, y: 0, stance: "three_point", onLOS: true, depthYards: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.22, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // I-Formation Left
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_i_left",
    name: "I-Formation Left",
    meta: {
      personnelHint: ["21", "22"],
      structure: "I",
      strength: "left",
      requiredRoster: { minWR: 2, minTE: 1, minRB: 1, needsFB: true, olPullRequired: true },
      styleTags: ["power", "run_heavy", "play_action"],
      riskTags: ["te_blocking", "ol_athletic"],
      complexity: 3,
      description: "Power run formation with TE to the left.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.12 } },
        { id: "p_fb", role: "FB", label: "FB", alignment: { x: 0.5, y: -0.28 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.42 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.32, y: 0, stance: "three_point", onLOS: true, depthYards: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // Strong I (TE Strong Side)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_strong_i",
    name: "Strong I",
    meta: {
      personnelHint: ["21", "22"],
      structure: "I",
      strength: "right",
      requiredRoster: { minWR: 1, minTE: 1, minRB: 1, needsFB: true, olPullRequired: true },
      styleTags: ["power", "run_heavy"],
      riskTags: ["te_blocking", "ol_athletic"],
      complexity: 3,
      description: "Heavy formation with FB offset strong. Short yardage.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.12 } },
        { id: "p_fb", role: "FB", label: "FB", alignment: { x: 0.55, y: -0.25 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.42 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.68, y: 0, stance: "three_point", onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.74, y: -0.02, onLOS: false, depthYards: 1 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // Pro Twins (TE Weak, Twins Strong)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_pro_twins",
    name: "Pro Twins",
    meta: {
      personnelHint: ["12", "11"],
      structure: "2x2",
      strength: "right",
      requiredRoster: { minWR: 2, minTE: 1, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["balanced", "play_action", "trick_play"],
      riskTags: [],
      complexity: 2,
      description: "TE attached weak side, twins strong. Good play-action set.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.32, y: 0, stance: "three_point", onLOS: true, depthYards: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.78, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // Ace Trips (12 Personnel Trips)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_ace_trips",
    name: "Ace Trips",
    meta: {
      personnelHint: ["12"],
      structure: "3x1",
      strength: "right",
      requiredRoster: { minWR: 2, minTE: 1, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["balanced", "play_action", "spread"],
      riskTags: [],
      complexity: 2,
      description: "12 personnel with trips look. TE attached, 3 to field.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.68, y: 0, stance: "three_point", onLOS: true, depthYards: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.78, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // Tight Doubles (Reduced Splits)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_tight_doubles",
    name: "Tight Doubles",
    meta: {
      personnelHint: ["11", "10"],
      structure: "2x2",
      strength: "right",
      requiredRoster: { minWR: 3, minTE: 0, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "quick_game", "balanced"],
      riskTags: [],
      complexity: 1,
      description: "2x2 with reduced receiver splits. Good for quick game.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.18, y: 0, splitPreset: "reduced", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.82, y: 0, splitPreset: "reduced", onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.28, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.72, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "reduced" },
    },
  },

  // ============================================
  // Stack 2x2 (Stacked Receivers)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_stack",
    name: "Stack 2x2",
    meta: {
      personnelHint: ["11", "10"],
      structure: "2x2",
      strength: "right",
      requiredRoster: { minWR: 3, minTE: 0, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "pass_heavy", "quick_game"],
      riskTags: ["complex_rules"],
      complexity: 3,
      description: "Stacked receivers on each side. Creates release confusion.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.15, y: 0, onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.15, y: -0.04, onLOS: false, depthYards: 2.0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.85, y: 0, onLOS: true, depthYards: 0 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.85, y: -0.04, onLOS: false, depthYards: 2.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // Tight Trips
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_tight_trips",
    name: "Tight Trips",
    meta: {
      personnelHint: ["11", "10"],
      structure: "3x1",
      strength: "right",
      requiredRoster: { minWR: 3, minTE: 0, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "pass_heavy", "quick_game"],
      riskTags: ["complex_rules"],
      complexity: 2,
      description: "Condensed trips with tight splits. Good for pick plays.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.78, y: 0, onLOS: true, depthYards: 0 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.72, y: -0.02, onLOS: false, depthYards: 1.0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.75, y: -0.04, onLOS: false, depthYards: 2.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "reduced" },
    },
  },

  // ============================================
  // Nub TE (Single TE Side)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_nub_te",
    name: "Nub TE",
    meta: {
      personnelHint: ["12"],
      structure: "ace",
      strength: "left",
      requiredRoster: { minWR: 2, minTE: 1, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["balanced", "run_heavy", "play_action"],
      riskTags: [],
      complexity: 2,
      description: "TE attached alone (nub) weak side. 2 WR strong.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.32, y: 0, stance: "three_point", onLOS: true, depthYards: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.78, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // Empty 4x1 (Quads)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_empty_quads",
    name: "Empty Quads",
    meta: {
      personnelHint: ["10", "11"],
      structure: "empty",
      strength: "right",
      requiredRoster: { minWR: 4, minTE: 0, minRB: 0, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "pass_heavy"],
      riskTags: ["qb_exposure"],
      complexity: 3,
      description: "4 receivers to one side in empty. Maximum coverage stress.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.92, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.78, y: 0, onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.85, y: -0.02, onLOS: false, depthYards: 1.0 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.72, y: -0.02, onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // Empty Trey (TE Slot in Empty)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_empty_trey",
    name: "Empty Trey",
    meta: {
      personnelHint: ["11", "12"],
      structure: "empty",
      strength: "right",
      requiredRoster: { minWR: 3, minTE: 1, minRB: 0, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "pass_heavy"],
      riskTags: ["qb_exposure"],
      complexity: 2,
      description: "Empty with TE in slot. TE creates mismatch in space.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.08, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.92, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.78, y: 0, onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.22, y: 0, onLOS: true, depthYards: 0 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.35, y: -0.01, onLOS: false, depthYards: 0.5 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // Wing T (20 Personnel)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_wing_t",
    name: "Wing T",
    meta: {
      personnelHint: ["20", "21"],
      structure: "ace",
      strength: "right",
      requiredRoster: { minWR: 2, minTE: 1, minRB: 2, needsFB: false, olPullRequired: true },
      styleTags: ["trick_play", "run_heavy", "power"],
      riskTags: ["complex_rules"],
      complexity: 4,
      description: "Classic Wing T with wingback. Great for misdirection.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.12 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.45, y: -0.30 } },
        { id: "p_h", role: "H", label: "WB", alignment: { x: 0.72, y: -0.04, onLOS: false, depthYards: 2.0 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.68, y: 0, stance: "three_point", onLOS: true, depthYards: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },

  // ============================================
  // Gun Trips Open
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_gun_trips_open",
    name: "Gun Trips Open",
    meta: {
      personnelHint: ["10", "11"],
      structure: "3x1",
      strength: "right",
      requiredRoster: { minWR: 4, minTE: 0, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["spread", "quick_game", "pass_heavy"],
      riskTags: [],
      complexity: 2,
      description: "Shotgun trips with open side WR. Maximum horizontal stretch.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.45, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.08, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.92, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.78, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.85, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "wide" },
    },
  },

  // ============================================
  // Ace Left (12 Personnel)
  // ============================================
  {
    schemaVersion: "1.0",
    type: "formation",
    id: "formation_ace_left",
    name: "Ace Left",
    meta: {
      personnelHint: ["12", "11"],
      structure: "ace",
      strength: "left",
      requiredRoster: { minWR: 2, minTE: 1, minRB: 1, needsFB: false, olPullRequired: false },
      styleTags: ["balanced", "run_heavy", "play_action"],
      riskTags: ["te_blocking"],
      complexity: 1,
      description: "Ace formation with TE attached to left side. Balanced run/pass.",
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0, onLOS: true } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0, onLOS: true } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0, onLOS: true } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0, onLOS: true } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0, onLOS: true } },
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.32, y: 0, onLOS: true, depthYards: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.08, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.92, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.78, y: -0.02, splitPreset: "slot", onLOS: false, depthYards: 1.0 } },
      ],
      snapRules: { olSpacingPreset: "standard", wrSplitPreset: "normal" },
    },
  },
];

export function getFormationById(id: string): Formation | undefined {
  return FORMATIONS.find((f) => f.id === id);
}

export function getFormationsByStructure(structure: string): Formation[] {
  return FORMATIONS.filter((f) => f.meta?.structure === structure);
}
