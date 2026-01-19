#!/usr/bin/env npx tsx
// ============================================
// Auto-Build Coverage QA Script
// Tests that all 11 players get assignments
// ============================================
// Run: npx tsx scripts/qa-autobuild-coverage.ts

import { RUN_CONCEPTS } from "../src/domain/engine/concepts-run";
import { PASS_CONCEPTS } from "../src/domain/engine/concepts-pass";
import { autoBuildFromConcept } from "../src/domain/engine/auto-build";
import type { Concept, Play, Player } from "../src/domain/dsl/types";

// ============================================
// Sample Formation: 2x2 Spread (11 players)
// ============================================

const SAMPLE_FORMATION_2x2: Player[] = [
  // OL (5)
  { id: "p_lt", role: "LT", label: "LT", unit: "offense", alignment: { x: 0.38, y: 0 } },
  { id: "p_lg", role: "LG", label: "LG", unit: "offense", alignment: { x: 0.44, y: 0 } },
  { id: "p_c", role: "C", label: "C", unit: "offense", alignment: { x: 0.5, y: 0 } },
  { id: "p_rg", role: "RG", label: "RG", unit: "offense", alignment: { x: 0.56, y: 0 } },
  { id: "p_rt", role: "RT", label: "RT", unit: "offense", alignment: { x: 0.62, y: 0 } },
  // QB (1)
  { id: "p_qb", role: "QB", label: "QB", unit: "offense", alignment: { x: 0.5, y: -0.06 } },
  // RB (1)
  { id: "p_rb", role: "RB", label: "RB", unit: "offense", alignment: { x: 0.5, y: -0.12 } },
  // WRs (2) - X left, Z right
  { id: "p_x", role: "X", label: "X", unit: "offense", alignment: { x: 0.1, y: 0 } },
  { id: "p_z", role: "Z", label: "Z", unit: "offense", alignment: { x: 0.9, y: 0 } },
  // TE/Slot (2) - Y right, H left
  { id: "p_y", role: "Y", label: "Y", unit: "offense", alignment: { x: 0.72, y: 0 } },
  { id: "p_h", role: "H", label: "H", unit: "offense", alignment: { x: 0.28, y: 0 } },
];

// Sample formation with FB for I-formation concepts
const SAMPLE_FORMATION_I: Player[] = [
  // OL (5)
  { id: "p_lt", role: "LT", label: "LT", unit: "offense", alignment: { x: 0.38, y: 0 } },
  { id: "p_lg", role: "LG", label: "LG", unit: "offense", alignment: { x: 0.44, y: 0 } },
  { id: "p_c", role: "C", label: "C", unit: "offense", alignment: { x: 0.5, y: 0 } },
  { id: "p_rg", role: "RG", label: "RG", unit: "offense", alignment: { x: 0.56, y: 0 } },
  { id: "p_rt", role: "RT", label: "RT", unit: "offense", alignment: { x: 0.62, y: 0 } },
  // QB (1)
  { id: "p_qb", role: "QB", label: "QB", unit: "offense", alignment: { x: 0.5, y: -0.06 } },
  // FB (1) - in front of RB
  { id: "p_fb", role: "FB", label: "FB", unit: "offense", alignment: { x: 0.5, y: -0.1 } },
  // RB (1) - deep in I
  { id: "p_rb", role: "RB", label: "RB", unit: "offense", alignment: { x: 0.5, y: -0.16 } },
  // WRs (2) - X left, Z right
  { id: "p_x", role: "X", label: "X", unit: "offense", alignment: { x: 0.1, y: 0 } },
  { id: "p_z", role: "Z", label: "Z", unit: "offense", alignment: { x: 0.9, y: 0 } },
  // TE (1)
  { id: "p_y", role: "Y", label: "Y", unit: "offense", alignment: { x: 0.68, y: 0 } },
];

function createSamplePlay(formation: Player[]): Play {
  return {
    schemaVersion: "1.0",
    type: "play",
    id: "test_play",
    name: "Test Play",
    meta: {},
    roster: {
      players: formation,
    },
    actions: [],
    history: {
      version: 1,
    },
  };
}

interface CoverageResult {
  conceptId: string;
  conceptName: string;
  conceptType: string;
  formation: string;
  totalPlayers: number;
  playersWithActions: number;
  coveragePercent: number;
  uncoveredRoles: string[];
  passed: boolean;
}

function testConceptCoverage(concept: Concept, formation: Player[], formationName: string): CoverageResult {
  const play = createSamplePlay(formation);
  const result = autoBuildFromConcept(play, concept, { side: "right" });

  return {
    conceptId: concept.id,
    conceptName: concept.name,
    conceptType: concept.conceptType,
    formation: formationName,
    totalPlayers: result.coverage?.totalPlayers || 0,
    playersWithActions: result.coverage?.playersWithActions || 0,
    coveragePercent: result.coverage?.coveragePercent || 0,
    uncoveredRoles: result.coverage?.uncoveredRoles || [],
    passed: result.coverage?.allCovered || false,
  };
}

function runCoverageQA() {
  console.log("\n========================================");
  console.log("  AUTO-BUILD COVERAGE QA REPORT");
  console.log("  11-Player Assignment Check");
  console.log("========================================\n");

  const results: CoverageResult[] = [];

  // Test RUN concepts with 2x2 formation
  console.log("--- RUN CONCEPTS (2x2 Spread) ---\n");
  for (const concept of RUN_CONCEPTS) {
    const result = testConceptCoverage(concept, SAMPLE_FORMATION_2x2, "2x2");
    results.push(result);
    printCoverageResult(result);
  }

  // Test some RUN concepts with I formation (for FB concepts)
  console.log("\n--- RUN CONCEPTS (I-Formation) ---\n");
  const iFormationConcepts = RUN_CONCEPTS.filter(c =>
    c.requirements?.preferredStructures?.includes("I") ||
    c.template?.roles?.some(r => r.appliesTo.includes("FB"))
  );
  for (const concept of iFormationConcepts) {
    const result = testConceptCoverage(concept, SAMPLE_FORMATION_I, "I-Form");
    results.push(result);
    printCoverageResult(result);
  }

  // Test PASS concepts with 2x2 formation
  console.log("\n--- PASS CONCEPTS (2x2 Spread) ---\n");
  for (const concept of PASS_CONCEPTS) {
    const result = testConceptCoverage(concept, SAMPLE_FORMATION_2x2, "2x2");
    results.push(result);
    printCoverageResult(result);
  }

  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const fullCoverage = results.filter(r => r.coveragePercent === 100).length;
  const avgCoverage = Math.round(results.reduce((sum, r) => sum + r.coveragePercent, 0) / results.length);

  console.log("\n----------------------------------------");
  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`FULL COVERAGE (11/11): ${fullCoverage}`);
  console.log(`PARTIAL COVERAGE: ${results.length - fullCoverage}`);
  console.log(`AVERAGE COVERAGE: ${avgCoverage}%`);
  console.log("----------------------------------------");

  // Common uncovered roles
  const uncoveredRoleCounts: Record<string, number> = {};
  for (const result of results) {
    for (const role of result.uncoveredRoles) {
      uncoveredRoleCounts[role] = (uncoveredRoleCounts[role] || 0) + 1;
    }
  }

  if (Object.keys(uncoveredRoleCounts).length > 0) {
    console.log("\nMost commonly uncovered roles:");
    const sortedRoles = Object.entries(uncoveredRoleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    for (const [role, count] of sortedRoles) {
      console.log(`  - ${role}: ${count} times`);
    }
  }

  if (fullCoverage === results.length) {
    console.log("\n✓ ALL CONCEPTS HAVE 11/11 COVERAGE\n");
  } else {
    console.log(`\n⚠ ${results.length - fullCoverage} concept(s) need coverage improvement\n`);
  }
}

function printCoverageResult(result: CoverageResult) {
  const icon = result.passed ? "✓" : "⚠";
  const coverageBar = "█".repeat(Math.floor(result.coveragePercent / 10)) +
                      "░".repeat(10 - Math.floor(result.coveragePercent / 10));

  console.log(`${icon} ${result.conceptName} (${result.conceptType})`);
  console.log(`    [${coverageBar}] ${result.playersWithActions}/${result.totalPlayers} (${result.coveragePercent}%)`);

  if (result.uncoveredRoles.length > 0) {
    console.log(`    Uncovered: ${result.uncoveredRoles.join(", ")}`);
  }
  console.log("");
}

// Run if executed directly
runCoverageQA();
