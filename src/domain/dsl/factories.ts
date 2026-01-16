// ============================================
// DSL Factory Functions
// Create new DSL objects with defaults
// ============================================

import { v4 as uuid } from "uuid";
import type {
  Play,
  Player,
  Formation,
  RouteAction,
  BlockAction,
  MotionAction,
  LandmarkAction,
  TextAction,
  Point,
  PlayerRole,
  RoutePattern,
  BlockScheme,
  MotionType,
} from "./types";
import { CURRENT_SCHEMA_VERSION } from "./versioning";

// ============================================
// Play Factory
// ============================================

export function createPlay(
  name: string,
  options?: Partial<Play>
): Play {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    type: "play",
    id: uuid(),
    name,
    description: "",
    tags: [],
    meta: {
      personnel: "11",
      unit: "offense",
      strength: "right",
    },
    field: {
      orientation: "up",
      showGrid: true,
      showHash: true,
    },
    roster: {
      players: [],
      groups: [],
    },
    actions: [],
    notes: {
      callName: name,
      coachingPoints: [],
    },
    history: {
      version: 1,
      derivedFrom: {},
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...options,
  };
}

// ============================================
// Player Factory
// ============================================

export function createPlayer(
  role: PlayerRole,
  position: Point,
  options?: Partial<Player>
): Player {
  const label = role;
  return {
    id: `p_${role.toLowerCase()}_${uuid().slice(0, 4)}`,
    role,
    label,
    unit: "offense",
    alignment: {
      x: position.x,
      y: position.y,
      facing: "up",
      stance: role === "QB" ? "two_point" : "three_point",
    },
    appearance: {
      icon: "circle",
      colorToken: "offense",
      showLabel: true,
    },
    lock: {
      positionLocked: false,
    },
    ...options,
  };
}

// ============================================
// Action Factories
// ============================================

export function createRouteAction(
  fromPlayerId: string,
  pattern: RoutePattern,
  controlPoints: Point[],
  options?: Partial<RouteAction>
): RouteAction {
  return {
    id: `a_route_${uuid().slice(0, 8)}`,
    actionType: "route",
    fromPlayerId,
    layer: "primary",
    route: {
      pattern,
      controlPoints,
      endMarker: "arrow",
    },
    timing: {
      phase: "post_snap",
    },
    style: {
      line: "solid",
      thickness: "normal",
    },
    ...options,
  };
}

export function createBlockAction(
  fromPlayerId: string,
  scheme: BlockScheme,
  target: Point,
  options?: Partial<BlockAction>
): BlockAction {
  return {
    id: `a_block_${uuid().slice(0, 8)}`,
    actionType: "block",
    fromPlayerId,
    layer: "primary",
    block: {
      scheme,
      target: {
        type: "landmark",
        landmark: target,
      },
      lineStyle: {
        endCap: "slash",
        line: "solid",
      },
    },
    style: {
      line: "solid",
      endMarker: "arrow",
    },
    ...options,
  };
}

export function createMotionAction(
  fromPlayerId: string,
  motionType: MotionType,
  pathPoints: Point[],
  options?: Partial<MotionAction>
): MotionAction {
  return {
    id: `a_motion_${uuid().slice(0, 8)}`,
    actionType: "motion",
    fromPlayerId,
    layer: "primary",
    motion: {
      motionType,
      pathPoints,
      endAlignment: pathPoints[pathPoints.length - 1],
    },
    timing: {
      phase: "pre_snap",
    },
    style: {
      line: "dashed",
      endMarker: "none",
    },
    ...options,
  };
}

export function createLandmarkAction(
  kind: "aim_point" | "read_key" | "landmark",
  position: Point,
  label?: string,
  options?: Partial<LandmarkAction>
): LandmarkAction {
  return {
    id: `a_landmark_${uuid().slice(0, 8)}`,
    actionType: "landmark",
    layer: "primary",
    landmark: {
      kind,
      label,
      x: position.x,
      y: position.y,
    },
    style: {
      icon: "dot",
      size: "small",
    } as any,
    ...options,
  };
}

export function createTextAction(
  value: string,
  position: Point,
  options?: Partial<TextAction>
): TextAction {
  return {
    id: `a_text_${uuid().slice(0, 8)}`,
    actionType: "text",
    layer: "primary",
    text: {
      value,
      x: position.x,
      y: position.y,
      width: 0.3,
      align: "left",
    },
    textStyle: {
      fontSize: "sm",
      box: false,
    },
    ...options,
  };
}

// ============================================
// Formation-based Play Creation
// ============================================

export function createPlayFromFormation(
  formation: Formation,
  name?: string
): Play {
  // IMPORTANT: Generate new player IDs every time to ensure uniqueness
  // This prevents issues when comparing/merging plays and ensures React keys are stable
  const players: Player[] = formation.defaults.players.map((p) => ({
    id: `p_${p.role.toLowerCase()}_${uuid().slice(0, 8)}`, // Always generate new ID
    role: p.role,
    label: p.label,
    unit: "offense" as const,
    alignment: {
      x: p.alignment.x,
      y: p.alignment.y,
      facing: p.alignment.facing,
      stance: p.alignment.stance,
      splitPreset: p.alignment.splitPreset,
    },
    appearance: {
      icon: "circle" as const,
      colorToken: "offense" as const,
      showLabel: true,
    },
    lock: { positionLocked: false },
  }));

  return createPlay(name || `${formation.name} - New Play`, {
    meta: {
      personnel: formation.meta?.personnelHint?.[0] || "11",
      unit: "offense",
      strength: formation.meta?.strength || "right",
      formationId: formation.id,
    },
    roster: {
      players,
      groups: [],
    },
  });
}
