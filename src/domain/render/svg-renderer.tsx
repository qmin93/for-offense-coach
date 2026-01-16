// ============================================
// SVG Renderer - Whiteboard Theme
// DSL → SVG 렌더링
// ============================================

"use client";

import React from "react";
import type {
  Play,
  Player,
  Action,
  RouteAction,
  BlockAction,
  MotionAction,
  LandmarkAction,
  TextAction,
  Point,
  GridDensity,
  BlockEndCap,
} from "../dsl/types";

// ============================================
// Constants - Whiteboard Theme
// ============================================

const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600; // Taller for more field depth
const FIELD_COLOR = "#FAFBFC"; // Off-white (clean whiteboard)
const LINE_COLOR = "#CBD5E1"; // Light slate gray for yard lines
const LOS_COLOR = "#3B82F6"; // Blue for Line of Scrimmage
const HASH_COLOR = "#E2E8F0"; // Very light gray for hash marks
const YARD_NUMBER_COLOR = "#94A3B8"; // Muted gray for yard numbers
const OFFENSE_COLOR = "#1E40AF"; // Navy blue for offense
const DEFENSE_COLOR = "#DC2626"; // Red for defense
const ROUTE_COLOR = "#F59E0B"; // Amber/orange for routes
const BLOCK_COLOR = "#2563EB"; // Bright blue for blocks
const PULL_COLOR = "#059669"; // Emerald green for pull blocks
const MOTION_COLOR = "#7C3AED"; // Purple for motion (distinct on white)
const PLAYER_RADIUS = 14;
const FONT_SIZE = 11;

// Field measurements (GoArmy Edge style)
// LOS at 62% from top: gives 62% for defense, 38% for offense/backfield
// This matches professional playbook tools where defense has more visual space
const LOS_POSITION = 0.62;
// Yard scale: controls how much vertical space each yard takes
// Tuned so 40 yards above LOS reaches near top, 15 yards below reaches near bottom
const YARD_SCALE = 0.14; // Fills the full canvas height

// ============================================
// Coordinate Conversion
// ============================================

function toSvgX(normalizedX: number): number {
  return normalizedX * FIELD_WIDTH;
}

function toSvgY(normalizedY: number): number {
  // Y=0 is LOS
  // Y > 0 is downfield (defense side, toward top of screen)
  // Y < 0 is backfield (offense side, toward bottom of screen)
  const losY = FIELD_HEIGHT * LOS_POSITION;
  // Scale: normalized Y to pixels
  // 0.1 normalized ≈ 5 yards, so multiply by 5 to get yard equivalent
  const pixelsPerYard = FIELD_HEIGHT * YARD_SCALE;
  return losY - normalizedY * pixelsPerYard * 5;
}

function toSvgPoint(point: Point): { x: number; y: number } {
  return {
    x: toSvgX(point.x),
    y: toSvgY(point.y),
  };
}

// ============================================
// Field Component - Whiteboard Style with Grid Density
// ============================================

interface FieldProps {
  showGrid?: boolean;
  showHash?: boolean;
  gridDensity?: GridDensity; // low = 10yd, medium = 5yd, high = 5yd + 1yd ticks
}

function Field({ showGrid = true, showHash = true, gridDensity = "medium" }: FieldProps) {
  const losY = toSvgY(0);
  const hashLeftX = toSvgX(0.355); // College hash (closer to center)
  const hashRightX = toSvgX(0.645);

  // Determine grid step based on density
  const gridStep = gridDensity === "low" ? 10 : 5;
  const show1YardTicks = gridDensity === "high";

  // Generate yard lines relative to LOS
  // With LOS at 62% and full scale, show -15 to +40 yards
  const yardLines: { yards: number; y: number; isMajor: boolean }[] = [];
  for (let yds = -15; yds <= 40; yds += gridStep) {
    const normalizedY = yds * 0.02; // 1 yard = 0.02 normalized
    yardLines.push({ yards: yds, y: toSvgY(normalizedY), isMajor: yds % 10 === 0 });
  }

  // Generate 1-yard tick positions for high density
  const oneYardTicks: { yards: number; y: number }[] = [];
  if (show1YardTicks) {
    for (let yds = -15; yds <= 40; yds += 1) {
      // Skip major (5-yard) lines
      if (yds % 5 === 0) continue;
      const normalizedY = yds * 0.02;
      const y = toSvgY(normalizedY);
      if (y >= 0 && y <= FIELD_HEIGHT) {
        oneYardTicks.push({ yards: yds, y });
      }
    }
  }

  return (
    <g className="field-layer">
      {/* Field background - clean whiteboard */}
      <rect
        x={0}
        y={0}
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        fill={FIELD_COLOR}
      />

      {/* Subtle border */}
      <rect
        x={0}
        y={0}
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={2}
      />

      {/* 1-yard tick marks (high density only) */}
      {showGrid && show1YardTicks && (
        <g className="one-yard-ticks">
          {oneYardTicks.map(({ yards, y }) => (
            <g key={`tick-${yards}`}>
              {/* Left sideline tick */}
              <line
                x1={20}
                y1={y}
                x2={35}
                y2={y}
                stroke={LINE_COLOR}
                strokeWidth={0.5}
                opacity={0.4}
              />
              {/* Right sideline tick */}
              <line
                x1={FIELD_WIDTH - 35}
                y1={y}
                x2={FIELD_WIDTH - 20}
                y2={y}
                stroke={LINE_COLOR}
                strokeWidth={0.5}
                opacity={0.4}
              />
              {/* Hash area ticks */}
              <line
                x1={hashLeftX - 4}
                y1={y}
                x2={hashLeftX + 4}
                y2={y}
                stroke={LINE_COLOR}
                strokeWidth={0.5}
                opacity={0.3}
              />
              <line
                x1={hashRightX - 4}
                y1={y}
                x2={hashRightX + 4}
                y2={y}
                stroke={LINE_COLOR}
                strokeWidth={0.5}
                opacity={0.3}
              />
            </g>
          ))}
        </g>
      )}

      {/* 5/10-yard grid lines */}
      {showGrid && (
        <g className="yard-lines">
          {yardLines.map(({ yards, y, isMajor }) => {
            // Skip if out of viewBox
            if (y < 0 || y > FIELD_HEIGHT) return null;

            const isLOS = yards === 0;
            if (isLOS) return null; // LOS drawn separately

            return (
              <g key={yards}>
                <line
                  x1={20}
                  y1={y}
                  x2={FIELD_WIDTH - 20}
                  y2={y}
                  stroke={LINE_COLOR}
                  strokeWidth={isMajor ? 1.5 : 1}
                  opacity={isMajor ? 0.7 : 0.5}
                />
                {/* Yard number on left (every 10 yards) */}
                {yards > 0 && isMajor && (
                  <text
                    x={8}
                    y={y + 4}
                    fill={YARD_NUMBER_COLOR}
                    fontSize={10}
                    fontWeight="500"
                  >
                    {yards}
                  </text>
                )}
                {/* Also show 5-yard markers for medium/high density */}
                {yards > 0 && !isMajor && gridDensity !== "low" && (
                  <text
                    x={8}
                    y={y + 4}
                    fill={YARD_NUMBER_COLOR}
                    fontSize={8}
                    opacity={0.6}
                  >
                    {yards}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* Hash marks */}
      {showHash && (
        <g className="hash-marks">
          {yardLines.map(({ yards, y }) => {
            if (y < 0 || y > FIELD_HEIGHT) return null;

            return (
              <g key={`hash-${yards}`}>
                {/* Left hash tick */}
                <line
                  x1={hashLeftX - 8}
                  y1={y}
                  x2={hashLeftX + 8}
                  y2={y}
                  stroke={HASH_COLOR}
                  strokeWidth={2}
                />
                {/* Right hash tick */}
                <line
                  x1={hashRightX - 8}
                  y1={y}
                  x2={hashRightX + 8}
                  y2={y}
                  stroke={HASH_COLOR}
                  strokeWidth={2}
                />
              </g>
            );
          })}
        </g>
      )}

      {/* Line of Scrimmage - prominent blue */}
      <line
        x1={0}
        y1={losY}
        x2={FIELD_WIDTH}
        y2={losY}
        stroke={LOS_COLOR}
        strokeWidth={3}
      />
      <text
        x={FIELD_WIDTH - 30}
        y={losY - 8}
        fill={LOS_COLOR}
        fontSize={10}
        fontWeight="600"
      >
        LOS
      </text>

      {/* Sideline indicators */}
      <line
        x1={20}
        y1={0}
        x2={20}
        y2={FIELD_HEIGHT}
        stroke={LINE_COLOR}
        strokeWidth={1}
        strokeDasharray="4,8"
        opacity={0.4}
      />
      <line
        x1={FIELD_WIDTH - 20}
        y1={0}
        x2={FIELD_WIDTH - 20}
        y2={FIELD_HEIGHT}
        stroke={LINE_COLOR}
        strokeWidth={1}
        strokeDasharray="4,8"
        opacity={0.4}
      />
    </g>
  );
}

// ============================================
// Player Component - Clean Style
// ============================================

interface PlayerNodeProps {
  player: Player;
  selected?: boolean;
  onClick?: (player: Player) => void;
}

function PlayerNode({ player, selected, onClick }: PlayerNodeProps) {
  const pos = toSvgPoint(player.alignment);
  const isOffense = player.unit === "offense";
  const color = isOffense ? OFFENSE_COLOR : DEFENSE_COLOR;

  // Determine stance visual (subtle indicator)
  const isLineman = ["LT", "LG", "C", "RG", "RT", "TE"].includes(player.role || "");

  return (
    <g
      className={`player-node ${selected ? "selected" : ""}`}
      onClick={() => onClick?.(player)}
      style={{ cursor: "pointer" }}
    >
      {/* Shadow for depth */}
      <circle
        cx={pos.x + 1}
        cy={pos.y + 2}
        r={PLAYER_RADIUS}
        fill="rgba(0,0,0,0.15)"
      />
      {/* Player circle */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={PLAYER_RADIUS}
        fill={color}
        stroke={selected ? "#F59E0B" : "#ffffff"}
        strokeWidth={selected ? 3 : 2}
      />
      {/* Stance indicator for linemen (small line at bottom) */}
      {isLineman && isOffense && (
        <line
          x1={pos.x - 6}
          y1={pos.y + PLAYER_RADIUS - 2}
          x2={pos.x + 6}
          y2={pos.y + PLAYER_RADIUS - 2}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={2}
        />
      )}
      {/* Label */}
      <text
        x={pos.x}
        y={pos.y + 4}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={FONT_SIZE}
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        {player.label}
      </text>
    </g>
  );
}

// ============================================
// Route Component - Clean with Shadow
// ============================================

interface RoutePathProps {
  action: RouteAction;
}

function RoutePath({ action }: RoutePathProps) {
  const points = action.route.controlPoints.map(toSvgPoint);
  if (points.length < 2) return null;

  const curveMode = action.route.curveMode ?? false;

  // Build path string
  let pathD: string;
  let arrowAngle: number;

  if (curveMode && points.length >= 2) {
    // Bezier curve mode
    // For 2 points: straight line
    // For 3 points: quadratic bezier (start, control, end)
    // For 4+ points: cubic bezier or chained curves

    if (points.length === 2) {
      // Simple line
      pathD = `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
      arrowAngle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
    } else if (points.length === 3) {
      // Quadratic bezier: M start Q control end
      pathD = `M ${points[0].x} ${points[0].y} Q ${points[1].x} ${points[1].y} ${points[2].x} ${points[2].y}`;
      // Arrow angle: tangent at end of quadratic bezier
      arrowAngle = Math.atan2(points[2].y - points[1].y, points[2].x - points[1].x);
    } else {
      // Cubic bezier or smooth curve through points
      // Use catmull-rom to cubic bezier conversion for smooth curves
      pathD = `M ${points[0].x} ${points[0].y}`;

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        // Catmull-Rom to Cubic Bezier
        const tension = 0.5;
        const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
        const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
        const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
        const cp2y = p2.y - (p3.y - p1.y) * tension / 3;

        pathD += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
      }

      // Arrow angle at the end
      const lastPt = points[points.length - 1];
      const prevPt = points[points.length - 2];
      arrowAngle = Math.atan2(lastPt.y - prevPt.y, lastPt.x - prevPt.x);
    }
  } else {
    // Polyline mode (original behavior)
    pathD = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, "");

    const lastPoint = points[points.length - 1];
    const prevPoint = points[points.length - 2];
    arrowAngle = Math.atan2(lastPoint.y - prevPoint.y, lastPoint.x - prevPoint.x);
  }

  const lastPoint = points[points.length - 1];

  return (
    <g className="route-action">
      {/* Shadow for visibility on white */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Main route line */}
      <path
        d={pathD}
        fill="none"
        stroke={ROUTE_COLOR}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow head */}
      {action.route.endMarker === "arrow" && (
        <polygon
          points={`
            ${lastPoint.x},${lastPoint.y}
            ${lastPoint.x - 14 * Math.cos(arrowAngle - 0.4)},${lastPoint.y - 14 * Math.sin(arrowAngle - 0.4)}
            ${lastPoint.x - 14 * Math.cos(arrowAngle + 0.4)},${lastPoint.y - 14 * Math.sin(arrowAngle + 0.4)}
          `}
          fill={ROUTE_COLOR}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth={2}
        />
      )}
    </g>
  );
}

// ============================================
// Block Component with EndCap Styles
// ============================================

interface BlockPathProps {
  action: BlockAction;
}

// Render different end cap styles
function renderBlockEndCap(
  lastPoint: { x: number; y: number },
  angle: number,
  endCap: BlockEndCap | undefined,
  color: string
): React.ReactNode {
  const defaultEndCap = endCap || "slash"; // Default to slash for coach-style

  switch (defaultEndCap) {
    case "arrow":
      // Traditional arrow head
      return (
        <polygon
          points={`
            ${lastPoint.x},${lastPoint.y}
            ${lastPoint.x - 12 * Math.cos(angle - 0.5)},${lastPoint.y - 12 * Math.sin(angle - 0.5)}
            ${lastPoint.x - 12 * Math.cos(angle + 0.5)},${lastPoint.y - 12 * Math.sin(angle + 0.5)}
          `}
          fill={color}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={1}
        />
      );

    case "slash":
      // Slash "/" style - perpendicular line at end, rotated to match direction
      // The slash is perpendicular to the line direction
      const slashLength = 12;
      const slashAngle = angle + Math.PI / 2; // Perpendicular to direction
      return (
        <line
          x1={lastPoint.x - slashLength * Math.cos(slashAngle)}
          y1={lastPoint.y - slashLength * Math.sin(slashAngle)}
          x2={lastPoint.x + slashLength * Math.cos(slashAngle)}
          y2={lastPoint.y + slashLength * Math.sin(slashAngle)}
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
        />
      );

    case "flat":
      // Flat end - just a thicker line cap at the end
      const flatLength = 10;
      const flatAngle = angle + Math.PI / 2;
      return (
        <line
          x1={lastPoint.x - flatLength * Math.cos(flatAngle)}
          y1={lastPoint.y - flatLength * Math.sin(flatAngle)}
          x2={lastPoint.x + flatLength * Math.cos(flatAngle)}
          y2={lastPoint.y + flatLength * Math.sin(flatAngle)}
          stroke={color}
          strokeWidth={6}
          strokeLinecap="butt"
        />
      );

    case "hand":
      // Hand symbol - small circle or half-circle representing hand placement
      return (
        <g>
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={6}
            fill={color}
            stroke="rgba(255,255,255,0.8)"
            strokeWidth={2}
          />
        </g>
      );

    default:
      return null;
  }
}

// Get scheme label abbreviation
function getSchemeLabel(scheme: string | undefined): string | null {
  if (!scheme) return null;
  const labels: Record<string, string> = {
    reach: "RCH",
    zone_step: "ZN",
    combo: "CMB",
    climb: "CLM",
    down: "DN",
    kick: "KCK",
    wrap: "WRP",
    pull_lead: "PL",
    pull_kick: "PK",
    trap: "TRP",
    wham: "WHM",
    arc: "ARC",
    sift: "SFT",
    seal: "SEL",
  };
  return labels[scheme] || null;
}

function BlockPath({ action }: BlockPathProps) {
  const pathPoints = action.block.pathPoints;
  if (!pathPoints || pathPoints.length < 2) {
    return null;
  }

  const points = pathPoints.map(toSvgPoint);
  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, "");

  const lastPoint = points[points.length - 1];
  const prevPoint = points[points.length - 2];
  const angle = Math.atan2(
    lastPoint.y - prevPoint.y,
    lastPoint.x - prevPoint.x
  );

  const isPull = action.block.scheme?.includes("pull") || action.block.scheme === "wrap";
  const color = isPull ? PULL_COLOR : BLOCK_COLOR;
  const endCap = action.block.endCap;
  const showLabel = action.block.showLabel;
  const schemeLabel = getSchemeLabel(action.block.scheme);

  // Calculate label position (midpoint of path)
  const midIdx = Math.floor(points.length / 2);
  const labelPos = points[midIdx] || points[0];

  return (
    <g className="block-action">
      {/* Shadow for visibility */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Main block line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={isPull ? "10,5" : undefined}
      />
      {/* End cap (slash, arrow, flat, or hand) */}
      {renderBlockEndCap(lastPoint, angle, endCap, color)}

      {/* Scheme label (optional) */}
      {showLabel && schemeLabel && (
        <g>
          <rect
            x={labelPos.x - 12}
            y={labelPos.y - 8}
            width={24}
            height={14}
            fill="white"
            stroke={color}
            strokeWidth={1}
            rx={2}
          />
          <text
            x={labelPos.x}
            y={labelPos.y + 3}
            textAnchor="middle"
            fill={color}
            fontSize={8}
            fontWeight="bold"
          >
            {schemeLabel}
          </text>
        </g>
      )}
    </g>
  );
}

// ============================================
// Motion Component
// ============================================

interface MotionPathProps {
  action: MotionAction;
}

function MotionPath({ action }: MotionPathProps) {
  const points = action.motion.pathPoints.map(toSvgPoint);
  if (points.length < 2) return null;

  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, "");

  const lastPoint = points[points.length - 1];
  const prevPoint = points[points.length - 2];
  const angle = Math.atan2(
    lastPoint.y - prevPoint.y,
    lastPoint.x - prevPoint.x
  );

  return (
    <g className="motion-action">
      {/* Shadow */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Main motion line */}
      <path
        d={pathD}
        fill="none"
        stroke={MOTION_COLOR}
        strokeWidth={3}
        strokeDasharray="8,5"
        strokeLinecap="round"
      />
      {/* Arrow head */}
      <polygon
        points={`
          ${lastPoint.x},${lastPoint.y}
          ${lastPoint.x - 10 * Math.cos(angle - 0.4)},${lastPoint.y - 10 * Math.sin(angle - 0.4)}
          ${lastPoint.x - 10 * Math.cos(angle + 0.4)},${lastPoint.y - 10 * Math.sin(angle + 0.4)}
        `}
        fill={MOTION_COLOR}
      />
    </g>
  );
}

// ============================================
// Landmark Component
// ============================================

interface LandmarkNodeProps {
  action: LandmarkAction;
}

function LandmarkNode({ action }: LandmarkNodeProps) {
  const pos = toSvgPoint({ x: action.landmark.x, y: action.landmark.y });

  return (
    <g className="landmark-action">
      <circle
        cx={pos.x}
        cy={pos.y}
        r={6}
        fill="#EF4444"
        stroke="#ffffff"
        strokeWidth={2}
      />
      {action.landmark.label && (
        <text
          x={pos.x}
          y={pos.y - 12}
          textAnchor="middle"
          fill="#374151"
          fontSize={10}
          fontWeight="bold"
        >
          {action.landmark.label}
        </text>
      )}
    </g>
  );
}

// ============================================
// Text Component
// ============================================

interface TextNodeProps {
  action: TextAction;
}

function TextNode({ action }: TextNodeProps) {
  const pos = toSvgPoint({ x: action.text.x, y: action.text.y });

  return (
    <g className="text-action">
      <text
        x={pos.x}
        y={pos.y}
        fill="#1F2937"
        fontSize={12}
        fontWeight="500"
      >
        {action.text.value}
      </text>
    </g>
  );
}

// ============================================
// Main SVG Renderer Component
// ============================================

export interface PlayRendererProps {
  play: Play;
  selectedPlayerId?: string;
  onPlayerClick?: (player: Player) => void;
  className?: string;
  showDefense?: boolean;
}

export function PlayRenderer({
  play,
  selectedPlayerId,
  onPlayerClick,
  className = "",
  showDefense = true,
}: PlayRendererProps) {
  const fieldSettings = play.field || {};

  // Filter players based on showDefense flag
  const visiblePlayers = showDefense
    ? play.roster.players
    : play.roster.players.filter((p) => p.unit !== "defense");

  return (
    <svg
      viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
      className={`w-full h-full ${className}`}
      style={{ backgroundColor: FIELD_COLOR }}
    >
      {/* Field layer */}
      <Field
        showGrid={fieldSettings.showGrid !== false}
        showHash={fieldSettings.showHash !== false}
        gridDensity={fieldSettings.gridDensity || "medium"}
      />

      {/* Actions layer (routes, blocks, motions) */}
      <g className="actions-layer">
        {play.actions.map((action) => {
          switch (action.actionType) {
            case "motion":
              return <MotionPath key={action.id} action={action as MotionAction} />;
            default:
              return null;
          }
        })}
        {play.actions.map((action) => {
          switch (action.actionType) {
            case "block":
              return <BlockPath key={action.id} action={action as BlockAction} />;
            default:
              return null;
          }
        })}
        {play.actions.map((action) => {
          switch (action.actionType) {
            case "route":
              return <RoutePath key={action.id} action={action as RouteAction} />;
            default:
              return null;
          }
        })}
      </g>

      {/* Landmarks layer */}
      <g className="landmarks-layer">
        {play.actions.map((action) => {
          if (action.actionType === "landmark") {
            return <LandmarkNode key={action.id} action={action as LandmarkAction} />;
          }
          return null;
        })}
      </g>

      {/* Players layer */}
      <g className="players-layer">
        {visiblePlayers.map((player) => (
          <PlayerNode
            key={player.id}
            player={player}
            selected={player.id === selectedPlayerId}
            onClick={onPlayerClick}
          />
        ))}
      </g>

      {/* Text layer */}
      <g className="text-layer">
        {play.actions.map((action) => {
          if (action.actionType === "text") {
            return <TextNode key={action.id} action={action as TextAction} />;
          }
          return null;
        })}
      </g>
    </svg>
  );
}

// ============================================
// Export utilities
// ============================================

export function getSvgDimensions() {
  return { width: FIELD_WIDTH, height: FIELD_HEIGHT };
}

export { FIELD_WIDTH, FIELD_HEIGHT };
