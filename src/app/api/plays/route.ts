import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { zodValidatePlay, CURRENT_SCHEMA_VERSION } from "@/domain/dsl";
import type { Play as PlayDSL } from "@/domain/dsl";
import type { Prisma } from "@prisma/client";

// POST /api/plays - Create a new play
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, workspaceId, dslJson, userId } = body;

    // Validate required fields
    if (!name || !workspaceId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: name, workspaceId, userId" },
        { status: 400 }
      );
    }

    // Validate DSL if provided
    let validatedDsl: PlayDSL | null = null;
    if (dslJson) {
      const validation = zodValidatePlay(dslJson);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid play DSL", details: validation.errors.issues },
          { status: 400 }
        );
      }
      validatedDsl = validation.data as unknown as PlayDSL;
    }

    // Create play in database
    const dslData = validatedDsl || createDefaultDsl(name);
    const play = await prisma.play.create({
      data: {
        name,
        workspaceId,
        schemaVersion: dslData.schemaVersion || CURRENT_SCHEMA_VERSION,
        dslJson: dslData as unknown as Prisma.InputJsonValue,
        createdBy: userId,
      },
    });

    return NextResponse.json(play, { status: 201 });
  } catch (error) {
    console.error("Error creating play:", error);
    return NextResponse.json({ error: "Failed to create play" }, { status: 500 });
  }
}

// GET /api/plays - List plays (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where = workspaceId ? { workspaceId } : {};

    const [plays, total] = await Promise.all([
      prisma.play.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          tags: true,
          schemaVersion: true,
          version: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.play.count({ where }),
    ]);

    return NextResponse.json({ plays, total, limit, offset });
  } catch (error) {
    console.error("Error listing plays:", error);
    return NextResponse.json({ error: "Failed to list plays" }, { status: 500 });
  }
}

// Helper: Create default DSL for a new play
function createDefaultDsl(name: string): PlayDSL {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    type: "play",
    id: crypto.randomUUID(),
    name,
    description: "",
    tags: [],
    meta: {
      personnel: "11",
      unit: "offense",
      strength: "right",
    },
    field: {
      orientation: "up",
      showGrid: true,
      showHash: true,
    },
    roster: {
      players: [],
      groups: [],
    },
    actions: [],
    notes: {
      callName: name,
      coachingPoints: [],
    },
    history: {
      version: 1,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
