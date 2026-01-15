"use client";

import React, { useState } from "react";
import {
  EXAMPLE_CONCEPTS,
  DRILLS,
  type ExampleConcept,
  type Drill,
} from "@/domain/data/example-playbook";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ExamplesPanelProps {
  onSelectConcept?: (concept: ExampleConcept) => void;
}

export function ExamplesPanel({ onSelectConcept }: ExamplesPanelProps) {
  const [selectedType, setSelectedType] = useState<"run" | "pass" | "rpo">("run");
  const [expandedDrill, setExpandedDrill] = useState<string | null>(null);

  const filteredConcepts = EXAMPLE_CONCEPTS.filter((c) => c.type === selectedType);

  return (
    <div className="w-80 bg-background border-l shadow-lg overflow-y-auto flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-3 z-10">
        <h3 className="font-semibold text-foreground text-sm">Examples & Drills</h3>
      </div>

      <Tabs defaultValue="concepts" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0 flex-shrink-0">
          <TabsTrigger
            value="concepts"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 text-xs"
          >
            Concepts (30)
          </TabsTrigger>
          <TabsTrigger
            value="drills"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 text-xs"
          >
            Drills (10)
          </TabsTrigger>
        </TabsList>

        {/* Concepts Tab */}
        <TabsContent value="concepts" className="flex-1 overflow-y-auto mt-0">
          {/* Type filter */}
          <div className="p-3 border-b">
            <div className="flex gap-2">
              {(["run", "pass", "rpo"] as const).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedType(type)}
                >
                  {type.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Concept cards */}
          <div className="p-3 space-y-2">
            {filteredConcepts.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                onClick={() => onSelectConcept?.(concept)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Drills Tab */}
        <TabsContent value="drills" className="flex-1 overflow-y-auto mt-0">
          <div className="p-3 space-y-2">
            {DRILLS.map((drill) => (
              <DrillCard
                key={drill.id}
                drill={drill}
                isExpanded={expandedDrill === drill.id}
                onToggle={() =>
                  setExpandedDrill(expandedDrill === drill.id ? null : drill.id)
                }
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// Concept Card Component
// ============================================

interface ConceptCardProps {
  concept: ExampleConcept;
  onClick?: () => void;
}

function ConceptCard({ concept, onClick }: ConceptCardProps) {
  const typeColors = {
    run: "bg-green-500",
    pass: "bg-blue-500",
    rpo: "bg-purple-500",
  };

  return (
    <Card
      className="hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium text-sm">{concept.name}</div>
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              typeColors[concept.type]
            )}
          />
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {concept.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {concept.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Drill Card Component
// ============================================

interface DrillCardProps {
  drill: Drill;
  isExpanded: boolean;
  onToggle: () => void;
}

function DrillCard({ drill, isExpanded, onToggle }: DrillCardProps) {
  const phaseColors = {
    individual: "bg-yellow-500",
    group: "bg-orange-500",
    team: "bg-red-500",
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <button
          className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-sm">{drill.name}</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {drill.duration}
              </Badge>
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  phaseColors[drill.phase]
                )}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{drill.purpose}</p>
        </button>

        {isExpanded && (
          <div className="px-3 pb-3 border-t bg-muted/30">
            <div className="pt-2">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Focus Areas:
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {drill.focus.map((f) => (
                  <Badge key={f} variant="secondary" className="text-xs">
                    {f}
                  </Badge>
                ))}
              </div>

              <div className="text-xs font-medium text-muted-foreground mb-1">
                Steps:
              </div>
              <ol className="text-xs text-muted-foreground space-y-1">
                {drill.steps.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
