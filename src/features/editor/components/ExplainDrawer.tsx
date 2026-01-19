"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import type { ScoreBreakdown, RecommendationReason, ContextSnapshot } from "@/domain/dsl/types";
import { telemetry } from "@/lib/telemetry";

// ============================================
// ExplainDrawer Props
// ============================================

interface ExplainDrawerProps {
  conceptId: string;
  conceptName: string;
  score: number;
  breakdown?: ScoreBreakdown;
  reasons: RecommendationReason[];
  contextUsed?: ContextSnapshot;
}

// ============================================
// ExplainDrawer Component
// ============================================

export function ExplainDrawer({
  conceptId,
  conceptName,
  score,
  breakdown,
  reasons,
  contextUsed,
}: ExplainDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Track explain drawer opened
      telemetry.track("reco_explain_opened", {
        conceptId,
        score,
        topReasons: reasons.slice(0, 3).map((r) => ({
          type: r.type,
          text: r.text,
          points: r.points,
        })),
        contextSnapshot: contextUsed,
      });
    }
  };

  // Calculate breakdown percentages for visualization
  const totalPositive = breakdown
    ? breakdown.base + breakdown.context + breakdown.defense + breakdown.situation + breakdown.formation + breakdown.team
    : 0;
  const totalNegative = breakdown ? Math.abs(breakdown.penalties) : 0;

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <Info className="w-3 h-3 mr-1" />
          Explain
          {isOpen ? (
            <ChevronUp className="w-3 h-3 ml-1" />
          ) : (
            <ChevronDown className="w-3 h-3 ml-1" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <div className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50 space-y-3">
          {/* Score Summary */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Score Breakdown
            </span>
            <Badge variant="outline" className="text-xs font-bold">
              Total: {score}
            </Badge>
          </div>

          {/* Score Breakdown Table */}
          {breakdown && (
            <div className="space-y-1.5">
              <ScoreRow label="Base (Concept)" value={breakdown.base} color="slate" />
              <ScoreRow label="Context (Pre-Context)" value={breakdown.context} color="blue" />
              <ScoreRow label="Defense (Box/Front/Shell)" value={breakdown.defense} color="red" />
              <ScoreRow label="Situation (Down/Distance)" value={breakdown.situation} color="amber" />
              <ScoreRow label="Formation Fit" value={breakdown.formation} color="green" />
              <ScoreRow label="Team Profile" value={breakdown.team} color="purple" />
              {breakdown.penalties !== 0 && (
                <ScoreRow
                  label="Penalties/Risk"
                  value={breakdown.penalties}
                  color="red"
                  isNegative
                />
              )}
            </div>
          )}

          {/* Context Factors */}
          {contextUsed && Object.keys(contextUsed).length > 0 && (
            <div className="border-t pt-2">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Context Factors Used
              </div>
              <div className="flex flex-wrap gap-1">
                {contextUsed.playType && (
                  <ContextFactor label="Play" value={contextUsed.playType} />
                )}
                {contextUsed.boxCount && contextUsed.boxCount !== "unknown" && (
                  <ContextFactor label="Box" value={String(contextUsed.boxCount)} />
                )}
                {contextUsed.front && contextUsed.front !== "unknown" && (
                  <ContextFactor label="Front" value={contextUsed.front} />
                )}
                {contextUsed.shell && contextUsed.shell !== "unknown" && (
                  <ContextFactor label="Shell" value={contextUsed.shell} />
                )}
                {contextUsed.down && contextUsed.down !== "-" && (
                  <ContextFactor label="Down" value={String(contextUsed.down)} />
                )}
                {contextUsed.distance && contextUsed.distance !== "-" && (
                  <ContextFactor label="Dist" value={contextUsed.distance} />
                )}
                {contextUsed.hash && contextUsed.hash !== "-" && (
                  <ContextFactor label="Hash" value={contextUsed.hash} />
                )}
              </div>
            </div>
          )}

          {/* All Reasons (expanded view) */}
          {reasons.length > 3 && (
            <div className="border-t pt-2">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                All Factors ({reasons.length})
              </div>
              <div className="space-y-1">
                {reasons.map((reason, i) => (
                  <ReasonRow
                    key={i}
                    reason={reason}
                    onClick={() => {
                      telemetry.track("reco_reason_clicked", {
                        conceptId,
                        reasonType: reason.type,
                        points: reason.points,
                        source: reason.source,
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================
// Helper Components
// ============================================

interface ScoreRowProps {
  label: string;
  value: number;
  color: "slate" | "blue" | "red" | "amber" | "green" | "purple";
  isNegative?: boolean;
}

function ScoreRow({ label, value, color, isNegative }: ScoreRowProps) {
  if (value === 0) return null;

  const colorClasses = {
    slate: "bg-slate-200 dark:bg-slate-700",
    blue: "bg-blue-200 dark:bg-blue-800",
    red: "bg-red-200 dark:bg-red-800",
    amber: "bg-amber-200 dark:bg-amber-800",
    green: "bg-green-200 dark:bg-green-800",
    purple: "bg-purple-200 dark:bg-purple-800",
  };

  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-muted-foreground w-28 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full`}
          style={{ width: `${Math.min(Math.abs(value) * 2, 100)}%` }}
        />
      </div>
      <Badge
        variant="outline"
        className={`text-[9px] px-1 py-0 h-4 font-semibold min-w-[28px] justify-center ${
          value > 0
            ? "bg-green-100 text-green-700 border-green-300"
            : "bg-red-100 text-red-700 border-red-300"
        }`}
      >
        {value > 0 ? "+" : ""}{value}
      </Badge>
    </div>
  );
}

interface ContextFactorProps {
  label: string;
  value: string;
}

function ContextFactor({ label, value }: ContextFactorProps) {
  return (
    <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 bg-white dark:bg-slate-800">
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </Badge>
  );
}

interface ReasonRowProps {
  reason: RecommendationReason;
  onClick?: () => void;
}

function ReasonRow({ reason, onClick }: ReasonRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-1.5 text-[10px] text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded p-1 -m-1 transition-colors"
    >
      <span className={reason.favorable ? "text-green-500" : "text-red-500"}>
        {reason.favorable ? "+" : "-"}
      </span>
      <span className="flex-1 text-foreground">{reason.text}</span>
      {reason.points !== undefined && reason.points !== 0 && (
        <Badge
          variant="outline"
          className={`text-[8px] px-1 py-0 h-3.5 ${
            reason.points > 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {reason.points > 0 ? "+" : ""}{reason.points}
        </Badge>
      )}
      <span className="text-[8px] text-muted-foreground uppercase">
        {reason.source || reason.type}
      </span>
    </button>
  );
}

export default ExplainDrawer;
