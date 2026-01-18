// ============================================
// Self Scout / Tendencies Analysis Engine
// Analyzes playbook tendencies and generates coaching insights
// ============================================

import type { Play, Formation, ConceptType } from "@/domain/dsl/types";
import { getPassConceptById } from "./concepts-pass";
import { getRunConceptById } from "./concepts-run";

// ============================================
// Helper: Determine play type from concept
// ============================================

function getPlayType(play: Play): "run" | "pass" | "unknown" {
  const conceptId = play.meta?.conceptId;
  if (!conceptId) return "unknown";

  // Check if it's a run concept
  if (getRunConceptById(conceptId)) return "run";

  // Check if it's a pass concept
  if (getPassConceptById(conceptId)) return "pass";

  // Fallback: check conceptId prefix
  if (conceptId.startsWith("run_")) return "run";
  if (conceptId.startsWith("pass_")) return "pass";

  return "unknown";
}

// ============================================
// Types
// ============================================

export interface TendencyBreakdown {
  category: string;
  count: number;
  percentage: number;
  items: { name: string; count: number }[];
}

export interface SituationTendency {
  situation: string;
  playType: {
    run: number;
    pass: number;
    runPct: number;
    passPct: number;
  };
  topFormations: { formationId: string; name: string; count: number }[];
  topConcepts: { conceptId: string; name: string; count: number }[];
  warning?: string;
}

export interface FormationTendency {
  formationId: string;
  formationName: string;
  totalUses: number;
  percentage: number;
  runPct: number;
  passPct: number;
  situations: string[];
  dependencyWarning?: string;
}

export interface CoachingPoint {
  type: "warning" | "suggestion" | "strength";
  title: string;
  description: string;
  metric?: string;
  actionable?: string;
}

export interface SelfScoutResult {
  // Overview
  totalPlays: number;
  runPassRatio: {
    run: number;
    pass: number;
    runPct: number;
    passPct: number;
  };

  // Tendencies
  formationTendencies: FormationTendency[];
  conceptTendencies: TendencyBreakdown;
  personnelTendencies: TendencyBreakdown;
  situationTendencies: SituationTendency[];

  // Insights
  coachingPoints: CoachingPoint[];
  predictabilityScore: number; // 0-100, higher = more predictable (bad)
  balanceScore: number; // 0-100, higher = more balanced (good)
}

// ============================================
// Main Analysis Function
// ============================================

export function analyzeTendencies(plays: Play[]): SelfScoutResult {
  if (plays.length === 0) {
    return createEmptyResult();
  }

  // Basic counts
  const runPlays = plays.filter((p) => getPlayType(p) === "run");
  const passPlays = plays.filter((p) => getPlayType(p) === "pass");

  const runPassRatio = {
    run: runPlays.length,
    pass: passPlays.length,
    runPct: Math.round((runPlays.length / plays.length) * 100),
    passPct: Math.round((passPlays.length / plays.length) * 100),
  };

  // Analyze tendencies
  const formationTendencies = analyzeFormationTendencies(plays);
  const conceptTendencies = analyzeConceptTendencies(plays);
  const personnelTendencies = analyzePersonnelTendencies(plays);
  const situationTendencies = analyzeSituationTendencies(plays);

  // Generate coaching insights
  const coachingPoints = generateCoachingPoints(
    plays,
    runPassRatio,
    formationTendencies,
    conceptTendencies,
    situationTendencies
  );

  // Calculate scores
  const predictabilityScore = calculatePredictabilityScore(
    formationTendencies,
    runPassRatio,
    situationTendencies
  );
  const balanceScore = calculateBalanceScore(runPassRatio, formationTendencies);

  return {
    totalPlays: plays.length,
    runPassRatio,
    formationTendencies,
    conceptTendencies,
    personnelTendencies,
    situationTendencies,
    coachingPoints,
    predictabilityScore,
    balanceScore,
  };
}

// ============================================
// Formation Tendency Analysis
// ============================================

function analyzeFormationTendencies(plays: Play[]): FormationTendency[] {
  const formationMap = new Map<
    string,
    {
      name: string;
      total: number;
      run: number;
      pass: number;
      situations: Set<string>;
    }
  >();

  for (const play of plays) {
    const formationId = play.meta?.formationId || "unknown";
    const formationName = play.meta?.formationId?.replace("formation_", "") || "Unknown";
    const playType = getPlayType(play);

    if (!formationMap.has(formationId)) {
      formationMap.set(formationId, {
        name: formationName,
        total: 0,
        run: 0,
        pass: 0,
        situations: new Set(),
      });
    }

    const entry = formationMap.get(formationId)!;
    entry.total++;
    if (playType === "run") entry.run++;
    if (playType === "pass") entry.pass++;

    // Track situations from tags if available
    if (play.tags) {
      for (const tag of play.tags) {
        if (tag.includes("down") || tag.includes("zone") || tag.includes("goal")) {
          entry.situations.add(tag);
        }
      }
    }
  }

  // Convert to array and calculate percentages
  const totalPlays = plays.length;
  const tendencies: FormationTendency[] = [];

  for (const [formationId, data] of formationMap) {
    const percentage = Math.round((data.total / totalPlays) * 100);
    const runPct = data.total > 0 ? Math.round((data.run / data.total) * 100) : 0;
    const passPct = data.total > 0 ? Math.round((data.pass / data.total) * 100) : 0;

    // Check for over-dependency
    let dependencyWarning: string | undefined;
    if (percentage > 40) {
      dependencyWarning = `Heavy reliance (${percentage}%) - opponents will key on this`;
    } else if (runPct > 80) {
      dependencyWarning = `Run-heavy (${runPct}%) from this formation - predictable`;
    } else if (passPct > 80) {
      dependencyWarning = `Pass-heavy (${passPct}%) from this formation - predictable`;
    }

    tendencies.push({
      formationId,
      formationName: data.name,
      totalUses: data.total,
      percentage,
      runPct,
      passPct,
      situations: Array.from(data.situations),
      dependencyWarning,
    });
  }

  // Sort by usage
  return tendencies.sort((a, b) => b.totalUses - a.totalUses);
}

// ============================================
// Concept Tendency Analysis
// ============================================

function analyzeConceptTendencies(plays: Play[]): TendencyBreakdown {
  const conceptMap = new Map<string, number>();

  for (const play of plays) {
    const conceptId = play.meta?.conceptId || "custom";
    conceptMap.set(conceptId, (conceptMap.get(conceptId) || 0) + 1);
  }

  const items = Array.from(conceptMap.entries())
    .map(([name, count]) => ({ name: name.replace("concept_", "").replace("run_", "").replace("pass_", ""), count }))
    .sort((a, b) => b.count - a.count);

  const totalPlays = plays.length;

  return {
    category: "Concepts",
    count: conceptMap.size,
    percentage: 100,
    items,
  };
}

// ============================================
// Personnel Tendency Analysis
// ============================================

function analyzePersonnelTendencies(plays: Play[]): TendencyBreakdown {
  const personnelMap = new Map<string, number>();

  for (const play of plays) {
    // Extract personnel from formation metadata
    const personnel = play.meta?.personnel || "11";
    personnelMap.set(personnel, (personnelMap.get(personnel) || 0) + 1);
  }

  const totalPlays = plays.length;
  const items = Array.from(personnelMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    category: "Personnel",
    count: personnelMap.size,
    percentage: 100,
    items,
  };
}

// ============================================
// Situation Tendency Analysis
// ============================================

function analyzeSituationTendencies(plays: Play[]): SituationTendency[] {
  const situations = ["1st_down", "2nd_short", "2nd_long", "3rd_short", "3rd_long", "redzone", "goal_line"];

  return situations.map((situation) => {
    // Filter plays for this situation (using tags)
    const situationPlays = plays.filter((p) => {
      const tags = p.tags || [];
      return tags.some((tag) => tag.toLowerCase().includes(situation.replace("_", "")));
    });

    // If no specific tags, use all plays for general analysis
    const targetPlays = situationPlays.length > 0 ? situationPlays : plays;
    const runPlays = targetPlays.filter((p) => getPlayType(p) === "run");
    const passPlays = targetPlays.filter((p) => getPlayType(p) === "pass");

    // Formation counts
    const formationCounts = new Map<string, { id: string; name: string; count: number }>();
    for (const play of targetPlays) {
      const id = play.meta?.formationId || "unknown";
      if (!formationCounts.has(id)) {
        formationCounts.set(id, { id, name: id.replace("formation_", ""), count: 0 });
      }
      formationCounts.get(id)!.count++;
    }

    // Concept counts
    const conceptCounts = new Map<string, { id: string; name: string; count: number }>();
    for (const play of targetPlays) {
      const id = play.meta?.conceptId || "custom";
      if (!conceptCounts.has(id)) {
        conceptCounts.set(id, {
          id,
          name: id.replace("concept_", "").replace("run_", "").replace("pass_", ""),
          count: 0,
        });
      }
      conceptCounts.get(id)!.count++;
    }

    const topFormations = Array.from(formationCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((f) => ({ formationId: f.id, name: f.name, count: f.count }));

    const topConcepts = Array.from(conceptCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((c) => ({ conceptId: c.id, name: c.name, count: c.count }));

    // Check for predictable patterns
    let warning: string | undefined;
    const total = targetPlays.length;
    if (total > 0) {
      const runPct = Math.round((runPlays.length / total) * 100);
      if (situation === "3rd_long" && runPct > 30) {
        warning = "Running too much on 3rd & long";
      } else if (situation === "goal_line" && runPct < 50) {
        warning = "Passing too much in goal line";
      } else if (runPct > 75 || runPct < 25) {
        warning = `Tendency: ${runPct > 50 ? "Run" : "Pass"} heavy (${Math.max(runPct, 100 - runPct)}%)`;
      }
    }

    return {
      situation: situation.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      playType: {
        run: runPlays.length,
        pass: passPlays.length,
        runPct: total > 0 ? Math.round((runPlays.length / total) * 100) : 0,
        passPct: total > 0 ? Math.round((passPlays.length / total) * 100) : 0,
      },
      topFormations,
      topConcepts,
      warning,
    };
  });
}

// ============================================
// Coaching Points Generation
// ============================================

function generateCoachingPoints(
  plays: Play[],
  runPassRatio: { run: number; pass: number; runPct: number; passPct: number },
  formationTendencies: FormationTendency[],
  conceptTendencies: TendencyBreakdown,
  situationTendencies: SituationTendency[]
): CoachingPoint[] {
  const points: CoachingPoint[] = [];

  // 1. Run/Pass balance
  if (runPassRatio.runPct > 65) {
    points.push({
      type: "warning",
      title: "Run Heavy Tendency",
      description: `Your playbook is ${runPassRatio.runPct}% run plays. Defenses may stack the box.`,
      metric: `${runPassRatio.run} runs / ${runPassRatio.pass} passes`,
      actionable: "Consider adding more quick passing concepts to keep defenses honest.",
    });
  } else if (runPassRatio.passPct > 65) {
    points.push({
      type: "warning",
      title: "Pass Heavy Tendency",
      description: `Your playbook is ${runPassRatio.passPct}% pass plays. This may invite pressure.`,
      metric: `${runPassRatio.pass} passes / ${runPassRatio.run} runs`,
      actionable: "Add more run concepts to balance the attack and set up play action.",
    });
  } else {
    points.push({
      type: "strength",
      title: "Balanced Run/Pass",
      description: "Your playbook has a good run/pass balance, making you less predictable.",
      metric: `${runPassRatio.runPct}% run / ${runPassRatio.passPct}% pass`,
    });
  }

  // 2. Formation dependency
  const topFormation = formationTendencies[0];
  if (topFormation && topFormation.percentage > 35) {
    points.push({
      type: "warning",
      title: `Heavy ${topFormation.formationName} Usage`,
      description: `You use ${topFormation.formationName} ${topFormation.percentage}% of the time. Opponents will prepare for this.`,
      metric: `${topFormation.totalUses} plays from this formation`,
      actionable: "Diversify formations or use this formation as a disguise with varied play calls.",
    });
  }

  // 3. Formation tendency within specific formations
  for (const formation of formationTendencies.slice(0, 3)) {
    if (formation.runPct > 80 && formation.totalUses >= 5) {
      points.push({
        type: "warning",
        title: `${formation.formationName}: Run Tendency`,
        description: `You run ${formation.runPct}% of the time from ${formation.formationName}.`,
        actionable: "Add pass plays from this formation to keep defense guessing.",
      });
    } else if (formation.passPct > 80 && formation.totalUses >= 5) {
      points.push({
        type: "warning",
        title: `${formation.formationName}: Pass Tendency`,
        description: `You pass ${formation.passPct}% of the time from ${formation.formationName}.`,
        actionable: "Add run plays from this formation to balance the attack.",
      });
    }
  }

  // 4. Concept variety
  const uniqueConcepts = conceptTendencies.items.length;
  if (uniqueConcepts < 5 && plays.length > 10) {
    points.push({
      type: "suggestion",
      title: "Limited Concept Variety",
      description: `You only have ${uniqueConcepts} unique concepts. More variety makes you harder to scout.`,
      actionable: "Explore additional concepts that fit your personnel.",
    });
  } else if (uniqueConcepts >= 10) {
    points.push({
      type: "strength",
      title: "Good Concept Variety",
      description: `${uniqueConcepts} different concepts give you options in any situation.`,
    });
  }

  // 5. Situation-specific warnings
  for (const situation of situationTendencies) {
    if (situation.warning) {
      points.push({
        type: "warning",
        title: `${situation.situation} Tendency`,
        description: situation.warning,
        metric: `${situation.playType.runPct}% run / ${situation.playType.passPct}% pass`,
      });
    }
  }

  return points;
}

// ============================================
// Score Calculations
// ============================================

function calculatePredictabilityScore(
  formationTendencies: FormationTendency[],
  runPassRatio: { runPct: number; passPct: number },
  situationTendencies: SituationTendency[]
): number {
  let score = 0;

  // Formation concentration (higher = more predictable)
  const topFormationPct = formationTendencies[0]?.percentage || 0;
  score += Math.min(topFormationPct, 50); // Max 50 points

  // Run/pass imbalance
  const imbalance = Math.abs(runPassRatio.runPct - 50);
  score += Math.min(imbalance, 25); // Max 25 points

  // Situational predictability
  const warningCount = situationTendencies.filter((s) => s.warning).length;
  score += warningCount * 5; // 5 points per warning

  return Math.min(100, Math.round(score));
}

function calculateBalanceScore(
  runPassRatio: { runPct: number; passPct: number },
  formationTendencies: FormationTendency[]
): number {
  let score = 100;

  // Run/pass balance (closer to 50/50 = better)
  const rpImbalance = Math.abs(runPassRatio.runPct - 50);
  score -= rpImbalance; // Deduct for imbalance

  // Formation variety (more spread = better)
  const topFormationPct = formationTendencies[0]?.percentage || 0;
  if (topFormationPct > 40) {
    score -= (topFormationPct - 40);
  }

  // Formation run/pass balance
  const warningCount = formationTendencies.filter((f) => f.dependencyWarning).length;
  score -= warningCount * 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ============================================
// Helpers
// ============================================

function createEmptyResult(): SelfScoutResult {
  return {
    totalPlays: 0,
    runPassRatio: { run: 0, pass: 0, runPct: 0, passPct: 0 },
    formationTendencies: [],
    conceptTendencies: { category: "Concepts", count: 0, percentage: 0, items: [] },
    personnelTendencies: { category: "Personnel", count: 0, percentage: 0, items: [] },
    situationTendencies: [],
    coachingPoints: [
      {
        type: "suggestion",
        title: "No Plays to Analyze",
        description: "Add plays to your playbook to see tendencies and coaching insights.",
      },
    ],
    predictabilityScore: 0,
    balanceScore: 100,
  };
}

// ============================================
// Export
// ============================================

export default {
  analyzeTendencies,
};
