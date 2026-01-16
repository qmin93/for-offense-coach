/**
 * KPI Analysis Test Script
 *
 * 이 스크립트는 샘플 데이터로 KPI 분석 도구를 테스트합니다.
 * 브라우저 콘솔이나 Node.js에서 실행할 수 있습니다.
 *
 * Usage (Browser Console):
 *   1. Copy and paste this entire script
 *   2. Run: testKPIAnalysis()
 *
 * 또는 테스트용 JSON을 직접 사용:
 *   __kpi.analyzeFromJSON([SAMPLE_LOG_T1, SAMPLE_LOG_T2, ...])
 */

// ============================================
// Sample Telemetry Logs (5 Testers)
// ============================================

// T1: Good activation, success case
const SAMPLE_LOG_T1 = {
  exportedAt: "2024-01-16T10:30:00.000Z",
  stats: {
    totalEvents: 8,
    eventCounts: {
      onboarding_completed: 1,
      concept_clicked: 2,
      autobuild_success: 2,
      export_png: 1,
      share_link_created: 1,
      suggestions_opened: 1,
    },
    sessionDuration: 180000,
  },
  events: [
    { timestamp: "2024-01-16T10:25:00.000Z", event: "onboarding_completed", payload: { timeToCompleteMs: 15000, stepsCompleted: 1, selectedConcept: "concept_run_power" } },
    { timestamp: "2024-01-16T10:25:15.000Z", event: "concept_clicked", payload: { conceptId: "concept_run_power", conceptName: "Power", conceptType: "run", source: "onboarding" } },
    { timestamp: "2024-01-16T10:25:30.000Z", event: "autobuild_success", payload: { conceptId: "concept_run_power", conceptName: "Power", timeMs: 1200, actionsGenerated: 11, playersAssigned: 11 } },
    { timestamp: "2024-01-16T10:26:00.000Z", event: "suggestions_opened", payload: { formationId: "formation_i_form", mode: "pass", conceptCount: 8 } },
    { timestamp: "2024-01-16T10:26:30.000Z", event: "concept_clicked", payload: { conceptId: "concept_pass_flood", conceptName: "Flood", conceptType: "pass", source: "suggestions" } },
    { timestamp: "2024-01-16T10:26:45.000Z", event: "autobuild_success", payload: { conceptId: "concept_pass_flood", conceptName: "Flood", timeMs: 1100, actionsGenerated: 11, playersAssigned: 11 } },
    { timestamp: "2024-01-16T10:28:00.000Z", event: "export_png", payload: { playId: "play_123", timeMs: 500, scale: 2, width: 1600, height: 900, success: true } },
    { timestamp: "2024-01-16T10:29:00.000Z", event: "share_link_created", payload: { type: "play", targetId: "play_123", viewOnly: true } },
  ],
};

// T2: Good activation with one autobuild fail
const SAMPLE_LOG_T2 = {
  exportedAt: "2024-01-16T11:30:00.000Z",
  stats: {
    totalEvents: 9,
    eventCounts: {
      onboarding_completed: 1,
      concept_clicked: 2,
      autobuild_success: 1,
      autobuild_fail: 1,
      export_png: 1,
      export_pdf: 1,
      suggestions_opened: 2,
    },
    sessionDuration: 300000,
  },
  events: [
    { timestamp: "2024-01-16T11:25:00.000Z", event: "onboarding_completed", payload: { timeToCompleteMs: 12000, stepsCompleted: 1, selectedConcept: "concept_pass_flood" } },
    { timestamp: "2024-01-16T11:25:15.000Z", event: "concept_clicked", payload: { conceptId: "concept_pass_flood", conceptName: "Flood", conceptType: "pass", source: "onboarding" } },
    { timestamp: "2024-01-16T11:25:20.000Z", event: "autobuild_fail", payload: { conceptId: "concept_pass_flood", conceptName: "Flood", code: "MISSING_ROLES", message: "Missing required WRs", missingRoles: ["WR_X", "WR_Z"] } },
    { timestamp: "2024-01-16T11:26:00.000Z", event: "suggestions_opened", payload: { formationId: "formation_trips", mode: "pass", conceptCount: 10 } },
    { timestamp: "2024-01-16T11:26:30.000Z", event: "concept_clicked", payload: { conceptId: "concept_pass_stick", conceptName: "Stick", conceptType: "pass", source: "suggestions" } },
    { timestamp: "2024-01-16T11:26:45.000Z", event: "autobuild_success", payload: { conceptId: "concept_pass_stick", conceptName: "Stick", timeMs: 950, actionsGenerated: 11, playersAssigned: 11 } },
    { timestamp: "2024-01-16T11:27:00.000Z", event: "suggestions_opened", payload: { formationId: "formation_trips", mode: "run", conceptCount: 6 } },
    { timestamp: "2024-01-16T11:28:00.000Z", event: "export_png", payload: { playId: "play_456", timeMs: 480, scale: 2, width: 1600, height: 900, success: true } },
    { timestamp: "2024-01-16T11:29:00.000Z", event: "export_pdf", payload: { playbookId: "pb_001", pages: 6, style: "classic", timeMs: 2500, success: true } },
  ],
};

// T3: Good activation with undo after autobuild
const SAMPLE_LOG_T3 = {
  exportedAt: "2024-01-16T12:30:00.000Z",
  stats: {
    totalEvents: 10,
    eventCounts: {
      onboarding_completed: 1,
      concept_clicked: 3,
      autobuild_success: 2,
      undo_after_autobuild: 1,
      export_png: 1,
      export_pdf: 1,
      why_viewed: 1,
    },
    sessionDuration: 450000,
  },
  events: [
    { timestamp: "2024-01-16T12:20:00.000Z", event: "onboarding_completed", payload: { timeToCompleteMs: 18000, stepsCompleted: 1, selectedConcept: "concept_pass_stick" } },
    { timestamp: "2024-01-16T12:20:15.000Z", event: "concept_clicked", payload: { conceptId: "concept_pass_stick", conceptName: "Stick", conceptType: "pass", source: "onboarding" } },
    { timestamp: "2024-01-16T12:20:30.000Z", event: "autobuild_success", payload: { conceptId: "concept_pass_stick", conceptName: "Stick", timeMs: 980, actionsGenerated: 11, playersAssigned: 11 } },
    { timestamp: "2024-01-16T12:21:00.000Z", event: "undo_after_autobuild", payload: { conceptId: "concept_pass_stick", conceptName: "Stick", reasonCount: 3, timeFromBuildMs: 25000, undoCount: 1 } },
    { timestamp: "2024-01-16T12:22:00.000Z", event: "why_viewed", payload: { conceptId: "concept_pass_flood", reasonCount: 4, expandedTimeMs: 5000 } },
    { timestamp: "2024-01-16T12:22:30.000Z", event: "concept_clicked", payload: { conceptId: "concept_pass_flood", conceptName: "Flood", conceptType: "pass", source: "suggestions" } },
    { timestamp: "2024-01-16T12:22:45.000Z", event: "autobuild_success", payload: { conceptId: "concept_pass_flood", conceptName: "Flood", timeMs: 1050, actionsGenerated: 11, playersAssigned: 11 } },
    { timestamp: "2024-01-16T12:25:00.000Z", event: "concept_clicked", payload: { conceptId: "concept_run_power", conceptName: "Power", conceptType: "run", source: "library" } },
    { timestamp: "2024-01-16T12:26:00.000Z", event: "export_png", payload: { playId: "play_789", timeMs: 520, scale: 2, width: 1600, height: 900, success: true } },
    { timestamp: "2024-01-16T12:27:00.000Z", event: "export_pdf", payload: { playbookId: "pb_002", pages: 8, style: "minimal", timeMs: 3200, success: true } },
  ],
};

// T4: Partial activation (mobile user, no PDF)
const SAMPLE_LOG_T4 = {
  exportedAt: "2024-01-16T13:30:00.000Z",
  stats: {
    totalEvents: 5,
    eventCounts: {
      onboarding_completed: 1,
      concept_clicked: 1,
      autobuild_success: 1,
      export_png: 1,
      install_focus_opened: 1,
    },
    sessionDuration: 120000,
  },
  events: [
    { timestamp: "2024-01-16T13:25:00.000Z", event: "onboarding_completed", payload: { timeToCompleteMs: 20000, stepsCompleted: 1, selectedConcept: "concept_run_power" } },
    { timestamp: "2024-01-16T13:25:30.000Z", event: "concept_clicked", payload: { conceptId: "concept_run_power", conceptName: "Power", conceptType: "run", source: "onboarding" } },
    { timestamp: "2024-01-16T13:25:45.000Z", event: "autobuild_success", payload: { conceptId: "concept_run_power", conceptName: "Power", timeMs: 1300, actionsGenerated: 11, playersAssigned: 11 } },
    { timestamp: "2024-01-16T13:26:00.000Z", event: "install_focus_opened", payload: { conceptId: "concept_run_power", conceptName: "Power", drillCount: 3 } },
    { timestamp: "2024-01-16T13:27:00.000Z", event: "export_png", payload: { playId: "play_mob", timeMs: 650, scale: 2, width: 1600, height: 900, success: true } },
  ],
};

// T5: QA Engineer - validation blocked scenario
const SAMPLE_LOG_T5 = {
  exportedAt: "2024-01-16T14:30:00.000Z",
  stats: {
    totalEvents: 12,
    eventCounts: {
      onboarding_completed: 1,
      concept_clicked: 2,
      autobuild_success: 2,
      autobuild_fail: 1,
      export_png: 2,
      export_pdf: 1,
      validation_error_viewed: 1,
      export_blocked_by_validation: 1,
    },
    sessionDuration: 600000,
  },
  events: [
    { timestamp: "2024-01-16T14:20:00.000Z", event: "onboarding_completed", payload: { timeToCompleteMs: 10000, stepsCompleted: 1, selectedConcept: "concept_pass_flood" } },
    { timestamp: "2024-01-16T14:20:15.000Z", event: "concept_clicked", payload: { conceptId: "concept_pass_flood", conceptName: "Flood", conceptType: "pass", source: "onboarding" } },
    { timestamp: "2024-01-16T14:20:30.000Z", event: "autobuild_success", payload: { conceptId: "concept_pass_flood", conceptName: "Flood", timeMs: 1100, actionsGenerated: 11, playersAssigned: 11 } },
    { timestamp: "2024-01-16T14:22:00.000Z", event: "validation_error_viewed", payload: { errorCount: 2, warningCount: 1, expandedSection: "error" } },
    { timestamp: "2024-01-16T14:22:30.000Z", event: "export_blocked_by_validation", payload: { playbookId: "pb_003", errorCount: 2, errorCodes: ["MISSING_ACTION", "INVALID_ROUTE"] } },
    { timestamp: "2024-01-16T14:23:00.000Z", event: "autobuild_fail", payload: { conceptId: "concept_run_inside_zone", conceptName: "Inside Zone", code: "FORMATION_MISMATCH", message: "Formation doesn't support this run concept" } },
    { timestamp: "2024-01-16T14:24:00.000Z", event: "concept_clicked", payload: { conceptId: "concept_pass_stick", conceptName: "Stick", conceptType: "pass", source: "library" } },
    { timestamp: "2024-01-16T14:24:15.000Z", event: "autobuild_success", payload: { conceptId: "concept_pass_stick", conceptName: "Stick", timeMs: 920, actionsGenerated: 11, playersAssigned: 11 } },
    { timestamp: "2024-01-16T14:25:00.000Z", event: "export_png", payload: { playId: "play_qa1", timeMs: 480, scale: 2, width: 1600, height: 900, success: true } },
    { timestamp: "2024-01-16T14:26:00.000Z", event: "export_png", payload: { playId: "play_qa2", timeMs: 510, scale: 2, width: 1600, height: 900, success: true } },
    { timestamp: "2024-01-16T14:28:00.000Z", event: "export_pdf", payload: { playbookId: "pb_003", pages: 10, style: "classic", timeMs: 4100, success: true } },
  ],
};

// ============================================
// Test Function
// ============================================

function testKPIAnalysis() {
  const logs = [SAMPLE_LOG_T1, SAMPLE_LOG_T2, SAMPLE_LOG_T3, SAMPLE_LOG_T4, SAMPLE_LOG_T5];

  console.log("\n%c=== KPI ANALYSIS TEST ===", "font-size: 16px; font-weight: bold; color: #FF9800");
  console.log(`Testing with ${logs.length} sample logs\n`);

  // Check if __kpi is available (browser)
  if (typeof window !== "undefined" && (window as any).__kpi) {
    const report = (window as any).__kpi.analyze(logs);
    (window as any).__kpi.print(report);
    return report;
  }

  // Fallback for Node.js or direct calculation
  console.log("KPI utility not found. Calculating manually...\n");

  const allEvents = logs.flatMap(l => l.events);

  // KPI 1: Activation Rate
  const activationSuccess = logs.filter(log => {
    const events = new Set(log.events.map(e => e.event));
    return events.has("onboarding_completed") &&
           events.has("concept_clicked") &&
           events.has("autobuild_success") &&
           events.has("export_png");
  }).length;
  const activationRate = (activationSuccess / logs.length) * 100;
  console.log(`1. Activation Rate: ${activationRate}% (${activationSuccess}/${logs.length})`);

  // KPI 2: Autobuild Fail Rate
  const buildSuccess = allEvents.filter(e => e.event === "autobuild_success").length;
  const buildFail = allEvents.filter(e => e.event === "autobuild_fail").length;
  const failRate = buildFail / (buildSuccess + buildFail) * 100;
  console.log(`2. Autobuild Fail Rate: ${failRate.toFixed(1)}%`);

  // KPI 3: Undo After Build Rate
  const undoAfterBuild = allEvents.filter(e => e.event === "undo_after_autobuild").length;
  const undoRate = buildSuccess > 0 ? (undoAfterBuild / buildSuccess) * 100 : 0;
  console.log(`3. Undo After Build Rate: ${undoRate.toFixed(1)}%`);

  // KPI 4: Export Fail Rate
  const pngEvents = allEvents.filter(e => e.event === "export_png");
  const pdfEvents = allEvents.filter(e => e.event === "export_pdf");
  const exportFail = pngEvents.filter(e => !e.payload.success).length +
                     pdfEvents.filter(e => !e.payload.success).length;
  const exportFailRate = (pngEvents.length + pdfEvents.length) > 0
    ? exportFail / (pngEvents.length + pdfEvents.length) * 100
    : 0;
  console.log(`4. Export Fail Rate: ${exportFailRate.toFixed(1)}%`);

  // KPI 5: Validation Blocked Rate
  const blocked = allEvents.filter(e => e.event === "export_blocked_by_validation").length;
  const totalExports = pngEvents.length + pdfEvents.length + blocked;
  const blockedRate = totalExports > 0 ? (blocked / totalExports) * 100 : 0;
  console.log(`5. Validation Blocked Rate: ${blockedRate.toFixed(1)}%`);

  // Top Failure Codes
  const failCodes = allEvents
    .filter(e => e.event === "autobuild_fail")
    .map(e => (e.payload as any).code);
  console.log(`\nTop Failure Codes: ${failCodes.join(", ")}`);

  console.log("\n%c=== END TEST ===", "font-size: 14px; color: #FF9800");

  return {
    activationRate,
    failRate,
    undoRate,
    exportFailRate,
    blockedRate,
    failCodes,
  };
}

// Export for use
if (typeof module !== "undefined" && module.exports) {
  module.exports = { testKPIAnalysis, SAMPLE_LOG_T1, SAMPLE_LOG_T2, SAMPLE_LOG_T3, SAMPLE_LOG_T4, SAMPLE_LOG_T5 };
}

// Auto-run if in browser console
if (typeof window !== "undefined") {
  console.log("KPI Test Script loaded. Run: testKPIAnalysis()");
  (window as any).testKPIAnalysis = testKPIAnalysis;
  (window as any).SAMPLE_LOGS = { T1: SAMPLE_LOG_T1, T2: SAMPLE_LOG_T2, T3: SAMPLE_LOG_T3, T4: SAMPLE_LOG_T4, T5: SAMPLE_LOG_T5 };
}
