"use client";

// ============================================
// RecoveryDialog
// 데이터 손상 시 복구 다이얼로그
// ============================================

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Snapshot, RecoveryInfo } from "../snapshot-manager";
import {
  AlertCircle,
  RotateCcw,
  Clock,
  CheckCircle2,
  X,
  AlertTriangle,
  FileText,
} from "lucide-react";

// ============================================
// Props
// ============================================

interface RecoveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRecover: (snapshotId: string) => void;
  onContinueAnyway: () => void;
  recoveryInfo: RecoveryInfo;
  allSnapshots: Snapshot[];
}

// ============================================
// Snapshot Card Component
// ============================================

function SnapshotCard({
  snapshot,
  isRecommended,
  onSelect,
}: {
  snapshot: Snapshot;
  isRecommended?: boolean;
  onSelect: () => void;
}) {
  const timeAgo = useMemo(() => {
    const now = new Date();
    const snapshotTime = new Date(snapshot.timestamp);
    const diffMs = now.getTime() - snapshotTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return snapshotTime.toLocaleDateString();
  }, [snapshot.timestamp]);

  const sourceLabel = {
    auto: "Auto-saved",
    manual: "Manual save",
    save: "Saved",
  }[snapshot.source];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-colors",
        isRecommended
          ? "border-green-500/50 bg-green-500/10 hover:bg-green-500/20"
          : "border-slate-700 bg-slate-800/50 hover:bg-slate-800"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-200">{timeAgo}</span>
          {isRecommended && (
            <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
              Recommended
            </span>
          )}
        </div>
        {snapshot.validation.valid ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        )}
      </div>
      <div className="mt-1 text-xs text-slate-400">
        {sourceLabel} • {snapshot.play.actions?.length || 0} actions
        {!snapshot.validation.valid && (
          <span className="text-amber-400">
            {" "}
            • {snapshot.validation.errorCount} error
            {snapshot.validation.errorCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </button>
  );
}

// ============================================
// Main Component
// ============================================

export function RecoveryDialog({
  isOpen,
  onClose,
  onRecover,
  onContinueAnyway,
  recoveryInfo,
  allSnapshots,
}: RecoveryDialogProps) {
  if (!isOpen) return null;

  const reasonText = {
    corruption: "Your play data appears to be corrupted",
    crash: "It looks like the editor crashed or closed unexpectedly",
    mismatch: "The play data doesn't match the expected format",
  }[recoveryInfo.reason || "corruption"];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-red-500/10">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Recovery Available</h3>
            <p className="text-sm text-slate-400">{reasonText}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Error details */}
          {recoveryInfo.currentErrors.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs font-medium text-red-400 mb-1">
                Issues detected:
              </p>
              <ul className="text-xs text-red-300 space-y-0.5">
                {recoveryInfo.currentErrors.slice(0, 3).map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
                {recoveryInfo.currentErrors.length > 3 && (
                  <li className="text-slate-400">
                    ...and {recoveryInfo.currentErrors.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Snapshots */}
          {allSnapshots.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-300 font-medium">
                Recover from a previous save:
              </p>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {allSnapshots.map((snapshot, index) => (
                  <SnapshotCard
                    key={snapshot.id}
                    snapshot={snapshot}
                    isRecommended={
                      index === 0 ||
                      snapshot.id === recoveryInfo.lastGoodSnapshot?.id
                    }
                    onSelect={() => onRecover(snapshot.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recovery snapshots available</p>
              <p className="text-xs mt-1">
                The editor will auto-save valid states periodically
              </p>
            </div>
          )}

          {/* Recommended action */}
          {recoveryInfo.lastGoodSnapshot && (
            <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <RotateCcw className="w-4 h-4 text-green-400 shrink-0" />
              <p className="text-xs text-green-300">
                We recommend recovering from the last valid save (
                {new Date(
                  recoveryInfo.lastGoodSnapshot.timestamp
                ).toLocaleTimeString()}
                )
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-slate-800/50">
          <Button
            variant="ghost"
            onClick={onContinueAnyway}
            className="text-slate-400 hover:text-white"
          >
            Continue without recovery
          </Button>
          {recoveryInfo.lastGoodSnapshot && (
            <Button
              onClick={() => onRecover(recoveryInfo.lastGoodSnapshot!.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Recover
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecoveryDialog;
