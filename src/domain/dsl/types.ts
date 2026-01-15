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
export type DefenseFront = "even" | "odd" | "over" | "under" | "bear" | "tite";
export type DefenseShell = "cover0" | "cover1" | "cover2" | "cover3" | "cover4" | "cover6" | "nickel" | "dime" | "unknown";
export type DefenseTechnique = "0" | "1" | "2i" | "3" | "4i" | "5" | "6" | "7" | "9";

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
  alignments: DefenseAlignment[];
  tags: string[];
}
export type Unit = "offense" | "defense" | "special";

export interface PlayerAlignment extends Point {
  facing?: Facing;
  stance?: Stance;
  splitPreset?: SplitPreset;
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
  curveMode?: boolean; // If true, use Bezier curves between points
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
export type BlockTargetType = "landmark" | "defender" | "gap" | "none";
export type BlockStyle = "drive" | "reach" | "down" | "pull_pass" | "zone_step" | "combo" | "custom";
export type GapName = "A_strong" | "A_weak" | "B_strong" | "B_weak" | "C_strong" | "C_weak" | "D";

export interface BlockTarget {
  targetType?: BlockTargetType;
  toPlayerId?: string;
  landmark?: Point;
  gapName?: GapName;
}

export interface BlockData {
  scheme: BlockScheme;
  target: BlockTarget;
  angleDeg?: number;        // 0-359 degree for block direction
  length?: number;          // Block length in field units
  style?: BlockStyle;       // Visual style of block
  notes?: string;
  pathPoints?: Point[];
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

export interface PlayMeta {
  personnel?: Personnel;
  unit?: Unit;
  strength?: Strength;
  formationId?: string;
  conceptId?: string;
  nflStyle?: boolean;
}

export interface FieldSettings {
  orientation?: "up" | "down";
  showGrid?: boolean;
  showHash?: boolean;
  showNumbers?: boolean;
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
// Playbook Types
// ============================================

export interface PlaybookSection {
  id: string;
  name: string;
  playIds: string[];
}

export interface ExportSettings {
  pageStyle?: "classic" | "minimal";
  includeNotes?: boolean;
  includeGrid?: boolean;
  footer?: "playName+page" | "page" | "none";
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
