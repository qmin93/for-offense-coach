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
  FieldLandmark,
  Formation,
  OverlayDensity,
} from "../dsl/types";
import { buildAllLandmarks, filterLandmarksByDensity } from "../engine/landmark-utils";
import { techToLabel } from "../engine/defense-presets";
import {
  resolveOverlayCollisions,
  createDefenseTechLabels,
  createLandmarkLabels,
  type OverlayLabel,
} from "../engine/overlay-collision";
import {
  YARD_CONSTANTS,
  getYardLinesInViewport,
  yardsToNormalizedY,
} from "../engine/yard-utils";

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
const LANDMARK_GAP_COLOR = "#10B981"; // Emerald for gap markers
const LANDMARK_EMOL_COLOR = "#F97316"; // Orange for EMOL markers
const TECH_LABEL_COLOR = "#DC2626"; // Red matching defense color

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
  viewportMinYards?: number; // Default: 0 (LOS)
  viewportMaxYards?: number; // Default: 25
}

function Field({
  showGrid = true,
  showHash = true,
  gridDensity = "medium",
  viewportMinYards = YARD_CONSTANTS.DEFAULT_VIEWPORT_MIN,
  viewportMaxYards = YARD_CONSTANTS.DEFAULT_VIEWPORT_MAX,
}: FieldProps) {
  const losY = toSvgY(0);
  const hashLeftX = toSvgX(0.355); // College hash (closer to center)
  const hashRightX = toSvgX(0.645);

  // Determine grid step based on density
  const gridStep = gridDensity === "low" ? 10 : 5;
  const show1YardTicks = gridDensity === "high";

  // Generate yard lines based on viewport range
  // Extend a bit beyond viewport to ensure lines at edges render
  const extendedMin = viewportMinYards - 5;
  const extendedMax = viewportMaxYards + 5;

  // Generate yard lines relative to LOS using yard-utils
  const yardLines = React.useMemo(() => {
    const lines: { yards: number; y: number; isMajor: boolean; is10Yard: boolean }[] = [];
    for (let yds = Math.floor(extendedMin / gridStep) * gridStep; yds <= extendedMax; yds += gridStep) {
      const normalizedY = yardsToNormalizedY(yds);
      const y = toSvgY(normalizedY);
      // Only include if within SVG bounds
      if (y >= -50 && y <= FIELD_HEIGHT + 50) {
        lines.push({
          yards: yds,
          y,
          isMajor: yds % 10 === 0,
          is10Yard: yds % 10 === 0,
        });
      }
    }
    return lines;
  }, [extendedMin, extendedMax, gridStep]);

  // Generate 1-yard tick positions for high density
  const oneYardTicks = React.useMemo(() => {
    if (!show1YardTicks) return [];
    const ticks: { yards: number; y: number }[] = [];
    for (let yds = Math.floor(extendedMin); yds <= extendedMax; yds += 1) {
      // Skip major (5-yard) lines
      if (yds % 5 === 0) continue;
      const normalizedY = yardsToNormalizedY(yds);
      const y = toSvgY(normalizedY);
      if (y >= 0 && y <= FIELD_HEIGHT) {
        ticks.push({ yards: yds, y });
      }
    }
    return ticks;
  }, [extendedMin, extendedMax, show1YardTicks]);

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
              />
              {/* Right sideline tick */}
              <line
                x1={FIELD_WIDTH - 35}
                y1={y}
                x2={FIELD_WIDTH - 20}
                y2={y}
                stroke={LINE_COLOR}
                strokeWidth={0.5}
              />
              {/* Hash area ticks */}
              <line
                x1={hashLeftX - 4}
                y1={y}
                x2={hashLeftX + 4}
                y2={y}
                stroke={LINE_COLOR}
                strokeWidth={0.5}
              />
              <line
                x1={hashRightX - 4}
                y1={y}
                x2={hashRightX + 4}
                y2={y}
                stroke={LINE_COLOR}
                strokeWidth={0.5}
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
                  stroke={isMajor ? LINE_COLOR : LINE_COLOR}
                  strokeWidth={isMajor ? 1.5 : 1}
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

      {/* Line of Scrimmage - prominent accent color */}
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
      />
      <line
        x1={FIELD_WIDTH - 20}
        y1={0}
        x2={FIELD_WIDTH - 20}
        y2={FIELD_HEIGHT}
        stroke={LINE_COLOR}
        strokeWidth={1}
        strokeDasharray="4,8"
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

  // Defense linemen get larger hitbox to include tech label area
  const isDefenseLine = !isOffense && ["DE", "DT", "NT"].includes(player.role);
  const hitboxExtension = isDefenseLine ? 24 : 0; // Extra height above for tech labels

  return (
    <g
      className={`player-node ${selected ? "selected" : ""}`}
      onClick={() => onClick?.(player)}
      style={{ cursor: "pointer" }}
    >
      {/* Invisible extended hitbox for defense linemen (includes tech label area) */}
      {isDefenseLine && (
        <rect
          x={pos.x - PLAYER_RADIUS - 4}
          y={pos.y - PLAYER_RADIUS - hitboxExtension}
          width={(PLAYER_RADIUS + 4) * 2}
          height={(PLAYER_RADIUS * 2) + hitboxExtension + 4}
          fill="transparent"
        />
      )}
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
      {/* Shadow for visibility */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(0,0,0,0.15)"
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
          stroke="rgba(0,0,0,0.15)"
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
// Motion Component - Supports Curved Motion (Bezier)
// ============================================

interface MotionPathProps {
  action: MotionAction;
}

function MotionPath({ action }: MotionPathProps) {
  const points = action.motion.pathPoints.map(toSvgPoint);
  if (points.length < 2) return null;

  const curveMode = action.motion.curveMode ?? false;

  // Build path string
  let pathD: string;
  let arrowAngle: number;

  if (curveMode && points.length >= 2) {
    // Bezier curve mode for motion
    if (points.length === 2) {
      // Simple line (2 points, no control)
      pathD = `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
      arrowAngle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
    } else if (points.length === 3) {
      // Quadratic bezier: M start Q control end
      pathD = `M ${points[0].x} ${points[0].y} Q ${points[1].x} ${points[1].y} ${points[2].x} ${points[2].y}`;
      // Arrow angle: tangent at end of quadratic bezier
      arrowAngle = Math.atan2(points[2].y - points[1].y, points[2].x - points[1].x);
    } else {
      // Cubic bezier or smooth curve through points (catmull-rom)
      pathD = `M ${points[0].x} ${points[0].y}`;
      const tension = 0.5;

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
        const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
        const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
        const cp2y = p2.y - (p3.y - p1.y) * tension / 3;

        pathD += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
      }

      const lastPt = points[points.length - 1];
      const prevPt = points[points.length - 2];
      arrowAngle = Math.atan2(lastPt.y - prevPt.y, lastPt.x - prevPt.x);
    }
  } else {
    // Polyline mode (straight segments)
    pathD = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, "");

    const lastPt = points[points.length - 1];
    const prevPt = points[points.length - 2];
    arrowAngle = Math.atan2(lastPt.y - prevPt.y, lastPt.x - prevPt.x);
  }

  const lastPoint = points[points.length - 1];

  return (
    <g className="motion-action">
      {/* Shadow */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Main motion line */}
      <path
        d={pathD}
        fill="none"
        stroke={MOTION_COLOR}
        strokeWidth={3}
        strokeDasharray="8,5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow head */}
      <polygon
        points={`
          ${lastPoint.x},${lastPoint.y}
          ${lastPoint.x - 10 * Math.cos(arrowAngle - 0.4)},${lastPoint.y - 10 * Math.sin(arrowAngle - 0.4)}
          ${lastPoint.x - 10 * Math.cos(arrowAngle + 0.4)},${lastPoint.y - 10 * Math.sin(arrowAngle + 0.4)}
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
        fill="#374151"
        fontSize={12}
        fontWeight="500"
      >
        {action.text.value}
      </text>
    </g>
  );
}

// ============================================
// Defense Tech Label Overlay Component (3T/5T/N/9 labels)
// ============================================

interface DefenseTechLabelOverlayProps {
  players: Player[];
  labelVisibility?: Map<string, boolean>;
}

function DefenseTechLabelOverlay({ players, labelVisibility }: DefenseTechLabelOverlayProps) {
  // Filter to only defense players with techniques (DL)
  const dlPlayers = players.filter(
    (p) =>
      p.unit === "defense" &&
      p.alignment &&
      // Only show for DL roles
      ["DE", "DT", "NT"].includes(p.role)
  );

  return (
    <g className="defense-tech-label-overlay">
      {dlPlayers.map((player) => {
        // Check visibility from collision resolution
        const labelId = `def-${player.id}`;
        if (labelVisibility && labelVisibility.has(labelId) && !labelVisibility.get(labelId)) {
          return null; // Hidden due to collision
        }

        const pos = toSvgPoint(player.alignment);
        // Try to get technique from player extensions or infer from role
        const technique = (player.extensions?.technique as string) || undefined;
        const label = techToLabel(technique as import("../dsl/types").DefenseTechValue | undefined);

        // If no technique, show role abbreviation for DL
        const displayLabel = label || (player.role === "NT" ? "N" : player.label);

        return (
          <g key={`tech-${player.id}`} className="tech-label">
            {/* Background pill for label */}
            <rect
              x={pos.x - 12}
              y={pos.y - PLAYER_RADIUS - 18}
              width={24}
              height={14}
              rx={7}
              fill="#ffffff"
              stroke={DEFENSE_COLOR}
              strokeWidth={1.5}
              opacity={0.95}
            />
            {/* Tech label text */}
            <text
              x={pos.x}
              y={pos.y - PLAYER_RADIUS - 8}
              textAnchor="middle"
              fill={DEFENSE_COLOR}
              fontSize={10}
              fontWeight="bold"
            >
              {displayLabel}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ============================================
// Field Landmark Overlay Component (EMOL/Gap markers)
// ============================================

interface FieldLandmarkOverlayProps {
  landmarks: FieldLandmark[];
  onLandmarkClick?: (landmark: FieldLandmark) => void;
  highlightedId?: string | null;
  labelVisibility?: Map<string, boolean>;
}

function FieldLandmarkOverlay({
  landmarks,
  onLandmarkClick,
  highlightedId,
  labelVisibility,
}: FieldLandmarkOverlayProps) {
  return (
    <g className="field-landmark-overlay">
      {landmarks.map((landmark) => {
        // Check visibility from collision resolution
        const labelId = `lm-${landmark.id}`;
        if (labelVisibility && labelVisibility.has(labelId) && !labelVisibility.get(labelId)) {
          return null; // Hidden due to collision
        }

        const pos = toSvgPoint({ x: landmark.x, y: landmark.y });
        const isGap = landmark.type === "gap";
        const color = isGap ? LANDMARK_GAP_COLOR : LANDMARK_EMOL_COLOR;
        const isHighlighted = highlightedId === landmark.id;

        // Gap markers: pill-shaped label
        // EMOL markers: triangle pointing at line
        if (isGap) {
          return (
            <g
              key={landmark.id}
              className="landmark-gap"
              onClick={() => onLandmarkClick?.(landmark)}
              style={{ cursor: onLandmarkClick ? "pointer" : "default" }}
            >
              {/* Pill background */}
              <rect
                x={pos.x - 14}
                y={pos.y - 10}
                width={28}
                height={20}
                rx={10}
                fill={isHighlighted ? color : "#ffffff"}
                stroke={color}
                strokeWidth={isHighlighted ? 3 : 2}
                opacity={0.95}
              />
              {/* Gap letter */}
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fill={isHighlighted ? "#ffffff" : color}
                fontSize={12}
                fontWeight="bold"
              >
                {landmark.label}
              </text>
              {/* Side indicator (small) */}
              {landmark.side !== "center" && (
                <text
                  x={pos.x}
                  y={pos.y + 22}
                  textAnchor="middle"
                  fill="#6B7280"
                  fontSize={8}
                >
                  {landmark.side === "strong" ? "S" : "W"}
                </text>
              )}
            </g>
          );
        }

        // EMOL markers
        return (
          <g
            key={landmark.id}
            className="landmark-emol"
            onClick={() => onLandmarkClick?.(landmark)}
            style={{ cursor: onLandmarkClick ? "pointer" : "default" }}
          >
            {/* Diamond shape for EMOL */}
            <polygon
              points={`
                ${pos.x},${pos.y - 12}
                ${pos.x + 10},${pos.y}
                ${pos.x},${pos.y + 12}
                ${pos.x - 10},${pos.y}
              `}
              fill={isHighlighted ? color : "#ffffff"}
              stroke={color}
              strokeWidth={isHighlighted ? 3 : 2}
              opacity={0.95}
            />
            {/* EMOL text label */}
            <text
              x={pos.x}
              y={pos.y - 18}
              textAnchor="middle"
              fill={color}
              fontSize={9}
              fontWeight="bold"
            >
              EMOL
            </text>
            {/* Side indicator */}
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              fill={isHighlighted ? "#ffffff" : color}
              fontSize={8}
              fontWeight="bold"
            >
              {landmark.side === "strong" ? "S" : "W"}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ============================================
// Tech Legend Component (for export)
// ============================================

const TECH_LEGEND_ITEMS = [
  { label: "0", desc: "Nose" },
  { label: "1", desc: "A-gap" },
  { label: "3T", desc: "B-gap (inside)" },
  { label: "4i", desc: "B-gap (inside)" },
  { label: "5T", desc: "C-gap" },
  { label: "7", desc: "D-gap (tight)" },
  { label: "9T", desc: "D-gap (wide)" },
];

function TechLegend() {
  const startX = FIELD_WIDTH - 90;
  const startY = FIELD_HEIGHT - 85;
  const lineHeight = 10;

  return (
    <g className="tech-legend" opacity={0.9}>
      {/* Background box */}
      <rect
        x={startX - 6}
        y={startY - 12}
        width={88}
        height={80}
        rx={4}
        fill="rgba(15,23,42,0.85)"
        stroke="rgba(148,163,184,0.3)"
        strokeWidth={0.5}
      />
      {/* Title */}
      <text
        x={startX}
        y={startY}
        fontSize={8}
        fontWeight="bold"
        fill="#94A3B8"
      >
        Tech Legend
      </text>
      {/* Items */}
      {TECH_LEGEND_ITEMS.map((item, i) => (
        <text
          key={item.label}
          x={startX}
          y={startY + 12 + i * lineHeight}
          fontSize={7}
          fill="#94A3B8"
        >
          <tspan fontWeight="bold" fill="#374151">{item.label}</tspan>
          <tspan fill="#6B7280"> = </tspan>
          <tspan>{item.desc}</tspan>
        </text>
      ))}
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
  // Landmark overlay options
  showLandmarks?: boolean;
  formation?: Formation | null;
  onLandmarkClick?: (landmark: FieldLandmark) => void;
  highlightedLandmarkId?: string | null;
  // Defense tech label overlay
  showDefenseLabels?: boolean;
  // Overlay density (clean/standard/full)
  overlayDensity?: OverlayDensity;
  // Enable collision avoidance between overlays
  useCollisionAvoidance?: boolean;
  // Show tech legend (for export)
  showLegend?: boolean;
  // Viewport configuration (in yards from LOS)
  viewportMinYards?: number;
  viewportMaxYards?: number;
}

export function PlayRenderer({
  play,
  selectedPlayerId,
  onPlayerClick,
  className = "",
  showDefense = true,
  showLandmarks = false,
  formation = null,
  onLandmarkClick,
  highlightedLandmarkId,
  showDefenseLabels = false,
  overlayDensity = "standard",
  useCollisionAvoidance = true,
  showLegend = false,
  viewportMinYards = YARD_CONSTANTS.DEFAULT_VIEWPORT_MIN,
  viewportMaxYards = YARD_CONSTANTS.DEFAULT_VIEWPORT_MAX,
}: PlayRendererProps) {
  const fieldSettings = play.field || {};

  // Filter players based on showDefense flag
  const visiblePlayers = showDefense
    ? play.roster.players
    : play.roster.players.filter((p) => p.unit !== "defense");

  // Generate field landmarks from formation (with density filtering)
  const fieldLandmarks = React.useMemo(() => {
    if (!showLandmarks) return [];
    const allLandmarks = buildAllLandmarks(formation);
    return filterLandmarksByDensity(allLandmarks, overlayDensity);
  }, [showLandmarks, formation, overlayDensity]);

  // Compute collision-resolved labels when both overlays are visible
  const resolvedLabels = React.useMemo<OverlayLabel[]>(() => {
    // Only compute if collision avoidance is enabled and at least one overlay is shown
    if (!useCollisionAvoidance || (!showDefenseLabels && !showLandmarks)) {
      return [];
    }

    const labels: OverlayLabel[] = [];

    // Add defense tech labels
    if (showDefenseLabels && showDefense) {
      const defenseLabels = createDefenseTechLabels(play.roster.players, toSvgPoint);
      labels.push(...defenseLabels);
    }

    // Add landmark labels
    if (showLandmarks && fieldLandmarks.length > 0) {
      const landmarkLabels = createLandmarkLabels(fieldLandmarks, toSvgPoint);
      labels.push(...landmarkLabels);
    }

    // Resolve collisions
    return resolveOverlayCollisions(labels);
  }, [
    useCollisionAvoidance,
    showDefenseLabels,
    showDefense,
    showLandmarks,
    play.roster.players,
    fieldLandmarks,
  ]);

  // Create lookup for label visibility
  const labelVisibility = React.useMemo(() => {
    const map = new Map<string, boolean>();
    resolvedLabels.forEach((label) => {
      map.set(label.id, label.visible);
    });
    return map;
  }, [resolvedLabels]);

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
        viewportMinYards={viewportMinYards}
        viewportMaxYards={viewportMaxYards}
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

      {/* User-placed landmarks layer */}
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

      {/* Defense Tech Label Overlay layer (3T/5T/N/9 labels) */}
      {showDefenseLabels && showDefense && (
        <DefenseTechLabelOverlay
          players={play.roster.players}
          labelVisibility={useCollisionAvoidance ? labelVisibility : undefined}
        />
      )}

      {/* Field Landmark Overlay layer (EMOL/Gap markers) - on top */}
      {showLandmarks && fieldLandmarks.length > 0 && (
        <FieldLandmarkOverlay
          landmarks={fieldLandmarks}
          onLandmarkClick={onLandmarkClick}
          highlightedId={highlightedLandmarkId}
          labelVisibility={useCollisionAvoidance ? labelVisibility : undefined}
        />
      )}

      {/* Tech Legend (for export) */}
      {showLegend && showDefenseLabels && <TechLegend />}
    </svg>
  );
}

// ============================================
// Export utilities
// ============================================

export function getSvgDimensions() {
  return { width: FIELD_WIDTH, height: FIELD_HEIGHT };
}

// Export coordinate conversion functions for use by other components
export { toSvgX, toSvgY, toSvgPoint };
export { FIELD_WIDTH, FIELD_HEIGHT, LOS_POSITION, YARD_SCALE };
