// ============================================
// Clipboard Hook for Copy/Paste in Editor
// Supports: players + actions (routes, blocks, motion, text)
// ============================================

import { useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import type {
  Player,
  Action,
  Point,
  RouteAction,
  BlockAction,
  MotionAction,
  TextAction,
  LandmarkAction,
} from "@/domain/dsl/types";
import { deepClone } from "@/lib/immutable";

// ============================================
// Types
// ============================================

export interface ClipboardData {
  type: "players" | "actions" | "mixed";
  players: Player[];
  actions: Action[];
  copiedAt: number;
}

// Storage key for cross-tab clipboard sync
const CLIPBOARD_KEY = "foroffense_clipboard";

// Paste offset to prevent exact overlap
const PASTE_OFFSET: Point = { x: 0.02, y: 0.02 };

// ============================================
// Hook
// ============================================

export interface UseClipboardOptions {
  onCopy?: (data: ClipboardData) => void;
  onPaste?: (data: ClipboardData) => void;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [pasteCount, setPasteCount] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CLIPBOARD_KEY);
      if (stored) {
        const data = JSON.parse(stored) as ClipboardData;
        // Only use if copied within last 30 minutes
        if (Date.now() - data.copiedAt < 30 * 60 * 1000) {
          setClipboard(data);
        }
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Copy players and/or actions
  const copy = useCallback((
    players: Player[],
    actions: Action[]
  ) => {
    if (players.length === 0 && actions.length === 0) return;

    const type: ClipboardData["type"] =
      players.length > 0 && actions.length > 0 ? "mixed" :
      players.length > 0 ? "players" : "actions";

    const data: ClipboardData = {
      type,
      players: deepClone(players),
      actions: deepClone(actions),
      copiedAt: Date.now(),
    };

    setClipboard(data);
    setPasteCount(0);

    // Store in localStorage for cross-tab support
    try {
      localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }

    options.onCopy?.(data);
  }, [options]);

  // Helper to offset a point
  const offsetPoint = (point: Point, offset: Point): Point => ({
    x: point.x + offset.x,
    y: point.y + offset.y,
  });

  // Paste with offset and new IDs
  const paste = useCallback((): { players: Player[]; actions: Action[] } | null => {
    if (!clipboard) return null;

    // Calculate cumulative offset for multiple pastes
    const offset: Point = {
      x: PASTE_OFFSET.x * (pasteCount + 1),
      y: PASTE_OFFSET.y * (pasteCount + 1),
    };

    // Map old player IDs to new ones
    const playerIdMap = new Map<string, string>();

    // Clone players with new IDs and offset positions
    const pastedPlayers: Player[] = clipboard.players.map((player) => {
      const newId = uuid();
      playerIdMap.set(player.id, newId);

      return {
        ...deepClone(player),
        id: newId,
        alignment: {
          ...player.alignment,
          x: player.alignment.x + offset.x,
          y: player.alignment.y + offset.y,
        },
      };
    });

    // Clone actions with new IDs and updated player references
    const pastedActions: Action[] = clipboard.actions.map((action): Action => {
      const newId = uuid();

      // Update player reference if player was also copied
      const fromPlayerId = action.fromPlayerId
        ? playerIdMap.get(action.fromPlayerId) || action.fromPlayerId
        : undefined;

      // Handle each action type
      switch (action.actionType) {
        case "route": {
          const routeAction = action as RouteAction;
          const newRoute = deepClone(routeAction.route);

          // Offset route control points
          if (newRoute.controlPoints && newRoute.controlPoints.length > 0) {
            newRoute.controlPoints = newRoute.controlPoints.map((pt: Point) => offsetPoint(pt, offset));
          }
          if (newRoute.curveControl) {
            newRoute.curveControl = offsetPoint(newRoute.curveControl, offset);
          }

          return {
            ...routeAction,
            id: newId,
            fromPlayerId,
            route: newRoute,
          };
        }

        case "block": {
          const blockAction = action as BlockAction;
          const newBlock = deepClone(blockAction.block);

          // Offset block target landmark if present
          if (newBlock.target?.landmark) {
            newBlock.target = {
              ...newBlock.target,
              landmark: offsetPoint(newBlock.target.landmark, offset),
            };
          }
          // Offset path points
          if (newBlock.pathPoints && newBlock.pathPoints.length > 0) {
            newBlock.pathPoints = newBlock.pathPoints.map((pt: Point) => offsetPoint(pt, offset));
          }

          return {
            ...blockAction,
            id: newId,
            fromPlayerId,
            block: newBlock,
          };
        }

        case "motion": {
          const motionAction = action as MotionAction;
          const newMotion = deepClone(motionAction.motion);

          // Offset motion path points
          if (newMotion.pathPoints && newMotion.pathPoints.length > 0) {
            newMotion.pathPoints = newMotion.pathPoints.map((pt: Point) => offsetPoint(pt, offset));
          }
          if (newMotion.endAlignment) {
            newMotion.endAlignment = offsetPoint(newMotion.endAlignment, offset);
          }
          if (newMotion.curveControl) {
            newMotion.curveControl = offsetPoint(newMotion.curveControl, offset);
          }

          return {
            ...motionAction,
            id: newId,
            fromPlayerId,
            motion: newMotion,
          };
        }

        case "text": {
          const textAction = action as TextAction;
          const newText = deepClone(textAction.text);

          // Offset text position
          newText.x = newText.x + offset.x;
          newText.y = newText.y + offset.y;

          return {
            ...textAction,
            id: newId,
            fromPlayerId,
            text: newText,
          };
        }

        case "landmark": {
          const landmarkAction = action as LandmarkAction;
          const newLandmark = deepClone(landmarkAction.landmark);

          // Offset landmark position
          newLandmark.x = newLandmark.x + offset.x;
          newLandmark.y = newLandmark.y + offset.y;

          return {
            ...landmarkAction,
            id: newId,
            fromPlayerId,
            landmark: newLandmark,
          };
        }

        default: {
          // Return as-is with new ID (shouldn't reach here with current Action union)
          const actionCopy = deepClone(action) as Record<string, unknown>;
          return {
            ...actionCopy,
            id: newId,
            fromPlayerId,
          } as Action;
        }
      }
    });

    setPasteCount((c) => c + 1);

    const result = { players: pastedPlayers, actions: pastedActions };
    options.onPaste?.({ ...clipboard, players: pastedPlayers, actions: pastedActions });

    return result;
  }, [clipboard, pasteCount, options]);

  // Check if clipboard has content
  const hasContent = clipboard !== null;

  // Clear clipboard
  const clear = useCallback(() => {
    setClipboard(null);
    setPasteCount(0);
    try {
      localStorage.removeItem(CLIPBOARD_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    clipboard,
    hasContent,
    copy,
    paste,
    clear,
    pasteCount,
  };
}
