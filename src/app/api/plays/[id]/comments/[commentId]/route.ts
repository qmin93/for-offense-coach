// ============================================
// Individual Comment API
// ============================================

import { NextRequest, NextResponse } from "next/server";
import {
  getCommentById,
  updateComment,
  resolveComment,
  reopenComment,
  deleteComment,
  canEditComment,
} from "@/lib/comments";
import { canEditPlay } from "@/lib/permissions";

// GET /api/plays/[id]/comments/[commentId] - Get single comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;

    const comment = await getCommentById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json(
      { error: "Failed to fetch comment" },
      { status: 500 }
    );
  }
}

// PATCH /api/plays/[id]/comments/[commentId] - Update or resolve comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: playId, commentId } = await params;

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const comment = await getCommentById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action, content } = body;

    // Handle resolve/reopen actions
    if (action === "resolve") {
      // Any editor can resolve
      const canResolve = await canEditPlay(playId, userId);
      if (!canResolve) {
        return NextResponse.json(
          { error: "You do not have permission to resolve this comment" },
          { status: 403 }
        );
      }

      const resolved = await resolveComment(commentId, userId);
      return NextResponse.json(resolved);
    }

    if (action === "reopen") {
      const canReopen = await canEditPlay(playId, userId);
      if (!canReopen) {
        return NextResponse.json(
          { error: "You do not have permission to reopen this comment" },
          { status: 403 }
        );
      }

      const reopened = await reopenComment(commentId);
      return NextResponse.json(reopened);
    }

    // Handle content update (author only)
    if (content !== undefined) {
      if (!canEditComment(comment, userId)) {
        return NextResponse.json(
          { error: "Only the author can edit this comment" },
          { status: 403 }
        );
      }

      const updated = await updateComment(commentId, content);
      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// DELETE /api/plays/[id]/comments/[commentId] - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const comment = await getCommentById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Only author can delete
    if (!canEditComment(comment, userId)) {
      return NextResponse.json(
        { error: "Only the author can delete this comment" },
        { status: 403 }
      );
    }

    await deleteComment(commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
