"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "../store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];
const MAX_DURATION_MS = 3000; // 3 seconds for full animation
const FRAME_INTERVAL_MS = 50; // 20 FPS

interface PlaybackControlsProps {
  className?: string;
}

export function PlaybackControls({ className }: PlaybackControlsProps) {
  const {
    play,
    playbackState,
    playAnimation,
    pauseAnimation,
    seekTo,
    setPlaybackSpeed,
  } = useEditorStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Animation loop
  useEffect(() => {
    if (playbackState.isPlaying) {
      intervalRef.current = setInterval(() => {
        const { currentMs, speed } = useEditorStore.getState().playbackState;
        const nextMs = currentMs + FRAME_INTERVAL_MS * speed;

        if (nextMs >= MAX_DURATION_MS) {
          // Loop back to start
          seekTo(0);
          pauseAnimation();
        } else {
          seekTo(nextMs);
        }
      }, FRAME_INTERVAL_MS);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playbackState.isPlaying, seekTo, pauseAnimation]);

  const handlePlayPause = useCallback(() => {
    if (playbackState.isPlaying) {
      pauseAnimation();
    } else {
      // If at end, restart from beginning
      if (playbackState.currentMs >= MAX_DURATION_MS) {
        seekTo(0);
      }
      playAnimation();
    }
  }, [playbackState.isPlaying, playbackState.currentMs, playAnimation, pauseAnimation, seekTo]);

  const handleStep = useCallback(
    (direction: "forward" | "backward") => {
      const stepMs = 200;
      const newMs =
        direction === "forward"
          ? Math.min(playbackState.currentMs + stepMs, MAX_DURATION_MS)
          : Math.max(playbackState.currentMs - stepMs, 0);
      seekTo(newMs);
    },
    [playbackState.currentMs, seekTo]
  );

  const handleSliderChange = useCallback(
    (value: number[]) => {
      seekTo(value[0]);
    },
    [seekTo]
  );

  const formatTime = (ms: number): string => {
    const seconds = ms / 1000;
    return seconds.toFixed(1) + "s";
  };

  // Get phase based on current time
  const getPhase = (ms: number): string => {
    if (ms < 500) return "Pre-Snap";
    if (ms < 1000) return "Snap";
    if (ms < 1500) return "T1";
    if (ms < 2000) return "T2";
    return "T3";
  };

  if (!play) return null;

  return (
    <div
      className={cn(
        "bg-background/95 backdrop-blur border-t px-4 py-2 flex items-center gap-4",
        className
      )}
    >
      {/* Play/Pause */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleStep("backward")}
        >
          <span className="text-sm">⏮</span>
        </Button>
        <Button
          variant={playbackState.isPlaying ? "secondary" : "default"}
          size="icon"
          className="h-10 w-10"
          onClick={handlePlayPause}
        >
          <span className="text-lg">{playbackState.isPlaying ? "⏸" : "▶"}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleStep("forward")}
        >
          <span className="text-sm">⏭</span>
        </Button>
      </div>

      {/* Timeline slider */}
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-10">
          {formatTime(playbackState.currentMs)}
        </span>
        <Slider
          value={[playbackState.currentMs]}
          min={0}
          max={MAX_DURATION_MS}
          step={FRAME_INTERVAL_MS}
          onValueChange={handleSliderChange}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-10">
          {formatTime(MAX_DURATION_MS)}
        </span>
      </div>

      {/* Phase indicator */}
      <Badge variant="outline" className="text-xs min-w-16 justify-center">
        {getPhase(playbackState.currentMs)}
      </Badge>

      {/* Speed control */}
      <div className="flex items-center gap-1">
        {SPEED_OPTIONS.map((speed) => (
          <Button
            key={speed}
            variant={playbackState.speed === speed ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setPlaybackSpeed(speed)}
          >
            {speed}x
          </Button>
        ))}
      </div>
    </div>
  );
}
