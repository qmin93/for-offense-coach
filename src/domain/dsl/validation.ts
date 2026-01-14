// ============================================
// DSL Validation Functions
// ============================================

import type {
  Play,
  Player,
  Action,
  RouteAction,
  BlockAction,
  MotionAction,
  Formation,
  Concept,
  Point,
} from "./types";

export interface ValidationError {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================
// Point Validation
// ============================================

export function isValidPoint(point: Point): boolean {
  return (
    typeof point.x === "number" &&
    typeof point.y === "number" &&
    point.x >= 0 &&
    point.x <= 1 &&
    point.y >= -1 &&
    point.y <= 1
  );
}

// ============================================
// Player Validation
// ============================================

export function validatePlayer(
  player: Player,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!player.id) {
    errors.push({
      path: `${path}.id`,
      message: "Player must have an id",
      severity: "error",
    });
  }

  if (!player.role) {
    errors.push({
      path: `${path}.role`,
      message: "Player must have a role",
      severity: "error",
    });
  }

  if (!player.alignment) {
    errors.push({
      path: `${path}.alignment`,
      message: "Player must have alignment coordinates",
      severity: "error",
    });
  } else if (!isValidPoint(player.alignment)) {
    errors.push({
      path: `${path}.alignment`,
      message: "Player alignment must be within field bounds (x: 0-1, y: -1 to 1)",
      severity: "error",
    });
  }

  return errors;
}

// ============================================
// Action Validation
// ============================================

export function validateAction(
  action: Action,
  playerIds: Set<string>,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!action.id) {
    errors.push({
      path: `${path}.id`,
      message: "Action must have an id",
      severity: "error",
    });
  }

  if (action.fromPlayerId && !playerIds.has(action.fromPlayerId)) {
    errors.push({
      path: `${path}.fromPlayerId`,
      message: `Referenced player "${action.fromPlayerId}" does not exist in roster`,
      severity: "error",
    });
  }

  switch (action.actionType) {
    case "route":
      errors.push(...validateRouteAction(action as RouteAction, path));
      break;
    case "block":
      errors.push(...validateBlockAction(action as BlockAction, path));
      break;
    case "motion":
      errors.push(...validateMotionAction(action as MotionAction, path));
      break;
  }

  return errors;
}

function validateRouteAction(
  action: RouteAction,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!action.route) {
    errors.push({
      path: `${path}.route`,
      message: "Route action must have route data",
      severity: "error",
    });
    return errors;
  }

  if (!action.route.controlPoints || action.route.controlPoints.length < 2) {
    errors.push({
      path: `${path}.route.controlPoints`,
      message: "Route must have at least 2 control points",
      severity: "error",
    });
  } else {
    action.route.controlPoints.forEach((point, i) => {
      if (!isValidPoint(point)) {
        errors.push({
          path: `${path}.route.controlPoints[${i}]`,
          message: "Control point must be within field bounds",
          severity: "error",
        });
      }
    });
  }

  return errors;
}

function validateBlockAction(
  action: BlockAction,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!action.block) {
    errors.push({
      path: `${path}.block`,
      message: "Block action must have block data",
      severity: "error",
    });
    return errors;
  }

  if (!action.block.scheme) {
    errors.push({
      path: `${path}.block.scheme`,
      message: "Block must have a scheme",
      severity: "error",
    });
  }

  return errors;
}

function validateMotionAction(
  action: MotionAction,
  path: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!action.motion) {
    errors.push({
      path: `${path}.motion`,
      message: "Motion action must have motion data",
      severity: "error",
    });
    return errors;
  }

  if (!action.motion.pathPoints || action.motion.pathPoints.length < 2) {
    errors.push({
      path: `${path}.motion.pathPoints`,
      message: "Motion must have at least 2 path points",
      severity: "error",
    });
  }

  // Motion should be pre_snap
  if (action.timing?.phase !== "pre_snap") {
    errors.push({
      path: `${path}.timing.phase`,
      message: "Motion timing should be pre_snap (recommended)",
      severity: "warning",
    });
  }

  return errors;
}

// ============================================
// Play Validation
// ============================================

export function validatePlay(play: Play): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Schema version
  if (!play.schemaVersion) {
    errors.push({
      path: "schemaVersion",
      message: "Play must have a schemaVersion",
      severity: "error",
    });
  }

  // Name
  if (!play.name || play.name.trim() === "") {
    errors.push({
      path: "name",
      message: "Play must have a name",
      severity: "error",
    });
  }

  // Roster
  if (!play.roster || !play.roster.players || play.roster.players.length === 0) {
    errors.push({
      path: "roster.players",
      message: "Play must have at least one player",
      severity: "error",
    });
  } else {
    const playerIds = new Set<string>();
    play.roster.players.forEach((player, i) => {
      if (playerIds.has(player.id)) {
        errors.push({
          path: `roster.players[${i}].id`,
          message: `Duplicate player id: ${player.id}`,
          severity: "error",
        });
      }
      playerIds.add(player.id);

      const playerErrors = validatePlayer(player, `roster.players[${i}]`);
      playerErrors.forEach((e) => {
        if (e.severity === "error") errors.push(e);
        else warnings.push(e);
      });
    });

    // Validate actions
    play.actions.forEach((action, i) => {
      const actionErrors = validateAction(action, playerIds, `actions[${i}]`);
      actionErrors.forEach((e) => {
        if (e.severity === "error") errors.push(e);
        else warnings.push(e);
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// Formation Validation
// ============================================

export function validateFormation(formation: Formation): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!formation.schemaVersion) {
    errors.push({
      path: "schemaVersion",
      message: "Formation must have a schemaVersion",
      severity: "error",
    });
  }

  if (!formation.name) {
    errors.push({
      path: "name",
      message: "Formation must have a name",
      severity: "error",
    });
  }

  if (!formation.defaults || !formation.defaults.players) {
    errors.push({
      path: "defaults.players",
      message: "Formation must have default players",
      severity: "error",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// Concept Validation
// ============================================

export function validateConcept(concept: Concept): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!concept.schemaVersion) {
    errors.push({
      path: "schemaVersion",
      message: "Concept must have a schemaVersion",
      severity: "error",
    });
  }

  if (!concept.name) {
    errors.push({
      path: "name",
      message: "Concept must have a name",
      severity: "error",
    });
  }

  if (!concept.conceptType) {
    errors.push({
      path: "conceptType",
      message: "Concept must have a type (pass/run)",
      severity: "error",
    });
  }

  if (!concept.template || !concept.template.roles) {
    errors.push({
      path: "template.roles",
      message: "Concept must have template roles",
      severity: "error",
    });
  }

  // Pass concept should have minEligibleReceivers
  if (concept.conceptType === "pass") {
    if (!concept.requirements?.minEligibleReceivers) {
      warnings.push({
        path: "requirements.minEligibleReceivers",
        message: "Pass concept should specify minimum eligible receivers",
        severity: "warning",
      });
    }
  }

  // Run concept should have runHints
  if (concept.conceptType === "run") {
    if (!concept.runHints) {
      warnings.push({
        path: "runHints",
        message: "Run concept should have runHints for recommendations",
        severity: "warning",
      });
    }
  }

  // Install Focus validation
  if (concept.installFocus) {
    if (concept.installFocus.failurePoints.length > 3) {
      warnings.push({
        path: "installFocus.failurePoints",
        message: "Install Focus should have at most 3 failure points",
        severity: "warning",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
