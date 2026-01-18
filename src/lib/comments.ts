// ============================================
// Play Comments Service
// ============================================

import { prisma } from "./prisma";
import { logActivity } from "./activity";
import type { CommentStatus } from "@prisma/client";

// ============================================
// Types
// ============================================

export interface CommentInput {
  playId: string;
  authorId: string;
  content: string;
  pinX?: number;
  pinY?: number;
}

export interface CommentWithAuthor {
  id: string;
  playId: string;
  content: string;
  pinX: number | null;
  pinY: number | null;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  author: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  resolver: {
    id: string;
    name: string | null;
  } | null;
}

// ============================================
// Comment Operations
// ============================================

/**
 * Create a new comment on a play
 */
export async function createComment(input: CommentInput): Promise<CommentWithAuthor> {
  const comment = await prisma.playComment.create({
    data: {
      playId: input.playId,
      authorId: input.authorId,
      content: input.content,
      pinX: input.pinX,
      pinY: input.pinY,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      resolver: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Get play info for activity logging
  const play = await prisma.play.findUnique({
    where: { id: input.playId },
    select: { workspaceId: true, name: true },
  });

  if (play) {
    await logActivity({
      workspaceId: play.workspaceId,
      actorId: input.authorId,
      action: "COMMENT_ADDED",
      targetType: "play",
      targetId: input.playId,
      targetName: play.name,
      metadata: {
        commentId: comment.id,
        hasPin: !!(input.pinX && input.pinY),
      },
    });
  }

  return comment as CommentWithAuthor;
}

/**
 * Get all comments for a play
 */
export async function getPlayComments(
  playId: string,
  options?: {
    status?: CommentStatus;
    limit?: number;
  }
): Promise<CommentWithAuthor[]> {
  const comments = await prisma.playComment.findMany({
    where: {
      playId,
      ...(options?.status && { status: options.status }),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      resolver: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit,
  });

  return comments as CommentWithAuthor[];
}

/**
 * Get a single comment by ID
 */
export async function getCommentById(commentId: string): Promise<CommentWithAuthor | null> {
  const comment = await prisma.playComment.findUnique({
    where: { id: commentId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      resolver: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return comment as CommentWithAuthor | null;
}

/**
 * Update a comment's content
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<CommentWithAuthor> {
  const comment = await prisma.playComment.update({
    where: { id: commentId },
    data: { content },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      resolver: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return comment as CommentWithAuthor;
}

/**
 * Resolve a comment
 */
export async function resolveComment(
  commentId: string,
  resolverId: string
): Promise<CommentWithAuthor> {
  const comment = await prisma.playComment.update({
    where: { id: commentId },
    data: {
      status: "RESOLVED",
      resolvedBy: resolverId,
      resolvedAt: new Date(),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      resolver: {
        select: {
          id: true,
          name: true,
        },
      },
      play: {
        select: {
          workspaceId: true,
          name: true,
        },
      },
    },
  });

  // Log activity
  if (comment.play) {
    await logActivity({
      workspaceId: comment.play.workspaceId,
      actorId: resolverId,
      action: "COMMENT_RESOLVED",
      targetType: "play",
      targetId: comment.playId,
      targetName: comment.play.name,
      metadata: {
        commentId: comment.id,
      },
    });
  }

  return comment as unknown as CommentWithAuthor;
}

/**
 * Reopen a resolved comment
 */
export async function reopenComment(commentId: string): Promise<CommentWithAuthor> {
  const comment = await prisma.playComment.update({
    where: { id: commentId },
    data: {
      status: "OPEN",
      resolvedBy: null,
      resolvedAt: null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      resolver: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return comment as CommentWithAuthor;
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  await prisma.playComment.delete({
    where: { id: commentId },
  });
}

/**
 * Get comment count for a play
 */
export async function getCommentCount(
  playId: string,
  status?: CommentStatus
): Promise<{ total: number; open: number; resolved: number }> {
  const [total, open, resolved] = await Promise.all([
    prisma.playComment.count({ where: { playId } }),
    prisma.playComment.count({ where: { playId, status: "OPEN" } }),
    prisma.playComment.count({ where: { playId, status: "RESOLVED" } }),
  ]);

  return { total, open, resolved };
}

/**
 * Check if user can edit a comment (author only)
 */
export function canEditComment(comment: CommentWithAuthor, userId: string): boolean {
  return comment.author.id === userId;
}

/**
 * Get pinned comments (comments with coordinates)
 */
export async function getPinnedComments(playId: string): Promise<CommentWithAuthor[]> {
  const comments = await prisma.playComment.findMany({
    where: {
      playId,
      pinX: { not: null },
      pinY: { not: null },
      status: "OPEN",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      resolver: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return comments as CommentWithAuthor[];
}
