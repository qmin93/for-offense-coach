// ============================================
// Share Store
// ============================================

import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { Play, Playbook } from "@/domain/dsl/types";

export interface ShareLink {
  id: string;
  token: string;
  targetType: "play" | "playbook";
  targetId: string;
  permission: "view_only" | "view_download";
  createdAt: string;
  expiresAt?: string;
}

export interface ShareState {
  shareLinks: ShareLink[];

  // Actions
  createShareLink: (
    targetType: "play" | "playbook",
    targetId: string,
    permission?: "view_only" | "view_download"
  ) => ShareLink;
  revokeShareLink: (linkId: string) => void;
  getShareLink: (token: string) => ShareLink | undefined;
}

export const useShareStore = create<ShareState>((set, get) => ({
  shareLinks: [],

  createShareLink: (
    targetType: "play" | "playbook",
    targetId: string,
    permission = "view_only"
  ) => {
    const link: ShareLink = {
      id: uuid(),
      token: uuid(),
      targetType,
      targetId,
      permission,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      shareLinks: [...state.shareLinks, link],
    }));

    return link;
  },

  revokeShareLink: (linkId: string) => {
    set((state) => ({
      shareLinks: state.shareLinks.filter((l) => l.id !== linkId),
    }));
  },

  getShareLink: (token: string) => {
    return get().shareLinks.find((l) => l.token === token);
  },
}));

// ============================================
// Fork Utility
// ============================================

export function forkPlay(play: Play, newOwnerId: string): Play {
  return {
    ...play,
    id: uuid(),
    name: `${play.name} (Fork)`,
    history: {
      version: 1,
      derivedFrom: {
        sourcePlayId: play.id,
        sourceConceptId: play.meta?.conceptId || null,
        sourceTeamId: null,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: newOwnerId,
    updatedBy: newOwnerId,
  };
}

export function forkPlaybook(playbook: Playbook, newOwnerId: string): Playbook {
  return {
    ...playbook,
    id: uuid(),
    name: `${playbook.name} (Fork)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: newOwnerId,
    updatedBy: newOwnerId,
  };
}
