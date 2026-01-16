// ============================================
// Telemetry Debugger (P1 QA/Soft Launch용)
// Console에서 telemetry 이벤트 검증
// ============================================

import type { TelemetryEventName, TelemetryEventPayloads } from "./telemetry";

// ============================================
// Types
// ============================================

interface TelemetryLogEntry {
  timestamp: string;
  event: TelemetryEventName;
  payload: TelemetryEventPayloads[TelemetryEventName];
  sessionId?: string;
}

interface TelemetryStats {
  totalEvents: number;
  eventCounts: Record<string, number>;
  sessionDuration: number;
  firstEvent: string | null;
  lastEvent: string | null;
}

// ============================================
// In-memory Log Storage
// ============================================

const telemetryLog: TelemetryLogEntry[] = [];
let debugMode = false;
let sessionStartTime: number | null = null;

// ============================================
// Debug Functions (window에 노출)
// ============================================

/**
 * Enable/disable telemetry debug mode
 */
export function setTelemetryDebug(enabled: boolean): void {
  debugMode = enabled;
  if (enabled) {
    sessionStartTime = Date.now();
    console.info(
      "%c[Telemetry Debug] Enabled - Events will be logged",
      "color: #4CAF50; font-weight: bold"
    );
  } else {
    console.info(
      "%c[Telemetry Debug] Disabled",
      "color: #FF5722; font-weight: bold"
    );
  }
}

/**
 * Log a telemetry event (called from main telemetry module)
 */
export function logTelemetryEvent<E extends TelemetryEventName>(
  event: E,
  payload: TelemetryEventPayloads[E],
  sessionId?: string
): void {
  const entry: TelemetryLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    payload,
    sessionId,
  };

  telemetryLog.push(entry);

  if (debugMode) {
    const eventColor = getEventColor(event);
    console.log(
      `%c[Telemetry] ${event}`,
      `color: ${eventColor}; font-weight: bold`,
      payload
    );
  }
}

/**
 * Get all logged events
 */
export function getTelemetryLog(): TelemetryLogEntry[] {
  return [...telemetryLog];
}

/**
 * Get events filtered by name
 */
export function getTelemetryEvents(eventName: TelemetryEventName): TelemetryLogEntry[] {
  return telemetryLog.filter((e) => e.event === eventName);
}

/**
 * Get telemetry statistics
 */
export function getTelemetryStats(): TelemetryStats {
  const eventCounts: Record<string, number> = {};

  for (const entry of telemetryLog) {
    eventCounts[entry.event] = (eventCounts[entry.event] || 0) + 1;
  }

  return {
    totalEvents: telemetryLog.length,
    eventCounts,
    sessionDuration: sessionStartTime ? Date.now() - sessionStartTime : 0,
    firstEvent: telemetryLog[0]?.event || null,
    lastEvent: telemetryLog[telemetryLog.length - 1]?.event || null,
  };
}

/**
 * Clear telemetry log
 */
export function clearTelemetryLog(): void {
  telemetryLog.length = 0;
  console.info("[Telemetry Debug] Log cleared");
}

/**
 * Export telemetry log as JSON
 */
export function exportTelemetryLog(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      stats: getTelemetryStats(),
      events: telemetryLog,
    },
    null,
    2
  );
}

/**
 * Verify expected events were fired
 */
export function verifyTelemetryEvents(
  expectedEvents: TelemetryEventName[]
): { passed: boolean; missing: TelemetryEventName[]; found: TelemetryEventName[] } {
  const firedEvents = new Set(telemetryLog.map((e) => e.event));
  const found: TelemetryEventName[] = [];
  const missing: TelemetryEventName[] = [];

  for (const event of expectedEvents) {
    if (firedEvents.has(event)) {
      found.push(event);
    } else {
      missing.push(event);
    }
  }

  const passed = missing.length === 0;

  if (debugMode) {
    if (passed) {
      console.log(
        "%c[Telemetry Verify] All expected events found!",
        "color: #4CAF50; font-weight: bold"
      );
    } else {
      console.log(
        "%c[Telemetry Verify] Missing events:",
        "color: #FF5722; font-weight: bold",
        missing
      );
    }
  }

  return { passed, missing, found };
}

// ============================================
// QA Scenario Helpers
// ============================================

/**
 * Verify activation scenario (A-1)
 */
export function verifyActivationScenario(): boolean {
  const expected: TelemetryEventName[] = [
    "onboarding_completed",
    "concept_clicked",
    "autobuild_success",
    "export_png",
  ];
  const result = verifyTelemetryEvents(expected);

  console.log(
    `%c[QA] Activation Scenario: ${result.passed ? "PASS" : "FAIL"}`,
    result.passed ? "color: #4CAF50" : "color: #FF5722"
  );

  return result.passed;
}

/**
 * Verify auto-build failure scenario
 */
export function verifyAutobuildFailScenario(): boolean {
  const failEvents = getTelemetryEvents("autobuild_fail");
  const passed = failEvents.length > 0;

  if (passed) {
    const lastFail = failEvents[failEvents.length - 1];
    console.log(
      "%c[QA] Auto-build Fail Scenario: PASS",
      "color: #4CAF50",
      lastFail.payload
    );
  } else {
    console.log(
      "%c[QA] Auto-build Fail Scenario: FAIL - No autobuild_fail events",
      "color: #FF5722"
    );
  }

  return passed;
}

/**
 * Verify undo after autobuild scenario
 */
export function verifyUndoAfterAutobuild(): boolean {
  const undoEvents = getTelemetryEvents("undo_after_autobuild");
  const passed = undoEvents.length > 0;

  if (passed) {
    const lastUndo = undoEvents[undoEvents.length - 1];
    const payload = lastUndo.payload as { timeFromBuildMs: number };
    console.log(
      `%c[QA] Undo After Autobuild: PASS (${payload.timeFromBuildMs}ms after build)`,
      "color: #4CAF50"
    );
  } else {
    console.log(
      "%c[QA] Undo After Autobuild: Not triggered yet",
      "color: #FFC107"
    );
  }

  return passed;
}

/**
 * Print full QA report
 */
export function printQAReport(): void {
  console.log("\n%c=== TELEMETRY QA REPORT ===", "font-size: 16px; font-weight: bold; color: #2196F3");

  const stats = getTelemetryStats();
  console.log(`Total Events: ${stats.totalEvents}`);
  console.log(`Session Duration: ${Math.round(stats.sessionDuration / 1000)}s`);
  console.log("\nEvent Counts:");

  for (const [event, count] of Object.entries(stats.eventCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${event}: ${count}`);
  }

  console.log("\n%cScenario Checks:", "font-weight: bold");
  verifyActivationScenario();
  verifyAutobuildFailScenario();
  verifyUndoAfterAutobuild();

  console.log("\n%c=== END REPORT ===\n", "font-size: 14px; color: #2196F3");
}

// ============================================
// Color Helpers
// ============================================

function getEventColor(event: TelemetryEventName): string {
  const colorMap: Partial<Record<TelemetryEventName, string>> = {
    onboarding_completed: "#4CAF50",
    onboarding_skipped: "#FF9800",
    autobuild_success: "#4CAF50",
    autobuild_fail: "#FF5722",
    undo_after_autobuild: "#FF9800",
    export_png: "#2196F3",
    export_pdf: "#2196F3",
    export_blocked_by_validation: "#FF5722",
    concept_clicked: "#9C27B0",
    suggestions_opened: "#673AB7",
    share_link_created: "#00BCD4",
    fork_created: "#00BCD4",
  };

  return colorMap[event] || "#607D8B";
}

// ============================================
// Window Global for Browser Console Access
// ============================================

if (typeof window !== "undefined") {
  (window as any).__telemetry = {
    setDebug: setTelemetryDebug,
    getLog: getTelemetryLog,
    getEvents: getTelemetryEvents,
    getStats: getTelemetryStats,
    clear: clearTelemetryLog,
    export: exportTelemetryLog,
    verify: verifyTelemetryEvents,
    qaReport: printQAReport,
    verifyActivation: verifyActivationScenario,
    verifyFail: verifyAutobuildFailScenario,
    verifyUndo: verifyUndoAfterAutobuild,
  };

  console.info(
    "%c[Telemetry] Debug tools available: window.__telemetry",
    "color: #9E9E9E"
  );
  console.info(
    "  - __telemetry.setDebug(true) - Enable verbose logging\n" +
    "  - __telemetry.qaReport() - Print QA verification report\n" +
    "  - __telemetry.getStats() - Get event statistics\n" +
    "  - __telemetry.export() - Export log as JSON"
  );
}
