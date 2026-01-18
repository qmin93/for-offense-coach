// ============================================
// Install Plan Generator
// Rule-based practice planning from Playbook
// ============================================

import type { Play, Playbook, PlaybookSection, ConceptCategory, ConceptType } from "../dsl/types";

// ============================================
// Types
// ============================================

export type InstallDay =
  | "day1_base_run"
  | "day2_play_action"
  | "day3_third_down"
  | "day4_situational"
  | "day5_team_reps";

export type DrillPhase = "individual" | "group" | "team";

export interface InstallDrillItem {
  id: string;
  name: string;
  purpose: string;
  phase: DrillPhase;
  durationMinutes: number;
  playIds: string[];
  notes?: string;
}

export interface InstallDayPlan {
  day: InstallDay;
  label: string;
  focus: string;
  description: string;
  plays: InstallPlayItem[];
  drills: InstallDrillItem[];
  totalMinutes: number;
  notes: string[];
}

export interface InstallPlayItem {
  playId: string;
  playName: string;
  priority: "core" | "secondary" | "situational";
  repCount: number;
  notes?: string;
  tags: string[];
}

export interface InstallPlan {
  id: string;
  name: string;
  playbookId?: string;
  playbookName?: string;
  days: InstallDayPlan[];
  totalPlays: number;
  generatedAt: string;
  settings: InstallPlanSettings;
}

export interface InstallPlanSettings {
  practiceLength: "short" | "normal" | "extended";  // 60, 90, 120 minutes
  emphasisArea: "balanced" | "run_heavy" | "pass_heavy";
  installSpeed: "conservative" | "normal" | "aggressive";
  includeSpecialTeams: boolean;
}

// ============================================
// Constants
// ============================================

const DAY_LABELS: Record<InstallDay, string> = {
  day1_base_run: "Day 1: Base Run Install",
  day2_play_action: "Day 2: Pass Game & PA",
  day3_third_down: "Day 3: 3rd Down & RPO",
  day4_situational: "Day 4: Red Zone & 2-Min",
  day5_team_reps: "Day 5: Team Reps & Review",
};

const DAY_DESCRIPTIONS: Record<InstallDay, string> = {
  day1_base_run: "Foundation run game - Inside Zone, Outside Zone, Duo",
  day2_play_action: "Play action off base runs, intermediate passing concepts",
  day3_third_down: "Quick game, 3rd down conversions, RPO package",
  day4_situational: "Red Zone scoring, Goal Line, 2-Minute Drill",
  day5_team_reps: "Full team install review, situational work",
};

const DAY_FOCUS: Record<InstallDay, string> = {
  day1_base_run: "OL technique, RB vision, blocking schemes",
  day2_play_action: "Fake technique, route timing, QB progressions",
  day3_third_down: "Quick decisions, hot routes, pressure handling",
  day4_situational: "Tempo, clock management, scoring plays",
  day5_team_reps: "Full execution, communication, audibles",
};

// Practice time allocation by phase (in minutes, for normal practice)
const BASE_DRILL_TIME: Record<DrillPhase, number> = {
  individual: 15,
  group: 20,
  team: 25,
};

// ============================================
// Play Categorization Rules
// ============================================

interface PlayAnalysis {
  type: "run" | "pass" | "rpo" | "screen" | "unknown";
  category: string;
  situationTags: string[];
  isBase: boolean;
  isThirdDown: boolean;
  isRedZone: boolean;
}

function analyzePlay(play: Play): PlayAnalysis {
  const tags = play.tags ?? [];
  const conceptId = play.meta?.conceptId ?? "";
  const name = play.name.toLowerCase();

  // Determine type from various sources
  let type: PlayAnalysis["type"] = "unknown";
  let category = "general";
  let isBase = false;
  let isThirdDown = false;
  let isRedZone = false;

  // Check tags first
  if (tags.includes("run") || tags.includes("zone") || tags.includes("gap")) {
    type = "run";
  } else if (tags.includes("pass") || tags.includes("route")) {
    type = "pass";
  } else if (tags.includes("rpo")) {
    type = "rpo";
  } else if (tags.includes("screen")) {
    type = "screen";
  }

  // Check concept ID patterns
  if (conceptId.includes("run_") || conceptId.includes("_zone") || conceptId.includes("_power")) {
    type = "run";
  } else if (conceptId.includes("pass_") || conceptId.includes("_mesh") || conceptId.includes("_stick")) {
    type = "pass";
  } else if (conceptId.includes("rpo_")) {
    type = "rpo";
  }

  // Check name patterns for type
  const runPatterns = ["zone", "power", "counter", "duo", "iso", "trap", "sweep", "toss", "draw", "wham"];
  const passPatterns = ["stick", "mesh", "levels", "smash", "curl", "sail", "post", "corner", "verts", "cross"];
  const rpoPatterns = ["rpo", "read", "option"];
  const screenPatterns = ["screen", "bubble", "jailbreak", "tunnel"];

  for (const pattern of runPatterns) {
    if (name.includes(pattern)) {
      type = "run";
      category = pattern;
      break;
    }
  }
  if (type === "unknown") {
    for (const pattern of passPatterns) {
      if (name.includes(pattern)) {
        type = "pass";
        category = pattern;
        break;
      }
    }
  }
  if (type === "unknown") {
    for (const pattern of rpoPatterns) {
      if (name.includes(pattern)) {
        type = "rpo";
        break;
      }
    }
  }
  if (type === "unknown") {
    for (const pattern of screenPatterns) {
      if (name.includes(pattern)) {
        type = "screen";
        break;
      }
    }
  }

  // Determine if it's a base play
  const baseRunPatterns = ["inside zone", "outside zone", "duo", "power"];
  const basePassPatterns = ["stick", "slant", "mesh", "levels"];
  isBase = baseRunPatterns.some(p => name.includes(p)) || basePassPatterns.some(p => name.includes(p));

  // Check situational tags
  const situationTags: string[] = [];
  if (tags.includes("3rd_down") || tags.includes("third_down") || tags.includes("long_yardage")) {
    isThirdDown = true;
    situationTags.push("3rd_down");
  }
  if (tags.includes("red_zone") || tags.includes("goal_line") || tags.includes("rz")) {
    isRedZone = true;
    situationTags.push("red_zone");
  }
  if (tags.includes("2_minute") || tags.includes("hurry_up")) {
    situationTags.push("2_minute");
  }
  if (tags.includes("short_yardage")) {
    situationTags.push("short_yardage");
  }

  // Category refinement
  if (type === "run") {
    if (name.includes("zone") || conceptId.includes("zone")) {
      category = "zone";
    } else if (name.includes("power") || name.includes("counter") || name.includes("trap")) {
      category = "gap";
    } else if (name.includes("sweep") || name.includes("toss") || name.includes("jet")) {
      category = "perimeter";
    }
  } else if (type === "pass") {
    if (tags.includes("quick") || name.includes("slant") || name.includes("hitch")) {
      category = "quick";
    } else if (tags.includes("intermediate") || name.includes("dig") || name.includes("curl")) {
      category = "intermediate";
    } else if (tags.includes("deep") || name.includes("post") || name.includes("corner") || name.includes("go")) {
      category = "deep";
    }
  }

  return {
    type,
    category,
    situationTags,
    isBase,
    isThirdDown,
    isRedZone,
  };
}

// ============================================
// Drill Generation
// ============================================

function generateDrillsForDay(day: InstallDay, plays: InstallPlayItem[]): InstallDrillItem[] {
  const drills: InstallDrillItem[] = [];
  const playIds = plays.map(p => p.playId);

  switch (day) {
    case "day1_base_run":
      drills.push(
        {
          id: "drill_zone_step",
          name: "Zone Step Drill",
          purpose: "OL lateral zone step technique",
          phase: "individual",
          durationMinutes: 10,
          playIds: playIds.filter((_, i) => plays[i]?.tags.includes("zone")),
        },
        {
          id: "drill_combo_block",
          name: "Combo to LB",
          purpose: "Double team transition to linebacker",
          phase: "group",
          durationMinutes: 15,
          playIds,
        },
        {
          id: "drill_rb_read",
          name: "RB Read & Cut",
          purpose: "RB vision and cutback decision",
          phase: "group",
          durationMinutes: 12,
          playIds,
        }
      );
      break;

    case "day2_play_action":
      drills.push(
        {
          id: "drill_pa_fake",
          name: "PA Fake Technique",
          purpose: "QB play action fake and bootleg",
          phase: "individual",
          durationMinutes: 8,
          playIds,
        },
        {
          id: "drill_route_timing",
          name: "Route Timing",
          purpose: "WR route depth and timing with PA",
          phase: "group",
          durationMinutes: 15,
          playIds,
        },
        {
          id: "drill_qb_progression",
          name: "QB Progression Read",
          purpose: "Post-snap read progression",
          phase: "team",
          durationMinutes: 20,
          playIds,
        }
      );
      break;

    case "day3_third_down":
      drills.push(
        {
          id: "drill_hot_route",
          name: "Hot Route Execution",
          purpose: "Recognize pressure, execute hot",
          phase: "group",
          durationMinutes: 12,
          playIds,
        },
        {
          id: "drill_quick_game",
          name: "3-Step Quick Game",
          purpose: "Quick timing on short routes",
          phase: "group",
          durationMinutes: 15,
          playIds,
        },
        {
          id: "drill_rpo_read",
          name: "RPO Read Key",
          purpose: "QB read key for give/pull/throw",
          phase: "group",
          durationMinutes: 12,
          playIds: playIds.filter((_, i) => plays[i]?.tags.includes("rpo")),
        }
      );
      break;

    case "day4_situational":
      drills.push(
        {
          id: "drill_rz_fade",
          name: "Red Zone Fade",
          purpose: "Back-shoulder fade technique",
          phase: "group",
          durationMinutes: 10,
          playIds,
        },
        {
          id: "drill_gl_technique",
          name: "Goal Line Push",
          purpose: "OL goal line blocking",
          phase: "group",
          durationMinutes: 12,
          playIds,
        },
        {
          id: "drill_2min",
          name: "2-Minute Drill",
          purpose: "Clock management and tempo",
          phase: "team",
          durationMinutes: 20,
          playIds,
        }
      );
      break;

    case "day5_team_reps":
      drills.push(
        {
          id: "drill_full_install",
          name: "Full Install Review",
          purpose: "Run through all installed plays",
          phase: "team",
          durationMinutes: 30,
          playIds,
        },
        {
          id: "drill_situational",
          name: "Situational Reps",
          purpose: "Game situation simulations",
          phase: "team",
          durationMinutes: 25,
          playIds,
        }
      );
      break;
  }

  return drills.filter(d => d.playIds.length > 0 || day === "day5_team_reps");
}

// ============================================
// Main Generator
// ============================================

export interface GenerateInstallPlanInput {
  plays: Array<{ id: string; name: string; tags?: string[]; conceptId?: string }>;
  playbookId?: string;
  playbookName?: string;
  settings?: Partial<InstallPlanSettings>;
}

export function generateInstallPlan(input: GenerateInstallPlanInput): InstallPlan {
  const settings: InstallPlanSettings = {
    practiceLength: input.settings?.practiceLength ?? "normal",
    emphasisArea: input.settings?.emphasisArea ?? "balanced",
    installSpeed: input.settings?.installSpeed ?? "normal",
    includeSpecialTeams: input.settings?.includeSpecialTeams ?? false,
  };

  // Analyze all plays
  const analyzedPlays = input.plays.map(play => ({
    ...play,
    analysis: analyzePlay({
      id: play.id,
      name: play.name,
      tags: play.tags,
      meta: { conceptId: play.conceptId },
    } as Play),
  }));

  // Categorize plays into days
  const day1Plays: InstallPlayItem[] = [];
  const day2Plays: InstallPlayItem[] = [];
  const day3Plays: InstallPlayItem[] = [];
  const day4Plays: InstallPlayItem[] = [];
  const day5Plays: InstallPlayItem[] = [];

  for (const play of analyzedPlays) {
    const item: InstallPlayItem = {
      playId: play.id,
      playName: play.name,
      priority: play.analysis.isBase ? "core" : "secondary",
      repCount: play.analysis.isBase ? 8 : 5,
      tags: [play.analysis.type, play.analysis.category, ...play.analysis.situationTags],
    };

    // Assign to days based on analysis
    if (play.analysis.isRedZone) {
      day4Plays.push({ ...item, priority: "situational" });
    } else if (play.analysis.isThirdDown || play.analysis.type === "rpo") {
      day3Plays.push(item);
    } else if (play.analysis.type === "run") {
      // Base runs go to Day 1
      if (play.analysis.isBase || play.analysis.category === "zone" || play.analysis.category === "gap") {
        day1Plays.push(item);
      } else {
        // Specialty runs go to Day 4
        day4Plays.push({ ...item, priority: "situational" });
      }
    } else if (play.analysis.type === "pass") {
      // Pass plays go to Day 2 (PA/Pass) or Day 3 (Quick/3rd down)
      if (play.analysis.category === "quick") {
        day3Plays.push(item);
      } else {
        day2Plays.push(item);
      }
    } else if (play.analysis.type === "screen") {
      // Screens go to Day 3 (quick game/3rd down)
      day3Plays.push(item);
    } else {
      // Unknown type goes to Day 5 for review
      day5Plays.push({ ...item, priority: "situational" });
    }
  }

  // All plays get reviewed on Day 5
  const allPlays: InstallPlayItem[] = [
    ...day1Plays.map(p => ({ ...p, repCount: 3 })),
    ...day2Plays.map(p => ({ ...p, repCount: 3 })),
    ...day3Plays.map(p => ({ ...p, repCount: 3 })),
    ...day4Plays.map(p => ({ ...p, repCount: 3 })),
  ];
  day5Plays.push(...allPlays.filter(p => !day5Plays.some(d5 => d5.playId === p.playId)));

  // Generate drills for each day
  const days: InstallDayPlan[] = [
    {
      day: "day1_base_run",
      label: DAY_LABELS.day1_base_run,
      focus: DAY_FOCUS.day1_base_run,
      description: DAY_DESCRIPTIONS.day1_base_run,
      plays: day1Plays,
      drills: generateDrillsForDay("day1_base_run", day1Plays),
      totalMinutes: calculateDayMinutes(day1Plays, settings.practiceLength),
      notes: generateDayNotes("day1_base_run", day1Plays),
    },
    {
      day: "day2_play_action",
      label: DAY_LABELS.day2_play_action,
      focus: DAY_FOCUS.day2_play_action,
      description: DAY_DESCRIPTIONS.day2_play_action,
      plays: day2Plays,
      drills: generateDrillsForDay("day2_play_action", day2Plays),
      totalMinutes: calculateDayMinutes(day2Plays, settings.practiceLength),
      notes: generateDayNotes("day2_play_action", day2Plays),
    },
    {
      day: "day3_third_down",
      label: DAY_LABELS.day3_third_down,
      focus: DAY_FOCUS.day3_third_down,
      description: DAY_DESCRIPTIONS.day3_third_down,
      plays: day3Plays,
      drills: generateDrillsForDay("day3_third_down", day3Plays),
      totalMinutes: calculateDayMinutes(day3Plays, settings.practiceLength),
      notes: generateDayNotes("day3_third_down", day3Plays),
    },
    {
      day: "day4_situational",
      label: DAY_LABELS.day4_situational,
      focus: DAY_FOCUS.day4_situational,
      description: DAY_DESCRIPTIONS.day4_situational,
      plays: day4Plays,
      drills: generateDrillsForDay("day4_situational", day4Plays),
      totalMinutes: calculateDayMinutes(day4Plays, settings.practiceLength),
      notes: generateDayNotes("day4_situational", day4Plays),
    },
    {
      day: "day5_team_reps",
      label: DAY_LABELS.day5_team_reps,
      focus: DAY_FOCUS.day5_team_reps,
      description: DAY_DESCRIPTIONS.day5_team_reps,
      plays: day5Plays.slice(0, 20), // Limit to 20 plays for review day
      drills: generateDrillsForDay("day5_team_reps", day5Plays),
      totalMinutes: calculateDayMinutes(day5Plays.slice(0, 20), settings.practiceLength),
      notes: generateDayNotes("day5_team_reps", day5Plays),
    },
  ];

  // Filter out empty days
  const nonEmptyDays = days.filter(d => d.plays.length > 0 || d.day === "day5_team_reps");

  return {
    id: `install_${Date.now()}`,
    name: input.playbookName ? `Install Plan: ${input.playbookName}` : "Install Plan",
    playbookId: input.playbookId,
    playbookName: input.playbookName,
    days: nonEmptyDays,
    totalPlays: input.plays.length,
    generatedAt: new Date().toISOString(),
    settings,
  };
}

function calculateDayMinutes(plays: InstallPlayItem[], length: "short" | "normal" | "extended"): number {
  const baseMinutes = length === "short" ? 60 : length === "extended" ? 120 : 90;
  const playMinutes = plays.reduce((sum, p) => sum + (p.repCount * 1.5), 0);
  return Math.min(baseMinutes, Math.max(45, playMinutes + 30));
}

function generateDayNotes(day: InstallDay, plays: InstallPlayItem[]): string[] {
  const notes: string[] = [];

  if (plays.length === 0) {
    notes.push("No plays assigned to this day - consider adding relevant concepts.");
    return notes;
  }

  const corePlays = plays.filter(p => p.priority === "core");
  const runPlays = plays.filter(p => p.tags.includes("run"));
  const passPlays = plays.filter(p => p.tags.includes("pass"));
  const rpoPlays = plays.filter(p => p.tags.includes("rpo"));

  if (corePlays.length > 0) {
    notes.push(`Core plays to master: ${corePlays.map(p => p.playName).join(", ")}`);
  }

  switch (day) {
    case "day1_base_run":
      if (runPlays.length > 0) {
        notes.push(`Run concepts: ${runPlays.length} plays focused on ${runPlays.some(p => p.tags.includes("zone")) ? "zone" : "gap"} schemes`);
      }
      notes.push("Emphasize OL communication and combo blocks");
      break;

    case "day2_play_action":
      if (passPlays.length > 0) {
        notes.push(`Pass concepts: ${passPlays.length} plays including intermediate routes`);
      }
      notes.push("Connect PA fakes to Day 1 runs for defensive hesitation");
      break;

    case "day3_third_down":
      if (rpoPlays.length > 0) {
        notes.push(`RPO package: ${rpoPlays.length} plays with run/pass options`);
      }
      notes.push("Focus on quick decisions and pressure recognition");
      break;

    case "day4_situational":
      notes.push("Practice with game-like tempo and pressure");
      notes.push("Include red zone and 2-minute situational work");
      break;

    case "day5_team_reps":
      notes.push(`Total plays for review: ${plays.length}`);
      notes.push("Run scripted 10-play series to simulate game situations");
      break;
  }

  return notes;
}

// ============================================
// Export Helpers
// ============================================

export function getInstallDayLabel(day: InstallDay): string {
  return DAY_LABELS[day];
}

export function getInstallDayDescription(day: InstallDay): string {
  return DAY_DESCRIPTIONS[day];
}

export function exportInstallPlanToText(plan: InstallPlan): string {
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
        const priority = play.priority === "core" ? "⭐" : play.priority === "secondary" ? "•" : "○";
        lines.push(`${priority} ${play.playName} (${play.repCount} reps)`);
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
