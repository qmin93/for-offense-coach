"use client";

import React, { useState, useMemo } from "react";
import { useEditorStore } from "../store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PASS_CONCEPTS } from "@/domain/engine/concepts-pass";
import { RUN_CONCEPTS } from "@/domain/engine/concepts-run";
import type { Concept, ConceptCategory } from "@/domain/dsl/types";

// ============================================
// Concept Library Component
// Pass/Run 필터 + 카테고리 그룹 + 카드 UI
// ============================================

interface ConceptCardProps {
  concept: Concept;
  onBuild: (concept: Concept) => void;
}

function ConceptCard({ concept, onBuild }: ConceptCardProps) {
  const category = concept.passHints?.category || concept.runHints?.category || "other";

  // Category colors
  const categoryColors: Record<string, string> = {
    quick: "bg-green-100 text-green-700 border-green-200",
    intermediate: "bg-blue-100 text-blue-700 border-blue-200",
    deep: "bg-purple-100 text-purple-700 border-purple-200",
    screen: "bg-amber-100 text-amber-700 border-amber-200",
    zone: "bg-emerald-100 text-emerald-700 border-emerald-200",
    gap: "bg-orange-100 text-orange-700 border-orange-200",
    perimeter: "bg-cyan-100 text-cyan-700 border-cyan-200",
  };

  const categoryColor = categoryColors[category] || "bg-gray-100 text-gray-700 border-gray-200";

  // Check if concept has installFocus
  const hasInstallFocus = concept.installFocus && concept.installFocus.failurePoints.length > 0;

  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex-1">
            <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
              {concept.name}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-1">
              {concept.summary}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryColor}`}>
            {category}
          </Badge>
          {concept.badges?.includes("nfl_style") && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              NFL
            </Badge>
          )}
          {hasInstallFocus && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200">
              📋 {concept.installFocus!.failurePoints.length}
            </Badge>
          )}
        </div>

        {/* Build button */}
        <Button
          size="sm"
          className="w-full h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onBuild(concept);
          }}
        >
          Build
        </Button>
      </CardContent>
    </Card>
  );
}

// Category grouping
const PASS_CATEGORIES: { key: ConceptCategory; label: string }[] = [
  { key: "quick", label: "Quick Game" },
  { key: "intermediate", label: "Intermediate" },
  { key: "deep", label: "Deep" },
  { key: "screen", label: "Screens" },
];

const RUN_CATEGORIES: { key: ConceptCategory; label: string }[] = [
  { key: "zone", label: "Zone" },
  { key: "gap", label: "Gap/Power" },
  { key: "perimeter", label: "Perimeter" },
];

export function ConceptLibrary() {
  const { buildFromConcept, canUndo, undo, play } = useEditorStore();
  const [activeTab, setActiveTab] = useState<"pass" | "run">("pass");

  // Group concepts by category
  const passConceptsByCategory = useMemo(() => {
    const grouped: Record<string, Concept[]> = {};
    for (const cat of PASS_CATEGORIES) {
      grouped[cat.key] = PASS_CONCEPTS.filter(
        (c) => c.passHints?.category === cat.key
      );
    }
    return grouped;
  }, []);

  const runConceptsByCategory = useMemo(() => {
    const grouped: Record<string, Concept[]> = {};
    for (const cat of RUN_CATEGORIES) {
      grouped[cat.key] = RUN_CONCEPTS.filter(
        (c) => c.runHints?.category === cat.key
      );
    }
    return grouped;
  }, []);

  const handleBuild = (concept: Concept) => {
    const prevActionCount = play?.actions.length || 0;
    buildFromConcept(concept);

    const newActionCount = useEditorStore.getState().play?.actions.length || 0;
    const actionsAdded = newActionCount - prevActionCount;

    toast.success(`Built: ${concept.name}`, {
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm text-foreground">Concept Library</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Select a concept to auto-build
        </p>
      </div>

      {/* Pass/Run Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "pass" | "run")}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-3 mt-2 grid grid-cols-2">
          <TabsTrigger value="pass" className="text-xs">
            Pass ({PASS_CONCEPTS.length})
          </TabsTrigger>
          <TabsTrigger value="run" className="text-xs">
            Run ({RUN_CONCEPTS.length})
          </TabsTrigger>
        </TabsList>

        {/* Pass Concepts */}
        <TabsContent value="pass" className="flex-1 overflow-y-auto p-3 space-y-4 mt-0">
          {PASS_CATEGORIES.map((cat) => {
            const concepts = passConceptsByCategory[cat.key] || [];
            if (concepts.length === 0) return null;

            return (
              <div key={cat.key}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {cat.label}
                  </h4>
                  <Badge variant="secondary" className="text-[10px] px-1">
                    {concepts.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {concepts.map((concept) => (
                    <ConceptCard
                      key={concept.id}
                      concept={concept}
                      onBuild={handleBuild}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* Run Concepts */}
        <TabsContent value="run" className="flex-1 overflow-y-auto p-3 space-y-4 mt-0">
          {RUN_CATEGORIES.map((cat) => {
            const concepts = runConceptsByCategory[cat.key] || [];
            if (concepts.length === 0) return null;

            return (
              <div key={cat.key}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {cat.label}
                  </h4>
                  <Badge variant="secondary" className="text-[10px] px-1">
                    {concepts.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {concepts.map((concept) => (
                    <ConceptCard
                      key={concept.id}
                      concept={concept}
                      onBuild={handleBuild}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
