#!/usr/bin/env npx tsx
// ============================================
// Formation & Concept Integrity Audit Script
// Run: npx tsx scripts/audit-assets.ts
// ============================================

import { FORMATIONS } from "../src/domain/engine/formations";
import { RUN_CONCEPTS } from "../src/domain/engine/concepts-run";
import { PASS_CONCEPTS } from "../src/domain/engine/concepts-pass";
import type {
  Formation,
  Concept,
  Player,
  OffenseRole,
  PlayerRole
} from "../src/domain/dsl/types";
import * as fs from "fs";
import * as path from "path";

// ============================================
// Types
// ============================================

interface AuditIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  itemId: string;
  itemType: "formation" | "concept";
  details?: Record<string, unknown>;
}

interface AuditReport {
  timestamp: string;
  totalFormations: number;
  totalConcepts: number;
  passedFormations: number;
  passedConcepts: number;
  issues: AuditIssue[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
}

// ============================================
// Constants
// ============================================

const CORE_ROLES: OffenseRole[] = ["QB", "C", "LT", "LG", "RG", "RT"];
const OL_ROLES: OffenseRole[] = ["LT", "LG", "C", "RG", "RT"];
const UNIQUE_ROLES: OffenseRole[] = ["QB", "C", "LT", "LG", "RG", "RT"];

const MIN_OFF_LOS_DEPTH_YARDS = 0.75;
const MAX_OFF_LOS_DEPTH_YARDS = 7.0;
const MIN_OUTSIDE_SPLIT = 0.12; // normalized x from tackle
const MIN_SLOT_INSIDE_GAP = 0.04; // slot must be this much inside of outside WR

// ============================================
// Formation Audit Rules
// ============================================

function auditFormation(formation: Formation): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const players = formation.defaults.players;
  const formationId = formation.id;

  // A1: Formation must have exactly 11 players
  if (players.length !== 11) {
    issues.push({
      severity: "error",
      code: "A1_PLAYER_COUNT",
      message: `Formation has ${players.length} players, expected 11`,
      itemId: formationId,
      itemType: "formation",
      details: { playerCount: players.length },
    });
  }

  // A1: Check for required core roles
  const roles = players.map((p) => p.role);
  for (const coreRole of CORE_ROLES) {
    if (!roles.includes(coreRole)) {
      issues.push({
        severity: "error",
        code: "A1_MISSING_CORE_ROLE",
        message: `Missing required role: ${coreRole}`,
        itemId: formationId,
        itemType: "formation",
        details: { missingRole: coreRole },
      });
    }
  }

  // A2: Check for unique role constraints
  for (const uniqueRole of UNIQUE_ROLES) {
    const count = roles.filter((r) => r === uniqueRole).length;
    if (count > 1) {
      issues.push({
        severity: "error",
        code: "A2_DUPLICATE_UNIQUE_ROLE",
        message: `Role ${uniqueRole} appears ${count} times, expected max 1`,
        itemId: formationId,
        itemType: "formation",
        details: { role: uniqueRole, count },
      });
    }
  }

  // A1: Check for duplicate player IDs
  const playerIds = players.map((p) => p.id);
  const uniqueIds = new Set(playerIds);
  if (uniqueIds.size !== playerIds.length) {
    const duplicates = playerIds.filter((id, idx) => playerIds.indexOf(id) !== idx);
    issues.push({
      severity: "error",
      code: "A1_DUPLICATE_PLAYER_ID",
      message: `Duplicate player IDs found: ${duplicates.join(", ")}`,
      itemId: formationId,
      itemType: "formation",
      details: { duplicates },
    });
  }

  // A3: LOS constraints
  for (const player of players) {
    const { alignment, role, id } = player;
    const isOL = OL_ROLES.includes(role as OffenseRole);

    // A3-1: If onLOS=true, y should be near 0
    if (alignment.onLOS === true) {
      if (Math.abs(alignment.y) > 0.05) {
        issues.push({
          severity: "warning",
          code: "A3_LOS_Y_MISMATCH",
          message: `Player ${id} (${role}) is marked onLOS but y=${alignment.y.toFixed(3)}`,
          itemId: formationId,
          itemType: "formation",
          details: { playerId: id, role, y: alignment.y, onLOS: true },
        });
      }
    }

    // A3-1: If onLOS=false, check depth
    if (alignment.onLOS === false && !isOL) {
      const depthYards = alignment.depthYards ?? 0;
      if (depthYards < MIN_OFF_LOS_DEPTH_YARDS && depthYards > 0) {
        issues.push({
          severity: "warning",
          code: "A3_INSUFFICIENT_DEPTH",
          message: `Player ${id} (${role}) off LOS but depth=${depthYards} (min ${MIN_OFF_LOS_DEPTH_YARDS})`,
          itemId: formationId,
          itemType: "formation",
          details: { playerId: id, role, depthYards, minRequired: MIN_OFF_LOS_DEPTH_YARDS },
        });
      }
      if (depthYards > MAX_OFF_LOS_DEPTH_YARDS) {
        issues.push({
          severity: "warning",
          code: "A3_EXCESSIVE_DEPTH",
          message: `Player ${id} (${role}) depth=${depthYards} exceeds max ${MAX_OFF_LOS_DEPTH_YARDS}`,
          itemId: formationId,
          itemType: "formation",
          details: { playerId: id, role, depthYards, maxAllowed: MAX_OFF_LOS_DEPTH_YARDS },
        });
      }
    }
  }

  // A3-2: Doubles-specific validity
  const structure = formation.meta?.structure;
  if (structure === "2x2") {
    // Find receivers by position (left/right of center 0.5)
    const receivers = players.filter((p) =>
      ["X", "Y", "Z", "H"].includes(p.role)
    );

    const leftReceivers = receivers.filter((p) => p.alignment.x < 0.5);
    const rightReceivers = receivers.filter((p) => p.alignment.x > 0.5);

    if (leftReceivers.length !== 2) {
      issues.push({
        severity: "warning",
        code: "A3_2x2_LEFT_COUNT",
        message: `2x2 formation has ${leftReceivers.length} receivers left (expected 2)`,
        itemId: formationId,
        itemType: "formation",
        details: { leftCount: leftReceivers.length, receivers: leftReceivers.map(r => r.role) },
      });
    }

    if (rightReceivers.length !== 2) {
      issues.push({
        severity: "warning",
        code: "A3_2x2_RIGHT_COUNT",
        message: `2x2 formation has ${rightReceivers.length} receivers right (expected 2)`,
        itemId: formationId,
        itemType: "formation",
        details: { rightCount: rightReceivers.length, receivers: rightReceivers.map(r => r.role) },
      });
    }

    // Check slot receivers are off LOS
    const slotReceivers = receivers.filter((p) =>
      p.alignment.splitPreset === "slot" || ["H", "Y"].includes(p.role)
    );
    for (const slot of slotReceivers) {
      if (slot.alignment.onLOS === true) {
        issues.push({
          severity: "warning",
          code: "A3_SLOT_ON_LOS",
          message: `Slot receiver ${slot.role} should be off LOS in 2x2`,
          itemId: formationId,
          itemType: "formation",
          details: { playerId: slot.id, role: slot.role },
        });
      }
      const depth = slot.alignment.depthYards ?? 0;
      if (depth < MIN_OFF_LOS_DEPTH_YARDS) {
        issues.push({
          severity: "warning",
          code: "A3_SLOT_DEPTH",
          message: `Slot ${slot.role} depth=${depth} (min ${MIN_OFF_LOS_DEPTH_YARDS})`,
          itemId: formationId,
          itemType: "formation",
          details: { playerId: slot.id, role: slot.role, depth },
        });
      }
    }

    // Check horizontal spacing - outside vs slot
    for (const side of ["left", "right"] as const) {
      const sideReceivers = side === "left" ? leftReceivers : rightReceivers;
      if (sideReceivers.length === 2) {
        const sorted = [...sideReceivers].sort((a, b) =>
          side === "left" ? a.alignment.x - b.alignment.x : b.alignment.x - a.alignment.x
        );
        const outside = sorted[0];
        const slot = sorted[1];

        const gap = Math.abs(outside.alignment.x - slot.alignment.x);
        if (gap < MIN_SLOT_INSIDE_GAP) {
          issues.push({
            severity: "warning",
            code: "A3_SLOT_SPACING",
            message: `${side} side slot/outside gap=${gap.toFixed(3)} (min ${MIN_SLOT_INSIDE_GAP})`,
            itemId: formationId,
            itemType: "formation",
            details: { side, gap, outside: outside.role, slot: slot.role },
          });
        }
      }
    }
  }

  // A4: Personnel badge validation (check meta)
  const personnel = formation.meta?.personnelHint;
  if (personnel && personnel.length > 0) {
    // Count RBs/TEs/FBs
    const rbCount = roles.filter((r) => r === "RB" || r === "FB").length;
    const teCount = roles.filter((r) => r === "Y" &&
      players.find(p => p.role === r)?.label?.includes("TE")
    ).length;

    // This is info-level since personnel hints are flexible
    if (formation.meta?.structure === "I" && rbCount < 2) {
      issues.push({
        severity: "info",
        code: "A4_PERSONNEL_MISMATCH",
        message: `I-formation typically needs FB+RB, found ${rbCount} backs`,
        itemId: formationId,
        itemType: "formation",
        details: { structure: "I", rbCount },
      });
    }
  }

  return issues;
}

// ============================================
// Concept Audit Rules
// ============================================

function auditConcept(concept: Concept): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const conceptId = concept.id;
  const template = concept.template;
  const roles = template.roles;

  // B1: Check for full unit behavior
  if (concept.conceptType === "run") {
    // Run concepts must have OL blocking
    const olRoles = roles.filter((r) => {
      const appliesTo = r.appliesTo as PlayerRole[];
      return OL_ROLES.some((olRole) => appliesTo.includes(olRole));
    });

    if (olRoles.length === 0) {
      issues.push({
        severity: "error",
        code: "B1_NO_OL_BLOCKING",
        message: `Run concept has no OL blocking assignments`,
        itemId: conceptId,
        itemType: "concept",
      });
    }

    // Check OL coverage - all 5 should have assignments
    const coveredOL = new Set<string>();
    for (const role of roles) {
      const appliesTo = role.appliesTo as PlayerRole[];
      for (const olPos of OL_ROLES) {
        if (appliesTo.includes(olPos)) {
          coveredOL.add(olPos);
        }
      }
    }

    const missingOL = OL_ROLES.filter((ol) => !coveredOL.has(ol));
    if (missingOL.length > 0) {
      issues.push({
        severity: "warning",
        code: "B1_INCOMPLETE_OL",
        message: `Run concept missing OL assignments for: ${missingOL.join(", ")}`,
        itemId: conceptId,
        itemType: "concept",
        details: { missingOL },
      });
    }

    // Run concepts should have RB/ball carrier assignment
    const hasBallCarrier = roles.some((r) => {
      const appliesTo = r.appliesTo as PlayerRole[];
      return r.roleName === "BALL" ||
             appliesTo.includes("RB") ||
             appliesTo.includes("QB");
    });

    if (!hasBallCarrier) {
      issues.push({
        severity: "warning",
        code: "B1_NO_BALL_CARRIER",
        message: `Run concept has no explicit ball carrier assignment`,
        itemId: conceptId,
        itemType: "concept",
      });
    }
  }

  if (concept.conceptType === "pass") {
    // Pass concepts must have route assignments
    const routeRoles = roles.filter((r) =>
      "defaultRoute" in r
    );

    if (routeRoles.length === 0) {
      issues.push({
        severity: "error",
        code: "B1_NO_ROUTES",
        message: `Pass concept has no route assignments`,
        itemId: conceptId,
        itemType: "concept",
      });
    }

    // Pass concepts should have at least 3-5 eligible receivers with routes
    const eligibleRoles: PlayerRole[] = ["X", "Y", "Z", "H", "RB", "FB"];
    const coveredEligible = new Set<string>();
    for (const role of routeRoles) {
      const appliesTo = role.appliesTo as PlayerRole[];
      for (const elig of eligibleRoles) {
        if (appliesTo.includes(elig)) {
          coveredEligible.add(elig);
        }
      }
    }

    if (coveredEligible.size < 3) {
      issues.push({
        severity: "warning",
        code: "B1_FEW_ROUTES",
        message: `Pass concept only covers ${coveredEligible.size} eligible receivers`,
        itemId: conceptId,
        itemType: "concept",
        details: { coveredReceivers: Array.from(coveredEligible) },
      });
    }

    // Check for protection
    const hasProtection = roles.some((r) => {
      const appliesTo = r.appliesTo as PlayerRole[];
      return OL_ROLES.some((ol) => appliesTo.includes(ol)) && "defaultBlock" in r;
    });

    if (!hasProtection) {
      issues.push({
        severity: "warning",
        code: "B1_NO_PROTECTION",
        message: `Pass concept has no OL protection assignments`,
        itemId: conceptId,
        itemType: "concept",
      });
    }
  }

  // B2: Mirroring / strength handling
  const buildPolicy = template.buildPolicy;
  if (!buildPolicy?.defaultSide) {
    // This is info-level since some concepts are balanced
    issues.push({
      severity: "info",
      code: "B2_NO_DEFAULT_SIDE",
      message: `Concept has no explicit defaultSide (assumes right)`,
      itemId: conceptId,
      itemType: "concept",
    });
  }

  // Check install focus has drills if defined
  if (concept.installFocus) {
    const failurePoints = concept.installFocus.failurePoints || [];
    for (const fp of failurePoints) {
      if (!fp.drill) {
        issues.push({
          severity: "warning",
          code: "E1_MISSING_DRILL",
          message: `Failure point ${fp.id} has no drill defined`,
          itemId: conceptId,
          itemType: "concept",
          details: { failurePointId: fp.id },
        });
      }
    }
  }

  return issues;
}

// ============================================
// Main Audit Runner
// ============================================

function runAudit(): AuditReport {
  const issues: AuditIssue[] = [];

  // Audit all formations
  let passedFormations = 0;
  for (const formation of FORMATIONS) {
    const formationIssues = auditFormation(formation);
    if (formationIssues.filter((i) => i.severity === "error").length === 0) {
      passedFormations++;
    }
    issues.push(...formationIssues);
  }

  // Audit all concepts
  const allConcepts = [...RUN_CONCEPTS, ...PASS_CONCEPTS];
  let passedConcepts = 0;
  for (const concept of allConcepts) {
    const conceptIssues = auditConcept(concept);
    if (conceptIssues.filter((i) => i.severity === "error").length === 0) {
      passedConcepts++;
    }
    issues.push(...conceptIssues);
  }

  // Build report
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    totalFormations: FORMATIONS.length,
    totalConcepts: allConcepts.length,
    passedFormations,
    passedConcepts,
    issues,
    summary: {
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
  };

  return report;
}

// ============================================
// CLI Entry Point
// ============================================

function main() {
  console.log("🔍 Running Formation & Concept Integrity Audit...\n");

  const report = runAudit();

  // Print summary
  console.log("═══════════════════════════════════════════════════");
  console.log("                   AUDIT SUMMARY");
  console.log("═══════════════════════════════════════════════════");
  console.log(`Formations: ${report.passedFormations}/${report.totalFormations} passed`);
  console.log(`Concepts:   ${report.passedConcepts}/${report.totalConcepts} passed`);
  console.log("───────────────────────────────────────────────────");
  console.log(`Errors:   ${report.summary.errors}`);
  console.log(`Warnings: ${report.summary.warnings}`);
  console.log(`Info:     ${report.summary.infos}`);
  console.log("═══════════════════════════════════════════════════\n");

  // Print errors first
  if (report.summary.errors > 0) {
    console.log("❌ ERRORS (must fix):");
    console.log("───────────────────────────────────────────────────");
    for (const issue of report.issues.filter((i) => i.severity === "error")) {
      console.log(`  [${issue.code}] ${issue.itemType}:${issue.itemId}`);
      console.log(`    → ${issue.message}`);
    }
    console.log("");
  }

  // Print warnings
  if (report.summary.warnings > 0) {
    console.log("⚠️  WARNINGS (should review):");
    console.log("───────────────────────────────────────────────────");
    for (const issue of report.issues.filter((i) => i.severity === "warning")) {
      console.log(`  [${issue.code}] ${issue.itemType}:${issue.itemId}`);
      console.log(`    → ${issue.message}`);
    }
    console.log("");
  }

  // Save report to file
  const reportPath = path.join(process.cwd(), "audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Full report saved to: audit-report.json\n`);

  // Exit with error code if there are errors
  if (report.summary.errors > 0) {
    console.log("❌ Audit FAILED - fix errors before shipping\n");
    process.exit(1);
  } else if (report.summary.warnings > 0) {
    console.log("⚠️  Audit PASSED with warnings\n");
    process.exit(0);
  } else {
    console.log("✅ Audit PASSED\n");
    process.exit(0);
  }
}

// Export for runtime use
export { runAudit, auditFormation, auditConcept };
export type { AuditReport, AuditIssue };

// Run if called directly
main();
