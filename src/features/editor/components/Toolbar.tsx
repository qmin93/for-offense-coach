"use client";

import React from "react";
import { useEditorStore, EditorMode } from "../store";
import { Button } from "@/components/ui";

const MODES: { mode: EditorMode; label: string; icon: string }[] = [
  { mode: "select", label: "Select", icon: "↖" },
  { mode: "route", label: "Route", icon: "↗" },
  { mode: "block", label: "Block", icon: "→" },
  { mode: "motion", label: "Motion", icon: "↔" },
  { mode: "text", label: "Text", icon: "T" },
];

export function Toolbar() {
  const { mode, setMode, undo, redo, canUndo, canRedo, toggleSuggestions } =
    useEditorStore();

  return (
    <div className="flex items-center gap-2 p-2 bg-white border-b">
      {/* Mode buttons */}
      <div className="flex items-center gap-1 border-r pr-2">
        {MODES.map((m) => (
          <button
            key={m.mode}
            onClick={() => setMode(m.mode)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              mode === m.mode
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title={m.label}
          >
            <span className="mr-1">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 border-r pr-2">
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="px-2 py-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          ↩
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="px-2 py-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          title="Redo (Ctrl+Y)"
        >
          ↪
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleSuggestions("pass")}
        >
          Pass Suggestions
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleSuggestions("run")}
        >
          Run Suggestions
        </Button>
      </div>
    </div>
  );
}
