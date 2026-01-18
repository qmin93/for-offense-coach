"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Play,
  RefreshCw,
  Star,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type {
  InstallPlan,
  InstallDayPlan,
  InstallPlanSettings,
} from "@/domain/engine/install-plan";

interface InstallPlanPanelProps {
  playbookId: string;
  playbookName: string;
  playCount: number;
}

export function InstallPlanPanel({
  playbookId,
  playbookName,
  playCount,
}: InstallPlanPanelProps) {
  const [plan, setPlan] = useState<InstallPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<Partial<InstallPlanSettings>>({
    practiceLength: "normal",
    emphasisArea: "balanced",
    installSpeed: "normal",
  });

  const generatePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/playbooks/${playbookId}/install-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate install plan");
      }

      const data = await response.json();
      setPlan(data);

      // Expand first day by default
      if (data.days.length > 0) {
        setExpandedDays(new Set([data.days[0].day]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const exportPlan = () => {
    if (!plan) return;

    const text = generatePlanText(plan);
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `install-plan-${playbookName.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Install Plan Generator</h3>
          </div>
          {plan && (
            <Button variant="ghost" size="sm" onClick={exportPlan}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Generate a 5-day practice install plan from {playCount} plays in "{playbookName}"
        </p>

        {/* Settings */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="text-xs text-muted-foreground">Practice Length</label>
            <select
              className="w-full mt-1 px-2 py-1 text-sm rounded border border-border bg-background"
              value={settings.practiceLength}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  practiceLength: e.target.value as "short" | "normal" | "extended",
                }))
              }
            >
              <option value="short">Short (60 min)</option>
              <option value="normal">Normal (90 min)</option>
              <option value="extended">Extended (120 min)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Emphasis</label>
            <select
              className="w-full mt-1 px-2 py-1 text-sm rounded border border-border bg-background"
              value={settings.emphasisArea}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  emphasisArea: e.target.value as "balanced" | "run_heavy" | "pass_heavy",
                }))
              }
            >
              <option value="balanced">Balanced</option>
              <option value="run_heavy">Run Heavy</option>
              <option value="pass_heavy">Pass Heavy</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Install Speed</label>
            <select
              className="w-full mt-1 px-2 py-1 text-sm rounded border border-border bg-background"
              value={settings.installSpeed}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  installSpeed: e.target.value as "conservative" | "normal" | "aggressive",
                }))
              }
            >
              <option value="conservative">Conservative</option>
              <option value="normal">Normal</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
        </div>

        <Button
          onClick={generatePlan}
          disabled={loading || playCount === 0}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : plan ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Plan
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Generate Install Plan
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 mx-4 mt-4 text-sm text-red-600 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Plan Content */}
      {plan && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Summary */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Plan Summary</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-primary">{plan.days.length}</div>
                <div className="text-xs text-muted-foreground">Days</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">{plan.totalPlays}</div>
                <div className="text-xs text-muted-foreground">Plays</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">
                  {plan.days.reduce((sum, d) => sum + d.totalMinutes, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Min</div>
              </div>
            </div>
          </div>

          {/* Days */}
          {plan.days.map((day) => (
            <DayCard
              key={day.day}
              day={day}
              expanded={expandedDays.has(day.day)}
              onToggle={() => toggleDay(day.day)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!plan && !loading && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              Click "Generate Install Plan" to create a 5-day practice schedule
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Day Card Component
interface DayCardProps {
  day: InstallDayPlan;
  expanded: boolean;
  onToggle: () => void;
}

function DayCard({ day, expanded, onToggle }: DayCardProps) {
  const dayColors: Record<string, string> = {
    day1_base_run: "bg-green-500",
    day2_play_action: "bg-blue-500",
    day3_third_down: "bg-amber-500",
    day4_situational: "bg-red-500",
    day5_team_reps: "bg-purple-500",
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
      >
        <div className={cn("w-1 h-10 rounded-full", dayColors[day.day] || "bg-gray-500")} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{day.label}</div>
          <div className="text-xs text-muted-foreground truncate">{day.focus}</div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            {day.totalMinutes}m
          </div>
          <div className="text-xs">{day.plays.length} plays</div>
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-border p-3 space-y-3 bg-muted/20">
          {/* Description */}
          <p className="text-xs text-muted-foreground">{day.description}</p>

          {/* Plays */}
          {day.plays.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Plays ({day.plays.length})
              </h4>
              <div className="space-y-1">
                {day.plays.map((play) => (
                  <div
                    key={play.playId}
                    className="flex items-center gap-2 text-sm py-1"
                  >
                    {play.priority === "core" ? (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    ) : play.priority === "secondary" ? (
                      <div className="w-3 h-3 rounded-full bg-primary/50" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                    )}
                    <span className="flex-1 truncate">{play.playName}</span>
                    <span className="text-xs text-muted-foreground">
                      {play.repCount} reps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drills */}
          {day.drills.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Drills
              </h4>
              <div className="space-y-2">
                {day.drills.map((drill) => (
                  <div
                    key={drill.id}
                    className="text-xs p-2 bg-background rounded border border-border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{drill.name}</span>
                      <span className="text-muted-foreground">
                        {drill.durationMinutes}m • {drill.phase}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{drill.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {day.notes.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Coach Notes
              </h4>
              <ul className="space-y-1">
                {day.notes.map((note, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span>•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper to generate text export
function generatePlanText(plan: InstallPlan): string {
  const lines: string[] = [
    `# ${plan.name}`,
    `Generated: ${new Date(plan.generatedAt).toLocaleDateString()}`,
    `Total Plays: ${plan.totalPlays}`,
    "",
    "---",
    "",
  ];

  for (const day of plan.days) {
    lines.push(`## ${day.label}`);
    lines.push(`**Focus:** ${day.focus}`);
    lines.push(`**Duration:** ${day.totalMinutes} minutes`);
    lines.push("");

    if (day.plays.length > 0) {
      lines.push("### Plays");
      for (const play of day.plays) {
        const icon = play.priority === "core" ? "⭐" : play.priority === "secondary" ? "•" : "○";
        lines.push(`${icon} ${play.playName} (${play.repCount} reps)`);
      }
      lines.push("");
    }

    if (day.drills.length > 0) {
      lines.push("### Drills");
      for (const drill of day.drills) {
        lines.push(`- **${drill.name}** (${drill.durationMinutes} min, ${drill.phase})`);
        lines.push(`  ${drill.purpose}`);
      }
      lines.push("");
    }

    if (day.notes.length > 0) {
      lines.push("### Notes");
      for (const note of day.notes) {
        lines.push(`- ${note}`);
      }
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}
