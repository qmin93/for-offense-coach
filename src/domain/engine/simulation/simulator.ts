// ============================================
// Main Simulation Engine
// React hook for play simulation
// ============================================

import { useMemo, useEffect, useRef, useState } from "react";
import type { Play, Point } from "@/domain/dsl/types";
import {
  type SimulationFrame,
  type PlayPhase,
  type CoverageType,
  getPhaseAtTime,
  getPhaseProgress,
  DEFAULT_SIMULATION_CONFIG,
} from "./types";
import { simulateOffenseAtTime } from "./offense-animator";
import { simulateDefenseAtTime, getCoverageType } from "./defense-animator";

// ============================================
// Simulation Hook
// ============================================

export interface UseSimulationOptions {
  play: Play | null;
  isPlaying: boolean;
  currentMs: number;
  defenseShell?: string;
}

export interface UseSimulationResult {
  frame: SimulationFrame | null;
  phase: PlayPhase;
  progress: number;
  isComplete: boolean;
}

/**
 * React hook to compute simulation frame
 */
export function useSimulation({
  play,
  isPlaying,
  currentMs,
  defenseShell = "cover3",
}: UseSimulationOptions): UseSimulationResult {
  // Memoize coverage type
  const coverageType = useMemo<CoverageType>(
    () => getCoverageType(defenseShell),
    [defenseShell]
  );

  // Compute current phase and progress
  const phase = useMemo(() => getPhaseAtTime(currentMs), [currentMs]);
  const phaseProgress = useMemo(() => getPhaseProgress(currentMs), [currentMs]);

  // Compute simulation frame
  const frame = useMemo<SimulationFrame | null>(() => {
    if (!play) return null;

    // Simulate offense
    const offensePlayers = simulateOffenseAtTime(play, currentMs, phase);

    // Create position map for defense to reference
    const offensePositions = new Map<string, Point>();
    for (const simPlayer of offensePlayers) {
      offensePositions.set(simPlayer.playerId, simPlayer.currentPosition);
    }

    // Simulate defense
    const defensePlayers = simulateDefenseAtTime(
      play,
      offensePositions,
      currentMs,
      coverageType,
      phase,
      phaseProgress
    );

    return {
      timeMs: currentMs,
      phase,
      offensePlayers,
      defensePlayers,
    };
  }, [play, currentMs, phase, phaseProgress, coverageType]);

  const isComplete = currentMs >= DEFAULT_SIMULATION_CONFIG.durationMs;
  const progress = Math.min(1, currentMs / DEFAULT_SIMULATION_CONFIG.durationMs);

  return {
    frame,
    phase,
    progress,
    isComplete,
  };
}

// ============================================
// Animation Timer Hook
// ============================================

export interface UseAnimationTimerOptions {
  isPlaying: boolean;
  speed: number;
  durationMs?: number;
  onTick: (currentMs: number) => void;
  onComplete?: () => void;
}

/**
 * Hook to manage animation timer
 */
export function useAnimationTimer({
  isPlaying,
  speed,
  durationMs = DEFAULT_SIMULATION_CONFIG.durationMs,
  onTick,
  onComplete,
}: UseAnimationTimerOptions): void {
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      // Paused - cancel animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    // Start/resume animation
    startTimeRef.current = performance.now() - (pausedAtRef.current / speed);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = (timestamp - startTimeRef.current) * speed;
      const currentMs = Math.min(elapsed, durationMs);

      pausedAtRef.current = currentMs;
      onTick(currentMs);

      if (currentMs >= durationMs) {
        // Animation complete
        onComplete?.();
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, speed, durationMs, onTick, onComplete]);
}

// ============================================
// Position Map Helper
// ============================================

/**
 * Create a position map from simulation frame
 */
export function createPositionMap(
  frame: SimulationFrame | null
): Map<string, Point> {
  const map = new Map<string, Point>();

  if (!frame) return map;

  for (const player of frame.offensePlayers) {
    map.set(player.playerId, player.currentPosition);
  }

  for (const player of frame.defensePlayers) {
    map.set(player.playerId, player.currentPosition);
  }

  return map;
}

