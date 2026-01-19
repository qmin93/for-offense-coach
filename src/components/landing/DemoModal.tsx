"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MousePointer2,
  Grid3X3,
  Route,
  Download,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
} from "lucide-react";

interface DemoStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
}

const demoSteps: DemoStep[] = [
  {
    title: "Drag & Drop Players",
    description:
      "Position players anywhere on the field with intuitive drag-and-drop controls. Move them precisely with 0.5-yard snap.",
    icon: <MousePointer2 className="w-6 h-6" />,
    visual: (
      <svg viewBox="0 0 300 180" className="w-full h-auto">
        <rect width="300" height="180" fill="hsl(142, 50%, 18%)" />
        <line x1="0" y1="90" x2="300" y2="90" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
        <circle cx="150" cy="110" r="14" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="2">
          <animate attributeName="cx" values="150;180;180;150" dur="3s" repeatCount="indefinite" />
          <animate attributeName="cy" values="110;90;90;110" dur="3s" repeatCount="indefinite" />
        </circle>
        <text x="150" y="115" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
          <animate attributeName="x" values="150;180;180;150" dur="3s" repeatCount="indefinite" />
          <animate attributeName="y" values="115;95;95;115" dur="3s" repeatCount="indefinite" />
          QB
        </text>
        <path
          d="M 150 110 Q 165 100 180 90"
          stroke="hsl(45, 95%, 55%)"
          strokeWidth="2"
          strokeDasharray="4"
          fill="none"
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0;0.6;0.6;0" dur="3s" repeatCount="indefinite" />
        </path>
        <circle cx="100" cy="90" r="12" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="2" />
        <circle cx="200" cy="90" r="12" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="2" />
        <circle cx="130" cy="90" r="10" fill="hsl(217, 70%, 45%)" stroke="white" strokeWidth="2" />
        <circle cx="150" cy="90" r="10" fill="hsl(217, 70%, 45%)" stroke="white" strokeWidth="2" />
        <circle cx="170" cy="90" r="10" fill="hsl(217, 70%, 45%)" stroke="white" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Choose Formations",
    description:
      "Select from a library of pre-built formations: Doubles, Trips, I-Form, Empty, Pistol, and more.",
    icon: <Grid3X3 className="w-6 h-6" />,
    visual: (
      <svg viewBox="0 0 300 180" className="w-full h-auto">
        <rect width="300" height="180" fill="hsl(142, 50%, 18%)" />
        <line x1="0" y1="90" x2="300" y2="90" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
        {/* Formation cards */}
        <g>
          <rect x="20" y="20" width="80" height="60" rx="4" fill="hsl(220, 15%, 14%)" stroke="hsl(217, 91%, 56%)" strokeWidth="2">
            <animate attributeName="stroke-opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </rect>
          <text x="60" y="58" textAnchor="middle" fill="white" fontSize="10">DOUBLES</text>
        </g>
        <g>
          <rect x="110" y="20" width="80" height="60" rx="4" fill="hsl(220, 15%, 14%)" stroke="hsl(220, 15%, 30%)" strokeWidth="1" />
          <text x="150" y="58" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10">TRIPS</text>
        </g>
        <g>
          <rect x="200" y="20" width="80" height="60" rx="4" fill="hsl(220, 15%, 14%)" stroke="hsl(220, 15%, 30%)" strokeWidth="1" />
          <text x="240" y="58" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10">I-FORM</text>
        </g>
        {/* Formation preview */}
        <circle cx="150" cy="130" r="8" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="1.5" />
        <circle cx="150" cy="150" r="8" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="1.5" />
        <circle cx="80" cy="110" r="8" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="1.5" />
        <circle cx="220" cy="110" r="8" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="1.5" />
        <circle cx="110" cy="115" r="8" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="1.5" />
        <circle cx="190" cy="115" r="8" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Draw Routes & Blocks",
    description:
      "Draw route trees, blocking assignments, and motion paths. Apply concepts with one click.",
    icon: <Route className="w-6 h-6" />,
    visual: (
      <svg viewBox="0 0 300 180" className="w-full h-auto">
        <rect width="300" height="180" fill="hsl(142, 50%, 18%)" />
        <line x1="0" y1="120" x2="300" y2="120" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
        {/* Route paths */}
        <path
          d="M 80 120 L 80 60 L 120 30"
          stroke="hsl(45, 95%, 55%)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <animate attributeName="stroke-dasharray" values="0,200;200,0" dur="2s" repeatCount="indefinite" />
        </path>
        <path
          d="M 220 120 L 220 70 L 180 40"
          stroke="hsl(45, 95%, 55%)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <animate attributeName="stroke-dasharray" values="0,200;200,0" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </path>
        <path
          d="M 150 140 L 150 90"
          stroke="hsl(45, 95%, 55%)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        >
          <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="2s" repeatCount="indefinite" begin="0.6s" />
        </path>
        {/* Block arrows */}
        <path
          d="M 120 120 L 120 100"
          stroke="hsl(199, 89%, 48%)"
          strokeWidth="4"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        <path
          d="M 180 120 L 180 100"
          stroke="hsl(199, 89%, 48%)"
          strokeWidth="4"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="hsl(199, 89%, 48%)" />
          </marker>
        </defs>
        {/* Players */}
        <circle cx="80" cy="120" r="10" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="2" />
        <circle cx="220" cy="120" r="10" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="2" />
        <circle cx="150" cy="140" r="10" fill="hsl(217, 91%, 56%)" stroke="white" strokeWidth="2" />
        <circle cx="120" cy="120" r="8" fill="hsl(217, 70%, 45%)" stroke="white" strokeWidth="1.5" />
        <circle cx="150" cy="120" r="8" fill="hsl(217, 70%, 45%)" stroke="white" strokeWidth="1.5" />
        <circle cx="180" cy="120" r="8" fill="hsl(217, 70%, 45%)" stroke="white" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Export & Share",
    description:
      "Export your plays to PNG or PDF. Create practice scripts and share your playbook with the team.",
    icon: <Download className="w-6 h-6" />,
    visual: (
      <svg viewBox="0 0 300 180" className="w-full h-auto">
        <rect width="300" height="180" fill="hsl(225, 15%, 11%)" />
        {/* Export dialog mockup */}
        <rect x="50" y="30" width="200" height="120" rx="8" fill="hsl(225, 15%, 14%)" stroke="hsl(220, 15%, 25%)" strokeWidth="1" />
        <text x="150" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">Export Play</text>
        {/* PNG button */}
        <rect x="70" y="70" width="70" height="30" rx="4" fill="hsl(217, 91%, 56%)">
          <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite" />
        </rect>
        <text x="105" y="90" textAnchor="middle" fill="white" fontSize="11" fontWeight="500">PNG</text>
        {/* PDF button */}
        <rect x="160" y="70" width="70" height="30" rx="4" fill="hsl(220, 15%, 20%)" stroke="hsl(217, 91%, 56%)" strokeWidth="1" />
        <text x="195" y="90" textAnchor="middle" fill="hsl(217, 91%, 56%)" fontSize="11" fontWeight="500">PDF</text>
        {/* Download icon animation */}
        <g transform="translate(150, 125)">
          <path d="M 0 -8 L 0 4 M -6 0 L 0 6 L 6 0" stroke="hsl(140, 70%, 45%)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="translate" values="0,-5;0,5;0,5;0,-5" dur="2s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    ),
  },
];

interface DemoModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DemoModal({ open: controlledOpen, onOpenChange }: DemoModalProps) {
  const searchParams = useSearchParams();
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Determine if this is controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  // Check for ?demo=1 query parameter
  useEffect(() => {
    if (searchParams.get("demo") === "1") {
      setOpen(true);
    }
  }, [searchParams, setOpen]);

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentStep(0);
  };

  const step = demoSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <div className="w-10 h-10 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue">
              {step.icon}
            </div>
            {step.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        {/* Visual demo area */}
        <div className="rounded-lg overflow-hidden border border-border bg-background">
          {step.visual}
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {demoSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? "bg-brand-blue w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <span className="text-sm text-muted-foreground font-mono">
            {currentStep + 1} / {demoSteps.length}
          </span>

          {currentStep === demoSteps.length - 1 ? (
            <Button variant="primary" size="sm" onClick={handleClose} className="gap-1">
              Get Started
              <Play className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleNext} className="gap-1">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
