// ============================================
// Drill Search URL Builder
// Generates YouTube and Instagram search URLs for drills
// ============================================

// ============================================
// Types
// ============================================

export interface DrillSearchLinks {
  youtube: { url: string; query: string };
  instagram: { url: string; query: string };
}

export interface BuildDrillSearchParams {
  conceptName: string;
  drillTitle: string;
  tags?: string[];
  overrides?: {
    youtubeQuery?: string;
    instagramQuery?: string;
  };
}

// ============================================
// Constants
// ============================================

const POSITION_MAP: Record<string, string> = {
  OL: "offensive line",
  QB: "quarterback",
  WR: "wide receiver",
  RB: "running back",
  TE: "tight end",
  FB: "fullback",
  C: "center",
  LG: "left guard",
  RG: "right guard",
  LT: "left tackle",
  RT: "right tackle",
};

const MAX_QUERY_LENGTH = 100;

// ============================================
// Helper Functions
// ============================================

/**
 * Normalize a string for search queries
 * - lowercase
 * - remove special characters except spaces
 * - collapse multiple spaces
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Build a search query from concept, drill, and tags
 */
function buildQuery(params: {
  conceptName: string;
  drillTitle: string;
  tags?: string[];
}): string {
  const { conceptName, drillTitle, tags } = params;

  // Map tags to full position names
  const tagTokens = (tags ?? []).map((t) => POSITION_MAP[t] ?? t);

  // Build core query: drillTitle + conceptName + position tags
  const parts = [drillTitle, conceptName, ...tagTokens].filter(Boolean);
  let query = normalize(parts.join(" ") + " football drill coaching");

  // Truncate if too long (keep positions, drop technique tags)
  if (query.length > MAX_QUERY_LENGTH) {
    const positionTags = (tags ?? [])
      .filter((t) => POSITION_MAP[t])
      .map((t) => POSITION_MAP[t]);
    const reducedParts = [drillTitle, conceptName, ...positionTags].filter(Boolean);
    query = normalize(reducedParts.join(" ") + " football drill");
  }

  // Final truncation if still too long
  if (query.length > MAX_QUERY_LENGTH) {
    query = query.slice(0, MAX_QUERY_LENGTH).trim();
  }

  return query;
}

/**
 * Build a hashtag from drill title (for Instagram)
 */
function buildHashtag(drillTitle: string): string {
  return normalize(drillTitle).replace(/\s+/g, "");
}

// ============================================
// Main Function
// ============================================

/**
 * Build search URLs for YouTube and Instagram
 *
 * @param params - Concept name, drill title, tags, and optional query overrides
 * @returns Object with youtube and instagram search URLs and queries
 *
 * @example
 * ```ts
 * const links = buildDrillSearchLinks({
 *   conceptName: "Power",
 *   drillTitle: "G-Pull Steps",
 *   tags: ["OL", "pull", "kickout"],
 * });
 * // links.youtube.url = "https://www.youtube.com/results?search_query=..."
 * // links.instagram.url = "https://www.google.com/search?q=site:instagram.com+..."
 * ```
 */
export function buildDrillSearchLinks(params: BuildDrillSearchParams): DrillSearchLinks {
  const { conceptName, drillTitle, tags, overrides } = params;

  // Build YouTube query
  const youtubeQuery = overrides?.youtubeQuery ?? buildQuery({ conceptName, drillTitle, tags });
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`;

  // Build Instagram query (via Google site search - most reliable)
  const instagramQuery = overrides?.instagramQuery ?? buildQuery({ conceptName, drillTitle, tags });
  const instagramGoogleQuery = `site:instagram.com ${instagramQuery}`;
  const instagramUrl = `https://www.google.com/search?q=${encodeURIComponent(instagramGoogleQuery)}`;

  return {
    youtube: {
      url: youtubeUrl,
      query: youtubeQuery,
    },
    instagram: {
      url: instagramUrl,
      query: instagramGoogleQuery,
    },
  };
}

/**
 * Open a search URL in a new tab
 */
export function openDrillSearch(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Open a direct drill URL in a new tab
 */
export function openDrillUrl(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}
