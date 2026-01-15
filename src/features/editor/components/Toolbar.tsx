"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useEditorStore, EditorMode } from "../store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MODES: { mode: EditorMode; key: string; icon: string; shortcut: string }[] = [
  { mode: "select", key: "select", icon: "↖", shortcut: "V" },
  { mode: "route", key: "route", icon: "↗", shortcut: "R" },
  { mode: "block", key: "block", icon: "→", shortcut: "B" },
  { mode: "motion", key: "motion", icon: "↔", shortcut: "M" },
  { mode: "text", key: "text", icon: "T", shortcut: "T" },
];

export function Toolbar() {
  const t = useTranslations("editor.toolbar");
  const { mode, setMode, undo, redo, canUndo, canRedo, toggleSuggestions, resetAll, play, curveMode, toggleCurveMode, autoApplyDefaults, toggleAutoApplyDefaults, applyPlayerDefaults } =
    useEditorStore();

  return (
    <div className="flex items-center gap-2 p-2 bg-background border-b">
      {/* Mode buttons */}
      <div className="flex items-center gap-1 border-r pr-2">
        {MODES.map((m) => (
          <Tooltip key={m.mode}>
            <TooltipTrigger asChild>
              <Button
                variant={mode === m.mode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMode(m.mode)}
                className={mode === m.mode ? "bg-primary/10 text-primary" : ""}
              >
                <span className="mr-1.5">{m.icon}</span>
                {t(m.key)}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t(m.key)} <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded">{m.shortcut}</kbd></p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Curve Mode Toggle (only in route mode) */}
      {mode === "route" && (
        <div className="flex items-center gap-1 border-r pr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={curveMode ? "secondary" : "ghost"}
                size="sm"
                onClick={toggleCurveMode}
                className={curveMode ? "bg-primary/10 text-primary" : ""}
              >
                <span className="mr-1.5">〰</span>
                Curve
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Draw smooth Bezier curves <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded">C</kbd></p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 border-r pr-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo()}
              className="h-8 w-8"
            >
              ↩
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t("undo")} <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Z</kbd></p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo()}
              className="h-8 w-8"
            >
              ↪
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t("redo")} <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Y</kbd></p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Suggestions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleSuggestions("pass")}
        >
          {t("passConcepts")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleSuggestions("run")}
        >
          {t("runConcepts")}
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Auto Defaults Toggle */}
      <div className="flex items-center gap-1 border-r pr-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={autoApplyDefaults ? "secondary" : "ghost"}
              size="sm"
              onClick={toggleAutoApplyDefaults}
              className={autoApplyDefaults ? "bg-primary/10 text-primary" : ""}
            >
              Auto OL
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Auto-apply OL blocks when formation changes</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={applyPlayerDefaults}
              disabled={!play}
            >
              Apply
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Apply default blocks to OL now</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Reset All */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAll}
              disabled={!play || play.actions.length === 0}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Reset All
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Clear all actions and reset to formation</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
