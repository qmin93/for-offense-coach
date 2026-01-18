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

export interface FormationMeta {
  personnelHint?: Personnel[];
  structure?: "2x2" | "3x1" | "bunch" | "I" | "ace" | "trips" | "empty";
  strength?: Strength;
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

export interface Drill {
  name: string;
  purpose: string;
  phase: DrillPhase;
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

export interface PlaybookSection {
  id: string;
  name: string;
  playIds: string[];
}

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
  tags?: string[];
  sections: PlaybookSection[];
  exportSettings?: ExportSettings;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
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
