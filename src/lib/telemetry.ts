// ============================================
// Telemetry System - P1 Production Ready
// MVP 이벤트 스키마 고정 + console.log 래퍼
// ============================================

import { logTelemetryEvent } from "./telemetry-debugger";
import "./telemetry-kpi"; // Side-effect import for window.__kpi

// ============================================
// Event Types (고정된 스키마)
// ============================================

export type TelemetryEventName =
  // Pre-Context & Intent
  | "intent_selected"
  | "context_initialized"
  | "context_adjusted"
  // Onboarding
  | "onboarding_completed"
  | "onboarding_skipped"
  | "first_play_created"
  // Suggestions & Concepts
  | "suggestions_opened"
  | "concept_clicked"
  | "why_viewed"
  // Formation Recommendations
  | "formation_reco_shown"
  | "formation_reco_selected"
  | "formation_applied"
  | "autobuild_after_reco"
  // Auto-build
  | "autobuild_success"
  | "autobuild_fail"
  | "undo_after_autobuild"
  // Validation
  | "validation_error_viewed"
  | "export_blocked_by_validation"
  // Export
  | "export_png"
  | "export_pdf"
  | "export_overlay_mode_selected"
  // Share & Fork
  | "share_link_created"
  | "share_view_opened"
  | "fork_created"
  // Install Focus
  | "install_focus_opened"
  | "drill_video_clicked"
  | "drill_link_clicked"
  | "drill_link_missing";

// ============================================
// Event Payload Schemas (필드 고정)
// ============================================

// Pre-Context & Intent
export interface IntentSelectedPayload {
  playType: "pass" | "run" | "rpo";
  boxCount: 5 | 6 | 7 | 8 | "unknown";
  front: "even" | "odd" | "over" | "under" | "bear" | "unknown";
}

export interface ContextInitializedPayload {
  source: "default" | "precontext" | "restored";
  contextSummary: {
    playType: string;
    boxCount: string | number;
    front: string;
    pressure: string;
  };
}

export interface ContextAdjustedPayload {
  origin: "panel" | "quickbar" | "reset";
  changedKeysCount: number;
  changedKeys: string[];
}

export interface OnboardingCompletedPayload {
  timeToCompleteMs: number;
  stepsCompleted: number;
  selectedConcept?: string;
}

export interface OnboardingSkippedPayload {
  stepIndex: number;
  timeSpentMs: number;
}

export interface FirstPlayCreatedPayload {
  formationId: string;
  source: "onboarding" | "formation_panel" | "example";
  timeFromStartMs: number;
}

export interface SuggestionsOpenedPayload {
  formationId: string;
  mode: "pass" | "run" | "rpo";
  conceptCount: number;
}

export interface ConceptClickedPayload {
  conceptId: string;
  conceptName: string;
  conceptType: "pass" | "run" | "rpo";
  source: "suggestions" | "library" | "onboarding" | "examples";
  position?: number; // 리스트에서의 위치
}

export interface WhyViewedPayload {
  conceptId: string;
  reasonCount: number;
  expandedTimeMs?: number;
}

// Formation Recommendations
export interface FormationRecoShownPayload {
  count: number;
  hasTeamProfile: boolean;
  topFormationId?: string;
  topScore?: number;
}

export interface FormationRecoSelectedPayload {
  formationId: string;
  formationName: string;
  score: number;
  position: number; // Position in the recommendation list
  hasTeamProfile: boolean;
}

export interface FormationAppliedPayload {
  formationId: string;
  formationName: string;
  source: "recommendation" | "panel" | "onboarding" | "example";
  score?: number;
}

export interface AutobuildAfterRecoPayload {
  formationId: string;
  conceptId?: string;
  success: boolean;
  failureCode?: string;
  timeMs: number;
}

export interface AutobuildSuccessPayload {
  conceptId: string;
  conceptName: string;
  timeMs: number;
  actionsGenerated: number;
  playersAssigned: number;
}

export interface AutobuildFailPayload {
  conceptId: string;
  conceptName: string;
  code: string;
  message: string;
  missingRoles?: string[];
  requiredCount?: number;
  availableCount?: number;
}

export interface UndoAfterAutobuildPayload {
  conceptId: string;
  conceptName: string;
  reasonCount: number;
  timeFromBuildMs: number;
  undoCount: number; // 연속 undo 횟수
}

export interface ValidationErrorViewedPayload {
  errorCount: number;
  warningCount: number;
  expandedSection: "error" | "warning" | "info";
}

export interface ExportBlockedByValidationPayload {
  playbookId: string;
  errorCount: number;
  errorCodes: string[];
}

export interface ExportPngPayload {
  playId: string;
  timeMs: number;
  scale: number;
  width: number;
  height: number;
  success: boolean;
  error?: string;
}

export interface ExportPdfPayload {
  playbookId: string;
  pages: number;
  style: "classic" | "minimal" | string;
  timeMs: number;
  success: boolean;
  blocked?: boolean;
  error?: string;
}

export interface ExportOverlayModeSelectedPayload {
  mode: "off" | "defense" | "landmarks" | "both";
  playbookId?: string;
  playId?: string;
}

export interface ShareLinkCreatedPayload {
  type: "play" | "playbook";
  targetId: string;
  viewOnly: boolean;
}

export interface ShareViewOpenedPayload {
  type: "play" | "playbook";
  shareToken: string;
  targetId: string;
  targetName?: string;
}

export interface ForkCreatedPayload {
  type: "play" | "playbook";
  sourceId: string;
  sourceOwner?: string;
}

export interface InstallFocusOpenedPayload {
  conceptId: string;
  conceptName: string;
  drillCount: number;
  hasDirectLinksCount?: number;
}

export interface DrillVideoClickedPayload {
  conceptId: string;
  drillName: string;
  drillId: string;
  videoUrl?: string;
}

export interface DrillLinkClickedPayload {
  conceptId: string;
  drillId: string;
  drillName: string;
  action: "watch" | "search_youtube" | "search_instagram";
  hasDirectUrl: boolean;
  query?: string;
  videoUrl?: string;
}

export interface DrillLinkMissingPayload {
  conceptId: string;
  drillId: string;
  drillName: string;
  reason: "no_url";
}

// ============================================
// Event Payload Map (타입 안전성)
// ============================================

export interface TelemetryEventPayloads {
  intent_selected: IntentSelectedPayload;
  context_initialized: ContextInitializedPayload;
  context_adjusted: ContextAdjustedPayload;
  onboarding_completed: OnboardingCompletedPayload;
  onboarding_skipped: OnboardingSkippedPayload;
  first_play_created: FirstPlayCreatedPayload;
  suggestions_opened: SuggestionsOpenedPayload;
  concept_clicked: ConceptClickedPayload;
  why_viewed: WhyViewedPayload;
  // Formation Recommendations
  formation_reco_shown: FormationRecoShownPayload;
  formation_reco_selected: FormationRecoSelectedPayload;
  formation_applied: FormationAppliedPayload;
  autobuild_after_reco: AutobuildAfterRecoPayload;
  // Auto-build
  autobuild_success: AutobuildSuccessPayload;
  autobuild_fail: AutobuildFailPayload;
  undo_after_autobuild: UndoAfterAutobuildPayload;
  validation_error_viewed: ValidationErrorViewedPayload;
  export_blocked_by_validation: ExportBlockedByValidationPayload;
  export_png: ExportPngPayload;
  export_pdf: ExportPdfPayload;
  export_overlay_mode_selected: ExportOverlayModeSelectedPayload;
  share_link_created: ShareLinkCreatedPayload;
  share_view_opened: ShareViewOpenedPayload;
  fork_created: ForkCreatedPayload;
  install_focus_opened: InstallFocusOpenedPayload;
  drill_video_clicked: DrillVideoClickedPayload;
  drill_link_clicked: DrillLinkClickedPayload;
  drill_link_missing: DrillLinkMissingPayload;
}

// ============================================
// Session Context (글로벌 컨텍스트)
// ============================================

interface SessionContext {
  sessionId: string;
  userId?: string;
  startedAt: number;
  isNewUser: boolean;
  onboardingCompletedAt?: number;
}

let sessionContext: SessionContext | null = null;

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function initTelemetrySession(userId?: string, isNewUser = false): void {
  sessionContext = {
    sessionId: generateSessionId(),
    userId,
    startedAt: Date.now(),
    isNewUser,
  };

  if (typeof window !== "undefined") {
    // Session ID를 sessionStorage에 저장
    sessionStorage.setItem("telemetry_session_id", sessionContext.sessionId);
  }

  console.info("[Telemetry] Session initialized", {
    sessionId: sessionContext.sessionId,
    userId,
    isNewUser,
  });
}

export function getSessionContext(): SessionContext | null {
  return sessionContext;
}

// ============================================
// Debounce & Deduplication
// ============================================

const recentEvents = new Map<string, number>();
const DEBOUNCE_MS = 500;
const SESSION_ONCE_EVENTS = new Set<string>();

function shouldEmit(eventName: string, dedupKey?: string): boolean {
  const key = dedupKey || eventName;
  const lastEmit = recentEvents.get(key);
  const now = Date.now();

  if (lastEmit && now - lastEmit < DEBOUNCE_MS) {
    return false;
  }

  recentEvents.set(key, now);
  return true;
}

function markSessionOnce(eventName: string): boolean {
  if (SESSION_ONCE_EVENTS.has(eventName)) {
    return false;
  }
  SESSION_ONCE_EVENTS.add(eventName);
  return true;
}

// ============================================
// Core Track Function
// ============================================

export function track<E extends TelemetryEventName>(
  eventName: E,
  payload: TelemetryEventPayloads[E],
  options?: {
    dedupKey?: string;
    sessionOnce?: boolean;
  }
): void {
  // Session once check
  if (options?.sessionOnce && !markSessionOnce(eventName)) {
    return;
  }

  // Debounce check
  if (!shouldEmit(eventName, options?.dedupKey)) {
    return;
  }

  const fullPayload = {
    event: eventName,
    ...payload,
    _session: sessionContext?.sessionId,
    _timestamp: new Date().toISOString(),
    _timeSinceSessionStart: sessionContext
      ? Date.now() - sessionContext.startedAt
      : undefined,
  };

  // Console output (MVP - 나중에 GA/Mixpanel로 교체)
  console.info(`[Telemetry] ${eventName}`, fullPayload);

  // Log to debugger for QA verification
  logTelemetryEvent(eventName, payload, sessionContext?.sessionId);

  // TODO: Send to analytics service
  // analytics.track(eventName, fullPayload);
}

// ============================================
// Convenience Methods (타입 안전 헬퍼)
// ============================================

export const telemetry = {
  // Generic track (for custom events)
  track,

  // Pre-Context & Intent
  intentSelected: (payload: IntentSelectedPayload) => {
    track("intent_selected", payload);
  },

  contextInitialized: (payload: ContextInitializedPayload) => {
    track("context_initialized", payload);
  },

  contextAdjusted: (payload: ContextAdjustedPayload) => {
    track("context_adjusted", payload, {
      dedupKey: `context_adjusted_${payload.changedKeysCount}`,
    });
  },

  // Onboarding
  onboardingCompleted: (payload: OnboardingCompletedPayload) => {
    track("onboarding_completed", payload, { sessionOnce: true });
  },

  onboardingSkipped: (payload: OnboardingSkippedPayload) => {
    track("onboarding_skipped", payload, { sessionOnce: true });
  },

  firstPlayCreated: (payload: FirstPlayCreatedPayload) => {
    track("first_play_created", payload, { sessionOnce: true });
  },

  // Suggestions
  suggestionsOpened: (payload: SuggestionsOpenedPayload) => {
    track("suggestions_opened", payload, {
      dedupKey: `suggestions_${payload.formationId}_${payload.mode}`,
    });
  },

  conceptClicked: (payload: ConceptClickedPayload) => {
    track("concept_clicked", payload);
  },

  whyViewed: (payload: WhyViewedPayload) => {
    track("why_viewed", payload, {
      dedupKey: `why_${payload.conceptId}`,
    });
  },

  // Formation Recommendations
  formationRecoShown: (payload: FormationRecoShownPayload) => {
    track("formation_reco_shown", payload, {
      dedupKey: `reco_shown_${payload.count}_${payload.hasTeamProfile}`,
    });
  },

  formationRecoSelected: (payload: FormationRecoSelectedPayload) => {
    track("formation_reco_selected", payload);
  },

  formationApplied: (payload: FormationAppliedPayload) => {
    track("formation_applied", payload);
  },

  autobuildAfterReco: (payload: AutobuildAfterRecoPayload) => {
    track("autobuild_after_reco", payload);
  },

  // Auto-build
  autobuildSuccess: (payload: AutobuildSuccessPayload) => {
    track("autobuild_success", payload);
  },

  autobuildFail: (payload: AutobuildFailPayload) => {
    track("autobuild_fail", payload);
  },

  undoAfterAutobuild: (payload: UndoAfterAutobuildPayload) => {
    track("undo_after_autobuild", payload);
  },

  // Validation
  validationErrorViewed: (payload: ValidationErrorViewedPayload) => {
    track("validation_error_viewed", payload, {
      dedupKey: `validation_${payload.expandedSection}`,
    });
  },

  exportBlockedByValidation: (payload: ExportBlockedByValidationPayload) => {
    track("export_blocked_by_validation", payload);
  },

  // Export
  exportPng: (payload: ExportPngPayload) => {
    track("export_png", payload);
  },

  exportPdf: (payload: ExportPdfPayload) => {
    track("export_pdf", payload);
  },

  exportOverlayModeSelected: (payload: ExportOverlayModeSelectedPayload) => {
    track("export_overlay_mode_selected", payload);
  },

  // Share & Fork
  shareLinkCreated: (payload: ShareLinkCreatedPayload) => {
    track("share_link_created", payload);
  },

  shareViewOpened: (payload: ShareViewOpenedPayload) => {
    track("share_view_opened", payload);
  },

  forkCreated: (payload: ForkCreatedPayload) => {
    track("fork_created", payload);
  },

  // Install Focus
  installFocusOpened: (payload: InstallFocusOpenedPayload) => {
    track("install_focus_opened", payload);
  },

  drillVideoClicked: (payload: DrillVideoClickedPayload) => {
    track("drill_video_clicked", payload);
  },

  drillLinkClicked: (payload: DrillLinkClickedPayload) => {
    track("drill_link_clicked", payload);
  },

  drillLinkMissing: (payload: DrillLinkMissingPayload) => {
    track("drill_link_missing", payload);
  },
};

// ============================================
// Performance Timing Helper
// ============================================

const timers = new Map<string, number>();

export function startTimer(key: string): void {
  timers.set(key, performance.now());
}

export function endTimer(key: string): number {
  const start = timers.get(key);
  if (!start) return 0;

  const duration = Math.round(performance.now() - start);
  timers.delete(key);
  return duration;
}

// ============================================
// Auto-build Tracking Context
// ============================================

interface AutobuildContext {
  conceptId: string;
  conceptName: string;
  reasonCount: number;
  startedAt: number;
  completedAt?: number;
}

let lastAutobuildContext: AutobuildContext | null = null;

export function setLastAutobuildContext(context: AutobuildContext): void {
  lastAutobuildContext = context;
}

export function getLastAutobuildContext(): AutobuildContext | null {
  return lastAutobuildContext;
}

export function clearAutobuildContext(): void {
  lastAutobuildContext = null;
}

// ============================================
// Error Reporting Helper (Sentry 연동 대비)
// ============================================

export function reportError(
  error: Error | string,
  context?: Record<string, unknown>
): void {
  const errorInfo = {
    message: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
    _session: sessionContext?.sessionId,
    _timestamp: new Date().toISOString(),
  };

  console.error("[Telemetry:Error]", errorInfo);

  // TODO: Sentry integration
  // Sentry.captureException(error, { extra: context });
}

export default telemetry;
