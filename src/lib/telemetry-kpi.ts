// ============================================
// Telemetry KPI Analysis - Soft Launch
// 5개 핵심 KPI 계산 및 액션 결정
// ============================================

import type { TelemetryEventName } from "./telemetry";

// ============================================
// Types
// ============================================

interface TelemetryLogEntry {
  timestamp: string;
  event: TelemetryEventName;
  payload: Record<string, unknown>;
  sessionId?: string;
}

interface TelemetryExport {
  exportedAt: string;
  stats: {
    totalEvents: number;
    eventCounts: Record<string, number>;
    sessionDuration: number;
  };
  events: TelemetryLogEntry[];
}

interface KPIResult {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: "pass" | "warn" | "fail";
  action?: string;
}

interface KPIReport {
  analyzedAt: string;
  testerCount: number;
  kpis: KPIResult[];
  topFailureCodes: string[];
  recommendations: string[];
  p2Direction: string;
}

// ============================================
// KPI Calculation Functions
// ============================================

/**
 * Calculate Activation Success Rate
 * Required events: onboarding_completed, concept_clicked, autobuild_success, export_png
 */
function calculateActivationRate(logs: TelemetryExport[]): KPIResult {
  const successCount = logs.filter((log) => {
    const events = new Set(log.events.map((e) => e.event));
    return (
      events.has("onboarding_completed") &&
      events.has("concept_clicked") &&
      events.has("autobuild_success") &&
      events.has("export_png")
    );
  }).length;

  const rate = (successCount / logs.length) * 100;
  const target = 80;

  return {
    name: "Activation 성공률",
    value: rate,
    target,
    unit: "%",
    status: rate >= target ? "pass" : rate >= 60 ? "warn" : "fail",
  };
}

/**
 * Calculate Auto-build Failure Rate
 */
function calculateAutobuildFailRate(allEvents: TelemetryLogEntry[]): KPIResult {
  const success = allEvents.filter((e) => e.event === "autobuild_success").length;
  const fail = allEvents.filter((e) => e.event === "autobuild_fail").length;
  const total = success + fail;

  const rate = total > 0 ? (fail / total) * 100 : 0;
  const target = 20;

  return {
    name: "Auto-build 실패율",
    value: rate,
    target,
    unit: "%",
    status: rate < target ? "pass" : rate < 30 ? "warn" : "fail",
    action: rate >= target ? "suggestion 필터 강화 - 불가능한 컨셉 노출 줄이기" : undefined,
  };
}

/**
 * Calculate Undo After Autobuild Rate
 */
function calculateUndoAfterBuildRate(allEvents: TelemetryLogEntry[]): KPIResult {
  const buildSuccess = allEvents.filter((e) => e.event === "autobuild_success").length;
  const undoAfterBuild = allEvents.filter((e) => e.event === "undo_after_autobuild").length;

  const rate = buildSuccess > 0 ? (undoAfterBuild / buildSuccess) * 100 : 0;
  const target = 30;

  return {
    name: "Undo after autobuild 비율",
    value: rate,
    target,
    unit: "%",
    status: rate < target ? "pass" : rate < 50 ? "warn" : "fail",
    action:
      rate >= target
        ? "auto-build 템플릿 품질 문제 - 컨셉별 루트 각도/깊이 조정"
        : undefined,
  };
}

/**
 * Calculate Export Failure Rate (PNG + PDF)
 */
function calculateExportFailRate(allEvents: TelemetryLogEntry[]): KPIResult {
  const pngEvents = allEvents.filter((e) => e.event === "export_png");
  const pdfEvents = allEvents.filter((e) => e.event === "export_pdf");

  const pngFail = pngEvents.filter((e) => !(e.payload as { success?: boolean }).success).length;
  const pdfFail = pdfEvents.filter((e) => !(e.payload as { success?: boolean }).success).length;

  const total = pngEvents.length + pdfEvents.length;
  const failCount = pngFail + pdfFail;

  const rate = total > 0 ? (failCount / total) * 100 : 0;
  const target = 5;

  return {
    name: "Export 실패율",
    value: rate,
    target,
    unit: "%",
    status: rate < target ? "pass" : rate < 10 ? "warn" : "fail",
    action: rate >= target ? "캡처 안정화 - 폰트/렌더/메모리 패치" : undefined,
  };
}

/**
 * Calculate Validation Blocked Rate
 */
function calculateValidationBlockedRate(allEvents: TelemetryLogEntry[]): KPIResult {
  const blocked = allEvents.filter((e) => e.event === "export_blocked_by_validation").length;
  const pngAttempts = allEvents.filter((e) => e.event === "export_png").length;
  const pdfAttempts = allEvents.filter((e) => e.event === "export_pdf").length;

  const totalAttempts = pngAttempts + pdfAttempts + blocked;
  const rate = totalAttempts > 0 ? (blocked / totalAttempts) * 100 : 0;
  const target = 10;

  return {
    name: "Validation blocked 비율",
    value: rate,
    target,
    unit: "%",
    status: rate < target ? "pass" : rate < 20 ? "warn" : "fail",
  };
}

/**
 * Get top failure codes from autobuild_fail events
 */
function getTopFailureCodes(allEvents: TelemetryLogEntry[]): string[] {
  const failEvents = allEvents.filter((e) => e.event === "autobuild_fail");
  const codeCounts = new Map<string, number>();

  for (const event of failEvents) {
    const code = (event.payload as { code?: string }).code || "unknown";
    codeCounts.set(code, (codeCounts.get(code) || 0) + 1);
  }

  return Array.from(codeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => `${code} (${count}회)`);
}

/**
 * Determine P2 direction based on KPIs
 */
function determineP2Direction(kpis: KPIResult[]): string {
  const activation = kpis.find((k) => k.name === "Activation 성공률");
  const undoRate = kpis.find((k) => k.name === "Undo after autobuild 비율");
  const buildFail = kpis.find((k) => k.name === "Auto-build 실패율");

  // Auto-build 실패/Undo가 높으면 P1.2에서 템플릿 품질 먼저
  if ((undoRate?.status === "fail" || buildFail?.status === "fail")) {
    return "P1.2 폴리싱 먼저 - 템플릿/매핑 품질 개선 필요";
  }

  // Activation이 낮으면 진입 장벽 낮추기
  if (activation?.status === "fail") {
    return "TeamProfile → FormationPackage - 진입 장벽 낮추기";
  }

  // Activation 좋으면 계속 쓸 이유 강화
  if (activation?.status === "pass") {
    return "Install Focus 확장 (10개 컨셉) - 계속 쓸 이유 강화";
  }

  return "추가 데이터 수집 필요";
}

/**
 * Generate recommendations based on KPIs
 */
function generateRecommendations(kpis: KPIResult[]): string[] {
  const recommendations: string[] = [];

  for (const kpi of kpis) {
    if (kpi.action) {
      recommendations.push(`[${kpi.name}] ${kpi.action}`);
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("모든 KPI가 목표 달성! P2로 진행 가능");
  }

  return recommendations;
}

// ============================================
// Main Analysis Function
// ============================================

/**
 * Analyze multiple telemetry logs and generate KPI report
 */
export function analyzeTelemetryLogs(logs: TelemetryExport[]): KPIReport {
  const allEvents = logs.flatMap((l) => l.events);

  const kpis: KPIResult[] = [
    calculateActivationRate(logs),
    calculateAutobuildFailRate(allEvents),
    calculateUndoAfterBuildRate(allEvents),
    calculateExportFailRate(allEvents),
    calculateValidationBlockedRate(allEvents),
  ];

  const topFailureCodes = getTopFailureCodes(allEvents);
  const recommendations = generateRecommendations(kpis);
  const p2Direction = determineP2Direction(kpis);

  return {
    analyzedAt: new Date().toISOString(),
    testerCount: logs.length,
    kpis,
    topFailureCodes,
    recommendations,
    p2Direction,
  };
}

/**
 * Print KPI report to console (formatted)
 */
export function printKPIReport(report: KPIReport): void {
  console.log("\n%c=== SOFT LAUNCH KPI REPORT ===", "font-size: 16px; font-weight: bold; color: #2196F3");
  console.log(`분석 시간: ${report.analyzedAt}`);
  console.log(`테스터 수: ${report.testerCount}명\n`);

  console.log("%cKPI 결과:", "font-weight: bold");
  for (const kpi of report.kpis) {
    const icon = kpi.status === "pass" ? "✅" : kpi.status === "warn" ? "⚠️" : "❌";
    const color = kpi.status === "pass" ? "#4CAF50" : kpi.status === "warn" ? "#FF9800" : "#FF5722";
    console.log(
      `%c${icon} ${kpi.name}: ${kpi.value.toFixed(1)}${kpi.unit} (목표: ${kpi.target}${kpi.unit})`,
      `color: ${color}`
    );
  }

  if (report.topFailureCodes.length > 0) {
    console.log("\n%cTop 실패 코드:", "font-weight: bold");
    for (const code of report.topFailureCodes) {
      console.log(`  - ${code}`);
    }
  }

  console.log("\n%c권장 액션:", "font-weight: bold");
  for (const rec of report.recommendations) {
    console.log(`  → ${rec}`);
  }

  console.log("\n%cP2 방향:", "font-weight: bold; color: #9C27B0");
  console.log(`  ${report.p2Direction}`);

  console.log("\n%c=== END REPORT ===\n", "font-size: 14px; color: #2196F3");
}

// ============================================
// Window Global for Browser Console Access
// ============================================

if (typeof window !== "undefined") {
  (window as any).__kpi = {
    analyze: analyzeTelemetryLogs,
    print: printKPIReport,
    // Helper to analyze from pasted JSON strings
    analyzeFromJSON: (jsonStrings: string[]) => {
      const logs = jsonStrings.map((s) => JSON.parse(s) as TelemetryExport);
      const report = analyzeTelemetryLogs(logs);
      printKPIReport(report);
      return report;
    },
  };

  console.info(
    "%c[KPI] Analysis tools available: window.__kpi",
    "color: #9E9E9E"
  );
  console.info(
    "  - __kpi.analyzeFromJSON([json1, json2, ...]) - Analyze from JSON strings\n" +
    "  - __kpi.analyze(logs) - Analyze log objects\n" +
    "  - __kpi.print(report) - Print formatted report"
  );
}

export default { analyzeTelemetryLogs, printKPIReport };
