"use client";

import React from "react";
import { useEditorStore } from "../store";
import { getPassConceptById } from "@/domain/engine/concepts-pass";
import { getRunConceptById } from "@/domain/engine/concepts-run";

export function InstallFocusPanel() {
  const { play } = useEditorStore();

  // Get concept from play
  const conceptId = play?.meta?.conceptId;
  const concept = conceptId
    ? getPassConceptById(conceptId) || getRunConceptById(conceptId)
    : null;

  const installFocus = concept?.installFocus;

  if (!installFocus || !installFocus.failurePoints.length) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <div className="mb-2">📋</div>
        <p>No Install Focus available</p>
        <p className="text-xs mt-1">
          Build a concept to see practice recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        Install Focus
        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
          {installFocus.failurePoints.length}
        </span>
      </h3>

      <div className="space-y-4">
        {installFocus.failurePoints.map((fp, index) => (
          <div
            key={fp.id}
            className="p-3 border rounded-lg bg-gray-50"
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
              <div className="font-medium text-sm text-gray-800">
                {fp.name}
              </div>
            </div>

            {/* Drill info */}
            <div className="ml-7 space-y-2">
              <div className="text-sm">
                <span className="font-medium text-gray-700">Drill:</span>{" "}
                <span className="text-gray-600">{fp.drill.name}</span>
              </div>
              <div className="text-xs text-gray-500">
                {fp.drill.purpose}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded capitalize">
                  {fp.drill.phase}
                </span>
              </div>

              {/* Video refs */}
              {fp.videoRefs && fp.videoRefs.length > 0 && (
                <div className="mt-2 space-y-1">
                  {fp.videoRefs.map((video, i) => (
                    <a
                      key={i}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-white border rounded hover:border-blue-300 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs">
                        IG
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-700 truncate">
                          {video.accountName}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {video.hashtags?.join(" ")}
                        </div>
                      </div>
                      <span className="text-gray-400">→</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
