// ============================================
// Last Known Good Snapshot Manager
// 에디터 안정성을 위한 스냅샷 관리
// - 주기적으로 검증된 상태 저장
// - 데이터 손상 시 복구 지원
// ============================================

import type { Play } from "@/domain/dsl/types";
import { validatePlay, type ValidationResult } from "@/domain/dsl/validation";
import { editorLog } from "@/lib/logger";

// ============================================
// Constants
// ============================================

const SNAPSHOT_KEY_PREFIX = "foroffense_snapshot_";
const SNAPSHOT_LIST_KEY = "foroffense_snapshot_list";
const MAX_SNAPSHOTS = 5; // Keep last 5 snapshots per play
const AUTO_SNAPSHOT_INTERVAL_MS = 30000; // Auto-snapshot every 30 seconds

// Size limits for localStorage protection (5MB total, we use ~2MB max)
const MAX_SNAPSHOT_SIZE_BYTES = 500 * 1024; // 500KB per snapshot
const MAX_TOTAL_SNAPSHOT_BYTES = 2 * 1024 * 1024; // 2MB total for all snapshots
const MIN_SNAPSHOTS_TO_KEEP = 2; // Always keep at least 2 snapshots per play

// ============================================
// Types
// ============================================

export interface Snapshot {
  id: string;
  playId: string;
  timestamp: string;
  play: Play;
  validation: {
    valid: boolean;
    errorCount: number;
    warningCount: number;
  };
  source: "auto" | "manual" | "save";
}

export interface SnapshotMetadata {
  id: string;
  playId: string;
  timestamp: string;
  source: "auto" | "manual" | "save";
  valid: boolean;
}

export interface SnapshotList {
  snapshots: SnapshotMetadata[];
  lastUpdated: string;
}

// ============================================
// Helper Functions
// ============================================

function generateSnapshotId(): string {
  return `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getSnapshotKey(snapshotId: string): string {
  return `${SNAPSHOT_KEY_PREFIX}${snapshotId}`;
}

/**
 * Estimate the byte size of a string (UTF-16 in localStorage)
 */
function estimateByteSize(str: string): number {
  return str.length * 2; // UTF-16 uses 2 bytes per character
}

/**
 * Get total size of all snapshot data in localStorage
 */
function getTotalSnapshotSize(): number {
  if (typeof window === "undefined") return 0;

  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(SNAPSHOT_KEY_PREFIX) || key === SNAPSHOT_LIST_KEY) {
      const value = localStorage.getItem(key);
      if (value) {
        total += estimateByteSize(key) + estimateByteSize(value);
      }
    }
  }
  return total;
}

/**
 * Clean up old snapshots to stay under size limit
 */
function cleanupSnapshotsForSize(): void {
  if (typeof window === "undefined") return;

  const list = getSnapshotList();
  const totalSize = getTotalSnapshotSize();

  if (totalSize <= MAX_TOTAL_SNAPSHOT_BYTES) return;

  // Group snapshots by play
  const byPlay = new Map<string, SnapshotMetadata[]>();
  for (const snap of list.snapshots) {
    const existing = byPlay.get(snap.playId) || [];
    existing.push(snap);
    byPlay.set(snap.playId, existing);
  }

  // Remove oldest snapshots, keeping MIN_SNAPSHOTS_TO_KEEP per play
  const toRemove: string[] = [];
  for (const [playId, snapshots] of byPlay) {
    // Sort by timestamp descending (newest first)
    snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Keep newest MIN_SNAPSHOTS_TO_KEEP, remove rest
    if (snapshots.length > MIN_SNAPSHOTS_TO_KEEP) {
      const removable = snapshots.slice(MIN_SNAPSHOTS_TO_KEEP);
      toRemove.push(...removable.map((s) => s.id));
    }
  }

  // Delete snapshots
  for (const id of toRemove) {
    localStorage.removeItem(getSnapshotKey(id));
  }

  // Update list
  list.snapshots = list.snapshots.filter((s) => !toRemove.includes(s.id));
  list.lastUpdated = new Date().toISOString();
  saveSnapshotList(list);

  console.info(`[Snapshot] Cleaned up ${toRemove.length} old snapshots for size limit`);
}

// ============================================
// Local Storage Operations
// ============================================

function getSnapshotList(): SnapshotList {
  if (typeof window === "undefined") {
    return { snapshots: [], lastUpdated: new Date().toISOString() };
  }

  try {
    const stored = localStorage.getItem(SNAPSHOT_LIST_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to read snapshot list:", e);
  }

  return { snapshots: [], lastUpdated: new Date().toISOString() };
}

function saveSnapshotList(list: SnapshotList): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SNAPSHOT_LIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to save snapshot list:", e);
  }
}

// ============================================
// Snapshot Operations
// ============================================

/**
 * Create a snapshot of the current play state.
 * Only saves if the play passes basic validation.
 */
export function createSnapshot(
  play: Play,
  source: "auto" | "manual" | "save" = "auto"
): Snapshot | null {
  if (typeof window === "undefined") return null;
  if (!play || !play.id) return null;

  // Validate the play
  const validationResult = validatePlay(play);

  // Only snapshot valid plays (or manually requested)
  if (!validationResult.valid && source === "auto") {
    // Skip auto-snapshot for invalid plays
    return null;
  }

  const snapshot: Snapshot = {
    id: generateSnapshotId(),
    playId: play.id,
    timestamp: new Date().toISOString(),
    play: JSON.parse(JSON.stringify(play)), // Deep clone
    validation: {
      valid: validationResult.valid,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length,
    },
    source,
  };

  // Check snapshot size before saving
  const snapshotJson = JSON.stringify(snapshot);
  const snapshotSize = estimateByteSize(snapshotJson);

  if (snapshotSize > MAX_SNAPSHOT_SIZE_BYTES) {
    console.warn(
      `[Snapshot] Snapshot too large (${Math.round(snapshotSize / 1024)}KB), skipping`
    );
    return null;
  }

  try {
    // Clean up if we're approaching size limit
    const currentTotal = getTotalSnapshotSize();
    if (currentTotal + snapshotSize > MAX_TOTAL_SNAPSHOT_BYTES) {
      cleanupSnapshotsForSize();
    }

    // Save the snapshot
    localStorage.setItem(getSnapshotKey(snapshot.id), snapshotJson);

    // Update the snapshot list
    const list = getSnapshotList();
    const metadata: SnapshotMetadata = {
      id: snapshot.id,
      playId: play.id,
      timestamp: snapshot.timestamp,
      source,
      valid: validationResult.valid,
    };

    list.snapshots.unshift(metadata);

    // Keep only MAX_SNAPSHOTS per play
    const playSnapshots = list.snapshots.filter((s) => s.playId === play.id);
    if (playSnapshots.length > MAX_SNAPSHOTS) {
      const toRemove = playSnapshots.slice(MAX_SNAPSHOTS);
      toRemove.forEach((s) => {
        localStorage.removeItem(getSnapshotKey(s.id));
      });
      list.snapshots = list.snapshots.filter(
        (s) => s.playId !== play.id || !toRemove.some((r) => r.id === s.id)
      );
    }

    list.lastUpdated = new Date().toISOString();
    saveSnapshotList(list);

    // Log snapshot creation (using event for compatibility)
    editorLog.event("SNAPSHOT_CREATED" as any, {
      snapshotId: snapshot.id,
      playId: play.id,
      source,
    });

    return snapshot;
  } catch (e) {
    // Handle quota exceeded error
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[Snapshot] Storage quota exceeded, cleaning up...");
      cleanupSnapshotsForSize();

      // Try one more time after cleanup
      try {
        localStorage.setItem(getSnapshotKey(snapshot.id), snapshotJson);
        return snapshot;
      } catch {
        console.error("[Snapshot] Still failed after cleanup");
        return null;
      }
    }

    console.error("[Snapshot] Failed to create snapshot:", e);
    return null;
  }
}

/**
 * Get all snapshots for a specific play.
 */
export function getSnapshotsForPlay(playId: string): Snapshot[] {
  if (typeof window === "undefined") return [];

  const list = getSnapshotList();
  const playSnapshots = list.snapshots.filter((s) => s.playId === playId);

  const snapshots: Snapshot[] = [];
  for (const meta of playSnapshots) {
    try {
      const stored = localStorage.getItem(getSnapshotKey(meta.id));
      if (stored) {
        snapshots.push(JSON.parse(stored));
      }
    } catch (e) {
      console.warn(`Failed to load snapshot ${meta.id}:`, e);
    }
  }

  return snapshots;
}

/**
 * Get the most recent valid snapshot for a play.
 */
export function getLastKnownGoodSnapshot(playId: string): Snapshot | null {
  const snapshots = getSnapshotsForPlay(playId);
  return snapshots.find((s) => s.validation.valid) || null;
}

/**
 * Get a specific snapshot by ID.
 */
export function getSnapshot(snapshotId: string): Snapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(getSnapshotKey(snapshotId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn(`Failed to load snapshot ${snapshotId}:`, e);
  }

  return null;
}

/**
 * Delete a specific snapshot.
 */
export function deleteSnapshot(snapshotId: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getSnapshotKey(snapshotId));

    const list = getSnapshotList();
    list.snapshots = list.snapshots.filter((s) => s.id !== snapshotId);
    list.lastUpdated = new Date().toISOString();
    saveSnapshotList(list);
  } catch (e) {
    console.warn(`Failed to delete snapshot ${snapshotId}:`, e);
  }
}

/**
 * Clear all snapshots for a play.
 */
export function clearSnapshotsForPlay(playId: string): void {
  if (typeof window === "undefined") return;

  const list = getSnapshotList();
  const toRemove = list.snapshots.filter((s) => s.playId === playId);

  toRemove.forEach((s) => {
    localStorage.removeItem(getSnapshotKey(s.id));
  });

  list.snapshots = list.snapshots.filter((s) => s.playId !== playId);
  list.lastUpdated = new Date().toISOString();
  saveSnapshotList(list);
}

// ============================================
// Auto-snapshot Hook
// ============================================

let autoSnapshotInterval: NodeJS.Timeout | null = null;
let lastSnapshotPlay: Play | null = null;

/**
 * Start auto-snapshotting for a play.
 */
export function startAutoSnapshot(getPlay: () => Play | null): void {
  stopAutoSnapshot();

  autoSnapshotInterval = setInterval(() => {
    const play = getPlay();
    if (!play) return;

    // Only snapshot if play has changed
    if (lastSnapshotPlay && JSON.stringify(play) === JSON.stringify(lastSnapshotPlay)) {
      return;
    }

    const snapshot = createSnapshot(play, "auto");
    if (snapshot) {
      lastSnapshotPlay = JSON.parse(JSON.stringify(play));
    }
  }, AUTO_SNAPSHOT_INTERVAL_MS);
}

/**
 * Stop auto-snapshotting.
 */
export function stopAutoSnapshot(): void {
  if (autoSnapshotInterval) {
    clearInterval(autoSnapshotInterval);
    autoSnapshotInterval = null;
  }
  lastSnapshotPlay = null;
}

// ============================================
// Recovery Check
// ============================================

export interface RecoveryInfo {
  needsRecovery: boolean;
  reason: "corruption" | "crash" | "mismatch" | null;
  lastGoodSnapshot: Snapshot | null;
  currentErrors: string[];
}

/**
 * Check if recovery is needed for a play.
 */
export function checkRecoveryNeeded(
  playId: string,
  currentPlay: Play | null
): RecoveryInfo {
  const result: RecoveryInfo = {
    needsRecovery: false,
    reason: null,
    lastGoodSnapshot: null,
    currentErrors: [],
  };

  if (!currentPlay) {
    // Check if we have snapshots for this play
    const lastGood = getLastKnownGoodSnapshot(playId);
    if (lastGood) {
      result.needsRecovery = true;
      result.reason = "crash";
      result.lastGoodSnapshot = lastGood;
      result.currentErrors = ["Play data is missing or corrupted"];
    }
    return result;
  }

  // Validate current play
  const validation = validatePlay(currentPlay);
  if (!validation.valid) {
    const lastGood = getLastKnownGoodSnapshot(playId);
    if (lastGood) {
      result.needsRecovery = true;
      result.reason = "corruption";
      result.lastGoodSnapshot = lastGood;
      result.currentErrors = validation.errors.map((e) => e.message);
    }
  }

  return result;
}

/**
 * Recover a play from the last known good snapshot.
 */
export function recoverFromSnapshot(snapshotId: string): Play | null {
  const snapshot = getSnapshot(snapshotId);
  if (!snapshot) return null;

  // Log recovery (using event for compatibility)
  editorLog.event("SNAPSHOT_RECOVERED" as any, {
    snapshotId,
    timestamp: snapshot.timestamp,
  });

  return JSON.parse(JSON.stringify(snapshot.play));
}
