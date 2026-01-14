"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PlayRenderer } from "@/domain/render/svg-renderer";
import { Button } from "@/components/ui";
import type { Play } from "@/domain/dsl/types";

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [play, setPlay] = useState<Play | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch shared play/playbook from API
    // For now, show a placeholder
    setLoading(false);
    setError("Share link not found or expired");
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !play) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Share Link Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This share link may have expired or been revoked.
          </p>
          <Link href="/">
            <Button variant="primary">Go to ForOffenseCoach</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 font-bold">
              ForOffenseCoach
            </Link>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-600">Shared Play</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Fork to My Workspace</Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Play name */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold">{play.name}</h1>
            <div className="text-sm text-gray-500 mt-1">
              {play.meta?.personnel} • {play.meta?.formationId?.replace("formation_", "")}
              {play.meta?.conceptId && (
                <> • {play.meta.conceptId.replace("concept_", "")}</>
              )}
            </div>
          </div>

          {/* Play diagram */}
          <div className="aspect-video bg-gray-800">
            <PlayRenderer play={play} />
          </div>

          {/* Notes */}
          {play.notes?.coachingPoints && play.notes.coachingPoints.length > 0 && (
            <div className="px-6 py-4 border-t">
              <h3 className="font-semibold text-gray-700 mb-2">Coaching Points</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {play.notes.coachingPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Attribution */}
        <div className="text-center text-sm text-gray-400 mt-6">
          Shared via ForOffenseCoach
        </div>
      </div>
    </div>
  );
}
