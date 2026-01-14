// ============================================
// Suggestions Engine
// Formation → Pass/Run Concept 추천
// ============================================

import type { Concept, Formation, Play, FormationMeta } from "../dsl/types";
import { PASS_CONCEPTS, getPassConceptsForFormation } from "./concepts-pass";
import { RUN_CONCEPTS, getRunConceptsForFormation } from "./concepts-run";

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
