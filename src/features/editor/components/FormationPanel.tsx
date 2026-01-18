"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useEditorStore } from "../store";
import { FORMATIONS } from "@/domain/engine/formations";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTeamProfile } from "@/lib/team-profile";
import { getTopFormations, type FormationRecommendation } from "@/domain/engine/formation-recommendation";
import { telemetry } from "@/lib/telemetry";
import { toast } from "sonner";
import {
  Star,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Settings2,
  Sparkles,
} from "lucide-react";
import type { Formation } from "@/domain/dsl/types";

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

  // Extract personnel info
  const personnelCode = formation.meta?.personnelHint?.join("") || "11";
  const structure = formation.meta?.structure || "pro";

  // Structure color mapping
  const structureColors: Record<string, string> = {
    balanced: "bg-blue-100 text-blue-700 border-blue-200",
    spread: "bg-purple-100 text-purple-700 border-purple-200",
    pro: "bg-slate-100 text-slate-700 border-slate-200",
    trips: "bg-green-100 text-green-700 border-green-200",
    bunch: "bg-amber-100 text-amber-700 border-amber-200",
    empty: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 transition-all overflow-hidden",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-slate-200 hover:border-primary/50 hover:shadow-sm"
      )}
    >
      <button
        onClick={onSelect}
        className={cn(
          "w-full p-3 text-left",
          !isSelected && "hover:bg-slate-50/50"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          {/* Left: Personnel badge */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold",
                isSelected
                  ? "bg-primary/20 text-primary"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {personnelCode}
            </div>

            {/* Formation info */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-slate-800">{formation.name}</span>
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
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
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
                    ? "bg-green-100 text-green-700"
                    : recommendation.score >= 60
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600"
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
  const [viewMode, setViewMode] = useState<"recommended" | "all">("recommended");
  const hasTrackedRecoShown = useRef(false);

  // Get recommendations based on team profile
  const recommendations = useMemo(() => {
    if (!profile) return [];
    return getTopFormations(profile, 10);
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
        {profile && recommendations.length > 0 && (
          <div className="flex items-center gap-1 text-xs">
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
        )}
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

      {/* Formation list */}
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
    </div>
  );
}
