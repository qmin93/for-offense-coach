"use client";

import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import { useEditorStore } from "../store";
import {
  ROUTE_TEMPLATES_BY_CATEGORY,
  applyRouteTemplate,
  type RouteTemplate,
} from "@/domain/data/route-templates";
import type { RouteAction, Point } from "@/domain/dsl/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CategorySectionProps {
  title: string;
  templates: RouteTemplate[];
  isExpanded: boolean;
  onToggle: () => void;
  onSelectTemplate: (template: RouteTemplate) => void;
  selectedPlayerId: string | null;
}

function CategorySection({
  title,
  templates,
  isExpanded,
  onToggle,
  onSelectTemplate,
  selectedPlayerId,
}: CategorySectionProps) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/50 transition-colors"
      >
        <span className="text-sm font-medium capitalize">{title}</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="px-2 pb-2 grid grid-cols-2 gap-1">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              disabled={!selectedPlayerId}
              className={cn(
                "px-2 py-1.5 text-xs rounded border transition-all text-left",
                selectedPlayerId
                  ? "hover:bg-primary/10 hover:border-primary/50 cursor-pointer"
                  : "opacity-50 cursor-not-allowed",
                "bg-background border-border"
              )}
              title={template.description}
            >
              <div className="font-medium truncate">{template.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Mini route preview SVG
function RoutePreview({ template }: { template: RouteTemplate }) {
  const points = template.relativePoints;
  const scale = 80;
  const offsetX = 25;
  const offsetY = 5;

  // Build path
  const pathD = points.reduce((acc, point, i) => {
    const x = offsetX + point.x * scale;
    const y = offsetY + (0.5 - point.y) * scale;
    if (i === 0) return `M ${x} ${y}`;
    return `${acc} L ${x} ${y}`;
  }, "");

  return (
    <svg width="50" height="50" viewBox="0 0 50 50" className="flex-shrink-0">
      {/* Player dot */}
      <circle cx={offsetX} cy={offsetY + 0.5 * scale} r={4} fill="#1e40af" />
      {/* Route path */}
      <path
        d={pathD}
        fill="none"
        stroke="#fbbf24"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RouteTemplatesPanel() {
  const { play, selectedPlayerId, addAction, selectAction, setMode } = useEditorStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["quick", "intermediate"])
  );
  const [mirrorRoutes, setMirrorRoutes] = useState(false);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleSelectTemplate = (template: RouteTemplate) => {
    if (!play || !selectedPlayerId) return;

    const player = play.roster.players.find((p) => p.id === selectedPlayerId);
    if (!player) return;

    // Get player position
    const playerPos: Point = {
      x: player.alignment.x,
      y: player.alignment.y,
    };

    // Determine if we should mirror based on player position
    // Players on right side of field (x > 0.5) get mirrored routes by default for "inside" routes
    const shouldMirror =
      mirrorRoutes ||
      (template.defaultDirection === "inside" && playerPos.x > 0.5) ||
      (template.defaultDirection === "outside" && playerPos.x < 0.5);

    // Apply template to get absolute control points
    const controlPoints = applyRouteTemplate(template, playerPos, shouldMirror);

    // Create route action
    const routeAction: RouteAction = {
      id: `a_route_${uuid().slice(0, 8)}`,
      actionType: "route",
      fromPlayerId: selectedPlayerId,
      layer: "primary",
      route: {
        pattern: template.pattern,
        controlPoints,
        endMarker: "arrow",
        direction: template.defaultDirection,
      },
      timing: { phase: "post_snap" },
      style: { line: "solid", thickness: "normal" },
    };

    addAction(routeAction);
    selectAction(routeAction.id);
    setMode("select"); // Switch to select mode to edit the route
  };

  const selectedPlayer = play?.roster.players.find((p) => p.id === selectedPlayerId);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Route Templates</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {selectedPlayerId
            ? `Apply to: ${selectedPlayer?.label || selectedPlayer?.role}`
            : "Select a player first"}
        </p>
      </div>

      {/* Mirror toggle */}
      <div className="px-3 py-2 border-b border-border">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={mirrorRoutes}
            onChange={(e) => setMirrorRoutes(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-muted-foreground">Force mirror routes</span>
        </label>
      </div>

      {/* Template categories */}
      <div className="flex-1 overflow-y-auto">
        <CategorySection
          title="Quick (0-5 yds)"
          templates={ROUTE_TEMPLATES_BY_CATEGORY.quick}
          isExpanded={expandedCategories.has("quick")}
          onToggle={() => toggleCategory("quick")}
          onSelectTemplate={handleSelectTemplate}
          selectedPlayerId={selectedPlayerId}
        />
        <CategorySection
          title="Intermediate (6-15 yds)"
          templates={ROUTE_TEMPLATES_BY_CATEGORY.intermediate}
          isExpanded={expandedCategories.has("intermediate")}
          onToggle={() => toggleCategory("intermediate")}
          onSelectTemplate={handleSelectTemplate}
          selectedPlayerId={selectedPlayerId}
        />
        <CategorySection
          title="Deep (16+ yds)"
          templates={ROUTE_TEMPLATES_BY_CATEGORY.deep}
          isExpanded={expandedCategories.has("deep")}
          onToggle={() => toggleCategory("deep")}
          onSelectTemplate={handleSelectTemplate}
          selectedPlayerId={selectedPlayerId}
        />
        <CategorySection
          title="Special"
          templates={ROUTE_TEMPLATES_BY_CATEGORY.special}
          isExpanded={expandedCategories.has("special")}
          onToggle={() => toggleCategory("special")}
          onSelectTemplate={handleSelectTemplate}
          selectedPlayerId={selectedPlayerId}
        />
      </div>

      {/* Help text */}
      <div className="px-3 py-2 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Click a template to add route to selected player. Routes auto-mirror based on field
          position.
        </p>
      </div>
    </div>
  );
}
