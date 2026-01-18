"use client";

import { useEditorStore } from "@/features/editor/store";
import {
  LayoutGrid,
  Sparkles,
  Download,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  direction?: "left" | "right" | "none";
  isActive?: boolean;
}

function Step({ number, title, description, icon, direction = "none", isActive }: StepProps) {
  return (
    <div
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl transition-all",
        isActive
          ? "bg-blue-50 border-2 border-blue-200"
          : "bg-white/80 border border-slate-200"
      )}
    >
      {/* Direction indicator */}
      {direction === "left" && (
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex items-center text-blue-400">
          <ChevronLeft className="w-6 h-6 animate-pulse" />
        </div>
      )}
      {direction === "right" && (
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center text-blue-400">
          <ChevronRight className="w-6 h-6 animate-pulse" />
        </div>
      )}

      {/* Step number */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
          isActive ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
        )}
      >
        {number}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn("text-slate-500", isActive && "text-blue-600")}>
            {icon}
          </div>
          <h4 className={cn("font-semibold", isActive ? "text-blue-900" : "text-slate-700")}>
            {title}
          </h4>
        </div>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function EmptyStateOverlay() {
  const play = useEditorStore((state) => state.play);

  // Determine what's missing
  const hasFormation = !!play?.meta?.formationId;
  const hasConcept = !!play?.meta?.conceptId;
  const hasActions = (play?.actions?.length || 0) > 0;

  // Don't show if play has actions or both formation and concept
  if (hasActions || (hasFormation && hasConcept)) {
    return null;
  }

  // Determine which step is active
  const activeStep = !hasFormation ? 1 : !hasConcept ? 2 : 3;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 to-slate-50/60 backdrop-blur-[1px]" />

      {/* Content card */}
      <div className="relative bg-white/95 rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md mx-4 pointer-events-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MousePointerClick className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            플레이를 만들어 보세요
          </h3>
          <p className="text-sm text-slate-500">
            아래 3단계로 빠르게 완성할 수 있어요
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          <Step
            number={1}
            title="Formation 선택"
            description="좌측 패널에서 오펜스 포메이션을 선택하세요"
            icon={<LayoutGrid className="w-4 h-4" />}
            direction="left"
            isActive={activeStep === 1}
          />
          <Step
            number={2}
            title="Concept 추천/선택"
            description="상황에 맞는 컨셉을 추천받거나 직접 선택하세요"
            icon={<Sparkles className="w-4 h-4" />}
            direction="right"
            isActive={activeStep === 2}
          />
          <Step
            number={3}
            title="조정 & 내보내기"
            description="루트/블로킹 수정 후 PNG/PDF로 내보내세요"
            icon={<Download className="w-4 h-4" />}
            direction="none"
            isActive={activeStep === 3}
          />
        </div>

        {/* CTA hint */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
            <span>추천:</span>
            <span className="font-medium">우측 Suggestions 패널에서 시작</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
