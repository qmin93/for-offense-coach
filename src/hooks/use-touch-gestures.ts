// ============================================
// Touch Gesture Hook for Mobile View
// Supports: pinch-zoom, pan, double-tap reset
// ============================================

import React, { useCallback, useRef, useState } from "react";

export interface TouchGestureState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface UseTouchGesturesOptions {
  minScale?: number;
  maxScale?: number;
  onDoubleTap?: () => void;
}

export function useTouchGestures(options: UseTouchGesturesOptions = {}) {
  const { minScale = 0.5, maxScale = 3, onDoubleTap } = options;

  const [state, setState] = useState<TouchGestureState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  // Refs for tracking gesture state
  const gestureRef = useRef({
    isPinching: false,
    isPanning: false,
    startScale: 1,
    startDistance: 0,
    startX: 0,
    startY: 0,
    startTranslateX: 0,
    startTranslateY: 0,
    lastTap: 0,
  });

  // Calculate distance between two touch points
  const getDistance = useCallback((touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate center point between two touches
  const getCenter = useCallback((touches: React.TouchList) => {
    if (touches.length < 2) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    const gesture = gestureRef.current;

    if (touches.length === 2) {
      // Pinch gesture start
      gesture.isPinching = true;
      gesture.isPanning = false;
      gesture.startDistance = getDistance(touches);
      gesture.startScale = state.scale;

      const center = getCenter(touches);
      gesture.startX = center.x;
      gesture.startY = center.y;
      gesture.startTranslateX = state.translateX;
      gesture.startTranslateY = state.translateY;
    } else if (touches.length === 1) {
      // Check for double tap
      const now = Date.now();
      if (now - gesture.lastTap < 300) {
        // Double tap detected
        onDoubleTap?.();
        setState({ scale: 1, translateX: 0, translateY: 0 });
        gesture.lastTap = 0;
        return;
      }
      gesture.lastTap = now;

      // Pan gesture start (only when zoomed in)
      if (state.scale > 1) {
        gesture.isPanning = true;
        gesture.startX = touches[0].clientX;
        gesture.startY = touches[0].clientY;
        gesture.startTranslateX = state.translateX;
        gesture.startTranslateY = state.translateY;
      }
    }
  }, [state.scale, state.translateX, state.translateY, getDistance, getCenter, onDoubleTap]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    const gesture = gestureRef.current;

    if (gesture.isPinching && touches.length === 2) {
      e.preventDefault();

      // Calculate new scale
      const distance = getDistance(touches);
      const scaleChange = distance / gesture.startDistance;
      const newScale = Math.max(minScale, Math.min(maxScale, gesture.startScale * scaleChange));

      // Calculate new translation to zoom toward center of pinch
      const center = getCenter(touches);
      const dx = center.x - gesture.startX;
      const dy = center.y - gesture.startY;

      setState({
        scale: newScale,
        translateX: gesture.startTranslateX + dx,
        translateY: gesture.startTranslateY + dy,
      });
    } else if (gesture.isPanning && touches.length === 1) {
      e.preventDefault();

      const dx = touches[0].clientX - gesture.startX;
      const dy = touches[0].clientY - gesture.startY;

      setState((prev) => ({
        ...prev,
        translateX: gesture.startTranslateX + dx,
        translateY: gesture.startTranslateY + dy,
      }));
    }
  }, [getDistance, getCenter, minScale, maxScale]);

  const handleTouchEnd = useCallback(() => {
    gestureRef.current.isPinching = false;
    gestureRef.current.isPanning = false;
  }, []);

  const resetView = useCallback(() => {
    setState({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  const setScale = useCallback((scale: number) => {
    setState((prev) => ({
      ...prev,
      scale: Math.max(minScale, Math.min(maxScale, scale)),
    }));
  }, [minScale, maxScale]);

  return {
    ...state,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    resetView,
    setScale,
  };
}
