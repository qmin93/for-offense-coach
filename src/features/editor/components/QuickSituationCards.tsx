"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Target, Clock, MapPin } from "lucide-react";

interface QuickSituation {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  concepts: string[];
  context: {
    down?: string;
    distance?: string;
    fieldZone?: string;
    playType?: "pass" | "run";
  };
}

const QUICK_SITUATIONS: QuickSituation[] = [
  {
    id: "3rd_long",
    name: "3rd & Long",
    icon: <Target className="w-4 h-4" />,
    color: "blue",
    description: "Mesh, Levels, Flood",
    concepts: ["mesh", "levels", "flood", "four_verticals"],
    context: {
      down: "3",
      distance: "long",
      playType: "pass",
    },
  },
  {
    id: "redzone",
    name: "RedZone",
    icon: <MapPin className="w-4 h-4" />,
    color: "red",
    description: "Naked, Boot, Fade",
    concepts: ["naked_boot", "pa_boot", "fade_out", "slant_flat"],
    context: {
      fieldZone: "red_zone",
      playType: "pass",
    },
  },
  {
    id: "2min",
    name: "2-Minute",
    icon: <Clock className="w-4 h-4" />,
    color: "amber",
    description: "Stick, Speed Out, Drive",
    concepts: ["stick", "speed_out", "drive", "levels"],
    context: {
      playType: "pass",
    },
  },
];

interface QuickSituationCardsProps {
  onSelect: (situation: QuickSituation) => void;
  selectedId?: string;
  className?: string;
}

export function QuickSituationCards({
  onSelect,
  selectedId,
  className,
}: QuickSituationCardsProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {QUICK_SITUATIONS.map((situation) => {
        const isSelected = selectedId === situation.id;
        const colorClasses = {
          blue: isSelected
            ? "bg-blue-100 border-blue-400 text-blue-700"
            : "bg-blue-50/50 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300",
          red: isSelected
            ? "bg-red-100 border-red-400 text-red-700"
            : "bg-red-50/50 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300",
          amber: isSelected
            ? "bg-amber-100 border-amber-400 text-amber-700"
            : "bg-amber-50/50 border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300",
        };

        return (
          <button
            key={situation.id}
            onClick={() => onSelect(situation)}
            className={cn(
              "flex flex-col items-center p-2.5 rounded-xl border-2 transition-all",
              "hover:scale-[1.02] active:scale-[0.98]",
              colorClasses[situation.color as keyof typeof colorClasses]
            )}
          >
            <div className="mb-1">{situation.icon}</div>
            <div className="text-xs font-semibold">{situation.name}</div>
            <div className="text-[10px] opacity-70 mt-0.5 text-center leading-tight">
              {situation.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { QUICK_SITUATIONS, type QuickSituation };
