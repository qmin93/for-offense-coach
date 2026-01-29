// ============================================
// Install Drills Library (30+ Common Drills)
// Based on NFL/College Install Programs
// ============================================

export type DrillPhase = "indy" | "group" | "team" | "walkthrough";
export type PositionGroup = "OL" | "RB" | "WR" | "TE" | "QB" | "TEAM";
export type DrillCategory =
  | "blocking"
  | "route_running"
  | "ball_handling"
  | "footwork"
  | "reads"
  | "protection"
  | "install"
  | "conditioning";

export interface Drill {
  id: string;
  name: string;
  purpose: string;
  phase: DrillPhase;
  positionGroups: PositionGroup[];
  category: DrillCategory;
  duration?: string;  // e.g., "5-10 min"
  equipment?: string[];
  keyPoints?: string[];
  variations?: string[];
  relatedConcepts?: string[];  // Concept IDs this drill supports
  tags: string[];
}

// ============================================
// OFFENSIVE LINE DRILLS (8 drills)
// ============================================

const OL_DRILLS: Drill[] = [
  {
    id: "drill_zone_step",
    name: "Zone Step Drill",
    purpose: "Develop proper lateral zone step technique and covered/uncovered rules",
    phase: "indy",
    positionGroups: ["OL"],
    category: "blocking",
    duration: "5-7 min",
    equipment: ["cones", "bags"],
    keyPoints: [
      "Flat step, not bucket step",
      "Eyes on 2nd level",
      "Hands inside, thumbs up",
      "Maintain leverage"
    ],
    variations: ["Zone Left", "Zone Right", "Double-team to LB"],
    relatedConcepts: ["concept_run_inside_zone", "concept_run_mid_zone", "concept_run_outside_zone"],
    tags: ["OL", "zone", "footwork", "blocking"]
  },
  {
    id: "drill_pull_kick",
    name: "Pull & Kick Drill",
    purpose: "Guard/Tackle pull path and kick-out block technique",
    phase: "group",
    positionGroups: ["OL"],
    category: "blocking",
    duration: "7-10 min",
    equipment: ["bags", "shield holders"],
    keyPoints: [
      "Flat pull path",
      "Eyes to EMOL",
      "Square shoulders at contact",
      "Kick vs Log read"
    ],
    variations: ["Counter GT", "Power", "Trap"],
    relatedConcepts: ["concept_run_power", "concept_run_counter"],
    tags: ["OL", "pull", "kickout", "gap"]
  },
  {
    id: "drill_pass_set",
    name: "Pass Set Drill",
    purpose: "Develop proper pass protection kick-slide technique",
    phase: "indy",
    positionGroups: ["OL"],
    category: "protection",
    duration: "5-7 min",
    equipment: ["pass rush dummies"],
    keyPoints: [
      "Kick step, don't overstride",
      "Hands ready, punch timing",
      "Mirror the rusher",
      "Anchor vs bull rush"
    ],
    variations: ["Speed rush", "Bull rush", "Inside counter"],
    relatedConcepts: ["concept_pass_stick", "concept_pass_mesh"],
    tags: ["OL", "pass_pro", "protection", "footwork"]
  },
  {
    id: "drill_combo_block",
    name: "Combo Block Drill",
    purpose: "Execute double-team to linebacker climb technique",
    phase: "group",
    positionGroups: ["OL"],
    category: "blocking",
    duration: "7-10 min",
    equipment: ["shield holders", "cones"],
    keyPoints: [
      "Four hands on DL first",
      "Movement before climb",
      "Read LB flow",
      "Communication (hips call)"
    ],
    variations: ["Duo combo", "Zone combo", "Deuce call"],
    relatedConcepts: ["concept_run_duo", "concept_run_inside_zone"],
    tags: ["OL", "combo", "blocking", "double_team"]
  },
  {
    id: "drill_down_block",
    name: "Down Block Drill",
    purpose: "Angle blocking technique for gap schemes",
    phase: "indy",
    positionGroups: ["OL"],
    category: "blocking",
    duration: "5 min",
    equipment: ["bags"],
    keyPoints: [
      "First step to inside gap",
      "Head across defender",
      "Drive through contact",
      "Sustain until whistle"
    ],
    relatedConcepts: ["concept_run_power", "concept_run_counter", "concept_run_iso"],
    tags: ["OL", "down", "gap", "blocking"]
  },
  {
    id: "drill_reach_block",
    name: "Reach Block Drill",
    purpose: "Outside zone reach and seal technique",
    phase: "indy",
    positionGroups: ["OL"],
    category: "blocking",
    duration: "5-7 min",
    equipment: ["cones", "bags"],
    keyPoints: [
      "Bucket step if needed",
      "Get head playside",
      "Drive to sideline",
      "Seal to cutback"
    ],
    relatedConcepts: ["concept_run_outside_zone", "concept_run_stretch"],
    tags: ["OL", "reach", "zone", "blocking"]
  },
  {
    id: "drill_trap_path",
    name: "Trap Pull Drill",
    purpose: "Guard trap block path and target recognition",
    phase: "group",
    positionGroups: ["OL"],
    category: "blocking",
    duration: "5-7 min",
    equipment: ["bags", "shields"],
    keyPoints: [
      "Short, flat pull",
      "Eyes on penetrating DT",
      "Aiming point: inside hip",
      "Explode through contact"
    ],
    relatedConcepts: ["concept_run_trap"],
    tags: ["OL", "trap", "pull", "blocking"]
  },
  {
    id: "drill_ol_hands",
    name: "OL Hands Drill",
    purpose: "Punch timing and hand placement fundamentals",
    phase: "indy",
    positionGroups: ["OL"],
    category: "blocking",
    duration: "5 min",
    equipment: ["hand shields"],
    keyPoints: [
      "Thumbs up, elbows in",
      "Strike chest plate",
      "Violent punch",
      "Lock out arms"
    ],
    tags: ["OL", "hands", "fundamentals"]
  },
];

// ============================================
// RUNNING BACK DRILLS (6 drills)
// ============================================

const RB_DRILLS: Drill[] = [
  {
    id: "drill_zone_read",
    name: "Zone Read Drill",
    purpose: "RB presses hole and reads combo block progression",
    phase: "group",
    positionGroups: ["RB", "OL"],
    category: "reads",
    duration: "7-10 min",
    equipment: ["cones"],
    keyPoints: [
      "Press LOS first",
      "Read combo to LB",
      "One-cut, go",
      "Trust your eyes"
    ],
    variations: ["IZ read", "OZ read", "Cutback lane"],
    relatedConcepts: ["concept_run_inside_zone", "concept_run_zone_read"],
    tags: ["RB", "zone", "read", "one_cut"]
  },
  {
    id: "drill_mesh_point",
    name: "Mesh Point Drill",
    purpose: "QB-RB mesh timing and ball security",
    phase: "group",
    positionGroups: ["RB", "QB"],
    category: "ball_handling",
    duration: "7-10 min",
    equipment: ["footballs"],
    keyPoints: [
      "RB path aiming point",
      "Soft hands, eyes forward",
      "Ride the mesh",
      "Secure immediately"
    ],
    relatedConcepts: ["concept_run_zone_read", "concept_run_rpo_base"],
    tags: ["RB", "QB", "mesh", "ball_handling"]
  },
  {
    id: "drill_press_cut",
    name: "Press & Cut Drill",
    purpose: "RB patience and cutback decision making",
    phase: "indy",
    positionGroups: ["RB"],
    category: "reads",
    duration: "5-7 min",
    equipment: ["cones", "bags"],
    keyPoints: [
      "Press the LOS",
      "Read puller's hip",
      "One decisive cut",
      "Vertical after cut"
    ],
    variations: ["Power", "Counter", "Trap"],
    relatedConcepts: ["concept_run_power", "concept_run_counter"],
    tags: ["RB", "gap", "patience", "vision"]
  },
  {
    id: "drill_rb_pass_pro",
    name: "RB Pass Protection Drill",
    purpose: "RB blitz pickup and protection technique",
    phase: "group",
    positionGroups: ["RB"],
    category: "protection",
    duration: "5-7 min",
    equipment: ["bags", "shields"],
    keyPoints: [
      "Identify blitzer",
      "Square up, low pad level",
      "Cut block if necessary",
      "Buy QB time"
    ],
    relatedConcepts: ["concept_pass_stick", "concept_pass_flood"],
    tags: ["RB", "pass_pro", "blitz"]
  },
  {
    id: "drill_flat_route",
    name: "Flat Route Timing Drill",
    purpose: "RB flat/arrow route timing and separation",
    phase: "group",
    positionGroups: ["RB", "QB"],
    category: "route_running",
    duration: "5-7 min",
    equipment: ["footballs", "cones"],
    keyPoints: [
      "Check release first",
      "Flat path to sideline",
      "Expect ball quickly",
      "Turn upfield after catch"
    ],
    relatedConcepts: ["concept_pass_stick", "concept_pass_flood"],
    tags: ["RB", "route", "flat", "timing"]
  },
  {
    id: "drill_toss_sweep",
    name: "Toss Sweep Drill",
    purpose: "Pitch reception and edge attack technique",
    phase: "group",
    positionGroups: ["RB", "QB", "OL"],
    category: "ball_handling",
    duration: "7-10 min",
    equipment: ["footballs", "cones"],
    keyPoints: [
      "Track the ball",
      "Catch away from body",
      "Read crack/lead",
      "Turn corner speed"
    ],
    relatedConcepts: ["concept_run_toss", "concept_run_jet_sweep"],
    tags: ["RB", "toss", "perimeter", "ball_handling"]
  },
];

// ============================================
// WIDE RECEIVER / TIGHT END DRILLS (6 drills)
// ============================================

const WR_TE_DRILLS: Drill[] = [
  {
    id: "drill_6yd_hitch",
    name: "6-Yard Hitch Drill",
    purpose: "Consistent depth on stick/hitch routes",
    phase: "indy",
    positionGroups: ["WR", "TE"],
    category: "route_running",
    duration: "5-7 min",
    equipment: ["footballs", "cones"],
    keyPoints: [
      "Sell vertical stem",
      "Plant and snap at 6 yards",
      "Work back to QB",
      "Catch and protect"
    ],
    relatedConcepts: ["concept_pass_stick", "concept_pass_smash"],
    tags: ["WR", "hitch", "quick_game", "route"]
  },
  {
    id: "drill_slant_release",
    name: "Slant Release Drill",
    purpose: "Inside release and catch technique vs press",
    phase: "indy",
    positionGroups: ["WR"],
    category: "route_running",
    duration: "5-7 min",
    equipment: ["footballs"],
    keyPoints: [
      "Sell vertical, step inside",
      "Push off outside foot",
      "Angle to opposite numbers",
      "Catch in stride"
    ],
    relatedConcepts: ["concept_pass_slant_flat", "concept_pass_mesh"],
    tags: ["WR", "slant", "release", "route"]
  },
  {
    id: "drill_comeback_curl",
    name: "Comeback/Curl Drill",
    purpose: "12-15 yard curl/comeback technique",
    phase: "indy",
    positionGroups: ["WR", "TE"],
    category: "route_running",
    duration: "7 min",
    equipment: ["footballs", "cones"],
    keyPoints: [
      "Vertical stem, sell go",
      "Sink hips at depth",
      "Come back to ball",
      "Box out defender"
    ],
    relatedConcepts: ["concept_pass_curl_flat", "concept_pass_all_curls"],
    tags: ["WR", "curl", "comeback", "route"]
  },
  {
    id: "drill_dig_cross",
    name: "Dig/Cross Drill",
    purpose: "Crossing route depth and timing",
    phase: "group",
    positionGroups: ["WR", "TE"],
    category: "route_running",
    duration: "7-10 min",
    equipment: ["footballs", "cones"],
    keyPoints: [
      "Stem to 12-15 yards",
      "Sharp 90° break",
      "Find the window",
      "Prepare for contact"
    ],
    relatedConcepts: ["concept_pass_drive", "concept_pass_dagger", "concept_pass_y_cross"],
    tags: ["WR", "dig", "cross", "intermediate"]
  },
  {
    id: "drill_vertical_stem",
    name: "Vertical Stem Drill",
    purpose: "Go route technique and tracking deep ball",
    phase: "indy",
    positionGroups: ["WR"],
    category: "route_running",
    duration: "7 min",
    equipment: ["footballs"],
    keyPoints: [
      "Win off the line",
      "Stack the corner",
      "Track ball over inside shoulder",
      "Adjust to underthrow"
    ],
    relatedConcepts: ["concept_pass_verts", "concept_pass_flood"],
    tags: ["WR", "go", "vertical", "deep"]
  },
  {
    id: "drill_shallow_cross",
    name: "Shallow Cross Drill",
    purpose: "Mesh/shallow crossing technique at 2-3 yards",
    phase: "group",
    positionGroups: ["WR", "TE"],
    category: "route_running",
    duration: "5-7 min",
    equipment: ["footballs"],
    keyPoints: [
      "Push vertical first",
      "Sharp break inside",
      "Stay on your course",
      "Create traffic for man"
    ],
    relatedConcepts: ["concept_pass_mesh", "concept_pass_drive"],
    tags: ["WR", "TE", "shallow", "mesh", "crossing"]
  },
];

// ============================================
// QUARTERBACK DRILLS (5 drills)
// ============================================

const QB_DRILLS: Drill[] = [
  {
    id: "drill_qb_footwork",
    name: "QB Footwork Drill",
    purpose: "Drop-back and timing footwork fundamentals",
    phase: "indy",
    positionGroups: ["QB"],
    category: "footwork",
    duration: "5-7 min",
    equipment: ["cones"],
    keyPoints: [
      "3-step, 5-step timing",
      "Hitch in pocket",
      "Eye discipline",
      "Balance at release"
    ],
    variations: ["Quick game", "Intermediate", "Play-action"],
    tags: ["QB", "footwork", "drops", "fundamentals"]
  },
  {
    id: "drill_read_key",
    name: "Read Key Drill",
    purpose: "QB EMOL read for give/keep on zone read",
    phase: "group",
    positionGroups: ["QB", "RB"],
    category: "reads",
    duration: "7-10 min",
    equipment: ["footballs"],
    keyPoints: [
      "Eyes on read key",
      "Ride the mesh",
      "Pull if DE crashes",
      "Give if DE stays"
    ],
    relatedConcepts: ["concept_run_zone_read", "concept_run_rpo_base"],
    tags: ["QB", "read", "zone_read", "RPO"]
  },
  {
    id: "drill_high_low",
    name: "High-Low Read Drill",
    purpose: "QB progression reading flat defender",
    phase: "group",
    positionGroups: ["QB", "WR"],
    category: "reads",
    duration: "7-10 min",
    equipment: ["footballs", "cones"],
    keyPoints: [
      "Pre-snap ID",
      "Read flat defender",
      "High if he sits",
      "Low if he walls"
    ],
    relatedConcepts: ["concept_pass_stick", "concept_pass_curl_flat", "concept_pass_flood"],
    tags: ["QB", "read", "high_low", "progression"]
  },
  {
    id: "drill_mesh_read",
    name: "Mesh Concept Read Drill",
    purpose: "QB inside-out read on mesh crossing concept",
    phase: "group",
    positionGroups: ["QB", "WR", "TE"],
    category: "reads",
    duration: "7-10 min",
    equipment: ["footballs"],
    keyPoints: [
      "Read inside-out",
      "First crosser if open",
      "Check flat",
      "Clear route late"
    ],
    relatedConcepts: ["concept_pass_mesh"],
    tags: ["QB", "mesh", "read", "crossing"]
  },
  {
    id: "drill_pocket_move",
    name: "Pocket Movement Drill",
    purpose: "QB pocket presence and escape technique",
    phase: "indy",
    positionGroups: ["QB"],
    category: "footwork",
    duration: "5-7 min",
    equipment: ["cones", "bags"],
    keyPoints: [
      "Feel pressure, don't see it",
      "Slide, don't bail",
      "Eyes downfield",
      "Reset and throw"
    ],
    tags: ["QB", "pocket", "escape", "presence"]
  },
];

// ============================================
// TEAM / INSTALL DRILLS (5 drills)
// ============================================

const TEAM_DRILLS: Drill[] = [
  {
    id: "drill_identify_front",
    name: "Identify Front Drill",
    purpose: "Quick defensive front recognition and ID calls",
    phase: "walkthrough",
    positionGroups: ["TEAM"],
    category: "install",
    duration: "10-15 min",
    equipment: ["cards/boards"],
    keyPoints: [
      "Even vs Odd front",
      "3-tech location",
      "Box count",
      "Strength call"
    ],
    tags: ["TEAM", "install", "front", "recognition"]
  },
  {
    id: "drill_read_apex",
    name: "Read Apex Drill",
    purpose: "Identify apex defender alignment and assignment",
    phase: "walkthrough",
    positionGroups: ["TEAM"],
    category: "install",
    duration: "7-10 min",
    equipment: ["cards"],
    keyPoints: [
      "Apex = #2 defender",
      "Inside or outside leverage",
      "Hot route adjustment",
      "RPO read key"
    ],
    relatedConcepts: ["concept_run_rpo_base"],
    tags: ["TEAM", "apex", "read", "install"]
  },
  {
    id: "drill_blitz_check",
    name: "Blitz Check Drill",
    purpose: "Recognize and adjust to pre-snap blitz indicators",
    phase: "group",
    positionGroups: ["TEAM"],
    category: "protection",
    duration: "10-15 min",
    equipment: ["cards"],
    keyPoints: [
      "Linebacker depth",
      "Safety rotation",
      "Corner press",
      "Hot route trigger"
    ],
    relatedConcepts: ["concept_pass_stick", "concept_pass_slant_flat"],
    tags: ["TEAM", "blitz", "protection", "hot"]
  },
  {
    id: "drill_7on7",
    name: "7-on-7 Pass Skeleton",
    purpose: "Pass concept execution vs coverage without OL",
    phase: "team",
    positionGroups: ["TEAM"],
    category: "install",
    duration: "15-20 min",
    equipment: ["footballs", "cones"],
    keyPoints: [
      "No sacks called",
      "Focus on route timing",
      "DB technique",
      "Ball placement"
    ],
    tags: ["TEAM", "7on7", "skeleton", "pass"]
  },
  {
    id: "drill_full_install",
    name: "Full Install Period",
    purpose: "Complete concept walk-through with all 11",
    phase: "walkthrough",
    positionGroups: ["TEAM"],
    category: "install",
    duration: "20-30 min",
    equipment: ["footballs", "play cards"],
    keyPoints: [
      "Assignments first",
      "Timing second",
      "Corrections third",
      "Rep until perfect"
    ],
    tags: ["TEAM", "install", "walkthrough", "full"]
  },
];

// ============================================
// EXPORT ALL DRILLS
// ============================================

export const ALL_DRILLS: Drill[] = [
  ...OL_DRILLS,
  ...RB_DRILLS,
  ...WR_TE_DRILLS,
  ...QB_DRILLS,
  ...TEAM_DRILLS,
];

// Grouped exports
export { OL_DRILLS, RB_DRILLS, WR_TE_DRILLS, QB_DRILLS, TEAM_DRILLS };

// ============================================
// Utility Functions
// ============================================

export function getDrillById(id: string): Drill | undefined {
  return ALL_DRILLS.find((d) => d.id === id);
}

export function getDrillsByPositionGroup(group: PositionGroup): Drill[] {
  return ALL_DRILLS.filter((d) => d.positionGroups.includes(group));
}

export function getDrillsByPhase(phase: DrillPhase): Drill[] {
  return ALL_DRILLS.filter((d) => d.phase === phase);
}

export function getDrillsByCategory(category: DrillCategory): Drill[] {
  return ALL_DRILLS.filter((d) => d.category === category);
}

export function getDrillsForConcept(conceptId: string): Drill[] {
  return ALL_DRILLS.filter((d) => d.relatedConcepts?.includes(conceptId));
}

export function searchDrills(query: string): Drill[] {
  const lowerQuery = query.toLowerCase();
  return ALL_DRILLS.filter(
    (d) =>
      d.name.toLowerCase().includes(lowerQuery) ||
      d.purpose.toLowerCase().includes(lowerQuery) ||
      d.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  );
}

// Get recommended drill sequence for a concept install
export function getInstallDrillSequence(conceptId: string): Drill[] {
  const conceptDrills = getDrillsForConcept(conceptId);

  // Sort by phase: indy -> group -> team -> walkthrough
  const phaseOrder: DrillPhase[] = ["indy", "group", "team", "walkthrough"];

  return conceptDrills.sort((a, b) =>
    phaseOrder.indexOf(a.phase) - phaseOrder.indexOf(b.phase)
  );
}
