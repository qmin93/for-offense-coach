"use client";

// ============================================
// TeamProfileForm
// 2-minute team profile input form
// ============================================

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { TeamProfile, RosterAvailability, UnitStrength, StylePreferences } from "@/domain/dsl/types";
import {
  useTeamProfile,
  DEFAULT_ROSTER_AVAILABILITY,
  DEFAULT_UNIT_STRENGTH,
  DEFAULT_STYLE_PREFERENCES,
  computeTeamCapabilities,
} from "@/lib/team-profile";
import {
  Users,
  Dumbbell,
  Settings2,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface TeamProfileFormProps {
  className?: string;
  onSave?: (profile: TeamProfile) => void;
  onClose?: () => void;
  compact?: boolean; // Compact mode for sidebar
}

type FormSection = "roster" | "strength" | "style";

// ============================================
// Slider Component
// ============================================

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  labels?: string[];
}

function SliderInput({
  label,
  value,
  onChange,
  min = 0,
  max = 5,
  step = 1,
  hint,
  labels,
}: SliderInputProps) {
  const displayLabel = labels ? labels[value] || String(value) : String(value);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-300">{label}</label>
        <span className="text-xs font-medium text-white bg-slate-700 px-2 py-0.5 rounded">
          {displayLabel}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

// ============================================
// Select Component
// ============================================

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}

function SelectInput({ label, value, onChange, options, hint }: SelectInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

// ============================================
// Section Component
// ============================================

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}

function Section({ title, icon, expanded, onToggle, children, badge }: SectionProps) {
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-white">{title}</span>
          {badge && (
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {expanded && <div className="p-3 space-y-3 bg-slate-900/50">{children}</div>}
    </div>
  );
}

// ============================================
// Capabilities Preview
// ============================================

interface CapabilitiesPreviewProps {
  profile: TeamProfile;
}

function CapabilitiesPreview({ profile }: CapabilitiesPreviewProps) {
  const capabilities = useMemo(() => computeTeamCapabilities(profile), [profile]);

  const personnelOptions = [
    { key: "canRun10Personnel", label: "10 (4WR)", ok: capabilities.canRun10Personnel },
    { key: "canRun11Personnel", label: "11 (3WR/1TE)", ok: capabilities.canRun11Personnel },
    { key: "canRun12Personnel", label: "12 (2WR/2TE)", ok: capabilities.canRun12Personnel },
    { key: "canRun21Personnel", label: "21 (FB/TE)", ok: capabilities.canRun21Personnel },
    { key: "canRun22Personnel", label: "22 (FB/2TE)", ok: capabilities.canRun22Personnel },
  ];

  return (
    <div className="p-3 bg-slate-800/30 border border-slate-700 rounded-lg space-y-3">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-medium text-slate-300">Your Capabilities</span>
      </div>

      {/* Personnel availability */}
      <div className="space-y-1">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Personnel Groups</p>
        <div className="flex flex-wrap gap-1">
          {personnelOptions.map((p) => (
            <span
              key={p.key}
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded",
                p.ok
                  ? "bg-green-500/20 text-green-400"
                  : "bg-slate-700/50 text-slate-500 line-through"
              )}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-0.5">
          <p className="text-[10px] text-slate-500">Run Block</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-1 rounded-full",
                  i <= capabilities.runBlockingStrength ? "bg-amber-400" : "bg-slate-700"
                )}
              />
            ))}
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] text-slate-500">Pass Pro</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-1 rounded-full",
                  i <= capabilities.passProtectionStrength ? "bg-blue-400" : "bg-slate-700"
                )}
              />
            ))}
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] text-slate-500">Receiving</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-1 rounded-full",
                  i <= capabilities.receivingStrength ? "bg-purple-400" : "bg-slate-700"
                )}
              />
            ))}
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] text-slate-500">Run Game</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-1 rounded-full",
                  i <= capabilities.runGameStrength ? "bg-green-400" : "bg-slate-700"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Style indicators */}
      <div className="flex flex-wrap gap-1">
        {capabilities.preferRun && (
          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
            Run Heavy
          </span>
        )}
        {capabilities.preferPass && (
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
            Pass Heavy
          </span>
        )}
        {capabilities.canPull && (
          <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
            Can Pull
          </span>
        )}
        {capabilities.canMotion && (
          <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
            Uses Motion
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function TeamProfileForm({ className, onSave, onClose, compact = false }: TeamProfileFormProps) {
  const { profile, loading, save, reset, capabilities } = useTeamProfile();
  const [localProfile, setLocalProfile] = useState<TeamProfile | null>(null);
  const [expandedSection, setExpandedSection] = useState<FormSection>("roster");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize local profile when loaded
  useEffect(() => {
    if (profile && !localProfile) {
      setLocalProfile(profile);
    }
  }, [profile, localProfile]);

  // Update roster availability
  const updateRoster = useCallback(
    (key: keyof RosterAvailability, field: "count" | "starterQuality", value: number) => {
      if (!localProfile) return;
      setLocalProfile({
        ...localProfile,
        rosterAvailability: {
          ...localProfile.rosterAvailability,
          [key]: {
            ...localProfile.rosterAvailability[key],
            [field]: value,
          },
        },
      });
      setHasChanges(true);
    },
    [localProfile]
  );

  // Update unit strength
  const updateStrength = useCallback(
    (key: keyof UnitStrength, value: number) => {
      if (!localProfile) return;
      setLocalProfile({
        ...localProfile,
        unitStrength: {
          ...localProfile.unitStrength,
          [key]: value,
        },
      });
      setHasChanges(true);
    },
    [localProfile]
  );

  // Update style preferences
  const updateStyle = useCallback(
    (key: keyof StylePreferences, value: string) => {
      if (!localProfile) return;
      setLocalProfile({
        ...localProfile,
        stylePreferences: {
          ...localProfile.stylePreferences,
          [key]: value,
        },
      });
      setHasChanges(true);
    },
    [localProfile]
  );

  // Update team name
  const updateTeamName = useCallback(
    (name: string) => {
      if (!localProfile) return;
      setLocalProfile({
        ...localProfile,
        teamName: name,
      });
      setHasChanges(true);
    },
    [localProfile]
  );

  // Handle save
  const handleSave = useCallback(() => {
    if (!localProfile) return;
    setSaving(true);
    const success = save(localProfile);
    if (success) {
      setHasChanges(false);
      onSave?.(localProfile);
    }
    setSaving(false);
  }, [localProfile, save, onSave]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (confirm("Reset to default profile? This will clear your customizations.")) {
      reset();
      setLocalProfile(profile);
      setHasChanges(false);
    }
  }, [reset, profile]);

  // Toggle section
  const toggleSection = useCallback((section: FormSection) => {
    setExpandedSection((prev) => (prev === section ? section : section));
  }, []);

  if (loading || !localProfile) {
    return (
      <div className={cn("p-4 text-center", className)}>
        <div className="text-slate-400 text-sm">Loading team profile...</div>
      </div>
    );
  }

  const qualityLabels = ["N/A", "Poor", "Below Avg", "Average", "Above Avg", "Elite"];

  return (
    <div className={cn("bg-slate-900 rounded-lg", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Team Profile</h2>
          {hasChanges && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
              Unsaved
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure your team to get personalized formation recommendations
        </p>
      </div>

      {/* Team Name */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <label className="text-xs text-slate-300">Team Name</label>
        <input
          type="text"
          value={localProfile.teamName}
          onChange={(e) => updateTeamName(e.target.value)}
          className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="My Team"
        />
      </div>

      {/* Sections */}
      <div className="p-3 space-y-2">
        {/* Roster Section */}
        <Section
          title="Roster Availability"
          icon={<Users className="w-4 h-4 text-blue-400" />}
          expanded={expandedSection === "roster"}
          onToggle={() => toggleSection("roster")}
          badge="Required"
        >
          <div className="space-y-4">
            {/* Position counts */}
            <div className="grid grid-cols-2 gap-3">
              <SliderInput
                label="Quarterbacks"
                value={localProfile.rosterAvailability.QB.count}
                onChange={(v) => updateRoster("QB", "count", v)}
                min={1}
                max={4}
                hint="Available QBs"
              />
              <SliderInput
                label="Running Backs"
                value={localProfile.rosterAvailability.RB.count}
                onChange={(v) => updateRoster("RB", "count", v)}
                min={1}
                max={6}
                hint="Available RBs"
              />
              <SliderInput
                label="Fullbacks"
                value={localProfile.rosterAvailability.FB.count}
                onChange={(v) => updateRoster("FB", "count", v)}
                min={0}
                max={2}
                hint="0 = no FB personnel"
              />
              <SliderInput
                label="Wide Receivers"
                value={localProfile.rosterAvailability.WR.count}
                onChange={(v) => updateRoster("WR", "count", v)}
                min={2}
                max={8}
                hint="Available WRs"
              />
              <SliderInput
                label="Tight Ends"
                value={localProfile.rosterAvailability.TE.count}
                onChange={(v) => updateRoster("TE", "count", v)}
                min={0}
                max={4}
                hint="0 = spread only"
              />
              <SliderInput
                label="O-Linemen"
                value={localProfile.rosterAvailability.OL.count}
                onChange={(v) => updateRoster("OL", "count", v)}
                min={5}
                max={12}
                hint="Total available OL"
              />
            </div>
          </div>
        </Section>

        {/* Unit Strength Section */}
        <Section
          title="Unit Strengths"
          icon={<Dumbbell className="w-4 h-4 text-amber-400" />}
          expanded={expandedSection === "strength"}
          onToggle={() => toggleSection("strength")}
        >
          <div className="space-y-3">
            <SliderInput
              label="OL Run Blocking"
              value={localProfile.unitStrength.olRunBlock}
              onChange={(v) => updateStrength("olRunBlock", v)}
              min={1}
              max={5}
              labels={qualityLabels}
              hint="Zone/gap blocking ability"
            />
            <SliderInput
              label="OL Pass Protection"
              value={localProfile.unitStrength.olPassPro}
              onChange={(v) => updateStrength("olPassPro", v)}
              min={1}
              max={5}
              labels={qualityLabels}
              hint="Pass protection ability"
            />
            <SliderInput
              label="RB Vision"
              value={localProfile.unitStrength.rbVision}
              onChange={(v) => updateStrength("rbVision", v)}
              min={1}
              max={5}
              labels={qualityLabels}
              hint="Ability to find and hit holes"
            />
            <SliderInput
              label="WR Separation"
              value={localProfile.unitStrength.wrSeparation}
              onChange={(v) => updateStrength("wrSeparation", v)}
              min={1}
              max={5}
              labels={qualityLabels}
              hint="Route running & speed"
            />
            <SliderInput
              label="QB Arm Strength"
              value={localProfile.unitStrength.qbArm}
              onChange={(v) => updateStrength("qbArm", v)}
              min={1}
              max={5}
              labels={qualityLabels}
              hint="Deep ball ability"
            />
            <SliderInput
              label="QB Decision Making"
              value={localProfile.unitStrength.qbDecision}
              onChange={(v) => updateStrength("qbDecision", v)}
              min={1}
              max={5}
              labels={qualityLabels}
              hint="Reading defense, quick decisions"
            />
            {localProfile.rosterAvailability.TE.count > 0 && (
              <>
                <SliderInput
                  label="TE Blocking"
                  value={localProfile.unitStrength.teBlock || 0}
                  onChange={(v) => updateStrength("teBlock", v)}
                  min={0}
                  max={5}
                  labels={qualityLabels}
                  hint="Inline blocking ability"
                />
                <SliderInput
                  label="TE Route Running"
                  value={localProfile.unitStrength.teRoute || 0}
                  onChange={(v) => updateStrength("teRoute", v)}
                  min={0}
                  max={5}
                  labels={qualityLabels}
                  hint="Receiving ability"
                />
              </>
            )}
          </div>
        </Section>

        {/* Style Preferences Section */}
        <Section
          title="Style Preferences"
          icon={<Settings2 className="w-4 h-4 text-purple-400" />}
          expanded={expandedSection === "style"}
          onToggle={() => toggleSection("style")}
        >
          <div className="space-y-3">
            <SelectInput
              label="Run/Pass Balance"
              value={localProfile.stylePreferences.runPassBalance}
              onChange={(v) => updateStyle("runPassBalance", v)}
              options={[
                { value: "run_heavy", label: "Run Heavy (60%+ run)" },
                { value: "balanced", label: "Balanced (50/50)" },
                { value: "pass_heavy", label: "Pass Heavy (60%+ pass)" },
              ]}
              hint="Your offensive philosophy"
            />
            <SelectInput
              label="Under Center Usage"
              value={localProfile.stylePreferences.underCenterUsage}
              onChange={(v) => updateStyle("underCenterUsage", v)}
              options={[
                { value: "low", label: "Low (mostly gun)" },
                { value: "medium", label: "Medium (mixed)" },
                { value: "high", label: "High (mostly under center)" },
              ]}
              hint="QB alignment preference"
            />
            <SelectInput
              label="Motion Usage"
              value={localProfile.stylePreferences.motionUsage}
              onChange={(v) => updateStyle("motionUsage", v)}
              options={[
                { value: "low", label: "Low (minimal motion)" },
                { value: "medium", label: "Medium (situational)" },
                { value: "high", label: "High (frequent motion)" },
              ]}
              hint="Pre-snap motion frequency"
            />
            <SelectInput
              label="Tempo"
              value={localProfile.stylePreferences.tempo}
              onChange={(v) => updateStyle("tempo", v)}
              options={[
                { value: "low", label: "Low (huddle, deliberate)" },
                { value: "medium", label: "Medium (balanced)" },
                { value: "high", label: "High (up-tempo, no-huddle)" },
              ]}
              hint="Game pace preference"
            />
            <SelectInput
              label="Risk Tolerance"
              value={localProfile.stylePreferences.riskTolerance}
              onChange={(v) => updateStyle("riskTolerance", v)}
              options={[
                { value: "conservative", label: "Conservative (low risk)" },
                { value: "normal", label: "Normal (balanced risk)" },
                { value: "aggressive", label: "Aggressive (high risk)" },
              ]}
              hint="Play calling aggressiveness"
            />
          </div>
        </Section>

        {/* Capabilities Preview */}
        {!compact && <CapabilitiesPreview profile={localProfile} />}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={cn(
              hasChanges ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-600"
            )}
          >
            {saving ? (
              "Saving..."
            ) : hasChanges ? (
              <>
                <Save className="w-3 h-3 mr-1" />
                Save Profile
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Saved
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TeamProfileForm;
