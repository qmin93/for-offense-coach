"use client";

import React, { useMemo, useState } from "react";
import { useEditorStore } from "../store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  Shield,
  Flag,
  MapPin,
  Hash,
  ChevronDown,
  ChevronUp,
  Settings2,
} from "lucide-react";
import { telemetry } from "@/lib/telemetry";

// ============================================
// Context Chip Types
// ============================================

interface ContextChip {
  id: string;
  label: string;
  value: string;
  type: "playType" | "defense" | "situation" | "hash";
  impact: string; // "왜 이게 중요했는지" 설명
  color: string;
}

// ============================================
// ContextImpactStrip Component
// ============================================

interface ContextImpactStripProps {
  onAdjust?: () => void;
}

export function ContextImpactStrip({ onAdjust }: ContextImpactStripProps) {
  const { context, defensePresetId } = useEditorStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const activeContext = context.active;

  // Generate chips based on current context
  const chips = useMemo<ContextChip[]>(() => {
    const result: ContextChip[] = [];

    // Play Type chip (always shown) - primary accent blue
    const playTypeLabel = activeContext.playType.toUpperCase();
    result.push({
      id: "playType",
      label: "Play",
      value: playTypeLabel,
      type: "playType",
      impact:
        activeContext.playType === "run"
          ? "Filters to run concepts. Defense box count strongly affects recommendations."
          : activeContext.playType === "pass"
          ? "Filters to pass concepts. Coverage shell strongly affects recommendations."
          : "Shows RPO concepts. Both run fit and pass coverage are considered.",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    });

    // Box Count chip (if not unknown) - muted slate
    if (activeContext.boxCount !== "unknown") {
      result.push({
        id: "boxCount",
        label: "Box",
        value: `${activeContext.boxCount}`,
        type: "defense",
        impact: `${activeContext.boxCount}-man box affects run game. ${
          Number(activeContext.boxCount) >= 7
            ? "Heavy box favors passing or outside runs."
            : Number(activeContext.boxCount) <= 6
            ? "Light box favors inside runs."
            : "Balanced box - all concepts viable."
        }`,
        color: "bg-slate-100 text-slate-600 border-slate-200",
      });
    }

    // Front chip (if not unknown) - muted slate
    if (activeContext.front !== "unknown") {
      const frontLabel = activeContext.front.charAt(0).toUpperCase() + activeContext.front.slice(1);
      result.push({
        id: "front",
        label: "Front",
        value: frontLabel,
        type: "defense",
        impact: getFrontImpact(activeContext.front),
        color: "bg-slate-100 text-slate-600 border-slate-200",
      });
    }

    // Shell chip (if not unknown) - muted slate
    if (activeContext.shell !== "unknown") {
      const shellLabel = activeContext.shell === "1high" ? "1-High" : "2-High";
      result.push({
        id: "shell",
        label: "Shell",
        value: shellLabel,
        type: "defense",
        impact:
          activeContext.shell === "1high"
            ? "Single-high safety. Seam routes and corners are more effective."
            : "Two-high safety. Middle of field routes and quick game are better.",
        color: "bg-slate-100 text-slate-600 border-slate-200",
      });
    }

    // Down chip (if set) - muted slate
    if (activeContext.situation.down !== "-") {
      result.push({
        id: "down",
        label: "Down",
        value: `${activeContext.situation.down}`,
        type: "situation",
        impact: getDownImpact(activeContext.situation.down),
        color: "bg-slate-100 text-slate-600 border-slate-200",
      });
    }

    // Distance chip (if set) - muted slate
    if (activeContext.situation.distance !== "-") {
      result.push({
        id: "distance",
        label: "Dist",
        value: `${activeContext.situation.distance}`,
        type: "situation",
        impact: getDistanceImpact(activeContext.situation.distance),
        color: "bg-slate-100 text-slate-600 border-slate-200",
      });
    }

    // Hash chip (if set) - muted slate
    if (activeContext.situation.hash !== "-") {
      const hashLabel =
        activeContext.situation.hash === "L"
          ? "Left"
          : activeContext.situation.hash === "R"
          ? "Right"
          : "Middle";
      result.push({
        id: "hash",
        label: "Hash",
        value: hashLabel,
        type: "hash",
        impact: getHashImpact(activeContext.situation.hash),
        color: "bg-slate-100 text-slate-600 border-slate-200",
      });
    }

    return result;
  }, [activeContext]);

  // Track strip shown for telemetry
  React.useEffect(() => {
    telemetry.track("reco_context_strip_shown", {
      playType: activeContext.playType,
      boxCount: activeContext.boxCount,
      front: activeContext.front,
      down: activeContext.situation.down,
      distance: activeContext.situation.distance,
      hash: activeContext.situation.hash,
      chipCount: chips.length,
    });
  }, [activeContext, chips.length]);

  const getIcon = (type: ContextChip["type"]) => {
    switch (type) {
      case "playType":
        return <TrendingUp className="w-3 h-3" />;
      case "defense":
        return <Shield className="w-3 h-3" />;
      case "situation":
        return <Flag className="w-3 h-3" />;
      case "hash":
        return <Hash className="w-3 h-3" />;
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
            Context Impact
          </span>
          <div className="flex items-center gap-1">
            {onAdjust && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] text-slate-500 hover:text-slate-700"
                onClick={onAdjust}
              >
                <Settings2 className="w-3 h-3 mr-0.5" />
                Adjust
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-slate-500 hover:text-slate-700"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Chips row */}
        <div className="flex flex-wrap gap-1">
          {chips.map((chip) => (
            <Tooltip key={chip.id}>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0.5 cursor-help flex items-center gap-1 ${chip.color}`}
                >
                  {getIcon(chip.type)}
                  <span className="font-medium">{chip.value}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[250px] text-xs">
                <p className="font-medium mb-1">{chip.label}: {chip.value}</p>
                <p className="text-muted-foreground">{chip.impact}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {chips.length <= 1 && (
            <span className="text-[10px] text-slate-400 italic">
              Add context for better recommendations
            </span>
          )}
        </div>

        {/* Expanded details */}
        {isExpanded && chips.length > 1 && (
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
            {chips.slice(1).map((chip) => (
              <div key={chip.id} className="text-[10px]">
                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                  {getIcon(chip.type)}
                  <span>{chip.label}: {chip.value}</span>
                </div>
                <p className="text-slate-500 pl-4 leading-snug">
                  {chip.impact}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// ============================================
// Impact Text Helpers
// ============================================

function getFrontImpact(front: string): string {
  switch (front) {
    case "even":
      return "4-man front with balanced gaps. Zone runs and duo work well.";
    case "odd":
      return "3-man front with nose tackle. Power and trap are effective.";
    case "over":
      return "3-tech to strong side. Run weak or use split zone.";
    case "under":
      return "3-tech to weak side. Run strong or power.";
    case "bear":
      return "Heavy front clogs gaps. Bounce outside or pass.";
    default:
      return "Front type affects blocking schemes and run direction.";
  }
}

function getDownImpact(down: string | number): string {
  switch (String(down)) {
    case "1":
      return "1st down - all concepts available. Establish the run or take shots.";
    case "2":
      return "2nd down - distance matters. Medium gains keep drive alive.";
    case "3":
      return "3rd down - conversion critical. Match distance with route depth.";
    case "4":
      return "4th down - high stakes. Conservative or go for it based on situation.";
    default:
      return "Down affects play selection and risk tolerance.";
  }
}

function getDistanceImpact(distance: string | number): string {
  const d = String(distance);
  if (d === "short" || d === "1" || d === "2" || d === "1-2") {
    return "Short yardage - QB sneak, power, or quick outs.";
  } else if (d === "medium" || d === "3" || d === "4" || d === "5" || d === "3-5") {
    return "Medium distance - balanced approach. Slants, curls, zone runs.";
  } else if (d === "long" || d === "6-9") {
    return "Longer distance - intermediate routes. Dig, cross, flood.";
  } else if (d === "10+" || d === "10" || Number(d) >= 10) {
    return "Long distance - must throw. Deep routes or max protect.";
  }
  return "Distance affects route depth and concept selection.";
}

function getHashImpact(hash: string): string {
  switch (hash) {
    case "L":
      return "Left hash - more field to the right. Consider run/pass to wide side.";
    case "R":
      return "Right hash - more field to the left. Consider run/pass to wide side.";
    case "M":
      return "Middle of field - balanced spacing. All concepts work equally.";
    default:
      return "Hash affects field spacing and concept direction.";
  }
}

export default ContextImpactStrip;
