"use client";

// ============================================
// HardOnboardingModal
// 첫 진입 시 강제 컨셉 선택 게이트
// 3개 옵션만 제공 (자유도는 독!)
// ============================================

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { telemetry, startTimer, endTimer } from "@/lib/telemetry";
import {
  Zap,
  TrendingUp,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// ============================================
// Constants
// ============================================

const HARD_ONBOARDING_KEY = "foroffense_hard_onboarding_v1";

export interface OnboardingConcept {
  id: string;
  name: string;
  type: "pass" | "run";
  description: string;
  icon: React.ReactNode;
  tags: string[];
  formation: string;
}

const ONBOARDING_CONCEPTS: OnboardingConcept[] = [
  {
    id: "concept_run_power",
    name: "Power",
    type: "run",
    description: "Classic gap scheme. Guard pulls, FB kicks, RB follows.",
    icon: <TrendingUp className="w-8 h-8" />,
    tags: ["Gap Scheme", "Physical", "Pro Style"],
    formation: "i_form",
  },
  {
    id: "concept_pass_flood",
    name: "Flood",
    type: "pass",
    description: "3-level stretch vs zone. Go-Out-Flat combination.",
    icon: <Zap className="w-8 h-8" />,
    tags: ["Zone Beater", "3x1", "Trips"],
    formation: "trips_right",
  },
  {
    id: "concept_pass_stick",
    name: "Stick",
    type: "pass",
    description: "Quick game classic. Hitch + Flat = flat defender stress.",
    icon: <Target className="w-8 h-8" />,
    tags: ["Quick Game", "Safe", "High %"],
    formation: "spread",
  },
];

// ============================================
// State Management
// ============================================

interface HardOnboardingState {
  completed: boolean;
  completedAt: string | null;
  selectedConceptId: string | null;
  startedAt: string | null;
}

const DEFAULT_STATE: HardOnboardingState = {
  completed: false,
  completedAt: null,
  selectedConceptId: null,
  startedAt: null,
};

function getHardOnboardingState(): HardOnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const stored = localStorage.getItem(HARD_ONBOARDING_KEY);
    if (stored) {
      return { ...DEFAULT_STATE, ...JSON.parse(stored) };
    }
  } catch {
    console.warn("Failed to read hard onboarding state");
  }
  return DEFAULT_STATE;
}

function saveHardOnboardingState(state: Partial<HardOnboardingState>): void {
  if (typeof window === "undefined") return;

  try {
    const current = getHardOnboardingState();
    const updated = { ...current, ...state };
    localStorage.setItem(HARD_ONBOARDING_KEY, JSON.stringify(updated));
  } catch {
    console.warn("Failed to save hard onboarding state");
  }
}

export function shouldShowHardOnboarding(): boolean {
  const state = getHardOnboardingState();
  return !state.completed;
}

export function completeHardOnboarding(conceptId: string): void {
  saveHardOnboardingState({
    completed: true,
    completedAt: new Date().toISOString(),
    selectedConceptId: conceptId,
  });
}

export function resetHardOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HARD_ONBOARDING_KEY);
}

// ============================================
// Concept Card Component
// ============================================

interface ConceptCardProps {
  concept: OnboardingConcept;
  isSelected: boolean;
  onSelect: () => void;
}

function ConceptCard({ concept, isSelected, onSelect }: ConceptCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 transition-all duration-200",
        "text-left hover:scale-[1.02] active:scale-[0.98]",
        isSelected
          ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30"
          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
      )}
    >
      {/* Type badge */}
      <div
        className={cn(
          "absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium",
          concept.type === "run"
            ? "bg-green-500/20 text-green-400"
            : "bg-blue-500/20 text-blue-400"
        )}
      >
        {concept.type === "run" ? "RUN" : "PASS"}
      </div>

      {/* Icon and Name */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className={cn(
            "p-2 rounded-lg",
            isSelected ? "bg-blue-500/20 text-blue-400" : "bg-slate-700/50 text-slate-400"
          )}
        >
          {concept.icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{concept.name}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-3">{concept.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {concept.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs bg-slate-700/50 text-slate-400 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
}

// ============================================
// Main Component
// ============================================

interface HardOnboardingModalProps {
  onSelect: (concept: OnboardingConcept) => void;
  onSkip?: () => void;
}

export function HardOnboardingModal({ onSelect, onSkip }: HardOnboardingModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if should show on mount
  useEffect(() => {
    const shouldShow = shouldShowHardOnboarding();
    setIsVisible(shouldShow);

    if (shouldShow) {
      // Start timing for telemetry
      startTimer("hard_onboarding");
      saveHardOnboardingState({
        startedAt: new Date().toISOString(),
      });
    }
  }, []);

  const selectedConcept = useMemo(() => {
    if (!selectedId) return null;
    return ONBOARDING_CONCEPTS.find((c) => c.id === selectedId) || null;
  }, [selectedId]);

  const handleSelect = useCallback((concept: OnboardingConcept) => {
    setSelectedId(concept.id);
  }, []);

  const handleContinue = useCallback(async () => {
    if (!selectedConcept || isLoading) return;

    setIsLoading(true);

    // Track telemetry
    const timeMs = endTimer("hard_onboarding");
    telemetry.onboardingCompleted({
      timeToCompleteMs: timeMs,
      stepsCompleted: 1,
      selectedConcept: selectedConcept.id,
    });

    telemetry.conceptClicked({
      conceptId: selectedConcept.id,
      conceptName: selectedConcept.name,
      conceptType: selectedConcept.type,
      source: "onboarding",
      position: ONBOARDING_CONCEPTS.findIndex((c) => c.id === selectedConcept.id),
    });

    // Mark as completed
    completeHardOnboarding(selectedConcept.id);

    // Notify parent
    onSelect(selectedConcept);

    setIsVisible(false);
    setIsLoading(false);
  }, [selectedConcept, isLoading, onSelect]);

  const handleSkip = useCallback(() => {
    // Track skip
    const timeMs = endTimer("hard_onboarding");
    telemetry.onboardingSkipped({
      stepIndex: 0,
      timeSpentMs: timeMs,
    });

    // Mark as completed (skipped)
    completeHardOnboarding("skipped");
    setIsVisible(false);
    onSkip?.();
  }, [onSkip]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">
            Let's build your first play
          </h1>
          <p className="text-slate-400 mt-1">
            Pick a concept to start. We'll set everything up automatically.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Concept selection */}
          <div className="space-y-3">
            {ONBOARDING_CONCEPTS.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                isSelected={selectedId === concept.id}
                onSelect={() => handleSelect(concept)}
              />
            ))}
          </div>

          {/* What happens next */}
          {selectedConcept && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                <span className="font-medium">What happens next:</span> We'll load{" "}
                <span className="text-white font-medium">
                  {selectedConcept.name}
                </span>{" "}
                on a{" "}
                <span className="text-white">
                  {selectedConcept.formation.replace(/_/g, " ")}
                </span>{" "}
                formation. You can edit everything after!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            Skip and start blank
          </button>

          <Button
            onClick={handleContinue}
            disabled={!selectedConcept || isLoading}
            className={cn(
              "min-w-[140px]",
              selectedConcept
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-slate-700 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                Build {selectedConcept?.name || "Play"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Progress hint */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-1 rounded-full bg-blue-500" />
            <div className="w-8 h-1 rounded-full bg-slate-700" />
            <div className="w-8 h-1 rounded-full bg-slate-700" />
          </div>
          <p className="text-[10px] text-slate-500 text-right mt-1">Step 1 of 3</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Export Concepts for use elsewhere
// ============================================

export { ONBOARDING_CONCEPTS };

export default HardOnboardingModal;
