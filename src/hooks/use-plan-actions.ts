"use client";

import { useCallback } from "react";
import { usePlan } from "@/contexts/plan-context";
import type { PlanLimits } from "@/domain/dsl/types";
import { toast } from "sonner";

/**
 * Hook that provides plan-aware action handlers
 * Wraps common actions with plan tier checks
 */
export function usePlanActions() {
  const {
    tier,
    limits,
    usage,
    canUseFeature,
    isLimitReached,
    getRemainingCount,
    showUpgradePrompt,
    incrementUsage,
  } = usePlan();

  /**
   * Check if an action is allowed based on plan
   * Shows upgrade prompt if not allowed
   */
  const checkPlanAllows = useCallback(
    (
      feature: keyof PlanLimits | "maxPlays" | "maxPlaybooks" | "maxExports",
      options?: { silent?: boolean }
    ): boolean => {
      // Check feature availability
      if (feature in limits) {
        const limitFeature = feature as "maxPlays" | "maxPlaybooks" | "maxExports";
        if (["maxPlays", "maxPlaybooks", "maxExports"].includes(limitFeature)) {
          if (isLimitReached(limitFeature)) {
            if (!options?.silent) {
              toast.error(getLimitMessage(limitFeature, limits[limitFeature]));
              showUpgradePrompt(limitFeature);
            }
            return false;
          }
        } else {
          if (!canUseFeature(feature as keyof PlanLimits)) {
            if (!options?.silent) {
              toast.error(getFeatureMessage(feature as keyof PlanLimits));
              showUpgradePrompt(feature);
            }
            return false;
          }
        }
      }

      return true;
    },
    [limits, isLimitReached, canUseFeature, showUpgradePrompt]
  );

  /**
   * Wrap a function with plan check
   * Returns null if plan check fails
   */
  const withPlanCheck = useCallback(
    <T extends (...args: unknown[]) => unknown>(
      feature: keyof PlanLimits | "maxPlays" | "maxPlaybooks" | "maxExports",
      fn: T
    ): ((...args: Parameters<T>) => ReturnType<T> | null) => {
      return (...args: Parameters<T>): ReturnType<T> | null => {
        if (!checkPlanAllows(feature)) {
          return null;
        }
        return fn(...args) as ReturnType<T>;
      };
    },
    [checkPlanAllows]
  );

  /**
   * Track play creation (for usage counting)
   */
  const trackPlayCreated = useCallback(() => {
    incrementUsage("plays");
  }, [incrementUsage]);

  /**
   * Track playbook creation (for usage counting)
   */
  const trackPlaybookCreated = useCallback(() => {
    incrementUsage("playbooks");
  }, [incrementUsage]);

  /**
   * Track export (for usage counting)
   */
  const trackExport = useCallback(() => {
    incrementUsage("exportsThisMonth");
  }, [incrementUsage]);

  /**
   * Check if can create new play
   */
  const canCreatePlay = useCallback((): boolean => {
    return checkPlanAllows("maxPlays", { silent: true });
  }, [checkPlanAllows]);

  /**
   * Check if can create new playbook
   */
  const canCreatePlaybook = useCallback((): boolean => {
    return checkPlanAllows("maxPlaybooks", { silent: true });
  }, [checkPlanAllows]);

  /**
   * Check if can export
   */
  const canExport = useCallback((): boolean => {
    return checkPlanAllows("maxExports", { silent: true });
  }, [checkPlanAllows]);

  /**
   * Check if can use defense presets
   */
  const canUseDefensePresets = useCallback((): boolean => {
    return canUseFeature("defensePresets");
  }, [canUseFeature]);

  /**
   * Check if can use share links
   */
  const canUseShareLinks = useCallback((): boolean => {
    return canUseFeature("shareLinks");
  }, [canUseFeature]);

  /**
   * Check if can use install plan
   */
  const canUseInstallPlan = useCallback((): boolean => {
    return canUseFeature("installPlan");
  }, [canUseFeature]);

  /**
   * Check if can use advanced export
   */
  const canUseAdvancedExport = useCallback((): boolean => {
    return canUseFeature("advancedExport");
  }, [canUseFeature]);

  return {
    tier,
    limits,
    usage,
    checkPlanAllows,
    withPlanCheck,
    trackPlayCreated,
    trackPlaybookCreated,
    trackExport,
    canCreatePlay,
    canCreatePlaybook,
    canExport,
    canUseDefensePresets,
    canUseShareLinks,
    canUseInstallPlan,
    canUseAdvancedExport,
    getRemainingCount,
    showUpgradePrompt,
  };
}

// ============================================
// Helper Messages
// ============================================

function getLimitMessage(feature: "maxPlays" | "maxPlaybooks" | "maxExports", limit: number): string {
  const messages = {
    maxPlays: `You've reached the ${limit} play limit. Upgrade to create more plays.`,
    maxPlaybooks: `You've reached the ${limit} playbook limit. Upgrade to create more playbooks.`,
    maxExports: `You've used all ${limit} exports this month. Upgrade for more exports.`,
  };
  return messages[feature];
}

function getFeatureMessage(feature: keyof PlanLimits): string {
  const messages: Partial<Record<keyof PlanLimits, string>> = {
    defensePresets: "Defense presets require a Team or Season plan.",
    customFormations: "Custom formations require a Team or Season plan.",
    shareLinks: "Share links require a Team or Season plan.",
    teamFeatures: "Team collaboration features require a Team or Season plan.",
    installPlan: "Install Plan feature requires a Team or Season plan.",
    advancedExport: "Advanced export options require a Team or Season plan.",
  };
  return messages[feature] || `This feature requires an upgraded plan.`;
}
