// ============================================
// Situation Presets Service
// Save and load context presets (down/distance/hash)
// ============================================

import { useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type {
  SituationPreset,
  ScoutCardDown,
  ScoutCardDistance,
  HashPosition,
  FieldZone,
} from "@/domain/dsl/types";
import { BUILT_IN_SITUATION_PRESETS } from "@/domain/dsl/types";

// ============================================
// Storage Keys
// ============================================

const STORAGE_KEY = "foc_situation_presets";
const RECENT_KEY = "foc_recent_presets";
const MAX_RECENT = 5;

// ============================================
// Types
// ============================================

export interface SituationPresetsStorage {
  version: string;
  presets: SituationPreset[];
  updatedAt: string;
}

export interface SituationContext {
  down: ScoutCardDown;
  distance: ScoutCardDistance;
  hash: HashPosition;
  fieldZone?: FieldZone;
}

// ============================================
// Storage Functions
// ============================================

/**
 * Load user-created presets from localStorage
 */
export function loadUserPresets(): SituationPreset[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const data: SituationPresetsStorage = JSON.parse(raw);
    return data.presets || [];
  } catch (error) {
    console.warn("Failed to load situation presets:", error);
    return [];
  }
}

/**
 * Save user-created presets to localStorage
 */
export function saveUserPresets(presets: SituationPreset[]): void {
  if (typeof window === "undefined") return;

  const data: SituationPresetsStorage = {
    version: "1.0",
    presets,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save situation presets:", error);
  }
}

/**
 * Get all presets (built-in + user-created)
 */
export function getAllPresets(): SituationPreset[] {
  const userPresets = loadUserPresets();
  return [...BUILT_IN_SITUATION_PRESETS, ...userPresets];
}

/**
 * Get recent preset IDs
 */
export function getRecentPresetIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/**
 * Add a preset ID to recent list
 */
export function addToRecentPresets(presetId: string): void {
  if (typeof window === "undefined") return;

  const recent = getRecentPresetIds();
  const filtered = recent.filter((id) => id !== presetId);
  const updated = [presetId, ...filtered].slice(0, MAX_RECENT);

  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

// ============================================
// Preset CRUD Operations
// ============================================

/**
 * Create a new user preset
 */
export function createPreset(
  name: string,
  context: SituationContext,
  options: {
    description?: string;
    icon?: string;
    color?: string;
    tags?: string[];
  } = {}
): SituationPreset {
  const preset: SituationPreset = {
    id: uuid(),
    name,
    description: options.description,
    icon: options.icon || "📌",
    color: options.color,
    down: context.down,
    distance: context.distance,
    hash: context.hash,
    fieldZone: context.fieldZone,
    tags: options.tags,
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const userPresets = loadUserPresets();
  userPresets.push(preset);
  saveUserPresets(userPresets);

  return preset;
}

/**
 * Update an existing user preset
 */
export function updatePreset(
  id: string,
  updates: Partial<Omit<SituationPreset, "id" | "isBuiltIn" | "createdAt">>
): SituationPreset | null {
  const userPresets = loadUserPresets();
  const index = userPresets.findIndex((p) => p.id === id);

  if (index === -1) {
    console.warn("Preset not found:", id);
    return null;
  }

  userPresets[index] = {
    ...userPresets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveUserPresets(userPresets);
  return userPresets[index];
}

/**
 * Delete a user preset
 */
export function deletePreset(id: string): boolean {
  const userPresets = loadUserPresets();
  const index = userPresets.findIndex((p) => p.id === id);

  if (index === -1) {
    console.warn("Preset not found:", id);
    return false;
  }

  userPresets.splice(index, 1);
  saveUserPresets(userPresets);
  return true;
}

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): SituationPreset | undefined {
  return getAllPresets().find((p) => p.id === id);
}

// ============================================
// React Hook
// ============================================

export interface UseSituationPresetsReturn {
  // State
  presets: SituationPreset[];
  recentPresets: SituationPreset[];
  builtInPresets: SituationPreset[];
  userPresets: SituationPreset[];
  loading: boolean;

  // Actions
  createPreset: (
    name: string,
    context: SituationContext,
    options?: {
      description?: string;
      icon?: string;
      color?: string;
      tags?: string[];
    }
  ) => SituationPreset;
  updatePreset: (
    id: string,
    updates: Partial<Omit<SituationPreset, "id" | "isBuiltIn" | "createdAt">>
  ) => void;
  deletePreset: (id: string) => void;
  applyPreset: (presetId: string) => SituationContext | null;
  refreshPresets: () => void;
}

export function useSituationPresets(): UseSituationPresetsReturn {
  const [presets, setPresets] = useState<SituationPreset[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load on mount
  useEffect(() => {
    const loadedPresets = getAllPresets();
    const loadedRecent = getRecentPresetIds();
    setPresets(loadedPresets);
    setRecentIds(loadedRecent);
    setLoading(false);
  }, []);

  const refreshPresets = useCallback(() => {
    setPresets(getAllPresets());
    setRecentIds(getRecentPresetIds());
  }, []);

  const handleCreatePreset = useCallback(
    (
      name: string,
      context: SituationContext,
      options?: {
        description?: string;
        icon?: string;
        color?: string;
        tags?: string[];
      }
    ): SituationPreset => {
      const newPreset = createPreset(name, context, options);
      refreshPresets();
      return newPreset;
    },
    [refreshPresets]
  );

  const handleUpdatePreset = useCallback(
    (id: string, updates: Partial<Omit<SituationPreset, "id" | "isBuiltIn" | "createdAt">>) => {
      updatePreset(id, updates);
      refreshPresets();
    },
    [refreshPresets]
  );

  const handleDeletePreset = useCallback(
    (id: string) => {
      deletePreset(id);
      refreshPresets();
    },
    [refreshPresets]
  );

  const handleApplyPreset = useCallback(
    (presetId: string): SituationContext | null => {
      const preset = getPresetById(presetId);
      if (!preset) return null;

      addToRecentPresets(presetId);
      setRecentIds(getRecentPresetIds());

      return {
        down: preset.down,
        distance: preset.distance,
        hash: preset.hash,
        fieldZone: preset.fieldZone,
      };
    },
    []
  );

  // Computed values
  const builtInPresets = presets.filter((p) => p.isBuiltIn);
  const userPresets = presets.filter((p) => !p.isBuiltIn);
  const recentPresets = recentIds
    .map((id) => presets.find((p) => p.id === id))
    .filter(Boolean) as SituationPreset[];

  return {
    presets,
    recentPresets,
    builtInPresets,
    userPresets,
    loading,
    createPreset: handleCreatePreset,
    updatePreset: handleUpdatePreset,
    deletePreset: handleDeletePreset,
    applyPreset: handleApplyPreset,
    refreshPresets,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format a situation preset for display
 */
export function formatPresetLabel(preset: SituationPreset): string {
  const down = preset.down === "-" ? "" : `${preset.down}`;
  const distance =
    typeof preset.distance === "number"
      ? `& ${preset.distance}`
      : preset.distance === "-"
      ? ""
      : `& ${preset.distance}`;

  if (!down && !distance) return preset.name;
  return `${down}${distance}`.trim() || preset.name;
}

/**
 * Get preset color with fallback
 */
export function getPresetColor(preset: SituationPreset): string {
  if (preset.color) return preset.color;

  // Color based on down
  switch (preset.down) {
    case 1:
      return "#22C55E"; // Green
    case 2:
      return "#3B82F6"; // Blue
    case 3:
      return "#F59E0B"; // Amber
    case 4:
      return "#EF4444"; // Red
    default:
      return "#6B7280"; // Gray
  }
}

/**
 * Match a context to existing presets
 */
export function findMatchingPreset(context: SituationContext): SituationPreset | undefined {
  return getAllPresets().find(
    (p) =>
      p.down === context.down &&
      p.distance === context.distance &&
      p.hash === context.hash &&
      (p.fieldZone === context.fieldZone || (!p.fieldZone && !context.fieldZone))
  );
}

export default {
  loadUserPresets,
  saveUserPresets,
  getAllPresets,
  getRecentPresetIds,
  addToRecentPresets,
  createPreset,
  updatePreset,
  deletePreset,
  getPresetById,
  useSituationPresets,
  formatPresetLabel,
  getPresetColor,
  findMatchingPreset,
};
