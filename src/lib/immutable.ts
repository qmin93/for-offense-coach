// ============================================
// Immutability Utilities
// 불변성 깨짐 방지를 위한 유틸리티
// ============================================

/**
 * Deep clone an object using structuredClone
 * Falls back to JSON parse/stringify for environments without structuredClone
 */
export function deepClone<T>(obj: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  // Fallback for older environments
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Create a new Play object with updated fields
 * Ensures the reference changes for React re-render
 */
export function updatePlay<T extends { updatedAt?: string }>(
  play: T,
  updates: Partial<T>
): T {
  return {
    ...deepClone(play),
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}
