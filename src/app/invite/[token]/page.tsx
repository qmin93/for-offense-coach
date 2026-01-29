"use client";

// ============================================
// Invite Accept Page
// ============================================

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowRight,
  Shield,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface InviteInfo {
  id: string;
  email: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  workspaceName: string;
  invitedByName?: string;
  expiresAt: string;
}

const ROLE_DESCRIPTIONS = {
  OWNER: "Full access - manage members, settings, and all content",
  EDITOR: "Can create and edit plays and playbooks",
  VIEWER: "View-only access to plays and playbooks",
};

const ROLE_COLORS = {
  OWNER: "text-amber-400 bg-amber-500/10",
  EDITOR: "text-blue-400 bg-blue-500/10",
  VIEWER: "text-slate-400 bg-slate-500/10",
};

// ============================================
// Component
// ============================================

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch invite info
  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invites/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Invite not found");
          if (data.invite) {
            setInvite(data.invite);
          }
          return;
        }

        setInvite(data.invite);
      } catch (err) {
        setError("Failed to load invite");
      } finally {
        setLoading(false);
      }
    }

    fetchInvite();
  }, [token]);

  // Accept invite
  const handleAccept = async () => {
    setAccepting(true);
    setError(null);

    try {
      // In production, userId would come from auth session
      const res = await fetch(`/api/invites/${token}`, {
        method: "POST",
        headers: {
          "x-user-id": "demo-user", // Replace with actual auth
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to accept invite");
        return;
      }

      setSuccess(true);

      // Redirect to workspace after short delay
      setTimeout(() => {
        router.push(`/`); // Or redirect to specific workspace
      }, 2000);
    } catch (err) {
      setError("Failed to accept invite");
    } finally {
      setAccepting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading invite...
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome!</h1>
          <p className="text-slate-400 mb-6">
            You&apos;ve joined <span className="text-white">{invite?.workspaceName}</span>
          </p>
          <p className="text-sm text-slate-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Error states for non-pending invites
  if (invite && invite.status !== "PENDING") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
            {invite.status === "EXPIRED" ? (
              <Clock className="w-8 h-8 text-amber-400" />
            ) : invite.status === "ACCEPTED" ? (
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {invite.status === "EXPIRED" && "Invite Expired"}
            {invite.status === "ACCEPTED" && "Already Accepted"}
            {invite.status === "REVOKED" && "Invite Revoked"}
          </h1>
          <p className="text-slate-400 mb-6">
            {invite.status === "EXPIRED" &&
              "This invite has expired. Please ask for a new invite."}
            {invite.status === "ACCEPTED" &&
              "This invite has already been used."}
            {invite.status === "REVOKED" &&
              "This invite has been revoked by the workspace owner."}
          </p>
          <Link href="/">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Error state (no invite)
  if (error && !invite) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invite Not Found</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link href="/">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Main invite view
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Team Invitation</h1>
          <p className="text-slate-400">
            You&apos;ve been invited to join a workspace
          </p>
        </div>

        {/* Invite details */}
        <div className="space-y-4 mb-6">
          {/* Workspace */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Workspace</div>
            <div className="text-lg font-semibold text-white">
              {invite?.workspaceName}
            </div>
          </div>

          {/* Invited by */}
          {invite?.invitedByName && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-1">Invited by</div>
              <div className="text-white">{invite.invitedByName}</div>
            </div>
          )}

          {/* Role */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Your Role</div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  ROLE_COLORS[invite?.role || "VIEWER"]
                }`}
              >
                {invite?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {ROLE_DESCRIPTIONS[invite?.role || "VIEWER"]}
            </p>
          </div>

          {/* Email */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Invited Email</div>
            <div className="text-white">{invite?.email}</div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full"
            size="lg"
          >
            {accepting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                Accept Invitation
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          <Link href="/" className="block">
            <Button variant="ghost" className="w-full" size="lg">
              Decline
            </Button>
          </Link>
        </div>

        {/* Security note */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex items-start gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              By accepting, you&apos;ll gain access to the team&apos;s plays and
              playbooks based on your assigned role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
