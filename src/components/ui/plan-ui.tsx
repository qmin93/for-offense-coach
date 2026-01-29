"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import type { PlanTier, PlanLimits } from "@/domain/dsl/types";
import { PLAN_TIER_LIMITS } from "@/domain/dsl/types";
import { usePlan } from "@/contexts/plan-context";

// ============================================
// Plan Badge - Shows current tier
// ============================================

interface PlanBadgeProps {
  tier?: PlanTier;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function PlanBadge({ tier, size = "md", showIcon = true, className }: PlanBadgeProps) {
  const plan = usePlan();
  const currentTier = tier || plan.tier;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  const tierStyles = {
    free: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      icon: null,
    },
    team: {
      bg: "bg-blue-100 dark:bg-blue-900",
      text: "text-blue-700 dark:text-blue-300",
      icon: "👥",
    },
    season: {
      bg: "bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900",
      text: "text-amber-700 dark:text-amber-300",
      icon: "⭐",
    },
  };

  const style = tierStyles[currentTier];

  return (
    <Badge
      variant="outline"
      className={cn(
        sizeClasses[size],
        "font-semibold border-0",
        style.bg,
        style.text,
        className
      )}
    >
      {showIcon && style.icon && <span className="mr-1">{style.icon}</span>}
      {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
    </Badge>
  );
}

// ============================================
// Upgrade Prompt Dialog
// ============================================

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
  onSelectPlan?: (tier: PlanTier) => void;
}

export function UpgradePromptDialog({ open, onClose, feature, onSelectPlan }: UpgradePromptProps) {
  const { tier, setTier } = usePlan();

  const handleSelectPlan = (newTier: PlanTier) => {
    setTier(newTier);
    onSelectPlan?.(newTier);
    onClose();
  };

  const featureMessages: Record<string, string> = {
    defensePresets: "Defense presets let you quickly apply common defensive looks",
    customFormations: "Create and save your own custom formations",
    shareLinks: "Share plays with view-only links",
    teamFeatures: "Collaborate with your coaching staff",
    installPlan: "Plan your weekly concept installs",
    advancedExport: "Export multi-page PDFs and scout cards",
    maxPlays: "Create more plays in your workspace",
    maxPlaybooks: "Organize plays into multiple playbooks",
    maxExports: "Export more plays this month",
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Upgrade Your Plan
          </DialogTitle>
          {feature && (
            <DialogDescription>
              {featureMessages[feature] || `Unlock ${feature} and more with an upgraded plan.`}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Plan Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Free Plan */}
            <PlanCard
              tier="free"
              price="$0"
              period="forever"
              features={[
                "10 plays",
                "1 playbook",
                "5 exports/mo",
                "Base concepts",
              ]}
              isCurrentPlan={tier === "free"}
              onSelect={() => handleSelectPlan("free")}
            />

            {/* Team Plan */}
            <PlanCard
              tier="team"
              price="$9"
              period="/month"
              features={[
                "100 plays",
                "5 playbooks",
                "50 exports/mo",
                "All concepts",
                "Defense presets",
                "Share links",
              ]}
              isCurrentPlan={tier === "team"}
              onSelect={() => handleSelectPlan("team")}
              highlighted
            />

            {/* Season Plan */}
            <PlanCard
              tier="season"
              price="$49"
              period="/season"
              features={[
                "Unlimited plays",
                "Unlimited playbooks",
                "Unlimited exports",
                "All features",
                "Priority support",
                "Early access",
              ]}
              isCurrentPlan={tier === "season"}
              onSelect={() => handleSelectPlan("season")}
            />
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Plans are for demo purposes. In production, this would connect to a payment system.
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Plan Card Component
// ============================================

interface PlanCardProps {
  tier: PlanTier;
  price: string;
  period: string;
  features: string[];
  isCurrentPlan: boolean;
  onSelect: () => void;
  highlighted?: boolean;
}

function PlanCard({
  tier,
  price,
  period,
  features,
  isCurrentPlan,
  onSelect,
  highlighted,
}: PlanCardProps) {
  const tierLabels = {
    free: "Free",
    team: "Team",
    season: "Season",
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 flex flex-col",
        highlighted && "border-blue-500 shadow-lg shadow-blue-500/10",
        isCurrentPlan && "bg-muted/50"
      )}
    >
      {highlighted && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <Badge className="bg-blue-500 text-white text-[10px]">Popular</Badge>
        </div>
      )}

      <div className="text-center mb-3">
        <h3 className="font-semibold text-sm">{tierLabels[tier]}</h3>
        <div className="mt-1">
          <span className="text-2xl font-bold">{price}</span>
          <span className="text-xs text-muted-foreground">{period}</span>
        </div>
      </div>

      <ul className="space-y-1.5 flex-1 mb-4">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs">
            <CheckIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        size="sm"
        variant={isCurrentPlan ? "outline" : highlighted ? "default" : "secondary"}
        className="w-full text-xs"
        onClick={onSelect}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? "Current Plan" : "Select"}
      </Button>
    </div>
  );
}

// ============================================
// Usage Indicator
// ============================================

interface UsageIndicatorProps {
  feature: "maxPlays" | "maxPlaybooks" | "maxExports";
  label: string;
  className?: string;
}

export function UsageIndicator({ feature, label, className }: UsageIndicatorProps) {
  const { usage, limits, getRemainingCount, showUpgradePrompt } = usePlan();

  const current =
    feature === "maxPlays"
      ? usage.plays
      : feature === "maxPlaybooks"
      ? usage.playbooks
      : usage.exportsThisMonth;

  const limit = limits[feature];
  const remaining = getRemainingCount(feature);
  const isUnlimited = remaining === "unlimited";
  const percentage = isUnlimited ? 0 : (current / limit) * 100;
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && current >= limit;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            "font-medium",
            isAtLimit && "text-red-500",
            isNearLimit && !isAtLimit && "text-amber-500"
          )}
        >
          {isUnlimited ? (
            <span className="text-green-500">Unlimited</span>
          ) : (
            `${current} / ${limit}`
          )}
        </span>
      </div>

      {!isUnlimited && (
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all",
              isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-blue-500"
            )}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      )}

      {isAtLimit && (
        <button
          onClick={() => showUpgradePrompt(feature)}
          className="text-[10px] text-blue-500 hover:underline"
        >
          Upgrade for more
        </button>
      )}
    </div>
  );
}

// ============================================
// Feature Lock Overlay
// ============================================

interface FeatureLockProps {
  feature: keyof PlanLimits;
  children: React.ReactNode;
  message?: string;
}

export function FeatureLock({ feature, children, message }: FeatureLockProps) {
  const { canUseFeature, showUpgradePrompt, tier } = usePlan();

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none select-none">{children}</div>
      <div
        className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[1px] cursor-pointer"
        onClick={() => showUpgradePrompt(feature)}
      >
        <div className="text-center p-4">
          <LockIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {message || `Upgrade to ${tier === "free" ? "Team" : "Season"} to unlock`}
          </p>
          <Button size="sm" variant="link" className="text-xs mt-1">
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Plan Switcher (for demo/testing)
// ============================================

export function PlanSwitcher() {
  const { tier, setTier } = usePlan();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Plan:</span>
      <div className="flex gap-1">
        {(["free", "team", "season"] as PlanTier[]).map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={cn(
              "px-2 py-0.5 text-xs rounded transition-colors",
              tier === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Icons
// ============================================

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
