"use client";

// ============================================
// Save Status Badge
// Shows: Saving... | Saved | Local Draft | Sync Error
// ============================================

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { syncDrafts, getPendingSyncCount } from "@/lib/local-draft";
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type SaveState = "idle" | "saving" | "saved" | "local_draft" | "error" | "syncing";

interface SaveStatusBadgeProps {
  isSaving: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  className?: string;
}

export function SaveStatusBadge({
  isSaving,
  isDirty,
  lastSaved,
  saveError,
  className,
}: SaveStatusBadgeProps) {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Check for pending drafts
  useEffect(() => {
    const count = getPendingSyncCount();
    setPendingCount(count);
  }, [isDirty, isOnline]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (wasOffline && isOnline && pendingCount > 0) {
      handleSync();
    }
  }, [wasOffline, isOnline, pendingCount]);

  // Manual sync handler
  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncDrafts();

      if (result.synced.length > 0) {
        toast.success(`Synced ${result.synced.length} draft(s)`);
      }
      if (result.conflicts.length > 0) {
        toast.warning(`${result.conflicts.length} conflict(s) need resolution`);
      }
      if (result.failed.length > 0) {
        toast.error(`Failed to sync ${result.failed.length} draft(s)`);
      }

      setPendingCount(getPendingSyncCount());
    } catch (error) {
      toast.error("Sync failed. Will retry later.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Determine current state
  let state: SaveState = "idle";
  if (isSyncing) {
    state = "syncing";
  } else if (isSaving) {
    state = "saving";
  } else if (saveError) {
    state = "error";
  } else if (!isOnline && isDirty) {
    state = "local_draft";
  } else if (isDirty) {
    state = "idle";
  } else if (lastSaved) {
    state = "saved";
  }

  // Format last saved time
  const formatTime = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return lastSaved.toLocaleTimeString();
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Network status indicator */}
      {!isOnline && (
        <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
          <CloudOff className="w-3 h-3" />
          Offline
        </Badge>
      )}

      {/* Save status */}
      {state === "saving" && (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Saving...
        </Badge>
      )}

      {state === "syncing" && (
        <Badge variant="secondary" className="gap-1 text-blue-600">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Syncing...
        </Badge>
      )}

      {state === "saved" && (
        <Badge variant="secondary" className="gap-1 text-green-600">
          <Check className="w-3 h-3" />
          {formatTime() || "Saved"}
        </Badge>
      )}

      {state === "local_draft" && (
        <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
          <Cloud className="w-3 h-3" />
          Local draft
        </Badge>
      )}

      {state === "error" && (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="w-3 h-3" />
          Save failed
        </Badge>
      )}

      {state === "idle" && isDirty && (
        <Badge variant="outline" className="text-muted-foreground">
          Unsaved
        </Badge>
      )}

      {/* Sync button when there are pending drafts and online */}
      {isOnline && pendingCount > 0 && !isSyncing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Sync ({pendingCount})
        </Button>
      )}
    </div>
  );
}

export default SaveStatusBadge;
