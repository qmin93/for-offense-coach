"use client";

// ============================================
// TeamMembersPanel - Manage workspace members
// ============================================

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WorkspaceRole, WorkspacePermissions, MemberInfo } from "@/lib/permissions";
import {
  Users,
  UserPlus,
  MoreVertical,
  Crown,
  Edit3,
  Eye,
  Trash2,
  Mail,
  Clock,
  RefreshCw,
  X,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// ============================================
// Types
// ============================================

interface InviteInfo {
  id: string;
  email: string;
  role: WorkspaceRole;
  status: string;
  createdAt: string;
  expiresAt: string;
  inviteUrl?: string;
}

interface TeamMembersPanelProps {
  workspaceId: string;
  currentUserId: string;
  permissions: WorkspacePermissions;
  onMemberChange?: () => void;
}

// ============================================
// Role Badge Component
// ============================================

const ROLE_CONFIG: Record<WorkspaceRole, { icon: React.ElementType; color: string; label: string }> = {
  OWNER: { icon: Crown, color: "text-amber-400 bg-amber-500/10", label: "Owner" },
  EDITOR: { icon: Edit3, color: "text-blue-400 bg-blue-500/10", label: "Editor" },
  VIEWER: { icon: Eye, color: "text-slate-400 bg-slate-500/10", label: "Viewer" },
};

function RoleBadge({ role }: { role: WorkspaceRole }) {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium", config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ============================================
// Member Row Component
// ============================================

interface MemberRowProps {
  member: MemberInfo;
  isCurrentUser: boolean;
  canChangeRoles: boolean;
  canRemove: boolean;
  onChangeRole: (role: WorkspaceRole) => void;
  onRemove: () => void;
}

function MemberRow({
  member,
  isCurrentUser,
  canChangeRoles,
  canRemove,
  onChangeRole,
  onRemove,
}: MemberRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate">
            {member.name || member.email}
          </span>
          {isCurrentUser && (
            <span className="text-xs text-slate-500">(you)</span>
          )}
        </div>
        <div className="text-xs text-slate-400 truncate">{member.email}</div>
      </div>

      {/* Role */}
      <div className="relative">
        {canChangeRoles && !isCurrentUser ? (
          <button
            onClick={() => setShowRoleSelect(!showRoleSelect)}
            className="flex items-center gap-1"
          >
            <RoleBadge role={member.role} />
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        ) : (
          <RoleBadge role={member.role} />
        )}

        {/* Role selector dropdown */}
        {showRoleSelect && (
          <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1 min-w-[140px]">
            {(["OWNER", "EDITOR", "VIEWER"] as WorkspaceRole[]).map((role) => (
              <button
                key={role}
                onClick={() => {
                  onChangeRole(role);
                  setShowRoleSelect(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-700",
                  member.role === role && "bg-slate-700/50"
                )}
              >
                <RoleBadge role={role} />
                {member.role === role && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {(canRemove || isCurrentUser) && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1 min-w-[120px]">
              <button
                onClick={() => {
                  onRemove();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isCurrentUser ? "Leave" : "Remove"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Invite Row Component
// ============================================

interface InviteRowProps {
  invite: InviteInfo;
  onResend: () => void;
  onRevoke: () => void;
}

function InviteRow({ invite, onResend, onRevoke }: InviteRowProps) {
  const [copying, setCopying] = useState(false);

  const handleCopyLink = async () => {
    if (!invite.inviteUrl) return;
    setCopying(true);
    await navigator.clipboard.writeText(invite.inviteUrl);
    toast.success("Invite link copied");
    setTimeout(() => setCopying(false), 1000);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
        <Mail className="w-5 h-5 text-slate-400" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate">{invite.email}</div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>
            Expires{" "}
            {new Date(invite.expiresAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Role */}
      <RoleBadge role={invite.role} />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {invite.inviteUrl && (
          <button
            onClick={handleCopyLink}
            className="p-1.5 text-slate-400 hover:text-white rounded"
            title="Copy invite link"
          >
            {copying ? <Check className="w-4 h-4 text-green-400" /> : "📋"}
          </button>
        )}
        <button
          onClick={onResend}
          className="p-1.5 text-slate-400 hover:text-white rounded"
          title="Resend invite"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={onRevoke}
          className="p-1.5 text-slate-400 hover:text-red-400 rounded"
          title="Revoke invite"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// Invite Dialog Component
// ============================================

interface InviteDialogProps {
  onClose: () => void;
  onInvite: (email: string, role: WorkspaceRole) => Promise<void>;
}

function InviteDialog({ onClose, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("EDITOR");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await onInvite(email.trim(), role);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            Invite Team Member
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <div className="space-y-2">
              {(["EDITOR", "VIEWER"] as WorkspaceRole[]).map((r) => (
                <label
                  key={r}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    role === r
                      ? "bg-blue-500/10 border border-blue-500/30"
                      : "bg-slate-800/50 border border-transparent hover:bg-slate-800"
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                    className="sr-only"
                  />
                  <RoleBadge role={r} />
                  <div className="flex-1">
                    <div className="text-sm text-white">{ROLE_CONFIG[r].label}</div>
                    <div className="text-xs text-slate-400">
                      {r === "EDITOR" && "Can create and edit plays"}
                      {r === "VIEWER" && "View-only access"}
                    </div>
                  </div>
                  {role === r && <Check className="w-4 h-4 text-blue-400" />}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-700 bg-slate-800/50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!email.trim() || loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Invite
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function TeamMembersPanel({
  workspaceId,
  currentUserId,
  permissions,
  onMemberChange,
}: TeamMembersPanelProps) {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [invites, setInvites] = useState<InviteInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Fetch members and invites
  const fetchData = useCallback(async () => {
    try {
      // Fetch members
      const membersRes = await fetch(`/api/workspaces/${workspaceId}/members`, {
        headers: { "x-user-id": currentUserId },
      });
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members);
      }

      // Fetch invites if user can invite
      if (permissions.canInviteMembers) {
        const invitesRes = await fetch(`/api/workspaces/${workspaceId}/invites`, {
          headers: { "x-user-id": currentUserId },
        });
        if (invitesRes.ok) {
          const data = await invitesRes.json();
          setInvites(data.invites);
        }
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, currentUserId, permissions.canInviteMembers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle role change
  const handleRoleChange = async (memberId: string, newRole: WorkspaceRole) => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success("Role updated");
      fetchData();
      onMemberChange?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  // Handle remove member
  const handleRemove = async (memberId: string) => {
    const isCurrentUser = memberId === currentUserId;
    const confirmMsg = isCurrentUser
      ? "Are you sure you want to leave this workspace?"
      : "Are you sure you want to remove this member?";

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members?memberId=${memberId}`,
        {
          method: "DELETE",
          headers: { "x-user-id": currentUserId },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success(isCurrentUser ? "Left workspace" : "Member removed");
      fetchData();
      onMemberChange?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  // Handle invite
  const handleInvite = async (email: string, role: WorkspaceRole) => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success("Invite sent");
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invite");
      throw error;
    }
  };

  // Handle resend invite
  const handleResendInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invites`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify({ inviteId }),
      });

      if (!res.ok) {
        throw new Error("Failed to resend");
      }

      toast.success("Invite resent");
      fetchData();
    } catch (error) {
      toast.error("Failed to resend invite");
    }
  };

  // Handle revoke invite
  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm("Revoke this invite?")) return;

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/invites?inviteId=${inviteId}`,
        {
          method: "DELETE",
          headers: { "x-user-id": currentUserId },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to revoke");
      }

      toast.success("Invite revoked");
      fetchData();
    } catch (error) {
      toast.error("Failed to revoke invite");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Team Members</h3>
          <Badge variant="secondary" className="text-xs">
            {members.length}
          </Badge>
        </div>
        {permissions.canInviteMembers && (
          <Button size="sm" onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        )}
      </div>

      {/* Members list */}
      <div className="space-y-2">
        {members.map((member) => (
          <MemberRow
            key={member.userId}
            member={member}
            isCurrentUser={member.userId === currentUserId}
            canChangeRoles={permissions.canChangeRoles}
            canRemove={permissions.canRemoveMembers || member.userId === currentUserId}
            onChangeRole={(role) => handleRoleChange(member.userId, role)}
            onRemove={() => handleRemove(member.userId)}
          />
        ))}
      </div>

      {/* Pending invites */}
      {permissions.canInviteMembers && invites.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <h4 className="text-sm font-medium text-slate-300">Pending Invites</h4>
            <Badge variant="outline" className="text-xs">
              {invites.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {invites.map((invite) => (
              <InviteRow
                key={invite.id}
                invite={invite}
                onResend={() => handleResendInvite(invite.id)}
                onRevoke={() => handleRevokeInvite(invite.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Invite dialog */}
      {showInviteDialog && (
        <InviteDialog
          onClose={() => setShowInviteDialog(false)}
          onInvite={handleInvite}
        />
      )}
    </div>
  );
}

export default TeamMembersPanel;
