// ============================================
// ForOffenseCoach DSL Types v1.0
// Based on DSL Specification document
// ============================================

// ============================================
// Common Types
// ============================================

export interface Point {
  x: number; // 0.0 ~ 1.0 (normalized field width)
  y: number; // -1.0 ~ +1.0 (LOS at 0)
}

// ============================================
// Path Types (Curve Routes/Motion)
// ============================================

export type PathKind = "line" | "polyline" | "quadratic";

export interface PathStyle {
  dashed?: boolean;
  thickness?: 1 | 2 | 3;
  arrow?: "end" | "none";
  colorKey?: "route" | "motion" | "block";
}

export interface PathMeta {
  editable?: boolean;
  lockStartToPlayer?: boolean;
}

export interface PathSpec {
  kind: PathKind;
  start: Point;
  end: Point;
  points?: Point[];      // For polyline (intermediate waypoints)
  control?: Point;       // For quadratic bezier (single control point)
  style?: PathStyle;
  meta?: PathMeta;
}

// ============================================
// Gap Anchors (Defense Tech Positioning)
// ============================================

// Gap x-coordinates relative to center (in yards)
export const GAP_X = {
  A: 0.75,
  B: 1.75,
  C: 2.75,
  D: 3.75,
} as const;

// Defensive line techniques
export type DefenseTechValue = "0" | "1" | "2i" | "2" | "3" | "4i" | "5" | "7" | "9";

// Tech to normalized x-coordinate mapping
export function techToNormalizedX(tech: DefenseTechValue, sideSign: 1 | -1): number {
  // sideSign: +1 for strong side (right by default), -1 for weak side
  // Returns normalized x (0-1 range, center at 0.5)
  const CENTER_X = 0.5;
  const YARD_TO_NORMALIZED = 0.06; // ~1 yard in normalized coords

  let offsetYards: number;
  switch (tech) {
    case "0":  offsetYards = 0; break;
    case "1":  offsetYards = GAP_X.A; break;
    case "2i": offsetYards = GAP_X.B - 0.25; break;
    case "2":  offsetYards = GAP_X.B; break;
    case "3":  offsetYards = GAP_X.B + 0.25; break;
    case "4i": offsetYards = GAP_X.C - 0.25; break;
    case "5":  offsetYards = GAP_X.C; break;
    case "7":  offsetYards = GAP_X.D - 0.25; break;
    case "9":  offsetYards = GAP_X.D; break;
    default:   offsetYards = 0;
  }

  return CENTER_X + sideSign * offsetYards * YARD_TO_NORMALIZED;
}

export type Facing = "up" | "down" | "left" | "right";
export type Stance = "two_point" | "three_point" | "none";
export type SplitPreset = "wide" | "normal" | "reduced" | "slot";
export type LineStyle = "solid" | "dashed" | "dotted";
export type Thickness = "thin" | "normal" | "thick";
export type EndMarker = "arrow" | "none" | "circle";
export type ColorToken = "offense" | "defense" | "note" | "highlight";

// ============================================
// Player Types
// ============================================

export type OffenseRole =
  | "QB"
  | "RB"
  | "FB"
  | "X"
  | "Y"
  | "Z"
  | "H"
  | "LT"
  | "LG"
  | "C"
  | "RG"
  | "RT";

export type DefenseRole =
  | "DE"
  | "DT"
  | "NT"
  | "OLB"
  | "ILB"
  | "MLB"
  | "CB"
  | "FS"
  | "SS"
  | "Nickel"
  | "Dime";

export type PlayerRole = OffenseRole | DefenseRole;

// ============================================
// Defense Preset Types
// ============================================

export type DefensePresetFamily = "front" | "shell";
export type DefenseFront = "even" | "odd" | "over" | "under" | "bear" | "tite" | "okie" | "mint";
export type DefenseShell = "cover0" | "cover1" | "cover2" | "cover3" | "cover4" | "cover6" | "nickel" | "dime" | "1high" | "2high" | "unknown";
export type DefenseTechnique = "0" | "1" | "2i" | "2" | "3" | "4i" | "5" | "6" | "7" | "9";

// 3-Tech position option for defense configuration
export type ThreeTechSide = "strong" | "weak" | "none";

export interface DefenseAlignment {
  role: DefenseRole;
  label: string;
  x: number;
  y: number;
  technique?: DefenseTechnique;
}

export interface DefensePreset {
  id: string;
  name: string;
  family: DefensePresetFamily;
  front: DefenseFront;
  boxCount: 5 | 6 | 7 | 8;
  shell: DefenseShell;
  threeTechSide?: ThreeTechSide; // Where 3-tech is positioned
  alignments: DefenseAlignment[];
  tags: string[];
}
export type Unit = "offense" | "defense" | "special";

export interface PlayerAlignment extends Point {
  facing?: Facing;
  stance?: Stance;
  splitPreset?: SplitPreset;
  depthYards?: number; // Off-ball depth in yards (0 = on LOS, 1 = 1 yard back, etc.)
  onLOS?: boolean; // Explicit on/off LOS flag
}

export interface PlayerAppearance {
  icon?: "circle" | "square" | "triangle";
  colorToken?: ColorToken;
  showLabel?: boolean;
}

export interface Player {
  id: string;
  role: PlayerRole;
  label: string;
  unit: Unit;
  alignment: PlayerAlignment;
  appearance?: PlayerAppearance;
  lock?: {
    positionLocked?: boolean;
  };
  extensions?: Record<string, unknown>;
}

export interface PlayerGroup {
  id: string;
  name: string;
  memberIds: string[];
  type: "unit_group" | "custom";
}

// ============================================
// Action Types
// ============================================

export type ActionType =
  | "route"
  | "block"
  | "motion"
  | "landmark"
  | "text"
  | "assignment"
  | "path";

export type ActionLayer = "primary" | "secondary" | "alt";

export interface ActionBase {
  id: string;
  actionType: ActionType;
  fromPlayerId?: string;
  layer?: ActionLayer;
  style?: ActionStyle;
  meta?: Record<string, unknown>;
  extensions?: Record<string, unknown>;
}

export interface ActionStyle {
  line?: LineStyle;
  thickness?: Thickness;
  endMarker?: EndMarker;
  colorToken?: ColorToken;
}

// Route Action
export type RoutePattern =
  // Quick
  | "hitch"
  | "speed_out"
  | "quick_out"
  | "slant"
  | "arrow"
  | "flat"
  // Intermediate
  | "curl"
  | "dig"
  | "out"
  | "cross"
  | "shallow"
  | "whip"
  | "deep_out"
  // Deep
  | "go"
  | "post"
  | "corner"
  | "seam"
  // Special
  | "wheel"
  | "return"
  | "pivot"
  | "custom";

export interface RouteData {
  pattern: RoutePattern;
  depth?: number;
  breakAngleDeg?: number;
  direction?: "inside" | "outside" | "straight";
  controlPoints: Point[];
  endMarker?: EndMarker;
  curveMode?: boolean;       // If true, use Bezier curves between points
  curveControl?: Point;      // Single control point for quadratic bezier (MVP)
}

// Playback/Timeline Types
export type PlayPhase = "pre_snap" | "snap" | "t1" | "t2" | "t3";

export interface RouteTiming {
  phase: "pre_snap" | "post_snap";
  delayMs?: number;
  startMs?: number;
  durationMs?: number;
}

export interface RouteAction extends ActionBase {
  actionType: "route";
  route: RouteData;
  timing?: RouteTiming;
}

// Block Action
export type BlockScheme =
  // Zone
  | "reach"
  | "zone_step"
  | "combo"
  | "climb"
  | "down"
  // Gap/Pull
  | "kick"
  | "wrap"
  | "pull_lead"
  | "pull_kick"
  | "trap"
  // Specialty
  | "wham"
  | "arc"
  | "sift"
  | "seal"
  // Hand-drawn
  | "custom";

// Block Target & Style Types
export type BlockTargetType = "player" | "landmark" | "gap" | "none";
export type BlockStyle = "drive" | "reach" | "down" | "pull_pass" | "zone_step" | "combo" | "custom";
export type GapName = "A_strong" | "A_weak" | "B_strong" | "B_weak" | "C_strong" | "C_weak" | "D";
export type BlockEndCap = "arrow" | "slash" | "flat" | "hand"; // End cap style for block lines

// Block Aim - where on the target to aim
export type BlockAimType = "center" | "inside_shoulder" | "outside_shoulder" | "playside_number" | "backside_number";

// Block Finish - what the blocker does after contact
export type BlockFinishType = "drive" | "seal_inside" | "seal_outside" | "kick" | "log" | "reach" | "hinge";

// Block Landmark IDs for when no defense is present
export type BlockLandmarkId =
  | "EMOL_STRONG" | "EMOL_WEAK"
  | "PSDE" | "BSDE"
  | "A_GAP_STRONG" | "A_GAP_WEAK"
  | "B_GAP_STRONG" | "B_GAP_WEAK"
  | "C_GAP_STRONG" | "C_GAP_WEAK"
  | "3T_STRONG" | "3T_WEAK"
  | "MIKE" | "WILL" | "SAM";

export interface BlockTarget {
  type: BlockTargetType;
  playerId?: string;      // When type = "player", the defender's player ID
  landmarkId?: BlockLandmarkId; // When type = "landmark", use predefined landmark
  landmark?: Point;       // When type = "landmark", custom coordinates
  gapName?: GapName;      // When type = "gap"
}

export interface BlockAim {
  type: BlockAimType;
  offsetYards?: number;   // Shoulder offset (default 0.35 yards)
}

export interface BlockFinish {
  type: BlockFinishType;
}

export interface BlockLineStyle {
  endCap?: BlockEndCap;   // Default: "slash"
  line?: "solid" | "dashed";
}

export interface BlockData {
  scheme: BlockScheme;
  // Legacy target (for backward compatibility)
  target?: BlockTarget;
  // New targeting system
  aim?: BlockAim;
  finish?: BlockFinish;
  lineStyle?: BlockLineStyle;
  // Computed/Display
  angleDeg?: number;        // 0-359 degree for block direction (can be computed)
  length?: number;          // Block length in field units
  style?: BlockStyle;       // Visual style of block (legacy)
  endCap?: BlockEndCap;     // End cap style (legacy, use lineStyle.endCap)
  showLabel?: boolean;      // Show scheme label on block
  notes?: string;
  pathPoints?: Point[];     // SVG path points (computed from from/target/aim)
  tags?: string[];          // Tags like ["run", "down", "gap"]
}

export interface BlockAction extends ActionBase {
  actionType: "block";
  block: BlockData;
}

// Motion Action
export type MotionType = "jet" | "orbit" | "return" | "shift" | "short" | "custom";

export interface MotionData {
  motionType: MotionType;
  pathPoints: Point[];
  endAlignment?: Point;
  curveMode?: boolean;       // If true, use Bezier curves
  curveControl?: Point;      // Single control point for quadratic bezier
}

export interface MotionAction extends ActionBase {
  actionType: "motion";
  motion: MotionData;
  timing?: { phase: "pre_snap" };
}

// Landmark Action
export type LandmarkKind = "aim_point" | "read_key" | "landmark" | "cone" | "alert";

export interface LandmarkData {
  kind: LandmarkKind;
  label?: string;
  x: number;
  y: number;
}

export interface LandmarkAction extends ActionBase {
  actionType: "landmark";
  landmark: LandmarkData;
}

// Text Action
export interface TextData {
  value: string;
  x: number;
  y: number;
  width?: number;
  align?: "left" | "center" | "right";
}

export interface TextStyle {
  fontSize?: "xs" | "sm" | "md" | "lg";
  box?: boolean;
}

export interface TextAction extends Omit<ActionBase, "style"> {
  actionType: "text";
  text: TextData;
  textStyle?: TextStyle;
}

export type Action =
  | RouteAction
  | BlockAction
  | MotionAction
  | LandmarkAction
  | TextAction;

// ============================================
// Play Types
// ============================================

export type Personnel = "10" | "11" | "12" | "13" | "20" | "21" | "22" | "23";
export type Strength = "left" | "right" | "none";

export type HashPosition = "L" | "M" | "R";

// ============================================
// Play Context Types (Pre-Context Persistence)
// Saved as part of play.meta.context
// ============================================

export type PlayIntent = "pass" | "run" | "rpo";
export type BoxCount = 5 | 6 | 7 | 8 | "unknown";
export type ContextFront = "even" | "odd" | "over" | "under" | "bear" | "unknown";
export type ThreeTech = "strong" | "weak" | "none" | "unknown";
export type ContextShell = "1high" | "2high" | "unknown";
export type PressureLevel = "none" | "low" | "medium" | "high";
export type ContextDown = 1 | 2 | 3 | 4 | "-";
export type ContextDistance = "short" | "medium" | "long" | "goal" | "-";
export type ContextHash = "L" | "M" | "R" | "-";

export interface PlayContextSituation {
  down: ContextDown;
  distance: ContextDistance;
  hash: ContextHash;
}

export interface PlayContext {
  playType: PlayIntent;
  boxCount: BoxCount;
  front: ContextFront;
  threeTech: ThreeTech;
  shell: ContextShell;
  pressure: PressureLevel;
  situation: PlayContextSituation;
}

export const DEFAULT_PLAY_CONTEXT: PlayContext = {
  playType: "pass",
  boxCount: "unknown",
  front: "unknown",
  threeTech: "unknown",
  shell: "unknown",
  pressure: "none",
  situation: {
    down: "-",
    distance: "-",
    hash: "-",
  },
};

export interface PlayMeta {
  personnel?: Personnel;
  unit?: Unit;
  strength?: Strength;
  formationId?: string;
  conceptId?: string;
  nflStyle?: boolean;
  // Scout Card fields (constrained for UI/export quality)
  down?: ScoutCardDown;
  distance?: ScoutCardDistance;
  hash?: HashPosition;
  callName?: string;
  // Pre-Context (persisted from Start New Play flow)
  context?: PlayContext;
}

// Scout Card constrained types
export type ScoutCardDown = 1 | 2 | 3 | 4 | "-";
export type ScoutCardDistance = "short" | "medium" | "long" | "goal" | number | "-";

// Helper to display distance
export function formatDistance(distance: ScoutCardDistance): string {
  if (typeof distance === "number") return String(distance);
  if (distance === "-") return "-";
  return distance.charAt(0).toUpperCase() + distance.slice(1);
}

// Grid density levels for field rendering
export type GridDensity = "low" | "medium" | "high";

export interface FieldSettings {
  orientation?: "up" | "down";
  showGrid?: boolean;
  showHash?: boolean;
  showNumbers?: boolean;
  gridDensity?: GridDensity; // low = 10yd only, medium = 5yd, high = 5yd + 1yd ticks
}

export interface PlayNotes {
  callName?: string;
  coachingPoints?: string[];
}

export interface DerivedFrom {
  sourcePlayId?: string | null;
  sourceConceptId?: string | null;
  sourceTeamId?: string | null;
}

export interface PlayHistory {
  version: number;
  derivedFrom?: DerivedFrom;
}

export interface Roster {
  players: Player[];
  groups?: PlayerGroup[];
}

export interface Play {
  schemaVersion: string;
  type: "play";
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  meta?: PlayMeta;
  field?: FieldSettings;
  roster: Roster;
  actions: Action[];
  notes?: PlayNotes;
  history?: PlayHistory;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  extensions?: Record<string, unknown>;
}

// ============================================
// Formation Types
// ============================================

export interface SnapRules {
  olSpacingPreset?: "tight" | "standard" | "wide";
  wrSplitPreset?: SplitPreset;
  lockCenterToHash?: boolean;
}

export interface FormationDefaults {
  players: Omit<Player, "unit" | "appearance" | "lock" | "extensions">[];
  snapRules?: SnapRules;
}

// ============================================
// Formation Roster Requirements (Team-Aware)
// ============================================

export interface FormationRosterRequirement {
  minWR: number;        // Minimum WRs needed (e.g., 3 for trips)
  minTE: number;        // Minimum TEs needed (0 for spread, 1-2 for 12/13 personnel)
  minRB: number;        // Minimum RBs needed (0 for empty, 1-2 for I-form)
  needsFB: boolean;     // Requires fullback (21/22 personnel)
  olPullRequired: boolean; // Formation concepts often require OL pulling
}

// Formation risk/complexity tags
export type FormationRiskTag =
  | "qb_exposure"       // QB vulnerable to rush
  | "unbalanced"        // Unbalanced formation
  | "motion_heavy"      // Requires motion execution
  | "complex_rules"     // Complex assignment rules
  | "te_blocking"       // Relies on TE blocking
  | "ol_athletic";      // Requires athletic OL (pulls, screens)

export type FormationStyleTag =
  | "spread"            // Spread out formation
  | "power"             // Power/gap running friendly
  | "balanced"          // Balanced run/pass
  | "pass_heavy"        // Pass-first formation
  | "run_heavy"         // Run-first formation
  | "trick_play"        // Good for trick plays
  | "quick_game"        // Quick passing game
  | "play_action";      // Play action friendly

export interface FormationMeta {
  personnelHint?: Personnel[];
  structure?: "2x2" | "3x1" | "bunch" | "I" | "ace" | "trips" | "empty";
  strength?: Strength;
  // Team-aware metadata
  requiredRoster?: FormationRosterRequirement;
  styleTags?: FormationStyleTag[];
  riskTags?: FormationRiskTag[];
  complexity?: 1 | 2 | 3 | 4 | 5; // 1 = simple, 5 = complex
  description?: string;
}

export interface Formation {
  schemaVersion: string;
  type: "formation";
  id: string;
  name: string;
  meta?: FormationMeta;
  defaults: FormationDefaults;
}

// ============================================
// Formation Package Types (Grouped Formations)
// ============================================

export type FormationPackagePhilosophy =
  | "spread_the_defense"      // Trips, Quads, Empty - maximize horizontal spacing
  | "condensed_power"         // Bunch, Tight, Wing - create leverage at POA
  | "balance_flexibility"     // 2x2, Twins, Pro - multiple options each way
  | "misdirection"            // Motion-heavy packages
  | "personnel_based";        // 12, 21, 13 personnel packages

export interface FormationPackageRelation {
  formationId: string;
  role: "base" | "variation" | "complement" | "motion_shift";
  situationBias?: string[]; // e.g., ["redzone", "short_yardage"]
  notes?: string;
}

export interface FormationPackage {
  id: string;
  name: string;
  philosophy: FormationPackagePhilosophy;
  summary: string; // Brief description of package purpose
  formations: FormationPackageRelation[];
  personnel?: Personnel[];
  tags?: string[];
  installOrder?: number; // Suggested order for teaching (1 = first)
  strengthVs?: {
    defense?: string[];    // e.g., ["nickel", "dime"]
    coverage?: string[];   // e.g., ["cover_2", "cover_3"]
    front?: string[];      // e.g., ["even", "odd"]
  };
  weaknessVs?: {
    defense?: string[];
    coverage?: string[];
    front?: string[];
  };
}

// ============================================
// Concept Types
// ============================================

export type ConceptType = "pass" | "run";
export type ConceptCategory = "quick" | "intermediate" | "deep" | "screen" | "gap" | "zone" | "perimeter";

export interface RouteRole {
  roleName: string; // CLEAR, INTERMEDIATE, FLAT, UNDER 등
  appliesTo: PlayerRole[];
  defaultRoute: Partial<RouteData>;
}

export interface BlockRole {
  roleName: string; // PULLER, DOWN, COMBO 등
  appliesTo: PlayerRole[];
  defaultBlock: Partial<BlockData>;
}

export type PlacementStrategy = "relative_to_alignment" | "absolute_template" | "hybrid";
export type ConflictPolicy = "add_layer" | "replace_actions";

export interface BuildPolicy {
  placementStrategy: PlacementStrategy;
  defaultSide?: Strength;
  conflictPolicy?: ConflictPolicy;
  routeDepthScale?: number;
  runLandmarks?: boolean;
}

export interface ConceptTemplate {
  roles: (RouteRole | BlockRole)[];
  buildPolicy?: BuildPolicy;
}

export interface ConceptRequirements {
  minEligibleReceivers?: number;
  preferredStructures?: FormationMeta["structure"][];
  personnelHints?: Personnel[];
  needsTE?: boolean;
  needsPuller?: "none" | "G" | "T" | "GT";
  boxTolerance?: "6_ok" | "7_ok" | "8_risky";
}

export interface PassHints {
  category: ConceptCategory;
  manBeater?: boolean;
  zoneBeater?: boolean;
  stress?: string[];
}

export interface RunHints {
  bestVsFront?: ("even" | "odd")[];
  bestVs3T?: ("strong" | "weak" | "none")[];
  bestWhenBox?: ("6" | "7" | "8")[];
  surfaceNeeds?: string[];
  aim?: string;
  category?: ConceptCategory;
}

// Install Focus
export type DrillPhase = "indy" | "group" | "team";
export type DrillSource = "youtube" | "instagram" | "custom";

export interface DrillSearchFallback {
  enabled?: boolean;        // default true if no url
  queries?: string[];       // optional override query list
}

export interface Drill {
  id?: string;              // stable id (slug)
  name: string;
  purpose: string;
  phase: DrillPhase;
  url?: string;             // optional direct link
  source?: DrillSource;     // optional hint for UI
  tags?: string[];          // ["OL", "pull", "kickout"]
  searchFallback?: DrillSearchFallback;
}

export interface VideoRef {
  platform: "instagram" | "youtube" | "tiktok";
  url: string;
  thumbnailUrl?: string;
  accountName: string;
  hashtags?: string[];
}

export interface FailurePoint {
  id: string;
  name: string;
  drill: Drill;
  videoRefs?: VideoRef[];
}

export interface InstallFocus {
  failurePoints: FailurePoint[];
}

export interface Concept {
  schemaVersion: string;
  type: "concept";
  id: string;
  name: string;
  searchAlias?: string;     // e.g. "Power O", "Flood concept" for search queries
  conceptType: ConceptType;
  summary: string;
  badges?: string[];
  requirements?: ConceptRequirements;
  template: ConceptTemplate;
  passHints?: PassHints;
  runHints?: RunHints;
  installFocus?: InstallFocus;
  suggestionHints?: {
    category?: ConceptCategory;
    coverageStress?: string[];
  };
  familyId?: string; // Reference to ConceptFamily
}

// ============================================
// Concept Family Types
// ============================================

export interface ConceptVariation {
  conceptId: string;
  label: string;
  description: string;
  tags?: string[];
}

export interface ConceptAlert {
  id: string;
  label: string;
  description: string;
  trigger: {
    defense?: {
      front?: DefenseFront[];
      shell?: DefenseShell[];
      boxCount?: number[];
    };
    situation?: {
      down?: (1 | 2 | 3 | 4)[];
      fieldZone?: string[];
    };
  };
  adjustment: string;
}

export interface ConceptFamily {
  id: string;
  name: string;
  baseConceptId: string;
  conceptType: ConceptType;
  summary: string;
  variations: ConceptVariation[];
  alerts: ConceptAlert[];
  installFocus: string[];
  compatibleFronts: DefenseFront[];
  compatibleShells: DefenseShell[];
  tags: string[];
}

// ============================================
// Recommendation Reason Types (추천 신뢰 강화)
// ============================================

export type ReasonType = "numbers" | "angle" | "surface" | "structure" | "coverage" | "situational";

export interface RecommendationReason {
  type: ReasonType;
  text: string;
  favorable: boolean; // true = 이 이유로 추천됨, false = 주의 사항
  details?: string;
}

export interface SuggestionWithReasons {
  conceptId: string;
  score: number;
  reasons: RecommendationReason[]; // 최소 3개 보장
  warnings?: RecommendationReason[]; // 주의 사항
  category: string;
}

// ============================================
// Auto-build Failure Types
// ============================================

export type AutoBuildFailureCode =
  | "NOT_ENOUGH_RECEIVERS"
  | "FORMATION_MISMATCH"
  | "MISSING_PULLER"
  | "NO_ELIGIBLE_SURFACE"
  | "NO_MATCHING_ROLES"
  | "INVALID_DSL_STATE"
  | "UNKNOWN";

export interface AutoBuildFailure {
  code: AutoBuildFailureCode;
  message: string;
  suggestion: string; // 다음 액션 제시
  context?: Record<string, unknown>;
}

export interface AutoBuildResult {
  success: boolean;
  failure?: AutoBuildFailure;
  appliedActions?: number;
  warnings?: string[];
}

// ============================================
// Editor Validation Types
// ============================================

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  field?: string;
  playerId?: string;
  actionId?: string;
}

export interface ValidationResult {
  valid: boolean; // error가 없으면 true
  canSave: boolean; // error가 없으면 true
  canExport: boolean; // error + critical warning 없으면 true
  issues: ValidationIssue[];
}

// ============================================
// Field Landmark Overlay Types (EMOL/Gap markers)
// ============================================

// Landmark IDs for field overlay (auto-generated from formation)
export type FieldLandmarkId =
  // End Man On Line markers
  | "EMOL_STRONG"
  | "EMOL_WEAK"
  // A Gap markers
  | "A_GAP_STRONG"
  | "A_GAP_WEAK"
  // B Gap markers
  | "B_GAP_STRONG"
  | "B_GAP_WEAK"
  // C Gap markers
  | "C_GAP_STRONG"
  | "C_GAP_WEAK"
  // D Gap (outside edge)
  | "D_GAP";

// Field landmark for gap/EMOL overlay display
export interface FieldLandmark {
  id: FieldLandmarkId;
  label: string;         // "A", "B", "C", "D", "EMOL"
  displayLabel: string;  // "A (S)", "EMOL (W)" with side indicator
  x: number;             // Normalized x coordinate
  y: number;             // Normalized y coordinate (typically on LOS)
  side: "strong" | "weak" | "center";
  type: "gap" | "emol";
}

// Landmark overlay settings
export interface LandmarkOverlaySettings {
  showLandmarks: boolean;
  showGaps: boolean;
  showEmol: boolean;
  autoShowInBlockMode: boolean;  // Auto-enable when in Block mode
}

// ============================================
// Playbook Types
// ============================================

// Predefined section types for playbook organization
export type PlaybookSectionType =
  | "install"     // Install Day - new schemes being introduced
  | "run"         // Run plays
  | "pass"        // Pass plays
  | "rpo"         // Run-Pass Options
  | "screen"      // Screens & Quick Game
  | "gadget"      // Trick plays, fakes, specials
  | "redzone"     // Red Zone package
  | "goalline"    // Goal Line package
  | "2minute"     // 2-Minute Drill
  | "custom";     // User-defined section

// Section color presets for visual organization
export const SECTION_COLORS: Record<PlaybookSectionType, string> = {
  install: "#8B5CF6",   // Purple
  run: "#10B981",       // Green
  pass: "#3B82F6",      // Blue
  rpo: "#F59E0B",       // Amber
  screen: "#06B6D4",    // Cyan
  gadget: "#EC4899",    // Pink
  redzone: "#EF4444",   // Red
  goalline: "#DC2626",  // Darker Red
  "2minute": "#F97316", // Orange
  custom: "#6B7280",    // Gray
};

// Section icons (Lucide icon names)
export const SECTION_ICONS: Record<PlaybookSectionType, string> = {
  install: "GraduationCap",
  run: "MoveRight",
  pass: "Target",
  rpo: "Split",
  screen: "Zap",
  gadget: "Sparkles",
  redzone: "Flag",
  goalline: "Trophy",
  "2minute": "Clock",
  custom: "Folder",
};

export interface PlaybookSection {
  id: string;
  name: string;
  sectionType: PlaybookSectionType;
  playIds: string[];
  color?: string;        // Override default color
  collapsed?: boolean;   // UI state: section collapsed
  description?: string;  // Optional section description
}

// Situational tags for plays (for filtering/organization)
export type PlaySituationTag =
  | "short_yardage"     // 3rd & short, 4th & 1
  | "long_yardage"      // 3rd & long
  | "red_zone"          // Inside 20
  | "goal_line"         // Inside 5
  | "backed_up"         // Own 10 or less
  | "2_minute"          // Hurry-up situations
  | "opening_script"    // First 15 plays
  | "vs_even"           // Works well vs even fronts
  | "vs_odd"            // Works well vs odd fronts
  | "vs_man"            // Works well vs man coverage
  | "vs_zone"           // Works well vs zone coverage
  | "vs_blitz"          // Hot routes / blitz beater
  | "motion"            // Uses pre-snap motion
  | "no_huddle"         // No-huddle compatible
  | "check_with_me";    // At-the-line audible option

// Tag display metadata
export interface PlayTagInfo {
  tag: PlaySituationTag;
  label: string;
  shortLabel: string;
  color: string;
}

export const PLAY_TAG_INFO: PlayTagInfo[] = [
  { tag: "short_yardage", label: "Short Yardage", shortLabel: "Short", color: "#22C55E" },
  { tag: "long_yardage", label: "Long Yardage", shortLabel: "Long", color: "#EAB308" },
  { tag: "red_zone", label: "Red Zone", shortLabel: "RZ", color: "#EF4444" },
  { tag: "goal_line", label: "Goal Line", shortLabel: "GL", color: "#DC2626" },
  { tag: "backed_up", label: "Backed Up", shortLabel: "Own10", color: "#F97316" },
  { tag: "2_minute", label: "2-Minute", shortLabel: "2min", color: "#8B5CF6" },
  { tag: "opening_script", label: "Opening Script", shortLabel: "Script", color: "#06B6D4" },
  { tag: "vs_even", label: "vs Even Front", shortLabel: "vsEven", color: "#3B82F6" },
  { tag: "vs_odd", label: "vs Odd Front", shortLabel: "vsOdd", color: "#6366F1" },
  { tag: "vs_man", label: "vs Man Coverage", shortLabel: "vsMan", color: "#EC4899" },
  { tag: "vs_zone", label: "vs Zone Coverage", shortLabel: "vsZone", color: "#14B8A6" },
  { tag: "vs_blitz", label: "vs Blitz", shortLabel: "vsBlitz", color: "#F43F5E" },
  { tag: "motion", label: "Motion", shortLabel: "Mot", color: "#A855F7" },
  { tag: "no_huddle", label: "No Huddle", shortLabel: "NH", color: "#0EA5E9" },
  { tag: "check_with_me", label: "Check With Me", shortLabel: "CWM", color: "#84CC16" },
];

// Export Overlay Mode - controls what labels appear on export
export type ExportOverlayMode = "off" | "defense" | "landmarks" | "both";

// Overlay density - controls how many labels to show
export type OverlayDensity = "clean" | "standard" | "full";
// clean: Defense + EMOL only
// standard: Defense + EMOL + A/B gaps
// full: All labels (with collision hiding)

export interface ExportSettings {
  pageStyle?: "classic" | "minimal";
  includeNotes?: boolean;
  includeGrid?: boolean;
  footer?: "playName+page" | "page" | "none";
  // Overlay options for PDF/PNG export
  overlayMode?: ExportOverlayMode;     // What labels to include (default: based on pageStyle)
  overlayDensity?: OverlayDensity;     // How many labels to show (default: "standard")
  overlayOpacity?: number;             // 0-1, opacity of overlay labels (default: 1.0)
  includeLegend?: boolean;             // Include tech/gap legend box (default: false)
}

export interface Playbook {
  schemaVersion: string;
  type: "playbook";
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  sections: PlaybookSection[];
  exportSettings?: ExportSettings;
  // View preferences
  viewMode?: "grid" | "list" | "compact";
  sortBy?: "name" | "created" | "updated" | "custom";
  filterTags?: PlaySituationTag[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================
// Situation Preset Types (Context Presets)
// ============================================

export type FieldZone =
  | "own_goal"       // Own 0-10
  | "backed_up"      // Own 10-20
  | "own_territory"  // Own 20-50
  | "plus_territory" // Opp 50-20
  | "red_zone"       // Opp 20-10
  | "goal_line";     // Opp 10-0

export interface SituationPreset {
  id: string;
  name: string;
  description?: string;
  icon?: string;        // Emoji or icon name
  color?: string;       // Hex color for UI
  // Situation data
  down: ScoutCardDown;
  distance: ScoutCardDistance;
  hash: HashPosition;
  fieldZone?: FieldZone;
  // Optional tags for filtering
  tags?: string[];
  // Metadata
  isBuiltIn?: boolean;  // System presets vs user-created
  createdAt?: string;
  updatedAt?: string;
}

// Built-in presets
export const BUILT_IN_SITUATION_PRESETS: SituationPreset[] = [
  // Standard downs
  {
    id: "1st_10",
    name: "1st & 10",
    description: "First down, standard",
    icon: "1️⃣",
    down: 1,
    distance: 10,
    hash: "M",
    isBuiltIn: true,
  },
  {
    id: "2nd_7",
    name: "2nd & 7",
    description: "Second down, medium",
    icon: "2️⃣",
    down: 2,
    distance: 7,
    hash: "M",
    isBuiltIn: true,
  },
  {
    id: "3rd_long",
    name: "3rd & Long",
    description: "Third down, 8+ yards",
    icon: "🎯",
    color: "#EF4444",
    down: 3,
    distance: "long",
    hash: "M",
    isBuiltIn: true,
  },
  {
    id: "3rd_medium",
    name: "3rd & Medium",
    description: "Third down, 4-7 yards",
    icon: "🎯",
    color: "#F59E0B",
    down: 3,
    distance: "medium",
    hash: "M",
    isBuiltIn: true,
  },
  {
    id: "3rd_short",
    name: "3rd & Short",
    description: "Third down, 1-3 yards",
    icon: "💪",
    color: "#22C55E",
    down: 3,
    distance: "short",
    hash: "M",
    isBuiltIn: true,
  },
  // Short yardage
  {
    id: "4th_1",
    name: "4th & 1",
    description: "Fourth down, goal to go",
    icon: "⚡",
    color: "#EF4444",
    down: 4,
    distance: 1,
    hash: "M",
    isBuiltIn: true,
  },
  // Red Zone
  {
    id: "rz_1st",
    name: "Red Zone 1st",
    description: "First down inside 20",
    icon: "🔴",
    color: "#EF4444",
    down: 1,
    distance: 10,
    hash: "M",
    fieldZone: "red_zone",
    isBuiltIn: true,
  },
  {
    id: "goal_line",
    name: "Goal Line",
    description: "Goal to go, inside 5",
    icon: "🏈",
    color: "#DC2626",
    down: 1,
    distance: "goal",
    hash: "M",
    fieldZone: "goal_line",
    isBuiltIn: true,
  },
  // Hash specific
  {
    id: "left_hash",
    name: "Left Hash",
    description: "Ball on left hash",
    icon: "⬅️",
    down: 1,
    distance: 10,
    hash: "L",
    isBuiltIn: true,
  },
  {
    id: "right_hash",
    name: "Right Hash",
    description: "Ball on right hash",
    icon: "➡️",
    down: 1,
    distance: 10,
    hash: "R",
    isBuiltIn: true,
  },
  // 2-Minute
  {
    id: "2min_1st",
    name: "2-Min 1st & 10",
    description: "2-minute drill start",
    icon: "⏱️",
    color: "#8B5CF6",
    down: 1,
    distance: 10,
    hash: "M",
    tags: ["2_minute"],
    isBuiltIn: true,
  },
  {
    id: "2min_spike",
    name: "Spike Situation",
    description: "Clock management",
    icon: "🛑",
    color: "#F97316",
    down: 1,
    distance: 10,
    hash: "M",
    tags: ["2_minute"],
    isBuiltIn: true,
  },
];

// ============================================
// Concept Pack Types (Weekly Release System)
// ============================================

export interface ConceptPackMeta {
  releaseWeek: number;          // Release week number (e.g., 1, 2, 3...)
  releaseYear: number;          // Release year (e.g., 2025, 2026)
  releaseDate: string;          // ISO date string (YYYY-MM-DD)
  theme?: string;               // Optional theme (e.g., "Red Zone", "2-Minute Drill")
  description?: string;         // Pack description
}

export interface ConceptPackContent {
  runConceptIds: string[];      // Run concept IDs in this pack
  passConceptIds: string[];     // Pass concept IDs in this pack
  familyIds?: string[];         // Related family IDs
}

export interface ConceptPack {
  schemaVersion: string;
  type: "concept_pack";
  id: string;                   // e.g., "pack_2025_w01"
  name: string;                 // e.g., "Week 1 - Foundation"
  version: string;              // Semantic version (e.g., "1.0.0")
  meta: ConceptPackMeta;
  content: ConceptPackContent;
  isNew?: boolean;              // Computed: true if released within 7 days
  tags?: string[];
  changelog?: string[];         // List of changes in this version
}

// Helper to check if a pack is "new" (released within the last 7 days)
export function isPackNew(pack: ConceptPack): boolean {
  if (pack.isNew !== undefined) return pack.isNew;
  const releaseDate = new Date(pack.meta.releaseDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

// Helper to get week label (e.g., "W1", "W12")
export function getPackWeekLabel(pack: ConceptPack): string {
  return `W${pack.meta.releaseWeek}`;
}

// ============================================
// Plan Tier Types (Free/Team/Season)
// ============================================

export type PlanTier = "free" | "team" | "season";

export interface PlanLimits {
  maxPlays: number;             // Max plays per workspace
  maxPlaybooks: number;         // Max playbooks per workspace
  maxExports: number;           // Max exports per month (0 = unlimited)
  conceptPackAccess: "base" | "all"; // Which concept packs are accessible
  defensePresets: boolean;      // Can use defense presets
  customFormations: boolean;    // Can create custom formations
  shareLinks: boolean;          // Can create share links
  teamFeatures: boolean;        // Access to team collaboration features
  installPlan: boolean;         // Access to install plan feature
  advancedExport: boolean;      // PDF multi-page, scout cards
}

export const PLAN_TIER_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxPlays: 10,
    maxPlaybooks: 1,
    maxExports: 5,
    conceptPackAccess: "base",
    defensePresets: false,
    customFormations: false,
    shareLinks: false,
    teamFeatures: false,
    installPlan: false,
    advancedExport: false,
  },
  team: {
    maxPlays: 100,
    maxPlaybooks: 5,
    maxExports: 50,
    conceptPackAccess: "all",
    defensePresets: true,
    customFormations: true,
    shareLinks: true,
    teamFeatures: true,
    installPlan: true,
    advancedExport: true,
  },
  season: {
    maxPlays: -1, // Unlimited
    maxPlaybooks: -1,
    maxExports: 0, // Unlimited
    conceptPackAccess: "all",
    defensePresets: true,
    customFormations: true,
    shareLinks: true,
    teamFeatures: true,
    installPlan: true,
    advancedExport: true,
  },
};

// Check if a feature is available for a plan tier
export function isPlanFeatureAvailable(tier: PlanTier, feature: keyof PlanLimits): boolean {
  const limits = PLAN_TIER_LIMITS[tier];
  const value = limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value === "all";
  return true;
}

// Check if limit is reached
export function isPlanLimitReached(tier: PlanTier, feature: "maxPlays" | "maxPlaybooks" | "maxExports", current: number): boolean {
  const limit = PLAN_TIER_LIMITS[tier][feature];
  if (limit === -1 || limit === 0) return false; // Unlimited
  return current >= limit;
}

// ============================================
// Team Profile Types (Formation Recommendation)
// ============================================

export interface PositionAvailability {
  count: number;
  starterQuality: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface RosterAvailability {
  QB: PositionAvailability;
  RB: PositionAvailability;
  FB: PositionAvailability;
  WR: PositionAvailability;
  TE: PositionAvailability;
  OL: PositionAvailability;
}

export interface UnitStrength {
  olRunBlock: 1 | 2 | 3 | 4 | 5;
  olPassPro: 1 | 2 | 3 | 4 | 5;
  rbVision: 1 | 2 | 3 | 4 | 5;
  wrSeparation: 1 | 2 | 3 | 4 | 5;
  qbArm: 1 | 2 | 3 | 4 | 5;
  qbDecision: 1 | 2 | 3 | 4 | 5;
  teBlock?: 0 | 1 | 2 | 3 | 4 | 5;
  teRoute?: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface StylePreferences {
  runPassBalance: "run_heavy" | "balanced" | "pass_heavy";
  underCenterUsage: "low" | "medium" | "high";
  motionUsage: "low" | "medium" | "high";
  tempo: "low" | "medium" | "high";
  riskTolerance: "conservative" | "normal" | "aggressive";
}

export interface TeamProfile {
  schemaVersion: string;
  type: "team_profile";
  id: string;
  teamName: string;
  rosterAvailability: RosterAvailability;
  unitStrength: UnitStrength;
  stylePreferences: StylePreferences;
  notes?: string[];
  createdAt?: string;
  updatedAt?: string;
}
