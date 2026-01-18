// ============================================
// Workspace Activities API
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceActivities, getActivitySummary } from "@/lib/activity";
import { getUserRole } from "@/lib/permissions";
import type { ActivityType } from "@prisma/client";

// GET /api/workspaces/[workspaceId]/activities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    // TODO: Get from auth session
    const userId = request.headers.get("x-user-id") || "demo-user";

    // Check if user is a member
    const role = await getUserRole(workspaceId, userId);
    if (!role) {
      return NextResponse.json(
        { error: "Not a member of this workspace" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const summary = searchParams.get("summary") === "true";
    const actionTypesParam = searchParams.get("types");
    const actionTypes = actionTypesParam
      ? (actionTypesParam.split(",") as ActivityType[])
      : undefined;

    // Return summary if requested
    if (summary) {
      const days = parseInt(searchParams.get("days") ?? "7", 10);
      const activitySummary = await getActivitySummary(workspaceId, days);
      return NextResponse.json({ summary: activitySummary });
    }

    // Get activities
    const result = await getWorkspaceActivities(workspaceId, {
      limit,
      cursor,
      actionTypes,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
