"use client";

// ============================================
// OnboardingOverlay
// 첫 사용자를 위한 강제 온보딩 가이드
// ============================================

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getOnboardingState,
  advanceOnboarding,
  completeOnboarding,
  dismissOnboarding,
  shouldShowOnboarding,
} from "./onboarding-state";
import {
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Users,
  Route,
  Lightbulb,
  Layout,
  CheckCircle,
} from "lucide-react";

// ============================================
// Onboarding Steps
// ============================================

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  tip: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector for highlight
  action?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to ForOffenseCoach",
    description:
      "Build professional football plays in minutes. This quick tour will show you the basics.",
    tip: "You can always access help from the toolbar.",
    icon: <Play className="w-8 h-8" />,
  },
  {
    id: "formation",
    title: "1. Choose a Formation",
    description:
      "Start by selecting a formation from the Offense tab on the left. This sets up your players on the field.",
    tip: "Try 'Spread' or 'Singleback' for common formations.",
    icon: <Layout className="w-8 h-8" />,
    highlight: '[data-tab="formation"]',
    action: "Select a formation from the list",
  },
  {
    id: "players",
    title: "2. Position Your Players",
    description:
      "Click and drag any player to adjust their position. The canvas uses a normalized coordinate system.",
    tip: "Hold Shift while dragging for fine-grained control.",
    icon: <Users className="w-8 h-8" />,
    action: "Try moving a player",
  },
  {
    id: "routes",
    title: "3. Draw Routes",
    description:
      "Select 'Route' mode from the toolbar, then click a receiver and drag to draw their route.",
    tip: "Click the endpoint to add route endings like curl, out, or go.",
    icon: <Route className="w-8 h-8" />,
    highlight: '[data-mode="route"]',
    action: "Draw a route for any receiver",
  },
  {
    id: "suggestions",
    title: "4. Get AI Suggestions",
    description:
      "Open the Suggestions panel to get concept recommendations based on your current formation and situation.",
    tip: "Suggestions show WHY each concept works for your setup.",
    icon: <Lightbulb className="w-8 h-8" />,
    action: "Check out the suggestions panel",
  },
  {
    id: "complete",
    title: "You're Ready!",
    description:
      "You've learned the basics. Explore concepts, add blocking assignments, and build your playbook.",
    tip: "Save your plays automatically, or export to PDF for your players.",
    icon: <CheckCircle className="w-8 h-8 text-green-500" />,
  },
];

// ============================================
// OnboardingOverlay Component
// ============================================

interface OnboardingOverlayProps {
  onComplete?: () => void;
}

export function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if onboarding should be shown
  useEffect(() => {
    const shouldShow = shouldShowOnboarding();
    setIsVisible(shouldShow);

    if (shouldShow) {
      const state = getOnboardingState();
      setCurrentStep(state.currentStep);
    }
  }, []);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (isLastStep) {
      // Complete onboarding
      completeOnboarding();
      setIsVisible(false);
      onComplete?.();
    } else {
      // Advance to next step
      advanceOnboarding(step.id);
      setCurrentStep((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length - 1));
    }

    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating, isLastStep, step.id, onComplete]);

  const handlePrev = useCallback(() => {
    if (isAnimating || isFirstStep) return;

    setIsAnimating(true);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating, isFirstStep]);

  const handleSkip = useCallback(() => {
    dismissOnboarding();
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case "ArrowRight":
        case "Enter":
          handleNext();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "Escape":
          handleSkip();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleNext, handlePrev, handleSkip]);

  if (!isVisible || !step) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl",
          "w-full max-w-lg mx-4 p-6",
          "transform transition-all duration-300",
          isAnimating ? "opacity-90 scale-95" : "opacity-100 scale-100"
        )}
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-200 transition-colors"
          title="Skip onboarding (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
            {step.icon}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">{step.title}</h2>
          <p className="text-slate-300 leading-relaxed">{step.description}</p>

          {/* Tip box */}
          <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2">
            <p className="text-sm text-blue-300">
              <span className="font-medium">Tip:</span> {step.tip}
            </p>
          </div>

          {/* Action hint */}
          {step.action && (
            <div className="mt-3 text-sm text-amber-400">
              <span className="font-medium">Try it:</span> {step.action}
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentStep
                  ? "bg-blue-500"
                  : index < currentStep
                    ? "bg-blue-500/50"
                    : "bg-slate-600"
              )}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isFirstStep}
            className={cn(
              "text-slate-400 hover:text-white",
              isFirstStep && "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="text-xs text-slate-500">
            {currentStep + 1} / {ONBOARDING_STEPS.length}
          </div>

          <Button onClick={handleNext} className="min-w-[100px]">
            {isLastStep ? (
              "Get Started"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Skip link */}
        <div className="mt-4 text-center">
          <button
            onClick={handleSkip}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
          >
            Skip tutorial (I know what I'm doing)
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Tooltip-style Step Indicator (for in-context hints)
// ============================================

interface OnboardingHintProps {
  stepId: string;
  children: React.ReactNode;
  className?: string;
}

export function OnboardingHint({
  stepId,
  children,
  className,
}: OnboardingHintProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const state = getOnboardingState();
    const stepIndex = ONBOARDING_STEPS.findIndex((s) => s.id === stepId);
    setIsActive(
      !state.completed &&
        state.currentStep === stepIndex &&
        state.completedSteps.length < ONBOARDING_STEPS.length
    );
  }, [stepId]);

  if (!isActive) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
    </div>
  );
}

export default OnboardingOverlay;
