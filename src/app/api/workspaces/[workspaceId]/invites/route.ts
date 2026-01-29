import { NextRequest, NextResponse } from "next/server";
import { checkPermission } from "@/lib/permissions";
import {
  createInvite,
  getWorkspacePendingInvites,
  revokeInvite,
  resendInvite,
  getInviteUrl,
} from "@/lib/workspace-invites";

// GET /api/workspaces/[workspaceId]/invites - List pending invites
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

    // Only owners can view invites
    const canInvite = await checkPermission(userId, workspaceId, "canInviteMembers");
    if (!canInvite) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const invites = await getWorkspacePendingInvites(workspaceId);

    return NextResponse.json({
      invites: invites.map((invite) => ({
        ...invite,
        inviteUrl: getInviteUrl(invite.id), // In real app, use token instead
      })),
    });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/[workspaceId]/invites - Create invite
export async function POST(
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
    const canInvite = await checkPermission(userId, workspaceId, "canInviteMembers");
    if (!canInvite) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = "EDITOR" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!["OWNER", "EDITOR", "VIEWER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const invite = await createInvite({
      workspaceId,
      email,
      role,
      invitedBy: userId,
    });

    // In production, send email here
    // await sendInviteEmail(invite.email, getInviteUrl(invite.token));

    return NextResponse.json({
      invite: {
        ...invite,
        inviteUrl: getInviteUrl(invite.id), // In real app, include token-based URL
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating invite:", error);
    const message = error instanceof Error ? error.message : "Failed to create invite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/workspaces/[workspaceId]/invites - Resend invite
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

    const canInvite = await checkPermission(userId, workspaceId, "canInviteMembers");
    if (!canInvite) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { inviteId } = body;

    if (!inviteId) {
      return NextResponse.json(
        { error: "inviteId is required" },
        { status: 400 }
      );
    }

    const invite = await resendInvite(inviteId);

    if (!invite) {
      return NextResponse.json(
        { error: "Invite not found or cannot be resent" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      invite: {
        ...invite,
        inviteUrl: getInviteUrl(invite.id),
      },
    });
  } catch (error) {
    console.error("Error resending invite:", error);
    return NextResponse.json(
      { error: "Failed to resend invite" },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[workspaceId]/invites - Revoke invite
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

    const canInvite = await checkPermission(userId, workspaceId, "canInviteMembers");
    if (!canInvite) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get("inviteId");

    if (!inviteId) {
      return NextResponse.json(
        { error: "inviteId is required" },
        { status: 400 }
      );
    }

    const success = await revokeInvite(inviteId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to revoke invite" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking invite:", error);
    return NextResponse.json(
      { error: "Failed to revoke invite" },
      { status: 500 }
    );
  }
}
