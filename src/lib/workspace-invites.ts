// ============================================
// Workspace Invite Service
// Handle team member invitations
// ============================================

import prisma from "@/lib/prisma";
import { addMember, type WorkspaceRole } from "./permissions";

// ============================================
// Types
// ============================================

export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export interface InviteInfo {
  id: string;
  email: string;
  role: WorkspaceRole;
  status: InviteStatus;
  invitedBy: string;
  invitedByName?: string;
  workspaceName: string;
  workspaceId: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateInviteParams {
  workspaceId: string;
  email: string;
  role?: WorkspaceRole;
  invitedBy: string;
  expiresInDays?: number;
}

// ============================================
// Constants
// ============================================

const DEFAULT_INVITE_EXPIRY_DAYS = 7;

// ============================================
// Invite Functions
// ============================================

/**
 * Create a new workspace invite
 */
export async function createInvite({
  workspaceId,
  email,
  role = "EDITOR",
  invitedBy,
  expiresInDays = DEFAULT_INVITE_EXPIRY_DAYS,
}: CreateInviteParams): Promise<InviteInfo> {
  // Check if user is already a member
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: existingUser.id,
        },
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this workspace");
    }
  }

  // Check for existing pending invite
  const existingInvite = await prisma.workspaceInvite.findUnique({
    where: {
      workspaceId_email: {
        workspaceId,
        email,
      },
    },
  });

  if (existingInvite && existingInvite.status === "PENDING") {
    // Check if expired
    if (existingInvite.expiresAt > new Date()) {
      throw new Error("An active invite already exists for this email");
    }
    // Update expired invite
    await prisma.workspaceInvite.delete({
      where: { id: existingInvite.id },
    });
  }

  // Create new invite
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const invite = await prisma.workspaceInvite.create({
    data: {
      workspaceId,
      email: email.toLowerCase(),
      role,
      invitedBy,
      expiresAt,
    },
    include: {
      workspace: {
        select: { name: true },
      },
    },
  });

  return {
    id: invite.id,
    email: invite.email,
    role: invite.role as WorkspaceRole,
    status: invite.status as InviteStatus,
    invitedBy: invite.invitedBy,
    workspaceName: invite.workspace.name,
    workspaceId: invite.workspaceId,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
  };
}

/**
 * Get invite by token
 */
export async function getInviteByToken(token: string): Promise<InviteInfo | null> {
  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    include: {
      workspace: {
        select: { name: true },
      },
    },
  });

  if (!invite) return null;

  // Get inviter name
  const inviter = await prisma.user.findUnique({
    where: { id: invite.invitedBy },
    select: { name: true },
  });

  return {
    id: invite.id,
    email: invite.email,
    role: invite.role as WorkspaceRole,
    status: invite.status as InviteStatus,
    invitedBy: invite.invitedBy,
    invitedByName: inviter?.name || undefined,
    workspaceName: invite.workspace.name,
    workspaceId: invite.workspaceId,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
  };
}

/**
 * Accept an invite
 */
export async function acceptInvite(
  token: string,
  userId: string
): Promise<{ success: boolean; workspaceId?: string; error?: string }> {
  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    return { success: false, error: "Invite not found" };
  }

  if (invite.status !== "PENDING") {
    return { success: false, error: `Invite has already been ${invite.status.toLowerCase()}` };
  }

  if (invite.expiresAt < new Date()) {
    // Mark as expired
    await prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
    return { success: false, error: "Invite has expired" };
  }

  // Verify email matches (optional - for extra security)
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return {
      success: false,
      error: "This invite was sent to a different email address",
    };
  }

  // Add user to workspace
  try {
    await addMember(invite.workspaceId, userId, invite.role as WorkspaceRole);

    // Mark invite as accepted
    await prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    return { success: true, workspaceId: invite.workspaceId };
  } catch (error) {
    console.error("Error accepting invite:", error);
    return { success: false, error: "Failed to join workspace" };
  }
}

/**
 * Revoke an invite
 */
export async function revokeInvite(inviteId: string): Promise<boolean> {
  try {
    await prisma.workspaceInvite.update({
      where: { id: inviteId },
      data: { status: "REVOKED" },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get pending invites for a workspace
 */
export async function getWorkspacePendingInvites(workspaceId: string): Promise<InviteInfo[]> {
  const invites = await prisma.workspaceInvite.findMany({
    where: {
      workspaceId,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    include: {
      workspace: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get inviter names
  const inviterIds = [...new Set(invites.map((i) => i.invitedBy))];
  const inviters = await prisma.user.findMany({
    where: { id: { in: inviterIds } },
    select: { id: true, name: true },
  });
  const inviterMap = new Map(inviters.map((u) => [u.id, u.name]));

  return invites.map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.role as WorkspaceRole,
    status: invite.status as InviteStatus,
    invitedBy: invite.invitedBy,
    invitedByName: inviterMap.get(invite.invitedBy) || undefined,
    workspaceName: invite.workspace.name,
    workspaceId: invite.workspaceId,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
  }));
}

/**
 * Get pending invites for a user (by email)
 */
export async function getUserPendingInvites(email: string): Promise<InviteInfo[]> {
  const invites = await prisma.workspaceInvite.findMany({
    where: {
      email: email.toLowerCase(),
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    include: {
      workspace: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get inviter names
  const inviterIds = [...new Set(invites.map((i) => i.invitedBy))];
  const inviters = await prisma.user.findMany({
    where: { id: { in: inviterIds } },
    select: { id: true, name: true },
  });
  const inviterMap = new Map(inviters.map((u) => [u.id, u.name]));

  return invites.map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.role as WorkspaceRole,
    status: invite.status as InviteStatus,
    invitedBy: invite.invitedBy,
    invitedByName: inviterMap.get(invite.invitedBy) || undefined,
    workspaceName: invite.workspace.name,
    workspaceId: invite.workspaceId,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
  }));
}

/**
 * Resend an invite (create new token, reset expiry)
 */
export async function resendInvite(inviteId: string): Promise<InviteInfo | null> {
  const invite = await prisma.workspaceInvite.findUnique({
    where: { id: inviteId },
    include: {
      workspace: {
        select: { name: true },
      },
    },
  });

  if (!invite || invite.status !== "PENDING") {
    return null;
  }

  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + DEFAULT_INVITE_EXPIRY_DAYS);

  // Generate new token by deleting and recreating
  await prisma.workspaceInvite.delete({
    where: { id: inviteId },
  });

  const newInvite = await prisma.workspaceInvite.create({
    data: {
      workspaceId: invite.workspaceId,
      email: invite.email,
      role: invite.role,
      invitedBy: invite.invitedBy,
      expiresAt: newExpiresAt,
    },
    include: {
      workspace: {
        select: { name: true },
      },
    },
  });

  return {
    id: newInvite.id,
    email: newInvite.email,
    role: newInvite.role as WorkspaceRole,
    status: newInvite.status as InviteStatus,
    invitedBy: newInvite.invitedBy,
    workspaceName: newInvite.workspace.name,
    workspaceId: newInvite.workspaceId,
    createdAt: newInvite.createdAt,
    expiresAt: newInvite.expiresAt,
  };
}

/**
 * Generate invite URL
 */
export function getInviteUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return `${baseUrl}/invite/${token}`;
}

// ============================================
// Export
// ============================================

export default {
  createInvite,
  getInviteByToken,
  acceptInvite,
  revokeInvite,
  getWorkspacePendingInvites,
  getUserPendingInvites,
  resendInvite,
  getInviteUrl,
};
