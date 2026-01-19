// ============================================
// Role Mapping System
// Maps concept roles to formation-specific players
// ============================================

import type { Player, PlayerRole } from "../dsl/types";

// ============================================
// Types
// ============================================

export type FormationStructure =
  | "2x2"      // Doubles - 2 receivers each side
  | "3x1"      // Trips - 3 receivers strong side
  | "bunch"    // Bunch formation
  | "ace"      // Tight end attached
  | "I"        // I-formation (FB + RB)
  | "empty"    // 5 wide
  | "pistol"   // QB in pistol, RB behind
  | "stack"    // Stacked receivers
  | "pro"      // Pro set (2 backs)
  | "unknown";

export type ConceptRoleType =
  // Receivers
  | "OUTSIDE_LEFT"
  | "OUTSIDE_RIGHT"
  | "SLOT_LEFT"
  | "SLOT_RIGHT"
  | "TE_STRONG"
  | "TE_WEAK"
  // Backs
  | "RB"
  | "FB"
  | "H_BACK"
  // Line
  | "LT"
  | "LG"
  | "C"
  | "RG"
  | "RT"
  // QB
  | "QB";

export interface RoleMappingResult {
  playerId: string;
  role: PlayerRole;
  conceptRole: ConceptRoleType;
}

// ============================================
// Formation Detection
// ============================================

export function detectFormationStructure(players: Player[]): FormationStructure {
  const receivers = players.filter((p) =>
    ["X", "Y", "Z", "H"].includes(p.role)
  );
  const rb = players.find((p) => p.role === "RB");
  const fb = players.find((p) => p.role === "FB");

  // Count receivers by side
  const leftReceivers = receivers.filter(
    (p) => (p.alignment?.x || 0.5) < 0.4
  );
  const rightReceivers = receivers.filter(
    (p) => (p.alignment?.x || 0.5) > 0.6
  );
  const centerReceivers = receivers.filter(
    (p) =>
      (p.alignment?.x || 0.5) >= 0.4 && (p.alignment?.x || 0.5) <= 0.6
  );

  // Check for bunch (3 receivers clustered)
  const hasCluster = checkForBunchCluster(receivers);
  if (hasCluster) return "bunch";

  // Check for empty (5 receivers, no RB in backfield)
  if (
    receivers.length >= 5 ||
    (rb && Math.abs((rb.alignment?.x || 0.5) - 0.5) > 0.15)
  ) {
    return "empty";
  }

  // Check for I-formation (FB present)
  if (fb) {
    return "I";
  }

  // Check for trips (3x1)
  if (leftReceivers.length === 3 || rightReceivers.length === 3) {
    return "3x1";
  }

  // Check for ace (TE attached)
  const teAttached = receivers.find(
    (p) =>
      p.role === "Y" &&
      Math.abs((p.alignment?.x || 0.5) - 0.5) < 0.15 &&
      (p.alignment?.y || 0) >= -0.1
  );
  if (teAttached) {
    return "ace";
  }

  // Default to 2x2 if balanced
  if (leftReceivers.length === 2 && rightReceivers.length === 2) {
    return "2x2";
  }

  // Check for pistol (RB directly behind QB)
  if (rb && Math.abs((rb.alignment?.x || 0.5) - 0.5) < 0.05) {
    return "pistol";
  }

  return "2x2"; // Default fallback
}

function checkForBunchCluster(receivers: Player[]): boolean {
  // Bunch = 3 receivers within ~3 yards of each other horizontally
  const threshold = 0.12; // ~2-3 yards in normalized coords

  for (let i = 0; i < receivers.length - 2; i++) {
    const clustered = receivers.filter((r) => {
      const xi = receivers[i].alignment?.x || 0.5;
      const xr = r.alignment?.x || 0.5;
      return Math.abs(xi - xr) < threshold;
    });
    if (clustered.length >= 3) return true;
  }
  return false;
}

// ============================================
// Role Mapping Tables
// ============================================

// Standard 2x2 (Doubles) mapping
const MAPPING_2X2: Record<ConceptRoleType, PlayerRole[]> = {
  OUTSIDE_LEFT: ["X"],
  OUTSIDE_RIGHT: ["Z"],
  SLOT_LEFT: ["H"],
  SLOT_RIGHT: ["Y"],
  TE_STRONG: ["Y"],
  TE_WEAK: [],
  RB: ["RB"],
  FB: ["FB"],
  H_BACK: ["H"],
  LT: ["LT"],
  LG: ["LG"],
  C: ["C"],
  RG: ["RG"],
  RT: ["RT"],
  QB: ["QB"],
};

// 3x1 Trips (Right strength) mapping
const MAPPING_3X1_RIGHT: Record<ConceptRoleType, PlayerRole[]> = {
  OUTSIDE_LEFT: ["X"],      // Iso X on weak side
  OUTSIDE_RIGHT: ["Z"],     // Outside of trips
  SLOT_LEFT: [],            // No slot weak
  SLOT_RIGHT: ["Y", "H"],   // Inside 2 of trips
  TE_STRONG: ["Y"],
  TE_WEAK: [],
  RB: ["RB"],
  FB: ["FB"],
  H_BACK: ["H"],
  LT: ["LT"],
  LG: ["LG"],
  C: ["C"],
  RG: ["RG"],
  RT: ["RT"],
  QB: ["QB"],
};

// 3x1 Trips (Left strength) mapping
const MAPPING_3X1_LEFT: Record<ConceptRoleType, PlayerRole[]> = {
  OUTSIDE_LEFT: ["X"],      // Outside of trips
  OUTSIDE_RIGHT: ["Z"],     // Iso Z on weak side
  SLOT_LEFT: ["Y", "H"],    // Inside 2 of trips
  SLOT_RIGHT: [],
  TE_STRONG: ["Y"],
  TE_WEAK: [],
  RB: ["RB"],
  FB: ["FB"],
  H_BACK: ["H"],
  LT: ["LT"],
  LG: ["LG"],
  C: ["C"],
  RG: ["RG"],
  RT: ["RT"],
  QB: ["QB"],
};

// Bunch mapping
const MAPPING_BUNCH: Record<ConceptRoleType, PlayerRole[]> = {
  OUTSIDE_LEFT: ["X"],
  OUTSIDE_RIGHT: ["Z"],     // Point of bunch
  SLOT_LEFT: [],
  SLOT_RIGHT: ["Y", "H"],   // Bunch interior
  TE_STRONG: ["Y"],
  TE_WEAK: [],
  RB: ["RB"],
  FB: ["FB"],
  H_BACK: ["H"],
  LT: ["LT"],
  LG: ["LG"],
  C: ["C"],
  RG: ["RG"],
  RT: ["RT"],
  QB: ["QB"],
};

// Ace (2 TE) mapping
const MAPPING_ACE: Record<ConceptRoleType, PlayerRole[]> = {
  OUTSIDE_LEFT: ["X"],
  OUTSIDE_RIGHT: ["Z"],
  SLOT_LEFT: ["H"],
  SLOT_RIGHT: [],
  TE_STRONG: ["Y"],         // Strong side TE
  TE_WEAK: ["H"],           // Could be H or second Y
  RB: ["RB"],
  FB: ["FB"],
  H_BACK: ["H"],
  LT: ["LT"],
  LG: ["LG"],
  C: ["C"],
  RG: ["RG"],
  RT: ["RT"],
  QB: ["QB"],
};

// I-Formation mapping
const MAPPING_I: Record<ConceptRoleType, PlayerRole[]> = {
  OUTSIDE_LEFT: ["X"],
  OUTSIDE_RIGHT: ["Z"],
  SLOT_LEFT: [],
  SLOT_RIGHT: [],
  TE_STRONG: ["Y"],
  TE_WEAK: [],
  RB: ["RB"],
  FB: ["FB"],
  H_BACK: ["H"],
  LT: ["LT"],
  LG: ["LG"],
  C: ["C"],
  RG: ["RG"],
  RT: ["RT"],
  QB: ["QB"],
};

// Empty mapping
const MAPPING_EMPTY: Record<ConceptRoleType, PlayerRole[]> = {
  OUTSIDE_LEFT: ["X"],
  OUTSIDE_RIGHT: ["Z"],
  SLOT_LEFT: ["H"],
  SLOT_RIGHT: ["Y"],
  TE_STRONG: [],
  TE_WEAK: [],
  RB: ["RB"],               // RB splits out as receiver
  FB: [],
  H_BACK: ["H"],
  LT: ["LT"],
  LG: ["LG"],
  C: ["C"],
  RG: ["RG"],
  RT: ["RT"],
  QB: ["QB"],
};

// ============================================
// Main Mapping Functions
// ============================================

export function getMappingTable(
  structure: FormationStructure,
  strength: "left" | "right" = "right"
): Record<ConceptRoleType, PlayerRole[]> {
  switch (structure) {
    case "2x2":
      return MAPPING_2X2;
    case "3x1":
      return strength === "left" ? MAPPING_3X1_LEFT : MAPPING_3X1_RIGHT;
    case "bunch":
      return MAPPING_BUNCH;
    case "ace":
      return MAPPING_ACE;
    case "I":
      return MAPPING_I;
    case "empty":
      return MAPPING_EMPTY;
    case "pistol":
      return MAPPING_2X2; // Pistol uses 2x2 receiver mapping
    default:
      return MAPPING_2X2;
  }
}

export function mapConceptRoleToPlayer(
  conceptRole: ConceptRoleType,
  players: Player[],
  structure?: FormationStructure,
  strength: "left" | "right" = "right"
): Player | undefined {
  const detectedStructure = structure || detectFormationStructure(players);
  const mappingTable = getMappingTable(detectedStructure, strength);

  const targetRoles = mappingTable[conceptRole];
  if (!targetRoles || targetRoles.length === 0) {
    return undefined;
  }

  // Find first matching player
  for (const role of targetRoles) {
    const player = players.find((p) => p.role === role);
    if (player) return player;
  }

  return undefined;
}

export function mapAllConceptRoles(
  conceptRoles: ConceptRoleType[],
  players: Player[],
  structure?: FormationStructure,
  strength: "left" | "right" = "right"
): RoleMappingResult[] {
  const detectedStructure = structure || detectFormationStructure(players);
  const results: RoleMappingResult[] = [];
  const usedPlayerIds = new Set<string>();

  for (const conceptRole of conceptRoles) {
    const player = mapConceptRoleToPlayer(
      conceptRole,
      players.filter((p) => !usedPlayerIds.has(p.id)),
      detectedStructure,
      strength
    );

    if (player) {
      results.push({
        playerId: player.id,
        role: player.role,
        conceptRole,
      });
      usedPlayerIds.add(player.id);
    }
  }

  return results;
}

// ============================================
// DSL Concept Role Translation
// ============================================

// Maps DSL concept template roles to our ConceptRoleType
export function translateDSLRoleToConceptRole(
  dslRole: string,
  appliesTo: string[]
): ConceptRoleType | null {
  // OL roles - direct mapping
  if (appliesTo.includes("LT")) return "LT";
  if (appliesTo.includes("LG")) return "LG";
  if (appliesTo.includes("C")) return "C";
  if (appliesTo.includes("RG")) return "RG";
  if (appliesTo.includes("RT")) return "RT";

  // QB
  if (appliesTo.includes("QB")) return "QB";

  // Backs
  if (appliesTo.includes("FB")) return "FB";
  if (appliesTo.includes("RB") && !appliesTo.includes("H")) return "RB";

  // Receivers - need context to determine which slot/outside
  if (appliesTo.includes("X")) {
    return appliesTo.includes("Z") ? null : "OUTSIDE_LEFT";
  }
  if (appliesTo.includes("Z")) {
    return "OUTSIDE_RIGHT";
  }
  if (appliesTo.includes("Y")) {
    return "TE_STRONG";
  }
  if (appliesTo.includes("H")) {
    // H could be slot or H-back based on context
    return "H_BACK";
  }

  return null;
}

// ============================================
// Full Team Assignment Validation
// ============================================

export interface AssignmentValidation {
  valid: boolean;
  missingRoles: string[];
  assignedCount: number;
  expectedCount: number;
  warnings: string[];
}

export function validateFullTeamAssignment(
  players: Player[],
  assignedPlayerIds: string[],
  conceptType: "run" | "pass" | "rpo"
): AssignmentValidation {
  const warnings: string[] = [];
  const missingRoles: string[] = [];

  const assignedSet = new Set(assignedPlayerIds);
  const olRoles = ["LT", "LG", "C", "RG", "RT"];
  const skillRoles = ["X", "Z", "Y", "H", "RB"];

  // Check OL assignment (required for all concepts)
  const olPlayers = players.filter((p) => olRoles.includes(p.role));
  const assignedOL = olPlayers.filter((p) => assignedSet.has(p.id));
  if (assignedOL.length < 5) {
    missingRoles.push(
      ...olRoles.filter(
        (role) =>
          !olPlayers.some(
            (p) => p.role === role && assignedSet.has(p.id)
          )
      )
    );
    warnings.push(
      `Only ${assignedOL.length}/5 OL have assignments`
    );
  }

  // Check skill position assignments based on concept type
  const skillPlayers = players.filter((p) => skillRoles.includes(p.role));
  const assignedSkill = skillPlayers.filter((p) => assignedSet.has(p.id));

  if (conceptType === "run") {
    // Run: RB must have assignment
    const rb = players.find((p) => p.role === "RB");
    if (rb && !assignedSet.has(rb.id)) {
      missingRoles.push("RB");
      warnings.push("RB has no run path assignment");
    }
  } else if (conceptType === "pass") {
    // Pass: At least 3 receivers should have routes
    if (assignedSkill.length < 3) {
      warnings.push(
        `Only ${assignedSkill.length} receivers have routes (recommend 3+)`
      );
    }
  } else if (conceptType === "rpo") {
    // RPO: RB path + at least 1 route
    const rb = players.find((p) => p.role === "RB");
    if (rb && !assignedSet.has(rb.id)) {
      missingRoles.push("RB");
    }
    const routes = assignedSkill.filter((p) => p.role !== "RB");
    if (routes.length < 1) {
      warnings.push("RPO should have at least 1 quick route option");
    }
  }

  // QB should always have assignment (drop, read, etc.)
  const qb = players.find((p) => p.role === "QB");
  if (qb && !assignedSet.has(qb.id)) {
    // QB assignment is optional in current system
    // warnings.push("QB has no explicit assignment");
  }

  const expectedCount =
    conceptType === "run" ? 6 : conceptType === "pass" ? 8 : 7;

  return {
    valid: missingRoles.length === 0 && warnings.length === 0,
    missingRoles,
    assignedCount: assignedSet.size,
    expectedCount,
    warnings,
  };
}

// ============================================
// Strength Detection
// ============================================

export function detectStrength(players: Player[]): "left" | "right" {
  const receivers = players.filter((p) =>
    ["X", "Y", "Z", "H"].includes(p.role)
  );

  const leftWeight = receivers.reduce((sum, p) => {
    const x = p.alignment?.x || 0.5;
    return sum + (x < 0.5 ? 1 : 0);
  }, 0);

  const rightWeight = receivers.reduce((sum, p) => {
    const x = p.alignment?.x || 0.5;
    return sum + (x > 0.5 ? 1 : 0);
  }, 0);

  return rightWeight >= leftWeight ? "right" : "left";
}
