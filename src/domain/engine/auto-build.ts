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
} from "../dsl/types";

// ============================================
// Types
// ============================================

export interface AutoBuildResult {
  success: boolean;
  actions: Action[];
  errors?: string[];
}

export interface AutoBuildOptions {
  conflictPolicy?: "add_layer" | "replace_actions";
  side?: "left" | "right";
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

  const players = play.roster.players;
  const template = concept.template;

  if (!template || !template.roles) {
    return {
      success: false,
      actions: [],
      errors: ["Concept has no template roles defined"],
    };
  }

  // Build actions from each role
  for (const role of template.roles) {
    // Find matching players for this role
    const matchingPlayers = players.filter((p) =>
      role.appliesTo.includes(p.role as any)
    );

    if (matchingPlayers.length === 0) {
      continue; // Skip if no matching player
    }

    // Get the first matching player (or based on side preference)
    const targetPlayer = selectPlayerForRole(matchingPlayers, side, role.roleName);

    if (!targetPlayer) continue;

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

  return {
    success: true,
    actions,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ============================================
// Helper Functions
// ============================================

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
        landmark: target,
      },
      pathPoints,
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
    // Add as new layer (secondary)
    const layeredActions = result.actions.map((action) => ({
      ...action,
      layer: "secondary" as const,
    }));
    newActions = [...play.actions, ...layeredActions];
  }

  return {
    ...play,
    actions: newActions,
    updatedAt: new Date().toISOString(),
    history: {
      ...play.history,
      version: (play.history?.version || 0) + 1,
    },
  };
}
