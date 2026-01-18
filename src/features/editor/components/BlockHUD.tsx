"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useEditorStore } from "../store";
import { BLOCK_PRESETS, getAngleDescription, snapAngle } from "@/domain/engine/block-presets";
import type { BlockScheme, BlockStyle, BlockAction, BlockTarget, BlockLandmarkId } from "@/domain/dsl/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Quick target chips for common block targets
const QUICK_TARGETS: { id: BlockLandmarkId; label: string; side: "strong" | "weak" }[] = [
  { id: "3T_STRONG", label: "3T", side: "strong" },
  { id: "3T_WEAK", label: "3T", side: "weak" },
  { id: "EMOL_STRONG", label: "EMOL", side: "strong" },
  { id: "EMOL_WEAK", label: "EMOL", side: "weak" },
  { id: "B_GAP_STRONG", label: "B", side: "strong" },
  { id: "B_GAP_WEAK", label: "B", side: "weak" },
  { id: "A_GAP_STRONG", label: "A", side: "strong" },
  { id: "A_GAP_WEAK", label: "A", side: "weak" },
  { id: "MIKE", label: "Mike", side: "strong" },
];

// Format target for display
function formatTargetDisplay(target?: BlockTarget, defensePlayer?: { label: string; role: string }): string {
  if (!target || target.type === "none") return "None";

  if (target.type === "player" && defensePlayer) {
    return `${defensePlayer.label || defensePlayer.role}`;
  }

  if (target.type === "landmark" && target.landmarkId) {
    // Format landmark ID like "3T_STRONG" to "3T (Strong)"
    const parts = target.landmarkId.split("_");
    if (parts.length >= 2) {
      const side = parts[parts.length - 1];
      const name = parts.slice(0, -1).join("_");
      return `${name} (${side.charAt(0)}${side.slice(1).toLowerCase()})`;
    }
    return target.landmarkId;
  }

  if (target.type === "gap" && target.gapName) {
    const parts = target.gapName.split("_");
    if (parts.length >= 2) {
      return `${parts[0]}-gap (${parts[1].charAt(0)}${parts[1].slice(1).toLowerCase()})`;
    }
    return target.gapName;
  }

  return "Custom";
}

const BLOCK_STYLES: { value: BlockStyle; label: string }[] = [
  { value: "zone_step", label: "Zone" },
  { value: "drive", label: "Drive" },
  { value: "reach", label: "Reach" },
  { value: "down", label: "Down" },
  { value: "pull_pass", label: "Pull/Pass" },
  { value: "combo", label: "Combo" },
];

const BLOCK_SCHEMES: { value: BlockScheme; label: string }[] = [
  { value: "zone_step", label: "Zone Step" },
  { value: "reach", label: "Reach" },
  { value: "combo", label: "Combo" },
  { value: "down", label: "Down" },
  { value: "kick", label: "Kick Out" },
  { value: "pull_lead", label: "Pull Lead" },
  { value: "pull_kick", label: "Pull Kick" },
  { value: "trap", label: "Trap" },
  { value: "wham", label: "Wham" },
  { value: "seal", label: "Seal" },
];

interface BlockHUDProps {
  visible: boolean;
  playerId: string | null;
  onClose: () => void;
}

export function BlockHUD({ visible, playerId, onClose }: BlockHUDProps) {
  const { play, updateAction, selectedActionId } = useEditorStore();

  const [angleDeg, setAngleDeg] = useState(0);
  const [scheme, setScheme] = useState<BlockScheme>("zone_step");
  const [style, setStyle] = useState<BlockStyle>("zone_step");
  const [snapEnabled, setSnapEnabled] = useState(true);

  // Get selected block action
  const blockAction = play?.actions.find(
    (a) => a.id === selectedActionId && a.actionType === "block"
  ) as BlockAction | undefined;

  // Get target defense player if targeting a specific player
  const targetDefensePlayer = useMemo(() => {
    if (!blockAction?.block.target?.playerId || !play) return undefined;
    return play.roster.players.find(
      (p) => p.id === blockAction.block.target?.playerId && p.unit === "defense"
    );
  }, [blockAction, play]);

  // Format current target for display
  const currentTargetDisplay = useMemo(() => {
    return formatTargetDisplay(blockAction?.block.target, targetDefensePlayer);
  }, [blockAction, targetDefensePlayer]);

  // Load current values from selected action
  React.useEffect(() => {
    if (blockAction && blockAction.actionType === "block") {
      setAngleDeg(blockAction.block.angleDeg || 0);
      setScheme(blockAction.block.scheme);
      setStyle(blockAction.block.style || "zone_step");
    }
  }, [blockAction]);

  const handleAngleChange = useCallback(
    (delta: number) => {
      let newAngle = (angleDeg + delta + 360) % 360;
      if (snapEnabled) {
        newAngle = snapAngle(newAngle, 15);
      }
      setAngleDeg(newAngle);

      if (selectedActionId && blockAction) {
        updateAction(selectedActionId, {
          block: {
            ...blockAction.block,
            angleDeg: newAngle,
          },
        });
      }
    },
    [angleDeg, snapEnabled, selectedActionId, blockAction, updateAction]
  );

  const handleSchemeChange = useCallback(
    (newScheme: BlockScheme) => {
      setScheme(newScheme);

      if (selectedActionId && blockAction) {
        updateAction(selectedActionId, {
          block: {
            ...blockAction.block,
            scheme: newScheme,
          },
        });
      }
    },
    [selectedActionId, blockAction, updateAction]
  );

  const handleStyleChange = useCallback(
    (newStyle: BlockStyle) => {
      setStyle(newStyle);

      if (selectedActionId && blockAction) {
        updateAction(selectedActionId, {
          block: {
            ...blockAction.block,
            style: newStyle,
          },
        });
      }
    },
    [selectedActionId, blockAction, updateAction]
  );

  // Set quick target (landmark-based)
  const handleQuickTarget = useCallback(
    (landmarkId: BlockLandmarkId) => {
      if (!selectedActionId || !blockAction) return;

      const newTarget: BlockTarget = {
        type: "landmark",
        landmarkId,
      };

      // When targeting landmark, force aim to center
      updateAction(selectedActionId, {
        block: {
          ...blockAction.block,
          target: newTarget,
          aim: { type: "center" },
        },
      });
    },
    [selectedActionId, blockAction, updateAction]
  );

  // Clear target
  const handleClearTarget = useCallback(() => {
    if (!selectedActionId || !blockAction) return;

    updateAction(selectedActionId, {
      block: {
        ...blockAction.block,
        target: { type: "none" },
      },
    });
  }, [selectedActionId, blockAction, updateAction]);

  // Apply preset to all OL
  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = BLOCK_PRESETS.find((p) => p.id === presetId);
      if (!preset || !play) return;

      // Find OL players and their block actions
      const olRoles = ["LT", "LG", "C", "RG", "RT"];

      preset.assignments.forEach((assignment) => {
        const player = play.roster.players.find(
          (p) => p.role === assignment.role && p.unit === "offense"
        );
        if (!player) return;

        const existingBlock = play.actions.find(
          (a) => a.actionType === "block" && a.fromPlayerId === player.id
        ) as BlockAction | undefined;

        if (existingBlock) {
          updateAction(existingBlock.id, {
            block: {
              ...existingBlock.block,
              scheme: assignment.scheme,
              style: assignment.style,
              angleDeg: assignment.angleDeg,
              notes: assignment.notes,
            },
          });
        }
      });
    },
    [play, updateAction]
  );

  if (!visible) return null;

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 bg-background border rounded-lg shadow-xl p-4 min-w-96">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">Block Settings</h4>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Target Display */}
      <div className="mb-4 p-2 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">Target</div>
          {blockAction?.block.target?.type !== "none" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleClearTarget}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant={blockAction?.block.target?.type === "none" ? "outline" : "default"}
            className={cn(
              "text-sm font-medium",
              blockAction?.block.target?.type === "landmark" && "bg-amber-500 hover:bg-amber-600",
              blockAction?.block.target?.type === "player" && "bg-blue-500 hover:bg-blue-600"
            )}
          >
            {currentTargetDisplay}
          </Badge>
          {blockAction?.block.aim?.type && blockAction.block.aim.type !== "center" && (
            <Badge variant="outline" className="text-xs">
              {blockAction.block.aim.type.replace("_", " ")}
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Target Chips */}
      <div className="mb-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">Quick Targets</div>
        <div className="flex flex-wrap gap-1">
          {QUICK_TARGETS.slice(0, 6).map((target) => (
            <Button
              key={target.id}
              variant={blockAction?.block.target?.landmarkId === target.id ? "secondary" : "outline"}
              size="sm"
              className={cn(
                "text-xs h-6 px-2",
                target.side === "strong" ? "border-green-500/50" : "border-orange-500/50"
              )}
              onClick={() => handleQuickTarget(target.id)}
            >
              {target.label}
              <span className="ml-1 text-[10px] text-muted-foreground">
                {target.side === "strong" ? "S" : "W"}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Auto OL Rules Presets */}
      <div className="mb-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">Auto OL Rules</div>
        <div className="flex flex-wrap gap-1">
          {BLOCK_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => applyPreset(preset.id)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Scheme & Style */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Scheme</div>
          <Select value={scheme} onValueChange={(v) => handleSchemeChange(v as BlockScheme)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BLOCK_SCHEMES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Style</div>
          <Select value={style} onValueChange={(v) => handleStyleChange(v as BlockStyle)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BLOCK_STYLES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Angle Control */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-muted-foreground">Angle</div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {angleDeg}°
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getAngleDescription(angleDeg)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleAngleChange(-15)}
          >
            [
          </Button>
          <div className="flex-1 flex items-center justify-center">
            {/* Visual angle indicator */}
            <div className="relative w-16 h-16 border-2 border-muted rounded-full">
              <div
                className="absolute top-1/2 left-1/2 w-6 h-0.5 bg-primary origin-left"
                style={{
                  transform: `rotate(${-angleDeg}deg) translateY(-50%)`,
                }}
              />
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleAngleChange(15)}
          >
            ]
          </Button>
        </div>
        <div className="flex items-center justify-center mt-2">
          <Button
            variant={snapEnabled ? "secondary" : "outline"}
            size="sm"
            className="text-xs h-6"
            onClick={() => setSnapEnabled(!snapEnabled)}
          >
            Snap {snapEnabled ? "ON" : "OFF"} (15°)
          </Button>
        </div>
      </div>

      {/* Help text */}
      <div className="text-xs text-muted-foreground border-t pt-2">
        <kbd className="px-1 bg-muted rounded">[ ]</kbd> ±15° &nbsp;
        <kbd className="px-1 bg-muted rounded">Shift</kbd> Snap &nbsp;
        <kbd className="px-1 bg-muted rounded">Alt</kbd> Lock target
      </div>
    </div>
  );
}
