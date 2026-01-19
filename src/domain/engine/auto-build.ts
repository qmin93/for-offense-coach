// ============================================
// Auto-build Engine
// Concept → Actions 자동 생성
// ============================================

import { v4 as uuid } from "uuid";
import type {
  Play,
  Player,
  Action,
  RouteAction,
  BlockAction,
  MotionAction,
  LandmarkAction,
  Concept,
  Point,
  RoutePattern,
  BlockScheme,
  AutoBuildFailure,
  AutoBuildFailureCode,
  AutoBuildResult as TypedAutoBuildResult,
} from "../dsl/types";

// ============================================
// Types
// ============================================

export interface AutoBuildResult {
  success: boolean;
  actions: Action[];
  errors?: string[];
  failure?: AutoBuildFailure; // Typed failure info
  warnings?: string[];
  appliedActions?: number;
  coverage?: {
    allCovered: boolean;
    totalPlayers: number;
    playersWithActions: number;
    uncoveredRoles: string[];
    coveragePercent: number;
  };
}

export interface AutoBuildOptions {
  conflictPolicy?: "add_layer" | "replace_actions";
  side?: "left" | "right";
}

// ============================================
// Failure Helpers
// ============================================

function createFailure(
  code: AutoBuildFailureCode,
  message: string,
  suggestion: string,
  context?: Record<string, unknown>
): AutoBuildFailure {
  return { code, message, suggestion, context };
}

// ============================================
// Main Auto-build Function
// ============================================

export function autoBuildFromConcept(
  play: Play,
  concept: Concept,
  options: AutoBuildOptions = {}
): AutoBuildResult {
  const { conflictPolicy = "add_layer", side = "right" } = options;
  const actions: Action[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const players = play.roster.players;
  const template = concept.template;

  // Failure: No template defined
  if (!template || !template.roles) {
    return {
      success: false,
      actions: [],
      errors: ["Concept has no template roles defined"],
      failure: createFailure(
        "NO_MATCHING_ROLES",
        "This concept has no template defined",
        "Try a different concept or contact support",
        { conceptId: concept.id }
      ),
    };
  }

  // Pre-check: Eligible receivers for pass concepts
  if (concept.conceptType === "pass") {
    const eligibleRoles = ["X", "Y", "Z", "H", "RB", "FB"];
    const eligibleCount = players.filter(p => eligibleRoles.includes(p.role)).length;
    const minRequired = concept.requirements?.minEligibleReceivers || 1;

    if (eligibleCount < minRequired) {
      return {
        success: false,
        actions: [],
        errors: [`Need at least ${minRequired} eligible receivers, have ${eligibleCount}`],
        failure: createFailure(
          "NOT_ENOUGH_RECEIVERS",
          `This concept needs ${minRequired} eligible receivers, but only ${eligibleCount} are available`,
          "Add more skill players to your formation or choose a simpler concept",
          { required: minRequired, available: eligibleCount, conceptId: concept.id }
        ),
      };
    }
  }

  // Pre-check: Run concepts should have at least one eligible receiver split wide
  // (NCAA/NFL rules require 7 on LOS including at least 1 on each end)
  if (concept.conceptType === "run") {
    const wideReceiverRoles = ["X", "Z"]; // Split receivers
    const splitReceivers = players.filter(
      p => wideReceiverRoles.includes(p.role) &&
           Math.abs((p.alignment?.x || 0.5) - 0.5) > 0.2 // Actually split out
    );

    if (splitReceivers.length === 0) {
      warnings.push("Consider adding a split receiver for formation legality (7 on LOS rule)");
    }
  }

  // Pre-check: Puller requirements for run concepts
  if (concept.conceptType === "run" && concept.requirements?.needsPuller) {
    const olRoles = ["LT", "LG", "C", "RG", "RT"];
    const olPlayers = players.filter(p => olRoles.includes(p.role));

    if (concept.requirements.needsPuller === "GT" && olPlayers.length < 5) {
      return {
        success: false,
        actions: [],
        errors: ["This run concept needs full OL for pulling scheme"],
        failure: createFailure(
          "MISSING_PULLER",
          "This concept requires pulling guard/tackle",
          "Ensure you have a complete offensive line (5 OL) in your formation",
          { needsPuller: concept.requirements.needsPuller, conceptId: concept.id }
        ),
      };
    }
  }

  // Pre-check: Formation structure compatibility
  const prefStructures = concept.requirements?.preferredStructures;
  if (prefStructures && prefStructures.length > 0) {
    const currentStructure = detectFormationStructure(players);
    if (!prefStructures.includes(currentStructure as any)) {
      warnings.push(`Best in ${prefStructures.join("/")} formation, current: ${currentStructure}`);
    }
  }

  // Build actions from each role
  for (const role of template.roles) {
    // Find matching players for this role
    const matchingPlayers = players.filter((p) =>
      role.appliesTo.includes(p.role as any)
    );

    if (matchingPlayers.length === 0) {
      warnings.push(`No player found for role: ${role.roleName}`);
      continue; // Skip if no matching player
    }

    // Check if this is a "unit" role (applies to multiple OL or block/run role)
    // For OL roles (DOWN, ZONE, COMBO, etc.), apply to ALL matching OL players
    const isOLOnlyRole = isOLRole(role.appliesTo);
    const isMultiPlayerRole = role.appliesTo.length >= 2 && isOLOnlyRole;

    // For OL unit roles (any OL-only role), apply to ALL matching players
    // Otherwise, select the best player for the role
    const targetPlayers = isMultiPlayerRole
      ? matchingPlayers
      : [selectPlayerForRole(matchingPlayers, side, role.roleName)].filter(Boolean) as Player[];

    for (const targetPlayer of targetPlayers) {
      // Generate action based on concept type
      if (concept.conceptType === "pass" && "defaultRoute" in role) {
        const routeAction = buildRouteAction(
          targetPlayer,
          role.defaultRoute as Partial<RouteAction["route"]>,
          role.roleName
        );
        if (routeAction) {
          actions.push(routeAction);
        }
      } else if (concept.conceptType === "run" && "defaultBlock" in role) {
        // Special handling for RB "BALL" role - create run path (motion) instead of block
        if (role.roleName === "BALL" && ["RB", "FB", "QB"].includes(targetPlayer.role)) {
          const runPathAction = buildRunPathAction(
            targetPlayer,
            concept.runHints?.aim || "a_b_gap",
            side
          );
          if (runPathAction) {
            actions.push(runPathAction);
          }
        } else {
          const blockAction = buildBlockAction(
            targetPlayer,
            role.defaultBlock as Partial<BlockAction["block"]>,
            role.roleName,
            play
          );
          if (blockAction) {
            actions.push(blockAction);
          }
        }
      }
    }
  }

  // Helper to track players who already have actions
  const playersWithActionsSet = new Set(
    actions
      .filter((a): a is Action & { fromPlayerId: string } => "fromPlayerId" in a && !!a.fromPlayerId)
      .map(a => a.fromPlayerId)
  );
  const playerHasAction = (playerId: string) => playersWithActionsSet.has(playerId);

  // AUTO-ADD: OL pass protection for pass concepts
  if (concept.conceptType === "pass") {
    const olRoles = ["LT", "LG", "C", "RG", "RT"];
    const olPlayers = players.filter(p => olRoles.includes(p.role));

    for (const olPlayer of olPlayers) {
      if (!playerHasAction(olPlayer.id)) {
        const passProAction = buildPassProtectionAction(olPlayer, side);
        if (passProAction) {
          actions.push(passProAction);
          playersWithActionsSet.add(olPlayer.id);
        }
      }
    }
  }

  // AUTO-ADD: QB dropback for pass concepts
  if (concept.conceptType === "pass") {
    const qbPlayers = players.filter(p => p.role === "QB");

    for (const qbPlayer of qbPlayers) {
      if (!playerHasAction(qbPlayer.id)) {
        const dropbackAction = buildQBDropbackAction(qbPlayer, concept.passHints?.category || "intermediate");
        if (dropbackAction) {
          actions.push(dropbackAction);
          playersWithActionsSet.add(qbPlayer.id);
        }
      }
    }
  }

  // AUTO-ADD: FB blocking for run concepts (if not assigned)
  if (concept.conceptType === "run") {
    const fbPlayers = players.filter(p => p.role === "FB");

    for (const fbPlayer of fbPlayers) {
      if (!playerHasAction(fbPlayer.id)) {
        // FB typically leads or blocks based on run type
        const fbAction = buildFBLeadBlockAction(fbPlayer, side, concept.runHints?.aim || "b_gap");
        if (fbAction) {
          actions.push(fbAction);
          playersWithActionsSet.add(fbPlayer.id);
        }
      }
    }
  }

  // AUTO-ADD: WR stalk blocking for run concepts
  if (concept.conceptType === "run") {
    const wrRoles = ["X", "Z"];
    const wrPlayers = players.filter(p => wrRoles.includes(p.role));

    for (const wrPlayer of wrPlayers) {
      // Only add if player doesn't already have an action
      if (!playerHasAction(wrPlayer.id)) {
        const stalkAction = buildWRStalkBlockAction(wrPlayer, side);
        if (stalkAction) {
          actions.push(stalkAction);
          playersWithActionsSet.add(wrPlayer.id);
        }
      }
    }
  }

  // AUTO-ADD: TE arc/seal blocking for run concepts (if not assigned)
  if (concept.conceptType === "run") {
    const teRoles = ["Y"];
    const tePlayers = players.filter(p => teRoles.includes(p.role));

    for (const tePlayer of tePlayers) {
      // Only add if player doesn't already have an action
      if (!playerHasAction(tePlayer.id)) {
        const arcAction = buildTEArcBlockAction(tePlayer, side);
        if (arcAction) {
          actions.push(arcAction);
          playersWithActionsSet.add(tePlayer.id);
        }
      }
    }
  }

  // AUTO-ADD: QB mesh/handoff for run concepts
  if (concept.conceptType === "run") {
    const qbPlayers = players.filter(p => p.role === "QB");

    for (const qbPlayer of qbPlayers) {
      // Only add if QB doesn't already have an action
      if (!playerHasAction(qbPlayer.id)) {
        const meshAction = buildQBMeshAction(qbPlayer, side, concept.runHints?.aim || "b_gap");
        if (meshAction) {
          actions.push(meshAction);
          playersWithActionsSet.add(qbPlayer.id);
        }
      }
    }
  }

  // AUTO-ADD: H-back blocking for run concepts (if not assigned)
  if (concept.conceptType === "run") {
    const hRoles = ["H"];
    const hPlayers = players.filter(p => hRoles.includes(p.role));

    for (const hPlayer of hPlayers) {
      // Only add if H doesn't already have an action
      if (!playerHasAction(hPlayer.id)) {
        // H-backs typically crack or arc based on alignment
        const hAction = buildHBackBlockAction(hPlayer, side);
        if (hAction) {
          actions.push(hAction);
          playersWithActionsSet.add(hPlayer.id);
        }
      }
    }
  }

  // Add landmarks for run concepts
  if (concept.conceptType === "run" && template.buildPolicy?.runLandmarks) {
    const aimPoint = concept.runHints?.aim;
    if (aimPoint) {
      const landmark = buildAimPointLandmark(aimPoint, side);
      if (landmark) {
        actions.push(landmark);
      }
    }
  }

  // Check if we generated any actions
  if (actions.length === 0) {
    return {
      success: false,
      actions: [],
      errors: ["No actions could be generated from concept template"],
      failure: createFailure(
        "NO_MATCHING_ROLES",
        "Could not match concept roles to players in formation",
        "Try a different formation or concept that matches your player positions",
        { conceptId: concept.id, rolesCount: template.roles.length }
      ),
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // Calculate coverage info from final actions list
  const finalPlayersWithActions = new Set<string>();
  for (const action of actions) {
    if ("fromPlayerId" in action && action.fromPlayerId) {
      finalPlayersWithActions.add(action.fromPlayerId);
    }
  }

  const uncoveredPlayers = players.filter(p => !finalPlayersWithActions.has(p.id));
  const uncoveredRoles = uncoveredPlayers.map(p => p.role);

  // Add warning if not all players have actions
  if (uncoveredPlayers.length > 0) {
    warnings.push(`${uncoveredPlayers.length} player(s) without assignments: ${uncoveredRoles.join(", ")}`);
  }

  return {
    success: true,
    actions,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    appliedActions: actions.length,
    coverage: {
      allCovered: uncoveredPlayers.length === 0,
      totalPlayers: players.length,
      playersWithActions: finalPlayersWithActions.size,
      uncoveredRoles,
      coveragePercent: players.length > 0 ? Math.round((finalPlayersWithActions.size / players.length) * 100) : 0,
    },
  };
}

// ============================================
// Formation Detection
// ============================================

function detectFormationStructure(players: Player[]): string {
  const receivers = players.filter(p => ["X", "Y", "Z", "H"].includes(p.role));
  const leftReceivers = receivers.filter(p => (p.alignment?.x || 0.5) < 0.4).length;
  const rightReceivers = receivers.filter(p => (p.alignment?.x || 0.5) > 0.6).length;

  if (leftReceivers === 3 || rightReceivers === 3) return "3x1";
  if (leftReceivers === 2 && rightReceivers === 2) return "2x2";
  if (receivers.some(p => Math.abs((p.alignment?.x || 0.5) - 0.5) < 0.1)) return "bunch";

  // Check for backfield formations
  const rb = players.find(p => p.role === "RB");
  const fb = players.find(p => p.role === "FB");
  if (fb && rb) return "I";

  return "2x2"; // Default
}

// ============================================
// Helper Functions
// ============================================

// Helper to check if a role applies primarily to OL positions
function isOLRole(appliesTo: string[]): boolean {
  const olPositions = ["LT", "LG", "C", "RG", "RT"];
  const olCount = appliesTo.filter(role => olPositions.includes(role)).length;
  // Consider it an OL role if ALL positions are OL (pure OL role)
  // or if majority of positions are OL and there's at least 2 OL
  return olCount === appliesTo.length || (olCount >= Math.ceil(appliesTo.length / 2) && olCount >= 2);
}

function selectPlayerForRole(
  players: Player[],
  side: "left" | "right",
  roleName: string
): Player | undefined {
  if (players.length === 1) {
    return players[0];
  }

  // For roles that have side preference (like outside receivers)
  const preferRight = side === "right";

  // Sort by x position
  const sorted = [...players].sort((a, b) => {
    const ax = a.alignment?.x || 0.5;
    const bx = b.alignment?.x || 0.5;
    return preferRight ? bx - ax : ax - bx;
  });

  // Return based on role name hints
  if (roleName.includes("CLEAR") || roleName.includes("OUTSIDE")) {
    return sorted[0]; // Furthest out
  }
  if (roleName.includes("FLAT") || roleName.includes("UNDER")) {
    return sorted[sorted.length - 1] || sorted[0]; // Closest in
  }

  return sorted[0];
}

function buildRouteAction(
  player: Player,
  routeDefaults: Partial<RouteAction["route"]>,
  roleName: string
): RouteAction | null {
  const startX = player.alignment?.x || 0.5;
  const startY = player.alignment?.y || 0;
  const depth = routeDefaults.depth || 10;
  const pattern = routeDefaults.pattern || "hitch";

  // Generate control points based on pattern
  const controlPoints = generateRouteControlPoints(
    { x: startX, y: startY },
    pattern as RoutePattern,
    depth,
    routeDefaults.direction
  );

  return {
    id: `a_route_${uuid().slice(0, 8)}`,
    actionType: "route",
    fromPlayerId: player.id,
    layer: "primary",
    route: {
      pattern: pattern as RoutePattern,
      depth,
      controlPoints,
      endMarker: "arrow",
      ...routeDefaults,
    },
    timing: {
      phase: "post_snap",
    },
    style: {
      line: "solid",
      thickness: "normal",
    },
    meta: {
      conceptRole: roleName,
    },
  };
}

function generateRouteControlPoints(
  start: Point,
  pattern: RoutePattern,
  depth: number,
  direction?: "inside" | "outside" | "straight"
): Point[] {
  const depthNorm = depth / 50; // Normalize depth to 0-1 scale (50 yards visible)
  const points: Point[] = [{ x: start.x, y: start.y }];

  const isLeft = start.x < 0.5;
  const moveIn = direction === "inside" ? (isLeft ? 0.1 : -0.1) : 0;
  const moveOut = direction === "outside" ? (isLeft ? -0.1 : 0.1) : 0;

  switch (pattern) {
    case "go":
    case "seam":
      points.push({ x: start.x, y: start.y + depthNorm });
      break;

    case "hitch":
    case "curl":
      points.push({ x: start.x, y: start.y + depthNorm * 0.8 });
      points.push({ x: start.x, y: start.y + depthNorm });
      break;

    case "slant":
      points.push({ x: start.x, y: start.y + 0.05 });
      points.push({ x: start.x + (isLeft ? 0.15 : -0.15), y: start.y + depthNorm });
      break;

    case "out":
    case "quick_out":
    case "speed_out":
      points.push({ x: start.x, y: start.y + depthNorm * 0.7 });
      points.push({ x: start.x + (isLeft ? -0.12 : 0.12), y: start.y + depthNorm });
      break;

    case "deep_out":
      points.push({ x: start.x, y: start.y + depthNorm * 0.8 });
      points.push({ x: start.x + (isLeft ? -0.15 : 0.15), y: start.y + depthNorm });
      break;

    case "dig":
    case "cross":
      points.push({ x: start.x, y: start.y + depthNorm * 0.7 });
      points.push({ x: start.x + (isLeft ? 0.2 : -0.2), y: start.y + depthNorm });
      break;

    case "post":
      points.push({ x: start.x, y: start.y + depthNorm * 0.6 });
      points.push({ x: start.x + (isLeft ? 0.1 : -0.1), y: start.y + depthNorm });
      break;

    case "corner":
      points.push({ x: start.x, y: start.y + depthNorm * 0.6 });
      points.push({ x: start.x + (isLeft ? -0.15 : 0.15), y: start.y + depthNorm });
      break;

    case "arrow":
    case "flat":
      points.push({ x: start.x + (isLeft ? -0.1 : 0.1), y: start.y + 0.03 });
      break;

    case "shallow":
      points.push({ x: start.x, y: start.y + 0.04 });
      points.push({ x: start.x + (isLeft ? 0.25 : -0.25), y: start.y + 0.06 });
      break;

    case "wheel":
      points.push({ x: start.x + (isLeft ? -0.08 : 0.08), y: start.y });
      points.push({ x: start.x + (isLeft ? -0.1 : 0.1), y: start.y + depthNorm });
      break;

    default:
      points.push({ x: start.x + moveIn + moveOut, y: start.y + depthNorm });
  }

  return points;
}

function buildBlockAction(
  player: Player,
  blockDefaults: Partial<BlockAction["block"]>,
  roleName: string,
  play: Play
): BlockAction | null {
  const startX = player.alignment?.x || 0.5;
  const startY = player.alignment?.y || 0;
  const scheme = blockDefaults.scheme || "zone_step";

  // Generate block path based on scheme
  const { pathPoints, target } = generateBlockPath(
    { x: startX, y: startY },
    scheme as BlockScheme,
    roleName,
    play
  );

  return {
    id: `a_block_${uuid().slice(0, 8)}`,
    actionType: "block",
    fromPlayerId: player.id,
    layer: "primary",
    block: {
      scheme: scheme as BlockScheme,
      target: {
        type: "landmark",
        landmark: target,
      },
      pathPoints,
      lineStyle: {
        endCap: "slash",
        line: "solid",
      },
    },
    style: {
      line: "solid",
      endMarker: "arrow",
    },
    meta: {
      runRole: roleName,
    },
  };
}

function generateBlockPath(
  start: Point,
  scheme: BlockScheme,
  roleName: string,
  play: Play
): { pathPoints: Point[]; target: Point } {
  const isLeft = start.x < 0.5;
  const stepDir = isLeft ? -0.03 : 0.03;

  switch (scheme) {
    case "zone_step":
    case "reach":
      return {
        pathPoints: [
          start,
          { x: start.x + stepDir, y: start.y + 0.02 },
          { x: start.x + stepDir * 2, y: start.y + 0.06 },
        ],
        target: { x: start.x + stepDir * 2, y: start.y + 0.06 },
      };

    case "down":
      return {
        pathPoints: [
          start,
          { x: start.x + stepDir * 0.5, y: start.y + 0.04 },
        ],
        target: { x: start.x + stepDir * 0.5, y: start.y + 0.04 },
      };

    case "combo":
    case "climb":
      return {
        pathPoints: [
          start,
          { x: start.x, y: start.y + 0.03 },
          { x: start.x + stepDir, y: start.y + 0.08 },
        ],
        target: { x: start.x + stepDir, y: start.y + 0.08 },
      };

    case "pull_lead":
    case "pull_kick":
      // Pull around and lead
      const pullX = isLeft ? 0.62 : 0.38;
      return {
        pathPoints: [
          start,
          { x: start.x, y: start.y - 0.03 },
          { x: pullX, y: start.y - 0.03 },
          { x: pullX, y: start.y + 0.08 },
        ],
        target: { x: pullX, y: start.y + 0.08 },
      };

    case "kick":
      return {
        pathPoints: [
          start,
          { x: start.x + stepDir * 3, y: start.y + 0.06 },
        ],
        target: { x: start.x + stepDir * 3, y: start.y + 0.06 },
      };

    case "wrap":
      const wrapX = isLeft ? 0.58 : 0.42;
      return {
        pathPoints: [
          start,
          { x: start.x, y: start.y - 0.04 },
          { x: wrapX, y: start.y - 0.04 },
          { x: wrapX, y: start.y + 0.1 },
        ],
        target: { x: wrapX, y: start.y + 0.1 },
      };

    case "trap":
      const trapTarget = isLeft ? 0.52 : 0.48;
      return {
        pathPoints: [
          start,
          { x: start.x, y: start.y - 0.02 },
          { x: trapTarget, y: start.y + 0.04 },
        ],
        target: { x: trapTarget, y: start.y + 0.04 },
      };

    case "wham":
      return {
        pathPoints: [
          start,
          { x: start.x + (isLeft ? 0.1 : -0.1), y: start.y + 0.04 },
        ],
        target: { x: start.x + (isLeft ? 0.1 : -0.1), y: start.y + 0.04 },
      };

    case "seal":
    case "arc":
      return {
        pathPoints: [
          start,
          { x: start.x + stepDir * 2, y: start.y + 0.02 },
          { x: start.x + stepDir * 3, y: start.y + 0.08 },
        ],
        target: { x: start.x + stepDir * 3, y: start.y + 0.08 },
      };

    default:
      return {
        pathPoints: [start, { x: start.x, y: start.y + 0.05 }],
        target: { x: start.x, y: start.y + 0.05 },
      };
  }
}

function buildAimPointLandmark(
  aim: string,
  side: "left" | "right"
): LandmarkAction | null {
  const baseX = side === "right" ? 0.58 : 0.42;
  let x = baseX;
  let y = 0.08;

  // Adjust based on aim
  if (aim.includes("a")) {
    x = side === "right" ? 0.52 : 0.48;
  } else if (aim.includes("b")) {
    x = side === "right" ? 0.56 : 0.44;
  } else if (aim.includes("c")) {
    x = side === "right" ? 0.62 : 0.38;
  } else if (aim.includes("edge")) {
    x = side === "right" ? 0.7 : 0.3;
    y = 0.06;
  }

  return {
    id: `a_landmark_${uuid().slice(0, 8)}`,
    actionType: "landmark",
    layer: "primary",
    landmark: {
      kind: "aim_point",
      label: `Aim: ${aim.replace("_", " ")}`,
      x,
      y,
    },
    style: {
      line: "dashed",
    } as any,
  };
}

// ============================================
// QB Dropback Action (for pass concepts)
// ============================================

function buildQBDropbackAction(
  player: Player,
  category: string
): MotionAction | null {
  const startX = player.alignment?.x || 0.5;
  const startY = player.alignment?.y || -0.06;

  // Determine drop depth based on pass category
  let dropDepth = -0.12; // Default 5-step
  if (category === "quick") {
    dropDepth = -0.08; // 3-step
  } else if (category === "deep") {
    dropDepth = -0.16; // 7-step
  } else if (category === "screen") {
    dropDepth = -0.06; // Quick set
  }

  const pathPoints: Point[] = [
    { x: startX, y: startY },
    { x: startX, y: startY + dropDepth }, // Dropback
  ];

  return {
    id: `a_motion_${uuid().slice(0, 8)}`,
    actionType: "motion",
    fromPlayerId: player.id,
    layer: "primary",
    motion: {
      motionType: "run_path" as any, // Using motion for QB dropback
      pathPoints,
      endAlignment: pathPoints[pathPoints.length - 1],
    },
    timing: {
      phase: "post_snap",
    },
    style: {
      line: "dashed",
      endMarker: "none",
      thickness: "normal",
    } as any,
    meta: {
      passRole: "DROPBACK",
      category,
    },
  };
}

// ============================================
// FB Lead Block Action (for run concepts)
// ============================================

function buildFBLeadBlockAction(
  player: Player,
  side: "left" | "right",
  aim: string
): BlockAction | null {
  const startX = player.alignment?.x || 0.5;
  const startY = player.alignment?.y || -0.1;

  // FB leads through the hole based on aim point
  let targetX = side === "right" ? 0.54 : 0.46; // Default B-gap
  let targetY = startY + 0.15;

  if (aim.includes("a")) {
    targetX = side === "right" ? 0.52 : 0.48;
  } else if (aim.includes("b")) {
    targetX = side === "right" ? 0.55 : 0.45;
  } else if (aim.includes("c")) {
    targetX = side === "right" ? 0.60 : 0.40;
  } else if (aim.includes("edge")) {
    targetX = side === "right" ? 0.68 : 0.32;
    targetY = startY + 0.12;
  }

  const pathPoints: Point[] = [
    { x: startX, y: startY },
    { x: (startX + targetX) / 2, y: startY + 0.06 },
    { x: targetX, y: targetY },
  ];

  return {
    id: `a_block_${uuid().slice(0, 8)}`,
    actionType: "block",
    fromPlayerId: player.id,
    layer: "primary",
    block: {
      scheme: "pull_lead" as BlockScheme,
      target: {
        type: "landmark",
        landmark: pathPoints[pathPoints.length - 1],
      },
      pathPoints,
      lineStyle: {
        endCap: "slash",
        line: "solid",
      },
    },
    style: {
      line: "solid",
      endMarker: "arrow",
    },
    meta: {
      runRole: "FB_LEAD",
      aim,
    },
  };
}

// ============================================
// WR Stalk Block Action (for run concepts)
// ============================================

function buildWRStalkBlockAction(
  player: Player,
  side: "left" | "right"
): BlockAction | null {
  const startX = player.alignment?.x || 0.5;
  const startY = player.alignment?.y || 0;

  // Determine if this is playside or backside WR
  const isLeftSide = startX < 0.5;
  const isPlayside = side === "right" ? !isLeftSide : isLeftSide;

  // Stalk block: maintain leverage, inside-out position on CB
  // Playside: force stalk (seal CB/SS from pursuit)
  // Backside: cutoff stalk (inside-out leverage)
  const lateralMove = isPlayside
    ? (isLeftSide ? -0.02 : 0.02) // Slight outside release
    : (isLeftSide ? 0.03 : -0.03); // Inside-out position

  const pathPoints: Point[] = [
    { x: startX, y: startY },
    { x: startX + lateralMove, y: startY + 0.02 },
    { x: startX + lateralMove * 1.5, y: startY + 0.06 },
  ];

  return {
    id: `a_block_${uuid().slice(0, 8)}`,
    actionType: "block",
    fromPlayerId: player.id,
    layer: "primary",
    block: {
      scheme: "seal" as BlockScheme, // Stalk is like a seal block
      target: {
        type: "landmark",
        landmark: pathPoints[pathPoints.length - 1],
      },
      pathPoints,
      lineStyle: {
        endCap: "slash",
        line: "solid",
      },
    },
    style: {
      line: "solid",
      endMarker: "arrow",
    },
    meta: {
      runRole: isPlayside ? "STALK_FORCE" : "STALK_CUTOFF",
    },
  };
}

// ============================================
// TE Arc/Seal Block Action (for run concepts)
// ============================================

function buildTEArcBlockAction(
  player: Player,
  side: "left" | "right"
): BlockAction | null {
  const startX = player.alignment?.x || 0.5;
  const startY = player.alignment?.y || 0;

  // TE typically arcs to second level (LB or safety)
  const isLeftTE = startX < 0.5;
  const isPlayside = side === "right" ? !isLeftTE : isLeftTE;

  // Arc path: release outside, work up to 2nd level
  const arcDir = isPlayside
    ? (side === "right" ? 0.04 : -0.04)
    : (side === "right" ? -0.02 : 0.02);

  const pathPoints: Point[] = [
    { x: startX, y: startY },
    { x: startX + arcDir, y: startY + 0.03 },
    { x: startX + arcDir * 1.5, y: startY + 0.08 },
  ];

  return {
    id: `a_block_${uuid().slice(0, 8)}`,
    actionType: "block",
    fromPlayerId: player.id,
    layer: "primary",
    block: {
      scheme: "arc" as BlockScheme,
      target: {
        type: "landmark",
        landmark: pathPoints[pathPoints.length - 1],
      },
      pathPoints,
      lineStyle: {
        endCap: "slash",
        line: "solid",
      },
    },
    style: {
      line: "solid",
      endMarker: "arrow",
    },
    meta: {
      runRole: isPlayside ? "ARC_PLAYSIDE" : "ARC_BACKSIDE",
    },
  };
}

// ============================================
// H-Back Block Action (crack or arc)
// ============================================

function buildHBackBlockAction(
  player: Player,
  side: "left" | "right"
): BlockAction | null {
  const startX = player.alignment?.x || 0.5;
  const startY = player.alignment?.y || 0;

  // H-back: crack inside or arc outside based on alignment
  const isLeftH = startX < 0.5;
  const isPlayside = side === "right" ? !isLeftH : isLeftH;

  // If aligned wide, crack inside to EMOL/LB
  // If aligned tight, arc outside to force
  const isWideAligned = Math.abs(startX - 0.5) > 0.15;

  if (isWideAligned) {
    // Crack block: attack inside to EMOL or LB
    const crackDir = isLeftH ? 0.08 : -0.08;
    const pathPoints: Point[] = [
      { x: startX, y: startY },
      { x: startX + crackDir * 0.5, y: startY + 0.02 },
      { x: startX + crackDir, y: startY + 0.05 },
    ];

    return {
      id: `a_block_${uuid().slice(0, 8)}`,
      actionType: "block",
      fromPlayerId: player.id,
      layer: "primary",
      block: {
        scheme: "down" as BlockScheme, // Crack is like a down block
        target: {
          type: "landmark",
          landmark: pathPoints[pathPoints.length - 1],
        },
        pathPoints,
        lineStyle: {
          endCap: "slash",
          line: "solid",
        },
      },
      style: {
        line: "solid",
        endMarker: "arrow",
      },
      meta: {
        runRole: "CRACK",
      },
    };
  } else {
    // Arc block: release outside to force
    const arcDir = isPlayside
      ? (side === "right" ? 0.05 : -0.05)
      : (side === "right" ? -0.03 : 0.03);

    const pathPoints: Point[] = [
      { x: startX, y: startY },
      { x: startX + arcDir, y: startY + 0.03 },
      { x: startX + arcDir * 1.5, y: startY + 0.08 },
    ];

    return {
      id: `a_block_${uuid().slice(0, 8)}`,
      actionType: "block",
      fromPlayerId: player.id,
      layer: "primary",
      block: {
        scheme: "arc" as BlockScheme,
        target: {
          type: "landmark",
          landmark: pathPoints[pathPoints.length - 1],
        },
        pathPoints,
        lineStyle: {
          endCap: "slash",
          line: "solid",
        },
      },
      style: {
        line: "solid",
        endMarker: "arrow",
      },
      meta: {
        runRole: "ARC",
      },
    };
  }
}

// ============================================
// QB Mesh/Handoff Action (for run concepts)
// ============================================

function buildQBMeshAction(
  player: Player,
  side: "left" | "right",
  aim: string
): MotionAction | null {
  const startX = player.alignment?.x || 0.5;
  const startY = player.alignment?.y || -0.06;

  // QB mesh point: move toward handoff point
  const meshX = side === "right" ? startX + 0.03 : startX - 0.03;
  const meshY = startY + 0.02;

  // After handoff, QB fakes or boots opposite
  const bootDir = side === "right" ? -0.06 : 0.06;

  const pathPoints: Point[] = [
    { x: startX, y: startY },
    { x: meshX, y: meshY }, // Mesh point
    { x: meshX + bootDir, y: meshY - 0.02 }, // Boot fake
  ];

  return {
    id: `a_motion_${uuid().slice(0, 8)}`,
    actionType: "motion",
    fromPlayerId: player.id,
    layer: "primary",
    motion: {
      motionType: "run_path" as any,
      pathPoints,
      endAlignment: pathPoints[pathPoints.length - 1],
    },
    timing: {
      phase: "post_snap",
    },
    style: {
      line: "dashed",
      endMarker: "none",
      thickness: "normal",
    } as any,
    meta: {
      runRole: "MESH",
      aim,
    },
  };
}

// ============================================
// RB Run Path Action (for BALL carrier role)
// ============================================

function buildRunPathAction(
  player: Player,
  aim: string,
  side: "left" | "right"
): MotionAction | null {
  const startX = player.alignment?.x || 0.5;
  const startY = player.alignment?.y || -0.35;

  // Determine target based on aim point and side
  let targetX = side === "right" ? 0.56 : 0.44; // Default B-gap
  let targetY = startY + 0.2;

  if (aim.includes("a")) {
    targetX = side === "right" ? 0.52 : 0.48;
  } else if (aim.includes("b")) {
    targetX = side === "right" ? 0.56 : 0.44;
  } else if (aim.includes("c")) {
    targetX = side === "right" ? 0.62 : 0.38;
  } else if (aim.includes("edge")) {
    targetX = side === "right" ? 0.72 : 0.28;
    targetY = startY + 0.15;
  }

  const pathPoints: Point[] = [
    { x: startX, y: startY },
    { x: (startX + targetX) / 2, y: startY + 0.08 },
    { x: targetX, y: targetY },
  ];

  return {
    id: `a_motion_${uuid().slice(0, 8)}`,
    actionType: "motion",
    fromPlayerId: player.id,
    layer: "primary",
    motion: {
      motionType: "run_path" as any,
      pathPoints,
      endAlignment: pathPoints[pathPoints.length - 1],
    },
    timing: {
      phase: "post_snap",
    },
    style: {
      line: "solid",
      endMarker: "arrow",
      thickness: "bold",
    } as any,
    meta: {
      runRole: "BALL",
      aim,
    },
  };
}

// ============================================
// OL Pass Protection Action
// ============================================

function buildPassProtectionAction(
  player: Player,
  side: "left" | "right"
): BlockAction | null {
  const startX = player.alignment?.x || 0.5;
  const startY = player.alignment?.y || 0;

  // Pass protection: slight kick-step back and set
  const isPlayside = side === "right" ? startX > 0.5 : startX < 0.5;
  const kickDir = isPlayside ? (side === "right" ? 0.015 : -0.015) : 0;

  const pathPoints: Point[] = [
    { x: startX, y: startY },
    { x: startX + kickDir, y: startY - 0.02 },
    { x: startX + kickDir * 1.5, y: startY - 0.04 },
  ];

  return {
    id: `a_block_${uuid().slice(0, 8)}`,
    actionType: "block",
    fromPlayerId: player.id,
    layer: "primary",
    block: {
      scheme: "pass_set" as BlockScheme,
      target: {
        type: "landmark",
        landmark: pathPoints[pathPoints.length - 1],
      },
      pathPoints,
      lineStyle: {
        endCap: "flat",
        line: "solid",
      },
    },
    style: {
      line: "solid",
      endMarker: "none",
    },
    meta: {
      passProRole: "PASS_PRO",
    },
  };
}

// ============================================
// 11-Player Coverage Validation
// ============================================

export interface CoverageValidation {
  allCovered: boolean;
  totalPlayers: number;
  playersWithActions: number;
  uncoveredPlayers: Array<{ id: string; role: string }>;
  coveragePercent: number;
}

export function validateAllPlayersCovered(
  play: Play,
  actions: Action[]
): CoverageValidation {
  const players = play.roster.players;
  const totalPlayers = players.length;

  // Get all player IDs that have actions
  const playersWithActionsSet = new Set<string>();
  for (const action of actions) {
    if ("fromPlayerId" in action && action.fromPlayerId) {
      playersWithActionsSet.add(action.fromPlayerId);
    }
  }

  const playersWithActions = playersWithActionsSet.size;
  const uncoveredPlayers: Array<{ id: string; role: string }> = [];

  for (const player of players) {
    if (!playersWithActionsSet.has(player.id)) {
      uncoveredPlayers.push({ id: player.id, role: player.role });
    }
  }

  return {
    allCovered: uncoveredPlayers.length === 0,
    totalPlayers,
    playersWithActions,
    uncoveredPlayers,
    coveragePercent: totalPlayers > 0 ? Math.round((playersWithActions / totalPlayers) * 100) : 0,
  };
}

// ============================================
// Apply actions to play
// ============================================

export function applyAutoBuildToPlay(
  play: Play,
  result: AutoBuildResult,
  options: AutoBuildOptions = {}
): Play {
  const { conflictPolicy = "add_layer" } = options;

  let newActions: Action[];

  if (conflictPolicy === "replace_actions") {
    // Replace all existing actions
    newActions = result.actions;
  } else {
    // Merge actions intelligently - prevent duplicates (idempotent)
    const existingActions = [...play.actions];

    for (const newAction of result.actions) {
      // Check for duplicate landmarks (aim points) - only one per kind
      if (newAction.actionType === "landmark") {
        const landmarkAction = newAction as LandmarkAction;
        const existingIndex = existingActions.findIndex(
          (a) =>
            a.actionType === "landmark" &&
            (a as LandmarkAction).landmark.kind === landmarkAction.landmark.kind
        );

        if (existingIndex !== -1) {
          // Update existing landmark instead of adding duplicate
          existingActions[existingIndex] = {
            ...newAction,
            id: existingActions[existingIndex].id, // Keep original ID for React key stability
          };
          continue;
        }
      }

      // Check for duplicate routes from same player
      if (newAction.actionType === "route") {
        const routeAction = newAction as RouteAction;
        const existingIndex = existingActions.findIndex(
          (a) =>
            a.actionType === "route" &&
            (a as RouteAction).fromPlayerId === routeAction.fromPlayerId
        );

        if (existingIndex !== -1) {
          // Update existing route instead of adding duplicate
          existingActions[existingIndex] = {
            ...newAction,
            id: existingActions[existingIndex].id,
          };
          continue;
        }
      }

      // Check for duplicate blocks from same player
      if (newAction.actionType === "block") {
        const blockAction = newAction as BlockAction;
        const existingIndex = existingActions.findIndex(
          (a) =>
            a.actionType === "block" &&
            (a as BlockAction).fromPlayerId === blockAction.fromPlayerId
        );

        if (existingIndex !== -1) {
          // Update existing block instead of adding duplicate
          existingActions[existingIndex] = {
            ...newAction,
            id: existingActions[existingIndex].id,
          };
          continue;
        }
      }

      // No duplicate found, add as new action
      existingActions.push({
        ...newAction,
        layer: "secondary" as const,
      });
    }

    newActions = existingActions;
  }

  // Return a completely new object to ensure React re-render
  // Using spread creates shallow copies, but we need deep copy for nested objects
  return {
    ...play,
    roster: {
      ...play.roster,
      players: [...play.roster.players],
      groups: play.roster.groups ? [...play.roster.groups] : [],
    },
    actions: newActions,
    meta: { ...play.meta },
    field: play.field ? { ...play.field } : undefined,
    notes: play.notes ? { ...play.notes } : undefined,
    history: {
      ...play.history,
      version: (play.history?.version || 0) + 1,
    },
    updatedAt: new Date().toISOString(),
  };
}
