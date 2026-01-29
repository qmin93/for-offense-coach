"use client";

// ============================================
// Playbook Page - Enhanced with sections, drag-drop, tags
// ============================================

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePlaybookStore } from "@/features/playbook/store";
import { Button } from "@/components/ui";
import { PlayRenderer } from "@/domain/render/svg-renderer";
import { exportPlaybookToPdf, capturePlaySvgAsImage } from "@/lib/pdf-export";
import { toast } from "sonner";
import type { Play, ExportOverlayMode, OverlayDensity, PlaySituationTag, PlaybookSectionType } from "@/domain/dsl/types";
import { SECTION_COLORS } from "@/domain/dsl/types";
import { ExportValidationDialog } from "@/features/playbook/components/ExportValidationDialog";
import { PlaybookSectionCard } from "@/features/playbook/components/PlaybookSectionCard";
import { PlaybookFilters } from "@/features/playbook/components/PlaybookFilters";
import { PlaybookOverview } from "@/features/playbook/components/PlaybookOverview";
import { telemetry, startTimer, endTimer } from "@/lib/telemetry";
import {
  ArrowLeft,
  Plus,
  Share2,
  FileDown,
  BarChart3,
  ChevronDown,
  Layers,
} from "lucide-react";

// Types for export overlay settings
interface ExportOverlaySettings {
  overlayMode: ExportOverlayMode;
  density: OverlayDensity;
  includeLegend: boolean;
}

// Section type options for add section dialog
const SECTION_TYPE_OPTIONS: Array<{ type: PlaybookSectionType; label: string }> = [
  { type: "install", label: "Install Day" },
  { type: "run", label: "Run Game" },
  { type: "pass", label: "Pass Game" },
  { type: "rpo", label: "RPO" },
  { type: "screen", label: "Screens" },
  { type: "gadget", label: "Gadgets" },
  { type: "redzone", label: "Red Zone" },
  { type: "goalline", label: "Goal Line" },
  { type: "2minute", label: "2-Minute" },
  { type: "custom", label: "Custom" },
];

export default function PlaybookPage() {
  const params = useParams();
  const playbookId = params.playbookId as string;

  const {
    playbook,
    plays,
    initPlaybook,
    addSection,
    renameSection,
    removeSection,
    toggleSectionCollapse,
    setSectionColor,
    removePlayFromSection,
    addTagToPlay,
    removeTagFromPlay,
    setExportSettings,
    isExporting,
    setExporting,
    activeFilterTags,
    searchQuery,
    setActiveFilterTags,
    toggleFilterTag,
    setSearchQuery,
    clearFilters,
    setViewMode,
    getPlaybookStats,
  } = usePlaybookStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionType, setNewSectionType] = useState<PlaybookSectionType>("custom");
  const [showOverview, setShowOverview] = useState(false);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  // Export overlay settings from the dialog
  const [exportOverlaySettings, setExportOverlaySettings] = useState<ExportOverlaySettings>({
    overlayMode: "both",
    density: "standard",
    includeLegend: false,
  });

  useEffect(() => {
    if (playbookId === "new") {
      initPlaybook("New Playbook", "default");
    }
    // TODO: Load existing playbook from DB
  }, [playbookId, initPlaybook]);

  // Get stats
  const stats = useMemo(() => getPlaybookStats(), [getPlaybookStats, playbook, plays]);

  // Calculate filtered plays count
  const filteredPlaysCount = useMemo(() => {
    if (!playbook) return 0;
    let count = 0;
    playbook.sections.forEach((section) => {
      section.playIds.forEach((playId) => {
        const play = plays.get(playId);
        if (!play) return;

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesName = play.name.toLowerCase().includes(query);
          const matchesConcept = play.meta?.conceptId?.toLowerCase().includes(query);
          if (!matchesName && !matchesConcept) return;
        }

        // Tag filter
        if (activeFilterTags.length > 0) {
          const playTags = (play.tags || []) as PlaySituationTag[];
          const hasMatchingTag = activeFilterTags.some((tag) => playTags.includes(tag));
          if (!hasMatchingTag) return;
        }

        count++;
      });
    });
    return count;
  }, [playbook, plays, searchQuery, activeFilterTags]);

  // Get all plays from all sections
  const getAllPlays = useCallback((): Play[] => {
    if (!playbook) return [];
    const allPlays: Play[] = [];
    playbook.sections.forEach((section) => {
      section.playIds.forEach((playId) => {
        const play = plays.get(playId);
        if (play) allPlays.push(play);
      });
    });
    return allPlays;
  }, [playbook, plays]);

  const handleExportPdf = async (overlaySettings: ExportOverlaySettings) => {
    if (!playbook) return;

    const allPlays = getAllPlays();
    if (allPlays.length === 0) {
      toast.error("No plays to export");
      return;
    }

    setExportOverlaySettings(overlaySettings);
    setExporting(true);
    setExportProgress(0);
    startTimer("pdf_export");

    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        }, 300);
      });

      const diagramImages: (string | null)[] = [];
      const container = exportContainerRef.current;

      if (container) {
        const playContainers = container.querySelectorAll("[data-play-export]");
        for (let i = 0; i < playContainers.length; i++) {
          const playContainer = playContainers[i] as HTMLElement;
          const image = await capturePlaySvgAsImage(playContainer);
          diagramImages.push(image);
          setExportProgress(Math.round(((i + 1) / playContainers.length) * 80));
        }
      }

      setExportProgress(90);

      const pdfBlob = await exportPlaybookToPdf(
        {
          plays: allPlays.slice(0, 10),
          playbookName: playbook.name,
          settings: playbook.exportSettings,
          maxPages: 10,
        },
        diagramImages
      );

      setExportProgress(100);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${playbook.name || "playbook"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      const timeMs = endTimer("pdf_export");
      telemetry.exportPdf({
        playbookId: playbook.id,
        pages: Math.min(allPlays.length, 10),
        style: playbook.exportSettings?.pageStyle || "classic",
        timeMs,
        success: true,
        blocked: false,
      });

      toast.success("PDF exported successfully!");
      setShowExportModal(false);
    } catch (error) {
      console.error("PDF export failed:", error);

      const timeMs = endTimer("pdf_export");
      telemetry.exportPdf({
        playbookId: playbook.id,
        pages: Math.min(allPlays.length, 10),
        style: playbook.exportSettings?.pageStyle || "classic",
        timeMs,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    addSection(newSectionName.trim(), newSectionType);
    setNewSectionName("");
    setNewSectionType("custom");
    setShowAddSection(false);
    toast.success("Section added");
  };

  if (!playbook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  const viewMode = playbook.viewMode || "grid";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <input
                type="text"
                value={playbook.name}
                onChange={() => {
                  // TODO: updateName
                }}
                className="text-xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 -ml-2"
              />
              <p className="text-xs text-slate-500 ml-2">
                {stats.totalPlays} plays • {stats.totalSections} sections
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOverview(!showOverview)}
              className={showOverview ? "text-blue-400" : ""}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="default" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Overview (collapsible) */}
        {showOverview && <PlaybookOverview stats={stats} isExpanded={true} />}

        {/* Filters */}
        <PlaybookFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilterTags={activeFilterTags}
          onToggleTag={toggleFilterTag}
          onClearFilters={clearFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalPlays={stats.totalPlays}
          filteredPlays={filteredPlaysCount}
        />

        {/* Sections */}
        <div className="space-y-4">
          {playbook.sections.map((section) => (
            <PlaybookSectionCard
              key={section.id}
              section={section}
              plays={plays}
              viewMode={viewMode}
              activeFilterTags={activeFilterTags}
              searchQuery={searchQuery}
              onToggleCollapse={() => toggleSectionCollapse(section.id)}
              onRename={(name) => renameSection(section.id, name)}
              onRemove={() => {
                if (confirm(`Delete section "${section.name}"?`)) {
                  removeSection(section.id);
                  toast.success("Section deleted");
                }
              }}
              onSetColor={(color) => setSectionColor(section.id, color)}
              onRemovePlay={(playId) => {
                removePlayFromSection(section.id, playId);
                toast.success("Play removed from section");
              }}
              onAddTagToPlay={(playId, tag) => addTagToPlay(playId, tag)}
              onRemoveTagFromPlay={(playId, tag) => removeTagFromPlay(playId, tag)}
            />
          ))}

          {/* Add section button */}
          {showAddSection ? (
            <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
              <h3 className="text-sm font-medium text-white mb-3">Add New Section</h3>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Section name..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSection();
                    if (e.key === "Escape") setShowAddSection(false);
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {SECTION_TYPE_OPTIONS.map(({ type, label }) => (
                    <button
                      key={type}
                      onClick={() => {
                        setNewSectionType(type);
                        if (!newSectionName) setNewSectionName(label);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        newSectionType === type
                          ? "text-white"
                          : "text-slate-400 hover:text-white bg-slate-800"
                      }`}
                      style={{
                        backgroundColor:
                          newSectionType === type ? SECTION_COLORS[type] : undefined,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowAddSection(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddSection}
                    disabled={!newSectionName.trim()}
                  >
                    Add Section
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSection(true)}
              className="w-full py-4 border-2 border-dashed border-slate-700 rounded-lg text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Section
            </button>
          )}
        </div>
      </div>

      {/* Export Validation Dialog */}
      <ExportValidationDialog
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportPdf}
        playbook={playbook}
        plays={plays}
        isExporting={isExporting}
        exportProgress={exportProgress}
      />

      {/* Hidden container for rendering plays during export */}
      {showExportModal && (
        <div
          ref={exportContainerRef}
          className="fixed top-0 left-[-9999px] w-[800px]"
          aria-hidden="true"
        >
          {getAllPlays()
            .slice(0, 10)
            .map((play, index) => {
              const showDefenseLabels =
                exportOverlaySettings.overlayMode === "defense" ||
                exportOverlaySettings.overlayMode === "both";
              const showLandmarks =
                exportOverlaySettings.overlayMode === "landmarks" ||
                exportOverlaySettings.overlayMode === "both";

              return (
                <div
                  key={play.id}
                  data-play-export={index}
                  className="w-[800px] h-[600px]"
                >
                  <PlayRenderer
                    play={play}
                    showDefense={true}
                    showDefenseLabels={showDefenseLabels}
                    showLandmarks={showLandmarks}
                    overlayDensity={exportOverlaySettings.density}
                    useCollisionAvoidance={showDefenseLabels && showLandmarks}
                    showLegend={exportOverlaySettings.includeLegend}
                  />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
