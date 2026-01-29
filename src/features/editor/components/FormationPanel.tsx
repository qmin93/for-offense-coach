"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useEditorStore } from "../store";
import { FORMATIONS, getFormationById } from "@/domain/engine/formations";
import { FORMATION_PACKAGES, PHILOSOPHY_DESCRIPTIONS } from "@/domain/engine/formation-packages";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTeamProfile } from "@/lib/team-profile";
import { getTopFormations, getTopPackages, type FormationRecommendation, type PackageRecommendation } from "@/domain/engine/formation-recommendation";
import { telemetry } from "@/lib/telemetry";
import { toast } from "sonner";
import {
  Star,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Settings2,
  Sparkles,
  Layers,
  Users,
} from "lucide-react";
import type { Formation, FormationPackage } from "@/domain/dsl/types";

// ============================================
// Formation Card Component
// ============================================

interface FormationCardProps {
  formation: Formation;
  isSelected: boolean;
  onSelect: () => void;
  recommendation?: FormationRecommendation;
  showRecommendation?: boolean;
}

function FormationCard({
  formation,
  isSelected,
  onSelect,
  recommendation,
  showRecommendation = false,
}: FormationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Extract personnel info - format as coach-friendly "11P", "12P", "21P"
  const primaryPersonnel = formation.meta?.personnelHint?.[0] || "11";
  const personnelBadge = `${primaryPersonnel}P`;
  const structure = formation.meta?.structure || "pro";

  // Get structure badge (2x2, 3x1, etc.)
  const structureBadge = formation.meta?.structure === "3x1" ? "3x1" :
    formation.meta?.structure === "bunch" ? "3x1" :
    formation.meta?.structure === "2x2" ? "2x2" :
    formation.meta?.structure === "empty" ? "5x0" :
    formation.meta?.structure === "I" ? "2x1" : "2x2";

  // Structure color mapping (dark-theme compatible)
  const structureColors: Record<string, string> = {
    balanced: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    spread: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    pro: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    trips: "bg-green-500/20 text-green-400 border-green-500/30",
    bunch: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    empty: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 transition-all overflow-hidden",
        isSelected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border hover:border-primary/50 hover:shadow-sm"
      )}
    >
      <button
        onClick={onSelect}
        className={cn(
          "w-full p-3 text-left",
          !isSelected && "hover:bg-white/5"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          {/* Left: Personnel badge */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex flex-col items-center justify-center",
                isSelected
                  ? "bg-primary/20 text-primary"
                  : "bg-white/10 text-white/80"
              )}
            >
              <span className="text-sm font-bold">{personnelBadge}</span>
              <span className="text-[9px] text-white/50">{structureBadge}</span>
            </div>

            {/* Formation info */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-white">{formation.name}</span>
                {showRecommendation && recommendation && recommendation.score >= 70 && (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
              {/* Tags row */}
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-md border",
                    structureColors[structure.toLowerCase()] || structureColors.pro
                  )}
                >
                  {structure}
                </span>
                {formation.meta?.complexity && formation.meta.complexity >= 3 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Advanced
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Score or check */}
          <div className="flex items-center gap-2">
            {showRecommendation && recommendation && (
              <div
                className={cn(
                  "text-xs font-bold px-2 py-1 rounded-lg",
                  recommendation.score >= 80
                    ? "bg-green-500/20 text-green-400"
                    : recommendation.score >= 60
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-white/10 text-white/60"
                )}
              >
                {recommendation.score}%
              </div>
            )}
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Recommendation details toggle */}
      {showRecommendation && recommendation && (
        <div className="border-t border-border/50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-muted-foreground hover:bg-accent/30"
          >
            <span>Why recommended?</span>
            {showDetails ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {showDetails && (
            <div className="px-3 pb-2 space-y-1.5">
              {/* Reasons */}
              {recommendation.reasons.slice(0, 2).map((reason, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs">
                  <Star className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{reason}</span>
                </div>
              ))}

              {/* Tags */}
              {recommendation.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {recommendation.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-blue-500/10 text-blue-400 px-1 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {recommendation.warnings.length > 0 && (
                <div className="flex items-start gap-1.5 text-xs mt-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-amber-400/80">{recommendation.warnings[0]}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Main FormationPanel Component
// ============================================

export function FormationPanel() {
  const { applyFormation, play } = useEditorStore();
  const { profile, loading: profileLoading } = useTeamProfile();
  const currentFormationId = play?.meta?.formationId;
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"recommended" | "all" | "packages">("recommended");
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const hasTrackedRecoShown = useRef(false);

  // Get recommendations based on team profile
  const recommendations = useMemo(() => {
    if (!profile) return [];
    return getTopFormations(profile, 10);
  }, [profile]);

  // Get package recommendations
  const packageRecommendations = useMemo(() => {
    if (!profile) return [];
    return getTopPackages(profile, 6);
  }, [profile]);

  // Track when recommendations are shown (once per session)
  useEffect(() => {
    if (recommendations.length > 0 && !hasTrackedRecoShown.current) {
      telemetry.formationRecoShown({
        count: recommendations.length,
        hasTeamProfile: !!profile,
        topFormationId: recommendations[0]?.formation.id,
        topScore: recommendations[0]?.score,
      });
      hasTrackedRecoShown.current = true;
    }
  }, [recommendations, profile]);

  // Create a map for quick lookup
  const recommendationMap = useMemo(() => {
    const map = new Map<string, FormationRecommendation>();
    recommendations.forEach((r) => {
      map.set(r.formation.id, r);
    });
    return map;
  }, [recommendations]);

  // Handle formation selection with telemetry
  const handleSelectFormation = useCallback(
    (formation: Formation, isRecommendation: boolean = false) => {
      const recommendation = recommendationMap.get(formation.id);

      // Track recommendation selection if applicable
      if (isRecommendation && recommendation) {
        const position = recommendations.findIndex((r) => r.formation.id === formation.id);
        telemetry.formationRecoSelected({
          formationId: formation.id,
          formationName: formation.name,
          score: recommendation.score,
          position: position + 1,
          hasTeamProfile: !!profile,
        });
      }

      // Apply the formation
      applyFormation(formation);

      // Track formation applied
      telemetry.formationApplied({
        formationId: formation.id,
        formationName: formation.name,
        source: isRecommendation ? "recommendation" : "panel",
        score: recommendation?.score,
      });

      // Show success toast for recommendations
      if (isRecommendation && recommendation) {
        toast.success(`Applied ${formation.name}`, {
          description: recommendation.reasons[0] || "Formation applied successfully",
        });
      }
    },
    [applyFormation, profile, recommendations, recommendationMap]
  );

  // Determine which formations to show
  const displayFormations = useMemo(() => {
    if (viewMode === "recommended" && recommendations.length > 0) {
      return showAll
        ? recommendations.map((r) => r.formation)
        : recommendations.slice(0, 5).map((r) => r.formation);
    }
    return showAll ? FORMATIONS : FORMATIONS.slice(0, 5);
  }, [viewMode, recommendations, showAll]);

  const hasMoreFormations =
    viewMode === "recommended"
      ? recommendations.length > 5
      : FORMATIONS.length > 5;

  return (
    <div className="p-4">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Formations</h3>
        <div className="flex items-center gap-1 text-xs">
          {profile && recommendations.length > 0 && (
            <button
              onClick={() => setViewMode("recommended")}
              className={cn(
                "px-2 py-1 rounded transition-colors",
                viewMode === "recommended"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              For You
            </button>
          )}
          <button
            onClick={() => setViewMode("packages")}
            className={cn(
              "px-2 py-1 rounded transition-colors",
              viewMode === "packages"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="w-3 h-3 inline mr-1" />
            Packages
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={cn(
              "px-2 py-1 rounded transition-colors",
              viewMode === "all"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
        </div>
      </div>

      {/* Team profile hint */}
      {!profile && !profileLoading && (
        <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <Settings2 className="w-3 h-3" />
            <span>Set up your team profile for personalized recommendations</span>
          </div>
        </div>
      )}

      {/* Packages view */}
      {viewMode === "packages" && (
        <div className="space-y-3">
          {(profile ? packageRecommendations : FORMATION_PACKAGES.slice(0, 6).map(pkg => ({
            package: pkg,
            score: 70,
            baseFormation: getFormationById(pkg.formations.find(f => f.role === "base")?.formationId || ""),
            availableFormations: pkg.formations.map(f => getFormationById(f.formationId)).filter((f): f is Formation => !!f),
            reasons: [pkg.summary],
            warnings: [],
            philosophyDescription: PHILOSOPHY_DESCRIPTIONS[pkg.philosophy],
          }))).map((pkgReco) => (
            <PackageCard
              key={pkgReco.package.id}
              recommendation={pkgReco}
              expanded={expandedPackage === pkgReco.package.id}
              onToggle={() => setExpandedPackage(
                expandedPackage === pkgReco.package.id ? null : pkgReco.package.id
              )}
              onSelectFormation={(formation) => handleSelectFormation(formation, false)}
              currentFormationId={currentFormationId}
            />
          ))}
        </div>
      )}

      {/* Formation list */}
      {viewMode !== "packages" && (
        <>
          <div className="grid grid-cols-1 gap-2">
            {displayFormations.map((formation) => {
              const isSelected = currentFormationId === formation.id;
              const recommendation = recommendationMap.get(formation.id);
              const isRecommendationView = viewMode === "recommended" && !!recommendation;
              return (
                <FormationCard
                  key={formation.id}
                  formation={formation}
                  isSelected={isSelected}
                  onSelect={() => handleSelectFormation(formation, isRecommendationView)}
                  recommendation={recommendation}
                  showRecommendation={isRecommendationView}
                />
              );
            })}
          </div>

          {/* Show more/less button */}
          {hasMoreFormations && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-3 h-3 inline mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 inline mr-1" />
                  Show More ({viewMode === "recommended" ? recommendations.length : FORMATIONS.length} total)
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// Package Card Component
// ============================================

interface PackageCardProps {
  recommendation: PackageRecommendation;
  expanded: boolean;
  onToggle: () => void;
  onSelectFormation: (formation: Formation) => void;
  currentFormationId?: string;
}

function PackageCard({
  recommendation,
  expanded,
  onToggle,
  onSelectFormation,
  currentFormationId,
}: PackageCardProps) {
  const { package: pkg, score, availableFormations, reasons, philosophyDescription } = recommendation;

  // Philosophy colors (dark-theme compatible)
  const philosophyColors: Record<string, string> = {
    spread_the_defense: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    condensed_power: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    balance_flexibility: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    misdirection: "bg-green-500/20 text-green-400 border-green-500/30",
    personnel_based: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };

  const hasSelectedFormation = availableFormations.some(f => f.id === currentFormationId);

  return (
    <div
      className={cn(
        "rounded-xl border-2 transition-all overflow-hidden",
        hasSelectedFormation
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50"
      )}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-3 text-left hover:bg-white/5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <div className="font-semibold text-sm text-white">{pkg.name}</div>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-md border",
                    philosophyColors[pkg.philosophy] || philosophyColors.balance_flexibility
                  )}
                >
                  {pkg.philosophy.replace(/_/g, " ")}
                </span>
                {pkg.personnel && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white/10 text-white/70 border border-white/20">
                    <Users className="w-2.5 h-2.5 inline mr-0.5" />
                    {pkg.personnel.join("/")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/50">
              {availableFormations.length} formations
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-white/50" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/50" />
            )}
          </div>
        </div>
        <p className="text-xs text-white/60 mt-2 line-clamp-2">{pkg.summary}</p>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border p-3 bg-white/5">
          {/* Philosophy description */}
          <div className="text-xs text-white/60 mb-3 italic">
            {philosophyDescription}
          </div>

          {/* Formations list */}
          <div className="space-y-1.5">
            {pkg.formations.map((relation) => {
              const formation = availableFormations.find(f => f.id === relation.formationId);
              if (!formation) return null;

              const isSelected = formation.id === currentFormationId;

              return (
                <button
                  key={formation.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFormation(formation);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all",
                    isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-white/5 border border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-sm font-medium flex-1 text-white">{formation.name}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded",
                    relation.role === "base"
                      ? "bg-blue-500/20 text-blue-400"
                      : relation.role === "variation"
                      ? "bg-white/10 text-white/60"
                      : "bg-green-500/20 text-green-400"
                  )}>
                    {relation.role}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Strengths */}
          {pkg.strengthVs && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-[10px] font-medium text-white/50 uppercase mb-1">Strong vs</div>
              <div className="flex flex-wrap gap-1">
                {pkg.strengthVs.defense?.map(d => (
                  <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                    {d}
                  </span>
                ))}
                {pkg.strengthVs.coverage?.map(c => (
                  <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
