"use client";

// ============================================
// ExportValidationDialog
// PDF 내보내기 전 품질 검증 다이얼로그
// ============================================

import React, { useMemo, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Play, Playbook } from "@/domain/dsl/types";
import {
  validatePlaybookForExport,
  type PlaybookValidationResult,
} from "@/domain/engine/playbook-validation";
import { telemetry } from "@/lib/telemetry";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ============================================
// Props
// ============================================

interface ExportValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  playbook: Playbook | null;
  plays: Map<string, Play>;
  isExporting?: boolean;
  exportProgress?: number;
}

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
// Play Issue Card Component
// ============================================

function PlayIssueCard({
  playName,
  issues,
  isExpanded,
  onToggle,
}: {
  playName: string;
  issues: string[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-slate-200">{playName}</span>
          <span className="text-xs text-slate-400">({issues.length} issue{issues.length > 1 ? "s" : ""})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {isExpanded && (
        <div className="px-3 py-2 space-y-1 bg-slate-900/50">
          {issues.map((issue, index) => (
            <div key={index} className="text-xs text-slate-400 flex items-start gap-2">
              <span className="text-slate-500">•</span>
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ExportValidationDialog({
  isOpen,
  onClose,
  onExport,
  playbook,
  plays,
  isExporting = false,
  exportProgress = 0,
}: ExportValidationDialogProps) {
  const [expandedPlayId, setExpandedPlayId] = React.useState<string | null>(null);
  const hasTrackedBlock = useRef(false);

  // Run validation
  const validationResult = useMemo(() => {
    return validatePlaybookForExport(playbook, plays);
  }, [playbook, plays]);

  const { summary } = validationResult;

  // Track when export is blocked by validation
  useEffect(() => {
    if (isOpen && !validationResult.canExport && !hasTrackedBlock.current && playbook) {
      const errorIssues = validationResult.issues.filter((i) => i.severity === "error");
      telemetry.exportBlockedByValidation({
        playbookId: playbook.id,
        errorCount: summary.errorCount,
        errorCodes: errorIssues.map((i) => i.code).filter((c, i, arr) => arr.indexOf(c) === i),
      });
      hasTrackedBlock.current = true;
    }
    // Reset tracking when dialog closes
    if (!isOpen) {
      hasTrackedBlock.current = false;
    }
  }, [isOpen, validationResult.canExport, playbook, summary.errorCount, validationResult.issues]);

  // Wrap onExport to track
  const handleExport = useCallback(() => {
    onExport();
  }, [onExport]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Export PDF</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            disabled={isExporting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              {validationResult.canExport ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {summary.playCount} play{summary.playCount > 1 ? "s" : ""} to export
                </p>
                <p className="text-xs text-slate-400">
                  {summary.validPlayCount} ready, {summary.problematicPlays.length} with issues
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {summary.errorCount > 0 && (
                <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded">
                  <AlertCircle className="w-3 h-3" />
                  {summary.errorCount}
                </span>
              )}
              {summary.warningCount > 0 && (
                <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                  <AlertTriangle className="w-3 h-3" />
                  {summary.warningCount}
                </span>
              )}
              {summary.infoCount > 0 && (
                <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                  <Info className="w-3 h-3" />
                  {summary.infoCount}
                </span>
              )}
            </div>
          </div>

          {/* Limit warning */}
          {summary.playCount > 10 && (
            <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Only the first 10 plays will be exported (free tier limit)</span>
            </div>
          )}

          {/* Can't export warning */}
          {!validationResult.canExport && (
            <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Cannot export: Please fix errors first</span>
            </div>
          )}

          {/* Problematic plays */}
          {summary.problematicPlays.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium">
                Issues found in {summary.problematicPlays.length} play
                {summary.problematicPlays.length > 1 ? "s" : ""}:
              </p>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {summary.problematicPlays.map((play) => (
                  <PlayIssueCard
                    key={play.id}
                    playName={play.name}
                    issues={play.issues}
                    isExpanded={expandedPlayId === play.id}
                    onToggle={() =>
                      setExpandedPlayId(expandedPlayId === play.id ? null : play.id)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* All good message */}
          {summary.problematicPlays.length === 0 && validationResult.canExport && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-green-400 font-medium">Ready to export</p>
                <p className="text-xs text-green-400/70">All plays pass validation</p>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Generating PDF...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-700 bg-slate-800/50">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !validationResult.canExport}
            className={cn(
              validationResult.canExport
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-slate-600 cursor-not-allowed"
            )}
          >
            {isExporting ? (
              "Exporting..."
            ) : (
              <>
                Export PDF
                {summary.warningCount > 0 && !validationResult.canExport ? (
                  ""
                ) : summary.warningCount > 0 ? (
                  ` (${summary.warningCount} warnings)`
                ) : (
                  ""
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ExportValidationDialog;
