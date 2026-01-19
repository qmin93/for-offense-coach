"use client";

import { useState } from "react";

interface FormationPreviewCardProps {
  name: string;
  positions: { x: number; y: number; isCenter?: boolean }[];
  isActive: boolean;
  onClick: () => void;
}

const FormationPreviewCard = ({ name, positions, isActive, onClick }: FormationPreviewCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
        ${isActive
          ? "border-primary bg-primary/10 glow-primary"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
        }
      `}
    >
      {/* Mini formation preview */}
      <div className="relative w-24 h-16 mx-auto mb-3">
        {/* Mini field lines */}
        <div className="absolute inset-0 border border-muted-foreground/20 rounded-sm">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-muted-foreground/20" />
        </div>

        {/* Player dots */}
        {positions.map((pos, index) => (
          <div
            key={index}
            className={`
              absolute w-2.5 h-2.5 rounded-full transition-all duration-300
              ${pos.isCenter ? "bg-accent" : "bg-primary"}
              ${isHovered || isActive ? "animate-pulse-slow" : ""}
            `}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${index * 100}ms`,
            }}
          />
        ))}
      </div>

      {/* Formation name */}
      <span className={`
        font-mono text-sm font-medium transition-colors duration-300
        ${isActive ? "text-primary" : "text-foreground"}
      `}>
        {name}
      </span>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse-slow" />
      )}
    </button>
  );
};

export default FormationPreviewCard;
