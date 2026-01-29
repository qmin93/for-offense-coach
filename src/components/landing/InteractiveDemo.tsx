"use client";

import { useState } from "react";
import FormationPreviewCard from "./FormationPreviewCard";

const formations = [
  {
    name: "Doubles",
    positions: [
      { x: 50, y: 75, isCenter: true }, // QB
      { x: 50, y: 85 }, // RB
      { x: 15, y: 55 }, // WR Left
      { x: 85, y: 55 }, // WR Right
      { x: 30, y: 65 }, // Slot Left
      { x: 70, y: 65 }, // Slot Right
      { x: 40, y: 65 }, // OL
      { x: 45, y: 65 }, // OL
      { x: 50, y: 65 }, // C
      { x: 55, y: 65 }, // OL
      { x: 60, y: 65 }, // OL
    ],
  },
  {
    name: "Trips Right",
    positions: [
      { x: 50, y: 75, isCenter: true },
      { x: 50, y: 85 },
      { x: 15, y: 55 },
      { x: 85, y: 55 },
      { x: 70, y: 60 },
      { x: 78, y: 65 },
      { x: 40, y: 65 },
      { x: 45, y: 65 },
      { x: 50, y: 65 },
      { x: 55, y: 65 },
      { x: 60, y: 65 },
    ],
  },
  {
    name: "I-Formation",
    positions: [
      { x: 50, y: 70, isCenter: true },
      { x: 50, y: 80 },
      { x: 50, y: 90 },
      { x: 15, y: 55 },
      { x: 85, y: 55 },
      { x: 40, y: 60 },
      { x: 45, y: 60 },
      { x: 50, y: 60 },
      { x: 55, y: 60 },
      { x: 60, y: 60 },
      { x: 70, y: 60 },
    ],
  },
];

const InteractiveDemo = () => {
  const [activeFormation, setActiveFormation] = useState(0);

  const currentFormation = formations[activeFormation];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Try it <span className="text-gradient">Now</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Click on a formation below to see it in action
          </p>
        </div>

        {/* Demo Canvas */}
        <div className="glass-panel p-8 mb-8 max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-b from-green-900/50 to-green-950/50 rounded-lg overflow-hidden">
            <svg viewBox="0 0 400 200" className="w-full h-auto">
              {/* Field */}
              <rect
                x="0"
                y="0"
                width="400"
                height="200"
                fill="hsl(142, 50%, 20%)"
              />

              {/* Yard lines */}
              {[1, 2, 3].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 50}
                  x2="400"
                  y2={i * 50}
                  stroke="white"
                  strokeOpacity="0.15"
                  strokeWidth="1"
                />
              ))}

              {/* Line of scrimmage */}
              <line
                x1="0"
                y1="100"
                x2="400"
                y2="100"
                stroke="hsl(24, 95%, 53%)"
                strokeWidth="2"
                strokeOpacity="0.5"
                strokeDasharray="8,4"
              />

              {/* Formation name */}
              <text
                x="200"
                y="190"
                textAnchor="middle"
                fontSize="14"
                fill="white"
                fillOpacity="0.6"
                fontFamily="JetBrains Mono"
              >
                {currentFormation.name.toUpperCase()}
              </text>

              {/* Players */}
              {currentFormation.positions.map((pos, index) => (
                <g key={index}>
                  <circle
                    cx={(pos.x / 100) * 400}
                    cy={(pos.y / 100) * 200}
                    r="10"
                    fill={pos.isCenter ? "hsl(24, 95%, 53%)" : "hsl(142, 70%, 45%)"}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-500"
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Formation selection */}
        <div className="flex flex-wrap justify-center gap-4">
          {formations.map((formation, index) => (
            <FormationPreviewCard
              key={formation.name}
              name={formation.name}
              positions={formation.positions}
              isActive={activeFormation === index}
              onClick={() => setActiveFormation(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
