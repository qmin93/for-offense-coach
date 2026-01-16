"use client";

// ============================================
// InstallFocusPanel
// 컨셉별 연습 추천 패널 (P1 개선)
// ============================================

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "../store";
import { getPassConceptById } from "@/domain/engine/concepts-pass";
import { getRunConceptById } from "@/domain/engine/concepts-run";
import { telemetry } from "@/lib/telemetry";
import {
  Target,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  ExternalLink,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface DrillVideoRef {
  platform: string;
  url: string;
  accountName?: string;
  hashtags?: string[];
}

interface Drill {
  name: string;
  purpose: string;
  phase: string;
}

interface FailurePoint {
  id: string;
  name: string;
  drill: Drill;
  videoRefs?: DrillVideoRef[];
}

// ============================================
// FailurePointCard Component
// ============================================

interface FailurePointCardProps {
  failurePoint: FailurePoint;
  index: number;
  conceptId: string;
  onDrillClick: (drillId: string, drillName: string) => void;
}

function FailurePointCard({
  failurePoint,
  index,
  conceptId,
  onDrillClick,
}: FailurePointCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasVideo = failurePoint.videoRefs && failurePoint.videoRefs.length > 0;

  const handleVideoClick = (video: DrillVideoRef) => {
    telemetry.drillVideoClicked({
      conceptId,
      drillName: failurePoint.drill.name,
      drillId: failurePoint.id,
      videoUrl: video.url,
    });
    onDrillClick(failurePoint.id, failurePoint.drill.name);
  };

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/30">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-2 p-3 text-left hover:bg-slate-800/50 transition-colors"
      >
        <span className="w-5 h-5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{failurePoint.name}</p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
            {failurePoint.drill.purpose}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-slate-700/50 bg-slate-900/30">
          <div className="pt-3 space-y-3">
            {/* Drill info */}
            <div className="p-2 bg-slate-800/50 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-medium text-white">
                  {failurePoint.drill.name}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] bg-slate-700 text-slate-400 rounded capitalize">
                  {failurePoint.drill.phase}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {failurePoint.drill.purpose}
              </p>
            </div>

            {/* Video refs */}
            {hasVideo && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Video Resources
                </p>
                {failurePoint.videoRefs?.map((video, i) => (
                  <a
                    key={i}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleVideoClick(video)}
                    className="flex items-center gap-2 p-2 bg-slate-800/50 border border-slate-700 rounded hover:border-blue-500/50 transition-colors"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                      <PlayCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300 truncate">
                        {video.accountName || video.platform}
                      </p>
                      {video.hashtags && video.hashtags.length > 0 && (
                        <p className="text-[10px] text-slate-500 truncate">
                          {video.hashtags.slice(0, 2).join(" ")}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

interface InstallFocusPanelProps {
  className?: string;
  defaultExpanded?: boolean;
}

export function InstallFocusPanel({
  className,
  defaultExpanded = false,
}: InstallFocusPanelProps) {
  const play = useEditorStore((s) => s.play);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [hasTrackedOpen, setHasTrackedOpen] = useState(false);

  // Get concept from play
  const conceptId = play?.meta?.conceptId;
  const concept = useMemo(() => {
    if (!conceptId) return null;
    return getPassConceptById(conceptId) || getRunConceptById(conceptId);
  }, [conceptId]);

  const installFocus = concept?.installFocus;
  const failurePoints = installFocus?.failurePoints || [];

  // Track panel open
  const handleExpand = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    if (newExpanded && !hasTrackedOpen && concept) {
      telemetry.installFocusOpened({
        conceptId: concept.id,
        conceptName: concept.name,
        drillCount: failurePoints.length,
      });
      setHasTrackedOpen(true);
    }
  }, [isExpanded, hasTrackedOpen, concept, failurePoints.length]);

  // Reset tracking when concept changes
  useEffect(() => {
    setHasTrackedOpen(false);
  }, [conceptId]);

  const handleDrillClick = useCallback((drillId: string, drillName: string) => {
    // Already tracked in the card component
  }, []);

  // No concept selected
  if (!concept) {
    return (
      <div className={cn("bg-slate-900 rounded-lg border border-slate-800", className)}>
        <div className="p-4 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm text-slate-400">No concept selected</p>
          <p className="text-xs text-slate-500 mt-1">
            Build a concept to see practice recommendations
          </p>
        </div>
      </div>
    );
  }

  // No install focus data
  if (failurePoints.length === 0) {
    return (
      <div className={cn("bg-slate-900 rounded-lg border border-slate-800", className)}>
        <div className="p-4 text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm text-slate-400">
            No drills for <span className="text-white">{concept.name}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-slate-900 rounded-lg border border-slate-800", className)}>
      {/* Header */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-white">Install Focus</span>
          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
            {failurePoints.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{concept.name}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 pt-0 space-y-2">
          {/* Info banner */}
          <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs">
            <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-300/80">
              Common failure points for <span className="font-medium">{concept.name}</span>.
              Focus practice here first.
            </p>
          </div>

          {/* Failure points */}
          {failurePoints.map((fp, index) => (
            <FailurePointCard
              key={fp.id}
              failurePoint={fp}
              index={index}
              conceptId={concept.id}
              onDrillClick={handleDrillClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default InstallFocusPanel;
