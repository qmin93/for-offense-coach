// ============================================
// Player Defaults System
// Role-based default actions that auto-apply
// ============================================

import { v4 as uuid } from "uuid";
import type {
  Play,
  Player,
  Action,
  PlayerRole,
  OffenseRole,
  RoutePattern,
  BlockScheme,
  BlockStyle,
  Point,
} from "../dsl/types";

// ============================================
// Types
// ============================================

export type DefaultActionType = "route" | "block" | "none";

export interface PlayerDefaultConfig {
  actionType: DefaultActionType;
  // Route defaults
  routePattern?: RoutePattern;
  // Block defaults
  blockScheme?: BlockScheme;
  blockStyle?: BlockStyle;
  blockAngle?: number; // degrees
}

export interface PlayerDefaults {
  [role: string]: PlayerDefaultConfig;
}

// ============================================
// Built-in Defaults
// ============================================

export const BUILTIN_DEFAULTS: PlayerDefaults = {
  // Offensive Line - zone step block at 0° (forward)
  LT: { actionType: "block", blockScheme: "zone_step", blockStyle: "zone_step", blockAngle: 0 },
  LG: { actionType: "block", blockScheme: "zone_step", blockStyle: "zone_step", blockAngle: 0 },
  C: { actionType: "block", blockScheme: "zone_step", blockStyle: "zone_step", blockAngle: 0 },
  RG: { actionType: "block", blockScheme: "zone_step", blockStyle: "zone_step", blockAngle: 0 },
  RT: { actionType: "block", blockScheme: "zone_step", blockStyle: "zone_step", blockAngle: 0 },

  // Skill positions - no defaults (coach draws them)
  QB: { actionType: "none" },
  RB: { actionType: "none" },
  FB: { actionType: "block", blockScheme: "kick", blockStyle: "drive", blockAngle: 0 },

  // Receivers - no default (route varies per play)
  X: { actionType: "none" },
  Y: { actionType: "none" },
  Z: { actionType: "none" },
  H: { actionType: "none" },
};

// ============================================
// Local Storage Persistence
// ============================================

const STORAGE_KEY = "playerDefaults_v1";

export function loadPlayerDefaults(): PlayerDefaults {
  if (typeof window === "undefined") return BUILTIN_DEFAULTS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with builtins to ensure all roles have defaults
      return { ...BUILTIN_DEFAULTS, ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
  return BUILTIN_DEFAULTS;
}

export function savePlayerDefaults(defaults: PlayerDefaults): void {
  if (typeof window === "undefined") return;

  try {
    // Only save overrides (diff from builtins)
    const overrides: PlayerDefaults = {};
    for (const [role, config] of Object.entries(defaults)) {
      const builtin = BUILTIN_DEFAULTS[role];
      if (!builtin || JSON.stringify(config) !== JSON.stringify(builtin)) {
        overrides[role] = config;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore storage errors
  }
}

export function resetPlayerDefaults(): PlayerDefaults {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return BUILTIN_DEFAULTS;
}

// ============================================
// Apply Defaults to Play
// ============================================

/**
 * Generate default actions for all offense players based on their roles
 * Returns new actions to add (does not modify play)
 */
export function generateDefaultActions(
  play: Play,
  defaults: PlayerDefaults = BUILTIN_DEFAULTS
): Action[] {
  const newActions: Action[] = [];

  for (const player of play.roster.players) {
    // Only apply to offense players
    if (player.unit !== "offense") continue;

    // Check if player already has an action
    const hasAction = play.actions.some((a) => a.fromPlayerId === player.id);
    if (hasAction) continue;

    const config = defaults[player.role];
    if (!config || config.actionType === "none") continue;

    const action = createDefaultAction(player, config);
    if (action) {
      newActions.push(action);
    }
  }

  return newActions;
}

/**
 * Create a single default action for a player
 */
function createDefaultAction(
  player: Player,
  config: PlayerDefaultConfig
): Action | null {
  const startPoint: Point = { x: player.alignment.x, y: player.alignment.y };

  if (config.actionType === "route" && config.routePattern) {
    // Create route action
    const endPoint = calculateRouteEndpoint(startPoint, config.routePattern);
    return {
      id: `a_route_${uuid().slice(0, 8)}`,
      actionType: "route",
      fromPlayerId: player.id,
      layer: "primary",
      route: {
        pattern: config.routePattern,
        controlPoints: [startPoint, endPoint],
        endMarker: "arrow",
      },
      timing: { phase: "post_snap" },
      style: { line: "solid", thickness: "normal" },
    } as Action;
  }

  if (config.actionType === "block") {
    // Create block action with angle
    const angle = config.blockAngle ?? 0;
    const length = 0.08; // Standard block length

    // Calculate end point based on angle
    // 0° = straight forward (up/positive y)
    const radians = (angle * Math.PI) / 180;
    const endPoint: Point = {
      x: startPoint.x + Math.sin(radians) * length,
      y: startPoint.y + Math.cos(radians) * length,
    };

    return {
      id: `a_block_${uuid().slice(0, 8)}`,
      actionType: "block",
      fromPlayerId: player.id,
      layer: "primary",
      block: {
        scheme: config.blockScheme || "zone_step",
        target: { landmark: endPoint },
        pathPoints: [startPoint, endPoint],
        angleDeg: angle,
        length,
        style: config.blockStyle || "zone_step",
      },
      style: { line: "solid", endMarker: "arrow" },
    } as Action;
  }

  return null;
}

/**
 * Calculate route endpoint based on pattern
 */
function calculateRouteEndpoint(start: Point, pattern: RoutePattern): Point {
  // Simple route calculations (can be expanded)
  const routeDepth = 0.15; // ~5 yards normalized

  switch (pattern) {
    case "fade":
    case "go":
      return { x: start.x, y: start.y + routeDepth * 2 };
    case "slant":
      return { x: start.x + (start.x < 0.5 ? 0.1 : -0.1), y: start.y + routeDepth * 0.7 };
    case "out":
      return { x: start.x + (start.x < 0.5 ? -0.15 : 0.15), y: start.y + routeDepth };
    case "in":
    case "dig":
      return { x: start.x + (start.x < 0.5 ? 0.15 : -0.15), y: start.y + routeDepth };
    case "curl":
    case "comeback":
      return { x: start.x, y: start.y + routeDepth };
    case "hitch":
      return { x: start.x, y: start.y + routeDepth * 0.5 };
    case "post":
      return { x: 0.5, y: start.y + routeDepth * 1.5 };
    case "corner":
      return { x: start.x + (start.x < 0.5 ? -0.2 : 0.2), y: start.y + routeDepth * 1.5 };
    case "flat":
      return { x: start.x + (start.x < 0.5 ? -0.1 : 0.1), y: start.y + routeDepth * 0.3 };
    case "wheel":
      return { x: start.x + (start.x < 0.5 ? -0.1 : 0.1), y: start.y + routeDepth * 1.5 };
    default:
      return { x: start.x, y: start.y + routeDepth };
  }
}

/**
 * Apply default actions to a play (modifies and returns new play)
 */
export function applyDefaultsToPlay(
  play: Play,
  defaults: PlayerDefaults = BUILTIN_DEFAULTS
): Play {
  const newActions = generateDefaultActions(play, defaults);

  if (newActions.length === 0) {
    return play;
  }

  return {
    ...play,
    actions: [...play.actions, ...newActions],
    updatedAt: new Date().toISOString(),
  };
}
