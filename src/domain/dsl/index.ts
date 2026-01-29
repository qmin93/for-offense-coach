// DSL Types & Validation exports
export * from "./types";

// Legacy validation (manual checks with detailed errors)
export {
  validatePlay,
  validatePlayer,
  validateAction,
  validateFormation,
  validateConcept,
  isValidPoint,
  type ValidationError,
  type ValidationResult,
} from "./validation";

// Zod schema validation (type-safe parsing)
export {
  // Schemas
  PlaySchema,
  PlayerSchema,
  ActionSchema,
  PointSchema,
  RouteActionSchema,
  BlockActionSchema,
  MotionActionSchema,
  LandmarkActionSchema,
  TextActionSchema,
  // Validation functions (with Zod prefix to avoid conflicts)
  validatePlay as zodValidatePlay,
  validatePlayOrThrow as zodValidatePlayOrThrow,
  validateAction as zodValidateAction,
  validatePlayer as zodValidatePlayer,
  // Types
  type ValidatedPlay,
  type ValidatedPlayer,
  type ValidatedAction,
  type PlayValidationResult,
} from "./schema";

// Factories
export * from "./factories";

// Versioning
export {
  CURRENT_SCHEMA_VERSION,
  SUPPORTED_VERSIONS,
  parseVersion,
  compareVersions,
  isVersionSupported,
  isVersionCurrent,
  migratePlay,
  loadPlaySafe,
  createFallbackPlay,
  type MigrationResult,
  type LoadPlayResult,
  type FallbackOptions,
  type SupportedVersion,
} from "./versioning";
