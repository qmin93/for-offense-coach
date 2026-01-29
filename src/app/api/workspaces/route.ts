import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserWorkspaces } from "@/lib/permissions";

// GET /api/workspaces - List user's workspaces
export async function GET(request: NextRequest) {
  try {
    // In production, get userId from auth session
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspaces = await getUserWorkspaces(userId);

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - Create a new workspace
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, type = "TEAM" } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Workspace name is required" },
        { status: 400 }
      );
    }

    // Create workspace and add creator as owner
    const workspace = await prisma.workspace.create({
      data: {
        name,
        type,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return NextResponse.json({
      id: workspace.id,
      name: workspace.name,
      type: workspace.type,
      memberCount: workspace._count.members,
      role: "OWNER",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
