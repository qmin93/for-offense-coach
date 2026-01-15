// ============================================
// ForOffenseCoach DSL Versioning
// Schema version management and migrations
// ============================================

import type { Play } from "./types";
import { validatePlay, type PlayValidationResult } from "./schema";

// Current schema version
export const CURRENT_SCHEMA_VERSION = "1.0.0";

// Supported schema versions (oldest to newest)
export const SUPPORTED_VERSIONS = ["1.0.0"] as const;
export type SupportedVersion = (typeof SUPPORTED_VERSIONS)[number];

// ============================================
// Version Utilities
// ============================================

export function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const parts = version.split(".").map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

export function compareVersions(a: string, b: string): number {
  const vA = parseVersion(a);
  const vB = parseVersion(b);

  if (vA.major !== vB.major) return vA.major - vB.major;
  if (vA.minor !== vB.minor) return vA.minor - vB.minor;
  return vA.patch - vB.patch;
}

export function isVersionSupported(version: string): boolean {
  return SUPPORTED_VERSIONS.includes(version as SupportedVersion);
}

export function isVersionCurrent(version: string): boolean {
  return version === CURRENT_SCHEMA_VERSION;
}

// ============================================
// Migration Types
// ============================================

type MigrationFn = (play: unknown) => unknown;

interface Migration {
  fromVersion: string;
  toVersion: string;
  migrate: MigrationFn;
}

// ============================================
// Migration Registry
// ============================================

const migrations: Migration[] = [
  // Future migrations go here
  // Example:
  // {
  //   fromVersion: "1.0.0",
  //   toVersion: "1.1.0",
  //   migrate: (play) => {
  //     // Add new field with default value
  //     return { ...play, schemaVersion: "1.1.0", newField: "default" };
  //   },
  // },
];

// ============================================
// Migration Engine
// ============================================

export type MigrationResult =
  | { success: true; play: Play; migrated: boolean; fromVersion: string }
  | { success: false; error: string; originalVersion?: string };

function getMigrationPath(fromVersion: string, toVersion: string): Migration[] {
  const path: Migration[] = [];
  let currentVersion = fromVersion;

  while (currentVersion !== toVersion) {
    const nextMigration = migrations.find((m) => m.fromVersion === currentVersion);
    if (!nextMigration) break;

    path.push(nextMigration);
    currentVersion = nextMigration.toVersion;
  }

  return path;
}

export function migratePlay(data: unknown): MigrationResult {
  // Check if data is object-like
  if (!data || typeof data !== "object") {
    return { success: false, error: "Invalid play data: not an object" };
  }

  const playData = data as Record<string, unknown>;
  const originalVersion = (playData.schemaVersion as string) || "unknown";

  // If no version, assume it's the current version (new play)
  if (!playData.schemaVersion) {
    playData.schemaVersion = CURRENT_SCHEMA_VERSION;
  }

  const version = playData.schemaVersion as string;

  // If already current version, just validate
  if (isVersionCurrent(version)) {
    const validation = validatePlay(playData);
    if (validation.success) {
      return { success: true, play: validation.data as Play, migrated: false, fromVersion: version };
    }
    return {
      success: false,
      error: `Validation failed: ${validation.errors.issues.map((i) => i.message).join(", ")}`,
      originalVersion: version,
    };
  }

  // Check if version is supported
  if (!isVersionSupported(version)) {
    return {
      success: false,
      error: `Unsupported schema version: ${version}. Supported versions: ${SUPPORTED_VERSIONS.join(", ")}`,
      originalVersion: version,
    };
  }

  // Get migration path
  const migrationPath = getMigrationPath(version, CURRENT_SCHEMA_VERSION);

  if (migrationPath.length === 0 && version !== CURRENT_SCHEMA_VERSION) {
    return {
      success: false,
      error: `No migration path from ${version} to ${CURRENT_SCHEMA_VERSION}`,
      originalVersion: version,
    };
  }

  // Apply migrations
  let migratedData = playData;
  for (const migration of migrationPath) {
    try {
      migratedData = migration.migrate(migratedData) as Record<string, unknown>;
    } catch (err) {
      return {
        success: false,
        error: `Migration from ${migration.fromVersion} to ${migration.toVersion} failed: ${err}`,
        originalVersion: version,
      };
    }
  }

  // Validate migrated data
  const validation = validatePlay(migratedData);
  if (validation.success) {
    return { success: true, play: validation.data as Play, migrated: true, fromVersion: version };
  }

  return {
    success: false,
    error: `Post-migration validation failed: ${validation.errors.issues.map((i) => i.message).join(", ")}`,
    originalVersion: version,
  };
}

// ============================================
// Fallback & Recovery
// ============================================

export interface FallbackOptions {
  useDefaults?: boolean;
  preserveId?: boolean;
  preserveName?: boolean;
}

export function createFallbackPlay(
  invalidData: unknown,
  options: FallbackOptions = {}
): Play {
  const { useDefaults = true, preserveId = true, preserveName = true } = options;

  const data = (invalidData && typeof invalidData === "object" ? invalidData : {}) as Record<
    string,
    unknown
  >;

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    type: "play",
    id: preserveId && typeof data.id === "string" ? data.id : crypto.randomUUID(),
    name: preserveName && typeof data.name === "string" ? data.name : "Recovered Play",
    description: useDefaults ? "This play was recovered from invalid data" : undefined,
    roster: {
      players: [],
    },
    actions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// Load Play with Fallback
// ============================================

export interface LoadPlayResult {
  play: Play;
  status: "valid" | "migrated" | "fallback";
  warning?: string;
}

export function loadPlaySafe(data: unknown, fallbackOptions?: FallbackOptions): LoadPlayResult {
  const migrationResult = migratePlay(data);

  if (migrationResult.success) {
    return {
      play: migrationResult.play,
      status: migrationResult.migrated ? "migrated" : "valid",
      warning: migrationResult.migrated
        ? `Play was migrated from version ${migrationResult.fromVersion} to ${CURRENT_SCHEMA_VERSION}`
        : undefined,
    };
  }

  // Migration/validation failed - use fallback
  return {
    play: createFallbackPlay(data, fallbackOptions),
    status: "fallback",
    warning: `Could not load play: ${migrationResult.error}. A blank play was created.`,
  };
}
