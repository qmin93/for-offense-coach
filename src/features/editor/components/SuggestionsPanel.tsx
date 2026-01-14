"use client";

import React, { useMemo, useState } from "react";
import { useEditorStore } from "../store";
import {
  getPassSuggestions,
  getRunSuggestions,
  SuggestionResult,
} from "@/domain/engine/suggestions";
import { Button } from "@/components/ui";

export function SuggestionsPanel() {
  const {
    play,
    suggestionsOpen,
    suggestionsType,
    closeSuggestions,
    buildFromConcept,
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
    buildFromConcept(result.concept);
    // Show undo toast would go here
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
    <div className="w-80 bg-white border-l shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
        <h3 className="font-semibold">
          {suggestionsType === "pass" ? "Pass" : "Run"} Suggestions
        </h3>
        <button
          onClick={closeSuggestions}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Run inputs */}
      {suggestionsType === "run" && (
        <div className="p-4 border-b bg-gray-50">
          <div className="text-xs font-medium text-gray-500 mb-2">
            Defense Input (Required)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">Box</label>
              <select
                value={box}
                onChange={(e) => setBox(Number(e.target.value) as 6 | 7 | 8)}
                className="w-full mt-1 p-1.5 text-sm border rounded"
              >
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Front</label>
              <select
                value={front}
                onChange={(e) => setFront(e.target.value as "odd" | "even")}
                className="w-full mt-1 p-1.5 text-sm border rounded"
              >
                <option value="odd">Odd</option>
                <option value="even">Even</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-600">3-Tech</label>
              <select
                value={threeTech}
                onChange={(e) =>
                  setThreeTech(e.target.value as "strong" | "weak" | "none")
                }
                className="w-full mt-1 p-1.5 text-sm border rounded"
              >
                <option value="none">None</option>
                <option value="strong">Strong</option>
                <option value="weak">Weak</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Pass suggestions grouped */}
      {suggestionsType === "pass" && groupedSuggestions && (
        <div className="p-4 space-y-4">
          {["quick", "intermediate", "deep", "screen"].map((category) => {
            const items = groupedSuggestions[category];
            if (!items || items.length === 0) return null;

            return (
              <div key={category}>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
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
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
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
    <div className="p-3 border rounded-lg hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {rank && (
            <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded text-xs font-bold flex items-center justify-center">
              {rank}
            </span>
          )}
          <div>
            <div className="font-medium text-sm">{concept.name}</div>
            <div className="text-xs text-gray-500">{concept.summary}</div>
          </div>
        </div>
        <div className="text-xs font-medium text-gray-400">{score}</div>
      </div>

      {/* Reasons */}
      <div className="text-xs text-gray-600 space-y-0.5 mb-2">
        {reasons.map((reason, i) => (
          <div key={i}>• {reason}</div>
        ))}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-2">
        {concept.badges?.map((badge) => (
          <span
            key={badge}
            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
          >
            {badge}
          </span>
        ))}
      </div>

      {/* Build button */}
      <Button variant="primary" size="sm" className="w-full" onClick={onBuild}>
        Auto-build
      </Button>
    </div>
  );
}
