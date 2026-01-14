// ============================================
// Playbook Store (Zustand)
// ============================================

import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { Playbook, PlaybookSection, ExportSettings, Play } from "@/domain/dsl/types";

export interface PlaybookState {
  playbook: Playbook | null;
  plays: Map<string, Play>;
  isExporting: boolean;

  // Actions
  initPlaybook: (name: string) => void;
  setPlaybook: (playbook: Playbook) => void;
  updateName: (name: string) => void;

  // Sections
  addSection: (name: string) => void;
  renameSection: (sectionId: string, name: string) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (sectionIds: string[]) => void;

  // Plays
  addPlayToSection: (sectionId: string, play: Play) => void;
  removePlayFromSection: (sectionId: string, playId: string) => void;
  reorderPlays: (sectionId: string, playIds: string[]) => void;

  // Export
  setExportSettings: (settings: ExportSettings) => void;
  setExporting: (isExporting: boolean) => void;
}

export const usePlaybookStore = create<PlaybookState>((set, get) => ({
  playbook: null,
  plays: new Map(),
  isExporting: false,

  initPlaybook: (name: string) => {
    const playbook: Playbook = {
      schemaVersion: "1.0",
      type: "playbook",
      id: uuid(),
      name,
      tags: [],
      sections: [
        { id: uuid(), name: "Run", playIds: [] },
        { id: uuid(), name: "Pass", playIds: [] },
      ],
      exportSettings: {
        pageStyle: "classic",
        includeNotes: true,
        includeGrid: false,
        footer: "playName+page",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ playbook, plays: new Map() });
  },

  setPlaybook: (playbook: Playbook) => {
    set({ playbook });
  },

  updateName: (name: string) => {
    const state = get();
    if (!state.playbook) return;
    set({
      playbook: {
        ...state.playbook,
        name,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  addSection: (name: string) => {
    const state = get();
    if (!state.playbook) return;
    const newSection: PlaybookSection = {
      id: uuid(),
      name,
      playIds: [],
    };
    set({
      playbook: {
        ...state.playbook,
        sections: [...state.playbook.sections, newSection],
        updatedAt: new Date().toISOString(),
      },
    });
  },

  renameSection: (sectionId: string, name: string) => {
    const state = get();
    if (!state.playbook) return;
    set({
      playbook: {
        ...state.playbook,
        sections: state.playbook.sections.map((s) =>
          s.id === sectionId ? { ...s, name } : s
        ),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  removeSection: (sectionId: string) => {
    const state = get();
    if (!state.playbook) return;
    set({
      playbook: {
        ...state.playbook,
        sections: state.playbook.sections.filter((s) => s.id !== sectionId),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  reorderSections: (sectionIds: string[]) => {
    const state = get();
    if (!state.playbook) return;
    const sectionMap = new Map(
      state.playbook.sections.map((s) => [s.id, s])
    );
    const reordered = sectionIds
      .map((id) => sectionMap.get(id))
      .filter(Boolean) as PlaybookSection[];
    set({
      playbook: {
        ...state.playbook,
        sections: reordered,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  addPlayToSection: (sectionId: string, play: Play) => {
    const state = get();
    if (!state.playbook) return;

    // Add play to plays map
    const newPlays = new Map(state.plays);
    newPlays.set(play.id, play);

    // Add playId to section
    set({
      playbook: {
        ...state.playbook,
        sections: state.playbook.sections.map((s) =>
          s.id === sectionId
            ? { ...s, playIds: [...s.playIds, play.id] }
            : s
        ),
        updatedAt: new Date().toISOString(),
      },
      plays: newPlays,
    });
  },

  removePlayFromSection: (sectionId: string, playId: string) => {
    const state = get();
    if (!state.playbook) return;
    set({
      playbook: {
        ...state.playbook,
        sections: state.playbook.sections.map((s) =>
          s.id === sectionId
            ? { ...s, playIds: s.playIds.filter((id) => id !== playId) }
            : s
        ),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  reorderPlays: (sectionId: string, playIds: string[]) => {
    const state = get();
    if (!state.playbook) return;
    set({
      playbook: {
        ...state.playbook,
        sections: state.playbook.sections.map((s) =>
          s.id === sectionId ? { ...s, playIds } : s
        ),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  setExportSettings: (settings: ExportSettings) => {
    const state = get();
    if (!state.playbook) return;
    set({
      playbook: {
        ...state.playbook,
        exportSettings: { ...state.playbook.exportSettings, ...settings },
        updatedAt: new Date().toISOString(),
      },
    });
  },

  setExporting: (isExporting: boolean) => {
    set({ isExporting });
  },
}));
