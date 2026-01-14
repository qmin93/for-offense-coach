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
  lastSaved: Date | null;

  // Actions
  initPlay: (play?: Play) => void;
  setPlay: (play: Play) => void;
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
  lastSaved: null,

  // Initialize play
  initPlay: (play?: Play) => {
    const newPlay = play || createPlay("New Play");
    set({
      play: newPlay,
      history: [newPlay],
      historyIndex: 0,
      isDirty: false,
      selectedPlayerId: null,
      selectedActionId: null,
    });
  },

  setPlay: (play: Play) => {
    const state = get();
    const newHistory = [
      ...state.history.slice(0, state.historyIndex + 1),
      play,
    ].slice(-state.maxHistory);

    set({
      play,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
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

  // Apply formation
  applyFormation: (formation: Formation) => {
    const state = get();
    const currentPlay = state.play;

    const newPlay = createPlayFromFormation(
      formation,
      currentPlay?.name || formation.name
    );

    // Preserve existing actions if any
    if (currentPlay?.actions.length) {
      newPlay.actions = currentPlay.actions;
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

      get().setPlay(newPlay);
    }
  },

  // Undo
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        play: state.history[newIndex],
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
      set({
        play: state.history[newIndex],
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
