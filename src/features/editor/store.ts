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
} from "@/domain/dsl/types";
import { createPlay, createPlayFromFormation } from "@/domain/dsl/factories";
import { autoBuildFromConcept, applyAutoBuildToPlay } from "@/domain/engine/auto-build";
import { validateAndRecoverPlay, validatePlay } from "@/domain/dsl/validation";
import { editorLog } from "@/lib/logger";
import { deepClone } from "@/lib/immutable";

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

export interface EditorState {
  // Core data (source of truth)
  play: Play | null;
  playDbId: string | null; // Database ID (different from DSL id)

  // UI State
  mode: EditorMode;
  selectedPlayerId: string | null;
  selectedActionId: string | null;
  hoveredPlayerId: string | null;

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

  // Play modifications (with history)
  applyFormation: (formation: Formation) => void;
  movePlayer: (playerId: string, newPosition: Point) => void;
  addAction: (action: Action) => void;
  updateAction: (actionId: string, updates: Partial<Action>) => void;
  removeAction: (actionId: string) => void;

  // Auto-build
  buildFromConcept: (concept: Concept) => void;

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
      // Backup to localStorage on failure
      if (state.play) {
        try {
          localStorage.setItem(`play_draft_${state.playDbId || "new"}`, JSON.stringify(state.play));
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
    set({ mode, selectedActionId: null });
  },

  selectPlayer: (playerId: string | null) => {
    set({ selectedPlayerId: playerId, selectedActionId: null });
  },

  selectAction: (actionId: string | null) => {
    set({ selectedActionId: actionId, selectedPlayerId: null });
  },

  setHoveredPlayer: (playerId: string | null) => {
    set({ hoveredPlayerId: playerId });
  },

  // Apply formation - full replacement (players get new IDs, actions reset)
  applyFormation: (formation: Formation) => {
    const state = get();
    const currentPlay = state.play;

    // Create fresh play from formation - always get new player IDs
    const newPlay = createPlayFromFormation(
      formation,
      currentPlay?.name || formation.name
    );

    // IMPORTANT: Clear all actions when formation changes
    // Routes/blocks tied to old player IDs become invalid
    newPlay.actions = [];

    editorLog.event("APPLY_FORMATION", {
      formationId: formation.id,
      playId: newPlay.id,
      playerCount: newPlay.roster.players.length,
      actionsReset: true,
    });

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

  // Build from concept
  buildFromConcept: (concept: Concept) => {
    const state = get();
    if (!state.play) return;

    const result = autoBuildFromConcept(state.play, concept);
    if (result.success) {
      const newPlay = applyAutoBuildToPlay(state.play, result, {
        conflictPolicy: "add_layer",
      });

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

      editorLog.event("AUTO_BUILD", {
        playId: state.play.id,
        conceptId: concept.id,
        actionCount: newPlay.actions.length,
      });

      get().setPlay(newPlay);
    }
  },

  // Undo
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const restoredPlay = state.history[newIndex];
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
}));
