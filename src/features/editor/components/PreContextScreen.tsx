"use client";

// ============================================
// Pre-Context Screen
// 에디터 진입 전 의도 결정 화면 (10초 컷)
// ============================================

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Zap,
  TrendingUp,
  Shuffle,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  Target,
  MapPin,
} from "lucide-react";

// ============================================
// Types
// ============================================

export type PlayIntent = "pass" | "run" | "rpo";
export type BoxCount = 5 | 6 | 7 | 8 | "unknown";
export type DefenseFront = "even" | "odd" | "over" | "under" | "bear" | "unknown";
export type ThreeTech = "strong" | "weak" | "none" | "unknown";
export type Shell = "1high" | "2high" | "unknown";
export type PressureLevel = "none" | "low" | "medium" | "high";
export type Down = 1 | 2 | 3 | 4 | "-";
export type Distance = "short" | "medium" | "long" | "goal" | "-";
export type Hash = "L" | "M" | "R" | "-";

export interface PreContext {
  playType: PlayIntent;
  boxCount: BoxCount;
  front: DefenseFront;
  threeTech: ThreeTech;
  shell: Shell;
  pressure: PressureLevel;
  situation: {
    down: Down;
    distance: Distance;
    hash: Hash;
  };
}

export const DEFAULT_PRE_CONTEXT: PreContext = {
  playType: "pass",
  boxCount: "unknown",
  front: "unknown",
  threeTech: "unknown",
  shell: "unknown",
  pressure: "none",
  situation: {
    down: "-",
    distance: "-",
    hash: "-",
  },
};

interface PreContextScreenProps {
  onComplete: (context: PreContext) => void;
  onSkip?: () => void;
}

// ============================================
// Play Type Options
// ============================================

const PLAY_TYPE_OPTIONS: {
  value: PlayIntent;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "run",
    label: "RUN",
    description: "Inside, outside, option",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "green",
  },
  {
    value: "pass",
    label: "PASS",
    description: "Dropback, play-action, screens",
    icon: <Zap className="w-6 h-6" />,
    color: "blue",
  },
  {
    value: "rpo",
    label: "RPO",
    description: "Run-pass option plays",
    icon: <Shuffle className="w-6 h-6" />,
    color: "purple",
  },
];

// ============================================
// Option Arrays
// ============================================

const BOX_COUNT_OPTIONS: { value: BoxCount; label: string }[] = [
  { value: "unknown", label: "Unknown" },
  { value: 6, label: "6 (Light)" },
  { value: 7, label: "7 (Standard)" },
  { value: 8, label: "8 (Heavy)" },
];

const FRONT_OPTIONS: { value: DefenseFront; label: string }[] = [
  { value: "unknown", label: "Unknown" },
  { value: "even", label: "Even (4-down)" },
  { value: "odd", label: "Odd (3-down)" },
];

const THREE_TECH_OPTIONS: { value: ThreeTech; label: string }[] = [
  { value: "unknown", label: "Unknown" },
  { value: "strong", label: "Strong" },
  { value: "weak", label: "Weak" },
  { value: "none", label: "None" },
];

const SHELL_OPTIONS: { value: Shell; label: string }[] = [
  { value: "unknown", label: "Unknown" },
  { value: "1high", label: "1-High" },
  { value: "2high", label: "2-High" },
];

const PRESSURE_OPTIONS: { value: PressureLevel; label: string }[] = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const DOWN_OPTIONS: { value: Down; label: string }[] = [
  { value: "-", label: "-" },
  { value: 1, label: "1st" },
  { value: 2, label: "2nd" },
  { value: 3, label: "3rd" },
  { value: 4, label: "4th" },
];

const DISTANCE_OPTIONS: { value: Distance; label: string }[] = [
  { value: "-", label: "-" },
  { value: "short", label: "Short (1-3)" },
  { value: "medium", label: "Medium (4-6)" },
  { value: "long", label: "Long (7+)" },
  { value: "goal", label: "Goal" },
];

const HASH_OPTIONS: { value: Hash; label: string }[] = [
  { value: "-", label: "-" },
  { value: "L", label: "Left" },
  { value: "M", label: "Middle" },
  { value: "R", label: "Right" },
];

// ============================================
// Main Component
// ============================================

export function PreContextScreen({ onComplete, onSkip }: PreContextScreenProps) {
  const [playType, setPlayType] = useState<PlayIntent | null>(null);
  const [boxCount, setBoxCount] = useState<BoxCount>("unknown");
  const [front, setFront] = useState<DefenseFront>("unknown");
  const [threeTech, setThreeTech] = useState<ThreeTech>("unknown");
  const [shell, setShell] = useState<Shell>("unknown");
  const [pressure, setPressure] = useState<PressureLevel>("none");
  const [down, setDown] = useState<Down>("-");
  const [distance, setDistance] = useState<Distance>("-");
  const [hash, setHash] = useState<Hash>("-");

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleComplete = useCallback(() => {
    if (!playType) return;

    onComplete({
      playType,
      boxCount,
      front,
      threeTech,
      shell,
      pressure,
      situation: { down, distance, hash },
    });
  }, [playType, boxCount, front, threeTech, shell, pressure, down, distance, hash, onComplete]);

  const handleSkip = useCallback(() => {
    // Skip with defaults
    if (onSkip) {
      onSkip();
    } else {
      onComplete({
        ...DEFAULT_PRE_CONTEXT,
        playType: "pass", // Default to pass if skipping
      });
    }
  }, [onComplete, onSkip]);

  // Check if any defense inputs are set
  const hasAnyDefenseInputs =
    boxCount !== "unknown" ||
    front !== "unknown" ||
    threeTech !== "unknown" ||
    shell !== "unknown" ||
    pressure !== "none";

  // Check if any situation inputs are set
  const hasSituation = down !== "-" || distance !== "-" || hash !== "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-y-auto py-8">
      <div className="w-full max-w-xl mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Start a New Play
          </h1>
          <p className="text-muted-foreground">
            Set quick context so suggestions match the situation.{" "}
            <span className="text-xs opacity-70">(10 seconds)</span>
          </p>
        </div>

        {/* Section A: Play Type (Required) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            What are you building? <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PLAY_TYPE_OPTIONS.map((option) => {
              const isSelected = playType === option.value;
              const colorClasses = {
                blue: isSelected
                  ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30"
                  : "hover:border-blue-500/50",
                green: isSelected
                  ? "border-green-500 bg-green-500/10 ring-2 ring-green-500/30"
                  : "hover:border-green-500/50",
                purple: isSelected
                  ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30"
                  : "hover:border-purple-500/50",
              };

              return (
                <button
                  key={option.value}
                  onClick={() => setPlayType(option.value)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200",
                    "text-center hover:scale-[1.02] active:scale-[0.98]",
                    isSelected
                      ? colorClasses[option.color as keyof typeof colorClasses]
                      : "border-border bg-card " + colorClasses[option.color as keyof typeof colorClasses]
                  )}
                >
                  <div
                    className={cn(
                      "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2",
                      isSelected
                        ? option.color === "blue"
                          ? "bg-blue-500/20 text-blue-400"
                          : option.color === "green"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-purple-500/20 text-purple-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {option.icon}
                  </div>
                  <div className="font-bold text-foreground">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section B: Defensive Look (Optional) */}
        <div className="mb-4 p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-foreground">
              Defensive Look
            </span>
            <Badge variant="outline" className="text-xs">
              optional
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Box Count */}
            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                Box Count
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BOX_COUNT_OPTIONS.map((option) => (
                  <button
                    key={String(option.value)}
                    onClick={() => setBoxCount(option.value)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md border transition-colors",
                      boxCount === option.value
                        ? "border-red-400 bg-red-500/10 text-red-400"
                        : "border-border text-muted-foreground hover:border-red-400/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Front */}
            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                Front
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FRONT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFront(option.value)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md border transition-colors",
                      front === option.value
                        ? "border-red-400 bg-red-500/10 text-red-400"
                        : "border-border text-muted-foreground hover:border-red-400/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* More Options (Advanced) */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvanced ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            More options
          </button>

          {showAdvanced && (
            <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-3">
              {/* 3-Tech */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">
                  3-Tech
                </label>
                <div className="flex flex-col gap-1">
                  {THREE_TECH_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setThreeTech(option.value)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-colors text-left",
                        threeTech === option.value
                          ? "border-red-400 bg-red-500/10 text-red-400"
                          : "border-border text-muted-foreground hover:border-red-400/50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shell */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">
                  Shell
                </label>
                <div className="flex flex-col gap-1">
                  {SHELL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setShell(option.value)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-colors text-left",
                        shell === option.value
                          ? "border-red-400 bg-red-500/10 text-red-400"
                          : "border-border text-muted-foreground hover:border-red-400/50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pressure */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">
                  Pressure
                </label>
                <div className="flex flex-col gap-1">
                  {PRESSURE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPressure(option.value)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-colors text-left",
                        pressure === option.value
                          ? "border-red-400 bg-red-500/10 text-red-400"
                          : "border-border text-muted-foreground hover:border-red-400/50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section C: Situation (Optional) */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-foreground">
              Situation
            </span>
            <Badge variant="outline" className="text-xs">
              optional
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Down */}
            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                Down
              </label>
              <div className="flex flex-wrap gap-1">
                {DOWN_OPTIONS.map((option) => (
                  <button
                    key={String(option.value)}
                    onClick={() => setDown(option.value)}
                    className={cn(
                      "px-2 py-1 text-xs rounded border transition-colors",
                      down === option.value
                        ? "border-amber-400 bg-amber-500/10 text-amber-400"
                        : "border-border text-muted-foreground hover:border-amber-400/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                Distance
              </label>
              <div className="flex flex-wrap gap-1">
                {DISTANCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDistance(option.value)}
                    className={cn(
                      "px-2 py-1 text-xs rounded border transition-colors",
                      distance === option.value
                        ? "border-amber-400 bg-amber-500/10 text-amber-400"
                        : "border-border text-muted-foreground hover:border-amber-400/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hash */}
            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3 inline mr-1" />
                Hash
              </label>
              <div className="flex flex-wrap gap-1">
                {HASH_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setHash(option.value)}
                    className={cn(
                      "px-2 py-1 text-xs rounded border transition-colors",
                      hash === option.value
                        ? "border-amber-400 bg-amber-500/10 text-amber-400"
                        : "border-border text-muted-foreground hover:border-amber-400/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Context Summary */}
        {playType && (
          <div className="mb-6 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="text-xs text-muted-foreground mb-1">
              Your context:
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn(
                  playType === "pass"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : playType === "run"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                )}
              >
                {playType.toUpperCase()}
              </Badge>
              {boxCount !== "unknown" && (
                <Badge variant="secondary" className="text-xs">
                  {boxCount}-box
                </Badge>
              )}
              {front !== "unknown" && (
                <Badge variant="secondary" className="text-xs">
                  {front}
                </Badge>
              )}
              {threeTech !== "unknown" && (
                <Badge variant="secondary" className="text-xs">
                  3T: {threeTech}
                </Badge>
              )}
              {shell !== "unknown" && (
                <Badge variant="secondary" className="text-xs">
                  {shell}
                </Badge>
              )}
              {pressure !== "none" && (
                <Badge variant="secondary" className="text-xs">
                  {pressure} pressure
                </Badge>
              )}
              {down !== "-" && (
                <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">
                  {down === 1 ? "1st" : down === 2 ? "2nd" : down === 3 ? "3rd" : "4th"}
                </Badge>
              )}
              {distance !== "-" && (
                <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">
                  {distance}
                </Badge>
              )}
              {hash !== "-" && (
                <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">
                  {hash} hash
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleComplete}
            disabled={!playType}
            className="w-full h-12 text-base"
            size="lg"
          >
            Start Building
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Skip (Use defaults)
          </Button>
        </div>

        {/* Helper text */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          You can adjust this later in the editor.
        </p>
      </div>
    </div>
  );
}

export default PreContextScreen;
