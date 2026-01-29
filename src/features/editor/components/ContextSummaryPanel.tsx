"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEditorStore, getContextDiff } from "../store";
import type { PlayIntent, BoxCount, DefenseFront } from "./PreContextScreen";
import { RotateCcw } from "lucide-react";

// ============================================
// Context Summary Panel
// "Summary + Adjust" structure for coach intent
// Shows diff from initial context
// ============================================

const PLAY_TYPE_LABELS: Record<PlayIntent, string> = {
  pass: "Pass",
  run: "Run",
  rpo: "RPO",
};

const PLAY_TYPE_COLORS: Record<PlayIntent, string> = {
  pass: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400",
  run: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400",
  rpo: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400",
};

export function ContextSummaryPanel() {
  const { context, updateContext, resetContextToInitial } = useEditorStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get the active context values
  const { active, initial } = context;
  const { playType, boxCount, front } = active;

  // Calculate diff from initial
  const changedKeys = getContextDiff(initial, active);
  const hasChanges = changedKeys.length > 0;

  return (
    <div className="border-b">
      {/* Summary Row (Always Visible) */}
      <div className="px-3 py-2 flex items-center justify-between bg-gradient-to-r from-muted/50 to-transparent">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Context Assumption label */}
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Context:
          </span>

          {/* Play Type Badge (Primary) */}
          <Badge
            variant="outline"
            className={`font-semibold text-xs ${PLAY_TYPE_COLORS[playType]}`}
          >
            {PLAY_TYPE_LABELS[playType]}
          </Badge>

          {/* Box Count (if set) */}
          {boxCount !== "unknown" && (
            <Badge variant="secondary" className="text-xs">
              {boxCount}-box
            </Badge>
          )}

          {/* Front (if set) */}
          {front !== "unknown" && (
            <Badge variant="secondary" className="text-xs capitalize">
              {front}
            </Badge>
          )}

          {/* Changed from start indicator */}
          {hasChanges && (
            <Badge
              variant="outline"
              className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20"
            >
              Changed: {changedKeys.length}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Reset Button (only show if there are changes) */}
          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={resetContextToInitial}
              title="Reset to start"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}

          {/* Adjust Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Done" : "Adjust"}
          </Button>
        </div>
      </div>

      {/* Adjust Panel (Expandable) */}
      {isExpanded && (
        <div className="px-3 py-3 bg-muted/20 space-y-3 border-t">
          {/* Play Type Selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Play Type
              {changedKeys.includes("playType") && (
                <span className="ml-1 text-amber-500">*</span>
              )}
            </label>
            <div className="flex gap-1">
              {(["run", "pass", "rpo"] as PlayIntent[]).map((type) => (
                <button
                  key={type}
                  onClick={() => updateContext({ playType: type })}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    playType === type
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background border text-muted-foreground hover:text-foreground hover:border-primary/50"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Box Count Selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Expected Box Count
              {changedKeys.includes("boxCount") && (
                <span className="ml-1 text-amber-500">*</span>
              )}
            </label>
            <div className="flex gap-1">
              {([5, 6, 7, 8, "unknown"] as BoxCount[]).map((box) => (
                <button
                  key={String(box)}
                  onClick={() => updateContext({ boxCount: box })}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-all ${
                    boxCount === box
                      ? "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-background border text-muted-foreground hover:text-foreground hover:border-amber-300"
                  }`}
                >
                  {box === "unknown" ? "?" : box}
                </button>
              ))}
            </div>
          </div>

          {/* Front Selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Expected Front
              {changedKeys.includes("front") && (
                <span className="ml-1 text-amber-500">*</span>
              )}
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["even", "odd", "over", "under", "bear", "unknown"] as DefenseFront[]).map((f) => (
                <button
                  key={f}
                  onClick={() => updateContext({ front: f })}
                  className={`px-2 py-1.5 text-xs rounded-md transition-all ${
                    front === f
                      ? "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-background border text-muted-foreground hover:text-foreground hover:border-red-300"
                  }`}
                >
                  {f === "unknown" ? "Unknown" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Changed fields hint */}
          {hasChanges && (
            <div className="pt-2 border-t border-dashed">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-600">
                  Changed from start: {changedKeys.join(", ")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-[10px] text-amber-600 hover:text-amber-700"
                  onClick={resetContextToInitial}
                >
                  Reset to start
                </Button>
              </div>
            </div>
          )}

          {/* Hint */}
          <p className="text-[10px] text-muted-foreground">
            Adjusting context will update concept recommendations
          </p>
        </div>
      )}
    </div>
  );
}
