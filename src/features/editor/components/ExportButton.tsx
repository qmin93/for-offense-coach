"use client";

import React, { useCallback } from "react";
import { useEditorStore } from "../store";
import { Button } from "@/components/ui";
import { FIELD_WIDTH, FIELD_HEIGHT } from "@/domain/render/svg-renderer";

export function ExportButton() {
  const { play } = useEditorStore();

  const handleExportPng = useCallback(async () => {
    if (!play) return;

    // Find the SVG element
    const svgElement = document.querySelector("svg");
    if (!svgElement) return;

    try {
      // Clone the SVG
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

      // Set explicit dimensions
      clonedSvg.setAttribute("width", String(FIELD_WIDTH * 2));
      clonedSvg.setAttribute("height", String(FIELD_HEIGHT * 2));

      // Serialize to string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);

      // Create blob and URL
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      // Create image and canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = FIELD_WIDTH * 2;
        canvas.height = FIELD_HEIGHT * 2;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Convert to PNG and download
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;

          const pngUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement("a");
          link.download = `${play.name || "play"}.png`;
          link.href = pngUrl;
          link.click();

          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(url);
        }, "image/png");
      };

      img.src = url;
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [play]);

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleExportPng}
      disabled={!play}
    >
      Export PNG
    </Button>
  );
}
