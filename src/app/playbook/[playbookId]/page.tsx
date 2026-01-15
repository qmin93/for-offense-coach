"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePlaybookStore } from "@/features/playbook/store";
import { Button } from "@/components/ui";
import { PlayRenderer } from "@/domain/render/svg-renderer";

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

  useEffect(() => {
    if (playbookId === "new") {
      initPlaybook("New Playbook");
    }
    // TODO: Load existing playbook from DB
  }, [playbookId, initPlaybook]);

  const handleExportPdf = async () => {
    if (!playbook) return;
    setExporting(true);

    try {
      // In a real implementation, this would call a server endpoint
      // For now, we'll just show a placeholder
      alert("PDF Export would be generated here.\n\nIn production, this calls a server endpoint that renders each play to PDF pages.");
    } finally {
      setExporting(false);
      setShowExportModal(false);
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
                >
                  <option value="classic">Classic</option>
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
                />
                <label htmlFor="includeGrid" className="text-sm">
                  Include alignment grid
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
