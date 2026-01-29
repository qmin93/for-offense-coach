// ============================================
// Editor-time Soft Validation
// 에디터에서 실시간으로 동작하는 소프트 검증 시스템
// - error: 저장 불가 (심각한 문제)
// - warning: 저장 가능하지만 문제 있음
// - info: 코칭 팁, 개선 제안
// ============================================

import type {
  Play,
  Player,
  Action,
  ValidationIssue,
  ValidationResult,
  ValidationSeverity,
} from "@/domain/dsl/types";

// ============================================
// Validation Issue Codes
// ============================================

export const VALIDATION_CODES = {
  // Errors (저장 불가)
  NO_PLAYERS: "NO_PLAYERS",
  NO_NAME: "NO_NAME",
  INVALID_ALIGNMENT: "INVALID_ALIGNMENT",
  ORPHAN_ACTION: "ORPHAN_ACTION",
  DUPLICATE_PLAYER_ID: "DUPLICATE_PLAYER_ID",
  INVALID_ROUTE_POINTS: "INVALID_ROUTE_POINTS",

  // Warnings (저장 가능, 문제 있음)
  NO_QB: "NO_QB",
  NO_CENTER: "NO_CENTER",
  WRONG_PLAYER_COUNT: "WRONG_PLAYER_COUNT",
  NO_ROUTES: "NO_ROUTES",
  NO_BLOCKS: "NO_BLOCKS",
  PLAYER_OUT_OF_BOUNDS: "PLAYER_OUT_OF_BOUNDS",
  OVERLAPPING_PLAYERS: "OVERLAPPING_PLAYERS",
  MOTION_NOT_PRE_SNAP: "MOTION_NOT_PRE_SNAP",
  SHORT_ROUTE: "SHORT_ROUTE",
  NO_FORMATION_SET: "NO_FORMATION_SET",
  NO_CONCEPT_SET: "NO_CONCEPT_SET",

  // Info (코칭 팁)
  TIP_ADD_COACHING_POINTS: "TIP_ADD_COACHING_POINTS",
  TIP_SET_PERSONNEL: "TIP_SET_PERSONNEL",
  TIP_ADD_TAGS: "TIP_ADD_TAGS",
  TIP_NAME_TOO_GENERIC: "TIP_NAME_TOO_GENERIC",
  TIP_OL_NO_BLOCKS: "TIP_OL_NO_BLOCKS",
} as const;

export type ValidationCode = (typeof VALIDATION_CODES)[keyof typeof VALIDATION_CODES];

// ============================================
// Helper Functions
// ============================================

function createIssue(
  severity: ValidationSeverity,
  code: ValidationCode,
  message: string,
  extra?: { field?: string; playerId?: string; actionId?: string }
): ValidationIssue {
  return {
    severity,
    code,
    message,
    ...extra,
  };
}

function isPointInBounds(x: number, y: number): boolean {
  return x >= 0 && x <= 1 && y >= -1 && y <= 1;
}

function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

// ============================================
// Player Validation (Soft Checks)
// ============================================

function validatePlayersSoft(players: Player[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // No players at all (error)
  if (players.length === 0) {
    issues.push(
      createIssue("error", VALIDATION_CODES.NO_PLAYERS, "No players in the play")
    );
    return issues;
  }

  // Check for QB
  const hasQb = players.some((p) => p.role === "QB");
  if (!hasQb) {
    issues.push(
      createIssue(
        "warning",
        VALIDATION_CODES.NO_QB,
        "No quarterback (QB) found - most plays need a QB"
      )
    );
  }

  // Check for Center
  const hasCenter = players.some((p) => p.role === "C");
  if (!hasCenter) {
    issues.push(
      createIssue(
        "warning",
        VALIDATION_CODES.NO_CENTER,
        "No center (C) found - formation may be incomplete"
      )
    );
  }

  // Check player count (should be 11 for standard football)
  if (players.length !== 11) {
    const diff = 11 - players.length;
    issues.push(
      createIssue(
        "warning",
        VALIDATION_CODES.WRONG_PLAYER_COUNT,
        `${players.length} players on field (${diff > 0 ? `need ${diff} more` : `${-diff} too many`})`
      )
    );
  }

  // Check for out of bounds players
  const seenIds = new Set<string>();
  for (const player of players) {
    // Duplicate ID check (error)
    if (seenIds.has(player.id)) {
      issues.push(
        createIssue(
          "error",
          VALIDATION_CODES.DUPLICATE_PLAYER_ID,
          `Duplicate player ID: ${player.id}`,
          { playerId: player.id }
        )
      );
    }
    seenIds.add(player.id);

    // Out of bounds (warning)
    if (!isPointInBounds(player.alignment.x, player.alignment.y)) {
      issues.push(
        createIssue(
          "warning",
          VALIDATION_CODES.PLAYER_OUT_OF_BOUNDS,
          `${player.label || player.role} is outside field bounds`,
          { playerId: player.id }
        )
      );
    }

    // Invalid alignment (error)
    if (
      typeof player.alignment.x !== "number" ||
      typeof player.alignment.y !== "number" ||
      isNaN(player.alignment.x) ||
      isNaN(player.alignment.y)
    ) {
      issues.push(
        createIssue(
          "error",
          VALIDATION_CODES.INVALID_ALIGNMENT,
          `${player.label || player.role} has invalid position`,
          { playerId: player.id }
        )
      );
    }
  }

  // Check for overlapping players
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const dist = getDistance(players[i].alignment, players[j].alignment);
      if (dist < 0.02) {
        // Very close together
        issues.push(
          createIssue(
            "warning",
            VALIDATION_CODES.OVERLAPPING_PLAYERS,
            `${players[i].label || players[i].role} and ${players[j].label || players[j].role} are overlapping`,
            { playerId: players[i].id }
          )
        );
      }
    }
  }

  return issues;
}

// ============================================
// Action Validation (Soft Checks)
// ============================================

function validateActionsSoft(
  actions: Action[],
  players: Player[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const playerIds = new Set(players.map((p) => p.id));

  // Check for orphan actions (error)
  for (const action of actions) {
    if (action.fromPlayerId && !playerIds.has(action.fromPlayerId)) {
      issues.push(
        createIssue(
          "error",
          VALIDATION_CODES.ORPHAN_ACTION,
          `Action references non-existent player: ${action.fromPlayerId}`,
          { actionId: action.id }
        )
      );
    }
  }

  // Categorize actions
  const routes = actions.filter((a) => a.actionType === "route");
  const blocks = actions.filter((a) => a.actionType === "block");
  const motions = actions.filter((a) => a.actionType === "motion");

  // No routes at all (info for run plays, warning for pass plays)
  if (routes.length === 0) {
    issues.push(
      createIssue(
        "info",
        VALIDATION_CODES.NO_ROUTES,
        "No routes drawn - add routes for receivers or backs"
      )
    );
  }

  // No blocks (warning)
  if (blocks.length === 0) {
    issues.push(
      createIssue(
        "info",
        VALIDATION_CODES.NO_BLOCKS,
        "No blocking assignments - add blocks for linemen"
      )
    );
  }

  // Check route validity
  for (const route of routes) {
    if (route.actionType === "route" && route.route?.controlPoints) {
      // Invalid route points (error)
      if (route.route.controlPoints.length < 2) {
        issues.push(
          createIssue(
            "error",
            VALIDATION_CODES.INVALID_ROUTE_POINTS,
            "Route has fewer than 2 points",
            { actionId: route.id }
          )
        );
        continue;
      }

      // Very short route (warning)
      const totalLength = route.route.controlPoints.reduce((acc, point, i, arr) => {
        if (i === 0) return 0;
        return acc + getDistance(arr[i - 1], point);
      }, 0);

      if (totalLength < 0.03 && totalLength > 0) {
        issues.push(
          createIssue(
            "warning",
            VALIDATION_CODES.SHORT_ROUTE,
            "Very short route - may be too close to LOS",
            { actionId: route.id }
          )
        );
      }
    }
  }

  // Check motion timing
  for (const motion of motions) {
    if (motion.timing?.phase !== "pre_snap") {
      issues.push(
        createIssue(
          "warning",
          VALIDATION_CODES.MOTION_NOT_PRE_SNAP,
          "Motion should typically be pre-snap",
          { actionId: motion.id }
        )
      );
    }
  }

  // Check if OL have blocks assigned
  const olRoles = ["LT", "LG", "C", "RG", "RT"];
  const olPlayers = players.filter((p) => olRoles.includes(p.role as string));
  const olWithBlocks = new Set(
    blocks.filter((b) => b.fromPlayerId).map((b) => b.fromPlayerId)
  );
  const olWithoutBlocks = olPlayers.filter((p) => !olWithBlocks.has(p.id));

  if (olWithoutBlocks.length > 0 && blocks.length > 0) {
    // Only warn if some blocks exist but OL are missing
    issues.push(
      createIssue(
        "info",
        VALIDATION_CODES.TIP_OL_NO_BLOCKS,
        `${olWithoutBlocks.length} linemen without blocking assignments`
      )
    );
  }

  return issues;
}

// ============================================
// Play Metadata Validation (Soft Checks)
// ============================================

function validateMetaSoft(play: Play): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // No name (error)
  if (!play.name || play.name.trim() === "") {
    issues.push(
      createIssue("error", VALIDATION_CODES.NO_NAME, "Play must have a name")
    );
  } else if (
    play.name === "New Play" ||
    play.name === "Untitled" ||
    play.name === "Untitled Play"
  ) {
    issues.push(
      createIssue(
        "info",
        VALIDATION_CODES.TIP_NAME_TOO_GENERIC,
        'Consider giving the play a descriptive name (e.g., "Trips Right Mesh")'
      )
    );
  }

  // No formation set
  if (!play.meta?.formationId) {
    issues.push(
      createIssue(
        "warning",
        VALIDATION_CODES.NO_FORMATION_SET,
        "No formation selected - set a formation for better organization"
      )
    );
  }

  // No concept set
  if (!play.meta?.conceptId) {
    issues.push(
      createIssue(
        "info",
        VALIDATION_CODES.NO_CONCEPT_SET,
        "No concept tagged - tagging helps with playbook search"
      )
    );
  }

  // No personnel
  if (!play.meta?.personnel) {
    issues.push(
      createIssue(
        "info",
        VALIDATION_CODES.TIP_SET_PERSONNEL,
        "Set personnel grouping (e.g., 11, 12, 21) for filtering"
      )
    );
  }

  // No tags
  if (!play.tags || play.tags.length === 0) {
    issues.push(
      createIssue(
        "info",
        VALIDATION_CODES.TIP_ADD_TAGS,
        "Add tags for easier search (e.g., redzone, 3rd-down)"
      )
    );
  }

  // No coaching points
  if (!play.notes?.coachingPoints || play.notes.coachingPoints.length === 0) {
    issues.push(
      createIssue(
        "info",
        VALIDATION_CODES.TIP_ADD_COACHING_POINTS,
        "Add coaching points to help with install"
      )
    );
  }

  return issues;
}

// ============================================
// Main Validation Function
// ============================================

/**
 * Validate a play in real-time (editor mode).
 * Returns issues with severity levels:
 * - error: Cannot save, must fix
 * - warning: Can save but should fix
 * - info: Suggestions and tips
 */
export function validatePlayRealtime(play: Play | null): ValidationResult {
  if (!play) {
    return {
      valid: false,
      canSave: false,
      canExport: false,
      issues: [
        createIssue("error", VALIDATION_CODES.NO_PLAYERS, "No play data"),
      ],
    };
  }

  const issues: ValidationIssue[] = [];

  // Collect all issues
  issues.push(...validatePlayersSoft(play.roster?.players || []));
  issues.push(...validateActionsSoft(play.actions || [], play.roster?.players || []));
  issues.push(...validateMetaSoft(play));

  // Calculate validity flags
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  // Critical warnings that block export
  const criticalWarnings = warnings.filter(
    (w) =>
      w.code === VALIDATION_CODES.WRONG_PLAYER_COUNT ||
      w.code === VALIDATION_CODES.NO_QB ||
      w.code === VALIDATION_CODES.NO_CENTER
  );

  return {
    valid: errors.length === 0,
    canSave: errors.length === 0,
    canExport: errors.length === 0 && criticalWarnings.length === 0,
    issues,
  };
}

// ============================================
// Utility: Get issues by player
// ============================================

export function getIssuesByPlayer(
  issues: ValidationIssue[],
  playerId: string
): ValidationIssue[] {
  return issues.filter((i) => i.playerId === playerId);
}

// ============================================
// Utility: Get issues by action
// ============================================

export function getIssuesByAction(
  issues: ValidationIssue[],
  actionId: string
): ValidationIssue[] {
  return issues.filter((i) => i.actionId === actionId);
}

// ============================================
// Utility: Get issue summary
// ============================================

export interface ValidationSummary {
  errorCount: number;
  warningCount: number;
  infoCount: number;
  canSave: boolean;
  canExport: boolean;
  topIssue: ValidationIssue | null;
}

export function getValidationSummary(result: ValidationResult): ValidationSummary {
  const errorCount = result.issues.filter((i) => i.severity === "error").length;
  const warningCount = result.issues.filter((i) => i.severity === "warning").length;
  const infoCount = result.issues.filter((i) => i.severity === "info").length;

  // Top issue = first error, or first warning, or first info
  const topIssue =
    result.issues.find((i) => i.severity === "error") ||
    result.issues.find((i) => i.severity === "warning") ||
    result.issues.find((i) => i.severity === "info") ||
    null;

  return {
    errorCount,
    warningCount,
    infoCount,
    canSave: result.canSave,
    canExport: result.canExport,
    topIssue,
  };
}
