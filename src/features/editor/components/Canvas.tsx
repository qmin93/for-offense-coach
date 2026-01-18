"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { useEditorStore } from "../store";
import { PlayRenderer, FIELD_WIDTH, FIELD_HEIGHT } from "@/domain/render/svg-renderer";
import type { Player, Point, Action, FieldLandmark } from "@/domain/dsl/types";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { snapPoint, getSnapIndicators } from "@/domain/engine/snap";

// Convert normalized to SVG coordinates (must match svg-renderer.tsx)
const LOS_POSITION = 0.35;
function normalizedToSvg(point: Point): { x: number; y: number } {
  const svgX = point.x * FIELD_WIDTH;
  const losY = FIELD_HEIGHT * LOS_POSITION;
  const yardScale = FIELD_HEIGHT * 0.08;
  const svgY = losY - point.y * yardScale * 5;
  return { x: svgX, y: svgY };
}

// Zoom limits
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.1;

export function Canvas() {
  const {
    play,
    mode,
    selectedPlayerId,
    selectedActionId,
    selectedPlayerIds,
    selectedActionIds,
    selectPlayer,
    selectAction,
    togglePlayerSelection,
    selectMultiplePlayers,
    toggleActionSelection,
    clearSelection,
    movePlayer,
    updateAction,
    drawing,
    startDrawing,
    addDrawingPoint,
    finishDrawing,
    cancelDrawing,
    addAction,
    snapConfig,
    setSnapConfig,
    toggleSnap,
    showDefense,
    createQuickBlock,
    showLandmarks,
    toggleLandmarkVisibility,
    showDefenseLabels,
    toggleDefenseLabels,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Pan/Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Selection box state (drag-to-select)
  const [selectionBox, setSelectionBox] = useState<{
    start: Point;
    end: Point;
  } | null>(null);
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);

  // Drag state
  const isDragging = useRef(false);
  const dragPlayerId = useRef<string | null>(null);
  const dragActionId = useRef<string | null>(null);
  const dragPointIndex = useRef<number | null>(null);

  // Block drag state (for quick block creation)
  const [blockDrag, setBlockDrag] = useState<{
    playerId: string;
    startPoint: Point;
    currentPoint: Point;
  } | null>(null);

  // Text input state
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);

  // Landmark targeting state (for block mode)
  const [highlightedLandmarkId, setHighlightedLandmarkId] = useState<string | null>(null);

  // Track modifier keys
  const [shiftPressed, setShiftPressed] = useState(false);

  // Alignment guides state (for drag guides)
  const [alignmentGuides, setAlignmentGuides] = useState<{
    horizontal: number[]; // y values of horizontal alignment lines
    vertical: number[];   // x values of vertical alignment lines
  }>({ horizontal: [], vertical: [] });
  const ALIGNMENT_THRESHOLD = 0.015; // Threshold for snapping to guide (in normalized coords)

  // Handle modifier keys for panning and multi-select
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !textInput) {
        e.preventDefault();
        setSpacePressed(true);
      }
      if (e.shiftKey) {
        setShiftPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpacePressed(false);
        setIsPanning(false);
      }
      if (!e.shiftKey) {
        setShiftPressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [textInput]);

  // Get normalized coordinates from mouse event (accounting for pan/zoom)
  const getSvgCoordinates = useCallback(
    (clientX: number, clientY: number): Point | null => {
      if (!svgRef.current || !containerRef.current) return null;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // Get center of container
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate SVG dimensions at current zoom
      const svgWidth = Math.min(rect.width, rect.height * (FIELD_WIDTH / FIELD_HEIGHT)) * zoom;
      const svgHeight = svgWidth * (FIELD_HEIGHT / FIELD_WIDTH);

      // Calculate SVG position (centered + pan offset)
      const svgLeft = centerX - svgWidth / 2 + pan.x;
      const svgTop = centerY - svgHeight / 2 + pan.y;

      // Convert client coords to SVG coords
      const relX = clientX - rect.left - svgLeft;
      const relY = clientY - rect.top - svgTop;

      const svgX = (relX / svgWidth) * FIELD_WIDTH;
      const svgY = (relY / svgHeight) * FIELD_HEIGHT;

      // Convert to normalized coordinates (must match svg-renderer.tsx)
      const normalizedX = svgX / FIELD_WIDTH;
      const losY = FIELD_HEIGHT * LOS_POSITION;
      const yardScale = FIELD_HEIGHT * 0.08;
      const normalizedY = (losY - svgY) / (yardScale * 5);

      return { x: normalizedX, y: normalizedY };
    },
    [zoom, pan]
  );

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)));
  }, []);

  // Handle player click
  const handlePlayerClick = useCallback(
    (player: Player) => {
      if (spacePressed || isPanning) return;

      if (mode === "select") {
        // Shift+click for additive selection
        if (shiftPressed) {
          togglePlayerSelection(player.id, true);
        } else {
          selectPlayer(player.id);
        }
      } else if (mode === "block") {
        // Block mode: start drag for quick block creation
        const startPoint = { x: player.alignment.x, y: player.alignment.y };
        setBlockDrag({
          playerId: player.id,
          startPoint,
          currentPoint: startPoint,
        });
      } else if (mode === "route" || mode === "motion") {
        const startPoint = { x: player.alignment.x, y: player.alignment.y };
        startDrawing(player.id, startPoint);
      }
    },
    [mode, selectPlayer, togglePlayerSelection, startDrawing, spacePressed, isPanning, shiftPressed]
  );

  // Handle landmark click (for block targeting in Block mode)
  const handleLandmarkClick = useCallback(
    (landmark: FieldLandmark) => {
      if (mode === "block" && blockDrag) {
        // Set landmark as the target for the current block being drawn
        setHighlightedLandmarkId(landmark.id);
        // Create a block targeting this landmark
        createQuickBlock(blockDrag.playerId, { x: landmark.x, y: landmark.y });
        setBlockDrag(null);
      } else if (mode === "select" || mode === "block") {
        // Toggle highlight for visual feedback
        setHighlightedLandmarkId((prev) => (prev === landmark.id ? null : landmark.id));
      }
    },
    [mode, blockDrag, createQuickBlock]
  );

  // Handle action click (for selecting routes/blocks to edit)
  const handleActionClick = useCallback(
    (action: Action, pointIndex?: number) => {
      if (spacePressed || isPanning) return;

      if (mode === "select") {
        // Shift+click for additive selection
        if (shiftPressed) {
          toggleActionSelection(action.id, true);
        } else {
          selectAction(action.id);
        }
        if (pointIndex !== undefined) {
          dragActionId.current = action.id;
          dragPointIndex.current = pointIndex;
        }
      }
    },
    [mode, selectAction, toggleActionSelection, spacePressed, isPanning, shiftPressed]
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Pan with space+drag or middle mouse button
      if (spacePressed || e.button === 1) {
        e.preventDefault();
        setIsPanning(true);
        panStart.current = {
          x: e.clientX,
          y: e.clientY,
          panX: pan.x,
          panY: pan.y,
        };
        return;
      }

      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (!coords) return;

      if (mode === "select") {
        if (selectedPlayerId && !e.shiftKey) {
          // Start dragging selected player
          isDragging.current = true;
          dragPlayerId.current = selectedPlayerId;
        } else if (!selectedPlayerId && !selectedActionId) {
          // Start box selection when clicking on empty area
          setIsBoxSelecting(true);
          setSelectionBox({ start: coords, end: coords });
        }
      } else if (mode === "text" && !textInput) {
        setTextInput({ x: coords.x, y: coords.y, value: "" });
      }
    },
    [mode, selectedPlayerId, selectedActionId, getSvgCoordinates, textInput, spacePressed, pan]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Handle panning
      if (isPanning) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        setPan({
          x: panStart.current.panX + dx,
          y: panStart.current.panY + dy,
        });
        return;
      }

      // Handle box selection
      if (isBoxSelecting && selectionBox) {
        const coords = getSvgCoordinates(e.clientX, e.clientY);
        if (coords) {
          setSelectionBox({ start: selectionBox.start, end: coords });
        }
        return;
      }

      // Handle block drag (quick block creation)
      if (blockDrag) {
        const coords = getSvgCoordinates(e.clientX, e.clientY);
        if (coords) {
          setBlockDrag({
            ...blockDrag,
            currentPoint: coords,
          });
        }
        return;
      }

      // Handle player dragging
      if (isDragging.current && dragPlayerId.current && play) {
        const coords = getSvgCoordinates(e.clientX, e.clientY);
        if (coords) {
          let x = Math.max(0, Math.min(1, coords.x));
          let y = Math.max(-1, Math.min(1, coords.y));

          // Apply snapping
          const snapResult = snapPoint({ x, y }, snapConfig);
          x = snapResult.point.x;
          y = snapResult.point.y;

          // Calculate alignment guides with other players
          const otherPlayers = play.roster.players.filter(p => p.id !== dragPlayerId.current);
          const horizontalGuides: number[] = [];
          const verticalGuides: number[] = [];

          for (const other of otherPlayers) {
            const ox = other.alignment.x;
            const oy = other.alignment.y;

            // Check horizontal alignment (same y)
            if (Math.abs(y - oy) < ALIGNMENT_THRESHOLD) {
              horizontalGuides.push(oy);
              y = oy; // Snap to guide
            }

            // Check vertical alignment (same x)
            if (Math.abs(x - ox) < ALIGNMENT_THRESHOLD) {
              verticalGuides.push(ox);
              x = ox; // Snap to guide
            }
          }

          setAlignmentGuides({
            horizontal: [...new Set(horizontalGuides)],
            vertical: [...new Set(verticalGuides)],
          });

          movePlayer(dragPlayerId.current, { x, y });
        }
      } else if (!isDragging.current) {
        // Clear alignment guides when not dragging
        if (alignmentGuides.horizontal.length > 0 || alignmentGuides.vertical.length > 0) {
          setAlignmentGuides({ horizontal: [], vertical: [] });
        }
      }

      // Handle action point dragging (for editing routes)
      if (dragActionId.current && dragPointIndex.current !== null) {
        const coords = getSvgCoordinates(e.clientX, e.clientY);
        if (coords && play) {
          const action = play.actions.find((a) => a.id === dragActionId.current);
          if (action) {
            let x = Math.max(0, Math.min(1, coords.x));
            let y = Math.max(-1, Math.min(1, coords.y));

            // Apply snapping
            const snapResult = snapPoint({ x, y }, snapConfig);
            x = snapResult.point.x;
            y = snapResult.point.y;

            if (action.actionType === "route") {
              const newPoints = [...action.route.controlPoints];
              newPoints[dragPointIndex.current] = { x, y };
              updateAction(action.id, {
                route: { ...action.route, controlPoints: newPoints },
              });
            } else if (action.actionType === "block" && action.block.pathPoints) {
              const newPoints = [...action.block.pathPoints];
              newPoints[dragPointIndex.current] = { x, y };
              updateAction(action.id, {
                block: { ...action.block, pathPoints: newPoints },
              });
            }
          }
        }
      }
    },
    [isPanning, isBoxSelecting, selectionBox, getSvgCoordinates, movePlayer, play, updateAction, snapConfig, alignmentGuides]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    // Finish block drag (create quick block)
    if (blockDrag) {
      const dx = blockDrag.currentPoint.x - blockDrag.startPoint.x;
      const dy = blockDrag.currentPoint.y - blockDrag.startPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only create block if dragged at least a small distance
      if (distance > 0.02) {
        createQuickBlock(blockDrag.playerId, blockDrag.currentPoint);
      }
      setBlockDrag(null);
      return;
    }

    // Finish box selection
    if (isBoxSelecting && selectionBox && play) {
      const minX = Math.min(selectionBox.start.x, selectionBox.end.x);
      const maxX = Math.max(selectionBox.start.x, selectionBox.end.x);
      const minY = Math.min(selectionBox.start.y, selectionBox.end.y);
      const maxY = Math.max(selectionBox.start.y, selectionBox.end.y);

      // Find all players within the box
      const playersInBox = play.roster.players.filter((player) => {
        const px = player.alignment.x;
        const py = player.alignment.y;
        return px >= minX && px <= maxX && py >= minY && py <= maxY;
      });

      if (playersInBox.length > 0) {
        selectMultiplePlayers(playersInBox.map((p) => p.id));
      } else {
        clearSelection();
      }
    }

    setIsPanning(false);
    setIsBoxSelecting(false);
    setSelectionBox(null);
    isDragging.current = false;
    dragPlayerId.current = null;
    dragActionId.current = null;
    dragPointIndex.current = null;
    // Clear alignment guides
    setAlignmentGuides({ horizontal: [], vertical: [] });
  }, [isBoxSelecting, selectionBox, play, selectMultiplePlayers, clearSelection, blockDrag, createQuickBlock]);

  // Handle canvas click (for drawing)
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (spacePressed || isPanning) return;

      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (!coords) return;

      if (drawing.isDrawing) {
        addDrawingPoint(coords);
      }
    },
    [getSvgCoordinates, drawing.isDrawing, addDrawingPoint, spacePressed, isPanning]
  );

  // Handle double click to finish drawing
  const handleDoubleClick = useCallback(() => {
    if (drawing.isDrawing) {
      finishDrawing();
    }
  }, [drawing.isDrawing, finishDrawing]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawing.isDrawing) cancelDrawing();
        if (isBoxSelecting) {
          setIsBoxSelecting(false);
          setSelectionBox(null);
        }
        if (textInput) setTextInput(null);
        clearSelection();
      } else if (e.key === "Enter" && textInput) {
        if (textInput.value.trim()) {
          addAction({
            id: `a_text_${uuid().slice(0, 8)}`,
            actionType: "text",
            layer: "primary",
            text: {
              value: textInput.value.trim(),
              x: textInput.x,
              y: textInput.y,
              width: 0.3,
              align: "left",
            },
            textStyle: { fontSize: "sm", box: false },
          });
        }
        setTextInput(null);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        // Delete selected action(s)
        const state = useEditorStore.getState();
        if (state.selectedActionIds.length > 0 && play) {
          // Bulk delete multiple selected actions
          state.removeSelectedActions();
        } else if (selectedActionId && play) {
          // Single action delete (backwards compatibility)
          state.removeAction(selectedActionId);
        }
      } else if (e.key === "c" || e.key === "C") {
        // Toggle curveMode on selected route or motion
        if (selectedActionId && play && !textInput) {
          const action = play.actions.find((a) => a.id === selectedActionId);
          if (action && action.actionType === "route") {
            const newCurveMode = !(action.route.curveMode ?? false);
            updateAction(action.id, {
              route: { ...action.route, curveMode: newCurveMode },
            });
          } else if (action && action.actionType === "motion") {
            const newCurveMode = !(action.motion.curveMode ?? false);
            updateAction(action.id, {
              motion: { ...action.motion, curveMode: newCurveMode },
            });
          }
        }
      } else if (e.key === "l" || e.key === "L") {
        // Toggle landmark overlay
        if (!textInput) {
          toggleLandmarkVisibility();
        }
      } else if (e.key === "t" || e.key === "T") {
        // Toggle defense tech labels
        if (!textInput) {
          toggleDefenseLabels();
        }
      }
    },
    [drawing.isDrawing, cancelDrawing, isBoxSelecting, textInput, addAction, selectedActionId, play, clearSelection, updateAction, toggleLandmarkVisibility, toggleDefenseLabels]
  );

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Render drawing preview
  const renderDrawingPreview = () => {
    if (!drawing.isDrawing || drawing.drawingPoints.length === 0) return null;

    const points = drawing.drawingPoints.map(normalizedToSvg);
    const pathD = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, "");

    // Colors matching whiteboard theme
    const color =
      mode === "route" ? "#F59E0B" : mode === "block" ? "#2563EB" : mode === "motion" ? "#7C3AED" : "#374151";

    return (
      <g className="drawing-preview">
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8,4"
          opacity={0.8}
        />
        {points.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r={6} fill={color} stroke="#ffffff" strokeWidth={2} />
        ))}
      </g>
    );
  };

  // Render block drag preview
  const renderBlockDragPreview = () => {
    if (!blockDrag) return null;

    const start = normalizedToSvg(blockDrag.startPoint);
    const end = normalizedToSvg(blockDrag.currentPoint);

    // Calculate angle for arrow head
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return (
      <g className="block-drag-preview">
        {/* Shadow */}
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Line */}
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="#2563EB"
          strokeWidth={5}
          strokeLinecap="round"
        />
        {/* Arrow head */}
        <polygon
          points="0,-8 16,0 0,8"
          fill="#2563EB"
          transform={`translate(${end.x},${end.y}) rotate(${angle})`}
        />
        {/* Start point */}
        <circle
          cx={start.x}
          cy={start.y}
          r={8}
          fill="#2563EB"
          stroke="#ffffff"
          strokeWidth={2}
        />
      </g>
    );
  };

  // Render alignment guides (horizontal and vertical lines for drag alignment)
  const renderAlignmentGuides = () => {
    if (alignmentGuides.horizontal.length === 0 && alignmentGuides.vertical.length === 0) {
      return null;
    }

    return (
      <g className="alignment-guides" pointerEvents="none">
        {/* Horizontal guides */}
        {alignmentGuides.horizontal.map((y, i) => {
          const svgY = normalizedToSvg({ x: 0, y }).y;
          return (
            <line
              key={`h-${i}`}
              x1={0}
              y1={svgY}
              x2={FIELD_WIDTH}
              y2={svgY}
              stroke="#3B82F6"
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.7}
            />
          );
        })}
        {/* Vertical guides */}
        {alignmentGuides.vertical.map((x, i) => {
          const svgX = normalizedToSvg({ x, y: 0 }).x;
          return (
            <line
              key={`v-${i}`}
              x1={svgX}
              y1={0}
              x2={svgX}
              y2={FIELD_HEIGHT}
              stroke="#3B82F6"
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.7}
            />
          );
        })}
      </g>
    );
  };

  // Render edit handles for selected action
  const renderEditHandles = () => {
    if (!selectedActionId || !play) return null;

    const action = play.actions.find((a) => a.id === selectedActionId);
    if (!action) return null;

    let points: Point[] = [];
    let isCurveAction = false;
    const actionType = action.actionType;

    if (actionType === "route") {
      points = action.route.controlPoints;
      isCurveAction = action.route.curveMode ?? false;
    } else if (actionType === "block" && action.block.pathPoints) {
      points = action.block.pathPoints;
    } else if (actionType === "motion") {
      points = action.motion.pathPoints;
      isCurveAction = action.motion.curveMode ?? false;
    }

    if (points.length === 0) return null;

    // Colors for different action types
    const curveColor = actionType === "motion" ? "#7C3AED" : "#F59E0B"; // Purple for motion, amber for route

    // For curve actions with only 2 points, show an auto-generated curve control handle
    // Position it at the midpoint, offset perpendicular to the line
    const renderCurveControlHandle = () => {
      if (!isCurveAction || points.length !== 2) return null;

      const start = points[0];
      const end = points[1];

      // Calculate midpoint
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;

      // Calculate perpendicular offset (normalized)
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const perpX = -dy / len;
      const perpY = dx / len;

      // Default offset amount (creates a nice curve)
      const offsetAmount = 0.05;
      const controlPoint: Point = {
        x: midX + perpX * offsetAmount,
        y: midY + perpY * offsetAmount,
      };

      const svgPoint = normalizedToSvg(controlPoint);

      // When dragged, insert a new control point to make it a 3-point curve
      const handleCurveControlDrag = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Insert the control point between start and end
        const newPoints = [start, controlPoint, end];

        if (actionType === "route") {
          updateAction(action.id, {
            route: { ...action.route, controlPoints: newPoints },
          });
        } else if (actionType === "motion") {
          updateAction(action.id, {
            motion: { ...action.motion, pathPoints: newPoints },
          });
        }

        // Set up dragging for the newly inserted point
        dragActionId.current = action.id;
        dragPointIndex.current = 1; // Middle point
      };

      return (
        <g className="curve-control-handle">
          {/* Dashed line showing the control position */}
          <line
            x1={normalizedToSvg(start).x}
            y1={normalizedToSvg(start).y}
            x2={svgPoint.x}
            y2={svgPoint.y}
            stroke={curveColor}
            strokeWidth={1}
            strokeDasharray="4,3"
            opacity={0.6}
            pointerEvents="none"
          />
          <line
            x1={svgPoint.x}
            y1={svgPoint.y}
            x2={normalizedToSvg(end).x}
            y2={normalizedToSvg(end).y}
            stroke={curveColor}
            strokeWidth={1}
            strokeDasharray="4,3"
            opacity={0.6}
            pointerEvents="none"
          />
          {/* Curve control point */}
          <circle
            cx={svgPoint.x}
            cy={svgPoint.y}
            r={10}
            fill={curveColor}
            stroke="#ffffff"
            strokeWidth={2}
            style={{ cursor: "move" }}
            onMouseDown={handleCurveControlDrag}
          />
          {/* Label */}
          <text
            x={svgPoint.x}
            y={svgPoint.y - 16}
            textAnchor="middle"
            fill={curveColor}
            fontSize={10}
            fontWeight="bold"
            pointerEvents="none"
          >
            Drag to curve
          </text>
        </g>
      );
    };

    return (
      <g className="edit-handles">
        {points.map((point, i) => {
          const svgPoint = normalizedToSvg(point);

          // For 3-point curve actions, middle point is the curve control
          const isCurveControl = isCurveAction && points.length === 3 && i === 1;
          const isEndpoint = i === 0 || i === points.length - 1;

          return (
            <g key={i}>
              {/* Show control lines for curve control point */}
              {isCurveControl && (
                <>
                  <line
                    x1={normalizedToSvg(points[0]).x}
                    y1={normalizedToSvg(points[0]).y}
                    x2={svgPoint.x}
                    y2={svgPoint.y}
                    stroke={curveColor}
                    strokeWidth={1}
                    strokeDasharray="4,3"
                    opacity={0.6}
                    pointerEvents="none"
                  />
                  <line
                    x1={svgPoint.x}
                    y1={svgPoint.y}
                    x2={normalizedToSvg(points[2]).x}
                    y2={normalizedToSvg(points[2]).y}
                    stroke={curveColor}
                    strokeWidth={1}
                    strokeDasharray="4,3"
                    opacity={0.6}
                    pointerEvents="none"
                  />
                </>
              )}
              <circle
                cx={svgPoint.x}
                cy={svgPoint.y}
                r={isCurveControl ? 10 : 8}
                fill={isCurveControl ? curveColor : "#ffffff"}
                stroke={isCurveControl ? "#ffffff" : isEndpoint ? "#3b82f6" : "#9CA3AF"}
                strokeWidth={2}
                style={{ cursor: "move" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  dragActionId.current = action.id;
                  dragPointIndex.current = i;
                }}
              />
            </g>
          );
        })}
        {/* Auto-generated curve handle for 2-point curve actions */}
        {renderCurveControlHandle()}
      </g>
    );
  };

  // Render selection box
  const renderSelectionBox = () => {
    if (!selectionBox) return null;

    const start = normalizedToSvg(selectionBox.start);
    const end = normalizedToSvg(selectionBox.end);

    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(59, 130, 246, 0.15)"
        stroke="#3b82f6"
        strokeWidth={1}
        strokeDasharray="4,4"
        pointerEvents="none"
      />
    );
  };

  // Render highlights for multi-selected players
  const renderMultiSelectHighlights = () => {
    if (selectedPlayerIds.length <= 1 || !play) return null;

    return (
      <g className="multi-select-highlights">
        {selectedPlayerIds.map((playerId) => {
          const player = play.roster.players.find((p) => p.id === playerId);
          if (!player) return null;
          const svgPoint = normalizedToSvg(player.alignment);
          return (
            <circle
              key={playerId}
              cx={svgPoint.x}
              cy={svgPoint.y}
              r={20}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="4,4"
              opacity={0.7}
            />
          );
        })}
      </g>
    );
  };

  if (!play) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🏈</div>
          <p>Select a formation to start</p>
        </div>
      </div>
    );
  }

  const cursor = spacePressed || isPanning ? "grab" : mode === "select" ? "default" : "crosshair";

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-slate-100 overflow-hidden relative"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor }}
    >
      {/* Top bar with mode and zoom controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        {/* Mode indicator */}
        <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg text-white text-sm font-medium">
          {mode === "select" && "Select: Click player/route to select, drag to move"}
          {mode === "route" && "Route: Click player, click points, double-click to finish"}
          {mode === "block" && "Block: Click player, drag direction, release to create"}
          {mode === "motion" && "Motion: Click player, click points, double-click to finish"}
          {mode === "text" && "Text: Click to place text"}
          {drawing.isDrawing && <span className="ml-2 text-amber-400">(ESC cancel, dbl-click finish)</span>}
          {blockDrag && <span className="ml-2 text-blue-300">(Dragging block...)</span>}
        </div>

        {/* Zoom and snap controls */}
        <div className="flex items-center gap-3">
          {/* Snap toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 text-xs ${
              snapConfig.enabled
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-800/80 text-white/60 hover:bg-slate-700/80"
            }`}
            onClick={toggleSnap}
            title={snapConfig.enabled ? "Snap enabled (click to disable)" : "Snap disabled (click to enable)"}
          >
            Snap {snapConfig.enabled ? "ON" : "OFF"}
          </Button>

          {/* Zoom controls */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP * 2))}
            >
              -
            </Button>
            <span className="text-white text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP * 2))}
            >
              +
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-white hover:bg-white/20 text-xs" onClick={resetView}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Help text */}
      <div className="absolute bottom-4 left-4 z-10 px-2 py-1 bg-slate-800/70 rounded text-white/80 text-xs">
        Scroll to zoom • Space+drag pan • Shift multi-select • Del remove • C curve • L landmarks • T tech labels
      </div>

      {/* Canvas */}
      <div
        className="w-full h-full flex items-center justify-center p-4"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
          className="rounded-lg shadow-xl"
          style={{
            width: `${100 * zoom}%`,
            maxWidth: `${FIELD_WIDTH * zoom}px`,
            height: "auto",
          }}
          onClick={handleCanvasClick}
          onDoubleClick={handleDoubleClick}
        >
          <PlayRenderer
            play={play}
            selectedPlayerId={selectedPlayerId || undefined}
            onPlayerClick={handlePlayerClick}
            showDefense={showDefense}
            showLandmarks={showLandmarks}
            formation={null}
            onLandmarkClick={handleLandmarkClick}
            highlightedLandmarkId={highlightedLandmarkId}
            showDefenseLabels={showDefenseLabels}
          />
          {renderDrawingPreview()}
          {renderBlockDragPreview()}
          {renderAlignmentGuides()}
          {renderEditHandles()}
          {renderMultiSelectHighlights()}
          {renderSelectionBox()}
        </svg>
      </div>

      {/* Text input overlay */}
      {textInput && (
        <div
          className="absolute bg-white rounded-lg shadow-xl p-3 z-20"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        >
          <div className="text-sm font-medium text-gray-700 mb-2">Add Text Annotation</div>
          <input
            type="text"
            autoFocus
            value={textInput.value}
            onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
            placeholder="Enter text..."
            className="px-3 py-2 border rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-xs text-gray-500 mt-2">Press Enter to add, Esc to cancel</div>
        </div>
      )}
    </div>
  );
}
