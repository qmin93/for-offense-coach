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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Undo2, Redo2, RotateCcw, MousePointer2, Route, Square, MoveHorizontal, Type } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES: { mode: EditorMode; key: string; icon: React.ReactNode; shortcut: string }[] = [
  { mode: "select", key: "select", icon: <MousePointer2 className="w-4 h-4" />, shortcut: "V" },
  { mode: "route", key: "route", icon: <Route className="w-4 h-4" />, shortcut: "R" },
  { mode: "block", key: "block", icon: <Square className="w-4 h-4" />, shortcut: "B" },
  { mode: "motion", key: "motion", icon: <MoveHorizontal className="w-4 h-4" />, shortcut: "M" },
  { mode: "text", key: "text", icon: <Type className="w-4 h-4" />, shortcut: "T" },
];

const OL_RULES = [
  { id: "inside_zone", name: "Inside Zone" },
  { id: "outside_zone", name: "Outside Zone" },
  { id: "duo", name: "Duo" },
  { id: "power", name: "Power" },
  { id: "counter", name: "Counter" },
  { id: "pass_pro", name: "Pass Pro" },
];

export function Toolbar() {
  const t = useTranslations("editor.toolbar");
  const { mode, setMode, undo, redo, canUndo, canRedo, resetAll, play, curveMode, toggleCurveMode, autoApplyDefaults, toggleAutoApplyDefaults, applyPlayerDefaults } =
    useEditorStore();

  return (
    <div className="bg-background border-b">
      {/* Main Toolbar Row */}
      <div className="flex items-center h-10 px-2 gap-1">
        {/* Mode Tabs */}
        <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
          {MODES.map((m) => (
            <Tooltip key={m.mode}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setMode(m.mode)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    mode === m.mode
                      ? "bg-brand-blue text-white shadow-sm"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  {m.icon}
                  <span className="hidden sm:inline">{t(m.key)}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{t(m.key)} <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded">{m.shortcut}</kbd></p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Curve Toggle (in route mode) */}
        {mode === "route" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleCurveMode}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-medium transition-all ml-1",
                  curveMode
                    ? "bg-brand-blue text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                〰 Curve
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Bezier curves <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded">C</kbd></p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-2" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={!canUndo()}
                className="h-8 w-8"
              >
                <Undo2 className="w-4 h-4" />
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
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t("redo")} <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Y</kbd></p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-2" />

        {/* OL Rules Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={autoApplyDefaults ? "secondary" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 gap-1 border-white/20",
                    autoApplyDefaults
                      ? "bg-green-600 text-white border-green-500 hover:bg-green-700"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  OL Rules
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Auto OL blocking rules</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem
              onClick={toggleAutoApplyDefaults}
              className={cn(autoApplyDefaults && "bg-green-50")}
            >
              <span className="mr-2">{autoApplyDefaults ? "✓" : " "}</span>
              Auto Apply
            </DropdownMenuItem>
            <div className="h-px bg-border my-1" />
            {OL_RULES.map((rule) => (
              <DropdownMenuItem key={rule.id} onClick={applyPlayerDefaults}>
                {rule.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Reset All */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAll}
              disabled={!play || play.actions.length === 0}
              className="h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Clear all actions</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
