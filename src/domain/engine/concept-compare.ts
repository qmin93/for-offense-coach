// ============================================
// Concept Compare Engine
// Compares two concepts side-by-side with pros/cons
// ============================================

import type { Concept, ConceptType } from "@/domain/dsl/types";
import { getPassConceptById, PASS_CONCEPTS } from "./concepts-pass";
import { getRunConceptById, RUN_CONCEPTS } from "./concepts-run";

// ============================================
// Types
// ============================================

export interface ConceptComparison {
  conceptA: ComparedConcept;
  conceptB: ComparedConcept;
  differentiators: Differentiator[];
  recommendation: ComparisonRecommendation;
}

export interface ComparedConcept {
  id: string;
  name: string;
  type: ConceptType;
  category: string;
  pros: string[];
  cons: string[];
  bestSituations: string[];
  requirements: string[];
  complexity: 1 | 2 | 3 | 4 | 5;
}

export interface Differentiator {
  aspect: string;
  conceptA: string;
  conceptB: string;
  advantage: "A" | "B" | "neutral";
  explanation: string;
}

export interface ComparisonRecommendation {
  pick: "A" | "B" | "either";
  reason: string;
  whenToUseA: string;
  whenToUseB: string;
}

// ============================================
// Main Compare Function
// ============================================

export function compareConcepts(
  conceptAId: string,
  conceptBId: string,
  context?: {
    defense?: string;
    coverage?: string;
    down?: string;
    distance?: string;
    fieldZone?: string;
  }
): ConceptComparison | null {
  const conceptA = getConceptById(conceptAId);
  const conceptB = getConceptById(conceptBId);

  if (!conceptA || !conceptB) {
    return null;
  }

  const comparedA = buildComparedConcept(conceptA);
  const comparedB = buildComparedConcept(conceptB);
  const differentiators = buildDifferentiators(conceptA, conceptB, comparedA, comparedB);
  const recommendation = buildRecommendation(comparedA, comparedB, differentiators, context);

  return {
    conceptA: comparedA,
    conceptB: comparedB,
    differentiators,
    recommendation,
  };
}

// ============================================
// Build Compared Concept
// ============================================

function buildComparedConcept(concept: Concept): ComparedConcept {
  const pros: string[] = [];
  const cons: string[] = [];
  const bestSituations: string[] = [];
  const requirements: string[] = [];

  const isRun = concept.conceptType === "run";

  // Pass concept analysis
  if (!isRun && concept.passHints) {
    const hints = concept.passHints;

    // Pros
    if (hints.manBeater) {
      pros.push("Beats man coverage");
    }
    if (hints.zoneBeater) {
      pros.push("Beats zone coverage");
    }
    if (hints.category === "quick") {
      pros.push("Quick release protects QB");
      bestSituations.push("2-minute drill", "Facing pressure");
    }
    if (hints.category === "deep") {
      pros.push("Big play potential");
      bestSituations.push("Need chunk yardage");
    }
    if (hints.stress?.includes("SEAM") || hints.stress?.includes("HIGH_LOW")) {
      pros.push("Creates multiple reads");
    }

    // Cons
    if (hints.category === "deep") {
      cons.push("Requires time to develop");
      cons.push("Risk of sack if protection breaks");
    }
    if (!hints.manBeater) {
      cons.push("Struggles vs tight man");
    }
    if (!hints.zoneBeater) {
      cons.push("May get walled off by zones");
    }
  }

  // Run concept analysis
  if (isRun && concept.runHints) {
    const hints = concept.runHints;

    // Pros
    if (hints.bestVsFront?.includes("even")) {
      pros.push("Effective vs even fronts");
      bestSituations.push("Facing 4-down front");
    }
    if (hints.bestVsFront?.includes("odd")) {
      pros.push("Effective vs odd fronts");
      bestSituations.push("Facing 3-down front");
    }
    if (hints.bestWhenBox?.includes("6")) {
      pros.push("Great vs light boxes");
    }
    if (hints.category === "zone") {
      pros.push("RB can find cutback lanes");
    }
    if (hints.category === "gap") {
      pros.push("Creates defined running lanes");
    }
    if (hints.category === "perimeter") {
      pros.push("Gets to the edge quickly");
      bestSituations.push("Facing aggressive fronts");
    }

    // Cons
    if (hints.bestWhenBox?.includes("8")) {
      cons.push("Struggles vs stacked boxes");
    }
    if (!hints.bestVsFront?.includes("even") && !hints.bestVsFront?.includes("odd")) {
      cons.push("Limited front versatility");
    }
    if (hints.surfaceNeeds?.includes("TE_BLOCK")) {
      cons.push("Needs TE blocking support");
      requirements.push("Strong TE blocker");
    }
  }

  // Requirements from concept itself
  if (concept.requirements) {
    if (concept.requirements.needsTE) {
      requirements.push("Requires TE in formation");
    }
    if (concept.requirements.needsPuller && concept.requirements.needsPuller !== "none") {
      requirements.push(`Requires ${concept.requirements.needsPuller} to pull`);
    }
    if (concept.requirements.minEligibleReceivers) {
      requirements.push(`${concept.requirements.minEligibleReceivers}+ eligible receivers`);
    }
  }

  // Add general pros/cons based on complexity
  const complexity = concept.installDifficulty || 2;
  if (complexity <= 2) {
    pros.push("Easy to install and teach");
  } else if (complexity >= 4) {
    cons.push("Complex installation");
    requirements.push("Practice time to master");
  }

  // Ensure we have at least something
  if (pros.length === 0) {
    pros.push("Solid foundational concept");
  }
  if (cons.length === 0) {
    cons.push("May require adjustments vs specific looks");
  }
  if (bestSituations.length === 0) {
    bestSituations.push("Standard down and distance");
  }

  return {
    id: concept.id,
    name: concept.name,
    type: concept.conceptType,
    category: isRun
      ? concept.runHints?.category || "general"
      : concept.passHints?.category || "general",
    pros,
    cons,
    bestSituations,
    requirements,
    complexity: complexity as 1 | 2 | 3 | 4 | 5,
  };
}

// ============================================
// Build Differentiators
// ============================================

function buildDifferentiators(
  conceptA: Concept,
  conceptB: Concept,
  comparedA: ComparedConcept,
  comparedB: ComparedConcept
): Differentiator[] {
  const differentiators: Differentiator[] = [];

  // Category comparison
  if (comparedA.category !== comparedB.category) {
    differentiators.push({
      aspect: "Concept Style",
      conceptA: comparedA.category,
      conceptB: comparedB.category,
      advantage: "neutral",
      explanation: `Different approaches: ${comparedA.category} vs ${comparedB.category}`,
    });
  }

  // Complexity comparison
  if (comparedA.complexity !== comparedB.complexity) {
    const simpler = comparedA.complexity < comparedB.complexity ? "A" : "B";
    differentiators.push({
      aspect: "Installation",
      conceptA: `Complexity ${comparedA.complexity}/5`,
      conceptB: `Complexity ${comparedB.complexity}/5`,
      advantage: simpler,
      explanation: simpler === "A"
        ? `${comparedA.name} is simpler to install`
        : `${comparedB.name} is simpler to install`,
    });
  }

  // Pass concept specific
  if (conceptA.conceptType === "pass" && conceptB.conceptType === "pass") {
    const hintsA = conceptA.passHints;
    const hintsB = conceptB.passHints;

    // Man vs Zone beaters
    if (hintsA?.manBeater !== hintsB?.manBeater) {
      differentiators.push({
        aspect: "Man Coverage",
        conceptA: hintsA?.manBeater ? "Beats man" : "Struggles vs man",
        conceptB: hintsB?.manBeater ? "Beats man" : "Struggles vs man",
        advantage: hintsA?.manBeater ? "A" : "B",
        explanation: hintsA?.manBeater
          ? `${comparedA.name} is better vs man coverage`
          : `${comparedB.name} is better vs man coverage`,
      });
    }

    if (hintsA?.zoneBeater !== hintsB?.zoneBeater) {
      differentiators.push({
        aspect: "Zone Coverage",
        conceptA: hintsA?.zoneBeater ? "Beats zone" : "Limited vs zone",
        conceptB: hintsB?.zoneBeater ? "Beats zone" : "Limited vs zone",
        advantage: hintsA?.zoneBeater ? "A" : "B",
        explanation: hintsA?.zoneBeater
          ? `${comparedA.name} is better vs zone coverage`
          : `${comparedB.name} is better vs zone coverage`,
      });
    }
  }

  // Run concept specific
  if (conceptA.conceptType === "run" && conceptB.conceptType === "run") {
    const hintsA = conceptA.runHints;
    const hintsB = conceptB.runHints;

    // Front advantages
    const aVsEven = hintsA?.bestVsFront?.includes("even");
    const bVsEven = hintsB?.bestVsFront?.includes("even");
    if (aVsEven !== bVsEven) {
      differentiators.push({
        aspect: "Vs Even Fronts",
        conceptA: aVsEven ? "Strong" : "Limited",
        conceptB: bVsEven ? "Strong" : "Limited",
        advantage: aVsEven ? "A" : "B",
        explanation: aVsEven
          ? `${comparedA.name} handles even fronts better`
          : `${comparedB.name} handles even fronts better`,
      });
    }

    const aVsOdd = hintsA?.bestVsFront?.includes("odd");
    const bVsOdd = hintsB?.bestVsFront?.includes("odd");
    if (aVsOdd !== bVsOdd) {
      differentiators.push({
        aspect: "Vs Odd Fronts",
        conceptA: aVsOdd ? "Strong" : "Limited",
        conceptB: bVsOdd ? "Strong" : "Limited",
        advantage: aVsOdd ? "A" : "B",
        explanation: aVsOdd
          ? `${comparedA.name} handles odd fronts better`
          : `${comparedB.name} handles odd fronts better`,
      });
    }
  }

  // Requirements comparison
  const aReqs = comparedA.requirements.length;
  const bReqs = comparedB.requirements.length;
  if (aReqs !== bReqs) {
    differentiators.push({
      aspect: "Requirements",
      conceptA: aReqs === 0 ? "Minimal" : `${aReqs} requirements`,
      conceptB: bReqs === 0 ? "Minimal" : `${bReqs} requirements`,
      advantage: aReqs < bReqs ? "A" : "B",
      explanation: aReqs < bReqs
        ? `${comparedA.name} has fewer prerequisites`
        : `${comparedB.name} has fewer prerequisites`,
    });
  }

  return differentiators;
}

// ============================================
// Build Recommendation
// ============================================

function buildRecommendation(
  comparedA: ComparedConcept,
  comparedB: ComparedConcept,
  differentiators: Differentiator[],
  context?: {
    defense?: string;
    coverage?: string;
    down?: string;
    distance?: string;
    fieldZone?: string;
  }
): ComparisonRecommendation {
  let aScore = 50;
  let bScore = 50;

  // Count advantages
  for (const diff of differentiators) {
    if (diff.advantage === "A") aScore += 10;
    if (diff.advantage === "B") bScore += 10;
  }

  // Context-based adjustments
  if (context) {
    // Coverage matching
    if (context.coverage === "man") {
      if (comparedA.pros.some((p) => p.includes("man"))) aScore += 15;
      if (comparedB.pros.some((p) => p.includes("man"))) bScore += 15;
    }
    if (context.coverage === "zone") {
      if (comparedA.pros.some((p) => p.includes("zone"))) aScore += 15;
      if (comparedB.pros.some((p) => p.includes("zone"))) bScore += 15;
    }

    // Situation matching
    if (context.distance === "long") {
      if (comparedA.category === "deep") aScore += 10;
      if (comparedB.category === "deep") bScore += 10;
    }
    if (context.distance === "short") {
      if (comparedA.category === "quick") aScore += 10;
      if (comparedB.category === "quick") bScore += 10;
    }
  }

  // Complexity tiebreaker (prefer simpler)
  if (Math.abs(aScore - bScore) < 5) {
    if (comparedA.complexity < comparedB.complexity) aScore += 5;
    if (comparedB.complexity < comparedA.complexity) bScore += 5;
  }

  // Determine pick
  let pick: "A" | "B" | "either";
  let reason: string;

  if (Math.abs(aScore - bScore) < 10) {
    pick = "either";
    reason = "Both concepts are viable options for this situation. Choose based on your team's strengths.";
  } else if (aScore > bScore) {
    pick = "A";
    const topDiff = differentiators.find((d) => d.advantage === "A");
    reason = topDiff?.explanation || `${comparedA.name} has more advantages overall.`;
  } else {
    pick = "B";
    const topDiff = differentiators.find((d) => d.advantage === "B");
    reason = topDiff?.explanation || `${comparedB.name} has more advantages overall.`;
  }

  return {
    pick,
    reason,
    whenToUseA: comparedA.bestSituations.slice(0, 2).join(", ") || "Standard situations",
    whenToUseB: comparedB.bestSituations.slice(0, 2).join(", ") || "Standard situations",
  };
}

// ============================================
// Helper Functions
// ============================================

function getConceptById(id: string): Concept | undefined {
  return getPassConceptById(id) || getRunConceptById(id);
}

export function getComparableConcepts(
  conceptId: string,
  limit: number = 5
): { id: string; name: string; type: ConceptType }[] {
  const concept = getConceptById(conceptId);
  if (!concept) return [];

  // Find similar concepts of the same type
  const allConcepts = concept.conceptType === "run" ? RUN_CONCEPTS : PASS_CONCEPTS;

  return allConcepts
    .filter((c) => c.id !== conceptId)
    .filter((c) => {
      // Prefer same category
      if (concept.conceptType === "pass") {
        return c.passHints?.category === concept.passHints?.category;
      } else {
        return c.runHints?.category === concept.runHints?.category;
      }
    })
    .slice(0, limit)
    .map((c) => ({ id: c.id, name: c.name, type: c.conceptType }));
}

// ============================================
// Export
// ============================================

export default {
  compareConcepts,
  getComparableConcepts,
};
