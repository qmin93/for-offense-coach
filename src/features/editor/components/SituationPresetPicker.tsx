"use client";

// ============================================
// SituationPresetPicker - Quick context preset selection
// ============================================

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  SituationPreset,
  ScoutCardDown,
  ScoutCardDistance,
  HashPosition,
  FieldZone,
} from "@/domain/dsl/types";
import {
  useSituationPresets,
  formatPresetLabel,
  getPresetColor,
  type SituationContext,
} from "@/lib/situation-presets";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Clock,
  Star,
  Bookmark,
  Hash,
  X,
  Check,
  Trash2,
} from "lucide-react";

// ============================================
// Props
// ============================================

interface SituationPresetPickerProps {
  currentContext: SituationContext;
  onApply: (context: SituationContext) => void;
  className?: string;
  compact?: boolean;
}

// ============================================
// Preset Card Component
// ============================================

interface PresetCardProps {
  preset: SituationPreset;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

function PresetCard({ preset, isSelected, onSelect, onDelete, compact }: PresetCardProps) {
  const color = getPresetColor(preset);

  if (compact) {
    return (
      <button
        onClick={onSelect}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
          isSelected
            ? "ring-2 ring-offset-1 ring-offset-slate-900"
            : "hover:bg-slate-800"
        )}
        style={{
          backgroundColor: isSelected ? `${color}30` : "transparent",
          // @ts-expect-error CSS custom property
          "--tw-ring-color": color,
        }}
      >
        <span className="text-base">{preset.icon || "📌"}</span>
        <span className="text-sm text-white font-medium">{preset.name}</span>
        {isSelected && <Check className="w-4 h-4 ml-auto" style={{ color }} />}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border transition-all",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-slate-700 hover:border-slate-600"
      )}
    >
      <button
        onClick={onSelect}
        className="w-full p-3 text-left"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            {preset.icon || "📌"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white">{preset.name}</div>
            {preset.description && (
              <div className="text-xs text-slate-400 mt-0.5">{preset.description}</div>
            )}
            <div className="flex items-center gap-1 mt-2">
              <Badge
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {formatPresetLabel(preset)}
              </Badge>
              {preset.hash !== "M" && (
                <Badge variant="outline" className="text-xs">
                  {preset.hash === "L" ? "L Hash" : "R Hash"}
                </Badge>
              )}
              {preset.fieldZone && (
                <Badge variant="outline" className="text-xs">
                  {preset.fieldZone.replace("_", " ")}
                </Badge>
              )}
            </div>
          </div>
          {isSelected && (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>
      </button>
      {onDelete && !preset.isBuiltIn && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ============================================
// Create Preset Dialog
// ============================================

interface CreatePresetDialogProps {
  context: SituationContext;
  onSave: (name: string, options: { description?: string; icon?: string; color?: string }) => void;
  onClose: () => void;
}

function CreatePresetDialog({ context, onSave, onClose }: CreatePresetDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📌");
  const [color, setColor] = useState("#3B82F6");

  const icons = ["📌", "🎯", "💪", "⚡", "🔴", "🏈", "⏱️", "🛑", "⬅️", "➡️", "🔥", "✨"];
  const colors = ["#EF4444", "#F59E0B", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#06B6D4"];

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), { description: description.trim() || undefined, icon, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Save Preset</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Current context display */}
          <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg">
            <span className="text-sm text-slate-400">Saving:</span>
            <Badge variant="secondary">
              {context.down === "-" ? "-" : `${context.down}`}
              {context.distance === "-" ? "" : ` & ${context.distance}`}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {context.hash === "M" ? "Middle" : context.hash === "L" ? "L Hash" : "R Hash"}
            </Badge>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 3rd & Long vs Nickel"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={cn(
                    "w-8 h-8 rounded flex items-center justify-center text-lg transition-colors",
                    icon === i ? "bg-primary" : "bg-slate-800 hover:bg-slate-700"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded transition-all",
                    color === c && "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-700 bg-slate-800/50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Preset
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function SituationPresetPicker({
  currentContext,
  onApply,
  className,
  compact = false,
}: SituationPresetPickerProps) {
  const {
    recentPresets,
    builtInPresets,
    userPresets,
    createPreset,
    deletePreset,
    applyPreset,
  } = useSituationPresets();

  const [expanded, setExpanded] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"recent" | "builtin" | "custom">("recent");

  // Find current matching preset
  const currentPresetId = useMemo(() => {
    const all = [...builtInPresets, ...userPresets];
    const match = all.find(
      (p) =>
        p.down === currentContext.down &&
        p.distance === currentContext.distance &&
        p.hash === currentContext.hash
    );
    return match?.id;
  }, [currentContext, builtInPresets, userPresets]);

  const handleSelectPreset = (presetId: string) => {
    const context = applyPreset(presetId);
    if (context) {
      onApply(context);
    }
    if (compact) {
      setExpanded(false);
    }
  };

  const handleSavePreset = (
    name: string,
    options: { description?: string; icon?: string; color?: string }
  ) => {
    createPreset(name, currentContext, options);
  };

  const handleDeletePreset = (id: string) => {
    if (confirm("Delete this preset?")) {
      deletePreset(id);
    }
  };

  // Get presets for current tab
  const displayPresets = useMemo(() => {
    switch (activeTab) {
      case "recent":
        return recentPresets.length > 0 ? recentPresets : builtInPresets.slice(0, 6);
      case "builtin":
        return builtInPresets;
      case "custom":
        return userPresets;
      default:
        return [];
    }
  }, [activeTab, recentPresets, builtInPresets, userPresets]);

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        {/* Trigger button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
        >
          <Bookmark className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-white">Presets</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Dropdown */}
        {expanded && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Recent */}
            {recentPresets.length > 0 && (
              <div className="p-2 border-b border-slate-700">
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-2 px-1">
                  <Clock className="w-3 h-3" />
                  Recent
                </div>
                <div className="space-y-1">
                  {recentPresets.slice(0, 3).map((preset) => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      isSelected={preset.id === currentPresetId}
                      onSelect={() => handleSelectPreset(preset.id)}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All presets */}
            <div className="p-2 max-h-[300px] overflow-y-auto">
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-2 px-1">
                <Star className="w-3 h-3" />
                All Presets
              </div>
              <div className="space-y-1">
                {builtInPresets.slice(0, 8).map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    isSelected={preset.id === currentPresetId}
                    onSelect={() => handleSelectPreset(preset.id)}
                    compact
                  />
                ))}
              </div>
            </div>

            {/* Save current */}
            <div className="p-2 border-t border-slate-700">
              <button
                onClick={() => {
                  setShowCreateDialog(true);
                  setExpanded(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Save Current as Preset</span>
              </button>
            </div>
          </div>
        )}

        {/* Create dialog */}
        {showCreateDialog && (
          <CreatePresetDialog
            context={currentContext}
            onSave={handleSavePreset}
            onClose={() => setShowCreateDialog(false)}
          />
        )}
      </div>
    );
  }

  // Full panel view
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-blue-400" />
          Situation Presets
        </h3>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Save Current
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("recent")}
          className={cn(
            "flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors",
            activeTab === "recent"
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-white"
          )}
        >
          <Clock className="w-3 h-3 inline mr-1" />
          Recent
        </button>
        <button
          onClick={() => setActiveTab("builtin")}
          className={cn(
            "flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors",
            activeTab === "builtin"
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-white"
          )}
        >
          <Star className="w-3 h-3 inline mr-1" />
          Standard
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={cn(
            "flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors",
            activeTab === "custom"
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-white"
          )}
        >
          <Hash className="w-3 h-3 inline mr-1" />
          Custom
        </button>
      </div>

      {/* Presets grid */}
      <div className="space-y-2">
        {displayPresets.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            {activeTab === "custom" ? (
              <>
                <p>No custom presets yet</p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="text-blue-400 hover:underline mt-1"
                >
                  Create your first preset
                </button>
              </>
            ) : (
              <p>No recent presets</p>
            )}
          </div>
        ) : (
          displayPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isSelected={preset.id === currentPresetId}
              onSelect={() => handleSelectPreset(preset.id)}
              onDelete={!preset.isBuiltIn ? () => handleDeletePreset(preset.id) : undefined}
            />
          ))
        )}
      </div>

      {/* Create dialog */}
      {showCreateDialog && (
        <CreatePresetDialog
          context={currentContext}
          onSave={handleSavePreset}
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </div>
  );
}

export default SituationPresetPicker;
