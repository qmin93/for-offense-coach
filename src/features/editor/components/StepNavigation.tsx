"use client";

import React from "react";
import { useEditorStore } from "../store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DEFENSE_PRESETS } from "@/domain/engine/defense-presets";

// ============================================
// Step Definitions
// ============================================

export type WorkflowStep = "formation" | "defense" | "concept" | "draw";

const STEPS: { id: WorkflowStep; label: string; shortLabel: string }[] = [
  { id: "formation", label: "Formation", shortLabel: "1" },
  { id: "defense", label: "Defense", shortLabel: "2" },
  { id: "concept", label: "Concept", shortLabel: "3" },
  { id: "draw", label: "Draw", shortLabel: "4" },
];

// ============================================
// Step Navigation Component
// ============================================

interface StepNavigationProps {
  currentStep: WorkflowStep;
  onStepChange: (step: WorkflowStep) => void;
}

export function StepNavigation({
  currentStep,
  onStepChange,
}: StepNavigationProps) {
  const { play, defensePresetId } = useEditorStore();

  // Calculate step completion status
  const hasFormation = !!(play && play.roster.players.length > 0);
  const hasDefense = !!defensePresetId;
  const hasConcept = !!(play && play.actions.length > 0);

  const stepStatus: Record<WorkflowStep, "complete" | "current" | "pending"> = {
    formation: hasFormation ? "complete" : currentStep === "formation" ? "current" : "pending",
    defense: hasDefense ? "complete" : currentStep === "defense" ? "current" : "pending",
    concept: hasConcept ? "complete" : currentStep === "concept" ? "current" : "pending",
    draw: currentStep === "draw" ? "current" : "pending",
  };

  // Step is clickable if previous steps are complete or it's the current step
  const canNavigateTo = (step: WorkflowStep): boolean => {
    if (step === "formation") return true;
    if (step === "defense") return hasFormation;
    if (step === "concept") return hasFormation && hasDefense;
    if (step === "draw") return hasFormation;
    return false;
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
      {STEPS.map((step, index) => {
        const status = stepStatus[step.id];
        const isActive = currentStep === step.id;
        const canClick = canNavigateTo(step.id);

        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <div
                className={cn(
                  "w-4 h-px",
                  status === "complete" || STEPS.findIndex((s) => s.id === currentStep) > index
                    ? "bg-primary"
                    : "bg-border"
                )}
              />
            )}
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => canClick && onStepChange(step.id)}
              disabled={!canClick}
              className={cn(
                "h-7 px-2 text-xs gap-1.5",
                isActive && "bg-primary/10 text-primary border border-primary/20",
                status === "complete" && !isActive && "text-primary"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold",
                  status === "complete" && "bg-primary text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground",
                  status === "pending" && "bg-muted-foreground/20 text-muted-foreground"
                )}
              >
                {status === "complete" ? "✓" : step.shortLabel}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </Button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================
// Quick Defense Picker (for step 2)
// ============================================

interface QuickDefensePickerProps {
  selectedPresetId: string | null;
  onSelect: (presetId: string) => void;
}

export function QuickDefensePicker({
  selectedPresetId,
  onSelect,
}: QuickDefensePickerProps) {
  // Show only top 5 defense presets (front-based)
  const topPresets = DEFENSE_PRESETS.slice(0, 5);

  return (
    <div className="flex flex-wrap gap-1">
      {topPresets.map((preset) => (
        <Button
          key={preset.id}
          variant={selectedPresetId === preset.id ? "secondary" : "outline"}
          size="sm"
          onClick={() => onSelect(preset.id)}
          className={cn(
            "h-7 text-xs",
            selectedPresetId === preset.id && "bg-red-100 text-red-700 border-red-300"
          )}
        >
          {preset.name}
          <Badge variant="outline" className="ml-1 text-[9px] px-1">
            {preset.boxCount}
          </Badge>
        </Button>
      ))}
    </div>
  );
}

// ============================================
// Quick Concept Picker (for step 3)
// ============================================

interface QuickConceptPickerProps {
  suggestions: Array<{
    conceptId: string;
    name: string;
    score: number;
    conceptType: "run" | "pass";
  }>;
  onSelect: (conceptId: string) => void;
}

export function QuickConceptPicker({
  suggestions,
  onSelect,
}: QuickConceptPickerProps) {
  // Show only top 5
  const topSuggestions = suggestions.slice(0, 5);

  if (topSuggestions.length === 0) {
    return (
      <div className="text-xs text-muted-foreground py-2">
        Select a defense first to see concept suggestions
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {topSuggestions.map((suggestion, index) => (
        <Button
          key={suggestion.conceptId}
          variant="ghost"
          size="sm"
          onClick={() => onSelect(suggestion.conceptId)}
          className="w-full justify-between h-8 text-xs hover:bg-primary/5"
        >
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="h-5 w-5 p-0 justify-center text-[10px]"
            >
              {index + 1}
            </Badge>
            <span className="font-medium">{suggestion.name}</span>
            <Badge variant="outline" className="text-[9px]">
              {suggestion.conceptType}
            </Badge>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold",
              suggestion.score >= 80
                ? "text-green-600 border-green-300"
                : suggestion.score >= 60
                ? "text-amber-600 border-amber-300"
                : "text-muted-foreground"
            )}
          >
            {suggestion.score}
          </Badge>
        </Button>
      ))}
    </div>
  );
}

// ============================================
// Compact Step Panel
// ============================================

interface CompactStepPanelProps {
  currentStep: WorkflowStep;
  onStepChange: (step: WorkflowStep) => void;
}

export function CompactStepPanel({
  currentStep,
  onStepChange,
}: CompactStepPanelProps) {
  const {
    play,
    defensePresetId,
    applyDefensePreset,
    buildFromConcept,
    toggleSuggestions,
    setMode,
  } = useEditorStore();

  const handleDefenseSelect = (presetId: string) => {
    applyDefensePreset(presetId);
    // Auto-advance to next step
    onStepChange("concept");
  };

  const handleConceptSelect = () => {
    // Open suggestions panel using context playType
    toggleSuggestions();
  };

  return (
    <div className="border rounded-lg p-2 bg-background shadow-sm">
      {/* Step Navigation */}
      <StepNavigation currentStep={currentStep} onStepChange={onStepChange} />

      {/* Step Content */}
      <div className="mt-2">
        {currentStep === "formation" && (
          <div className="text-xs text-muted-foreground">
            Select a formation from the left panel to begin.
          </div>
        )}

        {currentStep === "defense" && (
          <div className="space-y-2">
            <div className="text-xs font-medium">Quick Defense Pick:</div>
            <QuickDefensePicker
              selectedPresetId={defensePresetId}
              onSelect={handleDefenseSelect}
            />
          </div>
        )}

        {currentStep === "concept" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Choose Concept:</span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => toggleSuggestions("run")}
                >
                  Run
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => toggleSuggestions("pass")}
                >
                  Pass
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Click Run or Pass to see Top 5 recommendations
            </div>
          </div>
        )}

        {currentStep === "draw" && (
          <div className="space-y-2">
            <div className="text-xs font-medium">Drawing Mode:</div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs flex-1"
                onClick={() => setMode("route")}
              >
                Route
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs flex-1"
                onClick={() => setMode("block")}
              >
                Block
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs flex-1"
                onClick={() => setMode("motion")}
              >
                Motion
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
