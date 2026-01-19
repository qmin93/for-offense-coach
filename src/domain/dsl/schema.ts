// ============================================
// ForOffenseCoach DSL Zod Schema
// Validation layer for DSL types
// ============================================

import { z } from "zod";

// ============================================
// Common Schemas
// ============================================

export const PointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(-1).max(1),
});

export const FacingSchema = z.enum(["up", "down", "left", "right"]);
export const StanceSchema = z.enum(["two_point", "three_point", "none"]);
export const SplitPresetSchema = z.enum(["wide", "normal", "reduced", "slot"]);
export const LineStyleSchema = z.enum(["solid", "dashed", "dotted"]);
export const ThicknessSchema = z.enum(["thin", "normal", "thick"]);
export const EndMarkerSchema = z.enum(["arrow", "none", "circle"]);
export const ColorTokenSchema = z.enum(["offense", "defense", "note", "highlight"]);

// ============================================
// Player Schemas
// ============================================

export const OffenseRoleSchema = z.enum([
  "QB", "RB", "FB", "X", "Y", "Z", "H", "LT", "LG", "C", "RG", "RT",
]);

export const DefenseRoleSchema = z.enum([
  "DE", "DT", "NT", "OLB", "ILB", "MLB", "CB", "FS", "SS", "Nickel", "Dime",
]);

export const PlayerRoleSchema = z.union([OffenseRoleSchema, DefenseRoleSchema]);

// ============================================
// Defense Preset Schemas
// ============================================

export const DefensePresetFamilySchema = z.enum(["front", "shell"]);
export const DefenseFrontSchema = z.enum(["even", "odd", "over", "under", "bear", "tite"]);
export const DefenseShellSchema = z.enum(["cover0", "cover1", "cover2", "cover3", "cover4", "cover6", "nickel", "dime", "unknown"]);
export const DefenseTechniqueSchema = z.enum(["0", "1", "2i", "3", "4i", "5", "6", "7", "9"]);

export const DefenseAlignmentSchema = z.object({
  role: DefenseRoleSchema,
  label: z.string(),
  x: z.number().min(0).max(1),
  y: z.number().min(-1).max(1),
  technique: DefenseTechniqueSchema.optional(),
});

export const DefensePresetSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  family: DefensePresetFamilySchema,
  front: DefenseFrontSchema,
  boxCount: z.union([z.literal(5), z.literal(6), z.literal(7), z.literal(8)]),
  shell: DefenseShellSchema,
  alignments: z.array(DefenseAlignmentSchema),
  tags: z.array(z.string()),
});
export const UnitSchema = z.enum(["offense", "defense", "special"]);

export const PlayerAlignmentSchema = PointSchema.extend({
  facing: FacingSchema.optional(),
  stance: StanceSchema.optional(),
  splitPreset: SplitPresetSchema.optional(),
});

export const PlayerAppearanceSchema = z.object({
  icon: z.enum(["circle", "square", "triangle"]).optional(),
  colorToken: ColorTokenSchema.optional(),
  showLabel: z.boolean().optional(),
});

export const PlayerSchema = z.object({
  id: z.string().min(1),
  role: PlayerRoleSchema,
  label: z.string(),
  unit: UnitSchema,
  alignment: PlayerAlignmentSchema,
  appearance: PlayerAppearanceSchema.optional(),
  lock: z.object({
    positionLocked: z.boolean().optional(),
  }).optional(),
  extensions: z.record(z.string(), z.unknown()).optional(),
});

export const PlayerGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  memberIds: z.array(z.string()),
  type: z.enum(["unit_group", "custom"]),
});

// ============================================
// Action Schemas
// ============================================

export const ActionTypeSchema = z.enum([
  "route", "block", "motion", "landmark", "text", "assignment", "path",
]);

export const ActionLayerSchema = z.enum(["primary", "secondary", "alt"]);

export const ActionStyleSchema = z.object({
  line: LineStyleSchema.optional(),
  thickness: ThicknessSchema.optional(),
  endMarker: EndMarkerSchema.optional(),
  colorToken: ColorTokenSchema.optional(),
});

const ActionBaseSchema = z.object({
  id: z.string().min(1),
  fromPlayerId: z.string().optional(),
  layer: ActionLayerSchema.optional(),
  style: ActionStyleSchema.optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  extensions: z.record(z.string(), z.unknown()).optional(),
});

// Route Action
export const RoutePatternSchema = z.enum([
  "hitch", "speed_out", "quick_out", "slant", "arrow", "flat",
  "curl", "dig", "out", "cross", "shallow", "whip", "deep_out",
  "go", "post", "corner", "seam",
  "wheel", "return", "pivot", "custom",
]);

export const RouteDataSchema = z.object({
  pattern: RoutePatternSchema,
  depth: z.number().optional(),
  breakAngleDeg: z.number().optional(),
  direction: z.enum(["inside", "outside", "straight"]).optional(),
  controlPoints: z.array(PointSchema),
  endMarker: EndMarkerSchema.optional(),
});

export const PlayPhaseSchema = z.enum(["pre_snap", "snap", "t1", "t2", "t3"]);

export const RouteTimingSchema = z.object({
  phase: z.enum(["pre_snap", "post_snap"]),
  delayMs: z.number().optional(),
  startMs: z.number().optional(),
  durationMs: z.number().optional(),
});

export const RouteActionSchema = ActionBaseSchema.extend({
  actionType: z.literal("route"),
  route: RouteDataSchema,
  timing: RouteTimingSchema.optional(),
});

// Block Action
export const BlockSchemeSchema = z.enum([
  "reach", "zone_step", "combo", "climb", "down",
  "kick", "wrap", "pull_lead", "pull_kick", "trap",
  "wham", "arc", "sift", "seal", "pass_set", "custom",
]);

export const BlockTargetTypeSchema = z.enum(["landmark", "defender", "gap", "none"]);
export const BlockStyleSchema = z.enum(["drive", "reach", "down", "pull_pass", "zone_step", "combo", "custom"]);
export const GapNameSchema = z.enum(["A_strong", "A_weak", "B_strong", "B_weak", "C_strong", "C_weak", "D"]);

export const BlockTargetSchema = z.object({
  targetType: BlockTargetTypeSchema.optional(),
  toPlayerId: z.string().optional(),
  landmark: PointSchema.optional(),
  gapName: GapNameSchema.optional(),
});

export const BlockDataSchema = z.object({
  scheme: BlockSchemeSchema,
  target: BlockTargetSchema,
  angleDeg: z.number().min(0).max(359).optional(),
  length: z.number().optional(),
  style: BlockStyleSchema.optional(),
  notes: z.string().optional(),
  pathPoints: z.array(PointSchema).optional(),
});

export const BlockActionSchema = ActionBaseSchema.extend({
  actionType: z.literal("block"),
  block: BlockDataSchema,
});

// Motion Action
export const MotionTypeSchema = z.enum(["jet", "orbit", "return", "shift", "short", "run_path", "custom"]);

export const MotionDataSchema = z.object({
  motionType: MotionTypeSchema,
  pathPoints: z.array(PointSchema),
  endAlignment: PointSchema.optional(),
});

export const MotionActionSchema = ActionBaseSchema.extend({
  actionType: z.literal("motion"),
  motion: MotionDataSchema,
  timing: z.object({ phase: z.enum(["pre_snap", "post_snap"]) }).optional(),
});

// Landmark Action
export const LandmarkKindSchema = z.enum(["aim_point", "read_key", "landmark", "cone", "alert"]);

export const LandmarkDataSchema = z.object({
  kind: LandmarkKindSchema,
  label: z.string().optional(),
  x: z.number(),
  y: z.number(),
});

export const LandmarkActionSchema = ActionBaseSchema.extend({
  actionType: z.literal("landmark"),
  landmark: LandmarkDataSchema,
});

// Text Action
export const TextDataSchema = z.object({
  value: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
});

export const TextStyleSchema = z.object({
  fontSize: z.enum(["xs", "sm", "md", "lg"]).optional(),
  box: z.boolean().optional(),
});

export const TextActionSchema = ActionBaseSchema.omit({ style: true }).extend({
  actionType: z.literal("text"),
  text: TextDataSchema,
  textStyle: TextStyleSchema.optional(),
});

// Union of all actions
export const ActionSchema = z.discriminatedUnion("actionType", [
  RouteActionSchema,
  BlockActionSchema,
  MotionActionSchema,
  LandmarkActionSchema,
  TextActionSchema,
]);

// ============================================
// Play Schemas
// ============================================

export const PersonnelSchema = z.enum(["10", "11", "12", "13", "20", "21", "22", "23"]);
export const StrengthSchema = z.enum(["left", "right", "none"]);

// ============================================
// Play Context Schema (Pre-Context Persistence)
// ============================================

export const PlayIntentSchema = z.enum(["pass", "run", "rpo"]);
export const BoxCountSchema = z.union([z.literal(5), z.literal(6), z.literal(7), z.literal(8), z.literal("unknown")]);
export const ContextFrontSchema = z.enum(["even", "odd", "over", "under", "bear", "unknown"]);
export const ThreeTechSchema = z.enum(["strong", "weak", "none", "unknown"]);
export const ContextShellSchema = z.enum(["1high", "2high", "unknown"]);
export const PressureLevelSchema = z.enum(["none", "low", "medium", "high"]);
export const ContextDownSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal("-")]);
export const ContextDistanceSchema = z.enum(["short", "medium", "long", "goal", "-"]);
export const ContextHashSchema = z.enum(["L", "M", "R", "-"]);

export const PlayContextSituationSchema = z.object({
  down: ContextDownSchema,
  distance: ContextDistanceSchema,
  hash: ContextHashSchema,
});

export const PlayContextSchema = z.object({
  playType: PlayIntentSchema,
  boxCount: BoxCountSchema,
  front: ContextFrontSchema,
  threeTech: ThreeTechSchema,
  shell: ContextShellSchema,
  pressure: PressureLevelSchema,
  situation: PlayContextSituationSchema,
});

export const PlayMetaSchema = z.object({
  personnel: PersonnelSchema.optional(),
  unit: UnitSchema.optional(),
  strength: StrengthSchema.optional(),
  formationId: z.string().optional(),
  conceptId: z.string().optional(),
  nflStyle: z.boolean().optional(),
  context: PlayContextSchema.optional(),
});

export const FieldSettingsSchema = z.object({
  orientation: z.enum(["up", "down"]).optional(),
  showGrid: z.boolean().optional(),
  showHash: z.boolean().optional(),
  showNumbers: z.boolean().optional(),
});

export const PlayNotesSchema = z.object({
  callName: z.string().optional(),
  coachingPoints: z.array(z.string()).optional(),
});

export const DerivedFromSchema = z.object({
  sourcePlayId: z.string().nullable().optional(),
  sourceConceptId: z.string().nullable().optional(),
  sourceTeamId: z.string().nullable().optional(),
});

export const PlayHistorySchema = z.object({
  version: z.number().int().positive(),
  derivedFrom: DerivedFromSchema.optional(),
});

export const RosterSchema = z.object({
  players: z.array(PlayerSchema),
  groups: z.array(PlayerGroupSchema).optional(),
});

export const PlaySchema = z.object({
  schemaVersion: z.string(),
  type: z.literal("play"),
  id: z.string().min(1),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  meta: PlayMetaSchema.optional(),
  field: FieldSettingsSchema.optional(),
  roster: RosterSchema,
  actions: z.array(ActionSchema),
  notes: PlayNotesSchema.optional(),
  history: PlayHistorySchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  extensions: z.record(z.string(), z.unknown()).optional(),
});

// ============================================
// Concept Pack Schemas
// ============================================

export const ConceptPackMetaSchema = z.object({
  releaseWeek: z.number().int().positive(),
  releaseYear: z.number().int().min(2024).max(2100),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  theme: z.string().optional(),
  description: z.string().optional(),
});

export const ConceptPackContentSchema = z.object({
  runConceptIds: z.array(z.string()),
  passConceptIds: z.array(z.string()),
  familyIds: z.array(z.string()).optional(),
});

export const ConceptPackSchema = z.object({
  schemaVersion: z.string(),
  type: z.literal("concept_pack"),
  id: z.string().min(1),
  name: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/), // Semantic versioning
  meta: ConceptPackMetaSchema,
  content: ConceptPackContentSchema,
  isNew: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  changelog: z.array(z.string()).optional(),
});

export type ValidatedConceptPack = z.infer<typeof ConceptPackSchema>;

export function validateConceptPack(data: unknown) {
  return ConceptPackSchema.safeParse(data);
}

// ============================================
// Plan Tier Schemas
// ============================================

export const PlanTierSchema = z.enum(["free", "team", "season"]);

export const PlanLimitsSchema = z.object({
  maxPlays: z.number().int(),
  maxPlaybooks: z.number().int(),
  maxExports: z.number().int(),
  conceptPackAccess: z.enum(["base", "all"]),
  defensePresets: z.boolean(),
  customFormations: z.boolean(),
  shareLinks: z.boolean(),
  teamFeatures: z.boolean(),
  installPlan: z.boolean(),
  advancedExport: z.boolean(),
});

// ============================================
// Validation Helpers
// ============================================

export type PlayValidationResult =
  | { success: true; data: z.infer<typeof PlaySchema> }
  | { success: false; errors: z.ZodError };

export function validatePlay(data: unknown): PlayValidationResult {
  const result = PlaySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validatePlayOrThrow(data: unknown): z.infer<typeof PlaySchema> {
  return PlaySchema.parse(data);
}

export function validateAction(data: unknown) {
  return ActionSchema.safeParse(data);
}

export function validatePlayer(data: unknown) {
  return PlayerSchema.safeParse(data);
}

// ============================================
// Type exports for validated data
// ============================================

export type ValidatedPlay = z.infer<typeof PlaySchema>;
export type ValidatedPlayer = z.infer<typeof PlayerSchema>;
export type ValidatedAction = z.infer<typeof ActionSchema>;
