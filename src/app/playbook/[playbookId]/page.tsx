"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePlaybookStore } from "@/features/playbook/store";
import { Button } from "@/components/ui";
import { PlayRenderer } from "@/domain/render/svg-renderer";
import { exportPlaybookToPdf, capturePlaySvgAsImage } from "@/lib/pdf-export";
import { toast } from "sonner";
import type { Play } from "@/domain/dsl/types";

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

  const handleExportPdf = async () => {
    if (!playbook) return;

    const allPlays = getAllPlays();
    if (allPlays.length === 0) {
      toast.error("No plays to export");
      return;
    }

    setExporting(true);
    setExportProgress(0);

    try {
      // Wait for export container to render
      await new Promise((resolve) => setTimeout(resolve, 500));

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

      toast.success("PDF exported successfully!");
      setShowExportModal(false);
    } catch (error) {
      console.error("PDF export failed:", error);
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Export PDF</h3>

            <div className="space-y-4">
              {/* Play count info */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                {(() => {
                  const count = getAllPlays().length;
                  const limitedCount = Math.min(count, 10);
                  return (
                    <>
                      <span className="font-medium">{limitedCount} plays</span>
                      {count > 10 && (
                        <span className="text-amber-600"> (max 10 per export)</span>
                      )}
                    </>
                  );
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Style
                </label>
                <select
                  value={playbook.exportSettings?.pageStyle || "classic"}
                  onChange={(e) =>
                    setExportSettings({
                      pageStyle: e.target.value as "classic" | "minimal",
                    })
                  }
                  className="w-full border rounded-lg p-2"
                  disabled={isExporting}
                >
                  <option value="classic">Classic (Scout Card)</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeNotes"
                  checked={playbook.exportSettings?.includeNotes ?? true}
                  onChange={(e) =>
                    setExportSettings({ includeNotes: e.target.checked })
                  }
                  className="rounded"
                  disabled={isExporting}
                />
                <label htmlFor="includeNotes" className="text-sm">
                  Include coaching notes
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeGrid"
                  checked={playbook.exportSettings?.includeGrid ?? false}
                  onChange={(e) =>
                    setExportSettings({ includeGrid: e.target.checked })
                  }
                  className="rounded"
                  disabled={isExporting}
                />
                <label htmlFor="includeGrid" className="text-sm">
                  Include alignment grid
                </label>
              </div>

              {/* Progress bar */}
              {isExporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Generating PDF...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleExportPdf}
                disabled={isExporting || getAllPlays().length === 0}
              >
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden container for rendering plays during export */}
      {showExportModal && (
        <div
          ref={exportContainerRef}
          className="fixed top-0 left-[-9999px] w-[800px]"
          aria-hidden="true"
        >
          {getAllPlays().slice(0, 10).map((play, index) => (
            <div
              key={play.id}
              data-play-export={index}
              className="w-[800px] h-[600px]"
            >
              <PlayRenderer play={play} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
