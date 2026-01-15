"use client";

import React, { useCallback, useRef, useState } from "react";
import { useEditorStore } from "../store";
import { PlayRenderer, FIELD_WIDTH, FIELD_HEIGHT } from "@/domain/render/svg-renderer";
import type { Player, Point } from "@/domain/dsl/types";
import { v4 as uuid } from "uuid";

// Convert normalized to SVG coordinates
function normalizedToSvg(point: Point): { x: number; y: number } {
  const svgX = point.x * FIELD_WIDTH;
  const losY = FIELD_HEIGHT * 0.4;
  const svgY = losY - point.y * FIELD_HEIGHT * 0.5;
  return { x: svgX, y: svgY };
}

export function Canvas() {
  const {
    play,
    mode,
    selectedPlayerId,
    selectPlayer,
    movePlayer,
    drawing,
    startDrawing,
    addDrawingPoint,
    finishDrawing,
    cancelDrawing,
    addAction,
  } = useEditorStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const dragPlayerId = useRef<string | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);

  // Get normalized coordinates from mouse event
  const getSvgCoordinates = useCallback(
    (clientX: number, clientY: number): Point | null => {
      if (!svgRef.current) return null;

      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      const viewBox = svg.viewBox.baseVal;

      const scaleX = viewBox.width / rect.width;
      const scaleY = viewBox.height / rect.height;

      const svgX = (clientX - rect.left) * scaleX;
      const svgY = (clientY - rect.top) * scaleY;

      // Convert to normalized coordinates
      const normalizedX = svgX / FIELD_WIDTH;
      const losY = FIELD_HEIGHT * 0.4;
      const normalizedY = (losY - svgY) / (FIELD_HEIGHT * 0.5);

      return { x: normalizedX, y: normalizedY };
    },
    []
  );

  // Handle player click
  const handlePlayerClick = useCallback(
    (player: Player) => {
      if (mode === "select") {
        selectPlayer(player.id);
      } else if (mode === "route" || mode === "block" || mode === "motion") {
        // Start drawing from this player
        const startPoint = { x: player.alignment.x, y: player.alignment.y };
        startDrawing(player.id, startPoint);
      }
    },
    [mode, selectPlayer, startDrawing]
  );

  // Handle mouse down on canvas
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (!coords) return;

      if (mode === "select" && selectedPlayerId) {
        // Start dragging player
        isDragging.current = true;
        dragPlayerId.current = selectedPlayerId;
      } else if (mode === "text" && !textInput) {
        // Show text input at click position
        setTextInput({ x: coords.x, y: coords.y, value: "" });
      }
    },
    [mode, selectedPlayerId, getSvgCoordinates, textInput]
  );

  // Handle mouse move on canvas
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDragging.current || !dragPlayerId.current) return;

      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (coords) {
        const x = Math.max(0, Math.min(1, coords.x));
        const y = Math.max(-1, Math.min(1, coords.y));
        movePlayer(dragPlayerId.current, { x, y });
      }
    },
    [getSvgCoordinates, movePlayer]
  );

  // Handle mouse up on canvas
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    dragPlayerId.current = null;
  }, []);

  // Handle click on canvas (for drawing points)
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (!coords) return;

      if (drawing.isDrawing) {
        // Add point to current drawing
        addDrawingPoint(coords);
      }
    },
    [getSvgCoordinates, drawing.isDrawing, addDrawingPoint]
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
        if (drawing.isDrawing) {
          cancelDrawing();
        }
        if (textInput) {
          setTextInput(null);
        }
      } else if (e.key === "Enter" && textInput) {
        // Add text action
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
            textStyle: {
              fontSize: "sm",
              box: false,
            },
          });
        }
        setTextInput(null);
      }
    },
    [drawing.isDrawing, cancelDrawing, textInput, addAction]
  );

  // Render drawing preview
  const renderDrawingPreview = () => {
    if (!drawing.isDrawing || drawing.drawingPoints.length === 0) return null;

    const points = drawing.drawingPoints.map(normalizedToSvg);
    const pathD = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, "");

    const color =
      mode === "route"
        ? "#fbbf24"
        : mode === "block"
          ? "#3b82f6"
          : mode === "motion"
            ? "#f97316"
            : "#ffffff";

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
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={color}
            stroke="#ffffff"
            strokeWidth={2}
          />
        ))}
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

  return (
    <div
      className="flex-1 bg-gray-800 p-4 overflow-hidden relative"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Mode indicator */}
      <div className="absolute top-6 left-6 z-10 px-3 py-1.5 bg-black/60 rounded-lg text-white text-sm font-medium">
        {mode === "select" && "Select: Click player to select, drag to move"}
        {mode === "route" && "Route: Click player, then click points, double-click to finish"}
        {mode === "block" && "Block: Click player, then click points, double-click to finish"}
        {mode === "motion" && "Motion: Click player, then click points, double-click to finish"}
        {mode === "text" && "Text: Click to place text"}
        {drawing.isDrawing && (
          <span className="ml-2 text-yellow-400">(ESC to cancel, double-click to finish)</span>
        )}
      </div>

      <div className="w-full h-full flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
          className={`max-w-full max-h-full rounded-lg shadow-xl ${
            mode === "select" ? "cursor-default" : "cursor-crosshair"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          onDoubleClick={handleDoubleClick}
        >
          <PlayRenderer
            play={play}
            selectedPlayerId={selectedPlayerId || undefined}
            onPlayerClick={handlePlayerClick}
          />
          {renderDrawingPreview()}
        </svg>
      </div>

      {/* Text input overlay */}
      {textInput && (
        <div
          className="absolute bg-white rounded-lg shadow-xl p-3 z-20"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
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
