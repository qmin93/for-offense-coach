"use client";

import React from "react";
import { useEditorStore } from "../store";
import { DEFENSE_PRESETS } from "@/domain/engine/defense-presets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DefensePanel() {
  const {
    defensePresetId,
    showDefense,
    applyDefensePreset,
    toggleDefenseVisibility,
    resetDefense,
  } = useEditorStore();

  // Group presets by family
  const frontPresets = DEFENSE_PRESETS.filter((p) => p.family === "front");
  const shellPresets = DEFENSE_PRESETS.filter((p) => p.family === "shell");

  return (
    <div className="p-4 space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Defense</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={showDefense ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={toggleDefenseVisibility}
          >
            {showDefense ? "Hide" : "Show"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={resetDefense}
            disabled={!defensePresetId}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Quick chips for current selection */}
      {defensePresetId && (
        <div className="flex flex-wrap gap-1">
          {(() => {
            const preset = DEFENSE_PRESETS.find((p) => p.id === defensePresetId);
            if (!preset) return null;
            return (
              <>
                <Badge variant="secondary" className="text-xs">
                  {preset.front.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Box {preset.boxCount}
                </Badge>
                {preset.shell !== "unknown" && (
                  <Badge variant="secondary" className="text-xs">
                    {preset.shell}
                  </Badge>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Front-based presets */}
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Front Presets
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {frontPresets.map((preset) => {
            const isSelected = defensePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyDefensePreset(preset.id)}
                className={cn(
                  "p-2.5 text-left rounded-lg border transition-all",
                  isSelected
                    ? "border-red-500 bg-red-500/10 ring-1 ring-red-500/20"
                    : "border-border hover:border-red-500/50 hover:bg-accent/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{preset.name}</div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {preset.front}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Box {preset.boxCount}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shell-based presets */}
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Shell Presets
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {shellPresets.map((preset) => {
            const isSelected = defensePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyDefensePreset(preset.id)}
                className={cn(
                  "p-2.5 text-left rounded-lg border transition-all",
                  isSelected
                    ? "border-red-500 bg-red-500/10 ring-1 ring-red-500/20"
                    : "border-border hover:border-red-500/50 hover:bg-accent/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{preset.name}</div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {preset.shell}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Box {preset.boxCount}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Help text */}
      <div className="text-xs text-muted-foreground pt-2 border-t">
        Select a defense preset to add 11 defensive players to the field.
        Use "Hide" to toggle visibility.
      </div>
    </div>
  );
}
