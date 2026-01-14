// ============================================
// Formation Presets
// Based on DSL Specification document
// ============================================

import type { Formation } from "../dsl/types";

export const FORMATIONS: Formation[] = [
  // ============================================
  // 2x2 Formations
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
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0 } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0 } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0 } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0 } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0.02, splitPreset: "wide" } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0.02, splitPreset: "wide" } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.25, y: 0.02, splitPreset: "slot" } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.75, y: 0.02, splitPreset: "slot" } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "normal",
      },
    },
  },

  // ============================================
  // 3x1 Formations
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
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0 } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0 } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0 } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0 } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0.02, splitPreset: "wide" } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0.02, splitPreset: "wide" } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.75, y: 0.02, splitPreset: "slot" } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.82, y: 0.02, splitPreset: "slot" } },
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
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0 } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0 } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0 } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0 } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0.02, splitPreset: "wide" } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.18, y: 0.02, splitPreset: "slot" } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.25, y: 0.02, splitPreset: "slot" } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0.02, splitPreset: "wide" } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "normal",
      },
    },
  },

  // ============================================
  // Bunch Formations
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
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0 } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0 } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0 } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0 } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0.02, splitPreset: "wide" } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.78, y: 0.02 } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.75, y: 0.08 } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.82, y: 0.08 } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "reduced",
      },
    },
  },

  // ============================================
  // Ace / Pro Formations (12 Personnel with TE)
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
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.35 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0 } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0 } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0 } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0 } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0 } },
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.68, y: 0, stance: "three_point" } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0.02, splitPreset: "wide" } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0.02, splitPreset: "wide" } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "normal",
      },
    },
  },

  // ============================================
  // I Formation (21 Personnel)
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
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.12 } },
        { id: "p_fb", role: "FB", label: "FB", alignment: { x: 0.5, y: -0.28 } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.5, y: -0.42 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0 } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0 } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0 } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0 } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0 } },
        { id: "p_y", role: "Y", label: "TE", alignment: { x: 0.68, y: 0, stance: "three_point" } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.1, y: 0.02, splitPreset: "wide" } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.9, y: 0.02, splitPreset: "wide" } },
      ],
      snapRules: {
        olSpacingPreset: "standard",
        wrSplitPreset: "normal",
      },
    },
  },

  // ============================================
  // Empty Formation
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
    },
    defaults: {
      players: [
        { id: "p_qb", role: "QB", label: "QB", alignment: { x: 0.5, y: -0.15 } },
        { id: "p_c", role: "C", label: "C", alignment: { x: 0.5, y: 0 } },
        { id: "p_lg", role: "LG", label: "LG", alignment: { x: 0.44, y: 0 } },
        { id: "p_lt", role: "LT", label: "LT", alignment: { x: 0.38, y: 0 } },
        { id: "p_rg", role: "RG", label: "RG", alignment: { x: 0.56, y: 0 } },
        { id: "p_rt", role: "RT", label: "RT", alignment: { x: 0.62, y: 0 } },
        { id: "p_x", role: "X", label: "X", alignment: { x: 0.08, y: 0.02, splitPreset: "wide" } },
        { id: "p_h", role: "H", label: "H", alignment: { x: 0.22, y: 0.02, splitPreset: "slot" } },
        { id: "p_rb", role: "RB", label: "RB", alignment: { x: 0.35, y: 0.02, splitPreset: "slot" } },
        { id: "p_y", role: "Y", label: "Y", alignment: { x: 0.78, y: 0.02, splitPreset: "slot" } },
        { id: "p_z", role: "Z", label: "Z", alignment: { x: 0.92, y: 0.02, splitPreset: "wide" } },
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
