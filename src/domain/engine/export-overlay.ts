// ============================================
// Export Overlay Utilities
// Helper functions for applying overlay settings during export
// ============================================

import type { ExportSettings, ExportOverlayMode } from "../dsl/types";
import { useEditorStore } from "@/features/editor/store";

/**
 * Get the effective overlay mode based on export settings
 * Default: "both" for classic style, "off" for minimal style
 */
export function getEffectiveOverlayMode(settings: ExportSettings): ExportOverlayMode {
  if (settings.overlayMode) {
    return settings.overlayMode;
  }
  // Default based on page style
  return settings.pageStyle === "minimal" ? "off" : "both";
}

/**
 * Convert ExportSettings to render override object
 */
export function settingsToRenderOverride(settings: ExportSettings): {
  showDefenseLabels: boolean;
  showLandmarks: boolean;
  showGrid: boolean;
} {
  const mode = getEffectiveOverlayMode(settings);

  return {
    showDefenseLabels: mode === "defense" || mode === "both",
    showLandmarks: mode === "landmarks" || mode === "both",
    showGrid: settings.includeGrid !== false,
  };
}

/**
 * Apply export overlay override to the render state
 * Call this before capturing the SVG for export
 */
export function applyExportOverlayOverride(settings: ExportSettings): void {
  const override = settingsToRenderOverride(settings);
  useEditorStore.getState().applyExportOverride(override);
}

/**
 * Clear export overlay override and restore normal render state
 * Call this after export capture is complete
 */
export function clearExportOverlayOverride(): void {
  useEditorStore.getState().clearExportOverride();
}

/**
 * Check if defense overlay should be shown based on export settings
 */
export function shouldShowDefenseLabels(settings: ExportSettings): boolean {
  const mode = getEffectiveOverlayMode(settings);
  return mode === "defense" || mode === "both";
}

/**
 * Check if landmarks overlay should be shown based on export settings
 */
export function shouldShowLandmarks(settings: ExportSettings): boolean {
  const mode = getEffectiveOverlayMode(settings);
  return mode === "landmarks" || mode === "both";
}

/**
 * Validate export settings and return warnings
 */
export function validateExportOverlay(
  settings: ExportSettings,
  hasDefense: boolean,
  hasFormation: boolean
): { level: "info" | "warning"; message: string }[] {
  const warnings: { level: "info" | "warning"; message: string }[] = [];
  const mode = getEffectiveOverlayMode(settings);

  // Check if defense overlay is enabled but no defense is present
  if ((mode === "defense" || mode === "both") && !hasDefense) {
    warnings.push({
      level: "info",
      message: "Defense labels are enabled, but no defense is present.",
    });
  }

  // Check if landmarks overlay is enabled but no formation data
  if ((mode === "landmarks" || mode === "both") && !hasFormation) {
    warnings.push({
      level: "warning",
      message: "Landmarks are enabled, but could not be generated. (No formation data)",
    });
  }

  return warnings;
}

/**
 * Get default export settings based on style
 */
export function getDefaultExportSettings(style: "classic" | "minimal" = "classic"): ExportSettings {
  if (style === "minimal") {
    return {
      pageStyle: "minimal",
      includeNotes: false,
      includeGrid: false,
      overlayMode: "off",
      overlayOpacity: 1.0,
      includeLegend: false,
    };
  }

  return {
    pageStyle: "classic",
    includeNotes: true,
    includeGrid: true,
    overlayMode: "both",
    overlayOpacity: 1.0,
    includeLegend: false,
  };
}
