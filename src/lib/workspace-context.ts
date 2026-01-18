// ============================================
// Workspace Context - Active Workspace Management
// ============================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================
// Types
// ============================================

export interface Workspace {
  id: string;
  name: string;
  type: "PERSONAL" | "TEAM";
  role: "OWNER" | "EDITOR" | "VIEWER";
  memberCount?: number;
}

export interface WorkspaceState {
  // Current active workspace
  activeWorkspaceId: string | null;
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveWorkspace: (workspaceId: string) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (workspaceId: string) => void;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getActiveWorkspace: () => Workspace | null;
  getPersonalWorkspace: () => Workspace | null;
  getTeamWorkspaces: () => Workspace[];
}

// ============================================
// Store
// ============================================

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      activeWorkspaceId: null,
      workspaces: [],
      isLoading: false,
      error: null,

      setActiveWorkspace: (workspaceId: string) => {
        set({ activeWorkspaceId: workspaceId });
      },

      setWorkspaces: (workspaces: Workspace[]) => {
        const state = get();
        set({ workspaces });

        // If no active workspace, set to personal or first available
        if (!state.activeWorkspaceId || !workspaces.find(w => w.id === state.activeWorkspaceId)) {
          const personal = workspaces.find(w => w.type === "PERSONAL");
          const firstWorkspace = personal || workspaces[0];
          if (firstWorkspace) {
            set({ activeWorkspaceId: firstWorkspace.id });
          }
        }
      },

      addWorkspace: (workspace: Workspace) => {
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
        }));
      },

      removeWorkspace: (workspaceId: string) => {
        const state = get();
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== workspaceId),
        }));

        // If removed workspace was active, switch to personal
        if (state.activeWorkspaceId === workspaceId) {
          const personal = state.workspaces.find(w => w.type === "PERSONAL" && w.id !== workspaceId);
          set({ activeWorkspaceId: personal?.id || state.workspaces[0]?.id || null });
        }
      },

      updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId ? { ...w, ...updates } : w
          ),
        }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      getActiveWorkspace: () => {
        const state = get();
        return state.workspaces.find((w) => w.id === state.activeWorkspaceId) || null;
      },

      getPersonalWorkspace: () => {
        const state = get();
        return state.workspaces.find((w) => w.type === "PERSONAL") || null;
      },

      getTeamWorkspaces: () => {
        const state = get();
        return state.workspaces.filter((w) => w.type === "TEAM");
      },
    }),
    {
      name: "workspace-storage",
      partialize: (state) => ({
        activeWorkspaceId: state.activeWorkspaceId,
      }),
    }
  )
);

// ============================================
// API Helpers
// ============================================

/**
 * Fetch user's workspaces from API
 */
export async function fetchWorkspaces(): Promise<Workspace[]> {
  const response = await fetch("/api/workspaces");
  if (!response.ok) {
    throw new Error("Failed to fetch workspaces");
  }
  const data = await response.json();
  return data.workspaces || [];
}

/**
 * Create a new workspace
 */
export async function createWorkspace(name: string, type: "PERSONAL" | "TEAM"): Promise<Workspace> {
  const response = await fetch("/api/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type }),
  });
  if (!response.ok) {
    throw new Error("Failed to create workspace");
  }
  return response.json();
}

/**
 * Initialize workspace context
 * Call this on app load
 */
export async function initializeWorkspaces(): Promise<void> {
  const store = useWorkspaceStore.getState();
  store.setLoading(true);
  store.setError(null);

  try {
    const workspaces = await fetchWorkspaces();
    store.setWorkspaces(workspaces);
  } catch (error) {
    store.setError(error instanceof Error ? error.message : "Unknown error");
  } finally {
    store.setLoading(false);
  }
}

// ============================================
// Hooks
// ============================================

/**
 * Hook to get current workspace ID for API calls
 * Returns the active workspace ID or throws if none
 */
export function useActiveWorkspaceId(): string {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  if (!activeWorkspaceId) {
    throw new Error("No active workspace selected");
  }
  return activeWorkspaceId;
}

/**
 * Hook to get current workspace with full details
 */
export function useActiveWorkspace(): Workspace | null {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  return workspaces.find((w) => w.id === activeWorkspaceId) || null;
}

/**
 * Check if user can edit in current workspace
 */
export function useCanEdit(): boolean {
  const workspace = useActiveWorkspace();
  return workspace?.role === "OWNER" || workspace?.role === "EDITOR";
}

/**
 * Check if user is owner of current workspace
 */
export function useIsOwner(): boolean {
  const workspace = useActiveWorkspace();
  return workspace?.role === "OWNER";
}
