import { NextRequest, NextResponse } from "next/server";
import {
  checkPermission,
  getWorkspaceMembers,
  removeMember,
  changeMemberRole,
  type WorkspaceRole,
} from "@/lib/permissions";

// GET /api/workspaces/[workspaceId]/members - List members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user can view (any member can view members)
    const canView = await checkPermission(userId, workspaceId, "canViewPlays");
    if (!canView) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const members = await getWorkspaceMembers(workspaceId);

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// PATCH /api/workspaces/[workspaceId]/members - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const canChangeRoles = await checkPermission(userId, workspaceId, "canChangeRoles");
    if (!canChangeRoles) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { memberId, role } = body;

    if (!memberId || !role) {
      return NextResponse.json(
        { error: "memberId and role are required" },
        { status: 400 }
      );
    }

    if (!["OWNER", "EDITOR", "VIEWER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    await changeMemberRole(workspaceId, memberId, role as WorkspaceRole);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating member role:", error);
    const message = error instanceof Error ? error.message : "Failed to update role";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/workspaces/[workspaceId]/members - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { error: "memberId is required" },
        { status: 400 }
      );
    }

    // Users can always remove themselves, owners can remove others
    const isSelf = memberId === userId;
    const canRemove = await checkPermission(userId, workspaceId, "canRemoveMembers");

    if (!isSelf && !canRemove) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await removeMember(workspaceId, memberId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    const message = error instanceof Error ? error.message : "Failed to remove member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
