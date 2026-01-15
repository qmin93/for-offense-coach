// ============================================
// Example Playbook Data
// Pre-built plays, concepts, and drills for reference
// ============================================

export interface ExampleConcept {
  id: string;
  name: string;
  type: "run" | "pass" | "rpo";
  category: string;
  description: string;
  tags: string[];
  keyPoints: string[];
}

export interface Drill {
  id: string;
  name: string;
  purpose: string;
  phase: "individual" | "group" | "team";
  duration: string;
  focus: string[];
  steps: string[];
}

export interface ExamplePlaybook {
  id: string;
  name: string;
  description: string;
  personnel: string;
  conceptIds: string[];
}

// ============================================
// Example Concepts (30 total)
// ============================================

export const EXAMPLE_CONCEPTS: ExampleConcept[] = [
  // Run Concepts (12)
  {
    id: "ex_inside_zone",
    name: "Inside Zone",
    type: "run",
    category: "zone",
    description: "RB reads playside A-B gap, cut back if 3T wrong-arms",
    tags: ["base", "zone", "spread"],
    keyPoints: ["OL covered/uncovered rules", "RB press A gap, read 3T", "Backside cut allowed"],
  },
  {
    id: "ex_outside_zone",
    name: "Outside Zone",
    type: "run",
    category: "zone",
    description: "Stretch play to perimeter, overtake technique",
    tags: ["perimeter", "zone", "stretch"],
    keyPoints: ["Reach block technique", "RB aim for sideline", "Cut back if overrun"],
  },
  {
    id: "ex_split_zone",
    name: "Split Zone",
    type: "run",
    category: "zone",
    description: "Inside zone with backside wham block",
    tags: ["zone", "misdirection"],
    keyPoints: ["H-back whams backside DE", "Creates cutback lane", "Good vs aggressive DE"],
  },
  {
    id: "ex_duo",
    name: "Duo",
    type: "run",
    category: "gap",
    description: "Double team at point of attack, vertical push",
    tags: ["gap", "downhill", "power"],
    keyPoints: ["Double team to LB level", "RB one-cut downhill", "Big play when LB scrapes"],
  },
  {
    id: "ex_power",
    name: "Power",
    type: "run",
    category: "gap",
    description: "Kick out, pulling guard leads through",
    tags: ["gap", "power", "pulling"],
    keyPoints: ["FB/TE kicks out EMOL", "Guard pulls and leads", "RB follows puller"],
  },
  {
    id: "ex_counter",
    name: "Counter",
    type: "run",
    category: "gap",
    description: "Two pullers, misdirection action",
    tags: ["gap", "misdirection", "pulling"],
    keyPoints: ["RB fake one way", "Two pullers opposite", "Hit B gap quickly"],
  },
  {
    id: "ex_trap",
    name: "Trap",
    type: "run",
    category: "gap",
    description: "Let DT cross, trap with pulling guard",
    tags: ["gap", "trap", "quick-hit"],
    keyPoints: ["Center lets 3T cross", "Guard traps 3T", "RB aims at playside hip"],
  },
  {
    id: "ex_pin_pull",
    name: "Pin & Pull",
    type: "run",
    category: "perimeter",
    description: "Pin inside, pull outside for perimeter run",
    tags: ["perimeter", "spread", "pulling"],
    keyPoints: ["Tackle pins DE", "Guard pulls to alley", "RB reads puller's block"],
  },
  {
    id: "ex_jet_sweep",
    name: "Jet Sweep",
    type: "run",
    category: "perimeter",
    description: "Speed sweep with motion",
    tags: ["perimeter", "motion", "speed"],
    keyPoints: ["Jet motion times with snap", "OL reach blocks", "Fast to perimeter"],
  },
  {
    id: "ex_iso",
    name: "Iso",
    type: "run",
    category: "gap",
    description: "Fullback isolates Mike, RB follows",
    tags: ["gap", "downhill", "I-form"],
    keyPoints: ["OL blocks down", "FB takes on Mike", "RB one-cut behind FB"],
  },
  {
    id: "ex_draw",
    name: "Draw",
    type: "run",
    category: "draw",
    description: "Pass-action into delayed run",
    tags: ["draw", "pass-action", "spread"],
    keyPoints: ["QB shows pass", "OL invites rush", "RB delays then runs"],
  },
  {
    id: "ex_qb_power",
    name: "QB Power",
    type: "run",
    category: "gap",
    description: "Designed QB run with lead blocker",
    tags: ["gap", "qb-run", "spread"],
    keyPoints: ["Same as power", "QB is ball carrier", "RB lead blocks or fakes"],
  },

  // Pass Concepts (12)
  {
    id: "ex_stick",
    name: "Stick",
    type: "pass",
    category: "quick",
    description: "High-low read on flat defender",
    tags: ["quick", "3-step", "high-low"],
    keyPoints: ["Inside hitch at 6", "Outside flat route", "QB reads flat defender"],
  },
  {
    id: "ex_slant_flat",
    name: "Slant/Flat",
    type: "pass",
    category: "quick",
    description: "Slant inside, flat outside",
    tags: ["quick", "3-step", "high-low"],
    keyPoints: ["1-step slant", "Flat to sideline", "QB hot read"],
  },
  {
    id: "ex_mesh",
    name: "Mesh",
    type: "pass",
    category: "intermediate",
    description: "Crossing routes create picks",
    tags: ["intermediate", "crossing", "man-beater"],
    keyPoints: ["Receivers mesh at 6 yards", "Natural pick on man coverage", "Clear out verticals"],
  },
  {
    id: "ex_levels",
    name: "Levels",
    type: "pass",
    category: "intermediate",
    description: "Three-level flood concept",
    tags: ["intermediate", "flood", "zone-beater"],
    keyPoints: ["Deep in at 18", "Dig at 12", "Flat at LOS"],
  },
  {
    id: "ex_four_verts",
    name: "Four Verticals",
    type: "pass",
    category: "deep",
    description: "Vertical stretch, read safeties",
    tags: ["deep", "spread", "big-play"],
    keyPoints: ["4 verticals stretch coverage", "Seams vs single-high", "Outside vs 2-high"],
  },
  {
    id: "ex_smash",
    name: "Smash",
    type: "pass",
    category: "intermediate",
    description: "Corner/hitch combo",
    tags: ["intermediate", "corner", "high-low"],
    keyPoints: ["Outside hitch at 5", "Inside corner at 12", "Read corner defender"],
  },
  {
    id: "ex_post_wheel",
    name: "Post/Wheel",
    type: "pass",
    category: "deep",
    description: "Post clears for wheel route",
    tags: ["deep", "big-play", "RB-route"],
    keyPoints: ["WR runs post", "RB wheels behind", "Clear out safety"],
  },
  {
    id: "ex_y_cross",
    name: "Y-Cross",
    type: "pass",
    category: "intermediate",
    description: "TE crosses under verticals",
    tags: ["intermediate", "crossing", "play-action"],
    keyPoints: ["TE drags under verticals", "Works with PA", "Good vs man or zone"],
  },
  {
    id: "ex_spot",
    name: "Spot",
    type: "pass",
    category: "quick",
    description: "Triangle concept to one side",
    tags: ["quick", "triangle", "zone-beater"],
    keyPoints: ["Corner, flat, sit", "Read inside-out", "Quick decision"],
  },
  {
    id: "ex_spacing",
    name: "Spacing",
    type: "pass",
    category: "intermediate",
    description: "5 receivers space the field",
    tags: ["intermediate", "spread", "empty"],
    keyPoints: ["5 receivers across", "Find void in zone", "Quick timing"],
  },
  {
    id: "ex_dagger",
    name: "Dagger",
    type: "pass",
    category: "intermediate",
    description: "Post-dig combo behind LBs",
    tags: ["intermediate", "dig", "post"],
    keyPoints: ["Post clears safety", "Dig sits behind LB", "Read Mike to safety"],
  },
  {
    id: "ex_sail",
    name: "Sail",
    type: "pass",
    category: "intermediate",
    description: "Three-level sideline flood",
    tags: ["intermediate", "flood", "sideline"],
    keyPoints: ["Go, corner, flat", "Three levels to sideline", "Read high to low"],
  },

  // RPO Concepts (6)
  {
    id: "ex_rpo_bubble",
    name: "RPO Bubble",
    type: "rpo",
    category: "rpo",
    description: "Zone read with bubble screen option",
    tags: ["rpo", "bubble", "spread"],
    keyPoints: ["Read OLB/Apex", "Bubble if he crashes", "Run if he stays out"],
  },
  {
    id: "ex_rpo_glance",
    name: "RPO Glance",
    type: "rpo",
    category: "rpo",
    description: "Inside zone with glance route",
    tags: ["rpo", "glance", "quick"],
    keyPoints: ["Read Mike LB", "Glance if Mike flows", "Give if Mike stays"],
  },
  {
    id: "ex_rpo_slant",
    name: "RPO Slant",
    type: "rpo",
    category: "rpo",
    description: "Zone with slant option",
    tags: ["rpo", "slant", "spread"],
    keyPoints: ["Read backside LB", "Slant behind vacated area", "Quick read"],
  },
  {
    id: "ex_rpo_stick",
    name: "RPO Stick",
    type: "rpo",
    category: "rpo",
    description: "Run-pass option with stick route",
    tags: ["rpo", "stick", "intermediate"],
    keyPoints: ["Read #2 defender", "Stick if #2 plays run", "Pull and throw"],
  },
  {
    id: "ex_rpo_pop",
    name: "RPO Pop Pass",
    type: "rpo",
    category: "rpo",
    description: "Inside zone with pop pass over LB",
    tags: ["rpo", "pop", "TE"],
    keyPoints: ["TE pops behind LB", "Read LB flow", "Throw over vacated space"],
  },
  {
    id: "ex_rpo_juke",
    name: "RPO Juke Screen",
    type: "rpo",
    category: "rpo",
    description: "Run-pass with tunnel screen option",
    tags: ["rpo", "screen", "spread"],
    keyPoints: ["OL releases to screen", "QB reads DE", "Throw screen vs crash"],
  },
];

// ============================================
// Drills (10 total)
// ============================================

export const DRILLS: Drill[] = [
  {
    id: "drill_identify_front",
    name: "Identify Front",
    purpose: "Teach QB/OL to identify defensive front alignment",
    phase: "group",
    duration: "10 min",
    focus: ["Front recognition", "Communication", "Pre-snap reads"],
    steps: [
      "Show defense card (no movement)",
      "QB/C calls front (even, odd, over, under)",
      "OL echoes call and adjusts",
      "Coach verifies correct identification",
    ],
  },
  {
    id: "drill_read_apex",
    name: "Read Apex",
    purpose: "Train QB to read Apex defender for RPO",
    phase: "individual",
    duration: "8 min",
    focus: ["Apex read", "Quick decision", "Ball handling"],
    steps: [
      "Apex player aligns at various depths",
      "On snap, Apex either crashes or stays",
      "QB gives or pulls based on read",
      "Focus on speed of decision",
    ],
  },
  {
    id: "drill_blitz_check",
    name: "Blitz Check",
    purpose: "Recognize and communicate blitz indicators",
    phase: "group",
    duration: "12 min",
    focus: ["Blitz recognition", "Protection calls", "Hot routes"],
    steps: [
      "Defense shows various blitz looks",
      "QB identifies potential blitzers",
      "Makes protection call (slide, hot)",
      "Receivers adjust routes if needed",
    ],
  },
  {
    id: "drill_coverage_read",
    name: "Coverage Read",
    purpose: "Pre-snap and post-snap coverage identification",
    phase: "individual",
    duration: "10 min",
    focus: ["Coverage shells", "Safety rotation", "Throwing windows"],
    steps: [
      "Show various coverage looks",
      "QB calls coverage pre-snap",
      "On snap, coverage either stays or rotates",
      "QB must adjust read",
    ],
  },
  {
    id: "drill_ozone_drill",
    name: "OZ Finish Drill",
    purpose: "Practice outside zone finish technique",
    phase: "group",
    duration: "15 min",
    focus: ["Reach technique", "Overtake", "Finish to sideline"],
    steps: [
      "OL in outside zone position",
      "On cadence, execute reach step",
      "Work overtake technique",
      "Finish block to sideline",
    ],
  },
  {
    id: "drill_combo_to_lb",
    name: "Combo to LB",
    purpose: "Double team transition to linebacker",
    phase: "group",
    duration: "12 min",
    focus: ["Double team", "Communication", "Climb timing"],
    steps: [
      "Two OL double team DL dummy",
      "LB flows over top",
      "One OL climbs to LB",
      "Other OL finishes base block",
    ],
  },
  {
    id: "drill_route_stem",
    name: "Route Stem Drill",
    purpose: "Teach proper route stems vs coverage",
    phase: "individual",
    duration: "10 min",
    focus: ["Route technique", "Stems", "Separation"],
    steps: [
      "WR runs at DB",
      "Execute various stem moves",
      "Break on route at proper depth",
      "Emphasize full speed through break",
    ],
  },
  {
    id: "drill_mesh_timing",
    name: "Mesh Timing",
    purpose: "Perfect mesh concept timing",
    phase: "group",
    duration: "15 min",
    focus: ["Mesh timing", "Depth", "Natural pick"],
    steps: [
      "Two receivers practice mesh path",
      "Time crossing at 6 yards",
      "Add defenders for timing vs coverage",
      "QB progresses through reads",
    ],
  },
  {
    id: "drill_hot_route",
    name: "Hot Route Execution",
    purpose: "Execute hot routes vs pressure",
    phase: "group",
    duration: "10 min",
    focus: ["Pressure recognition", "Hot adjustment", "Quick throw"],
    steps: [
      "Defense shows blitz",
      "WR identifies hot",
      "QB makes quick throw",
      "Time from snap to release",
    ],
  },
  {
    id: "drill_pull_technique",
    name: "Pull & Lead",
    purpose: "Guard pull technique for power/counter",
    phase: "individual",
    duration: "12 min",
    focus: ["Pull technique", "Eyes", "Contact point"],
    steps: [
      "Set up pull path with cones",
      "Execute pull at game speed",
      "Find target (kick or lead)",
      "Finish with proper contact",
    ],
  },
];

// ============================================
// Example Playbook
// ============================================

export const EXAMPLE_PLAYBOOKS: ExamplePlaybook[] = [
  {
    id: "playbook_spread_base",
    name: "Spread Base",
    description: "Foundation spread offense playbook with balanced run/pass",
    personnel: "10/11",
    conceptIds: [
      "ex_inside_zone",
      "ex_outside_zone",
      "ex_duo",
      "ex_jet_sweep",
      "ex_stick",
      "ex_slant_flat",
      "ex_mesh",
      "ex_four_verts",
      "ex_rpo_bubble",
      "ex_rpo_glance",
    ],
  },
];

// ============================================
// Helper Functions
// ============================================

export function getExampleConceptById(id: string): ExampleConcept | undefined {
  return EXAMPLE_CONCEPTS.find((c) => c.id === id);
}

export function getExampleConceptsByType(type: "run" | "pass" | "rpo"): ExampleConcept[] {
  return EXAMPLE_CONCEPTS.filter((c) => c.type === type);
}

export function getDrillById(id: string): Drill | undefined {
  return DRILLS.find((d) => d.id === id);
}

export function getDrillsByPhase(phase: "individual" | "group" | "team"): Drill[] {
  return DRILLS.filter((d) => d.phase === phase);
}
