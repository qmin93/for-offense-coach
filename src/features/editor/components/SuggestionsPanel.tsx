"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useEditorStore } from "../store";
import {
  getEnhancedSuggestions,
  SuggestionResult,
  getComprehensiveSuggestions,
  FamilySuggestionResult,
} from "@/domain/engine/suggestions";
import {
  SuggestionContext,
  EnhancedSuggestionResult,
  DEFAULT_SUGGESTION_CONTEXT,
} from "@/domain/engine/suggestion-context";
import { ContextSummaryPanel } from "./ContextSummaryPanel";
import { ContextImpactStrip } from "./ContextImpactStrip";
import { QuickSituationCards, type QuickSituation } from "./QuickSituationCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getRunConceptById } from "@/domain/engine/concepts-run";
import { getPassConceptById } from "@/domain/engine/concepts-pass";
import { getDefensePresetById } from "@/domain/engine/defense-presets";
import { telemetry, setLastAutobuildContext } from "@/lib/telemetry";
import { NewPackBanner, ConceptPackIndicator } from "@/components/ui/concept-pack-badge";
import { getNewConceptPacks, getLatestPack } from "@/domain/engine/concept-packs";
import { ExplainDrawer } from "./ExplainDrawer";

export function SuggestionsPanel() {
  const {
    play,
    suggestionsOpen,
    suggestionsType,
    closeSuggestions,
    buildFromConcept,
    canUndo,
    undo,
    defensePresetId,
    context: storeContext,
  } = useEditorStore();

  // Context state with defaults, synced with active context from store
  const [context, setContext] = useState<SuggestionContext>({
    ...DEFAULT_SUGGESTION_CONTEXT,
    playType: suggestionsType || "run",
  });

  // View mode: concepts or families
  const [viewMode, setViewMode] = useState<"concepts" | "families">("concepts");

  // Quick situation filter
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);

  // New pack banner state
  const [showNewPackBanner, setShowNewPackBanner] = useState(true);
  const newPacks = getNewConceptPacks();
  const latestPack = newPacks.length > 0 ? newPacks[0] : null;

  // Sync context with activeContext from store
  React.useEffect(() => {
    const activeContext = storeContext.active;
    if (activeContext) {
      setContext((prev) => ({
        ...prev,
        playType: activeContext.playType,
        defense: {
          ...prev.defense,
          boxCount: activeContext.boxCount === "unknown" ? prev.defense.boxCount : activeContext.boxCount,
          front: activeContext.front === "unknown" ? prev.defense.front : activeContext.front,
        },
      }));
    }
  }, [storeContext.active]);

  // Track if we've already tracked the panel open
  const hasTrackedOpen = useRef(false);

  // Get current defense preset info
  const defensePreset = defensePresetId ? getDefensePresetById(defensePresetId) : null;

  // Sync play type with suggestions type
  React.useEffect(() => {
    if (suggestionsType) {
      setContext((prev) => ({
        ...prev,
        playType: suggestionsType === "pass" ? "pass" : "run",
      }));
    }
  }, [suggestionsType]);

  // Get comprehensive suggestions (both enhanced and families)
  const comprehensiveSuggestions = useMemo(() => {
    if (!play || !suggestionsOpen) return null;
    return getComprehensiveSuggestions(
      play,
      defensePresetId,
      context.playType === "pass" ? "pass" : "run"
    );
  }, [play, suggestionsOpen, defensePresetId, context.playType]);

  // Enhanced suggestions from comprehensive
  const suggestions = comprehensiveSuggestions?.enhanced || [];
  const familySuggestions = comprehensiveSuggestions?.families || [];

  // Track panel open telemetry
  useEffect(() => {
    if (suggestionsOpen && !hasTrackedOpen.current && play?.meta?.formationId) {
      telemetry.suggestionsOpened({
        formationId: play.meta.formationId,
        mode: context.playType as "pass" | "run",
        conceptCount: suggestions.length,
      });
      hasTrackedOpen.current = true;
    }
    // Reset tracking when panel closes
    if (!suggestionsOpen) {
      hasTrackedOpen.current = false;
    }
  }, [suggestionsOpen, play?.meta?.formationId, context.playType, suggestions.length]);

  // Handle quick situation selection
  const handleQuickSituationSelect = (situation: QuickSituation) => {
    if (selectedSituation === situation.id) {
      setSelectedSituation(null);
    } else {
      setSelectedSituation(situation.id);
      // Update play type based on situation
      if (situation.context.playType) {
        setContext((prev) => ({
          ...prev,
          playType: situation.context.playType || prev.playType,
        }));
      }
    }
  };

  // Filter suggestions based on selected situation
  const filteredSuggestions = useMemo(() => {
    if (!selectedSituation) return suggestions;
    const situation = [
      { id: "3rd_long", concepts: ["mesh", "levels", "flood", "four_verticals"] },
      { id: "redzone", concepts: ["naked_boot", "pa_boot", "fade_out", "slant_flat"] },
      { id: "2min", concepts: ["stick", "speed_out", "drive", "levels"] },
    ].find((s) => s.id === selectedSituation);
    if (!situation) return suggestions;
    return suggestions.filter((s) =>
      situation.concepts.some((c) => s.conceptId.toLowerCase().includes(c))
    );
  }, [suggestions, selectedSituation]);

  if (!suggestionsOpen) return null;

  const handleBuild = (result: EnhancedSuggestionResult, position?: number, source: "suggestions" | "library" = "suggestions") => {
    // Track concept click telemetry
    telemetry.conceptClicked({
      conceptId: result.conceptId,
      conceptName: result.name,
      conceptType: result.conceptType as "pass" | "run",
      source,
      position,
    });

    // Track why viewed if reasons exist
    if (result.typedReasons && result.typedReasons.length > 0) {
      telemetry.whyViewed({
        conceptId: result.conceptId,
        reasonCount: result.typedReasons.length,
      });
    }

    // Find the concept from the library
    const concept =
      result.conceptType === "run"
        ? getRunConceptById(result.conceptId)
        : getPassConceptById(result.conceptId);

    if (!concept) {
      toast.error("Concept not found");
      return;
    }

    // Update autobuild context with reason count for undo tracking
    setLastAutobuildContext({
      conceptId: result.conceptId,
      conceptName: result.name,
      reasonCount: result.typedReasons?.length || 0,
      startedAt: Date.now(),
    });

    const buildResult = buildFromConcept(concept);

    // Handle failure with detailed message
    if (!buildResult?.success) {
      const failure = buildResult?.failure;
      toast.error(`Auto-build failed: ${failure?.message || "Unknown error"}`, {
        description: failure?.suggestion || "Try a different concept or formation",
        duration: 5000,
      });
      return;
    }

    // Show warnings if any
    if (buildResult.warnings && buildResult.warnings.length > 0) {
      toast.warning(`Built with warnings: ${result.name}`, {
        description: buildResult.warnings[0],
        duration: 4000,
      });
    }

    // Show success toast with undo option
    toast.success(`Built: ${result.name}`, {
      description: `${buildResult.appliedActions || 0} actions added`,
      action: canUndo()
        ? {
            label: "Undo",
            onClick: () => undo(),
          }
        : undefined,
    });
  };

  return (
    <div className="w-80 bg-background border-l shadow-lg overflow-y-auto flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-3 flex items-center justify-between z-10">
        <h3 className="font-semibold text-foreground text-sm">
          Concept Suggestions
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={closeSuggestions}
          className="h-6 w-6"
        >
          ✕
        </Button>
      </div>

      {/* New Pack Banner */}
      {latestPack && showNewPackBanner && (
        <div className="px-3 pt-3">
          <NewPackBanner
            pack={latestPack}
            onClose={() => setShowNewPackBanner(false)}
          />
        </div>
      )}

      {/* Context Impact Strip (shows current context as chips) */}
      <ContextImpactStrip />

      {/* Quick Situation Cards */}
      <div className="px-3 pt-3 pb-2 border-b">
        <div className="text-xs font-medium text-muted-foreground mb-2">Quick Situations</div>
        <QuickSituationCards
          onSelect={handleQuickSituationSelect}
          selectedId={selectedSituation || undefined}
        />
      </div>

      {/* Context Summary Panel (Summary + Adjust) */}
      <ContextSummaryPanel />

      {/* Defense Preset Info */}
      {defensePreset && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/20 border-b">
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
              vs {defensePreset.name}
            </span>
            <Badge variant="outline" className="text-xs text-red-600 border-red-300">
              {defensePreset.front} / {defensePreset.boxCount}-box
            </Badge>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "concepts" | "families")} className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-2 grid grid-cols-2">
          <TabsTrigger value="concepts" className="text-xs">
            Concepts ({selectedSituation ? filteredSuggestions.length : suggestions.length})
          </TabsTrigger>
          <TabsTrigger value="families" className="text-xs">
            Families ({familySuggestions.length})
          </TabsTrigger>
        </TabsList>

        {/* Results header */}
        <div className="px-3 py-2 bg-muted/30 border-b mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {selectedSituation
                ? `Filtered: ${filteredSuggestions.length} concepts`
                : context.playType === "pass"
                ? `Showing ${suggestions.length} of 12 max`
                : `Top ${suggestions.length}`}
            </span>
            <Badge variant="outline" className="text-xs">
              {context.playType.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Concepts View */}
        <TabsContent value="concepts" className="flex-1 overflow-y-auto p-3 space-y-2 mt-0">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {selectedSituation ? (
                <>
                  <p>No matching concepts for this situation.</p>
                  <button
                    onClick={() => setSelectedSituation(null)}
                    className="text-primary text-xs mt-2 hover:underline"
                  >
                    Clear filter
                  </button>
                </>
              ) : context.playType === "run" && !defensePresetId ? (
                <>
                  <div className="text-amber-600 font-medium mb-2">
                    Defense Required for Run Suggestions
                  </div>
                  <p className="text-xs">
                    Select a defense preset first to get<br />
                    context-based run concept recommendations.
                  </p>
                  <p className="text-xs mt-2 text-muted-foreground">
                    Box count and front type are required<br />
                    to suggest the best run plays.
                  </p>
                </>
              ) : (
                <>
                  No matching concepts found.
                  <br />
                  Try adjusting the context inputs.
                </>
              )}
            </div>
          ) : (
            filteredSuggestions.map((result, index) => (
              <EnhancedConceptCard
                key={result.conceptId}
                result={result}
                rank={index + 1}
                onBuild={() => handleBuild(result, index, "suggestions")}
              />
            ))
          )}
        </TabsContent>

        {/* Families View */}
        <TabsContent value="families" className="flex-1 overflow-y-auto p-3 space-y-2 mt-0">
          {familySuggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No concept families found.
            </div>
          ) : (
            familySuggestions.map((result, index) => (
              <FamilyCard
                key={result.family.id}
                result={result}
                rank={index + 1}
                onBuildBase={() => {
                  if (result.baseConceptResult) {
                    handleBuild(result.baseConceptResult);
                  }
                }}
                onBuildVariation={(conceptId) => {
                  const concept =
                    result.family.conceptType === "run"
                      ? getRunConceptById(conceptId)
                      : getPassConceptById(conceptId);
                  if (concept) {
                    buildFromConcept(concept);
                    toast.success(`Built: ${concept.name}`);
                  }
                }}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// Enhanced Concept Card Component
// ============================================

interface EnhancedConceptCardProps {
  result: EnhancedSuggestionResult;
  rank?: number;
  onBuild: () => void;
}

function EnhancedConceptCard({
  result,
  rank,
  onBuild,
}: EnhancedConceptCardProps) {
  const { name, conceptId, conceptType, score, fit, why, alerts, autoBuildProfile } =
    result;

  // Score color based on value
  const scoreColor =
    score >= 80
      ? "text-green-600 border-green-300 bg-green-50"
      : score >= 60
      ? "text-amber-600 border-amber-300 bg-amber-50"
      : "text-muted-foreground border-border bg-muted";

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-3">
        {/* Header row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {rank && (
              <Badge
                variant="secondary"
                className="h-5 w-5 p-0 justify-center text-xs"
              >
                {rank}
              </Badge>
            )}
            <div>
              <div className="font-medium text-sm flex items-center gap-1.5">
                {name}
                <ConceptPackIndicator conceptId={conceptId} showLockIcon={false} />
              </div>
              <div className="text-xs text-muted-foreground">
                {conceptType === "run" ? "Run" : "Pass"} Concept
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs font-semibold ${scoreColor}`}
          >
            {score}
          </Badge>
        </div>

        {/* Fit analysis badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {fit.numbers && (
            <Badge
              variant="secondary"
              className={`text-xs ${
                fit.numbers.includes("favorable") ? "bg-green-100 text-green-700" : ""
              }`}
            >
              {fit.numbers}
            </Badge>
          )}
          {fit.front && (
            <Badge
              variant="secondary"
              className={`text-xs ${
                fit.front.includes("favorable") ? "bg-green-100 text-green-700" : ""
              }`}
            >
              {fit.front}
            </Badge>
          )}
          {fit.surface && (
            <Badge
              variant="secondary"
              className={`text-xs ${
                fit.surface.includes("good") ? "bg-green-100 text-green-700" : ""
              }`}
            >
              {fit.surface}
            </Badge>
          )}
          {fit.coverage && (
            <Badge
              variant="secondary"
              className={`text-xs ${
                fit.coverage.includes("beater") ? "bg-green-100 text-green-700" : ""
              }`}
            >
              {fit.coverage}
            </Badge>
          )}
        </div>

        {/* Typed Reasons with Details + Points (추천 신뢰 강화) */}
        {result.typedReasons && result.typedReasons.length > 0 && (
          <div className="space-y-1.5 mb-2 border rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Why this concept?
            </div>
            {result.typedReasons.slice(0, 3).map((reason, i) => (
              <div key={i} className="group">
                <div className="flex items-start gap-1.5 text-xs">
                  <span className={reason.favorable ? "text-green-500" : "text-amber-500"}>
                    {reason.favorable ? "✓" : "○"}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-medium ${reason.favorable ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
                        {reason.text}
                      </span>
                      {/* Points badge */}
                      {reason.points !== undefined && reason.points !== 0 && (
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1 py-0 h-4 font-semibold ${
                            reason.points > 0
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-red-100 text-red-700 border-red-300"
                          }`}
                        >
                          {reason.points > 0 ? "+" : ""}{reason.points}
                        </Badge>
                      )}
                    </div>
                    {reason.details && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                        {reason.details}
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase">
                    {reason.type}
                  </span>
                </div>
              </div>
            ))}
            {/* Explain Drawer (collapsible detail view) */}
            {(result.breakdown || result.typedReasons.length > 3) && (
              <div className="pt-1 border-t border-slate-200 dark:border-slate-700 mt-1">
                <ExplainDrawer
                  conceptId={conceptId}
                  conceptName={name}
                  score={score}
                  breakdown={result.breakdown}
                  reasons={result.typedReasons}
                  contextUsed={result.contextUsed}
                />
              </div>
            )}
          </div>
        )}

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="text-xs text-amber-600 space-y-0.5 mb-2 bg-amber-50 rounded p-1.5">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-1">
                <span>⚠</span>
                <span>{alert}</span>
              </div>
            ))}
          </div>
        )}

        {/* Auto-build info */}
        <div className="text-xs text-muted-foreground mb-2">
          <span className="font-medium">Includes: </span>
          {autoBuildProfile.includes.join(", ")}
        </div>

        {/* Build button */}
        <Button size="sm" className="w-full" onClick={onBuild}>
          Auto-build
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================
// Family Card Component
// ============================================

interface FamilyCardProps {
  result: FamilySuggestionResult;
  rank?: number;
  onBuildBase: () => void;
  onBuildVariation: (conceptId: string) => void;
}

function FamilyCard({
  result,
  rank,
  onBuildBase,
  onBuildVariation,
}: FamilyCardProps) {
  const { family, score, fit, activeAlerts, recommendedVariation } = result;
  const [expanded, setExpanded] = useState(false);

  // Overall fit color
  const fitColor =
    fit.overall === "excellent"
      ? "text-green-600 border-green-300 bg-green-50"
      : fit.overall === "good"
      ? "text-blue-600 border-blue-300 bg-blue-50"
      : fit.overall === "fair"
      ? "text-amber-600 border-amber-300 bg-amber-50"
      : "text-red-600 border-red-300 bg-red-50";

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-3">
        {/* Header row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {rank && (
              <Badge
                variant="secondary"
                className="h-5 w-5 p-0 justify-center text-xs"
              >
                {rank}
              </Badge>
            )}
            <div>
              <div className="font-medium text-sm">{family.name}</div>
              <div className="text-xs text-muted-foreground">
                {family.variations.length} variations
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs font-semibold capitalize ${fitColor}`}
          >
            {fit.overall}
          </Badge>
        </div>

        {/* Summary */}
        <p className="text-xs text-muted-foreground mb-2">{family.summary}</p>

        {/* Fit badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {fit.front && (
            <Badge
              variant="secondary"
              className={`text-xs ${fit.front ? "bg-green-100 text-green-700" : ""}`}
            >
              Front OK
            </Badge>
          )}
          {fit.shell && (
            <Badge
              variant="secondary"
              className={`text-xs ${fit.shell ? "bg-green-100 text-green-700" : ""}`}
            >
              Shell OK
            </Badge>
          )}
          {family.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="text-xs space-y-1 mb-2 bg-amber-50 dark:bg-amber-950/20 rounded p-2">
            <div className="font-medium text-amber-700 dark:text-amber-400">
              Active Alerts:
            </div>
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="text-amber-600 dark:text-amber-400">
                <span className="font-medium">{alert.label}:</span>{" "}
                {alert.adjustment}
              </div>
            ))}
          </div>
        )}

        {/* Install Focus */}
        {expanded && (
          <div className="text-xs space-y-1 mb-2 bg-blue-50 dark:bg-blue-950/20 rounded p-2">
            <div className="font-medium text-blue-700 dark:text-blue-400">
              Install Focus:
            </div>
            {family.installFocus.map((item, i) => (
              <div key={i} className="text-blue-600 dark:text-blue-400 flex gap-1">
                <span>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Variations (expanded) */}
        {expanded && (
          <div className="space-y-1 mb-2">
            <div className="text-xs font-medium text-muted-foreground">
              Variations:
            </div>
            {family.variations.map((variation) => (
              <div
                key={variation.conceptId}
                className={`flex items-center justify-between p-1.5 rounded text-xs ${
                  recommendedVariation === variation.conceptId
                    ? "bg-green-50 dark:bg-green-950/20 border border-green-200"
                    : "bg-muted/50"
                }`}
              >
                <div>
                  <span className="font-medium">{variation.label}</span>
                  {recommendedVariation === variation.conceptId && (
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                      Recommended
                    </Badge>
                  )}
                  <p className="text-muted-foreground text-[10px]">
                    {variation.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => onBuildVariation(variation.conceptId)}
                >
                  Build
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Less" : "More"}
          </Button>
          <Button size="sm" className="flex-1 text-xs" onClick={onBuildBase}>
            Build Base
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
