"use client";

// ============================================
// HardOnboardingModal - QuickStart Wizard
// 3-Step guided onboarding flow
// Step 1: Choose concept
// Step 2: Formation & defense setup
// Step 3: Success + guidance
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
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Shield,
  LayoutGrid,
  Play,
  BookOpen,
  MousePointerClick,
  Settings,
} from "lucide-react";

// ============================================
// Constants
// ============================================

const HARD_ONBOARDING_KEY = "foroffense_hard_onboarding_v2";

export interface OnboardingConcept {
  id: string;
  name: string;
  type: "pass" | "run";
  description: string;
  icon: React.ReactNode;
  tags: string[];
  formation: string;
  formationName: string;
}

export const ONBOARDING_CONCEPTS: OnboardingConcept[] = [
  {
    id: "concept_run_power",
    name: "Power",
    type: "run",
    description: "Classic gap scheme. Guard pulls, FB kicks, RB follows.",
    icon: <TrendingUp className="w-8 h-8" />,
    tags: ["Gap Scheme", "Physical", "Pro Style"],
    formation: "i_form",
    formationName: "I-Formation",
  },
  {
    id: "concept_pass_flood",
    name: "Flood",
    type: "pass",
    description: "3-level stretch vs zone. Go-Out-Flat combination.",
    icon: <Zap className="w-8 h-8" />,
    tags: ["Zone Beater", "3x1", "Trips"],
    formation: "trips_right",
    formationName: "Trips Right",
  },
  {
    id: "concept_pass_stick",
    name: "Stick",
    type: "pass",
    description: "Quick game classic. Hitch + Flat = flat defender stress.",
    icon: <Target className="w-8 h-8" />,
    tags: ["Quick Game", "Safe", "High %"],
    formation: "spread",
    formationName: "Spread",
  },
];

// Formation options for Step 2
interface FormationOption {
  id: string;
  name: string;
  structure: string;
  description: string;
}

const FORMATION_OPTIONS: FormationOption[] = [
  { id: "spread", name: "Spread", structure: "2x2", description: "4 WR spread look" },
  { id: "trips_right", name: "Trips Right", structure: "3x1", description: "3 receivers to one side" },
  { id: "ace", name: "Ace", structure: "1x2x1", description: "Balanced 2 TE set" },
  { id: "i_form", name: "I-Formation", structure: "I", description: "Traditional pro set" },
];

// Defense presets for Step 2
interface DefenseOption {
  id: string;
  name: string;
  description: string;
}

const DEFENSE_OPTIONS: DefenseOption[] = [
  { id: "none", name: "No Defense", description: "Focus on your play only" },
  { id: "even_4_3", name: "Even 4-3", description: "Standard 4 down front" },
  { id: "odd_3_4", name: "Odd 3-4", description: "3 down with 4 LBs" },
  { id: "nickel", name: "Nickel", description: "5 DBs for passing situations" },
];

// ============================================
// State Management
// ============================================

interface HardOnboardingState {
  completed: boolean;
  completedAt: string | null;
  selectedConceptId: string | null;
  selectedFormationId: string | null;
  selectedDefenseId: string | null;
  startedAt: string | null;
  lastStep: number;
}

const DEFAULT_STATE: HardOnboardingState = {
  completed: false,
  completedAt: null,
  selectedConceptId: null,
  selectedFormationId: null,
  selectedDefenseId: null,
  startedAt: null,
  lastStep: 0,
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
// Step Components
// ============================================

// Step 1: Choose Concept
interface Step1Props {
  selectedId: string | null;
  onSelect: (concept: OnboardingConcept) => void;
}

function Step1ConceptSelect({ selectedId, onSelect }: Step1Props) {
  return (
    <div className="p-6">
      <div className="space-y-3">
        {ONBOARDING_CONCEPTS.map((concept) => (
          <button
            key={concept.id}
            onClick={() => onSelect(concept)}
            className={cn(
              "relative w-full p-4 rounded-xl border-2 transition-all duration-200",
              "text-left hover:scale-[1.02] active:scale-[0.98]",
              selectedId === concept.id
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
                  selectedId === concept.id
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-slate-700/50 text-slate-400"
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
            {selectedId === concept.id && (
              <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2: Formation & Defense Setup
interface Step2Props {
  selectedConcept: OnboardingConcept | null;
  selectedFormationId: string | null;
  selectedDefenseId: string | null;
  onFormationSelect: (id: string) => void;
  onDefenseSelect: (id: string) => void;
}

function Step2Setup({
  selectedConcept,
  selectedFormationId,
  selectedDefenseId,
  onFormationSelect,
  onDefenseSelect,
}: Step2Props) {
  return (
    <div className="p-6 space-y-6">
      {/* Formation Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid className="w-4 h-4 text-blue-400" />
          <h4 className="font-medium text-white">Formation</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FORMATION_OPTIONS.map((formation) => (
            <button
              key={formation.id}
              onClick={() => onFormationSelect(formation.id)}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                selectedFormationId === formation.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
              )}
            >
              <div className="font-medium text-sm text-white">{formation.name}</div>
              <div className="text-xs text-slate-500">{formation.description}</div>
              {selectedConcept?.formation === formation.id && (
                <div className="mt-1 text-[10px] text-blue-400">Recommended</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Defense Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-red-400" />
          <h4 className="font-medium text-white">Show Defense?</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEFENSE_OPTIONS.map((defense) => (
            <button
              key={defense.id}
              onClick={() => onDefenseSelect(defense.id)}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                selectedDefenseId === defense.id
                  ? "border-red-500 bg-red-500/10"
                  : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
              )}
            >
              <div className="font-medium text-sm text-white">{defense.name}</div>
              <div className="text-xs text-slate-500">{defense.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick tip */}
      <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
        <p className="text-xs text-slate-400">
          💡 <span className="text-slate-300">Tip:</span> You can always change these later.
          The editor has full control over formations and defenses.
        </p>
      </div>
    </div>
  );
}

// Step 3: Success & Guidance
interface Step3Props {
  selectedConcept: OnboardingConcept | null;
}

function Step3Success({ selectedConcept }: Step3Props) {
  return (
    <div className="p-6 text-center">
      {/* Success Animation */}
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">You're all set!</h3>
      <p className="text-slate-400 mb-6">
        Your <span className="text-blue-400 font-medium">{selectedConcept?.name}</span> play
        is ready for editing
      </p>

      {/* Quick guides */}
      <div className="space-y-3 text-left mb-6">
        <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <MousePointerClick className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm text-white">Click players</div>
            <div className="text-xs text-slate-500">to draw routes and blocks</div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <Settings className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm text-white">Use the toolbar</div>
            <div className="text-xs text-slate-500">for routes, blocks, motion, and more</div>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <BookOpen className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm text-white">Check Concepts panel</div>
            <div className="text-xs text-slate-500">for suggested plays and variations</div>
          </div>
        </div>
      </div>

      {/* Encouragement */}
      <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/20">
        <p className="text-sm text-slate-300">
          🎯 <span className="font-medium text-white">Goal:</span> Draw your play and hit Save.
          Your first play will be added to your playbook!
        </p>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

interface HardOnboardingModalProps {
  onSelect: (concept: OnboardingConcept, formationId?: string, defenseId?: string) => void;
  onSkip?: () => void;
}

export function HardOnboardingModal({ onSelect, onSkip }: HardOnboardingModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [selectedFormationId, setSelectedFormationId] = useState<string | null>(null);
  const [selectedDefenseId, setSelectedDefenseId] = useState<string | null>("none");
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
    if (!selectedConceptId) return null;
    return ONBOARDING_CONCEPTS.find((c) => c.id === selectedConceptId) || null;
  }, [selectedConceptId]);

  // Auto-select formation based on concept
  useEffect(() => {
    if (selectedConcept && !selectedFormationId) {
      setSelectedFormationId(selectedConcept.formation);
    }
  }, [selectedConcept, selectedFormationId]);

  const handleConceptSelect = useCallback((concept: OnboardingConcept) => {
    setSelectedConceptId(concept.id);
    setSelectedFormationId(concept.formation);
  }, []);

  const handleNext = useCallback(() => {
    if (step === 1 && selectedConcept) {
      setStep(2);
      saveHardOnboardingState({ lastStep: 2 });
    } else if (step === 2) {
      setStep(3);
      saveHardOnboardingState({ lastStep: 3 });
    }
  }, [step, selectedConcept]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const handleFinish = useCallback(async () => {
    if (!selectedConcept || isLoading) return;

    setIsLoading(true);

    // Track telemetry
    const timeMs = endTimer("hard_onboarding");
    telemetry.onboardingCompleted({
      timeToCompleteMs: timeMs,
      stepsCompleted: 3,
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
    saveHardOnboardingState({
      selectedFormationId,
      selectedDefenseId,
    });

    // Notify parent with all selections
    onSelect(
      selectedConcept,
      selectedFormationId || undefined,
      selectedDefenseId === "none" ? undefined : selectedDefenseId || undefined
    );

    setIsVisible(false);
    setIsLoading(false);
  }, [selectedConcept, selectedFormationId, selectedDefenseId, isLoading, onSelect]);

  const handleSkip = useCallback(() => {
    // Track skip
    const timeMs = endTimer("hard_onboarding");
    telemetry.onboardingSkipped({
      stepIndex: step - 1,
      timeSpentMs: timeMs,
    });

    // Mark as completed (skipped)
    completeHardOnboarding("skipped");
    setIsVisible(false);
    onSkip?.();
  }, [step, onSkip]);

  if (!isVisible) return null;

  const stepTitles = [
    "Choose a concept to start",
    "Set up your canvas",
    "Ready to create!",
  ];

  const stepSubtitles = [
    "Pick one to see how it works",
    "Formation and defense settings",
    "You're all set to build your play",
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">
            {stepTitles[step - 1]}
          </h1>
          <p className="text-slate-400 mt-1">
            {stepSubtitles[step - 1]}
          </p>
        </div>

        {/* Content */}
        {step === 1 && (
          <Step1ConceptSelect
            selectedId={selectedConceptId}
            onSelect={handleConceptSelect}
          />
        )}
        {step === 2 && (
          <Step2Setup
            selectedConcept={selectedConcept}
            selectedFormationId={selectedFormationId}
            selectedDefenseId={selectedDefenseId}
            onFormationSelect={setSelectedFormationId}
            onDefenseSelect={setSelectedDefenseId}
          />
        )}
        {step === 3 && <Step3Success selectedConcept={selectedConcept} />}

        {/* What happens next (Step 1 only) */}
        {step === 1 && selectedConcept && (
          <div className="mx-6 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              <span className="font-medium">What happens next:</span> We'll load{" "}
              <span className="text-white font-medium">{selectedConcept.name}</span> on a{" "}
              <span className="text-white">{selectedConcept.formationName}</span> formation.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <button
                onClick={handleSkip}
                className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
              >
                Skip and start blank
              </button>
            )}
          </div>

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={step === 1 && !selectedConcept}
              className={cn(
                "min-w-[140px]",
                (step === 1 && selectedConcept) || step === 2
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-slate-700 cursor-not-allowed"
              )}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={isLoading}
              className="min-w-[160px] bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Building
                </>
              )}
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-8 h-1 rounded-full transition-colors",
                  s <= step ? "bg-blue-500" : "bg-slate-700"
                )}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-500 text-right mt-1">
            Step {step} of 3
          </p>
        </div>
      </div>
    </div>
  );
}

export default HardOnboardingModal;
