"use client";

import React, { useMemo, useEffect, useRef } from "react";
import { useEditorStore } from "../store";
import { getComprehensiveSuggestions } from "@/domain/engine/suggestions";
import type { EnhancedSuggestionResult } from "@/domain/engine/suggestion-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getRunConceptById } from "@/domain/engine/concepts-run";
import { getPassConceptById } from "@/domain/engine/concepts-pass";
import { getDefensePresetById } from "@/domain/engine/defense-presets";
import { telemetry, setLastAutobuildContext } from "@/lib/telemetry";
import { ConceptPackIndicator } from "@/components/ui/concept-pack-badge";
import { useTeamProfile } from "@/lib/team-profile";

// ============================================
// Streamlined Suggestions Panel
// Decision-focused: Top 5 concepts, no clutter
// Rule: PASS in = PASS Top 5 only
// Rule: Formation click = Formation-specific Top 5
// ============================================

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

  // Track if we've already tracked the panel open
  const hasTrackedOpen = useRef(false);

  // Get team capabilities for personalized recommendations
  const { capabilities: teamCapabilities } = useTeamProfile();

  // Get current defense preset info
  const defensePreset = defensePresetId ? getDefensePresetById(defensePresetId) : null;

  // Determine play type from entry point - this is LOCKED
  // If user entered with PASS, only show PASS. No mixing.
  const lockedPlayType = suggestionsType === "pass" ? "pass" : "run";

  // Get Top 5 suggestions based on locked playType and current formation
  // Includes team capabilities for personalized recommendations
  const suggestions = useMemo(() => {
    if (!play || !suggestionsOpen) return [];
    const result = getComprehensiveSuggestions(
      play,
      defensePresetId,
      lockedPlayType,
      teamCapabilities
    );
    // Force Top 5 only - clean decision UI
    return result.enhanced.slice(0, 5);
  }, [play, suggestionsOpen, defensePresetId, lockedPlayType, teamCapabilities]);

  // Track panel open telemetry
  useEffect(() => {
    if (suggestionsOpen && !hasTrackedOpen.current && play?.meta?.formationId) {
      telemetry.suggestionsOpened({
        formationId: play.meta.formationId,
        mode: lockedPlayType,
        conceptCount: suggestions.length,
      });
      hasTrackedOpen.current = true;
    }
    if (!suggestionsOpen) {
      hasTrackedOpen.current = false;
    }
  }, [suggestionsOpen, play?.meta?.formationId, lockedPlayType, suggestions.length]);

  if (!suggestionsOpen) return null;

  const handleBuild = (result: EnhancedSuggestionResult, position: number) => {
    // Track concept click
    telemetry.conceptClicked({
      conceptId: result.conceptId,
      conceptName: result.name,
      conceptType: result.conceptType as "pass" | "run",
      source: "suggestions",
      position,
    });

    // Find the concept
    const concept =
      result.conceptType === "run"
        ? getRunConceptById(result.conceptId)
        : getPassConceptById(result.conceptId);

    if (!concept) {
      toast.error("Concept not found");
      return;
    }

    // Set autobuild context
    setLastAutobuildContext({
      conceptId: result.conceptId,
      conceptName: result.name,
      reasonCount: result.typedReasons?.length || 0,
      startedAt: Date.now(),
    });

    const buildResult = buildFromConcept(concept);

    if (!buildResult?.success) {
      toast.error(`Failed: ${buildResult?.failure?.message || "Unknown error"}`);
      return;
    }

    // Success toast with undo
    toast.success(`Built: ${result.name}`, {
      action: canUndo()
        ? { label: "Undo", onClick: () => undo() }
        : undefined,
    });
  };

  // Format formation name for display
  const formationName = play?.meta?.formationId
    ?.replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase()) || "Select Formation";

  return (
    <div className="w-72 bg-background border-l border-border shadow-lg overflow-y-auto flex flex-col h-full">
      {/* Header - Clean, minimal */}
      <div className="sticky top-0 bg-background border-b border-border p-3 z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white text-sm">
            Top 5 {lockedPlayType.toUpperCase()}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSuggestions}
            className="h-6 w-6 text-white/60 hover:text-white hover:bg-white/10"
          >
            ✕
          </Button>
        </div>

        {/* Context chips - Formation + Defense */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="text-xs bg-primary/10 text-primary border-primary/30"
          >
            {formationName}
          </Badge>
          {defensePreset && (
            <Badge
              variant="outline"
              className="text-xs bg-red-500/10 text-red-400 border-red-500/30"
            >
              vs {defensePreset.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Concept List - Clean, decision-focused */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {suggestions.length === 0 ? (
          <EmptyState playType={lockedPlayType} hasDefense={!!defensePresetId} />
        ) : (
          suggestions.map((result, index) => (
            <ConceptCard
              key={result.conceptId}
              result={result}
              rank={index + 1}
              onBuild={() => handleBuild(result, index)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// Empty State - Minimal guidance
// ============================================

function EmptyState({
  playType,
  hasDefense,
}: {
  playType: "run" | "pass";
  hasDefense: boolean;
}) {
  if (playType === "run" && !hasDefense) {
    return (
      <div className="text-center py-8">
        <div className="text-amber-400 font-medium mb-2 text-sm">
          Select Defense First
        </div>
        <p className="text-xs text-white/50">
          Box count required for run suggestions
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8 text-white/50 text-sm">
      No concepts available
    </div>
  );
}

// ============================================
// Concept Card - Decision-focused with clear reasoning
// Rule: Every card MUST show "why this concept" in human language
// No scores - only readable reasons
// ============================================

interface ConceptCardProps {
  result: EnhancedSuggestionResult;
  rank: number;
  onBuild: () => void;
}

function ConceptCard({ result, rank, onBuild }: ConceptCardProps) {
  const { name, conceptId, conceptType, typedReasons, fit, why } = result;

  // Build a meaningful reason from available data
  // Priority: 1) favorable typed reason, 2) fit summary, 3) why array, 4) first typed reason
  const getKeyReason = (): string => {
    // 1. Find first favorable reason with text
    const favorableReason = typedReasons?.find((r) => r.favorable);
    if (favorableReason?.text && !favorableReason.text.includes("Standard")) {
      return favorableReason.text;
    }

    // 2. Build from fit object (most contextual)
    const fitParts: string[] = [];
    if (fit?.numbers && fit.numbers.includes("favorable")) fitParts.push(fit.numbers);
    if (fit?.coverage) fitParts.push(fit.coverage);
    if (fit?.front && fit.front.includes("favorable")) fitParts.push(fit.front);
    if (fit?.structure && fit.structure.includes("optimal")) fitParts.push(fit.structure);
    if (fitParts.length > 0) {
      return fitParts[0]; // Use most relevant fit
    }

    // 3. Use why array (human-readable reasons)
    if (why && why.length > 0) {
      return why[0];
    }

    // 4. Fall back to first typed reason
    if (typedReasons?.[0]?.text) {
      return typedReasons[0].text;
    }

    // 5. Ultimate fallback
    return conceptType === "run"
      ? "Effective run concept for this formation"
      : "Effective pass concept for this formation";
  };

  const keyReason = getKeyReason();

  return (
    <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors">
      <CardContent className="p-3">
        {/* Header: Rank + Name */}
        <div className="flex items-center gap-2 mb-1">
          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
            {rank}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-white flex items-center gap-1.5">
              <span className="truncate">{name}</span>
              <ConceptPackIndicator conceptId={conceptId} showLockIcon={false} />
            </div>
          </div>
        </div>

        {/* Key reason - ALWAYS visible, more prominent */}
        <p className="text-xs text-white/80 mb-3 line-clamp-2 pl-7 leading-relaxed">
          {keyReason}
        </p>

        {/* Build button - primary action */}
        <Button
          size="sm"
          className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white"
          onClick={onBuild}
        >
          Build
        </Button>
      </CardContent>
    </Card>
  );
}
