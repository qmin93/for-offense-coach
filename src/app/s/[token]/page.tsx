"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PlayRenderer } from "@/domain/render/svg-renderer";
import { Button } from "@/components/ui";
import type { Play } from "@/domain/dsl/types";
import { toast } from "sonner";
import { Copy, GitFork, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from "lucide-react";
import { telemetry } from "@/lib/telemetry";

// ============================================
// Share Page - View-only Play Viewer
// ============================================

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [play, setPlay] = useState<Play | null>(null);
  const [shareData, setShareData] = useState<{ playId?: string; playbookId?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Overlay toggles for viewer
  const [showDefense, setShowDefense] = useState(true);
  const [showDefenseLabels, setShowDefenseLabels] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(false);

  // Zoom/pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Fetch shared content
  useEffect(() => {
    async function fetchSharedContent() {
      try {
        const response = await fetch(`/api/share/${token}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch shared content");
        }

        const data = await response.json();

        if (data.content?.dslJson) {
          setPlay(data.content.dslJson as Play);
          setShareData({
            playId: data.playId,
            playbookId: data.playbookId,
          });
        } else {
          throw new Error("No play data found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchSharedContent();
  }, [token]);

  // Track view opened (once per session)
  useEffect(() => {
    if (play && !hasTrackedView) {
      telemetry.shareViewOpened({
        type: "play",
        shareToken: token,
        targetId: shareData?.playId || play.id,
        targetName: play.name,
      });
      setHasTrackedView(true);
    }
  }, [play, hasTrackedView, token, shareData]);

  // Fork handler - save to localStorage and redirect
  const handleFork = useCallback(async () => {
    if (!play) return;

    try {
      // Create forked play with new ID and derivedFrom
      const forkedPlay = {
        ...play,
        id: crypto.randomUUID(),
        name: `${play.name} (Fork)`,
        history: {
          version: 1,
          derivedFrom: {
            sourcePlayId: shareData?.playId || play.id,
            sourceConceptId: play.meta?.conceptId || null,
            sourceTeamId: null,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to localStorage for local-only mode
      const localPlays = JSON.parse(localStorage.getItem("forked_plays") || "[]");
      localPlays.push(forkedPlay);
      localStorage.setItem("forked_plays", JSON.stringify(localPlays));

      // Track fork
      telemetry.forkCreated({
        type: "play",
        sourceId: shareData?.playId || play.id,
      });

      toast.success("Play forked to your local workspace!");
      // Redirect to editor with the forked play
      window.location.href = `/editor/local_${forkedPlay.id}`;
    } catch (err) {
      toast.error("Failed to fork play");
    }
  }, [play, shareData]);

  // Copy link handler
  const handleCopyLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.25, 0.5));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.panX + dx,
        y: panStartRef.current.panY + dy,
      });
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(0.5, Math.min(3, z + delta)));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading shared play...</div>
      </div>
    );
  }

  if (error || !play) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Share Link Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "This share link may have expired or been revoked."}
          </p>
          <Link href="/">
            <Button>Go to ForOffenseCoach</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Branding Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Shared via ForOffenseCoach</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-blue-100 hover:text-white transition-colors"
          >
            Create your own plays
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 font-bold">
              ForOffenseCoach
            </Link>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-600">Shared Play</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopyLink} title="Copy link">
              <Copy className="w-4 h-4 mr-1" />
              Copy Link
            </Button>
            <Button variant="default" onClick={handleFork}>
              <GitFork className="w-4 h-4 mr-1" />
              Fork to Edit
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto p-6 w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Play name */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold">{play.name}</h1>
            <div className="text-sm text-gray-500 mt-1">
              {play.meta?.personnel && <span>{play.meta.personnel}</span>}
              {play.meta?.formationId && (
                <span> • {play.meta.formationId.replace("formation_", "")}</span>
              )}
              {play.meta?.conceptId && (
                <span> • {play.meta.conceptId.replace("concept_", "")}</span>
              )}
            </div>
          </div>

          {/* Toolbar: View Controls + Zoom */}
          <div className="px-6 py-2 border-b flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-500">View:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDefense}
                  onChange={(e) => setShowDefense(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600"
                />
                <span className="text-xs text-gray-600">Defense</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDefenseLabels}
                  onChange={(e) => setShowDefenseLabels(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600"
                />
                <span className="text-xs text-gray-600">Tech Labels</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLandmarks}
                  onChange={(e) => setShowLandmarks(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600"
                />
                <span className="text-xs text-gray-600">Landmarks</span>
              </label>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="h-7 w-7 p-0"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-gray-500 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="h-7 w-7 p-0"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetView}
                className="h-7 w-7 p-0 ml-1"
                title="Reset view"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Play diagram with zoom/pan */}
          <div
            className="aspect-video bg-white overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: "center center",
                transition: isPanning ? "none" : "transform 0.1s ease-out",
                width: "100%",
                height: "100%",
              }}
            >
              <PlayRenderer
                play={play}
                showDefense={showDefense}
                showDefenseLabels={showDefenseLabels}
                showLandmarks={showLandmarks}
                useCollisionAvoidance={showDefenseLabels && showLandmarks}
              />
            </div>
          </div>

          {/* Notes */}
          {play.notes?.coachingPoints && play.notes.coachingPoints.length > 0 && (
            <div className="px-6 py-4 border-t">
              <h3 className="font-semibold text-gray-700 mb-2">Coaching Points</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {play.notes.coachingPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-4 p-4 bg-white rounded-lg shadow border">
            <div className="text-left">
              <p className="font-medium text-gray-800">Want to create your own plays?</p>
              <p className="text-sm text-gray-500">Free to get started. No credit card required.</p>
            </div>
            <Link href="/">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>

        {/* Attribution */}
        <div className="text-center text-sm text-gray-400 mt-4">
          Powered by ForOffenseCoach
        </div>
      </div>
    </div>
  );
}
