"use client";

import React, { useMemo, useState } from "react";
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
import { ContextInputForm } from "./ContextInputForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getRunConceptById } from "@/domain/engine/concepts-run";
import { getPassConceptById } from "@/domain/engine/concepts-pass";
import { getDefensePresetById } from "@/domain/engine/defense-presets";

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
  } = useEditorStore();

  // Context state with defaults
  const [context, setContext] = useState<SuggestionContext>({
    ...DEFAULT_SUGGESTION_CONTEXT,
    playType: suggestionsType || "run",
  });

  // View mode: concepts or families
  const [viewMode, setViewMode] = useState<"concepts" | "families">("concepts");

  // Collapsed state for context form
  const [contextCollapsed, setContextCollapsed] = useState(false);

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

  if (!suggestionsOpen) return null;

  const handleBuild = (result: EnhancedSuggestionResult) => {
    // Find the concept from the library
    const concept =
      result.conceptType === "run"
        ? getRunConceptById(result.conceptId)
        : getPassConceptById(result.conceptId);

    if (!concept) {
      toast.error("Concept not found");
      return;
    }

    const prevActionCount = play?.actions.length || 0;
    buildFromConcept(concept);

    // Show toast with undo option
    const newActionCount = useEditorStore.getState().play?.actions.length || 0;
    const actionsAdded = newActionCount - prevActionCount;

    toast.success(`Built: ${result.name}`, {
      description: `${actionsAdded} actions added`,
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

      {/* Context Input Form (collapsible) */}
      <div className="border-b">
        <button
          onClick={() => setContextCollapsed(!contextCollapsed)}
          className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-muted-foreground hover:bg-muted/50"
        >
          <span>Context Input</span>
          <span>{contextCollapsed ? "▼" : "▲"}</span>
        </button>
        {!contextCollapsed && (
          <ContextInputForm context={context} onChange={setContext} />
        )}
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "concepts" | "families")} className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-2 grid grid-cols-2">
          <TabsTrigger value="concepts" className="text-xs">
            Concepts ({suggestions.length})
          </TabsTrigger>
          <TabsTrigger value="families" className="text-xs">
            Families ({familySuggestions.length})
          </TabsTrigger>
        </TabsList>

        {/* Results header - Top 5 only */}
        <div className="px-3 py-2 bg-muted/30 border-b mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Top {viewMode === "concepts" ? suggestions.length : familySuggestions.length}
            </span>
            <Badge variant="outline" className="text-xs">
              {context.playType.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Concepts View */}
        <TabsContent value="concepts" className="flex-1 overflow-y-auto p-3 space-y-2 mt-0">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No matching concepts found.
              <br />
              Try adjusting the context inputs.
            </div>
          ) : (
            suggestions.map((result, index) => (
              <EnhancedConceptCard
                key={result.conceptId}
                result={result}
                rank={index + 1}
                onBuild={() => handleBuild(result)}
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
  const { name, conceptType, score, fit, why, alerts, autoBuildProfile } =
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
              <div className="font-medium text-sm">{name}</div>
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

        {/* Why reasons */}
        {why.length > 0 && (
          <div className="text-xs text-muted-foreground space-y-0.5 mb-2">
            {why.slice(0, 3).map((reason, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className="text-green-500">✓</span>
                <span>{reason}</span>
              </div>
            ))}
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
