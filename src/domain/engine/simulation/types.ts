// ============================================
// Simulation Engine Types
// Types for snap simulation and animation
// ============================================

import type { Point, PlayerRole } from "@/domain/dsl/types";

// ============================================
// Play Phase Types
// ============================================

export type PlayPhase = "pre_snap" | "snap" | "t1" | "t2" | "t3";

export interface PhaseConfig {
  phase: PlayPhase;
  startMs: number;
  endMs: number;
}

// ============================================
// Simulation Configuration
// ============================================

export const DEFAULT_SIMULATION_CONFIG = {
  durationMs: 3000,
  phases: [
    { phase: "pre_snap" as PlayPhase, startMs: 0, endMs: 500 },
    { phase: "snap" as PlayPhase, startMs: 500, endMs: 1000 },
    { phase: "t1" as PlayPhase, startMs: 1000, endMs: 1500 },
    { phase: "t2" as PlayPhase, startMs: 1500, endMs: 2000 },
    { phase: "t3" as PlayPhase, startMs: 2000, endMs: 3000 },
  ],
} as const;

// ============================================
// Position Speeds (yards per second)
// ============================================

export type PositionSpeedConfig = {
  min: number; // Minimum yards per second
  max: number; // Maximum yards per second
};

export const POSITION_SPEEDS: Record<string, PositionSpeedConfig> = {
  // Skill positions - fast
  WR: { min: 7, max: 9 },   // Wide receivers (4.4-4.6 40 yard dash pace)
  X: { min: 7, max: 9 },
  Z: { min: 7, max: 9 },
  H: { min: 6.5, max: 8.5 },

  // Running backs - fast but often cutting
  RB: { min: 6, max: 8 },
  F: { min: 6, max: 8 },

  // Tight ends - medium-fast
  TE: { min: 5, max: 7 },
  Y: { min: 5, max: 7 },

  // Quarterback - variable based on rollout/scramble
  QB: { min: 4, max: 6 },

  // Offensive line - slow, short distances
  C: { min: 2, max: 4 },
  LG: { min: 2, max: 4 },
  RG: { min: 2, max: 4 },
  LT: { min: 2.5, max: 4.5 },
  RT: { min: 2.5, max: 4.5 },

  // Defensive backs - match receiver speed
  CB: { min: 7, max: 9 },
  FS: { min: 6.5, max: 8.5 },
  SS: { min: 6, max: 8 },

  // Linebackers - medium
  LB: { min: 5, max: 7 },
  ILB: { min: 5, max: 7 },
  OLB: { min: 5.5, max: 7.5 },
  MLB: { min: 5, max: 7 },
  Sam: { min: 5.5, max: 7.5 },
  Will: { min: 5.5, max: 7.5 },
  Mike: { min: 5, max: 7 },

  // Defensive line - slow
  DE: { min: 4, max: 6 },
  DT: { min: 3, max: 5 },
  NT: { min: 2.5, max: 4.5 },
};

/**
 * Get speed for a role (default if not found)
 */
export function getSpeedForRole(role: string): PositionSpeedConfig {
  return POSITION_SPEEDS[role] || { min: 4, max: 6 };
}

// ============================================
// Simulated Player State
// ============================================

export interface SimulatedPlayer {
  playerId: string;
  role: string;
  currentPosition: Point;
  pathProgress: number;  // 0-1, how far along assigned path
  isMoving: boolean;
}

// ============================================
// Coverage Types
// ============================================

export type CoverageType = "cover0" | "cover1" | "cover2" | "cover3" | "cover4" | "cover6" | "man";

export interface CoverageConfig {
  type: CoverageType;
  zones?: ZoneAssignment[];
  manAssignments?: ManAssignment[];
}

export interface ZoneAssignment {
  defenseRole: string;
  zoneId: string;
  zoneCenter: Point;
  zoneRadius: number;
}

export interface ManAssignment {
  defenseRole: string;
  coveringPlayerId: string;  // Offense player being covered
}

// ============================================
// Zone Definitions (Cover 3 example)
// ============================================

export const COVER_3_ZONES: ZoneAssignment[] = [
  // Deep thirds
  { defenseRole: "FS", zoneId: "deep_middle", zoneCenter: { x: 0.5, y: 0.4 }, zoneRadius: 0.2 },
  { defenseRole: "CB", zoneId: "deep_left", zoneCenter: { x: 0.2, y: 0.4 }, zoneRadius: 0.18 },
  { defenseRole: "CB", zoneId: "deep_right", zoneCenter: { x: 0.8, y: 0.4 }, zoneRadius: 0.18 },
  // Underneath zones (flats and hook/curl)
  { defenseRole: "SS", zoneId: "flat_strong", zoneCenter: { x: 0.75, y: 0.15 }, zoneRadius: 0.12 },
  { defenseRole: "OLB", zoneId: "flat_weak", zoneCenter: { x: 0.25, y: 0.15 }, zoneRadius: 0.12 },
  { defenseRole: "ILB", zoneId: "hook_middle", zoneCenter: { x: 0.5, y: 0.12 }, zoneRadius: 0.1 },
  { defenseRole: "ILB", zoneId: "hook_strong", zoneCenter: { x: 0.65, y: 0.12 }, zoneRadius: 0.1 },
];

export const COVER_1_MAN: ManAssignment[] = [
  { defenseRole: "CB", coveringPlayerId: "X" },  // #1 receiver left
  { defenseRole: "CB", coveringPlayerId: "Z" },  // #1 receiver right
  { defenseRole: "SS", coveringPlayerId: "Y" },  // TE
  { defenseRole: "OLB", coveringPlayerId: "H" }, // Slot/H-back
  { defenseRole: "ILB", coveringPlayerId: "RB" }, // Running back
];

// ============================================
// Simulation Frame
// ============================================

export interface SimulationFrame {
  timeMs: number;
  phase: PlayPhase;
  offensePlayers: SimulatedPlayer[];
  defensePlayers: SimulatedPlayer[];
}

// ============================================
// Path Interpolation Helpers
// ============================================

/**
 * Get current phase based on elapsed time
 */
export function getPhaseAtTime(timeMs: number): PlayPhase {
  for (const phase of DEFAULT_SIMULATION_CONFIG.phases) {
    if (timeMs >= phase.startMs && timeMs < phase.endMs) {
      return phase.phase;
    }
  }
  // After all phases, return last phase
  return "t3";
}

/**
 * Get progress within current phase (0-1)
 */
export function getPhaseProgress(timeMs: number): number {
  for (const phase of DEFAULT_SIMULATION_CONFIG.phases) {
    if (timeMs >= phase.startMs && timeMs < phase.endMs) {
      return (timeMs - phase.startMs) / (phase.endMs - phase.startMs);
    }
  }
  return 1;
}

/**
 * Convert phase to overall progress (0-1)
 */
export function getOverallProgress(timeMs: number): number {
  return Math.min(1, timeMs / DEFAULT_SIMULATION_CONFIG.durationMs);
}
