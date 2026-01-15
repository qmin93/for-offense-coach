import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { zodValidatePlay, loadPlaySafe, CURRENT_SCHEMA_VERSION } from "@/domain/dsl";
import type { Play as PlayDSL } from "@/domain/dsl";
import type { Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/plays/[id] - Get a single play
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const play = await prisma.play.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!play) {
      return NextResponse.json({ error: "Play not found" }, { status: 404 });
    }

    // Validate and migrate DSL if needed
    const loadResult = loadPlaySafe(play.dslJson);

    return NextResponse.json({
      ...play,
      dslJson: loadResult.play,
      _dslStatus: loadResult.status,
      _dslWarning: loadResult.warning,
    });
  } catch (error) {
    console.error("Error fetching play:", error);
    return NextResponse.json({ error: "Failed to fetch play" }, { status: 500 });
  }
}

// PATCH /api/plays/[id] - Update a play
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, tags, dslJson } = body;

    // Check if play exists
    const existingPlay = await prisma.play.findUnique({
      where: { id },
    });

    if (!existingPlay) {
      return NextResponse.json({ error: "Play not found" }, { status: 404 });
    }

    // Validate DSL if provided
    let validatedDsl: PlayDSL | undefined;
    if (dslJson) {
      const validation = zodValidatePlay(dslJson);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid play DSL", details: validation.errors.issues },
          { status: 400 }
        );
      }
      validatedDsl = {
        ...(validation.data as unknown as PlayDSL),
        updatedAt: new Date().toISOString(),
      };
    }

    // Build update data
    const updateData: Prisma.PlayUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (validatedDsl) {
      updateData.dslJson = validatedDsl as unknown as Prisma.InputJsonValue;
      updateData.schemaVersion = validatedDsl.schemaVersion || CURRENT_SCHEMA_VERSION;
      updateData.version = { increment: 1 };
    }

    const play = await prisma.play.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(play);
  } catch (error) {
    console.error("Error updating play:", error);
    return NextResponse.json({ error: "Failed to update play" }, { status: 500 });
  }
}

// DELETE /api/plays/[id] - Delete a play
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const play = await prisma.play.findUnique({
      where: { id },
    });

    if (!play) {
      return NextResponse.json({ error: "Play not found" }, { status: 404 });
    }

    await prisma.play.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error deleting play:", error);
    return NextResponse.json({ error: "Failed to delete play" }, { status: 500 });
  }
}
