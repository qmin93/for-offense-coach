// ============================================
// Mobile Detection Hook
// ============================================

import { useState, useEffect } from "react";

export interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
}

export function useMobileDetect(): MobileInfo {
  const [info, setInfo] = useState<MobileInfo>({
    isMobile: false,
    isTablet: false,
    isTouchDevice: false,
    screenWidth: typeof window !== "undefined" ? window.innerWidth : 1024,
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

      // Mobile: < 768px
      // Tablet: 768px - 1024px
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;

      setInfo({
        isMobile,
        isTablet,
        isTouchDevice,
        screenWidth: width,
      });
    };

    // Initial check
    checkDevice();

    // Listen for resize
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return info;
}

// Simple utility for SSR-safe check
export function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
