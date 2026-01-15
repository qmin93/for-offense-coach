"use client";

import React, { useMemo, useState } from "react";
import { useEditorStore } from "../store";
import {
  getPassSuggestions,
  getRunSuggestions,
  SuggestionResult,
} from "@/domain/engine/suggestions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

  // Run suggestion inputs
  const [box, setBox] = useState<6 | 7 | 8>(7);
  const [front, setFront] = useState<"odd" | "even">("even");
  const [threeTech, setThreeTech] = useState<"strong" | "weak" | "none">("none");

  const suggestions = useMemo(() => {
    if (!play || !suggestionsOpen) return [];

    const structure =
      play.meta?.formationId?.includes("trips")
        ? "3x1"
        : play.meta?.formationId?.includes("bunch")
        ? "bunch"
        : play.meta?.formationId?.includes("ace")
        ? "ace"
        : play.meta?.formationId?.includes("i_")
        ? "I"
        : "2x2";

    const eligibleReceivers = play.roster.players.filter((p) =>
      ["X", "Y", "Z", "H", "RB", "FB"].includes(p.role)
    ).length;

    if (suggestionsType === "pass") {
      return getPassSuggestions({
        formationId: play.meta?.formationId || "",
        structure: structure as any,
        eligibleReceivers,
      });
    } else {
      return getRunSuggestions({
        formationId: play.meta?.formationId || "",
        structure: structure as any,
        box,
        front,
        threeTech: threeTech === "none" ? undefined : threeTech,
      });
    }
  }, [play, suggestionsOpen, suggestionsType, box, front, threeTech]);

  if (!suggestionsOpen) return null;

  const handleBuild = (result: SuggestionResult) => {
    const prevActionCount = play?.actions.length || 0;
    buildFromConcept(result.concept);

    // Show toast with undo option
    const newActionCount = useEditorStore.getState().play?.actions.length || 0;
    const actionsAdded = newActionCount - prevActionCount;

    toast.success(`Built: ${result.concept.name}`, {
      description: `${actionsAdded} actions added`,
      action: canUndo() ? {
        label: "Undo",
        onClick: () => undo(),
      } : undefined,
    });
  };

  // Group pass suggestions by category
  const groupedSuggestions = useMemo(() => {
    if (suggestionsType === "run") return null;

    const groups: Record<string, SuggestionResult[]> = {};
    suggestions.forEach((s) => {
      const cat = s.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return groups;
  }, [suggestions, suggestionsType]);

  return (
    <div className="w-80 bg-background border-l shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
        <h3 className="font-semibold text-foreground">
          {suggestionsType === "pass" ? "Pass" : "Run"} Concepts
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

      {/* Run inputs */}
      {suggestionsType === "run" && (
        <Card className="m-4 mb-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Defense Input
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Box</label>
                <select
                  value={box}
                  onChange={(e) => setBox(Number(e.target.value) as 6 | 7 | 8)}
                  className="w-full mt-1 p-1.5 text-sm border rounded-md bg-background"
                >
                  <option value={6}>6</option>
                  <option value={7}>7</option>
                  <option value={8}>8</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Front</label>
                <select
                  value={front}
                  onChange={(e) => setFront(e.target.value as "odd" | "even")}
                  className="w-full mt-1 p-1.5 text-sm border rounded-md bg-background"
                >
                  <option value="odd">Odd</option>
                  <option value="even">Even</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">3-Tech</label>
                <select
                  value={threeTech}
                  onChange={(e) =>
                    setThreeTech(e.target.value as "strong" | "weak" | "none")
                  }
                  className="w-full mt-1 p-1.5 text-sm border rounded-md bg-background"
                >
                  <option value="none">None</option>
                  <option value="strong">Strong</option>
                  <option value="weak">Weak</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pass suggestions grouped */}
      {suggestionsType === "pass" && groupedSuggestions && (
        <div className="p-4 space-y-4">
          {["quick", "intermediate", "deep", "screen"].map((category) => {
            const items = groupedSuggestions[category];
            if (!items || items.length === 0) return null;

            return (
              <div key={category}>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  {category}
                </div>
                <div className="space-y-2">
                  {items.map((result) => (
                    <ConceptCard
                      key={result.concept.id}
                      result={result}
                      onBuild={() => handleBuild(result)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Run suggestions (top 5) */}
      {suggestionsType === "run" && (
        <div className="p-4 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Top 5 Run Concepts
          </div>
          {suggestions.map((result, i) => (
            <ConceptCard
              key={result.concept.id}
              result={result}
              rank={i + 1}
              onBuild={() => handleBuild(result)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Concept Card Component
// ============================================

interface ConceptCardProps {
  result: SuggestionResult;
  rank?: number;
  onBuild: () => void;
}

function ConceptCard({ result, rank, onBuild }: ConceptCardProps) {
  const { concept, score, reasons } = result;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {rank && (
              <Badge variant="secondary" className="h-5 w-5 p-0 justify-center">
                {rank}
              </Badge>
            )}
            <div>
              <div className="font-medium text-sm">{concept.name}</div>
              <div className="text-xs text-muted-foreground">{concept.summary}</div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {score}
          </Badge>
        </div>

        {/* Reasons */}
        <div className="text-xs text-muted-foreground space-y-0.5 mb-2">
          {reasons.map((reason, i) => (
            <div key={i}>• {reason}</div>
          ))}
        </div>

        {/* Badges */}
        {concept.badges && concept.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {concept.badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        )}

        {/* Build button */}
        <Button size="sm" className="w-full" onClick={onBuild}>
          Auto-build
        </Button>
      </CardContent>
    </Card>
  );
}
