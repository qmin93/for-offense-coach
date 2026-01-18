"use client";

// ============================================
// PlaybookFilters - Search and tag filters
// ============================================

import React from "react";
import { cn } from "@/lib/utils";
import { PLAY_TAG_INFO, type PlaySituationTag } from "@/domain/dsl/types";
import {
  Search,
  X,
  Filter,
  Grid3X3,
  List,
  LayoutList,
  ChevronDown,
} from "lucide-react";

// ============================================
// Props
// ============================================

interface PlaybookFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilterTags: PlaySituationTag[];
  onToggleTag: (tag: PlaySituationTag) => void;
  onClearFilters: () => void;
  viewMode: "grid" | "list" | "compact";
  onViewModeChange: (mode: "grid" | "list" | "compact") => void;
  totalPlays: number;
  filteredPlays: number;
}

// ============================================
// Component
// ============================================

export function PlaybookFilters({
  searchQuery,
  onSearchChange,
  activeFilterTags,
  onToggleTag,
  onClearFilters,
  viewMode,
  onViewModeChange,
  totalPlays,
  filteredPlays,
}: PlaybookFiltersProps) {
  const [showAllTags, setShowAllTags] = React.useState(false);

  const hasFilters = searchQuery || activeFilterTags.length > 0;

  // Grouped tags for better organization
  const tagGroups = [
    {
      label: "Situation",
      tags: ["short_yardage", "long_yardage", "red_zone", "goal_line", "backed_up", "2_minute", "opening_script"],
    },
    {
      label: "vs Defense",
      tags: ["vs_even", "vs_odd", "vs_man", "vs_zone", "vs_blitz"],
    },
    {
      label: "Style",
      tags: ["motion", "no_huddle", "check_with_me"],
    },
  ];

  return (
    <div className="space-y-3">
      {/* Search and view controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search plays..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewMode === "grid" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            )}
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewMode === "list" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            )}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("compact")}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewMode === "compact" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            )}
            title="Compact view"
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowAllTags(!showAllTags)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
            activeFilterTags.length > 0
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">
            {activeFilterTags.length > 0 ? `${activeFilterTags.length} filters` : "Filters"}
          </span>
          <ChevronDown
            className={cn("w-4 h-4 transition-transform", showAllTags && "rotate-180")}
          />
        </button>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-slate-400 hover:text-white"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active filter tags */}
      {activeFilterTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Active:</span>
          {activeFilterTags.map((tag) => {
            const info = PLAY_TAG_INFO.find((t) => t.tag === tag);
            if (!info) return null;
            return (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs hover:opacity-80"
                style={{ backgroundColor: `${info.color}30`, color: info.color }}
              >
                {info.label}
                <X className="w-3 h-3" />
              </button>
            );
          })}
        </div>
      )}

      {/* Expanded tag picker */}
      {showAllTags && (
        <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
          {tagGroups.map((group) => (
            <div key={group.label}>
              <h4 className="text-xs font-medium text-slate-400 mb-2">{group.label}</h4>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tagKey) => {
                  const info = PLAY_TAG_INFO.find((t) => t.tag === tagKey);
                  if (!info) return null;
                  const isActive = activeFilterTags.includes(info.tag);
                  return (
                    <button
                      key={info.tag}
                      onClick={() => onToggleTag(info.tag)}
                      className={cn(
                        "px-2 py-1 rounded text-xs transition-all",
                        isActive
                          ? "ring-2 ring-offset-1 ring-offset-slate-900"
                          : "hover:opacity-80"
                      )}
                      style={{
                        backgroundColor: isActive ? info.color : `${info.color}20`,
                        color: isActive ? "#fff" : info.color,
                        // @ts-expect-error CSS custom property for ring color
                        "--tw-ring-color": isActive ? info.color : undefined,
                      }}
                    >
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results count */}
      {hasFilters && (
        <div className="text-xs text-slate-400">
          Showing {filteredPlays} of {totalPlays} plays
        </div>
      )}
    </div>
  );
}

export default PlaybookFilters;
