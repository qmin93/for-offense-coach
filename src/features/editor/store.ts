// ============================================
// Editor Store (Zustand)
// Play DSL이 source of truth
// ============================================

import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type {
  Play,
  Player,
  Action,
  Formation,
  Concept,
  Point,
  DefensePreset,
  AutoBuildFailure,
} from "@/domain/dsl/types";
import { saveDraft } from "@/lib/local-draft";
import type { PreContext } from "./components/PreContextScreen";
import { DEFAULT_PRE_CONTEXT } from "./components/PreContextScreen";

// ============================================
// Context Management Types
// ============================================

export type ContextSource = "default" | "precontext" | "restored";

export interface ContextState {
  initial: PreContext | null;
  active: PreContext;
  source: ContextSource;
  lastUpdatedAt: number;
}

// Helper to get changed keys between initial and active context
export function getContextDiff(initial: PreContext | null, active: PreContext): string[] {
  if (!initial) return [];

  const changedKeys: string[] = [];

  if (initial.playType !== active.playType) changedKeys.push("playType");
  if (initial.boxCount !== active.boxCount) changedKeys.push("boxCount");
  if (initial.front !== active.front) changedKeys.push("front");
  if (initial.threeTech !== active.threeTech) changedKeys.push("threeTech");
  if (initial.shell !== active.shell) changedKeys.push("shell");
  if (initial.pressure !== active.pressure) changedKeys.push("pressure");

  // Check situation fields
  if (initial.situation?.down !== active.situation?.down) changedKeys.push("down");
  if (initial.situation?.distance !== active.situation?.distance) changedKeys.push("distance");
  if (initial.situation?.hash !== active.situation?.hash) changedKeys.push("hash");

  return changedKeys;
}

// Helper to create context summary for telemetry
export function createContextSummary(context: PreContext): {
  playType: string;
  boxCount: string | number;
  front: string;
  pressure: string;
} {
  return {
    playType: context.playType,
    boxCount: context.boxCount,
    front: context.front,
    pressure: context.pressure,
  };
}

// ============================================
// Auto-build Result Type for UI
// ============================================

export interface BuildFromConceptResult {
  success: boolean;
  failure?: AutoBuildFailure;
  appliedActions?: number;
  warnings?: string[];
}
import { createPlay, createPlayFromFormation } from "@/domain/dsl/factories";
import { type SnapConfig, DEFAULT_SNAP_CONFIG } from "@/domain/engine/snap";
import { autoBuildFromConcept, applyAutoBuildToPlay } from "@/domain/engine/auto-build";
import { getDefensePresetById, computeOffensiveStrength } from "@/domain/engine/defense-presets";
import {
  loadPlayerDefaults,
  applyDefaultsToPlay,
  type PlayerDefaults,
} from "@/domain/engine/player-defaults";
import { validateAndRecoverPlay, validatePlay } from "@/domain/dsl/validation";
import { editorLog } from "@/lib/logger";
import { deepClone } from "@/lib/immutable";
import { createSnapshot } from "./snapshot-manager";
import {
  telemetry,
  startTimer,
  endTimer,
  setLastAutobuildContext,
  getLastAutobuildContext,
  clearAutobuildContext,
} from "@/lib/telemetry";

// ============================================
// Types
// ============================================

export type EditorMode = "select" | "route" | "block" | "motion" | "text";

export interface Command {
  type: string;
  execute: () => void;
  undo: () => void;
  description: string;
}

export interface DrawingState {
  isDrawing: boolean;
  drawingPlayerId: string | null; // Player the action is attached to
  drawingPoints: Point[];
}

export interface EditorState {
  // Core data (source of truth)
  play: Play | null;
  playDbId: string | null; // Database ID (different from DSL id)

  // UI State
  mode: EditorMode;
  selectedPlayerId: string | null; // Primary selection (for backwards compatibility)
  selectedActionId: string | null;
  hoveredPlayerId: string | null;

  // Multi-selection (new)
  selectedPlayerIds: string[];
  selectedActionIds: string[];

  // Snap settings
  snapConfig: SnapConfig;

  // Drawing state
  drawing: DrawingState;

  // History (Undo/Redo)
  history: Play[];
  historyIndex: number;
  maxHistory: number;

  // Suggestions panel
  suggestionsOpen: boolean;
  suggestionsType: "pass" | "run";

  // Auto-save
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;

  // Revision tracking (prevents autosave race conditions)
  localRevision: number;
  serverRevision: number;

  // Loading state
  isLoading: boolean;
  loadError: string | null;

  // Defense state
  defensePresetId: string | null;
  showDefense: boolean;

  // Landmark overlay state
  showLandmarks: boolean;
  autoShowLandmarksInBlockMode: boolean;

  // Defense label overlay state
  showDefenseLabels: boolean;

  // Export render override (for PDF/PNG export)
  exportOverride: {
    showDefenseLabels: boolean;
    showLandmarks: boolean;
    showGrid: boolean;
  } | null;

  // Playback state
  playbackState: {
    isPlaying: boolean;
    currentMs: number;
    speed: number;
  };

  // Route drawing options
  curveMode: boolean; // Draw routes as Bezier curves

  // Player defaults
  autoApplyDefaults: boolean; // Auto-apply role-based defaults
  playerDefaults: PlayerDefaults;

  // Context management (initial vs active)
  context: ContextState;
  hasCompletedPreContext: boolean;

  // Actions
  initPlay: (play?: Play) => void;
  loadPlay: (dbId: string) => Promise<void>;
  savePlay: () => Promise<void>;
  setPlay: (play: Play) => void;
  setPlayName: (name: string) => void;
  setMode: (mode: EditorMode) => void;
  selectPlayer: (playerId: string | null) => void;
  selectAction: (actionId: string | null) => void;
  setHoveredPlayer: (playerId: string | null) => void;

  // Multi-select operations
  togglePlayerSelection: (playerId: string, additive?: boolean) => void;
  selectMultiplePlayers: (playerIds: string[]) => void;
  toggleActionSelection: (actionId: string, additive?: boolean) => void;
  selectMultipleActions: (actionIds: string[]) => void;
  clearSelection: () => void;

  // Snap settings
  setSnapConfig: (config: Partial<SnapConfig>) => void;
  toggleSnap: () => void;

  // Curve mode
  toggleCurveMode: () => void;

  // Player defaults
  toggleAutoApplyDefaults: () => void;
  applyPlayerDefaults: () => void;

  // Play modifications (with history)
  applyFormation: (formation: Formation) => void;
  movePlayer: (playerId: string, newPosition: Point) => void;
  addAction: (action: Action) => void;
  updateAction: (actionId: string, updates: Partial<Action>) => void;
  removeAction: (actionId: string) => void;
  removeSelectedActions: () => void;

  // Drawing operations
  startDrawing: (playerId: string, startPoint: Point) => void;
  addDrawingPoint: (point: Point) => void;
  finishDrawing: () => void;
  cancelDrawing: () => void;

  // Quick block creation (drag to create)
  createQuickBlock: (playerId: string, endPoint: Point) => void;

  // Auto-build
  buildFromConcept: (concept: Concept) => BuildFromConceptResult;

  // Defense actions
  applyDefensePreset: (presetId: string) => void;
  toggleDefenseVisibility: () => void;
  resetDefense: () => void;

  // Landmark actions
  toggleLandmarkVisibility: () => void;
  setAutoShowLandmarksInBlockMode: (value: boolean) => void;

  // Defense label actions
  toggleDefenseLabels: () => void;

  // Export override actions
  applyExportOverride: (override: { showDefenseLabels: boolean; showLandmarks: boolean; showGrid: boolean }) => void;
  clearExportOverride: () => void;

  // Whiteboard actions
  resetAll: () => void;

  // Playback actions
  playAnimation: () => void;
  pauseAnimation: () => void;
  seekTo: (ms: number) => void;
  setPlaybackSpeed: (speed: number) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Suggestions
  toggleSuggestions: (type?: "pass" | "run") => void;
  closeSuggestions: () => void;

  // Save
  markDirty: () => void;
  markSaved: () => void;

  // Pre-Context
  initializeContext: (context: PreContext, source?: ContextSource) => void;
  updateContext: (updates: Partial<PreContext>, origin?: "panel" | "quickbar") => void;
  resetContextToInitial: () => void;
  clearContext: () => void;
  getContextDiff: () => string[];
}

// ============================================
// Store
// ============================================

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  play: null,
  playDbId: null,
  mode: "select",
  selectedPlayerId: null,
  selectedActionId: null,
  hoveredPlayerId: null,
  selectedPlayerIds: [],
  selectedActionIds: [],
  snapConfig: DEFAULT_SNAP_CONFIG,
  drawing: {
    isDrawing: false,
    drawingPlayerId: null,
    drawingPoints: [],
  },
  history: [],
  historyIndex: -1,
  maxHistory: 50,
  suggestionsOpen: false,
  suggestionsType: "pass",
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  saveError: null,
  localRevision: 0,
  serverRevision: 0,
  isLoading: false,
  loadError: null,

  // Defense state
  defensePresetId: null,
  showDefense: true,

  // Landmark overlay state
  showLandmarks: false,
  autoShowLandmarksInBlockMode: true,

  // Defense label overlay state
  showDefenseLabels: false,

  // Export render override (for PDF/PNG export)
  exportOverride: null,

  // Playback state
  playbackState: {
    isPlaying: false,
    currentMs: 0,
    speed: 1,
  },

  // Route drawing options
  curveMode: false,

  // Player defaults
  autoApplyDefaults: true, // Auto-apply defaults by default
  playerDefaults: loadPlayerDefaults(),

  // Context management (initial vs active)
  context: {
    initial: null,
    active: DEFAULT_PRE_CONTEXT,
    source: "default" as ContextSource,
    lastUpdatedAt: Date.now(),
  },
  hasCompletedPreContext: false,

  // Initialize play (for new plays)
  initPlay: (play?: Play) => {
    const newPlay = deepClone(play || createPlay("New Play"));
    set({
      play: newPlay,
      playDbId: null,
      history: [newPlay],
      historyIndex: 0,
      isDirty: false,
      isLoading: false,
      loadError: null,
      selectedPlayerId: null,
      selectedActionId: null,
      selectedPlayerIds: [],
      selectedActionIds: [],
      localRevision: 0,
      serverRevision: 0,
    });
  },

  // Load play from database
  loadPlay: async (dbId: string) => {
    editorLog.event("LOAD_START", { playDbId: dbId });
    set({ isLoading: true, loadError: null });
    try {
      const response = await fetch(`/api/plays/${dbId}`);
      if (!response.ok) {
        throw new Error(`Failed to load play: ${response.statusText}`);
      }
      const data = await response.json();

      // Validate and recover if needed
      const { play: validatedPlay, wasRecovered, validationResult } = validateAndRecoverPlay(
        data.dslJson,
        data.name || "Recovered Play"
      );

      set({
        play: validatedPlay,
        playDbId: dbId,
        history: [validatedPlay],
        historyIndex: 0,
        isDirty: wasRecovered, // Mark dirty if we had to recover
        isLoading: false,
        loadError: wasRecovered
          ? "Play data was corrupted and has been recovered. Some data may have been lost."
          : null,
        selectedPlayerId: null,
        selectedActionId: null,
        selectedPlayerIds: [],
        selectedActionIds: [],
        localRevision: wasRecovered ? 1 : 0,
        serverRevision: 0,
      });

      if (wasRecovered) {
        editorLog.event("REHYDRATE", {
          playDbId: dbId,
          playId: validatedPlay.id,
          actionCount: validatedPlay.actions.length,
          error: "Play recovered from corrupted state",
        });
      }

      editorLog.event("LOAD_OK", {
        playDbId: dbId,
        playId: validatedPlay.id,
        actionCount: validatedPlay.actions.length,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to load play";
      editorLog.error("LOAD_FAIL", errorMsg, { playDbId: dbId });
      set({
        isLoading: false,
        loadError: errorMsg,
      });
    }
  },

  // Save play to database
  savePlay: async () => {
    const state = get();
    if (!state.play || state.isSaving) return;

    // Capture revision at save start to detect race conditions
    const saveRevision = state.localRevision;

    editorLog.event("SAVE_START", {
      playDbId: state.playDbId || undefined,
      playId: state.play.id,
      actionCount: state.play.actions.length,
    });

    set({ isSaving: true, saveError: null });
    try {
      if (state.playDbId) {
        // Update existing play
        const response = await fetch(`/api/plays/${state.playDbId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: state.play.name,
            dslJson: state.play,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save play: ${response.statusText}`);
        }
      }
      // For new plays, we'd need workspace context - handled at page level

      // Check if state changed during save (race condition)
      const currentState = get();
      const hasNewChanges = currentState.localRevision > saveRevision;

      set({
        isSaving: false,
        // Only mark as clean if no new changes happened during save
        isDirty: hasNewChanges,
        lastSaved: new Date(),
        saveError: null,
        serverRevision: saveRevision, // Track what server has
      });

      editorLog.event("SAVE_OK", {
        playDbId: state.playDbId || undefined,
        playId: state.play.id,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to save play";
      editorLog.error("SAVE_FAIL", errorMsg, {
        playDbId: state.playDbId || undefined,
        playId: state.play.id,
      });
      set({
        isSaving: false,
        saveError: errorMsg,
      });
      // Backup to localStorage on failure using the local-draft system
      if (state.play) {
        try {
          saveDraft(
            state.play.id,
            state.playDbId,
            state.play,
            state.localRevision,
            state.serverRevision,
            true // isOffline - mark as needing sync
          );
        } catch {
          // Ignore localStorage errors
        }
      }
    }
  },

  // Set play name
  setPlayName: (name: string) => {
    const state = get();
    if (!state.play) return;

    const newPlay: Play = {
      ...state.play,
      name,
      updatedAt: new Date().toISOString(),
    };
    get().setPlay(newPlay);
  },

  setPlay: (play: Play) => {
    const state = get();
    // Deep clone to ensure new reference (prevents immutability issues)
    const clonedPlay = deepClone(play);
    const newHistory = [
      ...state.history.slice(0, state.historyIndex + 1),
      clonedPlay,
    ].slice(-state.maxHistory);

    set({
      play: clonedPlay,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
      localRevision: state.localRevision + 1, // Increment on every change
    });
  },

  setMode: (mode: EditorMode) => {
    const state = get();
    // Auto-show landmarks when entering block mode (if setting enabled)
    const showLandmarks = mode === "block" && state.autoShowLandmarksInBlockMode
      ? true
      : state.showLandmarks;
    set({ mode, selectedActionId: null, showLandmarks });
  },

  selectPlayer: (playerId: string | null) => {
    set({
      selectedPlayerId: playerId,
      selectedPlayerIds: playerId ? [playerId] : [],
      selectedActionId: null,
      selectedActionIds: [],
    });
  },

  selectAction: (actionId: string | null) => {
    set({
      selectedActionId: actionId,
      selectedActionIds: actionId ? [actionId] : [],
      selectedPlayerId: null,
      selectedPlayerIds: [],
    });
  },

  setHoveredPlayer: (playerId: string | null) => {
    set({ hoveredPlayerId: playerId });
  },

  // Multi-select: toggle a single player (shift+click behavior)
  togglePlayerSelection: (playerId: string, additive: boolean = false) => {
    const state = get();
    const currentIds = state.selectedPlayerIds;

    if (additive) {
      // Add or remove from selection
      const isSelected = currentIds.includes(playerId);
      const newIds = isSelected
        ? currentIds.filter((id) => id !== playerId)
        : [...currentIds, playerId];
      set({
        selectedPlayerIds: newIds,
        selectedPlayerId: newIds.length > 0 ? newIds[newIds.length - 1] : null,
        selectedActionId: null,
        selectedActionIds: [],
      });
    } else {
      // Replace selection
      set({
        selectedPlayerIds: [playerId],
        selectedPlayerId: playerId,
        selectedActionId: null,
        selectedActionIds: [],
      });
    }
  },

  // Multi-select: select multiple players at once (box selection)
  selectMultiplePlayers: (playerIds: string[]) => {
    set({
      selectedPlayerIds: playerIds,
      selectedPlayerId: playerIds.length > 0 ? playerIds[playerIds.length - 1] : null,
      selectedActionId: null,
      selectedActionIds: [],
    });
  },

  // Multi-select: toggle a single action
  toggleActionSelection: (actionId: string, additive: boolean = false) => {
    const state = get();
    const currentIds = state.selectedActionIds;

    if (additive) {
      const isSelected = currentIds.includes(actionId);
      const newIds = isSelected
        ? currentIds.filter((id) => id !== actionId)
        : [...currentIds, actionId];
      set({
        selectedActionIds: newIds,
        selectedActionId: newIds.length > 0 ? newIds[newIds.length - 1] : null,
        selectedPlayerId: null,
        selectedPlayerIds: [],
      });
    } else {
      set({
        selectedActionIds: [actionId],
        selectedActionId: actionId,
        selectedPlayerId: null,
        selectedPlayerIds: [],
      });
    }
  },

  // Multi-select: select multiple actions at once
  selectMultipleActions: (actionIds: string[]) => {
    set({
      selectedActionIds: actionIds,
      selectedActionId: actionIds.length > 0 ? actionIds[actionIds.length - 1] : null,
      selectedPlayerId: null,
      selectedPlayerIds: [],
    });
  },

  // Clear all selections
  clearSelection: () => {
    set({
      selectedPlayerId: null,
      selectedActionId: null,
      selectedPlayerIds: [],
      selectedActionIds: [],
    });
  },

  // Snap settings
  setSnapConfig: (config: Partial<SnapConfig>) => {
    const state = get();
    set({
      snapConfig: { ...state.snapConfig, ...config },
    });
  },

  toggleSnap: () => {
    const state = get();
    set({
      snapConfig: { ...state.snapConfig, enabled: !state.snapConfig.enabled },
    });
  },

  toggleCurveMode: () => {
    set((state) => ({ curveMode: !state.curveMode }));
  },

  toggleAutoApplyDefaults: () => {
    set((state) => ({ autoApplyDefaults: !state.autoApplyDefaults }));
  },

  applyPlayerDefaults: () => {
    const state = get();
    if (!state.play) return;

    const newPlay = applyDefaultsToPlay(state.play, state.playerDefaults);
    if (newPlay !== state.play) {
      editorLog.event("APPLY_DEFAULTS", {
        playId: newPlay.id,
        newActionCount: newPlay.actions.length - state.play.actions.length,
      });
      get().setPlay(newPlay);
    }
  },

  // Apply formation - full replacement (players get new IDs, actions reset)
  applyFormation: (formation: Formation) => {
    const state = get();
    const currentPlay = state.play;

    // Create fresh play from formation - always get new player IDs
    let newPlay = createPlayFromFormation(
      formation,
      currentPlay?.name || formation.name
    );

    // IMPORTANT: Clear all actions when formation changes
    // Routes/blocks tied to old player IDs become invalid
    newPlay.actions = [];

    // Auto-apply player defaults if enabled
    if (state.autoApplyDefaults) {
      newPlay = applyDefaultsToPlay(newPlay, state.playerDefaults);
    }

    editorLog.event("APPLY_FORMATION", {
      formationId: formation.id,
      playId: newPlay.id,
      playerCount: newPlay.roster.players.length,
      actionsReset: true,
      defaultsApplied: state.autoApplyDefaults,
    });

    // Create snapshot before formation change (important recovery point)
    if (currentPlay) {
      createSnapshot(currentPlay, "manual");
    }

    get().setPlay(newPlay);
  },

  // Move player
  movePlayer: (playerId: string, newPosition: Point) => {
    const state = get();
    if (!state.play) return;

    const newPlay: Play = {
      ...state.play,
      roster: {
        ...state.play.roster,
        players: state.play.roster.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                alignment: { ...p.alignment, x: newPosition.x, y: newPosition.y },
              }
            : p
        ),
      },
      updatedAt: new Date().toISOString(),
    };

    get().setPlay(newPlay);
  },

  // Add action
  addAction: (action: Action) => {
    const state = get();
    if (!state.play) return;

    const newPlay: Play = {
      ...state.play,
      actions: [...state.play.actions, action],
      updatedAt: new Date().toISOString(),
    };

    editorLog.event("ADD_ACTION", {
      playId: state.play.id,
      actionCount: newPlay.actions.length,
    });

    get().setPlay(newPlay);
  },

  // Update action
  updateAction: (actionId: string, updates: Partial<Action>) => {
    const state = get();
    if (!state.play) return;

    const newPlay: Play = {
      ...state.play,
      actions: state.play.actions.map((a) =>
        a.id === actionId ? { ...a, ...updates } : a
      ) as Action[],
      updatedAt: new Date().toISOString(),
    };

    editorLog.event("UPDATE_ACTION", {
      playId: state.play.id,
      actionCount: newPlay.actions.length,
    });

    get().setPlay(newPlay);
  },

  // Remove action
  removeAction: (actionId: string) => {
    const state = get();
    if (!state.play) return;

    const newPlay: Play = {
      ...state.play,
      actions: state.play.actions.filter((a) => a.id !== actionId),
      updatedAt: new Date().toISOString(),
    };

    editorLog.event("DELETE_ACTION", {
      playId: state.play.id,
      actionCount: newPlay.actions.length,
    });

    get().setPlay(newPlay);
    set({ selectedActionId: null });
  },

  // Remove multiple selected actions (bulk delete)
  removeSelectedActions: () => {
    const state = get();
    if (!state.play) return;

    const idsToRemove = state.selectedActionIds;
    if (idsToRemove.length === 0) return;

    const newPlay: Play = {
      ...state.play,
      actions: state.play.actions.filter((a) => !idsToRemove.includes(a.id)),
      updatedAt: new Date().toISOString(),
    };

    editorLog.event("DELETE_ACTIONS_BULK", {
      playId: state.play.id,
      deletedCount: idsToRemove.length,
      remainingCount: newPlay.actions.length,
    });

    get().setPlay(newPlay);
    set({
      selectedActionId: null,
      selectedActionIds: [],
    });
  },

  // Drawing operations
  startDrawing: (playerId: string, startPoint: Point) => {
    const state = get();
    const player = state.play?.roster.players.find((p) => p.id === playerId);
    if (!player) return;

    // Use player's position as the first point
    const playerPoint = { x: player.alignment.x, y: player.alignment.y };

    set({
      drawing: {
        isDrawing: true,
        drawingPlayerId: playerId,
        drawingPoints: [playerPoint],
      },
      selectedPlayerId: playerId,
    });
  },

  addDrawingPoint: (point: Point) => {
    const state = get();
    if (!state.drawing.isDrawing) return;

    set({
      drawing: {
        ...state.drawing,
        drawingPoints: [...state.drawing.drawingPoints, point],
      },
    });
  },

  finishDrawing: () => {
    const state = get();
    if (!state.drawing.isDrawing || !state.play || !state.drawing.drawingPlayerId) return;

    const points = state.drawing.drawingPoints;
    if (points.length < 2) {
      // Not enough points, cancel
      set({
        drawing: { isDrawing: false, drawingPlayerId: null, drawingPoints: [] },
      });
      return;
    }

    const mode = state.mode;
    const playerId = state.drawing.drawingPlayerId;
    let newAction: Action | null = null;

    if (mode === "route") {
      newAction = {
        id: `a_route_${uuid().slice(0, 8)}`,
        actionType: "route",
        fromPlayerId: playerId,
        layer: "primary",
        route: {
          pattern: "custom",
          controlPoints: points,
          endMarker: "arrow",
          curveMode: state.curveMode, // Apply current curve mode setting
        },
        timing: { phase: "post_snap" },
        style: { line: "solid", thickness: "normal" },
      } as Action;
    } else if (mode === "block") {
      newAction = {
        id: `a_block_${uuid().slice(0, 8)}`,
        actionType: "block",
        fromPlayerId: playerId,
        layer: "primary",
        block: {
          scheme: "custom",
          target: { landmark: points[points.length - 1] },
          pathPoints: points,
        },
        style: { line: "solid", endMarker: "arrow" },
      } as Action;
    } else if (mode === "motion") {
      newAction = {
        id: `a_motion_${uuid().slice(0, 8)}`,
        actionType: "motion",
        fromPlayerId: playerId,
        layer: "primary",
        motion: {
          motionType: "shift",
          pathPoints: points,
          endAlignment: points[points.length - 1],
        },
        timing: { phase: "pre_snap" },
        style: { line: "dashed", endMarker: "none" },
      } as Action;
    }

    // Clear drawing state first
    set({
      drawing: { isDrawing: false, drawingPlayerId: null, drawingPoints: [] },
    });

    // Add the action if created
    if (newAction) {
      get().addAction(newAction);
    }
  },

  cancelDrawing: () => {
    set({
      drawing: { isDrawing: false, drawingPlayerId: null, drawingPoints: [] },
    });
  },

  // Quick block creation (drag to create)
  createQuickBlock: (playerId: string, endPoint: Point) => {
    const state = get();
    if (!state.play) return;

    const player = state.play.roster.players.find((p) => p.id === playerId);
    if (!player) return;

    const startPoint = { x: player.alignment.x, y: player.alignment.y };

    // Calculate angle from start to end (0° = straight up/forward)
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;

    // atan2 gives angle in radians, convert to degrees
    // Adjust so 0° is straight forward (up), positive is clockwise
    let angleDeg = Math.atan2(dx, dy) * (180 / Math.PI);
    angleDeg = (angleDeg + 360) % 360;

    // Snap to 15 degrees
    angleDeg = Math.round(angleDeg / 15) * 15;

    // Calculate block length (distance)
    const distance = Math.sqrt(dx * dx + dy * dy);
    const length = Math.min(Math.max(distance, 0.05), 0.15); // Clamp between 0.05 and 0.15

    // Create block action
    const newAction: Action = {
      id: `a_block_${uuid().slice(0, 8)}`,
      actionType: "block",
      fromPlayerId: playerId,
      layer: "primary",
      block: {
        scheme: "zone_step",
        target: { landmark: endPoint },
        pathPoints: [startPoint, endPoint],
        angleDeg,
        length,
        style: "zone_step",
      },
      style: { line: "solid", endMarker: "arrow" },
    } as Action;

    // Add the action
    const newPlay: Play = {
      ...state.play,
      actions: [...state.play.actions, newAction],
      updatedAt: new Date().toISOString(),
    };

    editorLog.event("ADD_ACTION", {
      playId: state.play.id,
      actionCount: newPlay.actions.length,
    });

    get().setPlay(newPlay);

    // Select the new action for editing
    set({
      selectedActionId: newAction.id,
      selectedPlayerId: null,
    });
  },

  // Build from concept - returns result for UI to display
  buildFromConcept: (concept: Concept) => {
    const state = get();

    // Start timing for telemetry
    startTimer(`autobuild_${concept.id}`);

    if (!state.play) {
      const failure = { code: "INVALID_DSL_STATE" as const, message: "No play loaded", suggestion: "Create or load a play first" };
      telemetry.autobuildFail({
        conceptId: concept.id,
        conceptName: concept.name,
        code: failure.code,
        message: failure.message,
      });
      return { success: false, failure };
    }

    const result = autoBuildFromConcept(state.play, concept);

    // Handle failure
    if (!result.success) {
      const timeMs = endTimer(`autobuild_${concept.id}`);
      editorLog.error("AUTO_BUILD", result.failure?.message || "Unknown error", {
        playId: state.play.id,
        conceptId: concept.id,
        error: result.failure?.code || "UNKNOWN",
      });

      // Track failure telemetry
      const failureContext = result.failure?.context || {};
      telemetry.autobuildFail({
        conceptId: concept.id,
        conceptName: concept.name,
        code: result.failure?.code || "UNKNOWN",
        message: result.failure?.message || result.errors?.[0] || "Auto-build failed",
        missingRoles: failureContext.missingRoles as string[] | undefined,
        requiredCount: failureContext.requiredCount as number | undefined,
        availableCount: failureContext.availableCount as number | undefined,
      });

      return {
        success: false,
        failure: result.failure || {
          code: "UNKNOWN" as const,
          message: result.errors?.[0] || "Auto-build failed",
          suggestion: "Try a different concept or formation",
        },
        warnings: result.warnings,
      };
    }

    // Success path
    let newPlay = applyAutoBuildToPlay(state.play, result, {
      conflictPolicy: "add_layer",
    });

    // Auto-add receiver for run concepts if no split receiver exists
    if (concept.conceptType === "run") {
      const wideReceiverRoles = ["X", "Z"];
      const hasSplitReceiver = newPlay.roster.players.some(
        p => wideReceiverRoles.includes(p.role) &&
             Math.abs((p.alignment?.x || 0.5) - 0.5) > 0.2
      );

      if (!hasSplitReceiver) {
        // Auto-add an X receiver split wide right
        const newReceiver: Player = {
          id: `p_auto_x_${uuid().slice(0, 8)}`,
          role: "X",
          label: "X",
          unit: "offense",
          alignment: {
            x: 0.85,
            y: 0,
            facing: "up",
            stance: "two_point",
          },
          appearance: {
            icon: "circle",
            colorToken: "offense",
            showLabel: true,
          },
        };

        newPlay = {
          ...newPlay,
          roster: {
            ...newPlay.roster,
            players: [...newPlay.roster.players, newReceiver],
          },
        };

        // Add warning to result
        if (!result.warnings) {
          result.warnings = [];
        }
        result.warnings.push("Auto-added X receiver for formation legality");
      }
    }

    // Update concept reference
    newPlay.meta = {
      ...newPlay.meta,
      conceptId: concept.id,
    };
    newPlay.history = {
      ...newPlay.history,
      version: (newPlay.history?.version || 0) + 1,
      derivedFrom: {
        ...newPlay.history?.derivedFrom,
        sourceConceptId: concept.id,
      },
    };

    // Validate after auto-build
    const validationResult = validatePlay(newPlay);
    if (!validationResult.valid) {
      editorLog.error("VALIDATION_FAIL", "Auto-build produced invalid play", {
        playId: newPlay.id,
        conceptId: concept.id,
        error: validationResult.errors.map((e) => e.message).join("; "),
      });
      // Still apply but log the issue
    }

    const timeMs = endTimer(`autobuild_${concept.id}`);
    const appliedActions = result.appliedActions || result.actions.length;
    const playersAssigned = result.actions.filter((a) => a.fromPlayerId).length;

    editorLog.event("AUTO_BUILD", {
      playId: state.play.id,
      conceptId: concept.id,
      actionCount: newPlay.actions.length,
    });

    // Track success telemetry
    telemetry.autobuildSuccess({
      conceptId: concept.id,
      conceptName: concept.name,
      timeMs,
      actionsGenerated: appliedActions,
      playersAssigned,
    });

    // Store autobuild context for undo tracking
    setLastAutobuildContext({
      conceptId: concept.id,
      conceptName: concept.name,
      reasonCount: 0, // Will be set by UI when reasons are displayed
      startedAt: Date.now(),
      completedAt: Date.now(),
    });

    get().setPlay(newPlay);

    // Create snapshot after successful auto-build (important recovery point)
    createSnapshot(newPlay, "manual");

    return {
      success: true,
      appliedActions,
      warnings: result.warnings,
    };
  },

  // Defense actions
  applyDefensePreset: (presetId: string) => {
    const state = get();
    if (!state.play) return;

    const preset = getDefensePresetById(presetId);
    if (!preset) return;

    // Detect offensive strength from formation
    // If we have a formation ID, try to compute strength from offense players
    const offensePlayers = state.play.roster.players.filter(p => p.unit === "offense");

    // Build a minimal formation object to compute strength
    // Strength defaults to "right" if we can't detect
    let offensiveStrength: "left" | "right" = "right";

    if (offensePlayers.length > 0) {
      // Check for TE position (Y role, typically x > 0.65 or x < 0.35)
      const te = offensePlayers.find(p => p.role === "Y" && p.label === "TE");
      if (te) {
        offensiveStrength = te.alignment.x > 0.5 ? "right" : "left";
      } else {
        // Count receivers on each side
        const receivers = offensePlayers.filter(p => ["X", "Y", "Z", "H"].includes(p.role as string));
        const leftCount = receivers.filter(p => p.alignment.x < 0.4).length;
        const rightCount = receivers.filter(p => p.alignment.x > 0.6).length;

        if (leftCount >= 3) offensiveStrength = "left";
        else if (rightCount >= 3) offensiveStrength = "right";
        // Default to "right" otherwise
      }
    }

    // Presets assume strength="right", so flip x if strength is "left"
    const shouldMirror = offensiveStrength === "left";

    // Create defense players from preset (mirrored if needed)
    const defensePlayers: Player[] = preset.alignments.map((alignment, index) => {
      // Mirror x around center (0.5) if offensive strength is left
      const finalX = shouldMirror ? 1 - alignment.x : alignment.x;

      // For mirrored positions, swap strong/weak labels if present
      let label = alignment.label;
      if (shouldMirror) {
        // Swap Sam/Will labels since they switch sides
        if (label === "Sam") label = "Will";
        else if (label === "Will") label = "Sam";
      }

      return {
        id: `p_def_${alignment.role.toLowerCase()}_${index}`,
        role: alignment.role,
        label,
        unit: "defense" as const,
        alignment: {
          x: finalX,
          y: alignment.y,
          facing: "down" as const,
          stance: "three_point" as const,
        },
        appearance: {
          icon: "circle" as const,
          colorToken: "defense" as const,
          showLabel: true,
        },
        extensions: alignment.technique
          ? { technique: alignment.technique }
          : undefined,
      };
    });

    // Remove existing defense players and add new ones
    const currentOffensePlayers = state.play.roster.players.filter(
      (p) => p.unit !== "defense"
    );

    const newPlay: Play = {
      ...state.play,
      roster: {
        ...state.play.roster,
        players: [...currentOffensePlayers, ...defensePlayers],
      },
      updatedAt: new Date().toISOString(),
    };

    editorLog.event("APPLY_DEFENSE_PRESET", {
      presetId,
      playId: newPlay.id,
      defensePlayerCount: defensePlayers.length,
      offensiveStrength,
      mirrored: shouldMirror,
    });

    set({ defensePresetId: presetId });
    get().setPlay(newPlay);
  },

  toggleDefenseVisibility: () => {
    set((state) => ({ showDefense: !state.showDefense }));
  },

  resetDefense: () => {
    const state = get();
    if (!state.play) return;

    // Remove all defense players
    const offensePlayers = state.play.roster.players.filter(
      (p) => p.unit !== "defense"
    );

    const newPlay: Play = {
      ...state.play,
      roster: {
        ...state.play.roster,
        players: offensePlayers,
      },
      updatedAt: new Date().toISOString(),
    };

    set({ defensePresetId: null });
    get().setPlay(newPlay);
  },

  // Landmark actions
  toggleLandmarkVisibility: () => {
    set((state) => ({ showLandmarks: !state.showLandmarks }));
  },

  setAutoShowLandmarksInBlockMode: (value: boolean) => {
    set({ autoShowLandmarksInBlockMode: value });
  },

  // Defense label actions
  toggleDefenseLabels: () => {
    set((state) => ({ showDefenseLabels: !state.showDefenseLabels }));
  },

  // Export override actions
  applyExportOverride: (override) => {
    set({ exportOverride: override });
  },

  clearExportOverride: () => {
    set({ exportOverride: null });
  },

  // Whiteboard actions
  resetAll: () => {
    const state = get();
    if (!state.play) return;

    // Create snapshot before reset (important recovery point)
    createSnapshot(state.play, "manual");

    // Keep formation players but reset actions and positions
    const formationId = state.play.meta?.formationId;

    // Clear all actions
    const newPlay: Play = {
      ...state.play,
      actions: [],
      updatedAt: new Date().toISOString(),
    };

    editorLog.event("RESET_ALL", {
      playId: newPlay.id,
    });

    set({
      defensePresetId: null,
      selectedPlayerId: null,
      selectedActionId: null,
      selectedPlayerIds: [],
      selectedActionIds: [],
    });
    get().setPlay(newPlay);
  },

  // Playback actions
  playAnimation: () => {
    set((state) => ({
      playbackState: { ...state.playbackState, isPlaying: true },
    }));
  },

  pauseAnimation: () => {
    set((state) => ({
      playbackState: { ...state.playbackState, isPlaying: false },
    }));
  },

  seekTo: (ms: number) => {
    set((state) => ({
      playbackState: { ...state.playbackState, currentMs: Math.max(0, ms) },
    }));
  },

  setPlaybackSpeed: (speed: number) => {
    set((state) => ({
      playbackState: { ...state.playbackState, speed },
    }));
  },

  // Undo
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const restoredPlay = state.history[newIndex];

      // Check if this is undoing an autobuild
      const autobuildContext = getLastAutobuildContext();
      if (autobuildContext && autobuildContext.completedAt) {
        const timeSinceAutobuild = Date.now() - autobuildContext.completedAt;
        // If undo happens within 30 seconds of autobuild, track it
        if (timeSinceAutobuild < 30000) {
          telemetry.undoAfterAutobuild({
            conceptId: autobuildContext.conceptId,
            conceptName: autobuildContext.conceptName,
            reasonCount: autobuildContext.reasonCount,
            timeFromBuildMs: timeSinceAutobuild,
            undoCount: 1,
          });
        }
        // Clear context after tracking
        clearAutobuildContext();
      }

      editorLog.event("UNDO", {
        playId: restoredPlay?.id,
        actionCount: restoredPlay?.actions.length,
      });
      set({
        play: restoredPlay,
        historyIndex: newIndex,
        isDirty: true,
      });
    }
  },

  // Redo
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const restoredPlay = state.history[newIndex];
      editorLog.event("REDO", {
        playId: restoredPlay?.id,
        actionCount: restoredPlay?.actions.length,
      });
      set({
        play: restoredPlay,
        historyIndex: newIndex,
        isDirty: true,
      });
    }
  },

  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },

  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },

  // Suggestions
  toggleSuggestions: (type?: "pass" | "run") => {
    const state = get();
    if (type) {
      set({
        suggestionsOpen: true,
        suggestionsType: type,
      });
    } else {
      set({ suggestionsOpen: !state.suggestionsOpen });
    }
  },

  closeSuggestions: () => {
    set({ suggestionsOpen: false });
  },

  // Save state
  markDirty: () => {
    set({ isDirty: true });
  },

  markSaved: () => {
    set({ isDirty: false, lastSaved: new Date() });
  },

  // Pre-Context actions
  initializeContext: (context: PreContext, source: ContextSource = "precontext") => {
    const contextSummary = createContextSummary(context);

    editorLog.event("CONTEXT_INITIALIZED", {
      source,
      contextSummary,
    });

    // Track intent_selected telemetry
    telemetry.intentSelected({
      playType: context.playType,
      boxCount: context.boxCount,
      front: context.front,
    });

    // Track context_initialized telemetry
    telemetry.contextInitialized({
      source,
      contextSummary,
    });

    set({
      context: {
        initial: deepClone(context),
        active: deepClone(context),
        source,
        lastUpdatedAt: Date.now(),
      },
      hasCompletedPreContext: true,
      // Auto-set suggestions type based on play type
      suggestionsType: context.playType === "pass" ? "pass" : "run",
    });
  },

  updateContext: (updates: Partial<PreContext>, origin: "panel" | "quickbar" = "panel") => {
    const state = get();

    // Merge updates with active context
    const newActive: PreContext = {
      ...state.context.active,
      ...updates,
      // Handle nested situation object
      situation: {
        ...state.context.active.situation,
        ...(updates.situation || {}),
      },
    };

    const changedKeys = getContextDiff(state.context.initial, newActive);

    editorLog.event("CONTEXT_ADJUSTED", {
      origin,
      changedKeysCount: changedKeys.length,
      changedKeys,
    });

    // Track telemetry (debounced in telemetry system)
    telemetry.contextAdjusted({
      origin,
      changedKeysCount: changedKeys.length,
      changedKeys,
    });

    set({
      context: {
        ...state.context,
        active: newActive,
        lastUpdatedAt: Date.now(),
      },
      // Update suggestions type if play type changed
      suggestionsType: newActive.playType === "pass" ? "pass" : "run",
    });
  },

  resetContextToInitial: () => {
    const state = get();
    if (!state.context.initial) return;

    editorLog.event("CONTEXT_ADJUSTED", {
      origin: "reset",
      changedKeysCount: 0,
      changedKeys: [],
    });

    set({
      context: {
        ...state.context,
        active: deepClone(state.context.initial),
        lastUpdatedAt: Date.now(),
      },
      suggestionsType: state.context.initial.playType === "pass" ? "pass" : "run",
    });
  },

  clearContext: () => {
    set({
      context: {
        initial: null,
        active: DEFAULT_PRE_CONTEXT,
        source: "default",
        lastUpdatedAt: Date.now(),
      },
      hasCompletedPreContext: false,
    });
  },

  getContextDiff: () => {
    const state = get();
    return getContextDiff(state.context.initial, state.context.active);
  },
}));
