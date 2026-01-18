"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import type { ConceptPack } from "@/domain/dsl/types";
import { isPackNew } from "@/domain/dsl/types";
import { getPackByConceptId, isConceptInBasePack } from "@/domain/engine/concept-packs";

// ============================================
// Pack Badge - Shows which pack a concept belongs to
// ============================================

interface PackBadgeProps {
  pack: ConceptPack;
  showNew?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function PackBadge({ pack, showNew = true, size = "sm", className }: PackBadgeProps) {
  const isNew = showNew && isPackNew(pack);
  const isBase = pack.id === "pack_base";

  const sizeClasses = size === "sm"
    ? "text-[10px] px-1.5 py-0.5"
    : "text-xs px-2 py-0.5";

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Badge
        variant={isBase ? "secondary" : "outline"}
        className={cn(
          sizeClasses,
          "font-medium",
          isBase && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
          !isBase && "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
        )}
      >
        {isBase ? "Base" : `W${pack.meta.releaseWeek}`}
      </Badge>
      {isNew && <NewBadge size={size} />}
    </span>
  );
}

// ============================================
// New Badge - Animated "NEW" indicator
// ============================================

interface NewBadgeProps {
  size?: "sm" | "md";
  className?: string;
  pulse?: boolean;
}

export function NewBadge({ size = "sm", className, pulse = true }: NewBadgeProps) {
  const sizeClasses = size === "sm"
    ? "text-[9px] px-1 py-0"
    : "text-[10px] px-1.5 py-0.5";

  return (
    <Badge
      className={cn(
        sizeClasses,
        "font-bold uppercase tracking-wider",
        "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0",
        "shadow-sm shadow-emerald-500/30",
        pulse && "animate-pulse",
        className
      )}
    >
      New
    </Badge>
  );
}

// ============================================
// Concept Pack Indicator - Shows pack + tier info
// ============================================

interface ConceptPackIndicatorProps {
  conceptId: string;
  tier?: "free" | "team" | "season";
  showLockIcon?: boolean;
  className?: string;
}

export function ConceptPackIndicator({
  conceptId,
  tier = "free",
  showLockIcon = true,
  className
}: ConceptPackIndicatorProps) {
  const pack = getPackByConceptId(conceptId);
  const isBase = isConceptInBasePack(conceptId);
  const isLocked = tier === "free" && !isBase;

  if (!pack) return null;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <PackBadge pack={pack} size="sm" />
      {showLockIcon && isLocked && (
        <span className="text-amber-500 text-xs" title="Team plan required">
          <LockIcon className="w-3 h-3" />
        </span>
      )}
    </span>
  );
}

// ============================================
// New Pack Banner - For announcements
// ============================================

interface NewPackBannerProps {
  pack: ConceptPack;
  onClose?: () => void;
  className?: string;
}

export function NewPackBanner({ pack, onClose, className }: NewPackBannerProps) {
  if (!isPackNew(pack)) return null;

  const totalConcepts =
    pack.content.runConceptIds.length + pack.content.passConceptIds.length;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg p-3",
        "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10",
        "border border-emerald-500/20",
        className
      )}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 animate-pulse" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <NewBadge pulse={false} />
            <span className="font-semibold text-sm text-foreground">
              {pack.name}
            </span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {pack.meta.description || `${totalConcepts} new concepts added`}
          </p>

          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              +{pack.content.runConceptIds.length} Run
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              +{pack.content.passConceptIds.length} Pass
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Dismiss"
          >
            <XIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Tier Badge - Shows plan tier
// ============================================

interface TierBadgeProps {
  tier: "free" | "team" | "season";
  size?: "sm" | "md";
  className?: string;
}

export function TierBadge({ tier, size = "sm", className }: TierBadgeProps) {
  const sizeClasses = size === "sm"
    ? "text-[10px] px-1.5 py-0.5"
    : "text-xs px-2 py-0.5";

  const tierStyles = {
    free: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    team: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    season: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  };

  const tierLabels = {
    free: "Free",
    team: "Team",
    season: "Season",
  };

  return (
    <Badge
      variant="outline"
      className={cn(sizeClasses, "font-medium border-0", tierStyles[tier], className)}
    >
      {tierLabels[tier]}
    </Badge>
  );
}

// ============================================
// Simple Icons (inline SVG to avoid dependency)
// ============================================

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

function XIcon({ className }: { className?: string }) {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
