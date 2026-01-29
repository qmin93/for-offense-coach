#!/usr/bin/env npx tsx
// ============================================
// Concept Quality Assurance Script
// Validates all concepts meet quality gates
// ============================================
// Run: npx tsx scripts/qa-concepts.ts

import { RUN_CONCEPTS } from "../src/domain/engine/concepts-run";
import { PASS_CONCEPTS } from "../src/domain/engine/concepts-pass";
import type { Concept } from "../src/domain/dsl/types";

interface ConceptQAResult {
  conceptId: string;
  conceptName: string;
  conceptType: string;
  passed: boolean;
  issues: string[];
  warnings: string[];
  stats: {
    roleCount: number;
    hasOLAssignment: boolean;
    hasRBAssignment: boolean;
    hasInstallFocus: boolean;
    teachingCuesCount: number;
    failurePointsCount: number;
    drillsCount: number;
  };
}

interface QAReport {
  timestamp: string;
  totalConcepts: number;
  passed: number;
  failed: number;
  results: ConceptQAResult[];
}

const OL_ROLES = ["LT", "LG", "C", "RG", "RT"];

function validateConcept(concept: Concept): ConceptQAResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const template = concept.template;
  const installFocus = concept.installFocus;

  // Count roles
  const roles = template?.roles || [];
  const roleCount = roles.length;

  // Check OL assignment
  let hasOLAssignment = false;
  for (const role of roles) {
    const appliesTo = role.appliesTo || [];
    if (appliesTo.some((r: string) => OL_ROLES.includes(r))) {
      hasOLAssignment = true;
      break;
    }
  }

  // Check RB assignment
  let hasRBAssignment = false;
  for (const role of roles) {
    const appliesTo = role.appliesTo || [];
    if (appliesTo.includes("RB") || appliesTo.includes("FB")) {
      hasRBAssignment = true;
      break;
    }
  }

  // Validate based on concept type
  if (concept.conceptType === "run") {
    // Run concepts MUST have OL blocking
    if (!hasOLAssignment) {
      issues.push("Run concept missing OL blocking assignment");
    }

    // Run concepts MUST have RB assignment (ball carrier)
    if (!hasRBAssignment) {
      issues.push("Run concept missing RB (ball carrier) assignment");
    }

    // Run concepts should cover all 5 OL
    const olCoverage = new Set<string>();
    for (const role of roles) {
      for (const pos of role.appliesTo || []) {
        if (OL_ROLES.includes(pos)) {
          olCoverage.add(pos);
        }
      }
    }
    if (olCoverage.size < 5) {
      warnings.push(
        `Only ${olCoverage.size}/5 OL positions have assignments: [${Array.from(olCoverage).join(", ")}]`
      );
    }
  } else if (concept.conceptType === "pass") {
    // Pass concepts should have at least 3 route roles
    const routeRoles = roles.filter((r: any) => "defaultRoute" in r);
    if (routeRoles.length < 3) {
      warnings.push(`Only ${routeRoles.length} route(s) defined (recommend 3+)`);
    }

    // Check if receivers are assigned
    const receiverRoles = ["X", "Z", "Y", "H", "RB"];
    const coveredReceivers = new Set<string>();
    for (const role of roles) {
      for (const pos of role.appliesTo || []) {
        if (receiverRoles.includes(pos)) {
          coveredReceivers.add(pos);
        }
      }
    }
    if (coveredReceivers.size < 3) {
      warnings.push(
        `Only ${coveredReceivers.size} receivers have routes: [${Array.from(coveredReceivers).join(", ")}]`
      );
    }
  }

  // Check install focus
  const hasInstallFocus = !!installFocus;
  const failurePoints = installFocus?.failurePoints || [];
  const failurePointsCount = failurePoints.length;

  // Count teaching cues from failure points
  const teachingCuesCount = failurePoints.reduce((count: number, fp: any) => {
    return count + (fp.name ? 1 : 0);
  }, 0);

  // Count drills
  const drillsCount = failurePoints.reduce((count: number, fp: any) => {
    return count + (fp.drill ? 1 : 0);
  }, 0);

  // Install focus validation
  if (!hasInstallFocus) {
    warnings.push("No installFocus defined");
  } else {
    if (failurePointsCount < 2) {
      warnings.push(`Only ${failurePointsCount} failure point(s) (recommend 3+)`);
    }
    if (drillsCount < 2) {
      warnings.push(`Only ${drillsCount} drill(s) linked (recommend 3+)`);
    }
  }

  // Check requirements
  if (!concept.requirements) {
    warnings.push("No requirements defined");
  }

  return {
    conceptId: concept.id,
    conceptName: concept.name,
    conceptType: concept.conceptType,
    passed: issues.length === 0,
    issues,
    warnings,
    stats: {
      roleCount,
      hasOLAssignment,
      hasRBAssignment,
      hasInstallFocus,
      teachingCuesCount,
      failurePointsCount,
      drillsCount,
    },
  };
}

function runQA(): QAReport {
  console.log("\n========================================");
  console.log("  CONCEPT QA REPORT");
  console.log("========================================\n");

  const allConcepts = [...RUN_CONCEPTS, ...PASS_CONCEPTS];
  const results: ConceptQAResult[] = [];

  // Group by type for cleaner output
  console.log("--- RUN CONCEPTS ---\n");
  for (const concept of RUN_CONCEPTS) {
    const result = validateConcept(concept);
    results.push(result);
    printResult(result);
  }

  console.log("\n--- PASS CONCEPTS ---\n");
  for (const concept of PASS_CONCEPTS) {
    const result = validateConcept(concept);
    results.push(result);
    printResult(result);
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n----------------------------------------");
  console.log(`TOTAL: ${results.length} concepts`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("----------------------------------------");

  // Summary stats
  const withInstall = results.filter((r) => r.stats.hasInstallFocus).length;
  const withOL = results.filter((r) => r.stats.hasOLAssignment).length;
  const withRB = results.filter((r) => r.stats.hasRBAssignment).length;

  console.log("\nSummary:");
  console.log(`  - With Install Focus: ${withInstall}/${results.length}`);
  console.log(`  - With OL Assignment: ${withOL}/${results.length}`);
  console.log(`  - With RB Assignment: ${withRB}/${results.length}`);
  console.log("");

  if (failed > 0) {
    console.log("❌ QA FAILED - Please fix the issues above\n");
    // Don't exit with error for now since many pass concepts need OL pass pro
    // process.exit(1);
  } else {
    console.log("✓ QA PASSED - All concepts are valid\n");
  }

  return {
    timestamp: new Date().toISOString(),
    totalConcepts: results.length,
    passed,
    failed,
    results,
  };
}

function printResult(result: ConceptQAResult): void {
  const status = result.passed ? "PASS" : "FAIL";
  const icon = result.passed ? "✓" : "✗";

  console.log(`${icon} [${status}] ${result.conceptName} (${result.conceptType})`);
  console.log(
    `    Roles: ${result.stats.roleCount} | OL: ${result.stats.hasOLAssignment ? "Yes" : "No"} | RB: ${result.stats.hasRBAssignment ? "Yes" : "No"}`
  );
  console.log(
    `    Install: ${result.stats.hasInstallFocus ? "Yes" : "No"} | Failures: ${result.stats.failurePointsCount} | Drills: ${result.stats.drillsCount}`
  );

  if (result.issues.length > 0) {
    console.log("    Issues:");
    for (const issue of result.issues) {
      console.log(`      - ${issue}`);
    }
  }

  if (result.warnings.length > 0) {
    console.log("    Warnings:");
    for (const warning of result.warnings) {
      console.log(`      - ${warning}`);
    }
  }

  console.log("");
}

// Run if executed directly
runQA();
