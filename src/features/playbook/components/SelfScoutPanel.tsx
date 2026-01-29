"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  analyzeTendencies,
  type SelfScoutResult,
  type CoachingPoint,
  type FormationTendency,
} from "@/domain/engine/self-scout";
import type { Play } from "@/domain/dsl/types";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  PieChart,
  Target,
  TrendingUp,
  Shield,
} from "lucide-react";

interface SelfScoutPanelProps {
  plays: Play[];
  playbookName: string;
}

export function SelfScoutPanel({ plays, playbookName }: SelfScoutPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SelfScoutResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate async for UX
    setTimeout(() => {
      const analysisResult = analyzeTendencies(plays);
      setResult(analysisResult);
      setIsAnalyzing(false);
    }, 500);
  };

  if (!result) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Self Scout</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Analyze tendencies and get coaching insights for "{playbookName}"
          </p>
        </div>

        {/* CTA */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              See what opponents might discover about your playbook
            </p>
            <Button onClick={handleAnalyze} disabled={isAnalyzing || plays.length === 0}>
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze {plays.length} Plays
                </>
              )}
            </Button>
            {plays.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Add plays to your playbook first
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Self Scout</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleAnalyze}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>

        {/* Score badges */}
        <div className="flex gap-2">
          <div className={cn(
            "flex-1 p-2 rounded-lg text-center",
            result.balanceScore >= 70
              ? "bg-green-50 text-green-700"
              : result.balanceScore >= 40
              ? "bg-amber-50 text-amber-700"
              : "bg-red-50 text-red-700"
          )}>
            <div className="text-lg font-bold">{result.balanceScore}</div>
            <div className="text-[10px] uppercase tracking-wider">Balance</div>
          </div>
          <div className={cn(
            "flex-1 p-2 rounded-lg text-center",
            result.predictabilityScore <= 30
              ? "bg-green-50 text-green-700"
              : result.predictabilityScore <= 60
              ? "bg-amber-50 text-amber-700"
              : "bg-red-50 text-red-700"
          )}>
            <div className="text-lg font-bold">{100 - result.predictabilityScore}</div>
            <div className="text-[10px] uppercase tracking-wider">Unpredictability</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Overview Section */}
        <CollapsibleSection
          title="Overview"
          icon={<PieChart className="w-4 h-4" />}
          expanded={expandedSection === "overview"}
          onToggle={() => setExpandedSection(expandedSection === "overview" ? null : "overview")}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{result.totalPlays}</div>
              <div className="text-xs text-muted-foreground">Total Plays</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-green-600">{result.runPassRatio.runPct}%</span>
                <span className="text-xs text-muted-foreground">run</span>
                <span className="mx-1">/</span>
                <span className="text-lg font-bold text-blue-600">{result.runPassRatio.passPct}%</span>
                <span className="text-xs text-muted-foreground">pass</span>
              </div>
              <div className="text-xs text-muted-foreground">Run/Pass Ratio</div>
            </div>
          </div>

          {/* Visual bar */}
          <div className="mt-3">
            <div className="h-4 rounded-full overflow-hidden bg-muted flex">
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${result.runPassRatio.runPct}%` }}
              />
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${result.runPassRatio.passPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Run ({result.runPassRatio.run})</span>
              <span>Pass ({result.runPassRatio.pass})</span>
            </div>
          </div>
        </CollapsibleSection>

        {/* Coaching Points Section */}
        <CollapsibleSection
          title={`Coaching Points (${result.coachingPoints.length})`}
          icon={<Lightbulb className="w-4 h-4" />}
          expanded={expandedSection === "coaching"}
          onToggle={() => setExpandedSection(expandedSection === "coaching" ? null : "coaching")}
          badgeCount={result.coachingPoints.filter(p => p.type === "warning").length}
          badgeVariant="warning"
        >
          <div className="space-y-2">
            {result.coachingPoints.map((point, index) => (
              <CoachingPointCard key={index} point={point} />
            ))}
          </div>
        </CollapsibleSection>

        {/* Formation Tendencies */}
        <CollapsibleSection
          title="Formation Tendencies"
          icon={<TrendingUp className="w-4 h-4" />}
          expanded={expandedSection === "formations"}
          onToggle={() => setExpandedSection(expandedSection === "formations" ? null : "formations")}
        >
          <div className="space-y-2">
            {result.formationTendencies.slice(0, 5).map((tendency) => (
              <FormationTendencyCard key={tendency.formationId} tendency={tendency} />
            ))}
          </div>
        </CollapsibleSection>

        {/* Concept Usage */}
        <CollapsibleSection
          title="Concept Usage"
          icon={<BarChart3 className="w-4 h-4" />}
          expanded={expandedSection === "concepts"}
          onToggle={() => setExpandedSection(expandedSection === "concepts" ? null : "concepts")}
        >
          <div className="space-y-1">
            {result.conceptTendencies.items.slice(0, 8).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="truncate">{item.name}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}

// ============================================
// Collapsible Section Component
// ============================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badgeCount?: number;
  badgeVariant?: "default" | "warning";
}

function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
  badgeCount,
  badgeVariant = "default",
}: CollapsibleSectionProps) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
          {badgeCount && badgeCount > 0 && (
            <Badge
              variant={badgeVariant === "warning" ? "destructive" : "secondary"}
              className="text-[10px] h-5"
            >
              {badgeCount}
            </Badge>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {expanded && <div className="p-3 pt-0">{children}</div>}
    </div>
  );
}

// ============================================
// Coaching Point Card
// ============================================

interface CoachingPointCardProps {
  point: CoachingPoint;
}

function CoachingPointCard({ point }: CoachingPointCardProps) {
  const iconMap = {
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    suggestion: <Lightbulb className="w-4 h-4 text-blue-500" />,
    strength: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  };

  const bgMap = {
    warning: "bg-amber-50 border-amber-200",
    suggestion: "bg-blue-50 border-blue-200",
    strength: "bg-green-50 border-green-200",
  };

  return (
    <div className={cn("p-3 rounded-lg border", bgMap[point.type])}>
      <div className="flex items-start gap-2">
        {iconMap[point.type]}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{point.title}</div>
          <p className="text-xs text-muted-foreground mt-0.5">{point.description}</p>
          {point.metric && (
            <div className="text-xs font-medium mt-1 text-muted-foreground">
              {point.metric}
            </div>
          )}
          {point.actionable && (
            <div className="text-xs mt-2 p-2 bg-white/50 rounded">
              💡 {point.actionable}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Formation Tendency Card
// ============================================

interface FormationTendencyCardProps {
  tendency: FormationTendency;
}

function FormationTendencyCard({ tendency }: FormationTendencyCardProps) {
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      tendency.dependencyWarning ? "bg-amber-50/50 border-amber-200" : "bg-muted/30 border-border"
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{tendency.formationName}</span>
        <Badge variant="outline" className="text-xs">
          {tendency.percentage}%
        </Badge>
      </div>

      {/* Run/Pass bar */}
      <div className="h-2 rounded-full overflow-hidden bg-muted flex mb-2">
        <div
          className="bg-green-500 transition-all"
          style={{ width: `${tendency.runPct}%` }}
        />
        <div
          className="bg-blue-500 transition-all"
          style={{ width: `${tendency.passPct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Run {tendency.runPct}%</span>
        <span>Pass {tendency.passPct}%</span>
      </div>

      {tendency.dependencyWarning && (
        <div className="text-xs text-amber-600 mt-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {tendency.dependencyWarning}
        </div>
      )}
    </div>
  );
}
