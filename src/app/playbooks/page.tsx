"use client";

// ============================================
// Playbooks List Page
// ============================================

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import {
  Plus,
  BookOpen,
  ChevronRight,
  FolderOpen,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface PlaybookSummary {
  id: string;
  name: string;
  playCount: number;
  sectionCount: number;
  updatedAt: string;
}

// ============================================
// Playbook Card Component
// ============================================

function PlaybookCard({ playbook }: { playbook: PlaybookSummary }) {
  const formattedDate = new Date(playbook.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/playbook/${playbook.id}`}
      className="group flex flex-col p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
          <BookOpen className="w-6 h-6" />
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{playbook.name}</h3>
      <p className="text-sm text-slate-500 mb-4">
        {playbook.playCount} plays • {playbook.sectionCount} sections
      </p>
      <div className="mt-auto flex items-center gap-1 text-xs text-slate-400">
        <Clock className="w-3 h-3" />
        Updated {formattedDate}
      </div>
    </Link>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
        <FolderOpen className="w-10 h-10 text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">No Playbooks Yet</h2>
      <p className="text-slate-500 text-center mb-6 max-w-md">
        Create your first playbook to organize plays by sections, add tags, and export to PDF.
      </p>
      <Link href="/playbook/new">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Playbook
        </Button>
      </Link>
    </div>
  );
}

// ============================================
// Main Playbooks Page
// ============================================

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<PlaybookSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlaybooks = async () => {
      try {
        // Try localStorage first
        const storedPlaybooks = localStorage.getItem("foroffense_playbooks");
        if (storedPlaybooks) {
          const parsed = JSON.parse(storedPlaybooks);
          setPlaybooks(parsed);
        }

        // Try API (if implemented)
        try {
          const response = await fetch("/api/playbooks");
          if (response.ok) {
            const data = await response.json();
            if (data.playbooks && data.playbooks.length > 0) {
              setPlaybooks(data.playbooks);
              localStorage.setItem("foroffense_playbooks", JSON.stringify(data.playbooks));
            }
          }
        } catch {
          // API not implemented yet, use localStorage only
        }
      } catch (error) {
        console.error("Failed to load playbooks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaybooks();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Playbooks</h1>
                <p className="text-sm text-slate-500">
                  {playbooks.length} playbook{playbooks.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Link href="/playbook/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Playbook
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-slate-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : playbooks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playbooks.map((playbook) => (
              <PlaybookCard key={playbook.id} playbook={playbook} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
