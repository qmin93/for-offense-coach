"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePlaybookStore } from "@/features/playbook/store";
import { Button } from "@/components/ui";
import { PlayRenderer } from "@/domain/render/svg-renderer";
import { exportPlaybookToPdf, capturePlaySvgAsImage } from "@/lib/pdf-export";
import { toast } from "sonner";
import type { Play, ExportOverlayMode, OverlayDensity } from "@/domain/dsl/types";
import { ExportValidationDialog } from "@/features/playbook/components/ExportValidationDialog";
import { telemetry, startTimer, endTimer } from "@/lib/telemetry";

// Types for export overlay settings
interface ExportOverlaySettings {
  overlayMode: ExportOverlayMode;
  density: OverlayDensity;
  includeLegend: boolean;
}

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
    setExportSettings,
    isExporting,
    setExporting,
  } = usePlaybookStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  // Export overlay settings from the dialog
  const [exportOverlaySettings, setExportOverlaySettings] = useState<ExportOverlaySettings>({
    overlayMode: "both",
    density: "standard",
    includeLegend: false,
  });

  useEffect(() => {
    if (playbookId === "new") {
      initPlaybook("New Playbook");
    }
    // TODO: Load existing playbook from DB
  }, [playbookId, initPlaybook]);

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

    // Store overlay settings for rendering
    setExportOverlaySettings(overlaySettings);

    setExporting(true);
    setExportProgress(0);
    startTimer("pdf_export");

    try {
      // Wait for export container to render with new overlay settings
      // Using both setTimeout and requestAnimationFrame for reliability
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        }, 300);
      });

      // Capture each play's diagram
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

      // Generate PDF
      const pdfBlob = await exportPlaybookToPdf(
        {
          plays: allPlays.slice(0, 10), // Max 10 pages
          playbookName: playbook.name,
          settings: playbook.exportSettings,
          maxPages: 10,
        },
        diagramImages
      );

      setExportProgress(100);

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${playbook.name || "playbook"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      // Track successful export
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

      // Track failed export
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

  if (!playbook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← Back
            </Link>
            <input
              type="text"
              value={playbook.name}
              onChange={(e) => {
                // TODO: updateName
              }}
              className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowExportModal(true)}>
              Export PDF
            </Button>
            <Button variant="default">Share</Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Sections */}
        <div className="space-y-6">
          {playbook.sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">{section.name}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newName = prompt("Section name:", section.name);
                      if (newName) renameSection(section.id, newName);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => removeSection(section.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="p-4">
                {section.playIds.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No plays in this section</p>
                    <Link
                      href="/editor/new"
                      className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                    >
                      Create a play
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {section.playIds.map((playId) => {
                      const play = plays.get(playId);
                      if (!play) return null;
                      return (
                        <div
                          key={playId}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-video bg-gray-800">
                            <PlayRenderer play={play} />
                          </div>
                          <div className="p-2">
                            <div className="font-medium text-sm truncate">
                              {play.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {play.meta?.personnel} •{" "}
                              {play.meta?.formationId?.replace("formation_", "")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add section button */}
          <button
            onClick={() => {
              const name = prompt("Section name:");
              if (name) addSection(name);
            }}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            + Add Section
          </button>
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
          {getAllPlays().slice(0, 10).map((play, index) => {
            // Compute overlay visibility from export settings
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
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
