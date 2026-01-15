"use client";

import React from "react";
import { useEditorStore } from "../store";
import { FORMATIONS } from "@/domain/engine/formations";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function FormationPanel() {
  const { applyFormation, play } = useEditorStore();
  const currentFormationId = play?.meta?.formationId;

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Formations</h3>
      <div className="grid grid-cols-1 gap-2">
        {FORMATIONS.map((formation) => {
          const isSelected = currentFormationId === formation.id;
          return (
            <button
              key={formation.id}
              onClick={() => applyFormation(formation)}
              className={cn(
                "p-3 text-left rounded-lg border transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{formation.name}</div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <Badge variant="secondary" className="text-xs">
                  {formation.meta?.structure}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formation.meta?.personnelHint?.join("/")}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
