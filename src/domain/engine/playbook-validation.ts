// ============================================
// Playbook Export Validation
// PDF 내보내기 전 품질 검증
// ============================================

import type {
  Play,
  Playbook,
  ValidationIssue,
  ValidationSeverity,
} from "@/domain/dsl/types";

// ============================================
// Validation Issue Codes
// ============================================

export const PLAYBOOK_VALIDATION_CODES = {
  // Playbook-level
  NO_PLAYS: "NO_PLAYS",
  TOO_MANY_PLAYS: "TOO_MANY_PLAYS",
  NO_PLAYBOOK_NAME: "NO_PLAYBOOK_NAME",
  EMPTY_SECTIONS: "EMPTY_SECTIONS",

  // Play-level
  UNNAMED_PLAY: "UNNAMED_PLAY",
  NO_FORMATION: "NO_FORMATION",
  NO_ACTIONS: "NO_ACTIONS",
  MISSING_PLAYERS: "MISSING_PLAYERS",
  INCOMPLETE_PLAY: "INCOMPLETE_PLAY",
  NO_PERSONNEL: "NO_PERSONNEL",

  // Info
  SUGGEST_NOTES: "SUGGEST_NOTES",
  SUGGEST_TAGS: "SUGGEST_TAGS",
} as const;

export type PlaybookValidationCode =
  (typeof PLAYBOOK_VALIDATION_CODES)[keyof typeof PLAYBOOK_VALIDATION_CODES];

// ============================================
// Extended Issue Interface
// ============================================

export interface PlaybookValidationIssue extends ValidationIssue {
  playId?: string;
  playName?: string;
  sectionId?: string;
  sectionName?: string;
}

export interface PlaybookValidationResult {
  valid: boolean;
  canExport: boolean;
  issues: PlaybookValidationIssue[];
  summary: {
    errorCount: number;
    warningCount: number;
    infoCount: number;
    playCount: number;
    validPlayCount: number;
    problematicPlays: { id: string; name: string; issues: string[] }[];
  };
}

// ============================================
// Helper Functions
// ============================================

function createIssue(
  severity: ValidationSeverity,
  code: PlaybookValidationCode,
  message: string,
  extra?: Partial<PlaybookValidationIssue>
): PlaybookValidationIssue {
  return {
    severity,
    code,
    message,
    ...extra,
  };
}

// ============================================
// Play Validation for Export
// ============================================

function validatePlayForExport(play: Play): PlaybookValidationIssue[] {
  const issues: PlaybookValidationIssue[] = [];

  // No name or generic name
  if (!play.name || play.name.trim() === "") {
    issues.push(
      createIssue("error", PLAYBOOK_VALIDATION_CODES.UNNAMED_PLAY, "Play has no name", {
        playId: play.id,
        playName: "(unnamed)",
      })
    );
  } else if (
    play.name === "New Play" ||
    play.name === "Untitled" ||
    play.name === "Untitled Play"
  ) {
    issues.push(
      createIssue(
        "warning",
        PLAYBOOK_VALIDATION_CODES.UNNAMED_PLAY,
        `Play "${play.name}" has a generic name`,
        { playId: play.id, playName: play.name }
      )
    );
  }

  // No formation
  if (!play.meta?.formationId) {
    issues.push(
      createIssue(
        "warning",
        PLAYBOOK_VALIDATION_CODES.NO_FORMATION,
        `Play "${play.name || "(unnamed)"}" has no formation set`,
        { playId: play.id, playName: play.name }
      )
    );
  }

  // No personnel
  if (!play.meta?.personnel) {
    issues.push(
      createIssue(
        "info",
        PLAYBOOK_VALIDATION_CODES.NO_PERSONNEL,
        `Play "${play.name || "(unnamed)"}" has no personnel grouping`,
        { playId: play.id, playName: play.name }
      )
    );
  }

  // No actions (routes, blocks, motion)
  if (!play.actions || play.actions.length === 0) {
    issues.push(
      createIssue(
        "warning",
        PLAYBOOK_VALIDATION_CODES.NO_ACTIONS,
        `Play "${play.name || "(unnamed)"}" has no actions (routes/blocks)`,
        { playId: play.id, playName: play.name }
      )
    );
  }

  // Missing players (less than 11)
  const playerCount = play.roster?.players?.length || 0;
  if (playerCount < 11) {
    issues.push(
      createIssue(
        "warning",
        PLAYBOOK_VALIDATION_CODES.MISSING_PLAYERS,
        `Play "${play.name || "(unnamed)"}" has ${playerCount}/11 players`,
        { playId: play.id, playName: play.name }
      )
    );
  }

  // Incomplete (no routes AND no blocks)
  const hasRoutes = play.actions?.some((a) => a.actionType === "route");
  const hasBlocks = play.actions?.some((a) => a.actionType === "block");
  if (!hasRoutes && !hasBlocks && play.actions && play.actions.length > 0) {
    issues.push(
      createIssue(
        "warning",
        PLAYBOOK_VALIDATION_CODES.INCOMPLETE_PLAY,
        `Play "${play.name || "(unnamed)"}" has no routes or blocks`,
        { playId: play.id, playName: play.name }
      )
    );
  }

  // Suggest coaching points
  if (!play.notes?.coachingPoints || play.notes.coachingPoints.length === 0) {
    issues.push(
      createIssue(
        "info",
        PLAYBOOK_VALIDATION_CODES.SUGGEST_NOTES,
        `Play "${play.name || "(unnamed)"}" has no coaching points`,
        { playId: play.id, playName: play.name }
      )
    );
  }

  return issues;
}

// ============================================
// Main Validation Function
// ============================================

export function validatePlaybookForExport(
  playbook: Playbook | null,
  plays: Map<string, Play> | Play[]
): PlaybookValidationResult {
  const issues: PlaybookValidationIssue[] = [];

  // Convert plays to array if needed
  const playsArray = Array.isArray(plays) ? plays : Array.from(plays.values());

  // Get plays from playbook sections
  const playIdsInPlaybook = new Set<string>();
  if (playbook) {
    playbook.sections.forEach((section) => {
      section.playIds.forEach((id) => playIdsInPlaybook.add(id));
    });
  }

  // Filter to only plays in playbook
  const playbookPlays = playsArray.filter((p) => playIdsInPlaybook.has(p.id));

  // Playbook-level validation
  if (!playbook) {
    issues.push(
      createIssue("error", PLAYBOOK_VALIDATION_CODES.NO_PLAYS, "No playbook data")
    );
    return createResult(issues, []);
  }

  // No playbook name
  if (!playbook.name || playbook.name.trim() === "") {
    issues.push(
      createIssue(
        "error",
        PLAYBOOK_VALIDATION_CODES.NO_PLAYBOOK_NAME,
        "Playbook has no name"
      )
    );
  }

  // No plays
  if (playbookPlays.length === 0) {
    issues.push(
      createIssue(
        "error",
        PLAYBOOK_VALIDATION_CODES.NO_PLAYS,
        "Playbook has no plays to export"
      )
    );
    return createResult(issues, []);
  }

  // Too many plays (max 10 for free tier)
  if (playbookPlays.length > 10) {
    issues.push(
      createIssue(
        "warning",
        PLAYBOOK_VALIDATION_CODES.TOO_MANY_PLAYS,
        `Playbook has ${playbookPlays.length} plays, but only 10 will be exported`
      )
    );
  }

  // Empty sections
  const emptySections = playbook.sections.filter((s) => s.playIds.length === 0);
  if (emptySections.length > 0) {
    issues.push(
      createIssue(
        "info",
        PLAYBOOK_VALIDATION_CODES.EMPTY_SECTIONS,
        `${emptySections.length} empty section(s): ${emptySections.map((s) => s.name).join(", ")}`
      )
    );
  }

  // Validate each play
  const problematicPlays: { id: string; name: string; issues: string[] }[] = [];

  for (const play of playbookPlays) {
    const playIssues = validatePlayForExport(play);
    issues.push(...playIssues);

    // Track problematic plays
    const errorIssues = playIssues.filter((i) => i.severity === "error" || i.severity === "warning");
    if (errorIssues.length > 0) {
      problematicPlays.push({
        id: play.id,
        name: play.name || "(unnamed)",
        issues: errorIssues.map((i) => i.message),
      });
    }
  }

  return createResult(issues, playbookPlays);
}

// ============================================
// Create Result Helper
// ============================================

function createResult(
  issues: PlaybookValidationIssue[],
  plays: Play[]
): PlaybookValidationResult {
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  // Count valid plays (no errors)
  const playIdsWithErrors = new Set(
    issues.filter((i) => i.severity === "error" && i.playId).map((i) => i.playId)
  );
  const validPlayCount = plays.filter((p) => !playIdsWithErrors.has(p.id)).length;

  // Problematic plays
  const problematicPlaysMap = new Map<string, string[]>();
  issues
    .filter((i) => i.playId && (i.severity === "error" || i.severity === "warning"))
    .forEach((issue) => {
      const existing = problematicPlaysMap.get(issue.playId!) || [];
      existing.push(issue.message);
      problematicPlaysMap.set(issue.playId!, existing);
    });

  const problematicPlays = Array.from(problematicPlaysMap.entries()).map(
    ([id, issueMessages]) => {
      const play = plays.find((p) => p.id === id);
      return {
        id,
        name: play?.name || "(unnamed)",
        issues: issueMessages,
      };
    }
  );

  return {
    valid: errorCount === 0,
    canExport: errorCount === 0,
    issues,
    summary: {
      errorCount,
      warningCount,
      infoCount,
      playCount: plays.length,
      validPlayCount,
      problematicPlays,
    },
  };
}

// ============================================
// Quick Check (for UI badge)
// ============================================

export function quickCheckPlaybookForExport(
  playbook: Playbook | null,
  plays: Map<string, Play> | Play[]
): { canExport: boolean; issueCount: number } {
  const result = validatePlaybookForExport(playbook, plays);
  return {
    canExport: result.canExport,
    issueCount: result.summary.errorCount + result.summary.warningCount,
  };
}
