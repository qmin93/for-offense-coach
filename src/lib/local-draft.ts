// ============================================
// Local Draft Manager
// Handles offline draft persistence and sync
// ============================================

import type { Play } from "@/domain/dsl/types";

const DRAFT_KEY_PREFIX = "foroffense_draft_";
const DRAFT_META_KEY = "foroffense_draft_meta";

// ============================================
// Types
// ============================================

export interface LocalDraft {
  playId: string;
  playDbId: string | null;
  play: Play;
  savedAt: number;
  localRevision: number;
  serverRevision: number;
  needsSync: boolean;
}

export interface DraftMeta {
  draftIds: string[];
  lastSyncAttempt: number | null;
}

// ============================================
// Draft Storage
// ============================================

function getDraftKey(playId: string): string {
  return `${DRAFT_KEY_PREFIX}${playId}`;
}

export function saveDraft(
  playId: string,
  playDbId: string | null,
  play: Play,
  localRevision: number,
  serverRevision: number,
  isOffline: boolean
): void {
  if (typeof window === "undefined") return;

  try {
    const draft: LocalDraft = {
      playId,
      playDbId,
      play,
      savedAt: Date.now(),
      localRevision,
      serverRevision,
      needsSync: isOffline,
    };

    localStorage.setItem(getDraftKey(playId), JSON.stringify(draft));

    // Update meta
    const meta = getDraftMeta();
    if (!meta.draftIds.includes(playId)) {
      meta.draftIds.push(playId);
      localStorage.setItem(DRAFT_META_KEY, JSON.stringify(meta));
    }
  } catch (error) {
    console.error("Failed to save local draft:", error);
  }
}

export function getDraft(playId: string): LocalDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(getDraftKey(playId));
    if (stored) {
      return JSON.parse(stored) as LocalDraft;
    }
  } catch (error) {
    console.error("Failed to read local draft:", error);
  }
  return null;
}

export function deleteDraft(playId: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getDraftKey(playId));

    // Update meta
    const meta = getDraftMeta();
    meta.draftIds = meta.draftIds.filter((id) => id !== playId);
    localStorage.setItem(DRAFT_META_KEY, JSON.stringify(meta));
  } catch (error) {
    console.error("Failed to delete local draft:", error);
  }
}

export function getDraftMeta(): DraftMeta {
  if (typeof window === "undefined") {
    return { draftIds: [], lastSyncAttempt: null };
  }

  try {
    const stored = localStorage.getItem(DRAFT_META_KEY);
    if (stored) {
      return JSON.parse(stored) as DraftMeta;
    }
  } catch {
    // Ignore
  }
  return { draftIds: [], lastSyncAttempt: null };
}

// ============================================
// Sync Operations
// ============================================

export interface SyncResult {
  success: boolean;
  synced: string[];
  failed: string[];
  conflicts: string[];
}

export async function syncDrafts(): Promise<SyncResult> {
  const meta = getDraftMeta();
  const result: SyncResult = {
    success: true,
    synced: [],
    failed: [],
    conflicts: [],
  };

  if (meta.draftIds.length === 0) {
    return result;
  }

  // Update sync attempt time
  meta.lastSyncAttempt = Date.now();
  localStorage.setItem(DRAFT_META_KEY, JSON.stringify(meta));

  for (const playId of meta.draftIds) {
    const draft = getDraft(playId);
    if (!draft || !draft.needsSync || !draft.playDbId) {
      continue;
    }

    try {
      // Try to sync the draft to server
      const response = await fetch(`/api/plays/${draft.playDbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.play.name,
          dslJson: draft.play,
          localRevision: draft.localRevision,
        }),
      });

      if (response.ok) {
        // Mark as synced
        draft.needsSync = false;
        draft.serverRevision = draft.localRevision;
        localStorage.setItem(getDraftKey(playId), JSON.stringify(draft));
        result.synced.push(playId);
      } else if (response.status === 409) {
        // Conflict - server has newer version
        result.conflicts.push(playId);
      } else {
        result.failed.push(playId);
        result.success = false;
      }
    } catch (error) {
      result.failed.push(playId);
      result.success = false;
    }
  }

  return result;
}

export function getPendingSyncCount(): number {
  const meta = getDraftMeta();
  let count = 0;

  for (const playId of meta.draftIds) {
    const draft = getDraft(playId);
    if (draft?.needsSync) {
      count++;
    }
  }

  return count;
}

export function markDraftSynced(playId: string): void {
  const draft = getDraft(playId);
  if (draft) {
    draft.needsSync = false;
    draft.serverRevision = draft.localRevision;
    localStorage.setItem(getDraftKey(playId), JSON.stringify(draft));
  }
}

// ============================================
// Conflict Resolution
// ============================================

export type ConflictResolution = "keep_local" | "keep_server" | "merge";

export async function resolveConflict(
  playId: string,
  resolution: ConflictResolution
): Promise<boolean> {
  const draft = getDraft(playId);
  if (!draft || !draft.playDbId) return false;

  try {
    if (resolution === "keep_local") {
      // Force push local version
      const response = await fetch(`/api/plays/${draft.playDbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.play.name,
          dslJson: draft.play,
          forceUpdate: true,
        }),
      });

      if (response.ok) {
        markDraftSynced(playId);
        return true;
      }
    } else if (resolution === "keep_server") {
      // Discard local draft
      deleteDraft(playId);
      return true;
    }
    // merge not implemented - would need UI for manual merge
  } catch (error) {
    console.error("Failed to resolve conflict:", error);
  }

  return false;
}
