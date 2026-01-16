"use client";

// ============================================
// ValidationPanel
// 에디터 실시간 검증 상태 표시 컴포넌트
// ============================================

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ValidationIssue, ValidationResult } from "@/domain/dsl/types";
import {
  validatePlayRealtime,
  getValidationSummary,
  type ValidationSummary,
} from "@/domain/engine/editor-validation";
import { useEditorStore } from "../store";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  X,
} from "lucide-react";

// ============================================
// Severity Icon Component
// ============================================

function SeverityIcon({
  severity,
  className,
}: {
  severity: "error" | "warning" | "info";
  className?: string;
}) {
  switch (severity) {
    case "error":
      return <AlertCircle className={cn("w-4 h-4 text-red-500", className)} />;
    case "warning":
      return <AlertTriangle className={cn("w-4 h-4 text-amber-500", className)} />;
    case "info":
      return <Info className={cn("w-4 h-4 text-blue-400", className)} />;
  }
}

// ============================================
// Issue Item Component
// ============================================

function IssueItem({
  issue,
  onPlayerClick,
}: {
  issue: ValidationIssue;
  onPlayerClick?: (playerId: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 px-3 py-2 text-xs border-b border-slate-700/50 last:border-b-0",
        issue.severity === "error" && "bg-red-500/5",
        issue.severity === "warning" && "bg-amber-500/5",
        issue.severity === "info" && "bg-blue-500/5"
      )}
    >
      <SeverityIcon severity={issue.severity} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 leading-relaxed">{issue.message}</p>
        {issue.playerId && (
          <button
            onClick={() => onPlayerClick?.(issue.playerId!)}
            className="text-blue-400 hover:text-blue-300 text-[10px] mt-0.5 hover:underline"
          >
            Select player
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Summary Badge Component
// ============================================

function SummaryBadge({ summary }: { summary: ValidationSummary }) {
  if (summary.errorCount === 0 && summary.warningCount === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Ready</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {summary.errorCount > 0 && (
        <span className="flex items-center gap-1 text-red-400">
          <AlertCircle className="w-3 h-3" />
          {summary.errorCount}
        </span>
      )}
      {summary.warningCount > 0 && (
        <span className="flex items-center gap-1 text-amber-400">
          <AlertTriangle className="w-3 h-3" />
          {summary.warningCount}
        </span>
      )}
      {summary.infoCount > 0 && (
        <span className="flex items-center gap-1 text-blue-400">
          <Info className="w-3 h-3" />
          {summary.infoCount}
        </span>
      )}
    </div>
  );
}

// ============================================
// ValidationPanel Main Component
// ============================================

interface ValidationPanelProps {
  className?: string;
  defaultExpanded?: boolean;
  showOnlyErrors?: boolean;
}

export function ValidationPanel({
  className,
  defaultExpanded = false,
  showOnlyErrors = false,
}: ValidationPanelProps) {
  const play = useEditorStore((s) => s.play);
  const selectPlayer = useEditorStore((s) => s.selectPlayer);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  // Default to error-only view to reduce noise
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "info">("error");
  const [showWarnings, setShowWarnings] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Run validation on current play
  const validationResult = useMemo(() => {
    return validatePlayRealtime(play);
  }, [play]);

  const summary = useMemo(() => {
    return getValidationSummary(validationResult);
  }, [validationResult]);

  // Separate issues by severity
  const errorIssues = useMemo(() => {
    return validationResult.issues.filter((i) => i.severity === "error");
  }, [validationResult.issues]);

  const warningIssues = useMemo(() => {
    return validationResult.issues.filter((i) => i.severity === "warning");
  }, [validationResult.issues]);

  const infoIssues = useMemo(() => {
    return validationResult.issues.filter((i) => i.severity === "info");
  }, [validationResult.issues]);

  // For backwards compatibility with filter mode
  const filteredIssues = useMemo(() => {
    if (showOnlyErrors) {
      return errorIssues;
    }
    if (filter === "all") return validationResult.issues;
    return validationResult.issues.filter((i) => i.severity === filter);
  }, [validationResult.issues, filter, showOnlyErrors, errorIssues]);

  // Don't render anything if no issues and showOnlyErrors is true
  if (showOnlyErrors && filteredIssues.length === 0) {
    return null;
  }

  // Compact mode when collapsed
  if (!isExpanded) {
    return (
      <div
        className={cn(
          "bg-slate-800/90 border border-slate-700 rounded-lg backdrop-blur-sm",
          className
        )}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700/50 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300">Validation</span>
            <SummaryBadge summary={summary} />
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-slate-800/90 border border-slate-700 rounded-lg backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300">Validation</span>
          <SummaryBadge summary={summary} />
        </div>
        <div className="flex items-center gap-1">
          {/* Filter buttons */}
          {!showOnlyErrors && (
            <div className="flex items-center gap-0.5 mr-2">
              <FilterButton
                label="All"
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
              <FilterButton
                label="Errors"
                count={summary.errorCount}
                active={filter === "error"}
                onClick={() => setFilter("error")}
                severity="error"
              />
              <FilterButton
                label="Warnings"
                count={summary.warningCount}
                active={filter === "warning"}
                onClick={() => setFilter("warning")}
                severity="warning"
              />
              <FilterButton
                label="Tips"
                count={summary.infoCount}
                active={filter === "info"}
                onClick={() => setFilter("info")}
                severity="info"
              />
            </div>
          )}
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Issues list - Error-first UX with collapsed warnings/tips */}
      <div className="max-h-[240px] overflow-y-auto">
        {/* Errors section (always visible if any) */}
        {errorIssues.length > 0 && (
          <div>
            {errorIssues.map((issue, index) => (
              <IssueItem
                key={`error-${issue.code}-${index}`}
                issue={issue}
                onPlayerClick={(playerId) => selectPlayer(playerId)}
              />
            ))}
          </div>
        )}

        {/* No errors message */}
        {errorIssues.length === 0 && (
          <div className="px-3 py-3 text-center border-b border-slate-700/50">
            <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-green-400">No errors</p>
          </div>
        )}

        {/* Collapsed warnings section */}
        {warningIssues.length > 0 && (
          <div className="border-t border-slate-700/50">
            <button
              onClick={() => setShowWarnings(!showWarnings)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-700/30 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                <span>
                  {showWarnings ? "Hide" : "Show"} warnings ({warningIssues.length})
                </span>
              </span>
              {showWarnings ? (
                <ChevronUp className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>
            {showWarnings && (
              <div>
                {warningIssues.map((issue, index) => (
                  <IssueItem
                    key={`warn-${issue.code}-${index}`}
                    issue={issue}
                    onPlayerClick={(playerId) => selectPlayer(playerId)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collapsed tips section */}
        {infoIssues.length > 0 && (
          <div className="border-t border-slate-700/50">
            <button
              onClick={() => setShowTips(!showTips)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-700/30 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-blue-400">
                <Info className="w-3 h-3" />
                <span>
                  {showTips ? "Hide" : "Show"} tips ({infoIssues.length})
                </span>
              </span>
              {showTips ? (
                <ChevronUp className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>
            {showTips && (
              <div>
                {infoIssues.map((issue, index) => (
                  <IssueItem
                    key={`info-${issue.code}-${index}`}
                    issue={issue}
                    onPlayerClick={(playerId) => selectPlayer(playerId)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* All clear message */}
        {errorIssues.length === 0 && warningIssues.length === 0 && infoIssues.length === 0 && (
          <div className="px-3 py-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">All checks passed</p>
          </div>
        )}
      </div>

      {/* Footer status */}
      <div className="px-3 py-1.5 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>
            {validationResult.canSave ? "Can save" : "Cannot save"} •{" "}
            {validationResult.canExport ? "Can export" : "Cannot export"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Filter Button Component
// ============================================

function FilterButton({
  label,
  count,
  active,
  onClick,
  severity,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  severity?: "error" | "warning" | "info";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-1.5 py-0.5 text-[10px] rounded transition-colors",
        active
          ? "bg-slate-600 text-white"
          : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "ml-1",
            severity === "error" && "text-red-400",
            severity === "warning" && "text-amber-400",
            severity === "info" && "text-blue-400"
          )}
        >
          ({count})
        </span>
      )}
    </button>
  );
}

// ============================================
// Inline Status Badge (for toolbar)
// ============================================

export function ValidationStatusBadge({ className }: { className?: string }) {
  const play = useEditorStore((s) => s.play);

  const validationResult = useMemo(() => {
    return validatePlayRealtime(play);
  }, [play]);

  const summary = useMemo(() => {
    return getValidationSummary(validationResult);
  }, [validationResult]);

  if (summary.errorCount === 0 && summary.warningCount === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/10 text-green-400 border border-green-500/20",
          className
        )}
        title="No validation issues"
      >
        <CheckCircle2 className="w-3 h-3" />
        <span>Valid</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded text-xs border",
        summary.errorCount > 0
          ? "bg-red-500/10 text-red-400 border-red-500/20"
          : "bg-amber-500/10 text-amber-400 border-amber-500/20",
        className
      )}
      title={summary.topIssue?.message || "Validation issues"}
    >
      {summary.errorCount > 0 ? (
        <>
          <AlertCircle className="w-3 h-3" />
          <span>{summary.errorCount} error{summary.errorCount > 1 ? "s" : ""}</span>
        </>
      ) : (
        <>
          <AlertTriangle className="w-3 h-3" />
          <span>{summary.warningCount} warning{summary.warningCount > 1 ? "s" : ""}</span>
        </>
      )}
    </div>
  );
}

export default ValidationPanel;
