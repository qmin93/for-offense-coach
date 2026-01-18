"use client";

// ============================================
// CommentsPanel - Play comments and markup
// ============================================

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { CommentWithAuthor } from "@/lib/comments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Plus,
  Check,
  RotateCcw,
  Trash2,
  MapPin,
  Loader2,
  ChevronDown,
  X,
} from "lucide-react";

// ============================================
// Props
// ============================================

interface CommentsPanelProps {
  playId: string;
  className?: string;
  onPinComment?: (comment: CommentWithAuthor) => void;
  onSelectPinLocation?: () => void;
  selectedPin?: { x: number; y: number } | null;
  onClearPin?: () => void;
}

// ============================================
// Component
// ============================================

export function CommentsPanel({
  playId,
  className,
  onPinComment,
  onSelectPinLocation,
  selectedPin,
  onClearPin,
}: CommentsPanelProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [counts, setCounts] = useState({ total: 0, open: 0, resolved: 0 });

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const status = showResolved ? undefined : "OPEN";
      const response = await fetch(
        `/api/plays/${playId}/comments${status ? `?status=${status}` : ""}`
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }

      // Fetch counts
      const countResponse = await fetch(`/api/plays/${playId}/comments?count=true`);
      if (countResponse.ok) {
        const countData = await countResponse.json();
        setCounts(countData);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  }, [playId, showResolved]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Submit new comment
  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/plays/${playId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          pinX: selectedPin?.x,
          pinY: selectedPin?.y,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments((prev) => [comment, ...prev]);
        setNewComment("");
        onClearPin?.();
        setCounts((prev) => ({
          ...prev,
          total: prev.total + 1,
          open: prev.open + 1,
        }));
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolve/reopen comment
  const handleToggleResolve = async (comment: CommentWithAuthor) => {
    const action = comment.status === "OPEN" ? "resolve" : "reopen";
    try {
      const response = await fetch(
        `/api/plays/${playId}/comments/${comment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setComments((prev) =>
          prev.map((c) => (c.id === comment.id ? updated : c))
        );
        setCounts((prev) => ({
          ...prev,
          open: action === "resolve" ? prev.open - 1 : prev.open + 1,
          resolved: action === "resolve" ? prev.resolved + 1 : prev.resolved - 1,
        }));
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  // Delete comment
  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const response = await fetch(
        `/api/plays/${playId}/comments/${commentId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        const comment = comments.find((c) => c.id === commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCounts((prev) => ({
          ...prev,
          total: prev.total - 1,
          open: comment?.status === "OPEN" ? prev.open - 1 : prev.open,
          resolved: comment?.status === "RESOLVED" ? prev.resolved - 1 : prev.resolved,
        }));
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span className="font-medium text-sm">Comments</span>
          {counts.open > 0 && (
            <Badge variant="secondary" className="text-xs">
              {counts.open}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setShowResolved(!showResolved)}
        >
          {showResolved ? "Hide Resolved" : `Show Resolved (${counts.resolved})`}
          <ChevronDown
            className={cn("w-3 h-3 ml-1 transition-transform", showResolved && "rotate-180")}
          />
        </Button>
      </div>

      {/* New Comment */}
      <div className="p-3 border-b space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-16 text-sm resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedPin ? (
              <Badge variant="secondary" className="text-xs gap-1">
                <MapPin className="w-3 h-3" />
                Pin set
                <button
                  onClick={onClearPin}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={onSelectPinLocation}
              >
                <MapPin className="w-3 h-3" />
                Add Pin
              </Button>
            )}
          </div>
          <Button
            size="sm"
            className="h-7"
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet</p>
            <p className="text-xs">Add coaching notes or feedback</p>
          </div>
        ) : (
          <div className="divide-y">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onToggleResolve={() => handleToggleResolve(comment)}
                onDelete={() => handleDelete(comment.id)}
                onPinClick={() => onPinComment?.(comment)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Comment Item
// ============================================

interface CommentItemProps {
  comment: CommentWithAuthor;
  onToggleResolve: () => void;
  onDelete: () => void;
  onPinClick?: () => void;
}

function CommentItem({
  comment,
  onToggleResolve,
  onDelete,
  onPinClick,
}: CommentItemProps) {
  const isResolved = comment.status === "RESOLVED";
  const authorName = comment.author.name || comment.author.email.split("@")[0];
  const hasPin = comment.pinX !== null && comment.pinY !== null;

  return (
    <div
      className={cn(
        "p-3 space-y-2 group",
        isResolved && "bg-muted/30 opacity-75"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          {comment.author.avatarUrl ? (
            <img
              src={comment.author.avatarUrl}
              alt={authorName}
              className="w-6 h-6 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium flex-shrink-0">
              {authorName[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <span className="text-sm font-medium truncate block">{authorName}</span>
            <span className="text-xs text-muted-foreground">
              {formatTime(comment.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {hasPin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onPinClick}
              title="Go to pin"
            >
              <MapPin className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onToggleResolve}
            title={isResolved ? "Reopen" : "Resolve"}
          >
            {isResolved ? (
              <RotateCcw className="w-3 h-3" />
            ) : (
              <Check className="w-3 h-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <p
        className={cn(
          "text-sm whitespace-pre-wrap",
          isResolved && "line-through"
        )}
      >
        {comment.content}
      </p>

      {/* Resolved badge */}
      {isResolved && comment.resolver && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="w-3 h-3" />
          Resolved by {comment.resolver.name || "Unknown"}
        </div>
      )}

      {/* Pin badge */}
      {hasPin && !isResolved && (
        <Badge
          variant="outline"
          className="text-xs gap-1 cursor-pointer hover:bg-accent"
          onClick={onPinClick}
        >
          <MapPin className="w-3 h-3" />
          Pinned to diagram
        </Badge>
      )}
    </div>
  );
}

// ============================================
// Helpers
// ============================================

function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default CommentsPanel;
