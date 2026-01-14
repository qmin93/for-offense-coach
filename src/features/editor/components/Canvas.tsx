"use client";

import React, { useCallback, useRef } from "react";
import { useEditorStore } from "../store";
import { PlayRenderer, FIELD_WIDTH, FIELD_HEIGHT } from "@/domain/render/svg-renderer";
import type { Player } from "@/domain/dsl/types";

export function Canvas() {
  const { play, mode, selectedPlayerId, selectPlayer, movePlayer } =
    useEditorStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const dragPlayerId = useRef<string | null>(null);

  const handlePlayerClick = useCallback(
    (player: Player) => {
      if (mode === "select") {
        selectPlayer(player.id);
      }
    },
    [mode, selectPlayer]
  );

  const getSvgCoordinates = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      if (!svgRef.current) return null;

      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      const viewBox = svg.viewBox.baseVal;

      // Convert client coordinates to SVG coordinates
      const scaleX = viewBox.width / rect.width;
      const scaleY = viewBox.height / rect.height;

      const svgX = (clientX - rect.left) * scaleX;
      const svgY = (clientY - rect.top) * scaleY;

      // Convert to normalized coordinates
      const normalizedX = svgX / FIELD_WIDTH;
      // Convert from SVG Y to normalized Y (LOS is at 40% from top)
      const losY = FIELD_HEIGHT * 0.4;
      const normalizedY = (losY - svgY) / (FIELD_HEIGHT * 0.5);

      return { x: normalizedX, y: normalizedY };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (mode !== "select" || !selectedPlayerId) return;

      isDragging.current = true;
      dragPlayerId.current = selectedPlayerId;
    },
    [mode, selectedPlayerId]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDragging.current || !dragPlayerId.current) return;

      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (coords) {
        // Clamp coordinates
        const x = Math.max(0, Math.min(1, coords.x));
        const y = Math.max(-1, Math.min(1, coords.y));
        movePlayer(dragPlayerId.current, { x, y });
      }
    },
    [getSvgCoordinates, movePlayer]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    dragPlayerId.current = null;
  }, []);

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
    <div className="flex-1 bg-gray-800 p-4 overflow-hidden">
      <div className="w-full h-full flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
          className={`max-w-full max-h-full rounded-lg shadow-xl cursor-${
            mode === "select" ? "default" : "crosshair"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <PlayRenderer
            play={play}
            selectedPlayerId={selectedPlayerId || undefined}
            onPlayerClick={handlePlayerClick}
          />
        </svg>
      </div>
    </div>
  );
}
