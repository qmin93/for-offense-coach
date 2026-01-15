"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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

// Debounce hook for autosave
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function EditorPage() {
  const params = useParams();
  const playId = params.playId as string;
  const [activeTab, setActiveTab] = useState<"formation" | "install">("formation");

  const {
    initPlay,
    loadPlay,
    savePlay,
    setPlayName,
    play,
    playDbId,
    isDirty,
    isSaving,
    isLoading,
    loadError,
    saveError,
    lastSaved,
  } = useEditorStore();

  // Track if play has been modified for autosave
  const debouncedIsDirty = useDebounce(isDirty, 1000);
  const isFirstRender = useRef(true);

  // Initialize or load play on mount
  useEffect(() => {
    if (playId === "new") {
      initPlay();
    } else {
      loadPlay(playId);
    }
  }, [playId, initPlay, loadPlay]);

  // Autosave when dirty (debounced)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debouncedIsDirty && playDbId && !isSaving) {
      savePlay();
    }
  }, [debouncedIsDirty, playDbId, isSaving, savePlay]);

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { undo, redo, canUndo, canRedo } = useEditorStore.getState();

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) {
          // Ctrl+Shift+Z = Redo
          if (canRedo()) {
            e.preventDefault();
            redo();
          }
        } else {
          // Ctrl+Z = Undo
          if (canUndo()) {
            e.preventDefault();
            undo();
          }
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        // Ctrl+Y = Redo
        if (canRedo()) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Format last saved time
  const formatLastSaved = useCallback(() => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    if (diff < 60000) return "Saved just now";
    if (diff < 3600000) return `Saved ${Math.floor(diff / 60000)}m ago`;
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  }, [lastSaved]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading play...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <p className="text-gray-800 font-medium mb-2">Failed to load play</p>
          <p className="text-gray-600 text-sm mb-4">{loadError}</p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

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
            onChange={(e) => setPlayName(e.target.value)}
            className="text-lg font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
          />
          {/* Save status indicator */}
          <span className="text-xs text-gray-400">
            {isSaving && "Saving..."}
            {!isSaving && isDirty && "Unsaved changes"}
            {!isSaving && !isDirty && formatLastSaved()}
          </span>
          {saveError && (
            <span className="text-xs text-red-500" title={saveError}>
              Save failed
            </span>
          )}
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
