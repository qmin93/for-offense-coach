import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInstallPlan, type InstallPlanSettings } from "@/domain/engine/install-plan";

// POST /api/playbooks/[playbookId]/install-plan - Generate install plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ playbookId: string }> }
) {
  try {
    const { playbookId } = await params;
    const body = await request.json();
    const settings = body.settings as Partial<InstallPlanSettings> | undefined;

    // Fetch playbook with its plays
    const playbook = await prisma.playbook.findUnique({
      where: { id: playbookId },
      include: {
        plays: {
          include: {
            play: {
              select: {
                id: true,
                name: true,
                tags: true,
                dslJson: true,
              },
            },
          },
        },
      },
    });

    if (!playbook) {
      return NextResponse.json(
        { error: "Playbook not found" },
        { status: 404 }
      );
    }

    // Extract plays from playbook
    const plays = playbook.plays.map((pp) => {
      const dslJson = pp.play.dslJson as Record<string, unknown> | null;
      const meta = dslJson?.meta as Record<string, unknown> | undefined;

      return {
        id: pp.play.id,
        name: pp.play.name,
        tags: pp.play.tags,
        conceptId: meta?.conceptId as string | undefined,
      };
    });

    // Generate install plan
    const installPlan = generateInstallPlan({
      plays,
      playbookId: playbook.id,
      playbookName: playbook.name,
      settings,
    });

    return NextResponse.json(installPlan);
  } catch (error) {
    console.error("Failed to generate install plan:", error);
    return NextResponse.json(
      { error: "Failed to generate install plan" },
      { status: 500 }
    );
  }
}

// GET /api/playbooks/[playbookId]/install-plan - Get cached install plan (placeholder)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ playbookId: string }> }
) {
  try {
    const { playbookId } = await params;

    // For now, just return an empty response indicating no cached plan
    // In the future, we could store generated plans in the database
    return NextResponse.json({
      cached: false,
      playbookId,
      message: "No cached install plan. Use POST to generate one.",
    });
  } catch (error) {
    console.error("Failed to fetch install plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch install plan" },
      { status: 500 }
    );
  }
}
