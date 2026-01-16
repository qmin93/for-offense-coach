// ============================================
// Suggestion Context Types
// Comprehensive inputs for diverse recommendations
// ============================================

import type { Personnel, Strength, FormationMeta, RecommendationReason } from "../dsl/types";

// ============================================
// Play Type
// ============================================

export type PlayType = "run" | "pass" | "rpo";

// ============================================
// Offense Context
// ============================================

export type QBAlignment = "gun" | "pistol" | "under_center";
export type RBAlignment = "strong" | "weak" | "dot" | "offset_strong" | "offset_weak";
export type SplitType = "wide" | "normal" | "condensed";

export interface OffenseContext {
  personnel: Personnel;
  qbAlignment: QBAlignment;
  rbAlignment: RBAlignment;
  teAttached: 0 | 1 | 2;
  structure: FormationMeta["structure"];
  split: SplitType;
  // Athlete Profile (optional)
  qbRunThreat?: 0 | 1 | 2;
  wrSpeed?: 0 | 1 | 2;
  olPullAbility?: 0 | 1 | 2;
}

// ============================================
// Defense Context
// ============================================

export type FrontType = "even" | "odd" | "over" | "under" | "bear";
export type ThreeTechPosition = "none" | "strong" | "weak" | "both";
export type ForcePlayer = "cb" | "s" | "olb" | "unknown";
export type ShellCoverage = "cover0" | "cover1" | "cover2" | "cover3" | "cover4" | "cover6" | "unknown";
export type PressureLevel = "low" | "med" | "high";
export type BlitzTendency = "field" | "boundary" | "both" | "none";
export type EdgeSetting = "hard" | "soft" | "unknown";
export type SpillOrBox = "spill" | "box" | "unknown";

export interface DefenseContext {
  // Box/Front (required)
  boxCount: 5 | 6 | 7 | 8;
  front: FrontType;
  threeTech: ThreeTechPosition;
  forcePlayer: ForcePlayer;
  // Shell/Pressure (optional but improves quality)
  shell: ShellCoverage;
  pressureRate: PressureLevel;
  blitzTendency: BlitzTendency;
  // Edge Rules (run-focused)
  edgeSetting: EdgeSetting;
  spillOrBox: SpillOrBox;
}

// ============================================
// Situation Context
// ============================================

export type Down = 1 | 2 | 3 | 4;
export type Distance = "1-2" | "3-5" | "6-9" | "10+";
export type FieldZone = "coming_out" | "open_field" | "high_red" | "low_red" | "goal_line";
export type Tempo = "huddle" | "no_huddle" | "2min";
export type Objective = "stay_ahead" | "explosive" | "kill_clock" | "score_now";

export interface SituationContext {
  down: Down;
  distance: Distance;
  fieldZone: FieldZone;
  tempo: Tempo;
  objective: Objective;
}

// ============================================
// Constraints
// ============================================

export type RiskTolerance = "conservative" | "balanced" | "aggressive";
export type InstallComplexity = "simple" | "medium" | "advanced";

export interface ConstraintsContext {
  avoidConcepts: string[]; // concept IDs to avoid
  mustIncludeTags: string[]; // tags that must be present
  riskTolerance: RiskTolerance;
  installComplexity: InstallComplexity;
}

// ============================================
// Full Suggestion Context
// ============================================

export interface SuggestionContext {
  playType: PlayType;
  offense: OffenseContext;
  defense: DefenseContext;
  situation: SituationContext;
  constraints: ConstraintsContext;
}

// ============================================
// Default Values
// ============================================

export const DEFAULT_OFFENSE_CONTEXT: OffenseContext = {
  personnel: "11",
  qbAlignment: "gun",
  rbAlignment: "dot",
  teAttached: 1,
  structure: "2x2",
  split: "normal",
  qbRunThreat: 1,
  wrSpeed: 1,
  olPullAbility: 1,
};

export const DEFAULT_DEFENSE_CONTEXT: DefenseContext = {
  boxCount: 7,
  front: "even",
  threeTech: "none",
  forcePlayer: "unknown",
  shell: "unknown",
  pressureRate: "med",
  blitzTendency: "none",
  edgeSetting: "unknown",
  spillOrBox: "unknown",
};

export const DEFAULT_SITUATION_CONTEXT: SituationContext = {
  down: 1,
  distance: "10+",
  fieldZone: "open_field",
  tempo: "huddle",
  objective: "stay_ahead",
};

export const DEFAULT_CONSTRAINTS_CONTEXT: ConstraintsContext = {
  avoidConcepts: [],
  mustIncludeTags: [],
  riskTolerance: "balanced",
  installComplexity: "medium",
};

export const DEFAULT_SUGGESTION_CONTEXT: SuggestionContext = {
  playType: "run",
  offense: DEFAULT_OFFENSE_CONTEXT,
  defense: DEFAULT_DEFENSE_CONTEXT,
  situation: DEFAULT_SITUATION_CONTEXT,
  constraints: DEFAULT_CONSTRAINTS_CONTEXT,
};

// ============================================
// Enhanced Suggestion Result (for UI)
// ============================================

export interface EnhancedSuggestionResult {
  conceptId: string;
  name: string;
  conceptType: "pass" | "run";
  score: number;
  fit: {
    numbers?: string;
    front?: string;
    surface?: string;
    structure?: string;
    coverage?: string;
  };
  why: string[]; // Legacy string reasons
  typedReasons: RecommendationReason[]; // Typed reasons with details (3+ guaranteed)
  variations?: Array<{
    conceptId: string;
    label: string;
  }>;
  alerts?: string[];
  autoBuildProfile: {
    style: "nfl_style" | "college_style" | "simple";
    buildMode: "replace" | "add_layer";
    includes: string[];
  };
}
