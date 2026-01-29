#!/usr/bin/env npx tsx
// ============================================
// Formation Quality Assurance Script
// Validates all formations meet quality gates
// ============================================
// Run: npx tsx scripts/qa-formations.ts

import { FORMATIONS } from "../src/domain/engine/formations";

interface FormationQAResult {
  formationId: string;
  formationName: string;
  passed: boolean;
  playerCount: number;
  issues: string[];
  warnings: string[];
}

interface QAReport {
  timestamp: string;
  totalFormations: number;
  passed: number;
  failed: number;
  results: FormationQAResult[];
}

// Valid player roles
const VALID_ROLES = [
  "QB",
  "RB",
  "FB",
  "X",
  "Z",
  "Y",
  "H",
  "LT",
  "LG",
  "C",
  "RG",
  "RT",
];

// Roles that should be on LOS
const LOS_ROLES = ["LT", "LG", "C", "RG", "RT", "X", "Z"];
// TE (Y) is conditionally on LOS if attached

function validateFormation(formation: (typeof FORMATIONS)[number]): FormationQAResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const players = formation.defaults.players;

  // 1. Check player count === 11
  if (players.length !== 11) {
    issues.push(`Player count: ${players.length} (expected 11)`);
  }

  // 2. Check all roles are valid
  const roles = players.map((p) => p.role);
  for (const role of roles) {
    if (!VALID_ROLES.includes(role)) {
      issues.push(`Invalid role: ${role}`);
    }
  }

  // 3. Check for duplicate roles (excluding allowed duplicates)
  const roleCounts: Record<string, number> = {};
  for (const role of roles) {
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  }

  // OL must be unique
  const olRoles = ["LT", "LG", "C", "RG", "RT"];
  for (const olRole of olRoles) {
    if ((roleCounts[olRole] || 0) !== 1) {
      issues.push(`OL role ${olRole} count: ${roleCounts[olRole] || 0} (expected 1)`);
    }
  }

  // QB must be exactly 1
  if ((roleCounts["QB"] || 0) !== 1) {
    issues.push(`QB count: ${roleCounts["QB"] || 0} (expected 1)`);
  }

  // 4. Check on-LOS count (should be >= 7)
  let onLOSCount = 0;

  // OL is always on LOS
  onLOSCount += players.filter((p) => olRoles.includes(p.role)).length;

  // Wide receivers (X, Z) are typically on LOS
  const wideReceivers = players.filter((p) => ["X", "Z"].includes(p.role));
  for (const wr of wideReceivers) {
    const y = wr.alignment?.y || 0;
    // On LOS if y is close to 0 (within 0.5 yards)
    if (Math.abs(y) < 0.03) {
      onLOSCount++;
    }
  }

  // Y (TE) is on LOS if attached (close to OL)
  const te = players.find((p) => p.role === "Y");
  if (te) {
    const teX = te.alignment?.x || 0.5;
    const teY = te.alignment?.y || 0;
    // TE is attached if x is within ~5 yards of tackle and y is on LOS
    const isAttached = Math.abs(teY) < 0.03 && Math.abs(teX - 0.5) < 0.2;
    if (isAttached) {
      onLOSCount++;
    }
  }

  if (onLOSCount < 7) {
    warnings.push(`On-LOS count: ${onLOSCount} (minimum 7 for legal formation)`);
  }

  // 5. Check depth/stance rules
  for (const player of players) {
    const y = player.alignment?.y || 0;
    const stance = player.alignment?.stance;

    // QB should be in two-point stance
    if (player.role === "QB" && stance !== "two_point") {
      warnings.push(`QB stance: ${stance} (recommend two_point)`);
    }

    // OL should be in three-point stance
    if (olRoles.includes(player.role) && stance !== "three_point") {
      warnings.push(`${player.role} stance: ${stance} (recommend three_point)`);
    }

    // RB/FB should be behind LOS
    if (["RB", "FB"].includes(player.role) && y >= 0) {
      issues.push(`${player.role} is at/ahead of LOS (y=${y.toFixed(3)})`);
    }
  }

  // 6. Check x-coordinate bounds (0-1 range)
  for (const player of players) {
    const x = player.alignment?.x || 0.5;
    if (x < 0 || x > 1) {
      issues.push(`${player.role} x-coordinate out of bounds: ${x}`);
    }
  }

  return {
    formationId: formation.id,
    formationName: formation.name,
    passed: issues.length === 0,
    playerCount: players.length,
    issues,
    warnings,
  };
}

function runQA(): QAReport {
  console.log("\n========================================");
  console.log("  FORMATION QA REPORT");
  console.log("========================================\n");

  const results: FormationQAResult[] = [];

  for (const formation of FORMATIONS) {
    const result = validateFormation(formation);
    results.push(result);

    const status = result.passed ? "PASS" : "FAIL";
    const icon = result.passed ? "✓" : "✗";

    console.log(`${icon} [${status}] ${formation.name} (${formation.id})`);
    console.log(`    Players: ${result.playerCount}/11`);

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

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("----------------------------------------");
  console.log(`TOTAL: ${results.length} formations`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("----------------------------------------\n");

  if (failed > 0) {
    console.log("❌ QA FAILED - Please fix the issues above\n");
    process.exit(1);
  } else {
    console.log("✓ QA PASSED - All formations are valid\n");
  }

  return {
    timestamp: new Date().toISOString(),
    totalFormations: results.length,
    passed,
    failed,
    results,
  };
}

// Run if executed directly
runQA();
