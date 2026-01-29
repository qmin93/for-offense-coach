"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/features/editor/store";
import {
  Toolbar,
  FormationPanel,
  SuggestionsPanel,
  InstallFocusPanel,
  ConceptLibrary,
  Canvas,
  ExportButton,
  RouteTemplatesPanel,
  DefensePanel,
  PlaybackControls,
  BlockHUD,
  RecoveryDialog,
  PreContextScreen,
  EmptyStateOverlay,
  SaveStatusBadge,
  type PreContext,
} from "@/features/editor/components";
import { ValidationPanel, ValidationStatusBadge } from "@/features/editor/components/ValidationPanel";
import {
  OnboardingOverlay,
  HardOnboardingModal,
  type OnboardingConcept,
} from "@/features/onboarding";
import {
  startAutoSnapshot,
  stopAutoSnapshot,
  createSnapshot,
  getSnapshotsForPlay,
  checkRecoveryNeeded,
  recoverFromSnapshot,
  type Snapshot,
  type RecoveryInfo,
} from "@/features/editor/snapshot-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { getFormationById } from "@/domain/engine/formations";
import { getPassConceptById } from "@/domain/engine/concepts-pass";
import { getRunConceptById } from "@/domain/engine/concepts-run";
import { useClipboard } from "@/hooks";
import { Sparkles } from "lucide-react";

// Dev mode audit helpers - registers __audit on window
if (process.env.NODE_ENV === "development") {
  import("@/lib/audit");
}

// Suggestions Panel Tab (always visible on right edge when panel is closed)
function SuggestionsPanelTab() {
  const suggestionsOpen = useEditorStore((s) => s.suggestionsOpen);
  const toggleSuggestions = useEditorStore((s) => s.toggleSuggestions);

  // Don't show if panel is already open
  if (suggestionsOpen) return null;

  return (
    <button
      onClick={() => toggleSuggestions()}
      className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-4 rounded-l-lg shadow-lg transition-colors z-30 flex flex-col items-center gap-1"
      aria-label="Open Suggestions Panel"
    >
      <Sparkles className="w-4 h-4" />
      <span className="text-[10px] font-medium [writing-mode:vertical-rl] [text-orientation:mixed]">
        Suggestions
      </span>
    </button>
  );
}

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
    selectedActionId,
    selectAction,
    applyFormation,
    buildFromConcept,
    hasCompletedPreContext,
    initializeContext,
    // Context persistence actions
    restoreContextFromPlay,
    syncContextToPlay,
    applyContextDefense,
    // Multi-selection for copy/paste
    selectedPlayerIds,
    selectedActionIds,
    // Actions for paste
    addAction,
  } = useEditorStore();

  // Clipboard for copy/paste
  const { copy, paste, hasContent: hasClipboardContent } = useClipboard({
    onPaste: () => {
      toast.success("Pasted!", { duration: 1500 });
    },
  });

  // Check if selected action is a block
  const selectedBlockAction = play?.actions.find(
    (a) => a.id === selectedActionId && a.actionType === "block"
  );
  const showBlockHUD = !!selectedBlockAction;

  // Track if play has been modified for autosave
  const debouncedIsDirty = useDebounce(isDirty, 1000);
  const isFirstRender = useRef(true);

  // Recovery state
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryInfo, setRecoveryInfo] = useState<RecoveryInfo | null>(null);
  const [allSnapshots, setAllSnapshots] = useState<Snapshot[]>([]);

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

  // Auto-snapshot management
  useEffect(() => {
    // Start auto-snapshotting when play is loaded
    if (play?.id) {
      startAutoSnapshot(() => useEditorStore.getState().play);

      // Also create a snapshot when saving
      const unsubscribe = useEditorStore.subscribe((state, prevState) => {
        if (!state.isSaving && prevState.isSaving && state.play) {
          createSnapshot(state.play, "save");
        }
      });

      return () => {
        stopAutoSnapshot();
        unsubscribe();
      };
    }
  }, [play?.id]);

  // Check for recovery needs on load
  useEffect(() => {
    if (!isLoading && playId !== "new") {
      const info = checkRecoveryNeeded(playId, play);
      if (info.needsRecovery) {
        const snapshots = getSnapshotsForPlay(playId);
        setRecoveryInfo(info);
        setAllSnapshots(snapshots);
        setShowRecoveryDialog(true);
      }
    }
  }, [playId, play, isLoading]);

  // Restore context from loaded play (for existing plays)
  // This ensures Pre-Context survives page refresh and play reload
  const hasRestoredContext = useRef(false);
  useEffect(() => {
    if (
      !isLoading &&
      playId !== "new" &&
      play?.meta?.context &&
      !hasCompletedPreContext &&
      !hasRestoredContext.current
    ) {
      hasRestoredContext.current = true;
      restoreContextFromPlay();

      // After context is restored, apply defense if context has defense settings
      setTimeout(() => {
        applyContextDefense();
      }, 0);
    }
  }, [isLoading, playId, play?.meta?.context, hasCompletedPreContext, restoreContextFromPlay, applyContextDefense]);

  // Recovery handlers
  const handleRecover = useCallback((snapshotId: string) => {
    const recoveredPlay = recoverFromSnapshot(snapshotId);
    if (recoveredPlay) {
      useEditorStore.getState().setPlay(recoveredPlay);
      toast.success("Play recovered successfully");
      setShowRecoveryDialog(false);
    } else {
      toast.error("Failed to recover play");
    }
  }, []);

  const handleContinueWithoutRecovery = useCallback(() => {
    setShowRecoveryDialog(false);
    toast.info("Continuing with current state");
  }, []);

  // Pre-Context completion handler
  const handlePreContextComplete = useCallback(
    (context: PreContext) => {
      initializeContext(context);
      initPlay(); // Initialize empty play after context is set
      // Defense application is now handled by useEffect below
    },
    [initializeContext, initPlay]
  );

  // Apply defense preset after new play is initialized with context
  // This ensures play exists before applying defense
  const hasAppliedDefenseForNewPlay = useRef(false);
  useEffect(() => {
    if (
      playId === "new" &&
      hasCompletedPreContext &&
      play &&
      !hasAppliedDefenseForNewPlay.current
    ) {
      hasAppliedDefenseForNewPlay.current = true;
      // Sync context to play.meta first
      syncContextToPlay();
      // Then apply defense preset based on context
      applyContextDefense();
    }
  }, [playId, hasCompletedPreContext, play, syncContextToPlay, applyContextDefense]);

  // Hard Onboarding concept selection handler
  const handleOnboardingConceptSelect = useCallback(
    async (onboardingConcept: OnboardingConcept) => {
      // Get and apply the formation for the selected concept
      const formationId = `formation_${onboardingConcept.formation}`;
      const formation = getFormationById(formationId);
      if (formation) {
        applyFormation(formation);
      }

      // Get the full concept definition
      const concept =
        onboardingConcept.type === "run"
          ? getRunConceptById(onboardingConcept.id)
          : getPassConceptById(onboardingConcept.id);

      if (concept) {
        // Build the concept
        await buildFromConcept(concept);

        toast.success(`${onboardingConcept.name} concept applied!`, {
          description: "Feel free to edit or try a different concept.",
        });
      }
    },
    [applyFormation, buildFromConcept]
  );

  // Keyboard shortcuts for Undo/Redo and Copy/Paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useEditorStore.getState();
      const { undo, redo, canUndo, canRedo, play: currentPlay, selectedPlayerIds: selectedPlayers, selectedActionIds: selectedActions, addAction: addActionToPlay, markDirty } = state;

      // Undo/Redo
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
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        // Ctrl+Y = Redo
        if (canRedo()) {
          e.preventDefault();
          redo();
        }
        return;
      }

      // Copy (Ctrl+C)
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        if (!currentPlay) return;

        // Get all players from roster
        const allPlayers = currentPlay.roster?.players || [];

        // Get selected players
        const playersToCopy = allPlayers.filter((p) => selectedPlayers.includes(p.id));

        // Get selected actions (or actions belonging to selected players)
        let actionsToCopy = currentPlay.actions.filter((a) => selectedActions.includes(a.id));
        if (actionsToCopy.length === 0 && playersToCopy.length > 0) {
          // Copy all actions belonging to selected players
          actionsToCopy = currentPlay.actions.filter((a) =>
            playersToCopy.some((p) => p.id === a.fromPlayerId)
          );
        }

        if (playersToCopy.length > 0 || actionsToCopy.length > 0) {
          e.preventDefault();
          copy(playersToCopy, actionsToCopy);
          toast.success(
            `Copied ${playersToCopy.length} player(s), ${actionsToCopy.length} action(s)`,
            { duration: 1500 }
          );
        }
        return;
      }

      // Paste (Ctrl+V)
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        const result = paste();
        if (result && result.actions.length > 0) {
          e.preventDefault();
          // Add pasted actions to the play
          result.actions.forEach((action) => {
            addActionToPlay(action);
          });
          markDirty();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [copy, paste]);

  // Format last saved time
  const formatLastSaved = useCallback(() => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    if (diff < 60000) return "Saved";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${lastSaved.toLocaleTimeString()}`;
  }, [lastSaved]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading play...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-destructive text-4xl mb-4">!</div>
          <p className="text-foreground font-medium mb-2">Failed to load play</p>
          <p className="text-muted-foreground text-sm mb-4">{loadError}</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Pre-Context Screen for new plays (before editor)
  if (playId === "new" && !hasCompletedPreContext) {
    return <PreContextScreen onComplete={handlePreContextComplete} />;
  }

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-primary">
            ForOffenseCoach
          </Link>
          <span className="text-border">|</span>
          <input
            type="text"
            value={play?.name || "New Play"}
            onChange={(e) => setPlayName(e.target.value)}
            className="text-lg font-medium text-foreground bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
          />
          {/* Save status indicator with offline support */}
          <SaveStatusBadge
            isSaving={isSaving}
            isDirty={isDirty}
            lastSaved={lastSaved}
            saveError={saveError}
          />
          {/* Validation status badge */}
          <ValidationStatusBadge />
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
        <div className="w-64 bg-background border-r overflow-y-auto">
          <Tabs defaultValue="formation" className="w-full h-full flex flex-col">
            <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0 flex-shrink-0">
              <TabsTrigger
                value="formation"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 text-xs"
              >
                Offense
              </TabsTrigger>
              <TabsTrigger
                value="defense"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent py-2 text-xs"
              >
                Defense
              </TabsTrigger>
              <TabsTrigger
                value="concepts"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent py-2 text-xs"
              >
                Concepts
              </TabsTrigger>
              <TabsTrigger
                value="install"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent py-2 text-xs"
              >
                Install
              </TabsTrigger>
            </TabsList>
            <TabsContent value="formation" className="mt-0 flex-1 overflow-y-auto">
              <FormationPanel />
            </TabsContent>
            <TabsContent value="defense" className="mt-0 flex-1 overflow-y-auto">
              <DefensePanel />
            </TabsContent>
            <TabsContent value="concepts" className="mt-0 flex-1 overflow-y-auto">
              <ConceptLibrary />
            </TabsContent>
            <TabsContent value="install" className="mt-0 flex-1 overflow-y-auto">
              <InstallFocusPanel />
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <Canvas />
          {/* Empty state overlay for new plays */}
          <EmptyStateOverlay />
          {/* Block editing HUD */}
          <BlockHUD
            visible={showBlockHUD}
            playerId={selectedBlockAction?.fromPlayerId || null}
            onClose={() => selectAction(null)}
          />
          {/* Validation Panel (floating overlay) */}
          <ValidationPanel
            className="absolute bottom-4 left-4 w-72 z-10"
            defaultExpanded={false}
          />
        </div>

        {/* Right sidebar - Suggestions */}
        <SuggestionsPanel />
        {/* Persistent tab when suggestions panel is closed */}
        <SuggestionsPanelTab />
      </div>

      {/* Playback Controls */}
      <PlaybackControls />

      {/* Status bar */}
      <footer className="bg-background border-t px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {play?.meta?.formationId && (
            <Badge variant="outline" className="text-xs">
              {play.meta.formationId.replace("formation_", "")}
            </Badge>
          )}
          {play?.meta?.conceptId && (
            <Badge variant="outline" className="text-xs">
              {play.meta.conceptId.replace("concept_", "").replace("run_", "").replace("pass_", "")}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{play?.actions.length || 0} actions</span>
          <span>•</span>
          <span>v{play?.history?.version || 1}</span>
        </div>
      </footer>

      {/* Hard onboarding modal for first-time users (forced concept selection) */}
      {playId === "new" && (
        <HardOnboardingModal onSelect={handleOnboardingConceptSelect} />
      )}

      {/* Soft onboarding overlay for hints */}
      <OnboardingOverlay />

      {/* Recovery dialog for data corruption */}
      {recoveryInfo && (
        <RecoveryDialog
          isOpen={showRecoveryDialog}
          onClose={() => setShowRecoveryDialog(false)}
          onRecover={handleRecover}
          onContinueAnyway={handleContinueWithoutRecovery}
          recoveryInfo={recoveryInfo}
          allSnapshots={allSnapshots}
        />
      )}
    </div>
  );
}
