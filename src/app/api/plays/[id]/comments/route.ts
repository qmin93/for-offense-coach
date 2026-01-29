// ============================================
// Play Comments API
// ============================================

import { NextRequest, NextResponse } from "next/server";
import {
  createComment,
  getPlayComments,
  getCommentCount,
  type CommentStatus,
} from "@/lib/comments";
import { canEditPlay } from "@/lib/permissions";

// GET /api/plays/[id]/comments - Get comments for a play
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as CommentStatus | null;
    const countOnly = searchParams.get("count") === "true";
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;

    // If count only, return just the counts
    if (countOnly) {
      const counts = await getCommentCount(playId);
      return NextResponse.json(counts);
    }

    // Get comments
    const comments = await getPlayComments(playId, {
      status: status || undefined,
      limit,
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/plays/[id]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playId } = await params;

    // Get user ID from headers (in production, from auth session)
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user can comment (needs at least EDITOR role)
    const canComment = await canEditPlay(playId, userId);
    if (!canComment) {
      return NextResponse.json(
        { error: "You do not have permission to comment on this play" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, pinX, pinY } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const comment = await createComment({
      playId,
      authorId: userId,
      content: content.trim(),
      pinX,
      pinY,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
