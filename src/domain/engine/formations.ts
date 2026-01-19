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
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.35, y: 0, splitPreset: "slot", onLOS: true, depthYards: 0 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.78, y: 0, splitPreset: "slot", onLOS: true, depthYards: 0 } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.92, y: 0, splitPreset: "wide", onLOS: true, depthYards: 0 } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "normal",
      },
    },
  },
];

export function getFormationById(id: string): Formation | undefined {
  return FORMATIONS.find((f) => f.id === id);
}

export function getFormationsByStructure(structure: string): Formation[] {
  return FORMATIONS.filter((f) => f.meta?.structure === structure);
}
