"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  SuggestionContext,
  PlayType,
  OffenseContext,
  DefenseContext,
  SituationContext,
  ConstraintsContext,
} from "@/domain/engine/suggestion-context";

// ============================================
// Select Component
// ============================================

interface SelectFieldProps<T extends string | number> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}

function SelectField<T extends string | number>({
  label,
  value,
  onChange,
  options,
  className = "",
}: SelectFieldProps<T>) {
  return (
    <div className={className}>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          const val = typeof value === "number" ? Number(e.target.value) : e.target.value;
          onChange(val as T);
        }}
        className="w-full p-1.5 text-xs border rounded-md bg-background"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================
// Play Type Selector
// ============================================

interface PlayTypeSelectorProps {
  value: PlayType;
  onChange: (value: PlayType) => void;
}

function PlayTypeSelector({ value, onChange }: PlayTypeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {(["run", "pass", "rpo"] as PlayType[]).map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            value === type
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {type.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// ============================================
// Offense Tab
// ============================================

interface OffenseTabProps {
  context: OffenseContext;
  onChange: (updates: Partial<OffenseContext>) => void;
}

function OffenseTab({ context, onChange }: OffenseTabProps) {
  return (
    <div className="space-y-3">
      {/* Personnel Row */}
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Personnel"
          value={context.personnel}
          onChange={(v) => onChange({ personnel: v })}
          options={[
            { value: "10", label: "10 (4 WR)" },
            { value: "11", label: "11 (3 WR, 1 TE)" },
            { value: "12", label: "12 (2 WR, 2 TE)" },
            { value: "13", label: "13 (1 WR, 3 TE)" },
            { value: "20", label: "20 (3 WR, 2 RB)" },
            { value: "21", label: "21 (2 WR, 1 TE, 2 RB)" },
            { value: "22", label: "22 (1 WR, 2 TE, 2 RB)" },
          ]}
        />
        <SelectField
          label="QB Alignment"
          value={context.qbAlignment}
          onChange={(v) => onChange({ qbAlignment: v })}
          options={[
            { value: "gun", label: "Gun" },
            { value: "pistol", label: "Pistol" },
            { value: "under_center", label: "Under Center" },
          ]}
        />
      </div>

      {/* RB & TE Row */}
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="RB Alignment"
          value={context.rbAlignment}
          onChange={(v) => onChange({ rbAlignment: v })}
          options={[
            { value: "dot", label: "Dot (behind)" },
            { value: "strong", label: "Strong" },
            { value: "weak", label: "Weak" },
            { value: "offset_strong", label: "Offset Strong" },
            { value: "offset_weak", label: "Offset Weak" },
          ]}
        />
        <SelectField
          label="TE Attached"
          value={context.teAttached}
          onChange={(v) => onChange({ teAttached: v as 0 | 1 | 2 })}
          options={[
            { value: 0, label: "0" },
            { value: 1, label: "1" },
            { value: 2, label: "2" },
          ]}
        />
      </div>

      {/* Structure Row */}
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Structure"
          value={context.structure || "2x2"}
          onChange={(v) => onChange({ structure: v as OffenseContext["structure"] })}
          options={[
            { value: "2x2", label: "2x2" },
            { value: "3x1", label: "3x1 (Trips)" },
            { value: "bunch", label: "Bunch" },
            { value: "ace", label: "Ace" },
            { value: "I", label: "I-Form" },
            { value: "empty", label: "Empty" },
          ]}
        />
        <SelectField
          label="Split"
          value={context.split}
          onChange={(v) => onChange({ split: v })}
          options={[
            { value: "wide", label: "Wide" },
            { value: "normal", label: "Normal" },
            { value: "condensed", label: "Condensed" },
          ]}
        />
      </div>

      {/* Athlete Profile (collapsible) */}
      <div className="pt-2 border-t">
        <div className="text-xs font-medium text-muted-foreground mb-2">Athlete Profile</div>
        <div className="grid grid-cols-3 gap-2">
          <SelectField
            label="QB Run"
            value={context.qbRunThreat ?? 1}
            onChange={(v) => onChange({ qbRunThreat: v as 0 | 1 | 2 })}
            options={[
              { value: 0, label: "Low" },
              { value: 1, label: "Med" },
              { value: 2, label: "High" },
            ]}
          />
          <SelectField
            label="WR Speed"
            value={context.wrSpeed ?? 1}
            onChange={(v) => onChange({ wrSpeed: v as 0 | 1 | 2 })}
            options={[
              { value: 0, label: "Low" },
              { value: 1, label: "Med" },
              { value: 2, label: "High" },
            ]}
          />
          <SelectField
            label="OL Pull"
            value={context.olPullAbility ?? 1}
            onChange={(v) => onChange({ olPullAbility: v as 0 | 1 | 2 })}
            options={[
              { value: 0, label: "Low" },
              { value: 1, label: "Med" },
              { value: 2, label: "High" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Defense Tab
// ============================================

interface DefenseTabProps {
  context: DefenseContext;
  onChange: (updates: Partial<DefenseContext>) => void;
}

function DefenseTab({ context, onChange }: DefenseTabProps) {
  return (
    <div className="space-y-3">
      {/* Box/Front Row */}
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Box Count"
          value={context.boxCount}
          onChange={(v) => onChange({ boxCount: v as DefenseContext["boxCount"] })}
          options={[
            { value: 5, label: "5" },
            { value: 6, label: "6 (light)" },
            { value: 7, label: "7 (standard)" },
            { value: 8, label: "8 (loaded)" },
          ]}
        />
        <SelectField
          label="Front"
          value={context.front}
          onChange={(v) => onChange({ front: v })}
          options={[
            { value: "even", label: "Even (4-down)" },
            { value: "odd", label: "Odd (3-down)" },
            { value: "over", label: "Over" },
            { value: "under", label: "Under" },
            { value: "bear", label: "Bear" },
          ]}
        />
      </div>

      {/* 3T & Force Row */}
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="3-Tech"
          value={context.threeTech}
          onChange={(v) => onChange({ threeTech: v })}
          options={[
            { value: "none", label: "None" },
            { value: "strong", label: "Strong" },
            { value: "weak", label: "Weak" },
            { value: "both", label: "Both" },
          ]}
        />
        <SelectField
          label="Force Player"
          value={context.forcePlayer}
          onChange={(v) => onChange({ forcePlayer: v })}
          options={[
            { value: "unknown", label: "Unknown" },
            { value: "cb", label: "CB" },
            { value: "s", label: "Safety" },
            { value: "olb", label: "OLB" },
          ]}
        />
      </div>

      {/* Shell/Pressure */}
      <div className="pt-2 border-t">
        <div className="text-xs font-medium text-muted-foreground mb-2">Shell / Pressure</div>
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label="Shell"
            value={context.shell}
            onChange={(v) => onChange({ shell: v })}
            options={[
              { value: "unknown", label: "Unknown" },
              { value: "cover0", label: "Cover 0" },
              { value: "cover1", label: "Cover 1" },
              { value: "cover2", label: "Cover 2" },
              { value: "cover3", label: "Cover 3" },
              { value: "cover4", label: "Cover 4" },
              { value: "cover6", label: "Cover 6" },
            ]}
          />
          <SelectField
            label="Pressure"
            value={context.pressureRate}
            onChange={(v) => onChange({ pressureRate: v })}
            options={[
              { value: "low", label: "Low" },
              { value: "med", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
        </div>
        <div className="mt-2">
          <SelectField
            label="Blitz Tendency"
            value={context.blitzTendency}
            onChange={(v) => onChange({ blitzTendency: v })}
            options={[
              { value: "none", label: "None" },
              { value: "field", label: "Field" },
              { value: "boundary", label: "Boundary" },
              { value: "both", label: "Both" },
            ]}
          />
        </div>
      </div>

      {/* Edge Rules */}
      <div className="pt-2 border-t">
        <div className="text-xs font-medium text-muted-foreground mb-2">Edge Rules</div>
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label="Edge Setting"
            value={context.edgeSetting}
            onChange={(v) => onChange({ edgeSetting: v })}
            options={[
              { value: "unknown", label: "Unknown" },
              { value: "hard", label: "Hard" },
              { value: "soft", label: "Soft" },
            ]}
          />
          <SelectField
            label="Spill/Box"
            value={context.spillOrBox}
            onChange={(v) => onChange({ spillOrBox: v })}
            options={[
              { value: "unknown", label: "Unknown" },
              { value: "spill", label: "Spill" },
              { value: "box", label: "Box" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Situation Tab
// ============================================

interface SituationTabProps {
  context: SituationContext;
  onChange: (updates: Partial<SituationContext>) => void;
}

function SituationTab({ context, onChange }: SituationTabProps) {
  return (
    <div className="space-y-3">
      {/* Down & Distance */}
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Down"
          value={context.down}
          onChange={(v) => onChange({ down: v as SituationContext["down"] })}
          options={[
            { value: 1, label: "1st" },
            { value: 2, label: "2nd" },
            { value: 3, label: "3rd" },
            { value: 4, label: "4th" },
          ]}
        />
        <SelectField
          label="Distance"
          value={context.distance}
          onChange={(v) => onChange({ distance: v })}
          options={[
            { value: "1-2", label: "1-2 yds" },
            { value: "3-5", label: "3-5 yds" },
            { value: "6-9", label: "6-9 yds" },
            { value: "10+", label: "10+ yds" },
          ]}
        />
      </div>

      {/* Field Zone */}
      <SelectField
        label="Field Zone"
        value={context.fieldZone}
        onChange={(v) => onChange({ fieldZone: v })}
        options={[
          { value: "coming_out", label: "Coming Out (own 1-20)" },
          { value: "open_field", label: "Open Field (21-79)" },
          { value: "high_red", label: "High Red (opp 20-10)" },
          { value: "low_red", label: "Low Red (opp 10-3)" },
          { value: "goal_line", label: "Goal Line (opp 3-GL)" },
        ]}
      />

      {/* Tempo & Objective */}
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Tempo"
          value={context.tempo}
          onChange={(v) => onChange({ tempo: v })}
          options={[
            { value: "huddle", label: "Huddle" },
            { value: "no_huddle", label: "No Huddle" },
            { value: "2min", label: "2-Min" },
          ]}
        />
        <SelectField
          label="Objective"
          value={context.objective}
          onChange={(v) => onChange({ objective: v })}
          options={[
            { value: "stay_ahead", label: "Stay Ahead" },
            { value: "explosive", label: "Explosive" },
            { value: "kill_clock", label: "Kill Clock" },
            { value: "score_now", label: "Score Now" },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================
// Constraints Tab
// ============================================

interface ConstraintsTabProps {
  context: ConstraintsContext;
  onChange: (updates: Partial<ConstraintsContext>) => void;
}

function ConstraintsTab({ context, onChange }: ConstraintsTabProps) {
  const tagOptions = ["QB run", "screen", "TE involved", "play-action", "motion", "RPO"];

  const toggleTag = (tag: string) => {
    const current = context.mustIncludeTags;
    const newTags = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    onChange({ mustIncludeTags: newTags });
  };

  return (
    <div className="space-y-3">
      {/* Risk & Complexity */}
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Risk Tolerance"
          value={context.riskTolerance}
          onChange={(v) => onChange({ riskTolerance: v })}
          options={[
            { value: "conservative", label: "Conservative" },
            { value: "balanced", label: "Balanced" },
            { value: "aggressive", label: "Aggressive" },
          ]}
        />
        <SelectField
          label="Install Complexity"
          value={context.installComplexity}
          onChange={(v) => onChange({ installComplexity: v })}
          options={[
            { value: "simple", label: "Simple" },
            { value: "medium", label: "Medium" },
            { value: "advanced", label: "Advanced" },
          ]}
        />
      </div>

      {/* Must Include Tags */}
      <div>
        <label className="text-xs text-muted-foreground block mb-2">Must Include</label>
        <div className="flex flex-wrap gap-1">
          {tagOptions.map((tag) => (
            <Badge
              key={tag}
              variant={context.mustIncludeTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

interface ContextInputFormProps {
  context: SuggestionContext;
  onChange: (context: SuggestionContext) => void;
}

export function ContextInputForm({ context, onChange }: ContextInputFormProps) {
  const updateOffense = (updates: Partial<OffenseContext>) => {
    onChange({ ...context, offense: { ...context.offense, ...updates } });
  };

  const updateDefense = (updates: Partial<DefenseContext>) => {
    onChange({ ...context, defense: { ...context.defense, ...updates } });
  };

  const updateSituation = (updates: Partial<SituationContext>) => {
    onChange({ ...context, situation: { ...context.situation, ...updates } });
  };

  const updateConstraints = (updates: Partial<ConstraintsContext>) => {
    onChange({ ...context, constraints: { ...context.constraints, ...updates } });
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-3 space-y-3">
        {/* Play Type Selector */}
        <PlayTypeSelector
          value={context.playType}
          onChange={(playType) => onChange({ ...context, playType })}
        />

        {/* Context Tabs */}
        <Tabs defaultValue="defense" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-8">
            <TabsTrigger value="offense" className="text-xs px-1">Off</TabsTrigger>
            <TabsTrigger value="defense" className="text-xs px-1">Def</TabsTrigger>
            <TabsTrigger value="situation" className="text-xs px-1">Sit</TabsTrigger>
            <TabsTrigger value="constraints" className="text-xs px-1">Const</TabsTrigger>
          </TabsList>

          <TabsContent value="offense" className="mt-3">
            <OffenseTab context={context.offense} onChange={updateOffense} />
          </TabsContent>

          <TabsContent value="defense" className="mt-3">
            <DefenseTab context={context.defense} onChange={updateDefense} />
          </TabsContent>

          <TabsContent value="situation" className="mt-3">
            <SituationTab context={context.situation} onChange={updateSituation} />
          </TabsContent>

          <TabsContent value="constraints" className="mt-3">
            <ConstraintsTab context={context.constraints} onChange={updateConstraints} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
