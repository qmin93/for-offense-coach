// ============================================
// Suggestions Engine
// Formation → Pass/Run Concept 추천
// ============================================

import type { Concept, Formation, Play, FormationMeta, DefensePreset, ConceptFamily } from "../dsl/types";
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
  reasons: string[];
  category: string;
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
    const reasons = generatePassReasons(concept, input);
    const category = concept.passHints?.category || "intermediate";

    return { concept, score, reasons, category };
  });

  // Sort by score descending, limit to 12
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

function scorePassConcept(concept: Concept, input: PassSuggestionInput): number {
  let score = 50; // Base score

  // Structure match bonus
  if (concept.requirements?.preferredStructures?.includes(input.structure as any)) {
    score += 20;
  }

  // Eligible receivers match
  const minReceivers = concept.requirements?.minEligibleReceivers || 1;
  if (input.eligibleReceivers >= minReceivers) {
    score += 10;
  }
  if (input.eligibleReceivers >= minReceivers + 1) {
    score += 5;
  }

  // Badge bonus (nfl_style)
  if (concept.badges?.includes("nfl_style")) {
    score += 5;
  }

  return Math.min(score, 100);
}

function generatePassReasons(concept: Concept, input: PassSuggestionInput): string[] {
  const reasons: string[] = [];

  // Structure reason
  if (concept.requirements?.preferredStructures?.includes(input.structure as any)) {
    reasons.push(`Fits ${input.structure} structure`);
  }

  // Coverage stress reason
  const stress = concept.passHints?.stress || [];
  if (stress.length > 0) {
    const stressText = stress.slice(0, 2).join(", ");
    reasons.push(`Stresses: ${stressText}`);
  }

  // Man/Zone beater reason
  if (concept.passHints?.manBeater && concept.passHints?.zoneBeater) {
    reasons.push("Beats man and zone");
  } else if (concept.passHints?.manBeater) {
    reasons.push("Man coverage beater");
  } else if (concept.passHints?.zoneBeater) {
    reasons.push("Zone coverage beater");
  }

  return reasons.slice(0, 3);
}

// ============================================
// Run Suggestions
// ============================================

export function getRunSuggestions(input: RunSuggestionInput): SuggestionResult[] {
  const { structure, box, front, threeTech } = input;

  // Get concepts that fit the formation structure
  let concepts = structure
    ? getRunConceptsForFormation(structure)
    : RUN_CONCEPTS;

  // Score and sort
  const results: SuggestionResult[] = concepts.map((concept) => {
    const score = scoreRunConcept(concept, input);
    const reasons = generateRunReasons(concept, input);
    const category = concept.runHints?.category || "zone";

    return { concept, score, reasons, category };
  });

  // Sort by score descending, limit to 5
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function scoreRunConcept(concept: Concept, input: RunSuggestionInput): number {
  let score = 50; // Base score

  const hints = concept.runHints;
  if (!hints) return score;

  // Numbers fit (box count)
  if (hints.bestWhenBox?.includes(String(input.box) as any)) {
    score += 20;
  } else {
    // Penalty for box mismatch
    const boxTolerance = concept.requirements?.boxTolerance;
    if (boxTolerance === "8_risky" && input.box === 8) {
      score -= 15;
    }
  }

  // Angle fit (front type)
  if (hints.bestVsFront?.includes(input.front)) {
    score += 15;
  }

  // 3T fit
  if (input.threeTech && hints.bestVs3T?.includes(input.threeTech)) {
    score += 10;
  }

  // Structure fit
  if (concept.requirements?.preferredStructures?.includes(input.structure as any)) {
    score += 10;
  }

  // Badge bonus
  if (concept.badges?.includes("nfl_style")) {
    score += 5;
  }

  return Math.min(score, 100);
}

function generateRunReasons(concept: Concept, input: RunSuggestionInput): string[] {
  const reasons: string[] = [];
  const hints = concept.runHints;

  // Numbers reason
  if (hints?.bestWhenBox?.includes(String(input.box) as any)) {
    reasons.push(`Numbers: Box ${input.box} favorable`);
  } else {
    reasons.push(`Numbers: Box ${input.box}`);
  }

  // Angle reason
  if (hints?.bestVsFront?.includes(input.front)) {
    reasons.push(`Angle: ${input.front} front favorable`);
  } else {
    reasons.push(`Angle: ${input.front} front`);
  }

  // Surface/3T reason
  if (input.threeTech) {
    if (hints?.bestVs3T?.includes(input.threeTech)) {
      reasons.push(`Surface: 3T ${input.threeTech} - good angle`);
    } else {
      reasons.push(`Surface: 3T ${input.threeTech}`);
    }
  } else {
    const aim = hints?.aim || "inside";
    reasons.push(`Target: ${aim.replace("_", " ")}`);
  }

  return reasons.slice(0, 3);
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
    const alerts = generateAlerts(concept, context);

    return {
      conceptId: concept.id,
      name: concept.name,
      conceptType: concept.conceptType,
      score,
      fit,
      why,
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

  // Return top results
  const limit = playType === "run" ? 5 : 8;
  return sorted.slice(0, limit);
}

function scoreConceptWithContext(concept: Concept, context: SuggestionContext): number {
  let score = 50;
  const { offense, defense, situation, constraints } = context;

  if (concept.conceptType === "run") {
    const hints = concept.runHints;
    if (!hints) return score;

    // Numbers fit (box count) - most important for run plays
    const boxStr = String(defense.boxCount) as "6" | "7" | "8";
    if (hints.bestWhenBox?.includes(boxStr)) {
      score += 25;
    } else if (defense.boxCount === 8) {
      // Penalty for loaded box
      const tolerance = concept.requirements?.boxTolerance;
      if (tolerance === "6_ok") {
        score -= 20;
      } else if (tolerance === "7_ok") {
        score -= 10;
      }
    }

    // Angle fit (front type)
    const frontType = defense.front === "even" || defense.front === "over" ? "even" : "odd";
    if (hints.bestVsFront?.includes(frontType)) {
      score += 15;
    }

    // 3T fit
    if (defense.threeTech !== "none" && defense.threeTech !== "both") {
      if (hints.bestVs3T?.includes(defense.threeTech)) {
        score += 10;
      }
    } else if (defense.threeTech === "both" && hints.bestVs3T?.length) {
      // If both 3Ts present, concept needs to handle both
      score += 5;
    }

    // Structure fit
    if (offense.structure && concept.requirements?.preferredStructures?.includes(offense.structure)) {
      score += 10;
    }

    // Situation bonus
    if (situation.distance === "1-2" && hints.category === "gap") {
      score += 5; // Short yardage favors gap schemes
    }
    if (situation.fieldZone === "goal_line" && hints.aim?.includes("a")) {
      score += 5; // Goal line favors inside runs
    }
    if (situation.objective === "kill_clock" && hints.category === "zone") {
      score += 5; // Clock killing favors zone runs
    }

    // Edge/Force player analysis
    if (hints.aim === "edge" && defense.forcePlayer !== "unknown") {
      if (defense.forcePlayer === "cb") {
        score += 8; // CB as force = favorable for perimeter
      } else if (defense.forcePlayer === "olb") {
        score -= 5; // OLB as force = tougher edge
      }
    }
  } else {
    // Pass concept scoring
    const hints = concept.passHints;
    if (!hints) return score;

    // Coverage fit
    if (defense.shell !== "unknown") {
      const isManCoverage = defense.shell === "cover0" || defense.shell === "cover1";
      const isZoneCoverage = ["cover2", "cover3", "cover4", "cover6"].includes(defense.shell);

      if (isManCoverage && hints.manBeater) {
        score += 20;
      }
      if (isZoneCoverage && hints.zoneBeater) {
        score += 20;
      }
    }

    // Pressure response
    if (defense.pressureRate === "high") {
      if (hints.category === "quick" || hints.category === "screen") {
        score += 15;
      } else if (hints.category === "deep") {
        score -= 10;
      }
    }

    // Structure fit
    if (offense.structure && concept.requirements?.preferredStructures?.includes(offense.structure)) {
      score += 10;
    }

    // Situation bonus
    if (situation.distance === "10+" && hints.category === "deep") {
      score += 5;
    }
    if (situation.objective === "explosive" && hints.stress?.includes("vertical")) {
      score += 8;
    }
  }

  // Badge bonus
  if (concept.badges?.includes("nfl_style")) {
    score += 5;
  }

  return Math.min(Math.max(score, 0), 100);
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

  // Sort by score
  return results.sort((a, b) => b.score - a.score);
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
