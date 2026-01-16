import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/share/[token] - Get shared content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the share link
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Share link has expired" },
        { status: 410 }
      );
    }

    // Fetch the target content
    let content = null;

    if (shareLink.targetType === "PLAY" && shareLink.playId) {
      content = await prisma.play.findUnique({
        where: { id: shareLink.playId },
        select: {
          id: true,
          name: true,
          description: true,
          tags: true,
          dslJson: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else if (shareLink.targetType === "PLAYBOOK" && shareLink.playbookId) {
      const playbook = await prisma.playbook.findUnique({
        where: { id: shareLink.playbookId },
        include: {
          plays: {
            include: {
              play: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  dslJson: true,
                },
              },
            },
          },
        },
      });
      if (playbook) {
        content = {
          ...playbook,
          plays: playbook.plays.map((pp) => pp.play),
        };
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: "Shared content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      shareLink: {
        id: shareLink.id,
        targetType: shareLink.targetType,
        permission: shareLink.permission,
      },
      content,
    });
  } catch (error) {
    console.error("Error fetching shared content:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared content" },
      { status: 500 }
    );
  }
}

// DELETE /api/share/[token] - Revoke a share link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    await prisma.shareLink.delete({
      where: { token },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking share link:", error);
    return NextResponse.json(
      { error: "Failed to revoke share link" },
      { status: 500 }
    );
  }
}
