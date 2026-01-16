import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/share - Create a share link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetType, targetId, permission = "view_only" } = body;

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "Missing required fields: targetType, targetId" },
        { status: 400 }
      );
    }

    if (!["play", "playbook"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid targetType. Must be 'play' or 'playbook'" },
        { status: 400 }
      );
    }

    // Generate a unique token
    const token = crypto.randomUUID();

    // Create share link in database
    const shareLink = await prisma.shareLink.create({
      data: {
        token,
        targetType,
        targetId,
        permission,
      },
    });

    return NextResponse.json({
      id: shareLink.id,
      token: shareLink.token,
      url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/s/${shareLink.token}`,
      permission: shareLink.permission,
      createdAt: shareLink.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}
