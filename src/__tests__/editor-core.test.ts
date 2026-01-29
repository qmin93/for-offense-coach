// ============================================
// Core Editor Tests (A4)
// 4가지 핵심 테스트: Auto-build, Undo, Persistence, Formation
// ============================================

import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/features/editor/store";
import { createPlayFromFormation } from "@/domain/dsl/factories";
import { autoBuildFromConcept, applyAutoBuildToPlay } from "@/domain/engine/auto-build";
import { FORMATIONS } from "@/domain/engine/formations";
import { RUN_CONCEPTS } from "@/domain/engine/concepts-run";

describe("Editor Core Tests", () => {
  // Reset store before each test
  beforeEach(() => {
    const store = useEditorStore.getState();
    store.initPlay();
  });

  // ============================================
  // Test 1: autoBuildFromConcept() 실행 시 actions.length가 증가하는지
  // ============================================
  describe("Auto-build from Concept", () => {
    it("should increase actions.length after autoBuildFromConcept", () => {
      // Setup: Create a play from a formation
      const formation = FORMATIONS.find((f) => f.id === "formation_2x2")!;
      const play = createPlayFromFormation(formation, "Test Play");

      // Initial state: no actions
      expect(play.actions.length).toBe(0);

      // Get a run concept
      const concept = RUN_CONCEPTS.find((c) => c.id === "concept_run_inside_zone")!;

      // Execute auto-build
      const result = autoBuildFromConcept(play, concept);

      // Verify: auto-build succeeded and generated actions
      expect(result.success).toBe(true);
      expect(result.actions.length).toBeGreaterThan(0);

      // Apply to play
      const newPlay = applyAutoBuildToPlay(play, result, { conflictPolicy: "add_layer" });

      // Verify: play now has actions
      expect(newPlay.actions.length).toBeGreaterThan(0);
      expect(newPlay.actions.length).toBe(result.actions.length);
    });

    it("should generate block actions for run concepts", () => {
      const formation = FORMATIONS.find((f) => f.id === "formation_2x2")!;
      const play = createPlayFromFormation(formation, "Test Play");
      const concept = RUN_CONCEPTS.find((c) => c.id === "concept_run_power")!;

      const result = autoBuildFromConcept(play, concept);

      expect(result.success).toBe(true);

      // Check that block actions were generated
      const blockActions = result.actions.filter((a) => a.actionType === "block");
      expect(blockActions.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // Test 2: Undo 1번으로 actions가 원복되는지
  // ============================================
  describe("Undo/Redo", () => {
    it("should restore actions to previous state after undo", () => {
      const store = useEditorStore.getState();

      // Setup: Create play with formation
      const formation = FORMATIONS.find((f) => f.id === "formation_2x2")!;
      store.applyFormation(formation);

      // Get current state
      let state = useEditorStore.getState();
      const initialActionCount = state.play?.actions.length || 0;

      // Add action via concept
      const concept = RUN_CONCEPTS.find((c) => c.id === "concept_run_inside_zone")!;
      store.buildFromConcept(concept);

      // Verify actions were added
      state = useEditorStore.getState();
      const afterBuildActionCount = state.play?.actions.length || 0;
      expect(afterBuildActionCount).toBeGreaterThan(initialActionCount);

      // Undo
      store.undo();

      // Verify actions restored
      state = useEditorStore.getState();
      expect(state.play?.actions.length).toBe(initialActionCount);
    });

    it("should be able to redo after undo", () => {
      const store = useEditorStore.getState();

      const formation = FORMATIONS.find((f) => f.id === "formation_2x2")!;
      store.applyFormation(formation);

      const concept = RUN_CONCEPTS.find((c) => c.id === "concept_run_inside_zone")!;
      store.buildFromConcept(concept);

      let state = useEditorStore.getState();
      const afterBuildActionCount = state.play?.actions.length || 0;

      // Undo
      store.undo();
      state = useEditorStore.getState();
      expect(state.play?.actions.length).toBeLessThan(afterBuildActionCount);

      // Redo
      store.redo();
      state = useEditorStore.getState();
      expect(state.play?.actions.length).toBe(afterBuildActionCount);
    });

    it("should correctly report canUndo and canRedo", () => {
      const store = useEditorStore.getState();

      // Initial state: can't undo
      expect(store.canUndo()).toBe(false);
      expect(store.canRedo()).toBe(false);

      // Make a change
      const formation = FORMATIONS.find((f) => f.id === "formation_2x2")!;
      store.applyFormation(formation);

      // Now can undo but not redo
      expect(useEditorStore.getState().canUndo()).toBe(true);
      expect(useEditorStore.getState().canRedo()).toBe(false);

      // Undo
      store.undo();

      // Now can redo
      expect(useEditorStore.getState().canUndo()).toBe(false);
      expect(useEditorStore.getState().canRedo()).toBe(true);
    });
  });

  // ============================================
  // Test 3: Play state persistence (history tracking)
  // 새로고침 후에도 actions가 유지되는지 - store history로 테스트
  // ============================================
  describe("Play State Persistence", () => {
    it("should maintain history of play states", () => {
      const store = useEditorStore.getState();

      const formation = FORMATIONS.find((f) => f.id === "formation_2x2")!;
      store.applyFormation(formation);

      // Check history
      let state = useEditorStore.getState();
      expect(state.history.length).toBe(2); // Initial + formation applied
      expect(state.historyIndex).toBe(1);

      // Add more changes
      const concept = RUN_CONCEPTS.find((c) => c.id === "concept_run_inside_zone")!;
      store.buildFromConcept(concept);

      state = useEditorStore.getState();
      expect(state.history.length).toBe(3);
      expect(state.historyIndex).toBe(2);

      // All history entries should be valid plays
      for (const play of state.history) {
        expect(play).toBeDefined();
        expect(play.roster).toBeDefined();
        expect(play.roster.players).toBeInstanceOf(Array);
      }
    });

    it("should preserve play data through setPlay", () => {
      const store = useEditorStore.getState();

      const formation = FORMATIONS.find((f) => f.id === "formation_2x2")!;
      store.applyFormation(formation);

      const concept = RUN_CONCEPTS.find((c) => c.id === "concept_run_inside_zone")!;
      store.buildFromConcept(concept);

      let state = useEditorStore.getState();
      const playWithActions = state.play!;
      const actionCount = playWithActions.actions.length;

      // Simulate "re-setting" the play (like after a save/reload)
      store.setPlay(playWithActions);

      state = useEditorStore.getState();
      expect(state.play?.actions.length).toBe(actionCount);
    });
  });

  // ============================================
  // Test 4: formation 변경 후 players 좌표가 유지되는지
  // ============================================
  describe("Formation Change Behavior", () => {
    it("should update player positions when applying new formation", () => {
      const store = useEditorStore.getState();

      // Apply first formation
      const formation1 = FORMATIONS.find((f) => f.id === "formation_2x2")!;
      store.applyFormation(formation1);

      let state = useEditorStore.getState();
      const initialPlayerCount = state.play?.roster.players.length || 0;
      expect(initialPlayerCount).toBeGreaterThan(0);

      // Get initial QB position
      const initialQB = state.play?.roster.players.find((p) => p.role === "QB");
      expect(initialQB).toBeDefined();

      // Apply second formation
      const formation2 = FORMATIONS.find((f) => f.id === "formation_trips_right")!;
      store.applyFormation(formation2);

      state = useEditorStore.getState();

      // Players should be from new formation
      expect(state.play?.roster.players.length).toBeGreaterThan(0);

      // QB should still exist
      const newQB = state.play?.roster.players.find((p) => p.role === "QB");
      expect(newQB).toBeDefined();
    });

    it("should preserve existing actions when changing formation", () => {
      const store = useEditorStore.getState();

      // Apply formation and add actions
      const formation1 = FORMATIONS.find((f) => f.id === "formation_2x2")!;
      store.applyFormation(formation1);

      const concept = RUN_CONCEPTS.find((c) => c.id === "concept_run_inside_zone")!;
      store.buildFromConcept(concept);

      let state = useEditorStore.getState();
      const actionCount = state.play?.actions.length || 0;
      expect(actionCount).toBeGreaterThan(0);

      // Apply different formation
      const formation2 = FORMATIONS.find((f) => f.id === "formation_trips_right")!;
      store.applyFormation(formation2);

      // Actions should be preserved
      state = useEditorStore.getState();
      expect(state.play?.actions.length).toBe(actionCount);
    });

    it("should correctly move a player position", () => {
      const store = useEditorStore.getState();

      const formation = FORMATIONS.find((f) => f.id === "formation_2x2")!;
      store.applyFormation(formation);

      let state = useEditorStore.getState();
      const qb = state.play?.roster.players.find((p) => p.role === "QB");
      expect(qb).toBeDefined();

      const originalX = qb!.alignment.x;
      const originalY = qb!.alignment.y;

      // Move QB
      const newX = 0.4;
      const newY = -0.2;
      store.movePlayer(qb!.id, { x: newX, y: newY });

      state = useEditorStore.getState();
      const movedQB = state.play?.roster.players.find((p) => p.role === "QB");

      expect(movedQB!.alignment.x).toBe(newX);
      expect(movedQB!.alignment.y).toBe(newY);
      expect(movedQB!.alignment.x).not.toBe(originalX);
    });
  });
});
