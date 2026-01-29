"use client";

import React, { useMemo } from "react";
import type { Play, Action, RouteAction, BlockAction, MotionAction, Point } from "@/domain/dsl/types";
import {
  measureRoute,
  measureBlock,
  measureMotion,
  formatMeasurement,
  getMeasurementLabelPosition,
} from "@/domain/engine/measurement";
import { toSvgPoint } from "@/domain/render/svg-renderer";

// ============================================
// Types
// ============================================

interface MeasurementOverlayProps {
  play: Play;
  selectedActionId: string | null;
  showMeasurement: boolean;
}

interface MeasurementLabel {
  actionId: string;
  position: { x: number; y: number };
  distanceText: string;
  angleText: string;
  breakText?: string;
  isSelected: boolean;
}

// ============================================
// Constants
// ============================================

const LABEL_BG_COLOR = "rgba(255, 255, 255, 0.95)";
const LABEL_BORDER_COLOR = "#94A3B8";
const LABEL_TEXT_COLOR = "#334155";
const SELECTED_BORDER_COLOR = "#F59E0B";
const SELECTED_BG_COLOR = "rgba(251, 191, 36, 0.1)";

// ============================================
// MeasurementOverlay Component
// ============================================

export function MeasurementOverlay({
  play,
  selectedActionId,
  showMeasurement,
}: MeasurementOverlayProps) {
  // Generate measurement labels for all measurable actions
  const measurementLabels = useMemo<MeasurementLabel[]>(() => {
    if (!showMeasurement) return [];

    const labels: MeasurementLabel[] = [];

    for (const action of play.actions) {
      let data;
      let points: Point[] = [];

      switch (action.actionType) {
        case "route": {
          const routeAction = action as RouteAction;
          data = measureRoute(routeAction);
          points = routeAction.route.controlPoints;
          break;
        }
        case "block": {
          const blockAction = action as BlockAction;
          if (blockAction.block.pathPoints && blockAction.block.pathPoints.length >= 2) {
            data = measureBlock(blockAction);
            points = blockAction.block.pathPoints;
          }
          break;
        }
        case "motion": {
          const motionAction = action as MotionAction;
          data = measureMotion(motionAction);
          points = motionAction.motion.pathPoints;
          break;
        }
        default:
          continue;
      }

      if (data && data.distanceYards > 0.5) {
        const formatted = formatMeasurement(data);
        const midpoint = getMeasurementLabelPosition(points);
        const svgPos = toSvgPoint(midpoint);

        labels.push({
          actionId: action.id,
          position: svgPos,
          distanceText: formatted.distanceText,
          angleText: formatted.angleText,
          breakText: formatted.breakText,
          isSelected: action.id === selectedActionId,
        });
      }
    }

    return labels;
  }, [play.actions, showMeasurement, selectedActionId]);

  if (!showMeasurement || measurementLabels.length === 0) {
    return null;
  }

  return (
    <g className="measurement-overlay">
      {measurementLabels.map((label) => (
        <MeasurementLabelNode key={label.actionId} {...label} />
      ))}
    </g>
  );
}

// ============================================
// MeasurementLabelNode Component
// ============================================

interface MeasurementLabelNodeProps extends MeasurementLabel {}

function MeasurementLabelNode({
  position,
  distanceText,
  angleText,
  breakText,
  isSelected,
}: MeasurementLabelNodeProps) {
  const hasBreak = !!breakText;
  const labelHeight = hasBreak ? 38 : 24;
  const labelWidth = 72;

  // Offset to avoid overlapping with the action line
  const offsetY = -20;

  return (
    <g
      className="measurement-label"
      transform={`translate(${position.x - labelWidth / 2}, ${position.y + offsetY - labelHeight / 2})`}
    >
      {/* Background */}
      <rect
        x={0}
        y={0}
        width={labelWidth}
        height={labelHeight}
        rx={4}
        fill={isSelected ? SELECTED_BG_COLOR : LABEL_BG_COLOR}
        stroke={isSelected ? SELECTED_BORDER_COLOR : LABEL_BORDER_COLOR}
        strokeWidth={isSelected ? 2 : 1}
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
      />

      {/* Distance text (primary) */}
      <text
        x={labelWidth / 2}
        y={12}
        textAnchor="middle"
        fill={LABEL_TEXT_COLOR}
        fontSize={11}
        fontWeight="600"
      >
        {distanceText}
      </text>

      {/* Angle text (secondary) */}
      <text
        x={labelWidth / 2}
        y={hasBreak ? 23 : 22}
        textAnchor="middle"
        fill="#64748B"
        fontSize={9}
      >
        @ {angleText}
      </text>

      {/* Break text (if applicable) */}
      {hasBreak && (
        <text
          x={labelWidth / 2}
          y={34}
          textAnchor="middle"
          fill="#10B981"
          fontSize={8}
          fontWeight="500"
        >
          {breakText}
        </text>
      )}
    </g>
  );
}

// ============================================
// Export
// ============================================

export default MeasurementOverlay;
