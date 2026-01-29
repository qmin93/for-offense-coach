// ============================================
// Network Status Hook
// Detects online/offline state and network quality
// ============================================

import { useState, useEffect, useCallback } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean; // True if was recently offline (for sync trigger)
  lastOnline: Date | null;
  lastOffline: Date | null;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    wasOffline: false,
    lastOnline: null,
    lastOffline: null,
  });

  const handleOnline = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      isOnline: true,
      wasOffline: true,
      lastOnline: new Date(),
    }));

    // Reset wasOffline after a short delay
    setTimeout(() => {
      setStatus((prev) => ({ ...prev, wasOffline: false }));
    }, 5000);
  }, []);

  const handleOffline = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      isOnline: false,
      lastOffline: new Date(),
    }));
  }, []);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return status;
}
