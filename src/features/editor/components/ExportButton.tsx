"use client";

import React, { useCallback, useState } from "react";
import { useEditorStore } from "../store";
import { Button } from "@/components/ui";
import { FIELD_WIDTH, FIELD_HEIGHT } from "@/domain/render/svg-renderer";
import { toast } from "sonner";
import { telemetry, startTimer, endTimer } from "@/lib/telemetry";

export function ExportButton() {
  const { play, playDbId } = useEditorStore();
  const [isSharing, setIsSharing] = useState(false);

  const handleExportPng = useCallback(async () => {
    if (!play) return;

    // Find the SVG element
    const svgElement = document.querySelector("svg");
    if (!svgElement) return;

    const startTime = performance.now();

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

          // Track successful export
          const timeMs = Math.round(performance.now() - startTime);
          telemetry.exportPng({
            playId: play.id,
            timeMs,
            scale: 2,
            width: FIELD_WIDTH * 2,
            height: FIELD_HEIGHT * 2,
            success: true,
          });

          toast.success("PNG exported successfully");
        }, "image/png");
      };

      img.src = url;
    } catch (error) {
      console.error("Export failed:", error);

      // Track failed export
      const timeMs = Math.round(performance.now() - startTime);
      telemetry.exportPng({
        playId: play.id,
        timeMs,
        scale: 2,
        width: FIELD_WIDTH * 2,
        height: FIELD_HEIGHT * 2,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      toast.error("Export failed");
    }
  }, [play]);

  const handleShare = useCallback(async () => {
    if (!playDbId) {
      toast.error("Save the play first to share it");
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "play",
          targetId: playDbId,
          permission: "view_only",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      const data = await response.json();
      const shareUrl = `${window.location.origin}/s/${data.token}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      // Track share link creation
      telemetry.shareLinkCreated({
        type: "play",
        targetId: playDbId,
        viewOnly: true,
      });

      toast.success("Share link copied!", {
        description: "Link copied to clipboard",
      });
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to create share link");
    } finally {
      setIsSharing(false);
    }
  }, [playDbId]);

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleShare}
        disabled={!playDbId || isSharing}
      >
        {isSharing ? "..." : "Share"}
      </Button>
      <Button
        size="sm"
        onClick={handleExportPng}
        disabled={!play}
      >
        Export PNG
      </Button>
    </div>
  );
}
