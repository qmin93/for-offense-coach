"use client";

// ============================================
// PlaybookSectionCard - Collapsible section with drag-drop plays
// ============================================

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PlayRenderer } from "@/domain/render/svg-renderer";
import { Badge } from "@/components/ui/badge";
import {
  SECTION_COLORS,
  PLAY_TAG_INFO,
  type PlaybookSection,
  type Play,
  type PlaySituationTag,
} from "@/domain/dsl/types";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  MoreVertical,
  Edit2,
  Trash2,
  Palette,
  Plus,
  X,
} from "lucide-react";

// ============================================
// Props
// ============================================

interface PlaybookSectionCardProps {
  section: PlaybookSection;
  plays: Map<string, Play>;
  viewMode: "grid" | "list" | "compact";
  activeFilterTags: PlaySituationTag[];
  searchQuery: string;
  onToggleCollapse: () => void;
  onRename: (name: string) => void;
  onRemove: () => void;
  onSetColor: (color: string) => void;
  onRemovePlay: (playId: string) => void;
  onAddTagToPlay: (playId: string, tag: PlaySituationTag) => void;
  onRemoveTagFromPlay: (playId: string, tag: PlaySituationTag) => void;
  // Drag handlers (for future react-dnd integration)
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

// ============================================
// Play Card Component
// ============================================

interface PlayCardProps {
  play: Play;
  viewMode: "grid" | "list" | "compact";
  onRemove: () => void;
  onAddTag: (tag: PlaySituationTag) => void;
  onRemoveTag: (tag: PlaySituationTag) => void;
}

function PlayCard({ play, viewMode, onRemove, onAddTag, onRemoveTag }: PlayCardProps) {
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const playTags = (play.tags || []) as PlaySituationTag[];

  if (viewMode === "compact") {
    return (
      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group">
        <GripVertical className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 cursor-grab" />
        <Link href={`/editor/${play.id}`} className="flex-1 min-w-0">
          <span className="text-sm font-medium text-white truncate block">{play.name}</span>
        </Link>
        <div className="flex items-center gap-1">
          {playTags.slice(0, 2).map((tag) => {
            const info = PLAY_TAG_INFO.find((t) => t.tag === tag);
            return info ? (
              <span
                key={tag}
                className="text-[10px] px-1 py-0.5 rounded"
                style={{ backgroundColor: `${info.color}20`, color: info.color }}
              >
                {info.shortLabel}
              </span>
            ) : null;
          })}
          {playTags.length > 2 && (
            <span className="text-[10px] text-slate-400">+{playTags.length - 2}</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group">
        <GripVertical className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 cursor-grab" />
        <div className="w-20 h-14 bg-slate-900 rounded overflow-hidden flex-shrink-0">
          <PlayRenderer play={play} />
        </div>
        <Link href={`/editor/${play.id}`} className="flex-1 min-w-0">
          <div className="font-medium text-white">{play.name}</div>
          <div className="text-xs text-slate-400">
            {play.meta?.personnel} • {play.meta?.formationId?.replace("formation_", "")}
          </div>
        </Link>
        <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
          {playTags.map((tag) => {
            const info = PLAY_TAG_INFO.find((t) => t.tag === tag);
            return info ? (
              <button
                key={tag}
                onClick={() => onRemoveTag(tag)}
                className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 hover:opacity-80"
                style={{ backgroundColor: `${info.color}20`, color: info.color }}
              >
                {info.shortLabel}
                <X className="w-2 h-2" />
              </button>
            ) : null;
          })}
          <button
            onClick={() => setShowTagPicker(!showTagPicker)}
            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 hover:bg-slate-600"
          >
            + Tag
          </button>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors group relative">
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4 text-white/50 cursor-grab" />
      </div>
      <Link href={`/editor/${play.id}`}>
        <div className="aspect-video bg-slate-900">
          <PlayRenderer play={play} />
        </div>
      </Link>
      <div className="p-2 bg-slate-800/50">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-white truncate">{play.name}</div>
            <div className="text-xs text-slate-400">
              {play.meta?.personnel} • {play.meta?.formationId?.replace("formation_", "")}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-500 hover:text-white"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1 min-w-[120px]">
                <button
                  onClick={() => {
                    setShowTagPicker(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-slate-700"
                >
                  Add Tag
                </button>
                <button
                  onClick={() => {
                    onRemove();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-slate-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {playTags.map((tag) => {
            const info = PLAY_TAG_INFO.find((t) => t.tag === tag);
            return info ? (
              <button
                key={tag}
                onClick={() => onRemoveTag(tag)}
                className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 hover:opacity-80"
                style={{ backgroundColor: `${info.color}20`, color: info.color }}
              >
                {info.shortLabel}
                <X className="w-2 h-2" />
              </button>
            ) : null;
          })}
        </div>
      </div>
      {/* Tag picker popover */}
      {showTagPicker && (
        <div className="absolute inset-x-0 bottom-full mb-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 p-2 max-h-[200px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-1">
            {PLAY_TAG_INFO.filter((t) => !playTags.includes(t.tag)).map((info) => (
              <button
                key={info.tag}
                onClick={() => {
                  onAddTag(info.tag);
                  setShowTagPicker(false);
                }}
                className="text-xs px-2 py-1 rounded text-left hover:opacity-80"
                style={{ backgroundColor: `${info.color}15`, color: info.color }}
              >
                {info.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function PlaybookSectionCard({
  section,
  plays,
  viewMode,
  activeFilterTags,
  searchQuery,
  onToggleCollapse,
  onRename,
  onRemove,
  onSetColor,
  onRemovePlay,
  onAddTagToPlay,
  onRemoveTagFromPlay,
  dragHandleProps,
  isDragging,
}: PlaybookSectionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);

  const sectionColor = section.color || SECTION_COLORS[section.sectionType];

  // Filter plays based on tags and search
  const filteredPlayIds = useMemo(() => {
    return section.playIds.filter((playId) => {
      const play = plays.get(playId);
      if (!play) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = play.name.toLowerCase().includes(query);
        const matchesConcept = play.meta?.conceptId?.toLowerCase().includes(query);
        if (!matchesName && !matchesConcept) return false;
      }

      // Tag filter
      if (activeFilterTags.length > 0) {
        const playTags = (play.tags || []) as PlaySituationTag[];
        const hasMatchingTag = activeFilterTags.some((tag) => playTags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [section.playIds, plays, searchQuery, activeFilterTags]);

  const handleSaveRename = () => {
    if (editName.trim() && editName !== section.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "bg-slate-900 rounded-lg border transition-all",
        isDragging ? "opacity-50 border-primary" : "border-slate-700"
      )}
    >
      {/* Section Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: `${sectionColor}30` }}
      >
        {/* Drag handle */}
        <div {...dragHandleProps} className="cursor-grab">
          <GripVertical className="w-4 h-4 text-slate-500" />
        </div>

        {/* Color indicator */}
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: sectionColor }}
        />

        {/* Section name */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveRename();
              if (e.key === "Escape") setIsEditing(false);
            }}
            className="flex-1 bg-transparent border-b border-primary text-white text-lg font-semibold focus:outline-none"
            autoFocus
          />
        ) : (
          <h2 className="flex-1 text-lg font-semibold text-white">{section.name}</h2>
        )}

        {/* Play count */}
        <Badge variant="secondary" className="text-xs">
          {filteredPlayIds.length}
          {filteredPlayIds.length !== section.playIds.length && (
            <span className="text-slate-500 ml-1">/ {section.playIds.length}</span>
          )}
        </Badge>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="p-1 text-slate-400 hover:text-white transition-colors"
        >
          {section.collapsed ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </button>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1 min-w-[140px]">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                Change Color
              </button>
              <hr className="my-1 border-slate-700" />
              <button
                onClick={() => {
                  onRemove();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Section
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section Content */}
      {!section.collapsed && (
        <div className="p-4">
          {filteredPlayIds.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              {section.playIds.length === 0 ? (
                <>
                  <p>No plays in this section</p>
                  <Link
                    href="/editor/new"
                    className="text-blue-400 hover:underline text-sm mt-2 inline-flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Create a play
                  </Link>
                </>
              ) : (
                <p>No plays match current filters</p>
              )}
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "grid" && "grid grid-cols-3 gap-4",
                viewMode === "list" && "flex flex-col gap-2",
                viewMode === "compact" && "flex flex-col gap-1"
              )}
            >
              {filteredPlayIds.map((playId) => {
                const play = plays.get(playId);
                if (!play) return null;
                return (
                  <PlayCard
                    key={playId}
                    play={play}
                    viewMode={viewMode}
                    onRemove={() => onRemovePlay(playId)}
                    onAddTag={(tag) => onAddTagToPlay(playId, tag)}
                    onRemoveTag={(tag) => onRemoveTagFromPlay(playId, tag)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PlaybookSectionCard;
