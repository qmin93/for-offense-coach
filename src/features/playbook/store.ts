// ============================================
// Playbook Store (Zustand)
// ============================================

import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type {
  Playbook,
  PlaybookSection,
  PlaybookSectionType,
  ExportSettings,
  Play,
  PlaySituationTag,
} from "@/domain/dsl/types";

// Default sections for new playbooks
export const DEFAULT_SECTIONS: Array<{ name: string; type: PlaybookSectionType }> = [
  { name: "Install", type: "install" },
  { name: "Run", type: "run" },
  { name: "Pass", type: "pass" },
  { name: "RPO", type: "rpo" },
  { name: "Screens", type: "screen" },
  { name: "Gadgets", type: "gadget" },
];

export interface PlaybookState {
  playbook: Playbook | null;
  plays: Map<string, Play>;
  isExporting: boolean;

  // View state (not persisted in playbook)
  activeFilterTags: PlaySituationTag[];
  searchQuery: string;

  // Actions
  initPlaybook: (name: string, template?: "default" | "minimal" | "full") => void;
  setPlaybook: (playbook: Playbook) => void;
  updateName: (name: string) => void;
  updateDescription: (description: string) => void;

  // Sections
  addSection: (name: string, sectionType?: PlaybookSectionType) => void;
  renameSection: (sectionId: string, name: string) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (sectionIds: string[]) => void;
  toggleSectionCollapse: (sectionId: string) => void;
  setSectionColor: (sectionId: string, color: string) => void;

  // Plays
  addPlayToSection: (sectionId: string, play: Play) => void;
  removePlayFromSection: (sectionId: string, playId: string) => void;
  reorderPlays: (sectionId: string, playIds: string[]) => void;
  movePlayToSection: (playId: string, fromSectionId: string, toSectionId: string, index?: number) => void;

  // Play Tags
  addTagToPlay: (playId: string, tag: PlaySituationTag) => void;
  removeTagFromPlay: (playId: string, tag: PlaySituationTag) => void;
  setPlayTags: (playId: string, tags: PlaySituationTag[]) => void;

  // Filtering
  setActiveFilterTags: (tags: PlaySituationTag[]) => void;
  toggleFilterTag: (tag: PlaySituationTag) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // View
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  setSortBy: (sortBy: "name" | "created" | "updated" | "custom") => void;

  // Export
  setExportSettings: (settings: ExportSettings) => void;
  setExporting: (isExporting: boolean) => void;

  // Stats
  getPlaybookStats: () => PlaybookStats;
}

// Stats interface for playbook overview
export interface PlaybookStats {
  totalPlays: number;
  totalSections: number;
  playsBySection: Record<string, number>;
  playsByConcept: Record<string, number>;
  playsByFormation: Record<string, number>;
  playsByTag: Record<string, number>;
  runPassRatio: { run: number; pass: number; rpo: number; other: number };
  lastUpdated: string | null;
}

export const usePlaybookStore = create<PlaybookState>((set, get) => ({
  playbook: null,
  plays: new Map(),
  isExporting: false,
  activeFilterTags: [],
  searchQuery: "",

  initPlaybook: (name: string, template: "default" | "minimal" | "full" = "default") => {
    let sections: PlaybookSection[];

    switch (template) {
      case "minimal":
        sections = [
          { id: uuid(), name: "Run", sectionType: "run", playIds: [] },
          { id: uuid(), name: "Pass", sectionType: "pass", playIds: [] },
        ];
        break;
      case "full":
        sections = [
          { id: uuid(), name: "Install Day", sectionType: "install", playIds: [] },
          { id: uuid(), name: "Run Game", sectionType: "run", playIds: [] },
          { id: uuid(), name: "Pass Game", sectionType: "pass", playIds: [] },
          { id: uuid(), name: "RPO", sectionType: "rpo", playIds: [] },
          { id: uuid(), name: "Screens & Quick", sectionType: "screen", playIds: [] },
          { id: uuid(), name: "Gadgets", sectionType: "gadget", playIds: [] },
          { id: uuid(), name: "Red Zone", sectionType: "redzone", playIds: [] },
          { id: uuid(), name: "Goal Line", sectionType: "goalline", playIds: [] },
          { id: uuid(), name: "2-Minute", sectionType: "2minute", playIds: [] },
        ];
        break;
      default: // "default"
        sections = DEFAULT_SECTIONS.map((s) => ({
          id: uuid(),
          name: s.name,
          sectionType: s.type,
          playIds: [],
        }));
    }

    const playbook: Playbook = {
      schemaVersion: "1.0",
      type: "playbook",
      id: uuid(),
      name,
      tags: [],
      sections,
      viewMode: "grid",
      sortBy: "custom",
      exportSettings: {
        pageStyle: "classic",
        includeNotes: true,
        includeGrid: false,
        footer: "playName+page",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ playbook, plays: new Map(), activeFilterTags: [], searchQuery: "" });
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

  updateDescription: (description: string) => {
    const state = get();
    if (!state.playbook) return;
    set({
      playbook: {
        ...state.playbook,
        description,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  addSection: (name: string, sectionType: PlaybookSectionType = "custom") => {
    const state = get();
    if (!state.playbook) return;
    const newSection: PlaybookSection = {
      id: uuid(),
      name,
      sectionType,
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

  // New section management
  toggleSectionCollapse: (sectionId: string) => {
    const state = get();
    if (!state.playbook) return;
    set({
      playbook: {
        ...state.playbook,
        sections: state.playbook.sections.map((s) =>
          s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s
        ),
      },
    });
  },

  setSectionColor: (sectionId: string, color: string) => {
    const state = get();
    if (!state.playbook) return;
    set({
      playbook: {
        ...state.playbook,
        sections: state.playbook.sections.map((s) =>
          s.id === sectionId ? { ...s, color } : s
        ),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // Move play between sections
  movePlayToSection: (playId: string, fromSectionId: string, toSectionId: string, index?: number) => {
    const state = get();
    if (!state.playbook) return;

    // Remove from source section, add to target section
    set({
      playbook: {
        ...state.playbook,
        sections: state.playbook.sections.map((s) => {
          if (s.id === fromSectionId) {
            return { ...s, playIds: s.playIds.filter((id) => id !== playId) };
          }
          if (s.id === toSectionId) {
            const newPlayIds = [...s.playIds];
            if (index !== undefined && index >= 0) {
              newPlayIds.splice(index, 0, playId);
            } else {
              newPlayIds.push(playId);
            }
            return { ...s, playIds: newPlayIds };
          }
          return s;
        }),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // Play tags management
  addTagToPlay: (playId: string, tag: PlaySituationTag) => {
    const state = get();
    const play = state.plays.get(playId);
    if (!play) return;

    const currentTags = (play.tags || []) as string[];
    if (currentTags.includes(tag)) return;

    const newPlays = new Map(state.plays);
    newPlays.set(playId, {
      ...play,
      tags: [...currentTags, tag],
    });
    set({ plays: newPlays });
  },

  removeTagFromPlay: (playId: string, tag: PlaySituationTag) => {
    const state = get();
    const play = state.plays.get(playId);
    if (!play) return;

    const currentTags = (play.tags || []) as string[];
    const newPlays = new Map(state.plays);
    newPlays.set(playId, {
      ...play,
      tags: currentTags.filter((t) => t !== tag),
    });
    set({ plays: newPlays });
  },

  setPlayTags: (playId: string, tags: PlaySituationTag[]) => {
    const state = get();
    const play = state.plays.get(playId);
    if (!play) return;

    const newPlays = new Map(state.plays);
    newPlays.set(playId, {
      ...play,
      tags,
    });
    set({ plays: newPlays });
  },

  // Filtering
  setActiveFilterTags: (tags: PlaySituationTag[]) => {
    set({ activeFilterTags: tags });
  },

  toggleFilterTag: (tag: PlaySituationTag) => {
    const state = get();
    const isActive = state.activeFilterTags.includes(tag);
    set({
      activeFilterTags: isActive
        ? state.activeFilterTags.filter((t) => t !== tag)
        : [...state.activeFilterTags, tag],
    });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  clearFilters: () => {
    set({ activeFilterTags: [], searchQuery: "" });
  },

  // View preferences
  setViewMode: (mode: "grid" | "list" | "compact") => {
    const state = get();
    if (!state.playbook) return;
    set({
      playbook: {
        ...state.playbook,
        viewMode: mode,
      },
    });
  },

  setSortBy: (sortBy: "name" | "created" | "updated" | "custom") => {
    const state = get();
    if (!state.playbook) return;
    set({
      playbook: {
        ...state.playbook,
        sortBy,
      },
    });
  },

  // Stats computation
  getPlaybookStats: (): PlaybookStats => {
    const state = get();
    if (!state.playbook) {
      return {
        totalPlays: 0,
        totalSections: 0,
        playsBySection: {},
        playsByConcept: {},
        playsByFormation: {},
        playsByTag: {},
        runPassRatio: { run: 0, pass: 0, rpo: 0, other: 0 },
        lastUpdated: null,
      };
    }

    const playsBySection: Record<string, number> = {};
    const playsByConcept: Record<string, number> = {};
    const playsByFormation: Record<string, number> = {};
    const playsByTag: Record<string, number> = {};
    const runPassRatio = { run: 0, pass: 0, rpo: 0, other: 0 };

    let totalPlays = 0;

    state.playbook.sections.forEach((section) => {
      playsBySection[section.name] = section.playIds.length;
      totalPlays += section.playIds.length;

      section.playIds.forEach((playId) => {
        const play = state.plays.get(playId);
        if (!play) return;

        // Count by concept
        const concept = play.meta?.conceptId || "Unknown";
        playsByConcept[concept] = (playsByConcept[concept] || 0) + 1;

        // Count by formation
        const formation = play.meta?.formationId?.replace("formation_", "") || "Unknown";
        playsByFormation[formation] = (playsByFormation[formation] || 0) + 1;

        // Count by tags
        (play.tags || []).forEach((tag) => {
          playsByTag[tag] = (playsByTag[tag] || 0) + 1;
        });

        // Run/Pass ratio based on section type
        if (section.sectionType === "run") {
          runPassRatio.run++;
        } else if (section.sectionType === "pass") {
          runPassRatio.pass++;
        } else if (section.sectionType === "rpo") {
          runPassRatio.rpo++;
        } else {
          runPassRatio.other++;
        }
      });
    });

    return {
      totalPlays,
      totalSections: state.playbook.sections.length,
      playsBySection,
      playsByConcept,
      playsByFormation,
      playsByTag,
      runPassRatio,
      lastUpdated: state.playbook.updatedAt || null,
    };
  },
}));
