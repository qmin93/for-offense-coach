// ============================================
// Offense Animation Engine
// Animate offensive players along routes/blocks
// ============================================

import type { Play, Player, Point, RouteAction, MotionAction, BlockAction } from "@/domain/dsl/types";
import {
  type SimulatedPlayer,
  type PlayPhase,
  getSpeedForRole,
  getPhaseAtTime,
  DEFAULT_SIMULATION_CONFIG,
} from "./types";
import { distanceInYards, yardsToNormalizedY, yardsToNormalizedX } from "../yard-utils";

// ============================================
// Path Interpolation
// ============================================

/**
 * Get position on a path given progress (0-1)
 * Supports both linear (polyline) and curved (bezier) modes
 */
export function getPositionOnPath(
  controlPoints: Point[],
  progress: number,
  curveMode: boolean = false
): Point {
  if (controlPoints.length === 0) {
    return { x: 0.5, y: 0 };
  }
  if (controlPoints.length === 1 || progress <= 0) {
    return controlPoints[0];
  }
  if (progress >= 1) {
    return controlPoints[controlPoints.length - 1];
  }

  if (curveMode && controlPoints.length >= 3) {
    // Bezier curve interpolation
    return getBezierPosition(controlPoints, progress);
  } else {
    // Linear interpolation along segments
    return getLinearPosition(controlPoints, progress);
  }
}

/**
 * Linear interpolation along polyline segments
 */
function getLinearPosition(points: Point[], progress: number): Point {
  // Calculate total length
  let totalLength = 0;
  const segmentLengths: number[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const len = distanceInYards(points[i], points[i + 1]);
    segmentLengths.push(len);
    totalLength += len;
  }

  // Find position at progress
  const targetLength = totalLength * progress;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    if (accumulated + segmentLengths[i] >= targetLength) {
      const ratio = (targetLength - accumulated) / segmentLengths[i];
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * ratio,
        y: points[i].y + (points[i + 1].y - points[i].y) * ratio,
      };
    }
    accumulated += segmentLengths[i];
  }

  return points[points.length - 1];
}

/**
 * Bezier curve interpolation (Catmull-Rom spline)
 */
function getBezierPosition(points: Point[], progress: number): Point {
  // Use Catmull-Rom spline for smooth curves through all points
  const n = points.length - 1;
  const t = progress * n;
  const i = Math.min(Math.floor(t), n - 1);
  const localT = t - i;

  // Get 4 control points for Catmull-Rom
  const p0 = points[Math.max(0, i - 1)];
  const p1 = points[i];
  const p2 = points[Math.min(n, i + 1)];
  const p3 = points[Math.min(n, i + 2)];

  return catmullRomInterpolate(p0, p1, p2, p3, localT);
}

/**
 * Catmull-Rom spline interpolation between 4 points
 */
function catmullRomInterpolate(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const t2 = t * t;
  const t3 = t2 * t;

  const x =
    0.5 * (
      (2 * p1.x) +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
    );

  const y =
    0.5 * (
      (2 * p1.y) +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
    );

  return { x, y };
}

// ============================================
// Action Timing
// ============================================

/**
 * Get route action timing (when it starts and how long it runs)
 */
function getRouteActionTiming(action: RouteAction): { startMs: number; durationMs: number } {
  // Routes start at snap
  const startMs = 500; // snap phase start

  // Calculate duration based on path length and player speed
  const points = action.route.controlPoints;
  if (points.length < 2) {
    return { startMs, durationMs: 500 };
  }

  // Calculate total distance in yards
  let totalYards = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalYards += distanceInYards(points[i], points[i + 1]);
  }

  // Assume average WR speed of 8 yards/second
  const speedYps = 8;
  const durationMs = (totalYards / speedYps) * 1000;

  return { startMs, durationMs: Math.max(500, Math.min(durationMs, 2500)) };
}

/**
 * Get motion action timing (pre-snap motion)
 */
function getMotionActionTiming(action: MotionAction): { startMs: number; durationMs: number } {
  // Motion is pre-snap
  return { startMs: 0, durationMs: 500 };
}

// ============================================
// Offense Simulation
// ============================================

/**
 * Simulate all offensive players at a given time
 */
export function simulateOffenseAtTime(
  play: Play,
  currentMs: number,
  phase: PlayPhase
): SimulatedPlayer[] {
  const offensePlayers = play.roster.players.filter(p => p.unit === "offense");
  const simulated: SimulatedPlayer[] = [];

  for (const player of offensePlayers) {
    const simulatedPlayer = simulateOffensePlayer(play, player, currentMs, phase);
    simulated.push(simulatedPlayer);
  }

  return simulated;
}

/**
 * Simulate a single offensive player
 */
function simulateOffensePlayer(
  play: Play,
  player: Player,
  currentMs: number,
  phase: PlayPhase
): SimulatedPlayer {
  // Default: player stays at alignment
  let currentPosition: Point = {
    x: player.alignment.x,
    y: player.alignment.y,
  };
  let pathProgress = 0;
  let isMoving = false;

  // Find actions for this player
  const playerActions = play.actions.filter(a =>
    "fromPlayerId" in a && a.fromPlayerId === player.id
  );

  // Process motion actions (pre-snap)
  const motionAction = playerActions.find(a => a.actionType === "motion") as MotionAction | undefined;
  if (motionAction && phase === "pre_snap") {
    const timing = getMotionActionTiming(motionAction);
    if (currentMs >= timing.startMs && currentMs < timing.startMs + timing.durationMs) {
      const actionProgress = (currentMs - timing.startMs) / timing.durationMs;
      const curveMode = motionAction.motion.curveMode ?? false;
      currentPosition = getPositionOnPath(
        motionAction.motion.pathPoints,
        actionProgress,
        curveMode
      );
      pathProgress = actionProgress;
      isMoving = true;
    } else if (currentMs >= timing.startMs + timing.durationMs) {
      // Motion complete, use end position
      currentPosition = motionAction.motion.endAlignment || motionAction.motion.pathPoints[motionAction.motion.pathPoints.length - 1];
      pathProgress = 1;
    }
  }

  // Process route actions (post-snap)
  const routeAction = playerActions.find(a => a.actionType === "route") as RouteAction | undefined;
  if (routeAction && (phase === "snap" || phase === "t1" || phase === "t2" || phase === "t3")) {
    const timing = getRouteActionTiming(routeAction);
    if (currentMs >= timing.startMs) {
      const actionProgress = Math.min(1, (currentMs - timing.startMs) / timing.durationMs);
      const curveMode = routeAction.route.curveMode ?? false;
      currentPosition = getPositionOnPath(
        routeAction.route.controlPoints,
        actionProgress,
        curveMode
      );
      pathProgress = actionProgress;
      isMoving = actionProgress < 1;
    }
  }

  // Process block actions (post-snap, short duration)
  const blockAction = playerActions.find(a => a.actionType === "block") as BlockAction | undefined;
  if (blockAction && blockAction.block.pathPoints && (phase === "snap" || phase === "t1")) {
    const startMs = 500;
    const durationMs = 300; // Blocks are quick
    if (currentMs >= startMs && currentMs < startMs + durationMs) {
      const actionProgress = (currentMs - startMs) / durationMs;
      currentPosition = getPositionOnPath(
        blockAction.block.pathPoints,
        actionProgress,
        false // Blocks are linear
      );
      pathProgress = actionProgress;
      isMoving = true;
    } else if (currentMs >= startMs + durationMs) {
      // Block complete, stay at end
      const pts = blockAction.block.pathPoints;
      currentPosition = pts[pts.length - 1];
      pathProgress = 1;
    }
  }

  return {
    playerId: player.id,
    role: player.role,
    currentPosition,
    pathProgress,
    isMoving,
  };
}

