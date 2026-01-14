"use client";

import React from "react";
import { useEditorStore } from "../store";
import { FORMATIONS } from "@/domain/engine/formations";

export function FormationPanel() {
  const { applyFormation, play } = useEditorStore();
  const currentFormationId = play?.meta?.formationId;

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Formations</h3>
      <div className="grid grid-cols-1 gap-2">
        {FORMATIONS.map((formation) => (
          <button
            key={formation.id}
            onClick={() => applyFormation(formation)}
            className={`p-3 text-left rounded-lg border transition-colors ${
              currentFormationId === formation.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="font-medium text-sm">{formation.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {formation.meta?.structure} • {formation.meta?.personnelHint?.join("/")}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
