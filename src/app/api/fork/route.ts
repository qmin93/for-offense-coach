import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// POST /api/fork - Fork a play or playbook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetType, targetId, userId, workspaceId } = body;

    if (!targetType || !targetId || !userId || !workspaceId) {
      return NextResponse.json(
        { error: "Missing required fields: targetType, targetId, userId, workspaceId" },
        { status: 400 }
      );
    }

    if (targetType === "play") {
      // Fork a play
      const sourcePlay = await prisma.play.findUnique({
        where: { id: targetId },
      });

      if (!sourcePlay) {
        return NextResponse.json(
          { error: "Source play not found" },
          { status: 404 }
        );
      }

      // Modify the DSL to update history
      const sourceDsl = sourcePlay.dslJson as Record<string, unknown>;
      const forkedDsl = {
        ...sourceDsl,
        id: crypto.randomUUID(),
        name: `${sourcePlay.name} (Fork)`,
        history: {
          version: 1,
          derivedFrom: {
            sourcePlayId: sourcePlay.id,
            sourceConceptId: (sourceDsl.meta as Record<string, unknown>)?.conceptId || null,
            sourceTeamId: null,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create the forked play
      const forkedPlay = await prisma.play.create({
        data: {
          name: `${sourcePlay.name} (Fork)`,
          description: sourcePlay.description,
          tags: sourcePlay.tags,
          schemaVersion: sourcePlay.schemaVersion,
          dslJson: forkedDsl as unknown as Prisma.InputJsonValue,
          workspaceId,
          createdBy: userId,
        },
      });

      return NextResponse.json({
        success: true,
        fork: {
          id: forkedPlay.id,
          name: forkedPlay.name,
          sourceId: sourcePlay.id,
          sourceName: sourcePlay.name,
        },
      }, { status: 201 });

    } else if (targetType === "playbook") {
      // Fork a playbook with all its plays
      const sourcePlaybook = await prisma.playbook.findUnique({
        where: { id: targetId },
        include: {
          plays: {
            include: {
              play: true,
            },
          },
        },
      });

      if (!sourcePlaybook) {
        return NextResponse.json(
          { error: "Source playbook not found" },
          { status: 404 }
        );
      }

      // Create forked playbook
      const forkedPlaybook = await prisma.playbook.create({
        data: {
          name: `${sourcePlaybook.name} (Fork)`,
          description: sourcePlaybook.description,
          sections: sourcePlaybook.sections || [],
          workspaceId,
          createdBy: userId,
        },
      });

      // Fork all plays in the playbook
      for (const playbookPlay of sourcePlaybook.plays) {
        const play = playbookPlay.play;
        const sourceDsl = play.dslJson as Record<string, unknown>;
        const forkedDsl = {
          ...sourceDsl,
          id: crypto.randomUUID(),
          name: play.name,
          history: {
            version: 1,
            derivedFrom: {
              sourcePlayId: play.id,
              sourceConceptId: (sourceDsl.meta as Record<string, unknown>)?.conceptId || null,
              sourceTeamId: null,
            },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Create the forked play
        const forkedPlay = await prisma.play.create({
          data: {
            name: play.name,
            description: play.description,
            tags: play.tags,
            schemaVersion: play.schemaVersion,
            dslJson: forkedDsl as unknown as Prisma.InputJsonValue,
            workspaceId,
            createdBy: userId,
          },
        });

        // Link to the forked playbook
        await prisma.playbookPlay.create({
          data: {
            playbookId: forkedPlaybook.id,
            playId: forkedPlay.id,
            sectionId: playbookPlay.sectionId,
            order: playbookPlay.order,
          },
        });
      }

      return NextResponse.json({
        success: true,
        fork: {
          id: forkedPlaybook.id,
          name: forkedPlaybook.name,
          sourceId: sourcePlaybook.id,
          sourceName: sourcePlaybook.name,
          playCount: sourcePlaybook.plays.length,
        },
      }, { status: 201 });
    }

    return NextResponse.json(
      { error: "Invalid targetType" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error forking:", error);
    return NextResponse.json(
      { error: "Failed to fork" },
      { status: 500 }
    );
  }
}
