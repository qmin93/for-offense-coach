// ============================================
// Concept Families
// Grouping concepts with variations and alerts
// ============================================

import type { ConceptFamily, DefenseFront, DefenseShell } from "../dsl/types";

// ============================================
// Run Concept Families
// ============================================

export const CONCEPT_FAMILIES: ConceptFamily[] = [
  // Inside Zone Family
  {
    id: "family_inside_zone",
    name: "Inside Zone Family",
    baseConceptId: "run_inside_zone",
    conceptType: "run",
    summary: "Zone blocking scheme hitting A/B gaps with cutback reads",
    variations: [
      {
        conceptId: "run_inside_zone",
        label: "Base IZ",
        description: "Standard inside zone with A-gap aiming point",
        tags: ["base"],
      },
      {
        conceptId: "run_inside_zone_read",
        label: "IZ Read",
        description: "Zone read with backside DE as read key",
        tags: ["read", "qb_run"],
      },
      {
        conceptId: "run_inside_zone_gt",
        label: "IZ GT Counter",
        description: "Guard-Tackle counter action off zone look",
        tags: ["counter", "misdirection"],
      },
      {
        conceptId: "run_inside_zone_split",
        label: "Split Zone",
        description: "Inside zone with TE/H kick block on backside",
        tags: ["split", "kick"],
      },
    ],
    alerts: [
      {
        id: "iz_alert_bear",
        label: "Bear Front Alert",
        description: "Nose over center clogs A-gap, bounce to B",
        trigger: { defense: { front: ["bear"] } },
        adjustment: "Aiming point to B-gap, double the nose",
      },
      {
        id: "iz_alert_7box",
        label: "Loaded Box",
        description: "7+ box defenders - consider RPO",
        trigger: { defense: { boxCount: [7, 8] } },
        adjustment: "Add bubble/slant RPO tag",
      },
    ],
    installFocus: [
      "Aiming point: playside A-gap",
      "OL: Zone step, overtake, climb",
      "RB: Press hole, read 1st DL, cut off blocks",
      "Backside TE/H: Cutoff or pull",
    ],
    compatibleFronts: ["even", "odd", "over", "under"],
    compatibleShells: ["cover1", "cover3", "cover4"],
    tags: ["zone", "inside", "gap_scheme"],
  },

  // Outside Zone Family
  {
    id: "family_outside_zone",
    name: "Outside Zone Family",
    baseConceptId: "run_outside_zone",
    conceptType: "run",
    summary: "Stretch scheme attacking perimeter with cutback lanes",
    variations: [
      {
        conceptId: "run_outside_zone",
        label: "Base OZ",
        description: "Standard outside zone stretch",
        tags: ["base"],
      },
      {
        conceptId: "run_oz_read",
        label: "OZ Read",
        description: "Outside zone with backside read option",
        tags: ["read", "qb_run"],
      },
      {
        conceptId: "run_oz_crack",
        label: "Crack Toss",
        description: "OZ with WR crack block on force",
        tags: ["crack", "perimeter"],
      },
    ],
    alerts: [
      {
        id: "oz_alert_hard_edge",
        label: "Hard Edge",
        description: "DE/OLB setting hard edge - cut inside",
        trigger: { defense: { front: ["over", "under"] } },
        adjustment: "RB reads edge, cutback available",
      },
      {
        id: "oz_alert_cover2",
        label: "Cover 2 Force",
        description: "CB rolling down as force player",
        trigger: { defense: { shell: ["cover2"] } },
        adjustment: "WR blocks CB, TE arc to safety",
      },
    ],
    installFocus: [
      "Aiming point: Playside C-gap, stretch to sideline",
      "OL: Reach step, overtake, work to 2nd level",
      "RB: Get to the edge, read cutback",
      "Backside: Cutoff or pull across",
    ],
    compatibleFronts: ["even", "odd", "over", "under", "tite"],
    compatibleShells: ["cover1", "cover3", "cover2"],
    tags: ["zone", "outside", "perimeter"],
  },

  // Power Family
  {
    id: "family_power",
    name: "Power Family",
    baseConceptId: "run_power",
    conceptType: "run",
    summary: "Gap scheme with pulling guard and kick-out block",
    variations: [
      {
        conceptId: "run_power",
        label: "Power",
        description: "Classic power with FB kick and G pull",
        tags: ["base", "gap"],
      },
      {
        conceptId: "run_power_read",
        label: "Power Read",
        description: "Power with BSDE read for QB keeper",
        tags: ["read", "qb_run"],
      },
      {
        conceptId: "run_power_counter",
        label: "Counter",
        description: "GT counter with misdirection action",
        tags: ["counter", "misdirection"],
      },
      {
        conceptId: "run_power_trey",
        label: "Power Trey",
        description: "Power with TE down block, FB arc",
        tags: ["trey", "adjustment"],
      },
    ],
    alerts: [
      {
        id: "power_alert_odd",
        label: "Odd Front",
        description: "NT over center affects double team",
        trigger: { defense: { front: ["odd", "bear"] } },
        adjustment: "Center solo NT, double 3-tech",
      },
      {
        id: "power_alert_scrape",
        label: "Scrape Exchange",
        description: "LB scrapes over to fill kick-out",
        trigger: { defense: { front: ["over", "under"] } },
        adjustment: "Pull to wrap, FB kicks scraper",
      },
    ],
    installFocus: [
      "Down blocks: Create vertical seam",
      "Kick-out: FB/H on EMOL",
      "Pull: BSG through hole, pick up 1st color",
      "RB: Press kick-out, cut off puller",
    ],
    compatibleFronts: ["even", "over", "under"],
    compatibleShells: ["cover1", "cover3"],
    tags: ["gap", "power", "downhill"],
  },

  // Duo Family
  {
    id: "family_duo",
    name: "Duo Family",
    baseConceptId: "run_duo",
    conceptType: "run",
    summary: "Double-team focused scheme with RB reading 1st level",
    variations: [
      {
        conceptId: "run_duo",
        label: "Base Duo",
        description: "Standard duo with double teams",
        tags: ["base"],
      },
      {
        conceptId: "run_duo_read",
        label: "Duo Read",
        description: "Duo with backside read option",
        tags: ["read", "qb_run"],
      },
    ],
    alerts: [
      {
        id: "duo_alert_bear",
        label: "Bear Front",
        description: "Double Nose, single 4i techs",
        trigger: { defense: { front: ["bear", "tite"] } },
        adjustment: "C-G double nose, Tackles solo",
      },
    ],
    installFocus: [
      "PSG-PST: Double team to MIKE",
      "BSG-BST: Double team to backside LB",
      "RB: Read double team, cut off movement",
    ],
    compatibleFronts: ["even", "odd", "over", "under", "bear"],
    compatibleShells: ["cover1", "cover3", "cover4"],
    tags: ["gap", "duo", "downhill"],
  },

  // ============================================
  // Pass Concept Families
  // ============================================

  // Mesh Family
  {
    id: "family_mesh",
    name: "Mesh Family",
    baseConceptId: "pass_mesh",
    conceptType: "pass",
    summary: "Crossing routes creating rub/pick action",
    variations: [
      {
        conceptId: "pass_mesh",
        label: "Mesh",
        description: "Classic mesh with 5-6 yard crossers",
        tags: ["base", "man_beater"],
      },
      {
        conceptId: "pass_mesh_wheel",
        label: "Mesh Wheel",
        description: "Mesh with RB wheel route",
        tags: ["wheel", "big_play"],
      },
      {
        conceptId: "pass_mesh_drive",
        label: "Drive",
        description: "Shallow + Dig crossing routes",
        tags: ["drive", "zone_beater"],
      },
    ],
    alerts: [
      {
        id: "mesh_alert_man",
        label: "Man Coverage",
        description: "Perfect opportunity for mesh rub",
        trigger: { defense: { shell: ["cover0", "cover1"] } },
        adjustment: "Run mesh tight, use natural pick",
      },
      {
        id: "mesh_alert_zone",
        label: "Zone Coverage",
        description: "Sit in windows vs zone",
        trigger: { defense: { shell: ["cover2", "cover3", "cover4"] } },
        adjustment: "Crossers sit in holes, QB hits hot",
      },
    ],
    installFocus: [
      "Mesh point: 5-6 yards deep",
      "Crossers: Stack behind OL, then burst",
      "Sit route: Find zone hole",
      "QB: Read near-to-far on crossers",
    ],
    compatibleFronts: ["even", "odd", "over", "under"],
    compatibleShells: ["cover0", "cover1", "cover3"],
    tags: ["crossing", "rub", "man_beater"],
  },

  // Smash Family
  {
    id: "family_smash",
    name: "Smash Family",
    baseConceptId: "pass_smash",
    conceptType: "pass",
    summary: "Corner/Hitch combination attacking CB leverage",
    variations: [
      {
        conceptId: "pass_smash",
        label: "Smash",
        description: "Corner + Hitch combo",
        tags: ["base", "cover2_beater"],
      },
      {
        conceptId: "pass_smash_levels",
        label: "Levels",
        description: "Corner + Under route",
        tags: ["levels", "high_low"],
      },
      {
        conceptId: "pass_smash_snag",
        label: "Snag",
        description: "Corner + Flat + Snag triangle",
        tags: ["snag", "triangle"],
      },
    ],
    alerts: [
      {
        id: "smash_alert_cover2",
        label: "Cover 2 Beater",
        description: "Corner splits safety and CB",
        trigger: { defense: { shell: ["cover2"] } },
        adjustment: "Hit corner between CB and safety",
      },
      {
        id: "smash_alert_cover3",
        label: "Cover 3 Read",
        description: "Work hitch vs dropping CB",
        trigger: { defense: { shell: ["cover3"] } },
        adjustment: "Read CB drop, hitch or corner",
      },
    ],
    installFocus: [
      "Outside WR: Corner at 12-15 yards",
      "Inside WR: Hitch at 5-6 yards",
      "QB: Read CB, high-low him",
    ],
    compatibleFronts: ["even", "odd", "over", "under"],
    compatibleShells: ["cover2", "cover3", "cover4"],
    tags: ["combination", "high_low", "cover2_beater"],
  },

  // Four Verts Family
  {
    id: "family_verts",
    name: "Four Verticals Family",
    baseConceptId: "pass_4_verts",
    conceptType: "pass",
    summary: "Four vertical routes stressing deep coverage",
    variations: [
      {
        conceptId: "pass_4_verts",
        label: "4 Verts",
        description: "All four eligibles run vertical",
        tags: ["base", "explosive"],
      },
      {
        conceptId: "pass_verts_seam",
        label: "Seam Read",
        description: "Verts with seam read vs coverage",
        tags: ["seam", "read"],
      },
      {
        conceptId: "pass_verts_bender",
        label: "Bender",
        description: "Outside WRs bend routes inside",
        tags: ["bender", "adjustment"],
      },
    ],
    alerts: [
      {
        id: "verts_alert_cover1",
        label: "Cover 1 Alert",
        description: "Single high safety - target seams",
        trigger: { defense: { shell: ["cover1"] } },
        adjustment: "Seam routes split safety",
      },
      {
        id: "verts_alert_cover2",
        label: "Cover 2 Alert",
        description: "Two deep - target middle",
        trigger: { defense: { shell: ["cover2"] } },
        adjustment: "Post split safeties, RB check down",
      },
    ],
    installFocus: [
      "Outside WRs: Win at line, stack CB",
      "Seam WRs: Push vertical, bend vs coverage",
      "QB: Pre-snap safety count, read seam",
    ],
    compatibleFronts: ["even", "odd", "over", "under"],
    compatibleShells: ["cover1", "cover3"],
    tags: ["vertical", "explosive", "seam"],
  },

  // Slant/Flat Family
  {
    id: "family_slant_flat",
    name: "Slant/Flat Family",
    baseConceptId: "pass_slant_flat",
    conceptType: "pass",
    summary: "Quick game slant with flat route combination",
    variations: [
      {
        conceptId: "pass_slant_flat",
        label: "Slant/Flat",
        description: "Slant + Flat quick combo",
        tags: ["base", "quick"],
      },
      {
        conceptId: "pass_quick_out",
        label: "Quick Out",
        description: "Out + Slant pattern",
        tags: ["out", "quick"],
      },
      {
        conceptId: "pass_bubble",
        label: "Bubble Screen",
        description: "Bubble + Stalk blocking",
        tags: ["screen", "quick"],
      },
    ],
    alerts: [
      {
        id: "slant_alert_press",
        label: "Press Coverage",
        description: "Use slant to beat press",
        trigger: { defense: { shell: ["cover0", "cover1"] } },
        adjustment: "WR wins inside release, quick slant",
      },
      {
        id: "slant_alert_off",
        label: "Off Coverage",
        description: "Quick hitch or bubble available",
        trigger: { defense: { shell: ["cover3", "cover4"] } },
        adjustment: "Bubble or hitch gains easy yards",
      },
    ],
    installFocus: [
      "Slant: 3-step drop, bang route",
      "Flat: RB/Slot runs flat route",
      "QB: Pre-snap look at LB depth",
    ],
    compatibleFronts: ["even", "odd", "over", "under"],
    compatibleShells: ["cover0", "cover1", "cover2", "cover3"],
    tags: ["quick", "high_percentage", "rhythm"],
  },
];

// ============================================
// Helper Functions
// ============================================

export function getConceptFamilyById(id: string): ConceptFamily | undefined {
  return CONCEPT_FAMILIES.find((f) => f.id === id);
}

export function getConceptFamilyByConceptId(conceptId: string): ConceptFamily | undefined {
  return CONCEPT_FAMILIES.find(
    (f) =>
      f.baseConceptId === conceptId ||
      f.variations.some((v) => v.conceptId === conceptId)
  );
}

export function getConceptFamiliesByType(type: "run" | "pass"): ConceptFamily[] {
  return CONCEPT_FAMILIES.filter((f) => f.conceptType === type);
}

export function getCompatibleFamilies(
  front: DefenseFront,
  shell: DefenseShell
): ConceptFamily[] {
  return CONCEPT_FAMILIES.filter(
    (f) =>
      f.compatibleFronts.includes(front) &&
      (shell === "unknown" || f.compatibleShells.includes(shell))
  );
}

export function getActiveAlerts(
  family: ConceptFamily,
  defense: { front?: DefenseFront; shell?: DefenseShell; boxCount?: number }
): typeof family.alerts {
  return family.alerts.filter((alert) => {
    const trigger = alert.trigger;

    if (trigger.defense) {
      if (trigger.defense.front && defense.front) {
        if (trigger.defense.front.includes(defense.front)) return true;
      }
      if (trigger.defense.shell && defense.shell) {
        if (trigger.defense.shell.includes(defense.shell)) return true;
      }
      if (trigger.defense.boxCount && defense.boxCount) {
        if (trigger.defense.boxCount.includes(defense.boxCount)) return true;
      }
    }

    return false;
  });
}
