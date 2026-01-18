"use client";

// ============================================
// WorkspaceSwitcher - Workspace dropdown selector
// ============================================

import React, { useState, useEffect } from "react";
import {
  useWorkspaceStore,
  useActiveWorkspace,
  fetchWorkspaces,
  createWorkspace,
  type Workspace,
} from "@/lib/workspace-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  User,
  Users,
  Plus,
  Check,
  Settings,
  Loader2,
} from "lucide-react";

// ============================================
// Props
// ============================================

interface WorkspaceSwitcherProps {
  className?: string;
  showLabel?: boolean;
}

// ============================================
// Component
// ============================================

export function WorkspaceSwitcher({ className, showLabel = true }: WorkspaceSwitcherProps) {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    setWorkspaces,
    addWorkspace,
    isLoading,
  } = useWorkspaceStore();
  const activeWorkspace = useActiveWorkspace();

  const [isOpen, setIsOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch workspaces on mount
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await fetchWorkspaces();
        setWorkspaces(data);
      } catch (error) {
        console.error("Failed to load workspaces:", error);
      }
    };
    loadWorkspaces();
  }, [setWorkspaces]);

  // Handle workspace selection
  const handleSelectWorkspace = (workspace: Workspace) => {
    setActiveWorkspace(workspace.id);
    setIsOpen(false);
  };

  // Handle create new workspace
  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    setIsCreating(true);
    try {
      const workspace = await createWorkspace(newWorkspaceName.trim(), "TEAM");
      addWorkspace(workspace);
      setActiveWorkspace(workspace.id);
      setShowCreateDialog(false);
      setNewWorkspaceName("");
    } catch (error) {
      console.error("Failed to create workspace:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Group workspaces
  const personalWorkspace = workspaces.find((w) => w.type === "PERSONAL");
  const teamWorkspaces = workspaces.filter((w) => w.type === "TEAM");

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        {showLabel && <span className="text-sm text-muted-foreground">Loading...</span>}
      </div>
    );
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-9 px-3 gap-2 text-sm font-medium",
              "hover:bg-accent",
              className
            )}
          >
            {activeWorkspace?.type === "TEAM" ? (
              <Users className="w-4 h-4 text-blue-500" />
            ) : (
              <User className="w-4 h-4 text-slate-400" />
            )}
            {showLabel && (
              <span className="max-w-32 truncate">
                {activeWorkspace?.name || "Select Workspace"}
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          {/* Personal Workspace */}
          {personalWorkspace && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Personal
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleSelectWorkspace(personalWorkspace)}
                className="gap-2"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span className="flex-1 truncate">{personalWorkspace.name}</span>
                {activeWorkspaceId === personalWorkspace.id && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </DropdownMenuItem>
            </>
          )}

          {/* Team Workspaces */}
          {teamWorkspaces.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Teams
              </DropdownMenuLabel>
              {teamWorkspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => handleSelectWorkspace(workspace)}
                  className="gap-2"
                >
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="flex-1 truncate">{workspace.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {workspace.role.toLowerCase()}
                    </Badge>
                    {activeWorkspaceId === workspace.id && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}

          {/* Actions */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setIsOpen(false);
              setShowCreateDialog(true);
            }}
            className="gap-2 text-blue-500"
          >
            <Plus className="w-4 h-4" />
            Create Team Workspace
          </DropdownMenuItem>

          {activeWorkspace?.type === "TEAM" && activeWorkspace.role === "OWNER" && (
            <DropdownMenuItem
              onClick={() => {
                setIsOpen(false);
                // Navigate to workspace settings
                window.location.href = `/workspace/${activeWorkspaceId}/settings`;
              }}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Workspace Settings
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Workspace Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team Workspace</DialogTitle>
            <DialogDescription>
              Team workspaces let you collaborate with other coaches.
              You can invite members after creating the workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                placeholder="e.g., Varsity Offense 2024"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateWorkspace();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================
// Compact version for mobile/narrow spaces
// ============================================

export function WorkspaceSwitcherCompact({ className }: { className?: string }) {
  return <WorkspaceSwitcher className={className} showLabel={false} />;
}

export default WorkspaceSwitcher;
