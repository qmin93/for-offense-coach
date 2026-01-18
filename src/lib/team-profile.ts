// ============================================
// TeamProfile Storage Service
// localStorage + optional API sync
// ============================================

import type {
  TeamProfile,
  RosterAvailability,
  UnitStrength,
  StylePreferences,
  PositionAvailability,
} from "@/domain/dsl/types";

// ============================================
// Constants
// ============================================

const STORAGE_KEY = "team_profile";
const SCHEMA_VERSION = "1.0";

// ============================================
// Default Values
// ============================================

const DEFAULT_POSITION_AVAILABILITY: PositionAvailability = {
  count: 2,
  starterQuality: 3,
};

export const DEFAULT_ROSTER_AVAILABILITY: RosterAvailability = {
  QB: { count: 2, starterQuality: 3 },
  RB: { count: 3, starterQuality: 3 },
  FB: { count: 0, starterQuality: 0 },
  WR: { count: 4, starterQuality: 3 },
  TE: { count: 2, starterQuality: 3 },
  OL: { count: 8, starterQuality: 3 },
};

export const DEFAULT_UNIT_STRENGTH: UnitStrength = {
  olRunBlock: 3,
  olPassPro: 3,
  rbVision: 3,
  wrSeparation: 3,
  qbArm: 3,
  qbDecision: 3,
  teBlock: 3,
  teRoute: 2,
};

export const DEFAULT_STYLE_PREFERENCES: StylePreferences = {
  runPassBalance: "balanced",
  underCenterUsage: "low",
  motionUsage: "medium",
  tempo: "medium",
  riskTolerance: "normal",
};

export function createDefaultTeamProfile(): TeamProfile {
  return {
    schemaVersion: SCHEMA_VERSION,
    type: "team_profile",
    id: crypto.randomUUID(),
    teamName: "My Team",
    rosterAvailability: { ...DEFAULT_ROSTER_AVAILABILITY },
    unitStrength: { ...DEFAULT_UNIT_STRENGTH },
    stylePreferences: { ...DEFAULT_STYLE_PREFERENCES },
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// localStorage Operations
// ============================================

export function loadTeamProfile(): TeamProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const profile = JSON.parse(stored) as TeamProfile;

    // Validate schema version
    if (profile.schemaVersion !== SCHEMA_VERSION) {
      console.warn("[TeamProfile] Schema version mismatch, migrating...");
      return migrateProfile(profile);
    }

    return profile;
  } catch (error) {
    console.error("[TeamProfile] Failed to load:", error);
    return null;
  }
}

export function saveTeamProfile(profile: TeamProfile): boolean {
  if (typeof window === "undefined") return false;

  try {
    const updated: TeamProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("[TeamProfile] Failed to save:", error);
    return false;
  }
}

export function deleteTeamProfile(): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("[TeamProfile] Failed to delete:", error);
    return false;
  }
}

// ============================================
// Migration (for future schema changes)
// ============================================

function migrateProfile(oldProfile: TeamProfile): TeamProfile {
  // For now, just update schema version and merge with defaults
  const defaultProfile = createDefaultTeamProfile();

  return {
    ...defaultProfile,
    ...oldProfile,
    schemaVersion: SCHEMA_VERSION,
    rosterAvailability: {
      ...DEFAULT_ROSTER_AVAILABILITY,
      ...oldProfile.rosterAvailability,
    },
    unitStrength: {
      ...DEFAULT_UNIT_STRENGTH,
      ...oldProfile.unitStrength,
    },
    stylePreferences: {
      ...DEFAULT_STYLE_PREFERENCES,
      ...oldProfile.stylePreferences,
    },
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// Helper: Get or Create Profile
// ============================================

export function getOrCreateTeamProfile(): TeamProfile {
  const existing = loadTeamProfile();
  if (existing) return existing;

  const newProfile = createDefaultTeamProfile();
  saveTeamProfile(newProfile);
  return newProfile;
}

// ============================================
// Computed Properties (for recommendations)
// ============================================

export interface TeamCapabilities {
  // Personnel availability
  canRun10Personnel: boolean;  // No TE, 4 WR
  canRun11Personnel: boolean;  // 1 TE, 3 WR
  canRun12Personnel: boolean;  // 2 TE, 2 WR
  canRun21Personnel: boolean;  // 1 FB, 1 TE, 2 WR
  canRun22Personnel: boolean;  // 1 FB, 2 TE, 1 WR

  // Capability scores (0-5)
  runBlockingStrength: number;
  passProtectionStrength: number;
  receivingStrength: number;
  runGameStrength: number;

  // Style indicators
  preferRun: boolean;
  preferPass: boolean;
  canPull: boolean;
  canMotion: boolean;

  // Risk profile
  riskTolerance: "conservative" | "normal" | "aggressive";
}

export function computeTeamCapabilities(profile: TeamProfile): TeamCapabilities {
  const { rosterAvailability: roster, unitStrength: unit, stylePreferences: style } = profile;

  // Personnel availability checks
  const hasWR4 = roster.WR.count >= 4;
  const hasWR3 = roster.WR.count >= 3;
  const hasWR2 = roster.WR.count >= 2;
  const hasTE1 = roster.TE.count >= 1;
  const hasTE2 = roster.TE.count >= 2;
  const hasFB = roster.FB.count >= 1;

  // Composite scores
  const runBlockingStrength = Math.round(
    (unit.olRunBlock + (unit.teBlock || 0)) / 2
  );
  const passProtectionStrength = Math.round(
    (unit.olPassPro + unit.qbDecision) / 2
  );
  const receivingStrength = Math.round(
    (unit.wrSeparation + (unit.teRoute || 0) + unit.qbArm) / 3
  );
  const runGameStrength = Math.round(
    (unit.olRunBlock + unit.rbVision + (unit.teBlock || 0)) / 3
  );

  // Can pull = OL run block >= 3 and at least 7 OL
  const canPull = unit.olRunBlock >= 3 && roster.OL.count >= 7;

  // Motion preference
  const canMotion = style.motionUsage !== "low";

  return {
    // Personnel
    canRun10Personnel: hasWR4,
    canRun11Personnel: hasWR3 && hasTE1,
    canRun12Personnel: hasWR2 && hasTE2,
    canRun21Personnel: hasFB && hasTE1 && hasWR2,
    canRun22Personnel: hasFB && hasTE2 && hasWR2,

    // Strengths
    runBlockingStrength,
    passProtectionStrength,
    receivingStrength,
    runGameStrength,

    // Style
    preferRun: style.runPassBalance === "run_heavy",
    preferPass: style.runPassBalance === "pass_heavy",
    canPull,
    canMotion,

    // Risk
    riskTolerance: style.riskTolerance,
  };
}

// ============================================
// Formation Feasibility Check
// ============================================

export interface FormationFeasibility {
  canRun: boolean;
  missingRequirements: string[];
  riskWarnings: string[];
  compatibilityScore: number; // 0-100
}

export function checkFormationFeasibility(
  profile: TeamProfile,
  formation: {
    meta?: {
      requiredRoster?: { minWR: number; minTE: number; minRB: number; needsFB: boolean; olPullRequired: boolean };
      riskTags?: string[];
      complexity?: number;
    }
  }
): FormationFeasibility {
  const result: FormationFeasibility = {
    canRun: true,
    missingRequirements: [],
    riskWarnings: [],
    compatibilityScore: 100,
  };

  const roster = profile.rosterAvailability;
  const unit = profile.unitStrength;
  const required = formation.meta?.requiredRoster;

  if (!required) return result; // No requirements = always feasible

  // Check roster requirements
  if (roster.WR.count < required.minWR) {
    result.canRun = false;
    result.missingRequirements.push(`Need ${required.minWR} WRs (have ${roster.WR.count})`);
    result.compatibilityScore -= 30;
  }

  if (roster.TE.count < required.minTE) {
    result.canRun = false;
    result.missingRequirements.push(`Need ${required.minTE} TEs (have ${roster.TE.count})`);
    result.compatibilityScore -= 30;
  }

  if (roster.RB.count < required.minRB) {
    result.canRun = false;
    result.missingRequirements.push(`Need ${required.minRB} RBs (have ${roster.RB.count})`);
    result.compatibilityScore -= 25;
  }

  if (required.needsFB && roster.FB.count < 1) {
    result.canRun = false;
    result.missingRequirements.push("Needs fullback (none available)");
    result.compatibilityScore -= 25;
  }

  if (required.olPullRequired && unit.olRunBlock < 3) {
    result.riskWarnings.push("OL pull ability may be insufficient");
    result.compatibilityScore -= 15;
  }

  // Check risk tags
  const riskTags = formation.meta?.riskTags || [];

  if (riskTags.includes("te_blocking") && (unit.teBlock || 0) < 3) {
    result.riskWarnings.push("TE blocking may struggle");
    result.compatibilityScore -= 10;
  }

  if (riskTags.includes("ol_athletic") && unit.olRunBlock < 3) {
    result.riskWarnings.push("OL athleticism may limit execution");
    result.compatibilityScore -= 10;
  }

  if (riskTags.includes("qb_exposure") && unit.qbDecision < 3) {
    result.riskWarnings.push("QB may struggle with quick decisions");
    result.compatibilityScore -= 10;
  }

  if (riskTags.includes("complex_rules") && (formation.meta?.complexity || 1) > 3) {
    const tolerance = profile.stylePreferences.riskTolerance;
    if (tolerance === "conservative") {
      result.riskWarnings.push("Complex formation for conservative approach");
      result.compatibilityScore -= 15;
    }
  }

  // Ensure score doesn't go below 0
  result.compatibilityScore = Math.max(0, result.compatibilityScore);

  return result;
}

// ============================================
// React Hook (optional, for convenience)
// ============================================

import { useState, useEffect, useCallback } from "react";

export function useTeamProfile() {
  const [profile, setProfile] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load on mount
  useEffect(() => {
    try {
      const loaded = getOrCreateTeamProfile();
      setProfile(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Save function
  const save = useCallback((updates: Partial<TeamProfile>) => {
    if (!profile) return false;

    const updated: TeamProfile = {
      ...profile,
      ...updates,
    };

    const success = saveTeamProfile(updated);
    if (success) {
      setProfile(updated);
    }
    return success;
  }, [profile]);

  // Reset to defaults
  const reset = useCallback(() => {
    const newProfile = createDefaultTeamProfile();
    const success = saveTeamProfile(newProfile);
    if (success) {
      setProfile(newProfile);
    }
    return success;
  }, []);

  // Computed capabilities
  const capabilities = profile ? computeTeamCapabilities(profile) : null;

  return {
    profile,
    loading,
    error,
    save,
    reset,
    capabilities,
  };
}

export default {
  loadTeamProfile,
  saveTeamProfile,
  deleteTeamProfile,
  getOrCreateTeamProfile,
  createDefaultTeamProfile,
  computeTeamCapabilities,
  checkFormationFeasibility,
};
