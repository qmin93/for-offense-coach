// ============================================
// Suggestions Engine
// Formation → Pass/Run Concept 추천
// ============================================

import type {
  Concept,
  Formation,
  Play,
  FormationMeta,
  DefensePreset,
  ConceptFamily,
  RecommendationReason,
  ReasonType,
} from "../dsl/types";
import { PASS_CONCEPTS, getPassConceptsForFormation } from "./concepts-pass";
import { RUN_CONCEPTS, getRunConceptsForFormation } from "./concepts-run";
import type {
  SuggestionContext,
  EnhancedSuggestionResult,
  DefenseContext,
  OffenseContext,
  SituationContext,
  ConstraintsContext,
  FrontType,
  ShellCoverage,
} from "./suggestion-context";
import { DEFAULT_SUGGESTION_CONTEXT } from "./suggestion-context";
import {
  CONCEPT_FAMILIES,
  getConceptFamilyByConceptId,
  getActiveAlerts,
  getCompatibleFamilies,
} from "./concept-families";
import { getDefensePresetById } from "./defense-presets";

// ============================================
// Types
// ============================================

export interface PassSuggestionInput {
  formationId: string;
  structure: FormationMeta["structure"];
  eligibleReceivers: number;
  filters?: {
    quick?: boolean;
    dropback?: boolean;
    screen?: boolean;
  };
}

export interface RunSuggestionInput {
  formationId: string;
  structure: FormationMeta["structure"];
  box: 6 | 7 | 8;
  front: "odd" | "even";
  threeTech?: "strong" | "weak" | "none";
  strength?: "strong" | "weak";
}

export interface SuggestionResult {
  concept: Concept;
  score: number;
  reasons: string[]; // Legacy string reasons
  typedReasons: RecommendationReason[]; // Typed reasons with 3+ items guaranteed
  category: string;
}

// ============================================
// Helper: Create Typed Reason
// ============================================

function createReason(
  type: ReasonType,
  text: string,
  favorable: boolean,
  details?: string
): RecommendationReason {
  return { type, text, favorable, details };
}

// ============================================
// Score Normalization
// ============================================

/**
 * Normalize scores to spread them across a useful range
 * Top result gets ~90, bottom gets ~40, others distributed between
 */
function normalizeScores<T extends { score: number }>(results: T[]): T[] {
  if (results.length === 0) return results;
  if (results.length === 1) {
    return [{ ...results[0], score: 75 }]; // Single result gets 75
  }

  // Sort by score descending
  const sorted = [...results].sort((a, b) => b.score - a.score);

  // Get min and max raw scores
  const maxScore = sorted[0].score;
  const minScore = sorted[sorted.length - 1].score;
  const range = maxScore - minScore;

  // Target range: top gets 92, bottom gets 35
  const targetMax = 92;
  const targetMin = 35;
  const targetRange = targetMax - targetMin;

  // If all scores are the same, distribute evenly
  if (range < 1) {
    return sorted.map((r, i) => ({
      ...r,
      score: Math.round(targetMax - (i / (sorted.length - 1)) * targetRange),
    }));
  }

  // Normalize each score
  return sorted.map((r) => {
    const normalized = ((r.score - minScore) / range) * targetRange + targetMin;
    return {
      ...r,
      score: Math.round(normalized),
    };
  });
}

// ============================================
// Pass Suggestions
// ============================================

export function getPassSuggestions(input: PassSuggestionInput): SuggestionResult[] {
  const { structure, eligibleReceivers, filters } = input;

  // Get concepts that fit the formation structure
  let concepts = structure
    ? getPassConceptsForFormation(structure)
    : PASS_CONCEPTS;

  // Filter by eligible receivers
  concepts = concepts.filter((c) => {
    const minReceivers = c.requirements?.minEligibleReceivers || 1;
    return eligibleReceivers >= minReceivers;
  });

  // Apply category filters
  if (filters) {
    concepts = concepts.filter((c) => {
      const category = c.passHints?.category;
      if (filters.quick && category === "quick") return true;
      if (filters.dropback && (category === "intermediate" || category === "deep")) return true;
      if (filters.screen && category === "screen") return true;
      // If no filters selected, show all
      if (!filters.quick && !filters.dropback && !filters.screen) return true;
      return false;
    });
  }

  // Score and sort
  const results: SuggestionResult[] = concepts.map((concept) => {
    const score = scorePassConcept(concept, input);
    const { reasons, typedReasons } = generatePassReasons(concept, input);
    const category = concept.passHints?.category || "intermediate";

    return { concept, score, reasons, typedReasons, category };
  });

  // Sort by score descending, limit to 8-12 for pass concepts
  const sorted = results.sort((a, b) => b.score - a.score).slice(0, 12);
  return normalizeScores(sorted);
}

function scorePassConcept(concept: Concept, input: PassSuggestionInput): number {
  let score = 40; // Lower base score for better differentiation

  // Structure match (biggest factor for pass)
  const prefStructures = concept.requirements?.preferredStructures;
  if (prefStructures?.includes(input.structure as any)) {
    score += 25;
  } else if (prefStructures && prefStructures.length > 0) {
    score -= 10; // Penalty for structure mismatch
  }

  // Eligible receivers match
  const minReceivers = concept.requirements?.minEligibleReceivers || 1;
  if (input.eligibleReceivers >= minReceivers) {
    score += 15;
  } else {
    score -= 15; // Penalty for insufficient receivers
  }
  if (input.eligibleReceivers >= minReceivers + 1) {
    score += 5;
  }

  // Badge bonus (nfl_style)
  if (concept.badges?.includes("nfl_style")) {
    score += 5;
  }

  // Category-based relevance
  const category = concept.passHints?.category;
  if (category === "quick") score += 5; // Quick passes are more universal

  return Math.max(10, Math.min(score, 95)); // Cap at 95, floor at 10
}

interface ReasonsResult {
  reasons: string[];
  typedReasons: RecommendationReason[];
}

function generatePassReasons(concept: Concept, input: PassSuggestionInput): ReasonsResult {
  const typedReasons: RecommendationReason[] = [];

  // 1. Structure reason (required)
  const structureMatch = concept.requirements?.preferredStructures?.includes(input.structure as any);
  typedReasons.push(createReason(
    "structure",
    structureMatch
      ? `Fits ${input.structure} formation structure`
      : `Works with ${input.structure} structure`,
    structureMatch ?? false,
    structureMatch
      ? "Route combinations align with receiver splits"
      : "May require minor adjustments"
  ));

  // 2. Coverage stress reason (required)
  const stress = concept.passHints?.stress || [];
  if (stress.length > 0) {
    typedReasons.push(createReason(
      "coverage",
      `Stresses: ${stress.slice(0, 2).join(", ")}`,
      true,
      "Creates difficult coverage decisions for defense"
    ));
  } else if (concept.passHints?.manBeater && concept.passHints?.zoneBeater) {
    typedReasons.push(createReason(
      "coverage",
      "Beats both man and zone",
      true,
      "Versatile concept with answers for multiple coverages"
    ));
  } else if (concept.passHints?.manBeater) {
    typedReasons.push(createReason(
      "coverage",
      "Man coverage beater",
      true,
      "Route combinations create natural picks and separation"
    ));
  } else if (concept.passHints?.zoneBeater) {
    typedReasons.push(createReason(
      "coverage",
      "Zone coverage beater",
      true,
      "Finds soft spots in zone coverage"
    ));
  } else {
    typedReasons.push(createReason(
      "coverage",
      "General purpose concept",
      true,
      "Adaptable to different coverage looks"
    ));
  }

  // 3. Situational / numbers reason (required)
  const minReceivers = concept.requirements?.minEligibleReceivers || 1;
  const hasEnoughReceivers = input.eligibleReceivers >= minReceivers;
  typedReasons.push(createReason(
    "numbers",
    hasEnoughReceivers
      ? `${input.eligibleReceivers} eligible receivers available`
      : `Needs ${minReceivers}+ receivers (have ${input.eligibleReceivers})`,
    hasEnoughReceivers,
    hasEnoughReceivers
      ? "Formation provides enough route runners"
      : "Consider different formation or concept"
  ));

  // Ensure minimum 3 reasons - add category reason if needed
  if (typedReasons.length < 3) {
    const category = concept.passHints?.category || "intermediate";
    typedReasons.push(createReason(
      "situational",
      `${category.charAt(0).toUpperCase() + category.slice(1)} timing concept`,
      true,
      category === "quick"
        ? "Fast release, protects against pressure"
        : category === "deep"
        ? "Big play potential with proper protection"
        : "Balanced timing for most situations"
    ));
  }

  // Legacy string reasons for backward compatibility
  const reasons = typedReasons.map(r => r.text).slice(0, 3);

  return { reasons, typedReasons };
}

// ============================================
// Run Suggestions
// ============================================

export function getRunSuggestions(input: RunSuggestionInput): SuggestionResult[] {
  const { structure, box, front, threeTech } = input;

  // REQUIRED: box and front must be specified for run suggestions
  // This prevents generic suggestions without defensive context
  if (!box || !front) {
    return []; // Return empty - UI should prompt user to input box/front
  }

  // Get concepts that fit the formation structure
  let concepts = structure
    ? getRunConceptsForFormation(structure)
    : RUN_CONCEPTS;

  // Score and sort
  const results: SuggestionResult[] = concepts.map((concept) => {
    const score = scoreRunConcept(concept, input);
    const { reasons, typedReasons } = generateRunReasons(concept, input);
    const category = concept.runHints?.category || "zone";

    return { concept, score, reasons, typedReasons, category };
  });

  // Sort by score descending, limit to 5, then normalize
  const sorted = results.sort((a, b) => b.score - a.score).slice(0, 5);
  return normalizeScores(sorted);
}

function scoreRunConcept(concept: Concept, input: RunSuggestionInput): number {
  let score = 35; // Lower base for better differentiation

  const hints = concept.runHints;
  if (!hints) return Math.max(10, score);

  // Numbers fit (box count) - critical for run plays
  if (hints.bestWhenBox?.includes(String(input.box) as any)) {
    score += 25;
  } else {
    // Penalties for box mismatch
    const boxTolerance = concept.requirements?.boxTolerance;
    if (input.box === 8) {
      if (boxTolerance === "6_ok") {
        score -= 20;
      } else if (boxTolerance === "7_ok") {
        score -= 10;
      } else if (boxTolerance === "8_risky") {
        score -= 25;
      }
    } else if (!hints.bestWhenBox?.length) {
      // Concept has no box preference
      score += 5;
    }
  }

  // Angle fit (front type)
  if (hints.bestVsFront?.includes(input.front)) {
    score += 20;
  } else if (hints.bestVsFront && hints.bestVsFront.length > 0) {
    score -= 10; // Penalty for front mismatch
  }

  // 3T fit
  if (input.threeTech && hints.bestVs3T?.includes(input.threeTech)) {
    score += 15;
  } else if (input.threeTech && hints.bestVs3T && hints.bestVs3T.length > 0) {
    score -= 8; // Penalty for 3T mismatch
  }

  // Structure fit
  const prefStructures = concept.requirements?.preferredStructures;
  if (prefStructures?.includes(input.structure as any)) {
    score += 10;
  } else if (prefStructures && prefStructures.length > 0) {
    score -= 5;
  }

  // Badge bonus
  if (concept.badges?.includes("nfl_style")) {
    score += 5;
  }

  // Run category specific
  if (hints.category === "zone") score += 3; // Zone is more versatile
  if (hints.category === "gap" && input.box <= 7) score += 5; // Gap works better with light box

  return Math.max(10, Math.min(score, 95)); // Cap at 95, floor at 10
}

function generateRunReasons(concept: Concept, input: RunSuggestionInput): ReasonsResult {
  const typedReasons: RecommendationReason[] = [];
  const hints = concept.runHints;

  // 1. Numbers reason (box count) - critical for run plays
  const boxFavorable = hints?.bestWhenBox?.includes(String(input.box) as any);
  typedReasons.push(createReason(
    "numbers",
    boxFavorable
      ? `Box ${input.box}: Numbers advantage`
      : `Box ${input.box}: Neutral numbers`,
    boxFavorable ?? false,
    boxFavorable
      ? "Defense doesn't have enough defenders to stop run"
      : input.box >= 8
        ? "Loaded box - consider play action or different concept"
        : "Manageable box count"
  ));

  // 2. Angle reason (front type)
  const frontFavorable = hints?.bestVsFront?.includes(input.front);
  typedReasons.push(createReason(
    "angle",
    frontFavorable
      ? `${input.front.charAt(0).toUpperCase() + input.front.slice(1)} front: Good blocking angles`
      : `${input.front.charAt(0).toUpperCase() + input.front.slice(1)} front: Workable angles`,
    frontFavorable ?? false,
    frontFavorable
      ? "OL has favorable leverage and double team opportunities"
      : "May need combo blocks to create movement"
  ));

  // 3. Surface/3T reason
  if (input.threeTech) {
    const threeTechFavorable = hints?.bestVs3T?.includes(input.threeTech);
    typedReasons.push(createReason(
      "surface",
      threeTechFavorable
        ? `3T ${input.threeTech}: Favorable alignment`
        : `3T ${input.threeTech}: Standard surface`,
      threeTechFavorable ?? false,
      threeTechFavorable
        ? "Point of attack has natural running lane"
        : "OL can create lane with proper technique"
    ));
  } else {
    const aim = hints?.aim || "inside";
    typedReasons.push(createReason(
      "surface",
      `Target: ${aim.replace("_", " ")} running lane`,
      true,
      aim === "inside"
        ? "Attacks A/B gaps with downhill path"
        : aim === "outside"
        ? "Stretches defense horizontally to perimeter"
        : "Flexible aiming point based on read"
    ));
  }

  // Legacy string reasons for backward compatibility
  const reasons = typedReasons.map(r => r.text).slice(0, 3);

  return { reasons, typedReasons };
}

// ============================================
// Utility: Get suggestions from Play
// ============================================

export function getSuggestionsFromPlay(
  play: Play,
  type: "pass" | "run",
  runInput?: Partial<RunSuggestionInput>
): SuggestionResult[] {
  const structure = play.meta?.formationId
    ? (play.meta?.formationId.includes("trips")
        ? "3x1"
        : play.meta?.formationId.includes("bunch")
        ? "bunch"
        : play.meta?.formationId.includes("ace")
        ? "ace"
        : play.meta?.formationId.includes("i_")
        ? "I"
        : "2x2") as FormationMeta["structure"]
    : "2x2";

  const eligibleReceivers = play.roster.players.filter((p) =>
    ["X", "Y", "Z", "H", "RB", "FB"].includes(p.role)
  ).length;

  if (type === "pass") {
    return getPassSuggestions({
      formationId: play.meta?.formationId || "",
      structure,
      eligibleReceivers,
    });
  } else {
    return getRunSuggestions({
      formationId: play.meta?.formationId || "",
      structure,
      box: runInput?.box || 7,
      front: runInput?.front || "even",
      threeTech: runInput?.threeTech,
      strength: runInput?.strength,
    });
  }
}

// ============================================
// Enhanced Context-Based Suggestions
// ============================================

export function getEnhancedSuggestions(
  play: Play,
  context: SuggestionContext = DEFAULT_SUGGESTION_CONTEXT
): EnhancedSuggestionResult[] {
  const { playType, offense, defense, situation, constraints } = context;

  // Get base concepts based on play type
  const concepts =
    playType === "pass"
      ? PASS_CONCEPTS
      : playType === "rpo"
      ? [...RUN_CONCEPTS.filter((c) => c.id.includes("rpo") || c.id.includes("zone_read")), ...PASS_CONCEPTS.slice(0, 5)]
      : RUN_CONCEPTS;

  // Filter by structure
  const structureFiltered = concepts.filter((c) => {
    if (!offense.structure) return true;
    return (
      !c.requirements?.preferredStructures ||
      c.requirements.preferredStructures.includes(offense.structure)
    );
  });

  // Filter by constraints
  const constraintFiltered = structureFiltered.filter((c) => {
    // Avoid concepts
    if (constraints.avoidConcepts.includes(c.id)) return false;

    // Must include tags check
    if (constraints.mustIncludeTags.length > 0) {
      const hasTags = constraints.mustIncludeTags.some((tag) => {
        if (tag === "QB run" && c.id.includes("qb_")) return true;
        if (tag === "screen" && c.passHints?.category === "screen") return true;
        if (tag === "TE involved" && c.requirements?.needsTE) return true;
        if (tag === "motion" && c.id.includes("jet")) return true;
        if (tag === "RPO" && c.id.includes("rpo")) return true;
        return false;
      });
      if (!hasTags) return false;
    }

    // Install complexity check
    if (constraints.installComplexity === "simple") {
      if (c.requirements?.needsPuller === "GT") return false;
    }

    return true;
  });

  // Score and enhance results
  const results: EnhancedSuggestionResult[] = constraintFiltered.map((concept) => {
    const score = scoreConceptWithContext(concept, context);
    const fit = generateFitAnalysis(concept, context);
    const why = generateWhyReasons(concept, context);
    const typedReasons = generateTypedReasons(concept, context);
    const alerts = generateAlerts(concept, context);

    return {
      conceptId: concept.id,
      name: concept.name,
      conceptType: concept.conceptType,
      score,
      fit,
      why,
      typedReasons,
      alerts: alerts.length > 0 ? alerts : undefined,
      autoBuildProfile: {
        style: "nfl_style",
        buildMode: "replace",
        includes: getAutoBuildIncludes(concept),
      },
    };
  });

  // Sort by score and apply risk filter
  let sorted = results.sort((a, b) => b.score - a.score);

  // Apply risk tolerance filter
  if (constraints.riskTolerance === "conservative") {
    sorted = sorted.filter((r) => !r.alerts?.some((a) => a.includes("risky")));
  }

  // Return top results: 8-12 for pass, top 5 for run
  const limit = context.playType === "pass" ? 12 : 5;
  const topResults = sorted.slice(0, limit);
  return normalizeScores(topResults);
}

function scoreConceptWithContext(concept: Concept, context: SuggestionContext): number {
  let score = 30; // Lower base for better spread
  const { offense, defense, situation, constraints } = context;

  if (concept.conceptType === "run") {
    const hints = concept.runHints;
    if (!hints) return Math.max(10, score);

    // Numbers fit (box count) - most important for run plays
    const boxStr = String(defense.boxCount) as "6" | "7" | "8";
    if (hints.bestWhenBox?.includes(boxStr)) {
      score += 30;
    } else if (defense.boxCount === 8) {
      // Penalty for loaded box
      const tolerance = concept.requirements?.boxTolerance;
      if (tolerance === "6_ok") {
        score -= 25;
      } else if (tolerance === "7_ok") {
        score -= 15;
      } else if (tolerance === "8_risky") {
        score -= 30;
      }
    } else if (!hints.bestWhenBox?.length) {
      score += 5; // No preference = versatile
    }

    // Angle fit (front type)
    const frontType = defense.front === "even" || defense.front === "over" ? "even" : "odd";
    if (hints.bestVsFront?.includes(frontType)) {
      score += 20;
    } else if (hints.bestVsFront && hints.bestVsFront.length > 0) {
      score -= 12; // Front mismatch penalty
    }

    // 3T fit
    if (defense.threeTech !== "none" && defense.threeTech !== "both") {
      if (hints.bestVs3T?.includes(defense.threeTech)) {
        score += 15;
      } else if (hints.bestVs3T && hints.bestVs3T.length > 0) {
        score -= 8;
      }
    } else if (defense.threeTech === "both" && hints.bestVs3T?.length) {
      score += 5;
    }

    // Structure fit
    const prefStructures = concept.requirements?.preferredStructures;
    if (offense.structure && prefStructures?.includes(offense.structure)) {
      score += 12;
    } else if (prefStructures && prefStructures.length > 0) {
      score -= 5;
    }

    // Situation bonus/penalty
    if (situation.distance === "1-2") {
      if (hints.category === "gap") score += 10;
      if (hints.category === "zone") score -= 3;
    }
    if (situation.fieldZone === "goal_line") {
      if (hints.aim?.includes("a") || hints.aim === "inside") score += 8;
      if (hints.aim === "edge") score -= 5;
    }
    if (situation.objective === "kill_clock" && hints.category === "zone") {
      score += 8;
    }
    if (situation.objective === "explosive") {
      if (hints.aim === "edge") score += 5;
      if (hints.aim === "inside") score -= 3;
    }

    // Edge/Force player analysis
    if (hints.aim === "edge" && defense.forcePlayer !== "unknown") {
      if (defense.forcePlayer === "cb") score += 10;
      else if (defense.forcePlayer === "olb") score -= 8;
    }

    // Category versatility
    if (hints.category === "zone") score += 3;
  } else {
    // Pass concept scoring
    const hints = concept.passHints;
    if (!hints) return Math.max(10, score);

    // Coverage fit - biggest factor
    if (defense.shell !== "unknown") {
      const isManCoverage = defense.shell === "cover0" || defense.shell === "cover1";
      const isZoneCoverage = ["cover2", "cover3", "cover4", "cover6"].includes(defense.shell);

      if (isManCoverage) {
        if (hints.manBeater) score += 25;
        else score -= 10;
      }
      if (isZoneCoverage) {
        if (hints.zoneBeater) score += 25;
        else score -= 10;
      }
    } else {
      // Unknown coverage - favor versatile concepts
      if (hints.manBeater && hints.zoneBeater) score += 15;
    }

    // Pressure response
    if (defense.pressureRate === "high") {
      if (hints.category === "quick" || hints.category === "screen") score += 18;
      else if (hints.category === "deep") score -= 15;
      else if (hints.category === "intermediate") score -= 5;
    } else if (defense.pressureRate === "low") {
      if (hints.category === "deep") score += 8;
    }

    // Structure fit
    const prefStructures = concept.requirements?.preferredStructures;
    if (offense.structure && prefStructures?.includes(offense.structure)) {
      score += 15;
    } else if (prefStructures && prefStructures.length > 0) {
      score -= 8;
    }

    // Situation bonus/penalty
    if (situation.distance === "10+") {
      if (hints.category === "deep") score += 8;
      if (hints.category === "quick") score -= 5;
    } else if (situation.distance === "1-2") {
      if (hints.category === "quick") score += 8;
      if (hints.category === "deep") score -= 10;
    }
    if (situation.objective === "explosive" && hints.stress?.includes("vertical")) {
      score += 10;
    }
    if (situation.objective === "score_now") {
      if (hints.category === "quick") score += 5;
    }
  }

  // Badge bonus
  if (concept.badges?.includes("nfl_style")) score += 5;

  return Math.max(10, Math.min(score, 95)); // Cap at 95, floor at 10
}

function generateFitAnalysis(
  concept: Concept,
  context: SuggestionContext
): EnhancedSuggestionResult["fit"] {
  const { offense, defense } = context;
  const fit: EnhancedSuggestionResult["fit"] = {};

  if (concept.conceptType === "run") {
    const hints = concept.runHints;

    // Numbers fit
    const boxStr = String(defense.boxCount) as "6" | "7" | "8";
    if (hints?.bestWhenBox?.includes(boxStr)) {
      fit.numbers = `Box ${defense.boxCount} favorable`;
    } else {
      fit.numbers = `Box ${defense.boxCount}`;
    }

    // Front fit
    const frontType = defense.front === "even" || defense.front === "over" ? "even" : "odd";
    if (hints?.bestVsFront?.includes(frontType)) {
      fit.front = `${defense.front} front favorable`;
    } else {
      fit.front = `${defense.front} front`;
    }

    // Surface fit (3T)
    if (defense.threeTech !== "none") {
      const threeTechForCheck = defense.threeTech === "both" ? "strong" : defense.threeTech;
      if (hints?.bestVs3T?.includes(threeTechForCheck)) {
        fit.surface = `3T ${defense.threeTech} - good angle`;
      } else {
        fit.surface = `3T ${defense.threeTech}`;
      }
    }
  } else {
    // Pass concept fit
    const hints = concept.passHints;

    // Coverage fit
    if (defense.shell !== "unknown") {
      const isManCoverage = defense.shell === "cover0" || defense.shell === "cover1";
      if (isManCoverage && hints?.manBeater) {
        fit.coverage = "Man beater";
      } else if (!isManCoverage && hints?.zoneBeater) {
        fit.coverage = "Zone beater";
      } else {
        fit.coverage = defense.shell.replace("cover", "Cover ");
      }
    }
  }

  // Structure fit
  if (offense.structure) {
    if (concept.requirements?.preferredStructures?.includes(offense.structure)) {
      fit.structure = `${offense.structure} optimal`;
    } else {
      fit.structure = offense.structure;
    }
  }

  return fit;
}

function generateWhyReasons(concept: Concept, context: SuggestionContext): string[] {
  const reasons: string[] = [];
  const { offense, defense, situation } = context;

  if (concept.conceptType === "run") {
    const hints = concept.runHints;

    // Box count reason
    const boxStr = String(defense.boxCount) as "6" | "7" | "8";
    if (hints?.bestWhenBox?.includes(boxStr)) {
      reasons.push(`Numbers advantage vs ${defense.boxCount}-man box`);
    }

    // Front reason
    const frontType = defense.front === "even" || defense.front === "over" ? "even" : "odd";
    if (hints?.bestVsFront?.includes(frontType)) {
      reasons.push(`Blocking scheme fits ${defense.front} front`);
    }

    // 3T reason
    if (defense.threeTech !== "none" && defense.threeTech !== "both") {
      if (hints?.bestVs3T?.includes(defense.threeTech)) {
        reasons.push(`Good leverage on ${defense.threeTech} 3-tech`);
      }
    } else if (defense.threeTech === "both") {
      reasons.push("Both 3-techs present");
    }

    // Aim point reason
    if (hints?.aim) {
      reasons.push(`Targets ${hints.aim.replace(/_/g, " ")} area`);
    }

    // Category specific
    if (hints?.category === "zone" && situation.objective === "kill_clock") {
      reasons.push("Zone scheme good for clock management");
    }
    if (hints?.category === "gap" && situation.distance === "1-2") {
      reasons.push("Gap scheme effective in short yardage");
    }
  } else {
    const hints = concept.passHints;

    // Coverage stress
    if (hints?.stress && hints.stress.length > 0) {
      reasons.push(`Stresses ${hints.stress[0].replace(/_/g, " ")}`);
    }

    // Man/Zone beater
    const isManCoverage = defense.shell === "cover0" || defense.shell === "cover1";
    if (isManCoverage && hints?.manBeater) {
      reasons.push("Effective man coverage beater");
    } else if (!isManCoverage && hints?.zoneBeater) {
      reasons.push("Attacks zone coverage windows");
    }

    // Pressure response
    if (defense.pressureRate === "high" && (hints?.category === "quick" || hints?.category === "screen")) {
      reasons.push("Quick release vs pressure");
    }
  }

  return reasons.slice(0, 4);
}

function generateTypedReasons(concept: Concept, context: SuggestionContext): RecommendationReason[] {
  const typedReasons: RecommendationReason[] = [];
  const { offense, defense, situation } = context;

  if (concept.conceptType === "run") {
    const hints = concept.runHints;

    // 1. Numbers reason (box count) - always include
    const boxStr = String(defense.boxCount) as "6" | "7" | "8";
    const boxFavorable = hints?.bestWhenBox?.includes(boxStr);
    typedReasons.push(createReason(
      "numbers",
      boxFavorable
        ? `Box ${defense.boxCount}: Numbers advantage`
        : defense.boxCount >= 8
        ? `Box ${defense.boxCount}: Loaded box`
        : `Box ${defense.boxCount}: Neutral numbers`,
      boxFavorable ?? defense.boxCount < 8,
      boxFavorable
        ? "Defense doesn't have enough defenders in the box to stop this concept"
        : defense.boxCount >= 8
        ? "Consider play action, RPO, or different concept to move defenders"
        : "Standard box count - execution matters"
    ));

    // 2. Angle reason (front type) - always include
    const frontType = defense.front === "even" || defense.front === "over" ? "even" : "odd";
    const frontFavorable = hints?.bestVsFront?.includes(frontType);
    typedReasons.push(createReason(
      "angle",
      frontFavorable
        ? `${defense.front} front: Favorable angles`
        : `${defense.front} front: Workable angles`,
      frontFavorable ?? false,
      frontFavorable
        ? "Blocking scheme creates natural double teams and combo blocks"
        : "May need adjustment blocks to create lanes"
    ));

    // 3. Surface reason (3T position) - always include
    if (defense.threeTech !== "none") {
      const threeTechFavorable = hints?.bestVs3T?.includes(defense.threeTech as any);
      typedReasons.push(createReason(
        "surface",
        threeTechFavorable
          ? `3T ${defense.threeTech}: Good leverage`
          : `3T ${defense.threeTech}: Standard`,
        threeTechFavorable ?? false,
        threeTechFavorable
          ? "Point of attack alignment creates natural running lane"
          : "OL technique will determine success"
      ));
    } else {
      typedReasons.push(createReason(
        "surface",
        `Target: ${(hints?.aim || "inside").replace(/_/g, " ")} lanes`,
        true,
        "Primary aiming point for the ball carrier"
      ));
    }

  } else {
    const hints = concept.passHints;

    // 1. Coverage stress reason - always include
    const stress = hints?.stress || [];
    if (stress.length > 0) {
      typedReasons.push(createReason(
        "coverage",
        `Stresses: ${stress.slice(0, 2).join(", ")}`,
        true,
        "Creates difficult coverage decisions for defenders"
      ));
    } else if (hints?.manBeater && hints?.zoneBeater) {
      typedReasons.push(createReason(
        "coverage",
        "Beats both man and zone",
        true,
        "Versatile concept with answers for multiple coverages"
      ));
    } else if (hints?.manBeater) {
      typedReasons.push(createReason(
        "coverage",
        "Man coverage beater",
        true,
        "Route combinations create separation against man"
      ));
    } else if (hints?.zoneBeater) {
      typedReasons.push(createReason(
        "coverage",
        "Zone coverage beater",
        true,
        "Finds soft spots between zone defenders"
      ));
    } else {
      typedReasons.push(createReason(
        "coverage",
        "General purpose concept",
        true,
        "Adaptable to different coverage looks"
      ));
    }

    // 2. Structure reason - always include
    const structureMatch = concept.requirements?.preferredStructures?.includes(offense.structure);
    typedReasons.push(createReason(
      "structure",
      structureMatch
        ? `Fits ${offense.structure} formation`
        : `Works with ${offense.structure} formation`,
      structureMatch ?? false,
      structureMatch
        ? "Receiver alignment naturally sets up route combinations"
        : "May require slight formation adjustment"
    ));

    // 3. Situational reason - always include
    const isManCoverage = defense.shell === "cover0" || defense.shell === "cover1";
    const matchesCoverage = (isManCoverage && hints?.manBeater) || (!isManCoverage && hints?.zoneBeater);
    typedReasons.push(createReason(
      "situational",
      matchesCoverage
        ? `Effective vs ${defense.shell}`
        : defense.shell !== "unknown"
        ? `Can work vs ${defense.shell}`
        : `${hints?.category || "Intermediate"} timing`,
      matchesCoverage ?? false,
      matchesCoverage
        ? "Designed to attack this coverage structure"
        : "Execution and reads will determine success"
    ));
  }

  // Rank, deduplicate, and return top 3 strongest reasons
  return rankAndDeduplicateReasons(typedReasons);
}

// ============================================
// Reason Ranking and Deduplication
// ============================================

/**
 * Reason strength scoring:
 * - Favorable reasons score higher
 * - Specific types (numbers, coverage) score higher than generic (situational)
 * - Reasons with detailed explanations score higher
 */
function scoreReason(reason: RecommendationReason): number {
  let score = 0;

  // Favorable reasons are stronger
  if (reason.favorable) score += 50;

  // Type priority (specificity matters)
  const typePriority: Record<ReasonType, number> = {
    numbers: 40,
    coverage: 35,
    angle: 30,
    surface: 25,
    structure: 20,
    formation_fit: 18,
    defense_fit: 16,
    team_fit: 14,
    situational: 10,
  };
  score += typePriority[reason.type] || 0;

  // Has detailed explanation
  if (reason.details && reason.details.length > 20) score += 10;

  // Penalize generic/filler phrases
  const genericPhrases = [
    "can work",
    "may require",
    "standard",
    "general purpose",
    "consider",
    "workable",
    "neutral",
  ];
  const lowerText = reason.text.toLowerCase();
  if (genericPhrases.some((p) => lowerText.includes(p))) {
    score -= 15;
  }

  return score;
}

/**
 * Check if two reasons are semantically similar (for deduplication)
 */
function areSimilarReasons(a: RecommendationReason, b: RecommendationReason): boolean {
  // Same type is a signal
  if (a.type === b.type) {
    // Check for very similar text
    const aWords = a.text.toLowerCase().split(/\s+/);
    const bWords = b.text.toLowerCase().split(/\s+/);
    const commonWords = aWords.filter((w) => bWords.includes(w) && w.length > 3);
    return commonWords.length >= 2;
  }
  return false;
}

/**
 * Rank reasons by strength, deduplicate, and return top 3
 */
function rankAndDeduplicateReasons(reasons: RecommendationReason[]): RecommendationReason[] {
  if (reasons.length <= 3) return reasons;

  // Score all reasons
  const scored = reasons.map((r) => ({ reason: r, score: scoreReason(r) }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Deduplicate: keep first occurrence (higher scored)
  const result: RecommendationReason[] = [];
  for (const { reason } of scored) {
    const isDuplicate = result.some((r) => areSimilarReasons(r, reason));
    if (!isDuplicate) {
      result.push(reason);
    }
    if (result.length >= 3) break;
  }

  // Ensure we have 3 (fill with remaining if needed)
  if (result.length < 3) {
    for (const { reason } of scored) {
      if (!result.includes(reason)) {
        result.push(reason);
        if (result.length >= 3) break;
      }
    }
  }

  return result.slice(0, 3);
}

function generateAlerts(concept: Concept, context: SuggestionContext): string[] {
  const alerts: string[] = [];
  const { offense, defense, constraints } = context;

  if (concept.conceptType === "run") {
    // Box overload alert
    if (defense.boxCount === 8) {
      const tolerance = concept.requirements?.boxTolerance;
      if (tolerance === "6_ok" || tolerance === "7_ok") {
        alerts.push("8-man box risky for this concept");
      }
    }

    // Puller requirement alert
    if (concept.requirements?.needsPuller === "GT" && offense.olPullAbility === 0) {
      alerts.push("Requires OL pull ability");
    }

    // TE requirement alert
    if (concept.requirements?.needsTE && offense.teAttached === 0) {
      alerts.push("Requires attached TE");
    }

    // Edge setting alert
    if (concept.runHints?.aim === "edge" && defense.edgeSetting === "hard") {
      alerts.push("Hard edge setting may limit perimeter");
    }
  } else {
    // Pressure alert for deep concepts
    if (defense.pressureRate === "high" && concept.passHints?.category === "deep") {
      alerts.push("High pressure risk for deep routes");
    }

    // Blitz tendency alert
    if (defense.blitzTendency !== "none" && concept.passHints?.category === "intermediate") {
      alerts.push(`Watch for ${defense.blitzTendency} blitz`);
    }
  }

  // Risk tolerance check
  if (constraints.riskTolerance === "conservative") {
    if (concept.id.includes("deep") || concept.passHints?.category === "deep") {
      alerts.push("Lower percentage play");
    }
  }

  return alerts;
}

function getAutoBuildIncludes(concept: Concept): string[] {
  const includes: string[] = [];

  if (concept.conceptType === "run") {
    includes.push("OL blocking assignments");
    includes.push("RB path");

    if (concept.requirements?.needsPuller && concept.requirements.needsPuller !== "none") {
      includes.push("Puller paths");
    }
    if (concept.id.includes("zone_read") || concept.id.includes("rpo")) {
      includes.push("QB read option");
    }
  } else {
    includes.push("Route assignments");
    if (concept.passHints?.category === "screen") {
      includes.push("Blocking assignments");
    }
  }

  return includes;
}

// ============================================
// Defense Preset Integration
// ============================================

/**
 * Convert DefensePreset to DefenseContext for suggestions
 */
export function defensePresetToContext(preset: DefensePreset): Partial<DefenseContext> {
  // Map defense preset front to FrontType
  const frontMap: Record<string, FrontType> = {
    even: "even",
    odd: "odd",
    over: "over",
    under: "under",
    bear: "bear",
    tite: "even", // Tite is similar to even front
  };

  // Map defense shell to ShellCoverage
  const shellMap: Record<string, ShellCoverage> = {
    cover0: "cover0",
    cover1: "cover1",
    cover2: "cover2",
    cover3: "cover3",
    cover4: "cover4",
    cover6: "cover6",
    nickel: "unknown",
    dime: "unknown",
    unknown: "unknown",
  };

  return {
    boxCount: preset.boxCount,
    front: frontMap[preset.front] || "even",
    shell: shellMap[preset.shell] || "unknown",
  };
}

/**
 * Get enhanced suggestions using defense preset ID
 */
export function getSuggestionsWithDefensePreset(
  play: Play,
  defensePresetId: string | null,
  baseContext: Partial<SuggestionContext> = {}
): EnhancedSuggestionResult[] {
  // Build context from defense preset
  let context: SuggestionContext = {
    ...DEFAULT_SUGGESTION_CONTEXT,
    ...baseContext,
  };

  if (defensePresetId) {
    const preset = getDefensePresetById(defensePresetId);
    if (preset) {
      const defenseContext = defensePresetToContext(preset);
      context = {
        ...context,
        defense: {
          ...context.defense,
          ...defenseContext,
        },
      };
    }
  }

  return getEnhancedSuggestions(play, context);
}

// ============================================
// Family-Based Suggestions
// ============================================

export interface FamilySuggestionResult {
  family: ConceptFamily;
  score: number;
  baseConceptResult: EnhancedSuggestionResult | null;
  activeAlerts: ConceptFamily["alerts"];
  recommendedVariation: string | null;
  fit: {
    front: boolean;
    shell: boolean;
    overall: "excellent" | "good" | "fair" | "poor";
  };
}

/**
 * Get concept family suggestions based on defense preset
 */
export function getFamilySuggestions(
  play: Play,
  defensePresetId: string | null,
  playType: "run" | "pass" = "run"
): FamilySuggestionResult[] {
  // Get defense preset for analysis
  const preset = defensePresetId ? getDefensePresetById(defensePresetId) : null;

  // Get concept families by type
  const families = CONCEPT_FAMILIES.filter((f) => f.conceptType === playType);

  // Get enhanced suggestions for scoring
  const enhancedSuggestions = getSuggestionsWithDefensePreset(play, defensePresetId, {
    playType,
  });

  // Score and analyze each family
  const results: FamilySuggestionResult[] = families.map((family) => {
    // Find base concept in enhanced suggestions
    const baseResult = enhancedSuggestions.find(
      (s) => s.conceptId === family.baseConceptId
    ) || null;

    // Calculate family score
    let score = baseResult?.score || 50;

    // Fit analysis
    const frontFit = preset ? family.compatibleFronts.includes(preset.front) : true;
    const shellFit = preset
      ? preset.shell === "unknown" || family.compatibleShells.includes(preset.shell as any)
      : true;

    // Adjust score based on fit
    if (frontFit) score += 5;
    if (shellFit) score += 5;

    // Get active alerts for this family based on defense
    const activeAlerts = preset
      ? getActiveAlerts(family, {
          front: preset.front,
          shell: preset.shell as any,
          boxCount: preset.boxCount,
        })
      : [];

    // Determine recommended variation based on defense
    let recommendedVariation: string | null = null;
    if (preset && family.variations.length > 1) {
      // For loaded box (7+), recommend read/RPO variations
      if (preset.boxCount >= 7) {
        const readVar = family.variations.find(
          (v) => v.tags?.includes("read") || v.tags?.includes("rpo")
        );
        if (readVar) recommendedVariation = readVar.conceptId;
      }

      // For bear/tite front, recommend split/wham variations
      if (preset.front === "bear" || preset.front === "tite") {
        const splitVar = family.variations.find(
          (v) => v.tags?.includes("split") || v.tags?.includes("wham")
        );
        if (splitVar) recommendedVariation = splitVar.conceptId;
      }
    }

    // Calculate overall fit
    let overallFit: "excellent" | "good" | "fair" | "poor" = "fair";
    if (frontFit && shellFit && score >= 70) {
      overallFit = "excellent";
    } else if (frontFit && score >= 60) {
      overallFit = "good";
    } else if (score < 40) {
      overallFit = "poor";
    }

    return {
      family,
      score,
      baseConceptResult: baseResult,
      activeAlerts,
      recommendedVariation,
      fit: {
        front: frontFit,
        shell: shellFit,
        overall: overallFit,
      },
    };
  });

  // Sort by score and normalize
  return normalizeScores(results.sort((a, b) => b.score - a.score));
}

/**
 * Get comprehensive suggestion data including families
 */
export interface ComprehensiveSuggestions {
  enhanced: EnhancedSuggestionResult[];
  families: FamilySuggestionResult[];
  defenseAnalysis: {
    presetId: string | null;
    presetName: string | null;
    front: string;
    shell: string;
    boxCount: number;
  } | null;
}

export function getComprehensiveSuggestions(
  play: Play,
  defensePresetId: string | null,
  playType: "run" | "pass" = "run"
): ComprehensiveSuggestions {
  const preset = defensePresetId ? getDefensePresetById(defensePresetId) : null;

  return {
    enhanced: getSuggestionsWithDefensePreset(play, defensePresetId, { playType }),
    families: getFamilySuggestions(play, defensePresetId, playType),
    defenseAnalysis: preset
      ? {
          presetId: preset.id,
          presetName: preset.name,
          front: preset.front,
          shell: preset.shell,
          boxCount: preset.boxCount,
        }
      : null,
  };
}
