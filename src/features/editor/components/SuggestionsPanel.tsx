"use client";

import React, { useMemo, useState } from "react";
import { useEditorStore } from "../store";
import {
  getEnhancedSuggestions,
  SuggestionResult,
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
import { toast } from "sonner";
import { getRunConceptById } from "@/domain/engine/concepts-run";
import { getPassConceptById } from "@/domain/engine/concepts-pass";

export function SuggestionsPanel() {
  const {
    play,
    suggestionsOpen,
    suggestionsType,
    closeSuggestions,
    buildFromConcept,
    canUndo,
    undo,
  } = useEditorStore();

  // Context state with defaults
  const [context, setContext] = useState<SuggestionContext>({
    ...DEFAULT_SUGGESTION_CONTEXT,
    playType: suggestionsType || "run",
  });

  // Collapsed state for context form
  const [contextCollapsed, setContextCollapsed] = useState(false);

  // Sync play type with suggestions type
  React.useEffect(() => {
    if (suggestionsType) {
      setContext((prev) => ({
        ...prev,
        playType: suggestionsType === "pass" ? "pass" : "run",
      }));
    }
  }, [suggestionsType]);

  // Get enhanced suggestions based on context
  const suggestions = useMemo(() => {
    if (!play || !suggestionsOpen) return [];
    return getEnhancedSuggestions(play, context);
  }, [play, suggestionsOpen, context]);

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

      {/* Results header */}
      <div className="px-3 py-2 bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {suggestions.length} Recommendations
          </span>
          <Badge variant="outline" className="text-xs">
            {context.playType.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Suggestions list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
      </div>
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
