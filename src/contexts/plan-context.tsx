"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { PlanTier, PlanLimits } from "@/domain/dsl/types";
import { PLAN_TIER_LIMITS, isPlanFeatureAvailable, isPlanLimitReached } from "@/domain/dsl/types";

// ============================================
// Plan Context Types
// ============================================

interface PlanUsage {
  plays: number;
  playbooks: number;
  exportsThisMonth: number;
}

interface PlanContextValue {
  // Current plan info
  tier: PlanTier;
  limits: PlanLimits;
  usage: PlanUsage;

  // Helper methods
  canUseFeature: (feature: keyof PlanLimits) => boolean;
  isLimitReached: (feature: "maxPlays" | "maxPlaybooks" | "maxExports") => boolean;
  getRemainingCount: (feature: "maxPlays" | "maxPlaybooks" | "maxExports") => number | "unlimited";

  // Upgrade flow
  showUpgradePrompt: (feature: string) => void;
  upgradePromptFeature: string | null;
  closeUpgradePrompt: () => void;

  // For demo/testing - change tier
  setTier: (tier: PlanTier) => void;
  incrementUsage: (feature: "plays" | "playbooks" | "exportsThisMonth") => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

// ============================================
// Plan Provider Component
// ============================================

interface PlanProviderProps {
  children: React.ReactNode;
  initialTier?: PlanTier;
}

export function PlanProvider({ children, initialTier = "free" }: PlanProviderProps) {
  // Current tier (in real app, this would come from auth/subscription service)
  const [tier, setTier] = useState<PlanTier>(initialTier);

  // Usage tracking (in real app, this would come from API)
  const [usage, setUsage] = useState<PlanUsage>({
    plays: 0,
    playbooks: 0,
    exportsThisMonth: 0,
  });

  // Upgrade prompt state
  const [upgradePromptFeature, setUpgradePromptFeature] = useState<string | null>(null);

  // Get current limits
  const limits = useMemo(() => PLAN_TIER_LIMITS[tier], [tier]);

  // Check if a feature is available
  const canUseFeature = useCallback(
    (feature: keyof PlanLimits): boolean => {
      return isPlanFeatureAvailable(tier, feature);
    },
    [tier]
  );

  // Check if a limit is reached
  const isLimitReached = useCallback(
    (feature: "maxPlays" | "maxPlaybooks" | "maxExports"): boolean => {
      const current =
        feature === "maxPlays"
          ? usage.plays
          : feature === "maxPlaybooks"
          ? usage.playbooks
          : usage.exportsThisMonth;
      return isPlanLimitReached(tier, feature, current);
    },
    [tier, usage]
  );

  // Get remaining count for a limit
  const getRemainingCount = useCallback(
    (feature: "maxPlays" | "maxPlaybooks" | "maxExports"): number | "unlimited" => {
      const limit = limits[feature];
      if (limit === -1 || limit === 0) return "unlimited";

      const current =
        feature === "maxPlays"
          ? usage.plays
          : feature === "maxPlaybooks"
          ? usage.playbooks
          : usage.exportsThisMonth;

      return Math.max(0, limit - current);
    },
    [limits, usage]
  );

  // Show upgrade prompt
  const showUpgradePrompt = useCallback((feature: string) => {
    setUpgradePromptFeature(feature);
  }, []);

  // Close upgrade prompt
  const closeUpgradePrompt = useCallback(() => {
    setUpgradePromptFeature(null);
  }, []);

  // Increment usage (for tracking)
  const incrementUsage = useCallback((feature: "plays" | "playbooks" | "exportsThisMonth") => {
    setUsage((prev) => ({
      ...prev,
      [feature]: prev[feature] + 1,
    }));
  }, []);

  // Load saved tier from localStorage (for demo persistence)
  useEffect(() => {
    const savedTier = localStorage.getItem("plan_tier") as PlanTier | null;
    if (savedTier && ["free", "team", "season"].includes(savedTier)) {
      setTier(savedTier);
    }

    const savedUsage = localStorage.getItem("plan_usage");
    if (savedUsage) {
      try {
        const parsed = JSON.parse(savedUsage);
        setUsage(parsed);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save tier to localStorage when changed
  useEffect(() => {
    localStorage.setItem("plan_tier", tier);
  }, [tier]);

  // Save usage to localStorage when changed
  useEffect(() => {
    localStorage.setItem("plan_usage", JSON.stringify(usage));
  }, [usage]);

  const value: PlanContextValue = {
    tier,
    limits,
    usage,
    canUseFeature,
    isLimitReached,
    getRemainingCount,
    showUpgradePrompt,
    upgradePromptFeature,
    closeUpgradePrompt,
    setTier,
    incrementUsage,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

// ============================================
// Hook to use Plan Context
// ============================================

export function usePlan(): PlanContextValue {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
}

// ============================================
// HOC to wrap components with plan check
// ============================================

interface WithPlanCheckProps {
  feature: keyof PlanLimits;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PlanGate({ feature, children, fallback }: WithPlanCheckProps) {
  const { canUseFeature, showUpgradePrompt } = usePlan();

  if (!canUseFeature(feature)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Show upgrade prompt on click
    return (
      <div
        className="cursor-pointer opacity-60 hover:opacity-80 transition-opacity"
        onClick={() => showUpgradePrompt(feature)}
        title={`Upgrade to unlock ${feature}`}
      >
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
