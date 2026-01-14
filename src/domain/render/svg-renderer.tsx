// ============================================
// SVG Renderer
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
} from "../dsl/types";

// ============================================
// Constants
// ============================================

const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 500;
const FIELD_COLOR = "#2d5a27";
const LINE_COLOR = "#ffffff";
const OFFENSE_COLOR = "#1e40af";
const DEFENSE_COLOR = "#dc2626";
const PLAYER_RADIUS = 14;
const FONT_SIZE = 11;

// ============================================
// Coordinate Conversion
// ============================================

function toSvgX(normalizedX: number): number {
  return normalizedX * FIELD_WIDTH;
}

function toSvgY(normalizedY: number): number {
  // Y=0 is LOS, which should be at ~40% from top
  // Y < 0 is backfield (below LOS)
  // Y > 0 is downfield (above LOS)
  const losY = FIELD_HEIGHT * 0.4;
  return losY - normalizedY * FIELD_HEIGHT * 0.5;
}

function toSvgPoint(point: Point): { x: number; y: number } {
  return {
    x: toSvgX(point.x),
    y: toSvgY(point.y),
  };
}

// ============================================
// Field Component
// ============================================

interface FieldProps {
  showGrid?: boolean;
  showHash?: boolean;
}

function Field({ showGrid = true, showHash = true }: FieldProps) {
  const losY = toSvgY(0);
  const hashLeftX = toSvgX(0.33);
  const hashRightX = toSvgX(0.67);

  return (
    <g className="field-layer">
      {/* Field background */}
      <rect
        x={0}
        y={0}
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        fill={FIELD_COLOR}
      />

      {/* Yard lines */}
      {showGrid && (
        <>
          {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((y) => (
            <line
              key={y}
              x1={0}
              y1={toSvgY(y - 0.4)}
              x2={FIELD_WIDTH}
              y2={toSvgY(y - 0.4)}
              stroke={LINE_COLOR}
              strokeWidth={1}
              opacity={0.3}
            />
          ))}
        </>
      )}

      {/* Line of Scrimmage */}
      <line
        x1={0}
        y1={losY}
        x2={FIELD_WIDTH}
        y2={losY}
        stroke={LINE_COLOR}
        strokeWidth={3}
      />

      {/* Hash marks */}
      {showHash && (
        <>
          <line
            x1={hashLeftX}
            y1={0}
            x2={hashLeftX}
            y2={FIELD_HEIGHT}
            stroke={LINE_COLOR}
            strokeWidth={1}
            strokeDasharray="5,10"
            opacity={0.4}
          />
          <line
            x1={hashRightX}
            y1={0}
            x2={hashRightX}
            y2={FIELD_HEIGHT}
            stroke={LINE_COLOR}
            strokeWidth={1}
            strokeDasharray="5,10"
            opacity={0.4}
          />
        </>
      )}
    </g>
  );
}

// ============================================
// Player Component
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

  return (
    <g
      className={`player-node ${selected ? "selected" : ""}`}
      onClick={() => onClick?.(player)}
      style={{ cursor: "pointer" }}
    >
      <circle
        cx={pos.x}
        cy={pos.y}
        r={PLAYER_RADIUS}
        fill={color}
        stroke={selected ? "#fbbf24" : "#ffffff"}
        strokeWidth={selected ? 3 : 2}
      />
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
// Route Component
// ============================================

interface RoutePathProps {
  action: RouteAction;
}

function RoutePath({ action }: RoutePathProps) {
  const points = action.route.controlPoints.map(toSvgPoint);
  if (points.length < 2) return null;

  // Build path string
  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, "");

  const lastPoint = points[points.length - 1];
  const prevPoint = points[points.length - 2];

  // Calculate arrow direction
  const angle = Math.atan2(
    lastPoint.y - prevPoint.y,
    lastPoint.x - prevPoint.x
  );

  return (
    <g className="route-action">
      <path
        d={pathD}
        fill="none"
        stroke={OFFENSE_COLOR}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow head */}
      {action.route.endMarker === "arrow" && (
        <polygon
          points={`
            ${lastPoint.x},${lastPoint.y}
            ${lastPoint.x - 10 * Math.cos(angle - 0.4)},${lastPoint.y - 10 * Math.sin(angle - 0.4)}
            ${lastPoint.x - 10 * Math.cos(angle + 0.4)},${lastPoint.y - 10 * Math.sin(angle + 0.4)}
          `}
          fill={OFFENSE_COLOR}
        />
      )}
    </g>
  );
}

// ============================================
// Block Component
// ============================================

interface BlockPathProps {
  action: BlockAction;
}

function BlockPath({ action }: BlockPathProps) {
  const pathPoints = action.block.pathPoints;
  if (!pathPoints || pathPoints.length < 2) {
    // If no path, draw from fromPlayer to target
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

  return (
    <g className="block-action">
      <path
        d={pathD}
        fill="none"
        stroke={isPull ? "#059669" : "#1e40af"}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={isPull ? "8,4" : undefined}
      />
      {/* Arrow head */}
      <polygon
        points={`
          ${lastPoint.x},${lastPoint.y}
          ${lastPoint.x - 8 * Math.cos(angle - 0.5)},${lastPoint.y - 8 * Math.sin(angle - 0.5)}
          ${lastPoint.x - 8 * Math.cos(angle + 0.5)},${lastPoint.y - 8 * Math.sin(angle + 0.5)}
        `}
        fill={isPull ? "#059669" : "#1e40af"}
      />
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

  return (
    <g className="motion-action">
      <path
        d={pathD}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={2}
        strokeDasharray="6,4"
        strokeLinecap="round"
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
        fill="#f59e0b"
        stroke="#ffffff"
        strokeWidth={2}
      />
      {action.landmark.label && (
        <text
          x={pos.x}
          y={pos.y - 12}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={10}
          fontWeight="bold"
          style={{
            textShadow: "0 0 3px rgba(0,0,0,0.8)",
          }}
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
        fill="#ffffff"
        fontSize={12}
        style={{
          textShadow: "0 0 4px rgba(0,0,0,0.9)",
        }}
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
}

export function PlayRenderer({
  play,
  selectedPlayerId,
  onPlayerClick,
  className = "",
}: PlayRendererProps) {
  const fieldSettings = play.field || {};

  return (
    <svg
      viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
      className={`w-full h-full ${className}`}
      style={{ backgroundColor: FIELD_COLOR }}
    >
      {/* Field layer */}
      <Field
        showGrid={fieldSettings.showGrid}
        showHash={fieldSettings.showHash}
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
        {play.roster.players.map((player) => (
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
