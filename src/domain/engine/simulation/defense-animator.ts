// ============================================
// Defense Animation Engine
// Animate defensive players based on coverage
// ============================================

import type { Play, Player, Point } from "@/domain/dsl/types";
import {
  type SimulatedPlayer,
  type PlayPhase,
  type CoverageType,
  COVER_3_ZONES,
  getSpeedForRole,
} from "./types";

// ============================================
// Coverage Detection
// ============================================

/**
 * Determine coverage type from shell setting
 */
export function getCoverageType(shellType: string): CoverageType {
  switch (shellType.toLowerCase()) {
    case "cover0":
    case "0":
      return "cover0";
    case "cover1":
    case "1":
    case "1high":
      return "cover1";
    case "cover2":
    case "2":
    case "2high":
      return "cover2";
    case "cover3":
    case "3":
      return "cover3";
    case "cover4":
    case "4":
    case "quarters":
      return "cover4";
    case "cover6":
    case "6":
      return "cover6";
    case "man":
      return "man";
    default:
      return "cover3"; // Default to cover 3
  }
}

// ============================================
// Zone Coverage (Cover 3)
// ============================================

/**
 * Get zone drop position for Cover 3
 */
export function getCover3ZonePosition(
  player: Player,
  phase: PlayPhase,
  phaseProgress: number
): Point {
  const role = player.role;
  const originalPos: Point = { x: player.alignment.x, y: player.alignment.y };

  // Find zone assignment for this role
  const zone = COVER_3_ZONES.find(z => z.defenseRole === role);
  if (!zone) {
    // No zone assignment, stay in place (DL rush)
    if (["DE", "DT", "NT"].includes(role)) {
      return getDLineRushPosition(player, phase, phaseProgress);
    }
    return originalPos;
  }

  // Animate drop to zone
  if (phase === "pre_snap") {
    return originalPos;
  }

  const targetPos = zone.zoneCenter;

  // Phase-based progression
  let progress = 0;
  switch (phase) {
    case "snap":
      progress = phaseProgress * 0.3; // Start moving
      break;
    case "t1":
      progress = 0.3 + phaseProgress * 0.4; // Continue to zone
      break;
    case "t2":
    case "t3":
      progress = 0.7 + phaseProgress * 0.3; // Settle in zone
      break;
  }

  progress = Math.min(1, progress);

  return {
    x: originalPos.x + (targetPos.x - originalPos.x) * progress,
    y: originalPos.y + (targetPos.y - originalPos.y) * progress,
  };
}

// ============================================
// Man Coverage (Cover 1)
// ============================================

/**
 * Get man coverage position (following assigned receiver)
 */
export function getCover1ManPosition(
  defensePlayer: Player,
  offenseCurrentPos: Point,
  cushion: number = 0.03 // Trailing distance in normalized coords
): Point {
  // Man coverage: stay slightly behind and to the side of receiver
  // DB stays between receiver and end zone
  return {
    x: offenseCurrentPos.x,
    y: offenseCurrentPos.y + cushion, // Stay behind (toward defense's goal)
  };
}

// ============================================
// Blitz Path (Cover 0)
// ============================================

/**
 * Get blitz path for Cover 0 (all out blitz)
 */
export function getCover0BlitzPath(
  defensePlayer: Player,
  qbPos: Point,
  phase: PlayPhase,
  phaseProgress: number
): Point {
  const originalPos: Point = { x: defensePlayer.alignment.x, y: defensePlayer.alignment.y };

  if (phase === "pre_snap") {
    return originalPos;
  }

  // All defenders rush the QB
  const targetPos = qbPos;

  // Fast rush
  let progress = 0;
  switch (phase) {
    case "snap":
      progress = phaseProgress * 0.4;
      break;
    case "t1":
      progress = 0.4 + phaseProgress * 0.4;
      break;
    case "t2":
    case "t3":
      progress = 0.8 + phaseProgress * 0.2;
      break;
  }

  progress = Math.min(1, progress);

  return {
    x: originalPos.x + (targetPos.x - originalPos.x) * progress,
    y: originalPos.y + (targetPos.y - originalPos.y) * progress,
  };
}

// ============================================
// D-Line Rush
// ============================================

/**
 * Get defensive line rush position
 */
function getDLineRushPosition(
  player: Player,
  phase: PlayPhase,
  phaseProgress: number
): Point {
  const originalPos: Point = { x: player.alignment.x, y: player.alignment.y };

  if (phase === "pre_snap") {
    return originalPos;
  }

  // Rush toward backfield (negative Y direction)
  const rushDepth = -0.05; // 2.5 yards into backfield

  let progress = 0;
  switch (phase) {
    case "snap":
      progress = phaseProgress * 0.5;
      break;
    case "t1":
      progress = 0.5 + phaseProgress * 0.3;
      break;
    case "t2":
    case "t3":
      progress = 0.8 + phaseProgress * 0.2;
      break;
  }

  progress = Math.min(1, progress);

  return {
    x: originalPos.x,
    y: originalPos.y + rushDepth * progress,
  };
}

// ============================================
// Main Defense Simulation
// ============================================

/**
 * Simulate all defensive players at a given time
 */
export function simulateDefenseAtTime(
  play: Play,
  offensePositions: Map<string, Point>,
  currentMs: number,
  coverageType: CoverageType,
  phase: PlayPhase,
  phaseProgress: number
): SimulatedPlayer[] {
  const defensePlayers = play.roster.players.filter(p => p.unit === "defense");
  const simulated: SimulatedPlayer[] = [];

  // Find QB position (for blitz target)
  const qbPlayer = play.roster.players.find(p => p.role === "QB");
  const qbPos = qbPlayer
    ? offensePositions.get(qbPlayer.id) || { x: qbPlayer.alignment.x, y: qbPlayer.alignment.y }
    : { x: 0.5, y: -0.1 };

  for (const player of defensePlayers) {
    let currentPosition: Point;
    let isMoving = phase !== "pre_snap";

    switch (coverageType) {
      case "cover0":
        // All out blitz
        currentPosition = getCover0BlitzPath(player, qbPos, phase, phaseProgress);
        break;

      case "cover1":
      case "man":
        // Man coverage with single high safety
        if (player.role === "FS") {
          // Free safety stays deep middle
          currentPosition = getCover3ZonePosition(player, phase, phaseProgress);
        } else if (["CB", "SS", "OLB", "ILB"].includes(player.role)) {
          // Find man assignment
          const coveredPlayer = findManAssignment(player, play);
          if (coveredPlayer) {
            const offensePos = offensePositions.get(coveredPlayer.id);
            if (offensePos) {
              currentPosition = getCover1ManPosition(player, offensePos);
            } else {
              currentPosition = getCover3ZonePosition(player, phase, phaseProgress);
            }
          } else {
            currentPosition = getCover3ZonePosition(player, phase, phaseProgress);
          }
        } else {
          // DL rush
          currentPosition = getDLineRushPosition(player, phase, phaseProgress);
        }
        break;

      case "cover3":
      default:
        // Zone coverage
        currentPosition = getCover3ZonePosition(player, phase, phaseProgress);
        break;
    }

    simulated.push({
      playerId: player.id,
      role: player.role,
      currentPosition,
      pathProgress: phaseProgress,
      isMoving,
    });
  }

  return simulated;
}

/**
 * Find man coverage assignment for a defender
 */
function findManAssignment(defensePlayer: Player, play: Play): Player | null {
  const offensePlayers = play.roster.players.filter(p => p.unit === "offense");

  // Simple assignment logic based on position
  const role = defensePlayer.role;
  const defX = defensePlayer.alignment.x;

  // CBs cover outside receivers
  if (role === "CB") {
    // Find closest receiver on same side
    const receivers = offensePlayers.filter(p => ["X", "Z", "WR"].includes(p.role));
    const sameSide = defX < 0.5
      ? receivers.filter(p => p.alignment.x < 0.4)
      : receivers.filter(p => p.alignment.x > 0.6);

    if (sameSide.length > 0) {
      return sameSide[0];
    }
    return receivers[0] || null;
  }

  // SS covers TE (Y role)
  if (role === "SS") {
    return offensePlayers.find(p => p.role === "Y") || null;
  }

  // LBs cover slot/RB
  if (["ILB", "OLB", "LB", "Mike", "Sam", "Will"].includes(role)) {
    const slot = offensePlayers.find(p => p.role === "H");
    if (slot) return slot;
    // RB role or FB (fullback)
    return offensePlayers.find(p => p.role === "RB" || p.role === "FB") || null;
  }

  return null;
}

