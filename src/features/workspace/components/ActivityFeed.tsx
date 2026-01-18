"use client";

// ============================================
// ActivityFeed - 워크스페이스 활동 피드
// ============================================

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  getActivityMessage,
  getActivityIcon,
  formatActivityTime,
  type ActivityWithActor,
} from "@/lib/activity";
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  Copy,
  BookPlus,
  BookOpen,
  BookX,
  ListPlus,
  ListMinus,
  UserPlus,
  UserMinus,
  Shield,
  Mail,
  Share2,
  GitFork,
  Loader2,
  Filter,
  RefreshCw,
} from "lucide-react";
import type { ActivityType } from "@prisma/client";

// ============================================
// Props
// ============================================

interface ActivityFeedProps {
  workspaceId: string;
  className?: string;
  compact?: boolean;
  maxItems?: number;
}

// ============================================
// Icon Mapping
// ============================================

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  plus: Plus,
  edit: Edit,
  trash: Trash2,
  copy: Copy,
  "book-plus": BookPlus,
  "book-edit": BookOpen,
  "book-x": BookX,
  "list-plus": ListPlus,
  "list-minus": ListMinus,
  "user-plus": UserPlus,
  "user-minus": UserMinus,
  shield: Shield,
  mail: Mail,
  share: Share2,
  "git-fork": GitFork,
  activity: Activity,
};

const ACTION_COLORS: Partial<Record<ActivityType, string>> = {
  PLAY_CREATED: "text-green-400",
  PLAY_UPDATED: "text-blue-400",
  PLAY_DELETED: "text-red-400",
  PLAY_DUPLICATED: "text-purple-400",
  PLAYBOOK_CREATED: "text-green-400",
  PLAYBOOK_UPDATED: "text-blue-400",
  PLAYBOOK_DELETED: "text-red-400",
  MEMBER_JOINED: "text-green-400",
  MEMBER_LEFT: "text-orange-400",
  MEMBER_ROLE_CHANGED: "text-yellow-400",
  MEMBER_INVITED: "text-cyan-400",
  SHARE_LINK_CREATED: "text-indigo-400",
  PLAY_FORKED: "text-pink-400",
};

// ============================================
// Filter Options
// ============================================

const FILTER_OPTIONS = [
  { value: "all", label: "All Activity" },
  { value: "plays", label: "Plays", types: ["PLAY_CREATED", "PLAY_UPDATED", "PLAY_DELETED", "PLAY_DUPLICATED"] },
  { value: "playbooks", label: "Playbooks", types: ["PLAYBOOK_CREATED", "PLAYBOOK_UPDATED", "PLAYBOOK_DELETED", "PLAY_ADDED_TO_PLAYBOOK", "PLAY_REMOVED_FROM_PLAYBOOK"] },
  { value: "members", label: "Members", types: ["MEMBER_JOINED", "MEMBER_LEFT", "MEMBER_ROLE_CHANGED", "MEMBER_INVITED"] },
  { value: "sharing", label: "Sharing", types: ["SHARE_LINK_CREATED", "PLAY_FORKED"] },
] as const;

// ============================================
// Component
// ============================================

export function ActivityFeed({
  workspaceId,
  className,
  compact = false,
  maxItems,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityWithActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const fetchActivities = useCallback(
    async (cursor?: string) => {
      try {
        if (cursor) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const filterOption = FILTER_OPTIONS.find((f) => f.value === filter);
        const typesParam =
          filterOption && "types" in filterOption
            ? `&types=${filterOption.types.join(",")}`
            : "";

        const limit = maxItems ?? 50;
        const cursorParam = cursor ? `&cursor=${cursor}` : "";

        const response = await fetch(
          `/api/workspaces/${workspaceId}/activities?limit=${limit}${cursorParam}${typesParam}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        const data = await response.json();

        if (cursor) {
          setActivities((prev) => [...prev, ...data.activities]);
        } else {
          setActivities(data.activities);
        }
        setNextCursor(data.nextCursor);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [workspaceId, filter, maxItems]
  );

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchActivities(nextCursor);
    }
  };

  const handleRefresh = () => {
    fetchActivities();
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-red-400 mb-2">{error}</p>
        <button
          onClick={handleRefresh}
          className="text-sm text-blue-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity
          </h3>
          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 pr-8 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Activity List */}
      {activities.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No activity yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {nextCursor && !maxItems && (
        <div className="text-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="text-sm text-blue-400 hover:underline disabled:opacity-50"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Activity Item
// ============================================

interface ActivityItemProps {
  activity: ActivityWithActor;
  compact?: boolean;
}

function ActivityItem({ activity, compact }: ActivityItemProps) {
  const iconName = getActivityIcon(activity.action);
  const IconComponent = ICON_MAP[iconName] || Activity;
  const colorClass = ACTION_COLORS[activity.action] || "text-slate-400";
  const message = getActivityMessage(activity.action);
  const timeAgo = formatActivityTime(new Date(activity.createdAt));

  const actorName = activity.actor.name || activity.actor.email.split("@")[0];

  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1.5 text-sm">
        <IconComponent className={cn("w-4 h-4 flex-shrink-0", colorClass)} />
        <span className="text-slate-300 truncate">
          <span className="font-medium text-white">{actorName}</span>{" "}
          {message}{" "}
          {activity.targetName && (
            <span className="text-slate-400">{activity.targetName}</span>
          )}
        </span>
        <span className="text-xs text-slate-500 flex-shrink-0">{timeAgo}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {activity.actor.avatarUrl ? (
          <img
            src={activity.actor.avatarUrl}
            alt={actorName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white">
            {actorName[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <IconComponent className={cn("w-4 h-4 flex-shrink-0", colorClass)} />
          <span className="text-sm text-slate-300">
            <span className="font-medium text-white">{actorName}</span>{" "}
            {message}
          </span>
        </div>
        {activity.targetName && (
          <div className="mt-1 text-sm text-slate-400 truncate">
            {activity.targetType === "play" && "📋 "}
            {activity.targetType === "playbook" && "📚 "}
            {activity.targetType === "member" && "👤 "}
            {activity.targetName}
          </div>
        )}
        {/* Metadata */}
        {activity.metadata && (
          <div className="mt-1 text-xs text-slate-500">
            {(activity.metadata as Record<string, string>).playName && (
              <span>Play: {(activity.metadata as Record<string, string>).playName}</span>
            )}
            {(activity.metadata as Record<string, string>).oldRole && (
              <span>
                {(activity.metadata as Record<string, string>).oldRole} →{" "}
                {(activity.metadata as Record<string, string>).newRole}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Time */}
      <div className="text-xs text-slate-500 flex-shrink-0">{timeAgo}</div>
    </div>
  );
}

export default ActivityFeed;
