"use client";

import { useEffect, useState } from "react";

const HeroField = () => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Player positions for a spread formation
  const offensePlayers = [
    { x: 200, y: 180, role: "QB" },
    { x: 200, y: 220, role: "RB" },
    { x: 80, y: 140, role: "WR" },
    { x: 320, y: 140, role: "WR" },
    { x: 120, y: 170, role: "WR" },
    { x: 280, y: 170, role: "WR" },
    { x: 160, y: 170, role: "OL" },
    { x: 180, y: 170, role: "OL" },
    { x: 200, y: 170, role: "C" },
    { x: 220, y: 170, role: "OL" },
    { x: 240, y: 170, role: "OL" },
  ];

  // Routes for animation
  const routes = [
    { startX: 80, startY: 140, path: "M80,140 Q80,80 120,60", delay: 0 },
    { startX: 320, startY: 140, path: "M320,140 Q320,80 280,60", delay: 0.2 },
    { startX: 120, startY: 170, path: "M120,170 L120,100 L180,80", delay: 0.4 },
    { startX: 280, startY: 170, path: "M280,170 L280,100 L220,80", delay: 0.6 },
    { startX: 200, startY: 220, path: "M200,220 L200,140 L260,120", delay: 0.8 },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto animate-float">
      <svg
        viewBox="0 0 400 280"
        className="w-full h-auto"
        style={{ filter: "drop-shadow(0 0 20px hsl(142, 70%, 45%, 0.2))" }}
      >
        {/* Field background */}
        <defs>
          <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(142, 50%, 25%)" />
            <stop offset="100%" stopColor="hsl(142, 50%, 18%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main field */}
        <rect
          x="20"
          y="20"
          width="360"
          height="240"
          rx="4"
          fill="url(#fieldGradient)"
          stroke="hsl(0, 0%, 100%)"
          strokeWidth="2"
          strokeOpacity="0.3"
        />

        {/* Yard lines */}
        {[1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="20"
            y1={20 + i * 48}
            x2="380"
            y2={20 + i * 48}
            stroke="hsl(0, 0%, 100%)"
            strokeWidth="1"
            strokeOpacity="0.2"
          />
        ))}

        {/* Hash marks */}
        {[1, 2, 3, 4].map((i) =>
          [140, 260].map((x) => (
            <line
              key={`${i}-${x}`}
              x1={x}
              y1={18 + i * 48}
              x2={x}
              y2={22 + i * 48}
              stroke="hsl(0, 0%, 100%)"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
          ))
        )}

        {/* Line of scrimmage */}
        <line
          x1="20"
          y1="160"
          x2="380"
          y2="160"
          stroke="hsl(24, 95%, 53%)"
          strokeWidth="2"
          strokeOpacity="0.6"
          strokeDasharray="5,5"
        />

        {/* Route paths with animation */}
        {routes.map((route, index) => (
          <path
            key={index}
            d={route.path}
            fill="none"
            stroke="hsl(24, 95%, 53%)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="200"
            strokeDashoffset={animationPhase === 1 ? "0" : "200"}
            style={{
              transition: "stroke-dashoffset 1s ease-out",
              transitionDelay: `${route.delay}s`,
            }}
            filter="url(#glow)"
          />
        ))}

        {/* Arrow heads for routes */}
        {animationPhase === 1 && (
          <>
            <polygon
              points="120,60 115,68 125,68"
              fill="hsl(24, 95%, 53%)"
              className="animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            />
            <polygon
              points="280,60 275,68 285,68"
              fill="hsl(24, 95%, 53%)"
              className="animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}

        {/* Offensive players */}
        {offensePlayers.map((player, index) => (
          <g key={index}>
            <circle
              cx={player.x}
              cy={player.y}
              r="8"
              fill="hsl(142, 70%, 45%)"
              stroke="hsl(0, 0%, 100%)"
              strokeWidth="1.5"
              className={index < 5 ? "animate-pulse-slow" : ""}
              style={{ animationDelay: `${index * 0.1}s` }}
            />
            {player.role === "QB" && (
              <text
                x={player.x}
                y={player.y + 3}
                textAnchor="middle"
                fontSize="6"
                fill="hsl(222, 47%, 6%)"
                fontWeight="bold"
              >
                QB
              </text>
            )}
          </g>
        ))}

        {/* Defense indicator */}
        <text
          x="200"
          y="50"
          textAnchor="middle"
          fontSize="10"
          fill="hsl(0, 0%, 100%)"
          fillOpacity="0.4"
          fontFamily="JetBrains Mono"
        >
          COVER 3
        </text>

        {/* Formation label */}
        <text
          x="200"
          y="265"
          textAnchor="middle"
          fontSize="11"
          fill="hsl(0, 0%, 100%)"
          fillOpacity="0.6"
          fontFamily="JetBrains Mono"
        >
          DOUBLES RIGHT - MESH
        </text>
      </svg>

      {/* Floating badge */}
      <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full animate-pulse-slow">
        LIVE
      </div>
    </div>
  );
};

export default HeroField;
