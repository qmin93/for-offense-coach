"use client";

// ============================================
// PlaybookOverview - Stats and distribution
// ============================================

import React from "react";
import { cn } from "@/lib/utils";
import type { PlaybookStats } from "../store";
import {
  Layers,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Hash,
} from "lucide-react";

// ============================================
// Props
// ============================================

interface PlaybookOverviewProps {
  stats: PlaybookStats;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// ============================================
// Mini Bar Chart Component
// ============================================

function MiniBarChart({
  data,
  maxItems = 5,
}: {
  data: Record<string, number>;
  maxItems?: number;
}) {
  const entries = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems);
  const maxValue = Math.max(...entries.map((e) => e[1]), 1);

  return (
    <div className="space-y-1.5">
      {entries.map(([label, count]) => (
        <div key={label} className="flex items-center gap-2">
          <div className="w-20 text-xs text-slate-400 truncate" title={label}>
            {label}
          </div>
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(count / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-6 text-xs text-slate-300 text-right">{count}</div>
        </div>
      ))}
      {entries.length === 0 && (
        <div className="text-xs text-slate-500">No data</div>
      )}
    </div>
  );
}

// ============================================
// Run/Pass Donut Chart
// ============================================

function RunPassDonut({
  ratio,
}: {
  ratio: { run: number; pass: number; rpo: number; other: number };
}) {
  const total = ratio.run + ratio.pass + ratio.rpo + ratio.other || 1;
  const runPct = (ratio.run / total) * 100;
  const passPct = (ratio.pass / total) * 100;
  const rpoPct = (ratio.rpo / total) * 100;

  // Calculate SVG arc paths
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const runOffset = 0;
  const passOffset = (runPct / 100) * circumference;
  const rpoOffset = ((runPct + passPct) / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#334155"
            strokeWidth="12"
          />
          {/* Run segment */}
          {ratio.run > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#10B981"
              strokeWidth="12"
              strokeDasharray={`${(runPct / 100) * circumference} ${circumference}`}
              strokeDashoffset={-runOffset}
            />
          )}
          {/* Pass segment */}
          {ratio.pass > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="12"
              strokeDasharray={`${(passPct / 100) * circumference} ${circumference}`}
              strokeDashoffset={-passOffset}
            />
          )}
          {/* RPO segment */}
          {ratio.rpo > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="12"
              strokeDasharray={`${(rpoPct / 100) * circumference} ${circumference}`}
              strokeDashoffset={-rpoOffset}
            />
          )}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{total}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-xs text-slate-300">Run: {ratio.run} ({Math.round(runPct)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-xs text-slate-300">Pass: {ratio.pass} ({Math.round(passPct)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-xs text-slate-300">RPO: {ratio.rpo} ({Math.round(rpoPct)}%)</span>
        </div>
        {ratio.other > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-500" />
            <span className="text-xs text-slate-300">Other: {ratio.other}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function PlaybookOverview({ stats, isExpanded = true }: PlaybookOverviewProps) {
  if (!isExpanded) {
    // Compact summary
    return (
      <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-white font-medium">{stats.totalPlays} plays</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{stats.totalSections} sections</span>
        </div>
        {stats.lastUpdated && (
          <div className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
            <Calendar className="w-3 h-3" />
            Updated {new Date(stats.lastUpdated).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-blue-400" />
        Playbook Overview
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Run/Pass Distribution */}
        <div>
          <h4 className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1">
            <PieChart className="w-3 h-3" />
            Run/Pass Distribution
          </h4>
          <RunPassDonut ratio={stats.runPassRatio} />
        </div>

        {/* By Formation */}
        <div>
          <h4 className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1">
            <Target className="w-3 h-3" />
            By Formation
          </h4>
          <MiniBarChart data={stats.playsByFormation} />
        </div>

        {/* By Tag */}
        <div>
          <h4 className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1">
            <Hash className="w-3 h-3" />
            By Situation Tag
          </h4>
          <MiniBarChart data={stats.playsByTag} />
        </div>
      </div>

      {/* Section breakdown */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <h4 className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1">
          <Layers className="w-3 h-3" />
          By Section
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(stats.playsBySection).map(([name, count]) => (
            <div
              key={name}
              className="flex items-center justify-between px-3 py-2 bg-slate-700/50 rounded-lg"
            >
              <span className="text-sm text-slate-300">{name}</span>
              <span className="text-sm font-medium text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlaybookOverview;
