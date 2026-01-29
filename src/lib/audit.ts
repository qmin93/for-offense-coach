// ============================================
// Runtime Audit Helpers (Dev Mode)
// Access via __audit in browser console
// ============================================

import { FORMATIONS } from "@/domain/engine/formations";
import { RUN_CONCEPTS } from "@/domain/engine/concepts-run";
import { PASS_CONCEPTS } from "@/domain/engine/concepts-pass";
import type {
  Formation,
  Concept,
  OffenseRole,
  PlayerRole,
} from "@/domain/dsl/types";

// ============================================
// Types
// ============================================

interface AuditIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

interface FormationAuditResult {
  formationId: string;
  formationName: string;
  passed: boolean;
  issues: AuditIssue[];
}

interface ConceptAuditResult {
  conceptId: string;
  conceptName: string;
  passed: boolean;
  issues: AuditIssue[];
}

// ============================================
// Constants
// ============================================

const CORE_ROLES: OffenseRole[] = ["QB", "C", "LT", "LG", "RG", "RT"];
const OL_ROLES: OffenseRole[] = ["LT", "LG", "C", "RG", "RT"];
const MIN_OFF_LOS_DEPTH_YARDS = 0.75;

// ============================================
// Formation Audit
// ============================================

function checkFormation(formationId: string): FormationAuditResult | null {
  const formation = FORMATIONS.find((f) => f.id === formationId);
  if (!formation) {
    console.error(`Formation not found: ${formationId}`);
    return null;
  }

  const issues: AuditIssue[] = [];
  const players = formation.defaults.players;

  // A1: Player count
  if (players.length !== 11) {
    issues.push({
      severity: "error",
      code: "A1_PLAYER_COUNT",
      message: `Has ${players.length} players, expected 11`,
    });
  }

  // A1: Core roles
  const roles = players.map((p) => p.role);
  for (const coreRole of CORE_ROLES) {
    if (!roles.includes(coreRole)) {
      issues.push({
        severity: "error",
        code: "A1_MISSING_CORE_ROLE",
        message: `Missing required role: ${coreRole}`,
      });
    }
  }

  // A2: Unique roles
  for (const uniqueRole of CORE_ROLES) {
    const count = roles.filter((r) => r === uniqueRole).length;
    if (count > 1) {
      issues.push({
        severity: "error",
        code: "A2_DUPLICATE_ROLE",
        message: `Role ${uniqueRole} appears ${count} times`,
      });
    }
  }

  // A3: LOS constraints
  for (const player of players) {
    const { alignment, role, id } = player;
    const isOL = OL_ROLES.includes(role as OffenseRole);

    if (alignment.onLOS === false && !isOL) {
      const depthYards = alignment.depthYards ?? 0;
      if (depthYards > 0 && depthYards < MIN_OFF_LOS_DEPTH_YARDS) {
        issues.push({
          severity: "warning",
          code: "A3_INSUFFICIENT_DEPTH",
          message: `${id} (${role}) depth=${depthYards}, min ${MIN_OFF_LOS_DEPTH_YARDS}`,
        });
      }
    }
  }

  const passed = issues.filter((i) => i.severity === "error").length === 0;

  return {
    formationId,
    formationName: formation.name,
    passed,
    issues,
  };
}

function checkAllFormations(): FormationAuditResult[] {
  const results: FormationAuditResult[] = [];

  for (const formation of FORMATIONS) {
    const result = checkFormation(formation.id);
    if (result) {
      results.push(result);
    }
  }

  // Print summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n📋 Formation Audit: ${passed}/${total} passed`);

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.log("\n❌ Failed formations:");
    for (const f of failed) {
      console.log(`  - ${f.formationName} (${f.formationId})`);
      for (const issue of f.issues.filter((i) => i.severity === "error")) {
        console.log(`    [${issue.code}] ${issue.message}`);
      }
    }
  }

  return results;
}

// ============================================
// Concept Audit
// ============================================

function checkConcept(conceptId: string): ConceptAuditResult | null {
  const allConcepts = [...RUN_CONCEPTS, ...PASS_CONCEPTS];
  const concept = allConcepts.find((c) => c.id === conceptId);
  if (!concept) {
    console.error(`Concept not found: ${conceptId}`);
    return null;
  }

  const issues: AuditIssue[] = [];
  const template = concept.template;
  const roles = template.roles;

  if (concept.conceptType === "run") {
    // Check OL coverage
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
        message: `Missing OL assignments: ${missingOL.join(", ")}`,
      });
    }
  }

  if (concept.conceptType === "pass") {
    const routeRoles = roles.filter((r) => "defaultRoute" in r);
    if (routeRoles.length === 0) {
      issues.push({
        severity: "error",
        code: "B1_NO_ROUTES",
        message: "No route assignments defined",
      });
    }
  }

  const passed = issues.filter((i) => i.severity === "error").length === 0;

  return {
    conceptId,
    conceptName: concept.name,
    passed,
    issues,
  };
}

function checkAllConcepts(): ConceptAuditResult[] {
  const results: ConceptAuditResult[] = [];
  const allConcepts = [...RUN_CONCEPTS, ...PASS_CONCEPTS];

  for (const concept of allConcepts) {
    const result = checkConcept(concept.id);
    if (result) {
      results.push(result);
    }
  }

  // Print summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n📋 Concept Audit: ${passed}/${total} passed`);

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.log("\n❌ Failed concepts:");
    for (const c of failed) {
      console.log(`  - ${c.conceptName} (${c.conceptId})`);
      for (const issue of c.issues.filter((i) => i.severity === "error")) {
        console.log(`    [${issue.code}] ${issue.message}`);
      }
    }
  }

  return results;
}

// ============================================
// Export / Global Registration
// ============================================

export const __audit = {
  checkFormation,
  checkAllFormations,
  checkConcept,
  checkAllConcepts,
  help: () => {
    console.log(`
🔍 Runtime Audit Helpers
────────────────────────────────────────
__audit.checkFormation("formation_2x2")
  → Check a specific formation

__audit.checkAllFormations()
  → Check all formations

__audit.checkConcept("concept_run_power")
  → Check a specific concept

__audit.checkAllConcepts()
  → Check all concepts

__audit.help()
  → Show this help message
────────────────────────────────────────
    `);
  },
};

// Register globally in dev mode
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as unknown as { __audit: typeof __audit }).__audit = __audit;
}
