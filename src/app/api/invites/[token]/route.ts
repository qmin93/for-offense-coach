import { NextRequest, NextResponse } from "next/server";
import { getInviteByToken, acceptInvite } from "@/lib/workspace-invites";

// GET /api/invites/[token] - Get invite info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invite = await getInviteByToken(token);

    if (!invite) {
      return NextResponse.json(
        { error: "Invite not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (invite.status === "PENDING" && invite.expiresAt < new Date()) {
      return NextResponse.json(
        {
          error: "Invite has expired",
          invite: { ...invite, status: "EXPIRED" as const },
        },
        { status: 410 }
      );
    }

    // Return limited info (no sensitive data)
    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        workspaceName: invite.workspaceName,
        invitedByName: invite.invitedByName,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error fetching invite:", error);
    return NextResponse.json(
      { error: "Failed to fetch invite" },
      { status: 500 }
    );
  }
}

// POST /api/invites/[token] - Accept invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in to accept invite" },
        { status: 401 }
      );
    }

    const result = await acceptInvite(token, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      workspaceId: result.workspaceId,
      message: "Successfully joined workspace",
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    );
  }
}
