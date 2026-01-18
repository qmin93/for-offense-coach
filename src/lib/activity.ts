// ============================================
// Activity Service - 워크스페이스 활동 로깅
// ============================================

import { prisma } from "./prisma";

// ============================================
// Types
// ============================================

// Define locally to avoid Prisma client export issues
export type ActivityType =
  | "PLAY_CREATED"
  | "PLAY_UPDATED"
  | "PLAY_DELETED"
  | "PLAY_DUPLICATED"
  | "PLAYBOOK_CREATED"
  | "PLAYBOOK_UPDATED"
  | "PLAYBOOK_DELETED"
  | "PLAY_ADDED_TO_PLAYBOOK"
  | "PLAY_REMOVED_FROM_PLAYBOOK"
  | "MEMBER_JOINED"
  | "MEMBER_LEFT"
  | "MEMBER_ROLE_CHANGED"
  | "MEMBER_INVITED"
  | "SHARE_LINK_CREATED"
  | "PLAY_FORKED"
  | "COMMENT_ADDED"
  | "COMMENT_RESOLVED";

export interface ActivityInput {
  workspaceId: string;
  actorId: string;
  action: ActivityType;
  targetType?: "play" | "playbook" | "member";
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityWithActor {
  id: string;
  workspaceId: string;
  actorId: string;
  action: ActivityType;
  targetType: string | null;
  targetId: string | null;
  targetName: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  actor: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

// ============================================
// Activity Logging
// ============================================

/**
 * Log an activity to the workspace feed
 */
export async function logActivity(input: ActivityInput): Promise<void> {
  await prisma.activity.create({
    data: {
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      targetName: input.targetName,
      metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : undefined,
    },
  });
}

/**
 * Get recent activities for a workspace
 */
export async function getWorkspaceActivities(
  workspaceId: string,
  options?: {
    limit?: number;
    cursor?: string;
    actionTypes?: ActivityType[];
  }
): Promise<{ activities: ActivityWithActor[]; nextCursor: string | null }> {
  const limit = options?.limit ?? 50;

  const activities = await prisma.activity.findMany({
    where: {
      workspaceId,
      ...(options?.actionTypes?.length && {
        action: { in: options.actionTypes },
      }),
      ...(options?.cursor && {
        createdAt: { lt: new Date(options.cursor) },
      }),
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = activities.length > limit;
  const items = hasMore ? activities.slice(0, limit) : activities;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  return {
    activities: items as ActivityWithActor[],
    nextCursor,
  };
}

/**
 * Get activity summary for a workspace (counts by type in last N days)
 */
export async function getActivitySummary(
  workspaceId: string,
  days: number = 7
): Promise<Record<ActivityType, number>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const activities = await prisma.activity.groupBy({
    by: ["action"],
    where: {
      workspaceId,
      createdAt: { gte: since },
    },
    _count: true,
  });

  const summary: Partial<Record<ActivityType, number>> = {};
  for (const item of activities) {
    summary[item.action] = item._count;
  }

  return summary as Record<ActivityType, number>;
}

// ============================================
// Helper Functions - Play Activities
// ============================================

export async function logPlayCreated(
  workspaceId: string,
  actorId: string,
  playId: string,
  playName: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "PLAY_CREATED",
    targetType: "play",
    targetId: playId,
    targetName: playName,
  });
}

export async function logPlayUpdated(
  workspaceId: string,
  actorId: string,
  playId: string,
  playName: string,
  changes?: string[]
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "PLAY_UPDATED",
    targetType: "play",
    targetId: playId,
    targetName: playName,
    metadata: changes ? { changes } : undefined,
  });
}

export async function logPlayDeleted(
  workspaceId: string,
  actorId: string,
  playName: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "PLAY_DELETED",
    targetType: "play",
    targetName: playName,
  });
}

export async function logPlayDuplicated(
  workspaceId: string,
  actorId: string,
  originalName: string,
  newPlayId: string,
  newName: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "PLAY_DUPLICATED",
    targetType: "play",
    targetId: newPlayId,
    targetName: newName,
    metadata: { originalName },
  });
}

// ============================================
// Helper Functions - Playbook Activities
// ============================================

export async function logPlaybookCreated(
  workspaceId: string,
  actorId: string,
  playbookId: string,
  playbookName: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "PLAYBOOK_CREATED",
    targetType: "playbook",
    targetId: playbookId,
    targetName: playbookName,
  });
}

export async function logPlaybookUpdated(
  workspaceId: string,
  actorId: string,
  playbookId: string,
  playbookName: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "PLAYBOOK_UPDATED",
    targetType: "playbook",
    targetId: playbookId,
    targetName: playbookName,
  });
}

export async function logPlaybookDeleted(
  workspaceId: string,
  actorId: string,
  playbookName: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "PLAYBOOK_DELETED",
    targetType: "playbook",
    targetName: playbookName,
  });
}

export async function logPlayAddedToPlaybook(
  workspaceId: string,
  actorId: string,
  playbookId: string,
  playbookName: string,
  playName: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "PLAY_ADDED_TO_PLAYBOOK",
    targetType: "playbook",
    targetId: playbookId,
    targetName: playbookName,
    metadata: { playName },
  });
}

// ============================================
// Helper Functions - Member Activities
// ============================================

export async function logMemberJoined(
  workspaceId: string,
  actorId: string,
  memberName: string,
  role: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "MEMBER_JOINED",
    targetType: "member",
    targetId: actorId,
    targetName: memberName,
    metadata: { role },
  });
}

export async function logMemberLeft(
  workspaceId: string,
  actorId: string,
  memberName: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "MEMBER_LEFT",
    targetType: "member",
    targetName: memberName,
  });
}

export async function logMemberRoleChanged(
  workspaceId: string,
  actorId: string,
  memberId: string,
  memberName: string,
  oldRole: string,
  newRole: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "MEMBER_ROLE_CHANGED",
    targetType: "member",
    targetId: memberId,
    targetName: memberName,
    metadata: { oldRole, newRole },
  });
}

export async function logMemberInvited(
  workspaceId: string,
  actorId: string,
  email: string,
  role: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "MEMBER_INVITED",
    targetType: "member",
    targetName: email,
    metadata: { role },
  });
}

// ============================================
// Helper Functions - Share Activities
// ============================================

export async function logShareLinkCreated(
  workspaceId: string,
  actorId: string,
  targetType: "play" | "playbook",
  targetId: string,
  targetName: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "SHARE_LINK_CREATED",
    targetType,
    targetId,
    targetName,
  });
}

export async function logPlayForked(
  workspaceId: string,
  actorId: string,
  playId: string,
  playName: string,
  sourceWorkspaceName?: string
): Promise<void> {
  await logActivity({
    workspaceId,
    actorId,
    action: "PLAY_FORKED",
    targetType: "play",
    targetId: playId,
    targetName: playName,
    metadata: sourceWorkspaceName ? { sourceWorkspaceName } : undefined,
  });
}

// ============================================
// Activity Display Helpers
// ============================================

const ACTION_MESSAGES: Record<ActivityType, string> = {
  PLAY_CREATED: "created play",
  PLAY_UPDATED: "updated play",
  PLAY_DELETED: "deleted play",
  PLAY_DUPLICATED: "duplicated play",
  PLAYBOOK_CREATED: "created playbook",
  PLAYBOOK_UPDATED: "updated playbook",
  PLAYBOOK_DELETED: "deleted playbook",
  PLAY_ADDED_TO_PLAYBOOK: "added play to playbook",
  PLAY_REMOVED_FROM_PLAYBOOK: "removed play from playbook",
  MEMBER_JOINED: "joined the workspace",
  MEMBER_LEFT: "left the workspace",
  MEMBER_ROLE_CHANGED: "changed role for",
  MEMBER_INVITED: "invited",
  SHARE_LINK_CREATED: "created share link for",
  PLAY_FORKED: "forked play",
  COMMENT_ADDED: "commented on",
  COMMENT_RESOLVED: "resolved comment on",
};

const ACTION_ICONS: Record<ActivityType, string> = {
  PLAY_CREATED: "plus",
  PLAY_UPDATED: "edit",
  PLAY_DELETED: "trash",
  PLAY_DUPLICATED: "copy",
  PLAYBOOK_CREATED: "book-plus",
  PLAYBOOK_UPDATED: "book-edit",
  PLAYBOOK_DELETED: "book-x",
  PLAY_ADDED_TO_PLAYBOOK: "list-plus",
  PLAY_REMOVED_FROM_PLAYBOOK: "list-minus",
  MEMBER_JOINED: "user-plus",
  MEMBER_LEFT: "user-minus",
  MEMBER_ROLE_CHANGED: "shield",
  MEMBER_INVITED: "mail",
  SHARE_LINK_CREATED: "share",
  PLAY_FORKED: "git-fork",
  COMMENT_ADDED: "message-square",
  COMMENT_RESOLVED: "check-circle",
};

export function getActivityMessage(action: ActivityType): string {
  return ACTION_MESSAGES[action] ?? action;
}

export function getActivityIcon(action: ActivityType): string {
  return ACTION_ICONS[action] ?? "activity";
}

export function formatActivityTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
