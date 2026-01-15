// ============================================
// Route Templates Library
// Pre-defined route patterns for quick application
// ============================================

import type { Point, RoutePattern } from "../dsl/types";

export interface RouteTemplate {
  id: string;
  name: string;
  pattern: RoutePattern;
  category: "quick" | "intermediate" | "deep" | "special";
  description: string;
  // Relative control points (offset from player position)
  // Y positive = upfield, X positive = right
  relativePoints: Point[];
  // Optional: direction modifier
  defaultDirection?: "inside" | "outside" | "straight";
}

// ============================================
// Quick Routes (0-5 yards)
// ============================================

const quickRoutes: RouteTemplate[] = [
  {
    id: "rt_hitch",
    name: "Hitch",
    pattern: "hitch",
    category: "quick",
    description: "5-yard stop, turn back to QB",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.12 },
    ],
  },
  {
    id: "rt_slant",
    name: "Slant",
    pattern: "slant",
    category: "quick",
    description: "3-step inside break at 45°",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.06 },
      { x: -0.08, y: 0.15 },
    ],
    defaultDirection: "inside",
  },
  {
    id: "rt_speed_out",
    name: "Speed Out",
    pattern: "speed_out",
    category: "quick",
    description: "Quick out at 5 yards",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.08 },
      { x: 0.12, y: 0.08 },
    ],
    defaultDirection: "outside",
  },
  {
    id: "rt_flat",
    name: "Flat",
    pattern: "flat",
    category: "quick",
    description: "Release to flat area",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0.15, y: 0.03 },
    ],
    defaultDirection: "outside",
  },
  {
    id: "rt_arrow",
    name: "Arrow",
    pattern: "arrow",
    category: "quick",
    description: "Angle route to flat",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0.12, y: 0.08 },
    ],
    defaultDirection: "outside",
  },
];

// ============================================
// Intermediate Routes (6-15 yards)
// ============================================

const intermediateRoutes: RouteTemplate[] = [
  {
    id: "rt_curl",
    name: "Curl",
    pattern: "curl",
    category: "intermediate",
    description: "10-12 yard curl, work back to QB",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.22 },
      { x: -0.03, y: 0.20 },
    ],
  },
  {
    id: "rt_dig",
    name: "Dig (In)",
    pattern: "dig",
    category: "intermediate",
    description: "12-15 yard inside break",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.25 },
      { x: -0.15, y: 0.25 },
    ],
    defaultDirection: "inside",
  },
  {
    id: "rt_out",
    name: "Out",
    pattern: "out",
    category: "intermediate",
    description: "12-yard outside break",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.22 },
      { x: 0.12, y: 0.22 },
    ],
    defaultDirection: "outside",
  },
  {
    id: "rt_cross",
    name: "Cross",
    pattern: "cross",
    category: "intermediate",
    description: "Cross field at 10-12 yards",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.18 },
      { x: -0.25, y: 0.20 },
    ],
    defaultDirection: "inside",
  },
  {
    id: "rt_shallow",
    name: "Shallow",
    pattern: "shallow",
    category: "intermediate",
    description: "Shallow cross at 5-6 yards",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.08 },
      { x: -0.20, y: 0.10 },
    ],
    defaultDirection: "inside",
  },
  {
    id: "rt_whip",
    name: "Whip",
    pattern: "whip",
    category: "intermediate",
    description: "Outside fake, inside settle",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.15 },
      { x: 0.05, y: 0.17 },
      { x: -0.05, y: 0.15 },
    ],
  },
  {
    id: "rt_deep_out",
    name: "Deep Out",
    pattern: "deep_out",
    category: "intermediate",
    description: "18-yard out route",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.32 },
      { x: 0.12, y: 0.32 },
    ],
    defaultDirection: "outside",
  },
];

// ============================================
// Deep Routes (16+ yards)
// ============================================

const deepRoutes: RouteTemplate[] = [
  {
    id: "rt_go",
    name: "Go (Fly)",
    pattern: "go",
    category: "deep",
    description: "Vertical route straight up field",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.45 },
    ],
    defaultDirection: "straight",
  },
  {
    id: "rt_post",
    name: "Post",
    pattern: "post",
    category: "deep",
    description: "12-yard break to post",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.25 },
      { x: -0.12, y: 0.45 },
    ],
    defaultDirection: "inside",
  },
  {
    id: "rt_corner",
    name: "Corner",
    pattern: "corner",
    category: "deep",
    description: "12-yard break to corner",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.25 },
      { x: 0.12, y: 0.45 },
    ],
    defaultDirection: "outside",
  },
  {
    id: "rt_seam",
    name: "Seam",
    pattern: "seam",
    category: "deep",
    description: "Vertical up the seam",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.40 },
    ],
    defaultDirection: "straight",
  },
];

// ============================================
// Special Routes
// ============================================

const specialRoutes: RouteTemplate[] = [
  {
    id: "rt_wheel",
    name: "Wheel",
    pattern: "wheel",
    category: "special",
    description: "Flat to vertical wheel",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0.08, y: 0.02 },
      { x: 0.10, y: 0.35 },
    ],
    defaultDirection: "outside",
  },
  {
    id: "rt_return",
    name: "Return",
    pattern: "return",
    category: "special",
    description: "Cross and return",
    relativePoints: [
      { x: 0, y: 0 },
      { x: -0.12, y: 0.12 },
      { x: 0.05, y: 0.20 },
    ],
  },
  {
    id: "rt_pivot",
    name: "Pivot",
    pattern: "pivot",
    category: "special",
    description: "Short pivot route",
    relativePoints: [
      { x: 0, y: 0 },
      { x: 0, y: 0.05 },
      { x: -0.06, y: 0.03 },
    ],
  },
];

// ============================================
// Export all templates
// ============================================

export const ROUTE_TEMPLATES: RouteTemplate[] = [
  ...quickRoutes,
  ...intermediateRoutes,
  ...deepRoutes,
  ...specialRoutes,
];

export const ROUTE_TEMPLATES_BY_CATEGORY = {
  quick: quickRoutes,
  intermediate: intermediateRoutes,
  deep: deepRoutes,
  special: specialRoutes,
};

// ============================================
// Helper Functions
// ============================================

export function getRouteTemplateById(id: string): RouteTemplate | undefined {
  return ROUTE_TEMPLATES.find((t) => t.id === id);
}

export function getRouteTemplateByPattern(pattern: RoutePattern): RouteTemplate | undefined {
  return ROUTE_TEMPLATES.find((t) => t.pattern === pattern);
}

/**
 * Apply template to a player's position
 * Returns absolute control points
 */
export function applyRouteTemplate(
  template: RouteTemplate,
  playerPosition: Point,
  mirror: boolean = false
): Point[] {
  return template.relativePoints.map((relPoint) => ({
    x: playerPosition.x + (mirror ? -relPoint.x : relPoint.x),
    y: playerPosition.y + relPoint.y,
  }));
}
