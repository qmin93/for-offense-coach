// ============================================
// Formation Recommendation Engine
// Uses TeamProfile for personalized recommendations
// ============================================

import type {
  Formation,
  TeamProfile,
  FormationStyleTag,
  FormationRiskTag,
  FormationPackage,
} from "../dsl/types";
import { FORMATIONS, getFormationById } from "./formations";
import {
  checkFormationFeasibility,
  computeTeamCapabilities,
  type TeamCapabilities,
  type FormationFeasibility,
} from "@/lib/team-profile";
import {
  FORMATION_PACKAGES,
  getPackageById,
  getPackageByFormation,
  PHILOSOPHY_DESCRIPTIONS,
} from "./formation-packages";

// ============================================
// Types
// ============================================

export interface FormationRecommendation {
  formation: Formation;
  score: number;                    // 0-100 overall fit score
  feasibility: FormationFeasibility;
  styleFit: number;                 // 0-100 style compatibility
  strengthFit: number;              // 0-100 unit strength compatibility
  reasons: string[];                // Why this formation is recommended
  warnings: string[];               // Potential concerns
  tags: string[];                   // Summary tags
}

export interface FormationRecommendationContext {
  playType?: "run" | "pass" | "balanced";
  situation?: "standard" | "short_yardage" | "long_yardage" | "red_zone" | "goal_line";
  excludeFormationIds?: string[];
}

// ============================================
// Core Recommendation Function
// ============================================

export function getFormationRecommendations(
  profile: TeamProfile,
  context: FormationRecommendationContext = {}
): FormationRecommendation[] {
  const capabilities = computeTeamCapabilities(profile);
  const { playType = "balanced", situation = "standard", excludeFormationIds = [] } = context;

  // Score all formations
  const recommendations: FormationRecommendation[] = FORMATIONS
    .filter((f) => !excludeFormationIds.includes(f.id))
    .map((formation) => scoreFormation(formation, profile, capabilities, playType, situation))
    .filter((r) => r.feasibility.canRun) // Only include runnable formations
    .sort((a, b) => b.score - a.score);

  // Normalize scores for better distribution
  return normalizeRecommendationScores(recommendations);
}

// ============================================
// Formation Scoring
// ============================================

function scoreFormation(
  formation: Formation,
  profile: TeamProfile,
  capabilities: TeamCapabilities,
  playType: "run" | "pass" | "balanced",
  situation: string
): FormationRecommendation {
  const feasibility = checkFormationFeasibility(profile, formation);
  const styleFit = calculateStyleFit(formation, profile, playType);
  const strengthFit = calculateStrengthFit(formation, profile, capabilities);
  const situationBonus = calculateSituationBonus(formation, situation);

  // Calculate overall score
  let score = (feasibility.compatibilityScore * 0.4) + (styleFit * 0.3) + (strengthFit * 0.3);
  score += situationBonus;
  score = Math.max(0, Math.min(100, score));

  // Generate reasons and warnings
  const { reasons, warnings, tags } = generateRecommendationDetails(
    formation,
    profile,
    capabilities,
    playType,
    styleFit,
    strengthFit
  );

  return {
    formation,
    score: Math.round(score),
    feasibility,
    styleFit: Math.round(styleFit),
    strengthFit: Math.round(strengthFit),
    reasons,
    warnings: [...feasibility.riskWarnings, ...warnings],
    tags,
  };
}

// ============================================
// Style Fit Calculation
// ============================================

function calculateStyleFit(
  formation: Formation,
  profile: TeamProfile,
  playType: "run" | "pass" | "balanced"
): number {
  let score = 50; // Base score
  const styleTags = formation.meta?.styleTags || [];
  const stylePrefs = profile.stylePreferences;

  // Run/Pass preference matching
  if (playType === "run" || stylePrefs.runPassBalance === "run_heavy") {
    if (styleTags.includes("run_heavy") || styleTags.includes("power")) score += 20;
    if (styleTags.includes("pass_heavy")) score -= 15;
  } else if (playType === "pass" || stylePrefs.runPassBalance === "pass_heavy") {
    if (styleTags.includes("pass_heavy") || styleTags.includes("quick_game")) score += 20;
    if (styleTags.includes("run_heavy")) score -= 15;
  } else {
    // Balanced - favor balanced formations
    if (styleTags.includes("balanced")) score += 15;
  }

  // Motion usage
  const requiresMotion = styleTags.includes("trick_play");
  if (requiresMotion && stylePrefs.motionUsage === "low") {
    score -= 10;
  }
  if (stylePrefs.motionUsage === "high" && !requiresMotion) {
    score += 5;
  }

  // Risk tolerance
  const formationComplexity = formation.meta?.complexity || 1;
  if (stylePrefs.riskTolerance === "conservative" && formationComplexity > 3) {
    score -= 15;
  } else if (stylePrefs.riskTolerance === "aggressive" && formationComplexity <= 2) {
    score += 5;
  }

  // Play action friendly for run-first teams
  if (stylePrefs.runPassBalance === "run_heavy" && styleTags.includes("play_action")) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

// ============================================
// Strength Fit Calculation
// ============================================

function calculateStrengthFit(
  formation: Formation,
  profile: TeamProfile,
  capabilities: TeamCapabilities
): number {
  let score = 50;
  const styleTags = formation.meta?.styleTags || [];
  const riskTags = formation.meta?.riskTags || [];
  const required = formation.meta?.requiredRoster;

  // OL strength matching
  if (styleTags.includes("power") || styleTags.includes("run_heavy")) {
    if (capabilities.runBlockingStrength >= 4) score += 20;
    else if (capabilities.runBlockingStrength <= 2) score -= 15;
  }

  if (styleTags.includes("pass_heavy") || styleTags.includes("quick_game")) {
    if (capabilities.passProtectionStrength >= 4) score += 20;
    else if (capabilities.passProtectionStrength <= 2) score -= 15;
  }

  // Receiving strength for spread formations
  if (styleTags.includes("spread")) {
    if (capabilities.receivingStrength >= 4) score += 15;
    else if (capabilities.receivingStrength <= 2) score -= 10;
  }

  // TE blocking requirement
  if (riskTags.includes("te_blocking")) {
    const teBlock = profile.unitStrength.teBlock || 0;
    if (teBlock >= 4) score += 10;
    else if (teBlock <= 2) score -= 15;
  }

  // OL pull requirement
  if (required?.olPullRequired || riskTags.includes("ol_athletic")) {
    if (capabilities.canPull) score += 10;
    else score -= 20;
  }

  // QB decision making for complex formations
  const complexity = formation.meta?.complexity || 1;
  if (complexity >= 3) {
    if (profile.unitStrength.qbDecision >= 4) score += 10;
    else if (profile.unitStrength.qbDecision <= 2) score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

// ============================================
// Situation Bonus
// ============================================

function calculateSituationBonus(formation: Formation, situation: string): number {
  const styleTags = formation.meta?.styleTags || [];
  const structure = formation.meta?.structure;

  switch (situation) {
    case "short_yardage":
    case "goal_line":
      // Favor power formations
      if (styleTags.includes("power") || structure === "I") return 15;
      if (styleTags.includes("spread") || structure === "empty") return -10;
      break;

    case "long_yardage":
      // Favor spread/passing formations
      if (styleTags.includes("pass_heavy") || styleTags.includes("spread")) return 15;
      if (styleTags.includes("run_heavy")) return -10;
      break;

    case "red_zone":
      // Favor balanced formations with quick game capability
      if (styleTags.includes("quick_game") || structure === "bunch") return 10;
      break;
  }

  return 0;
}

// ============================================
// Generate Recommendation Details
// ============================================

function generateRecommendationDetails(
  formation: Formation,
  profile: TeamProfile,
  capabilities: TeamCapabilities,
  playType: string,
  styleFit: number,
  strengthFit: number
): { reasons: string[]; warnings: string[]; tags: string[] } {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const tags: string[] = [];

  const styleTags = formation.meta?.styleTags || [];
  const structure = formation.meta?.structure;

  // Style reasons
  if (styleFit >= 70) {
    if (styleTags.includes("spread") && profile.stylePreferences.runPassBalance === "pass_heavy") {
      reasons.push("Spread fits pass-heavy style");
      tags.push("Style Match");
    }
    if (styleTags.includes("power") && profile.stylePreferences.runPassBalance === "run_heavy") {
      reasons.push("Power formation fits run-heavy approach");
      tags.push("Style Match");
    }
    if (styleTags.includes("balanced")) {
      reasons.push("Balanced formation gives flexibility");
      tags.push("Versatile");
    }
  }

  // Strength reasons
  if (strengthFit >= 70) {
    if (capabilities.runBlockingStrength >= 4 && (styleTags.includes("power") || styleTags.includes("run_heavy"))) {
      reasons.push(`Strong OL run blocking (${capabilities.runBlockingStrength}/5)`);
      tags.push("Run Strong");
    }
    if (capabilities.passProtectionStrength >= 4 && (styleTags.includes("pass_heavy") || styleTags.includes("spread"))) {
      reasons.push(`Solid pass protection (${capabilities.passProtectionStrength}/5)`);
      tags.push("Pass Strong");
    }
    if (capabilities.receivingStrength >= 4 && styleTags.includes("spread")) {
      reasons.push(`Talented receiving corps (${capabilities.receivingStrength}/5)`);
      tags.push("Weapons");
    }
  }

  // Personnel reasons
  if (structure === "I" && capabilities.canRun21Personnel) {
    reasons.push("Roster supports 21 personnel");
  }
  if ((structure === "3x1" || structure === "bunch") && capabilities.canRun11Personnel) {
    reasons.push("Roster supports 11 personnel");
  }

  // Play action synergy
  if (styleTags.includes("play_action") && profile.stylePreferences.runPassBalance === "run_heavy") {
    reasons.push("Play action threat complements run game");
    tags.push("Play Action");
  }

  // Warnings
  if (strengthFit < 50) {
    warnings.push("Unit strengths may limit execution");
  }

  if (formation.meta?.complexity && formation.meta.complexity >= 4 && profile.unitStrength.qbDecision < 3) {
    warnings.push("Complex formation may challenge QB reads");
  }

  // Ensure at least one reason
  if (reasons.length === 0) {
    reasons.push(formation.meta?.description || "Standard formation option");
  }

  return { reasons, warnings, tags };
}

// ============================================
// Score Normalization
// ============================================

function normalizeRecommendationScores(
  recommendations: FormationRecommendation[]
): FormationRecommendation[] {
  if (recommendations.length === 0) return [];
  if (recommendations.length === 1) {
    return [{ ...recommendations[0], score: 85 }];
  }

  const maxScore = recommendations[0].score;
  const minScore = recommendations[recommendations.length - 1].score;
  const range = maxScore - minScore;

  if (range < 5) {
    // All scores similar - distribute evenly
    return recommendations.map((r, i) => ({
      ...r,
      score: Math.round(90 - (i * 8)),
    }));
  }

  // Normalize to 40-95 range
  return recommendations.map((r) => ({
    ...r,
    score: Math.round(((r.score - minScore) / range) * 55 + 40),
  }));
}

// ============================================
// Quick Recommendation Functions
// ============================================

/**
 * Get top N formations for a team profile
 */
export function getTopFormations(
  profile: TeamProfile,
  count: number = 5,
  context: FormationRecommendationContext = {}
): FormationRecommendation[] {
  return getFormationRecommendations(profile, context).slice(0, count);
}

/**
 * Check if a specific formation is recommended for a team
 */
export function isFormationRecommended(
  formationId: string,
  profile: TeamProfile
): { recommended: boolean; score: number; reasons: string[] } {
  const formation = getFormationById(formationId);
  if (!formation) {
    return { recommended: false, score: 0, reasons: ["Formation not found"] };
  }

  const capabilities = computeTeamCapabilities(profile);
  const result = scoreFormation(formation, profile, capabilities, "balanced", "standard");

  return {
    recommended: result.score >= 60 && result.feasibility.canRun,
    score: result.score,
    reasons: result.feasibility.canRun ? result.reasons : result.feasibility.missingRequirements,
  };
}

/**
 * Get formations filtered by personnel group
 */
export function getFormationsForPersonnel(
  profile: TeamProfile,
  personnel: "10" | "11" | "12" | "21" | "22"
): FormationRecommendation[] {
  const capabilities = computeTeamCapabilities(profile);

  // Check if team can run this personnel
  const personnelCheck: Record<string, boolean> = {
    "10": capabilities.canRun10Personnel,
    "11": capabilities.canRun11Personnel,
    "12": capabilities.canRun12Personnel,
    "21": capabilities.canRun21Personnel,
    "22": capabilities.canRun22Personnel,
  };

  if (!personnelCheck[personnel]) {
    return []; // Team can't run this personnel
  }

  // Filter formations that support this personnel
  const relevantFormations = FORMATIONS.filter((f) =>
    f.meta?.personnelHint?.includes(personnel)
  );

  // Score and return
  return relevantFormations
    .map((f) => scoreFormation(f, profile, capabilities, "balanced", "standard"))
    .filter((r) => r.feasibility.canRun)
    .sort((a, b) => b.score - a.score);
}

// ============================================
// Package Recommendation Types
// ============================================

export interface PackageRecommendation {
  package: FormationPackage;
  score: number;
  baseFormation: Formation | undefined;
  availableFormations: Formation[];
  reasons: string[];
  warnings: string[];
  philosophyDescription: string;
}

export interface PackageRecommendationContext {
  defense?: string;
  coverage?: string;
  front?: string;
  situation?: "standard" | "short_yardage" | "long_yardage" | "red_zone" | "goal_line" | "2_minute";
  playType?: "run" | "pass" | "balanced";
}

// ============================================
// Package Recommendation Engine
// ============================================

export function getPackageRecommendations(
  profile: TeamProfile,
  context: PackageRecommendationContext = {}
): PackageRecommendation[] {
  const capabilities = computeTeamCapabilities(profile);

  return FORMATION_PACKAGES
    .map((pkg) => scorePackage(pkg, profile, capabilities, context))
    .filter((r) => r.availableFormations.length > 0)
    .sort((a, b) => b.score - a.score);
}

function scorePackage(
  pkg: FormationPackage,
  profile: TeamProfile,
  capabilities: TeamCapabilities,
  context: PackageRecommendationContext
): PackageRecommendation {
  let score = 50;
  const reasons: string[] = [];
  const warnings: string[] = [];

  // Check which formations in the package the team can run
  const availableFormations: Formation[] = [];
  let baseFormation: Formation | undefined;

  for (const relation of pkg.formations) {
    const formation = getFormationById(relation.formationId);
    if (!formation) continue;

    const feasibility = checkFormationFeasibility(profile, formation);
    if (feasibility.canRun) {
      availableFormations.push(formation);
      if (relation.role === "base" && !baseFormation) {
        baseFormation = formation;
      }
    }
  }

  // Score based on available formations
  const coverage = availableFormations.length / pkg.formations.length;
  score += coverage * 20; // Up to +20 for full coverage

  // Personnel match
  if (pkg.personnel) {
    const personnelMatch = pkg.personnel.some((p) => {
      switch (p) {
        case "10": return capabilities.canRun10Personnel;
        case "11": return capabilities.canRun11Personnel;
        case "12": return capabilities.canRun12Personnel;
        case "21": return capabilities.canRun21Personnel;
        case "22": return capabilities.canRun22Personnel;
        default: return false;
      }
    });
    if (personnelMatch) {
      score += 15;
      reasons.push(`Personnel group (${pkg.personnel.join("/")}) fits roster`);
    } else {
      score -= 10;
      warnings.push("Personnel requirements may be challenging");
    }
  }

  // Philosophy match with style preferences
  const { philosophy } = pkg;
  if (philosophy === "spread_the_defense" && profile.stylePreferences.runPassBalance === "pass_heavy") {
    score += 15;
    reasons.push("Spread philosophy matches passing style");
  }
  if (philosophy === "condensed_power" && profile.stylePreferences.runPassBalance === "run_heavy") {
    score += 15;
    reasons.push("Power philosophy matches run-heavy style");
  }
  if (philosophy === "balance_flexibility") {
    score += 5;
    reasons.push("Versatile package with run/pass balance");
  }
  if (philosophy === "misdirection" && profile.stylePreferences.motionUsage === "high") {
    score += 10;
    reasons.push("Motion-heavy package matches coaching style");
  }

  // Defense match (if context provided)
  if (context.defense || context.coverage || context.front) {
    let defenseMatchScore = 0;
    const matchReasons: string[] = [];

    if (context.defense && pkg.strengthVs?.defense?.includes(context.defense)) {
      defenseMatchScore += 10;
      matchReasons.push(`Strong vs ${context.defense}`);
    }
    if (context.coverage && pkg.strengthVs?.coverage?.includes(context.coverage)) {
      defenseMatchScore += 10;
      matchReasons.push(`Attacks ${context.coverage}`);
    }
    if (context.front && pkg.strengthVs?.front?.includes(context.front)) {
      defenseMatchScore += 10;
      matchReasons.push(`Effective vs ${context.front} front`);
    }

    // Check weaknesses
    if (context.defense && pkg.weaknessVs?.defense?.includes(context.defense)) {
      defenseMatchScore -= 15;
      warnings.push(`May struggle vs ${context.defense}`);
    }
    if (context.coverage && pkg.weaknessVs?.coverage?.includes(context.coverage)) {
      defenseMatchScore -= 15;
      warnings.push(`Coverage may limit options`);
    }

    score += defenseMatchScore;
    reasons.push(...matchReasons);
  }

  // Situation match
  if (context.situation) {
    const situationBias = pkg.formations.some((f) =>
      f.situationBias?.includes(context.situation!)
    );
    if (situationBias) {
      score += 10;
      reasons.push(`Good fit for ${context.situation.replace("_", " ")} situation`);
    }
  }

  // Install order bonus (prefer simpler packages)
  if (pkg.installOrder && pkg.installOrder <= 2) {
    score += 5;
    reasons.push("Easy to install");
  }

  // Cap score
  score = Math.max(0, Math.min(100, score));

  // Ensure at least one reason
  if (reasons.length === 0) {
    reasons.push(pkg.summary);
  }

  return {
    package: pkg,
    score: Math.round(score),
    baseFormation,
    availableFormations,
    reasons,
    warnings,
    philosophyDescription: PHILOSOPHY_DESCRIPTIONS[philosophy],
  };
}

/**
 * Get the package that a formation belongs to, with recommendation context
 */
export function getFormationPackageInfo(
  formationId: string,
  profile?: TeamProfile
): {
  package: FormationPackage | undefined;
  relatedFormations: Formation[];
  role: string;
} {
  const pkg = getPackageByFormation(formationId);
  if (!pkg) {
    return { package: undefined, relatedFormations: [], role: "standalone" };
  }

  const relation = pkg.formations.find((f) => f.formationId === formationId);
  const role = relation?.role || "unknown";

  // Get related formations
  const relatedFormations = pkg.formations
    .filter((f) => f.formationId !== formationId)
    .map((f) => getFormationById(f.formationId))
    .filter((f): f is Formation => f !== undefined);

  return { package: pkg, relatedFormations, role };
}

/**
 * Get top packages for a team
 */
export function getTopPackages(
  profile: TeamProfile,
  count: number = 3,
  context: PackageRecommendationContext = {}
): PackageRecommendation[] {
  return getPackageRecommendations(profile, context).slice(0, count);
}

// ============================================
// Export
// ============================================

export default {
  getFormationRecommendations,
  getTopFormations,
  isFormationRecommended,
  getFormationsForPersonnel,
  getPackageRecommendations,
  getTopPackages,
  getFormationPackageInfo,
};
