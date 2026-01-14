"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/features/editor/store";
import {
  Toolbar,
  FormationPanel,
  SuggestionsPanel,
  InstallFocusPanel,
  Canvas,
  ExportButton,
} from "@/features/editor/components";
import Link from "next/link";

export default function EditorPage() {
  const params = useParams();
  const playId = params.playId as string;
  const [activeTab, setActiveTab] = useState<"formation" | "install">("formation");

  const { initPlay, play } = useEditorStore();

  // Initialize play on mount
  useEffect(() => {
    if (playId === "new") {
      initPlay();
    }
    // TODO: Load existing play from DB
  }, [playId, initPlay]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-blue-600">
            ForOffenseCoach
          </Link>
          <span className="text-gray-300">|</span>
          <input
            type="text"
            value={play?.name || "New Play"}
            onChange={(e) => {
              // TODO: Update play name
            }}
            className="text-lg font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("formation")}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "formation"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Formation
            </button>
            <button
              onClick={() => setActiveTab("install")}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "install"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Install Focus
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "formation" ? (
            <FormationPanel />
          ) : (
            <InstallFocusPanel />
          )}
        </div>

        {/* Canvas */}
        <Canvas />

        {/* Right sidebar - Suggestions */}
        <SuggestionsPanel />
      </div>

      {/* Status bar */}
      <footer className="bg-white border-t px-4 py-1 text-xs text-gray-500 flex items-center justify-between">
        <div>
          {play?.meta?.formationId && (
            <span>Formation: {play.meta.formationId.replace("formation_", "")}</span>
          )}
          {play?.meta?.conceptId && (
            <span className="ml-4">
              Concept: {play.meta.conceptId.replace("concept_", "")}
            </span>
          )}
        </div>
        <div>
          {play?.actions.length || 0} actions • v{play?.history?.version || 1}
        </div>
      </footer>
    </div>
  );
}
