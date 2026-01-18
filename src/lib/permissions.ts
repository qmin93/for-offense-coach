// ============================================
// Workspace Permissions Service
// Role-based access control for team workspaces
// ============================================

import prisma from "@/lib/prisma";

// ============================================
// Types
// ============================================

export type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER";

export interface WorkspacePermissions {
  // Play permissions
  canViewPlays: boolean;
  canCreatePlays: boolean;
  canEditPlays: boolean;
  canDeletePlays: boolean;

  // Playbook permissions
  canViewPlaybooks: boolean;
  canCreatePlaybooks: boolean;
  canEditPlaybooks: boolean;
  canDeletePlaybooks: boolean;

  // Share permissions
  canSharePlays: boolean;
  canSharePlaybooks: boolean;

  // Workspace management
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canChangeRoles: boolean;
  canEditWorkspace: boolean;
  canDeleteWorkspace: boolean;

  // Export
  canExportPdf: boolean;
}

export interface MemberInfo {
  userId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: WorkspaceRole;
  joinedAt: Date;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  type: "PERSONAL" | "TEAM";
  memberCount: number;
  role: WorkspaceRole;
  permissions: WorkspacePermissions;
}

// ============================================
// Permission Matrix
// ============================================

const ROLE_PERMISSIONS: Record<WorkspaceRole, WorkspacePermissions> = {
  OWNER: {
    canViewPlays: true,
    canCreatePlays: true,
    canEditPlays: true,
    canDeletePlays: true,
    canViewPlaybooks: true,
    canCreatePlaybooks: true,
    canEditPlaybooks: true,
    canDeletePlaybooks: true,
    canSharePlays: true,
    canSharePlaybooks: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canEditWorkspace: true,
    canDeleteWorkspace: true,
    canExportPdf: true,
  },
  EDITOR: {
    canViewPlays: true,
    canCreatePlays: true,
    canEditPlays: true,
    canDeletePlays: false, // Can only delete own plays
    canViewPlaybooks: true,
    canCreatePlaybooks: true,
    canEditPlaybooks: true,
    canDeletePlaybooks: false, // Can only delete own playbooks
    canSharePlays: true,
    canSharePlaybooks: true,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canEditWorkspace: false,
    canDeleteWorkspace: false,
    canExportPdf: true,
  },
  VIEWER: {
    canViewPlays: true,
    canCreatePlays: false,
    canEditPlays: false,
    canDeletePlays: false,
    canViewPlaybooks: true,
    canCreatePlaybooks: false,
    canEditPlaybooks: false,
    canDeletePlaybooks: false,
    canSharePlays: false,
    canSharePlaybooks: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canEditWorkspace: false,
    canDeleteWorkspace: false,
    canExportPdf: true, // Viewers can export for reference
  },
};

// ============================================
// Core Permission Functions
// ============================================

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: WorkspaceRole): WorkspacePermissions {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a user has a specific permission in a workspace
 */
export async function checkPermission(
  userId: string,
  workspaceId: string,
  permission: keyof WorkspacePermissions
): Promise<boolean> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) return false;

  const permissions = getPermissionsForRole(member.role as WorkspaceRole);
  return permissions[permission];
}

/**
 * Get user's role in a workspace
 */
export async function getUserRole(
  userId: string,
  workspaceId: string
): Promise<WorkspaceRole | null> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  return member ? (member.role as WorkspaceRole) : null;
}

/**
 * Get user's permissions in a workspace
 */
export async function getUserPermissions(
  userId: string,
  workspaceId: string
): Promise<WorkspacePermissions | null> {
  const role = await getUserRole(userId, workspaceId);
  return role ? getPermissionsForRole(role) : null;
}

/**
 * Check if user is member of workspace
 */
export async function isMember(userId: string, workspaceId: string): Promise<boolean> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
  return !!member;
}

/**
 * Check if user is owner of workspace
 */
export async function isOwner(userId: string, workspaceId: string): Promise<boolean> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
  return member?.role === "OWNER";
}

// ============================================
// Workspace Management Functions
// ============================================

/**
 * Get workspace info with user's role and permissions
 */
export async function getWorkspaceInfo(
  userId: string,
  workspaceId: string
): Promise<WorkspaceInfo | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      _count: {
        select: { members: true },
      },
      members: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!workspace || workspace.members.length === 0) {
    return null;
  }

  const role = workspace.members[0].role as WorkspaceRole;

  return {
    id: workspace.id,
    name: workspace.name,
    type: workspace.type as "PERSONAL" | "TEAM",
    memberCount: workspace._count.members,
    role,
    permissions: getPermissionsForRole(role),
  };
}

/**
 * Get all members of a workspace
 */
export async function getWorkspaceMembers(workspaceId: string): Promise<MemberInfo[]> {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: [
      { role: "asc" }, // OWNER first
      { createdAt: "asc" },
    ],
  });

  return members.map((m) => ({
    userId: m.user.id,
    email: m.user.email,
    name: m.user.name,
    avatarUrl: m.user.avatarUrl,
    role: m.role as WorkspaceRole,
    joinedAt: m.createdAt,
  }));
}

/**
 * Get workspaces for a user
 */
export async function getUserWorkspaces(userId: string): Promise<WorkspaceInfo[]> {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          _count: {
            select: { members: true },
          },
        },
      },
    },
    orderBy: {
      workspace: {
        name: "asc",
      },
    },
  });

  return memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    type: m.workspace.type as "PERSONAL" | "TEAM",
    memberCount: m.workspace._count.members,
    role: m.role as WorkspaceRole,
    permissions: getPermissionsForRole(m.role as WorkspaceRole),
  }));
}

// ============================================
// Member Management Functions
// ============================================

/**
 * Add member to workspace
 */
export async function addMember(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole = "EDITOR"
): Promise<void> {
  await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId,
      role,
    },
  });
}

/**
 * Remove member from workspace
 */
export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  // Check if user is owner
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (member?.role === "OWNER") {
    // Count owners
    const ownerCount = await prisma.workspaceMember.count({
      where: {
        workspaceId,
        role: "OWNER",
      },
    });

    if (ownerCount <= 1) {
      throw new Error("Cannot remove the only owner of a workspace");
    }
  }

  await prisma.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
}

/**
 * Change member role
 */
export async function changeMemberRole(
  workspaceId: string,
  userId: string,
  newRole: WorkspaceRole
): Promise<void> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  // If changing from owner, ensure there's at least one owner left
  if (member.role === "OWNER" && newRole !== "OWNER") {
    const ownerCount = await prisma.workspaceMember.count({
      where: {
        workspaceId,
        role: "OWNER",
      },
    });

    if (ownerCount <= 1) {
      throw new Error("Cannot demote the only owner of a workspace");
    }
  }

  await prisma.workspaceMember.update({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    data: { role: newRole },
  });
}

// ============================================
// Resource-level Permission Checks
// ============================================

/**
 * Check if user can edit a specific play
 * (EDITOR can edit any play, but delete only their own)
 */
export async function canEditPlay(
  userId: string,
  playId: string
): Promise<{ canEdit: boolean; canDelete: boolean }> {
  const play = await prisma.play.findUnique({
    where: { id: playId },
    select: {
      workspaceId: true,
      createdBy: true,
    },
  });

  if (!play) {
    return { canEdit: false, canDelete: false };
  }

  const permissions = await getUserPermissions(userId, play.workspaceId);

  if (!permissions) {
    return { canEdit: false, canDelete: false };
  }

  const isCreator = play.createdBy === userId;

  return {
    canEdit: permissions.canEditPlays,
    canDelete: permissions.canDeletePlays || (permissions.canEditPlays && isCreator),
  };
}

/**
 * Check if user can edit a specific playbook
 */
export async function canEditPlaybook(
  userId: string,
  playbookId: string
): Promise<{ canEdit: boolean; canDelete: boolean }> {
  const playbook = await prisma.playbook.findUnique({
    where: { id: playbookId },
    select: {
      workspaceId: true,
      createdBy: true,
    },
  });

  if (!playbook) {
    return { canEdit: false, canDelete: false };
  }

  const permissions = await getUserPermissions(userId, playbook.workspaceId);

  if (!permissions) {
    return { canEdit: false, canDelete: false };
  }

  const isCreator = playbook.createdBy === userId;

  return {
    canEdit: permissions.canEditPlaybooks,
    canDelete: permissions.canDeletePlaybooks || (permissions.canEditPlaybooks && isCreator),
  };
}

// ============================================
// Export
// ============================================

export default {
  getPermissionsForRole,
  checkPermission,
  getUserRole,
  getUserPermissions,
  isMember,
  isOwner,
  getWorkspaceInfo,
  getWorkspaceMembers,
  getUserWorkspaces,
  addMember,
  removeMember,
  changeMemberRole,
  canEditPlay,
  canEditPlaybook,
};
