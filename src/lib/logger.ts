// ============================================
// Logger - Unified logging utility
// console.error 난사 대신 구조화된 로깅
// ============================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Environment-based minimum log level
const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatLogEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  return `${prefix} ${entry.message}`;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext
): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };
}

export const log = {
  debug: (message: string, context?: LogContext) => {
    if (!shouldLog("debug")) return;
    const entry = createLogEntry("debug", message, context);
    console.debug(formatLogEntry(entry), context || "");
  },

  info: (message: string, context?: LogContext) => {
    if (!shouldLog("info")) return;
    const entry = createLogEntry("info", message, context);
    console.info(formatLogEntry(entry), context || "");
  },

  warn: (message: string, context?: LogContext) => {
    if (!shouldLog("warn")) return;
    const entry = createLogEntry("warn", message, context);
    console.warn(formatLogEntry(entry), context || "");
  },

  error: (message: string, context?: LogContext) => {
    if (!shouldLog("error")) return;
    const entry = createLogEntry("error", message, context);
    console.error(formatLogEntry(entry), context || "");
    // TODO: Send to Sentry when configured
  },
};

// ============================================
// Editor-specific Event Logger
// 핵심 이벤트만 추적
// ============================================

export type EditorEvent =
  | "APPLY_FORMATION"
  | "APPLY_DEFAULTS"
  | "AUTO_BUILD"
  | "ADD_ACTION"
  | "UPDATE_ACTION"
  | "DELETE_ACTION"
  | "SAVE_START"
  | "SAVE_OK"
  | "SAVE_FAIL"
  | "LOAD_START"
  | "LOAD_OK"
  | "LOAD_FAIL"
  | "REHYDRATE"
  | "UNDO"
  | "REDO"
  | "VALIDATION_FAIL"
  | "APPLY_DEFENSE_PRESET"
  | "RESET_DEFENSE"
  | "RESET_ALL"
  | "TOGGLE_DEFENSE_VISIBILITY"
  | "PLAYBACK_PLAY"
  | "PLAYBACK_PAUSE"
  | "PLAYBACK_SEEK";

// ============================================
// Telemetry Events (MVP 필수 12+)
// ============================================

export type TelemetryEvent =
  | "signup_complete"
  | "first_play_created"
  | "formation_selected"
  | "suggestions_opened"
  | "concept_clicked"
  | "auto_build_completed"
  | "auto_build_failed"
  | "undo_after_autobuild"
  | "export_png"
  | "export_pdf"
  | "share_link_created"
  | "fork_play"
  | "install_focus_opened"
  | "drill_video_clicked";

export interface TelemetryContext extends LogContext {
  userId?: string;
  playId?: string;
  conceptId?: string;
  conceptType?: "pass" | "run";
  formationId?: string;
  exportFormat?: string;
  shareToken?: string;
  sourcePlayId?: string;
  drillName?: string;
}

export const telemetry = {
  track: (event: TelemetryEvent, context?: TelemetryContext) => {
    log.info(`[Telemetry] ${event}`, context);
    // TODO: Send to analytics service (Mixpanel, Amplitude, etc.)
  },
};

export interface EditorEventContext extends LogContext {
  playId?: string;
  playDbId?: string;
  actionCount?: number;
  conceptId?: string;
  formationId?: string;
  error?: string;
  duration?: number;
}

export const editorLog = {
  event: (event: EditorEvent, context?: EditorEventContext) => {
    log.info(`[Editor] ${event}`, context);
  },

  error: (event: EditorEvent, error: Error | string, context?: EditorEventContext) => {
    log.error(`[Editor] ${event}`, {
      ...context,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
  },
};

export default log;
