"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  compareConcepts,
  getComparableConcepts,
  type ConceptComparison,
  type Differentiator,
} from "@/domain/engine/concept-compare";
import { PASS_CONCEPTS } from "@/domain/engine/concepts-pass";
import { RUN_CONCEPTS } from "@/domain/engine/concepts-run";
import type { Concept } from "@/domain/dsl/types";
import {
  ArrowLeftRight,
  Check,
  X,
  ChevronRight,
  Scale,
  Sparkles,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface ConceptComparePanelProps {
  initialConceptId?: string;
  onSelectConcept?: (conceptId: string) => void;
}

export function ConceptComparePanel({
  initialConceptId,
  onSelectConcept,
}: ConceptComparePanelProps) {
  const [conceptAId, setConceptAId] = useState<string | null>(initialConceptId || null);
  const [conceptBId, setConceptBId] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState<"A" | "B" | null>(null);
  const [conceptType, setConceptType] = useState<"pass" | "run">("pass");

  // Get comparison result
  const comparison = useMemo(() => {
    if (!conceptAId || !conceptBId) return null;
    return compareConcepts(conceptAId, conceptBId);
  }, [conceptAId, conceptBId]);

  // Get comparable concepts
  const comparables = useMemo(() => {
    if (!conceptAId) return [];
    return getComparableConcepts(conceptAId, 8);
  }, [conceptAId]);

  // Get all concepts for selector
  const allConcepts = useMemo(() => {
    return conceptType === "pass" ? PASS_CONCEPTS : RUN_CONCEPTS;
  }, [conceptType]);

  if (showSelector) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Select Concept {showSelector}</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowSelector(null)}>
              Cancel
            </Button>
          </div>
          {/* Type toggle */}
          <div className="flex gap-2 mt-2">
            <Button
              variant={conceptType === "pass" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setConceptType("pass")}
            >
              Pass
            </Button>
            <Button
              variant={conceptType === "run" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setConceptType("run")}
            >
              Run
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {allConcepts.map((concept) => (
            <button
              key={concept.id}
              onClick={() => {
                if (showSelector === "A") {
                  setConceptAId(concept.id);
                } else {
                  setConceptBId(concept.id);
                }
                setShowSelector(null);
              }}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-lg text-left transition-all",
                "hover:bg-primary/10 border border-transparent hover:border-primary/30",
                (showSelector === "A" ? conceptAId : conceptBId) === concept.id &&
                  "bg-primary/10 border-primary/30"
              )}
            >
              <div>
                <div className="font-medium text-sm">{concept.name}</div>
                <div className="text-xs text-muted-foreground">
                  {concept.conceptType === "pass"
                    ? concept.passHints?.category
                    : concept.runHints?.category}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Compare Concepts</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Select two concepts to compare side-by-side
          </p>
        </div>

        <div className="flex-1 p-4">
          {/* Concept A selector */}
          <div className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">CONCEPT A</div>
            <button
              onClick={() => setShowSelector("A")}
              className={cn(
                "w-full p-4 rounded-xl border-2 border-dashed transition-all",
                conceptAId
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/30 hover:border-primary"
              )}
            >
              {conceptAId ? (
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {allConcepts.find((c) => c.id === conceptAId)?.name || conceptAId}
                  </span>
                  <Badge variant="outline">Selected</Badge>
                </div>
              ) : (
                <span className="text-muted-foreground">Click to select...</span>
              )}
            </button>
          </div>

          {/* VS divider */}
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-bold text-muted-foreground">VS</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Concept B selector */}
          <div className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">CONCEPT B</div>
            <button
              onClick={() => setShowSelector("B")}
              className={cn(
                "w-full p-4 rounded-xl border-2 border-dashed transition-all",
                conceptBId
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/30 hover:border-primary"
              )}
            >
              {conceptBId ? (
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {allConcepts.find((c) => c.id === conceptBId)?.name || conceptBId}
                  </span>
                  <Badge variant="outline">Selected</Badge>
                </div>
              ) : (
                <span className="text-muted-foreground">Click to select...</span>
              )}
            </button>
          </div>

          {/* Quick suggestions */}
          {conceptAId && comparables.length > 0 && !conceptBId && (
            <div className="mt-6">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Similar concepts to compare:
              </div>
              <div className="flex flex-wrap gap-2">
                {comparables.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setConceptBId(c.id)}
                    className="px-3 py-1.5 text-sm bg-muted rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show comparison result
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Comparison</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setConceptAId(null);
              setConceptBId(null);
            }}
          >
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{comparison.conceptA.name}</span>
          <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{comparison.conceptB.name}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Recommendation */}
        <div className={cn(
          "p-4 border-b",
          comparison.recommendation.pick === "A"
            ? "bg-green-50"
            : comparison.recommendation.pick === "B"
            ? "bg-blue-50"
            : "bg-muted/30"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-semibold text-sm">Recommendation</span>
          </div>
          <p className="text-sm">{comparison.recommendation.reason}</p>
          {comparison.recommendation.pick !== "either" && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={comparison.recommendation.pick === "A" ? "default" : "secondary"}>
                {comparison.recommendation.pick === "A"
                  ? comparison.conceptA.name
                  : comparison.conceptB.name}
              </Badge>
              <span className="text-xs text-muted-foreground">recommended</span>
            </div>
          )}
        </div>

        {/* Side by side comparison */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Concept A */}
            <div className="space-y-3">
              <div className="font-semibold text-sm text-center pb-2 border-b">
                {comparison.conceptA.name}
              </div>

              <div>
                <div className="text-xs font-medium text-green-600 mb-1">Pros</div>
                <ul className="space-y-1">
                  {comparison.conceptA.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-medium text-red-600 mb-1">Cons</div>
                <ul className="space-y-1">
                  {comparison.conceptA.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <X className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-medium text-blue-600 mb-1">Best When</div>
                <div className="flex flex-wrap gap-1">
                  {comparison.conceptA.bestSituations.map((sit, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                      {sit}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Concept B */}
            <div className="space-y-3">
              <div className="font-semibold text-sm text-center pb-2 border-b">
                {comparison.conceptB.name}
              </div>

              <div>
                <div className="text-xs font-medium text-green-600 mb-1">Pros</div>
                <ul className="space-y-1">
                  {comparison.conceptB.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-medium text-red-600 mb-1">Cons</div>
                <ul className="space-y-1">
                  {comparison.conceptB.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <X className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-medium text-blue-600 mb-1">Best When</div>
                <div className="flex flex-wrap gap-1">
                  {comparison.conceptB.bestSituations.map((sit, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                      {sit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Differentiators */}
        <div className="p-4 border-t">
          <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Key Differences
          </div>
          <div className="space-y-2">
            {comparison.differentiators.map((diff, i) => (
              <DifferentiatorRow key={i} diff={diff} />
            ))}
          </div>
        </div>

        {/* Use A / Use B */}
        <div className="p-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs font-medium mb-1">Use {comparison.conceptA.name} when:</div>
              <p className="text-xs text-muted-foreground">{comparison.recommendation.whenToUseA}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs font-medium mb-1">Use {comparison.conceptB.name} when:</div>
              <p className="text-xs text-muted-foreground">{comparison.recommendation.whenToUseB}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 border-t flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onSelectConcept?.(comparison.conceptA.id)}
          >
            Use {comparison.conceptA.name}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onSelectConcept?.(comparison.conceptB.id)}
          >
            Use {comparison.conceptB.name}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Differentiator Row Component
// ============================================

interface DifferentiatorRowProps {
  diff: Differentiator;
}

function DifferentiatorRow({ diff }: DifferentiatorRowProps) {
  return (
    <div className="flex items-center text-xs">
      <div className="w-24 text-muted-foreground font-medium truncate">{diff.aspect}</div>
      <div className={cn(
        "flex-1 p-1.5 rounded-l text-center",
        diff.advantage === "A" ? "bg-green-100 text-green-700" : "bg-muted"
      )}>
        {diff.conceptA}
      </div>
      <div className={cn(
        "flex-1 p-1.5 rounded-r text-center",
        diff.advantage === "B" ? "bg-green-100 text-green-700" : "bg-muted"
      )}>
        {diff.conceptB}
      </div>
    </div>
  );
}
