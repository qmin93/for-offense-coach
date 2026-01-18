"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sparkles,
  LayoutGrid,
  BookOpen,
  Clock,
  ArrowRight,
  Zap,
  Target,
  ClipboardList,
  Play,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface RecentWork {
  id: string;
  name: string;
  type: "play" | "playbook";
  updatedAt: string;
}

// ============================================
// Start Flow Card Component
// ============================================

interface StartFlowCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  timeEstimate: string;
  variant: "primary" | "secondary" | "outline";
  badge?: string;
}

function StartFlowCard({
  href,
  title,
  description,
  icon,
  timeEstimate,
  variant,
  badge,
}: StartFlowCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
        variant === "primary" &&
          "border-blue-500 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:border-blue-400",
        variant === "secondary" &&
          "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/50",
        variant === "outline" &&
          "border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white"
      )}
    >
      {/* Time badge */}
      <div
        className={cn(
          "absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          variant === "primary"
            ? "bg-blue-500/20 text-blue-600"
            : "bg-slate-100 text-slate-500"
        )}
      >
        <Clock className="w-3 h-3" />
        {timeEstimate}
      </div>

      {/* Recommended badge */}
      {badge && (
        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
          {badge}
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
          variant === "primary"
            ? "bg-blue-500 text-white"
            : variant === "secondary"
            ? "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
            : "bg-slate-50 text-slate-500"
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <h3
        className={cn(
          "text-lg font-bold mb-1",
          variant === "primary" ? "text-blue-900" : "text-slate-800"
        )}
      >
        {title}
      </h3>
      <p className="text-sm text-slate-500 mb-4">{description}</p>

      {/* Arrow indicator */}
      <div className="mt-auto flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
        Start <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

// ============================================
// Feature Card Component
// ============================================

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100">
      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-sm text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ============================================
// Recent Work Card Component
// ============================================

interface RecentWorkCardProps {
  item: RecentWork;
}

function RecentWorkCard({ item }: RecentWorkCardProps) {
  const formattedDate = new Date(item.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link
      href={item.type === "play" ? `/editor/${item.id}` : `/playbook/${item.id}`}
      className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          item.type === "play" ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-500"
        )}
      >
        {item.type === "play" ? <Play className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-slate-800 truncate">{item.name}</div>
        <div className="text-xs text-slate-400">{formattedDate}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
    </Link>
  );
}

// ============================================
// Main Landing Page
// ============================================

export default function Home() {
  const [recentWorks, setRecentWorks] = useState<RecentWork[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  // Load recent works from localStorage or API
  useEffect(() => {
    const loadRecentWorks = async () => {
      try {
        // Try to get from localStorage first (for quick display)
        const storedRecent = localStorage.getItem("foroffense_recent_works");
        if (storedRecent) {
          setRecentWorks(JSON.parse(storedRecent));
        }

        // Then fetch from API
        const response = await fetch("/api/plays?limit=3&sort=updatedAt");
        if (response.ok) {
          const data = await response.json();
          const works: RecentWork[] = data.plays?.map((p: { id: string; name: string; updatedAt: string }) => ({
            id: p.id,
            name: p.name,
            type: "play" as const,
            updatedAt: p.updatedAt,
          })) || [];

          setRecentWorks(works);
          localStorage.setItem("foroffense_recent_works", JSON.stringify(works));
        }
      } catch (error) {
        console.error("Failed to load recent works:", error);
      } finally {
        setIsLoadingRecent(false);
      }
    };

    loadRecentWorks();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            3분 안에 플레이 하나 완성.
          </h1>
          <p className="text-lg text-slate-500 mb-2">
            컨셉 추천 → 자동 다이어그램 → PNG/PDF 공유까지
          </p>
          <p className="text-sm text-slate-400">
            No signup required • Team workspace 지원
          </p>
        </div>

        {/* Start Flow Cards - 3 cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <StartFlowCard
            href="/editor/new"
            title="추천 시작"
            description="상황 선택 → 컨셉 추천 → 자동 생성"
            icon={<Sparkles className="w-6 h-6" />}
            timeEstimate="30초"
            variant="primary"
            badge="추천"
          />
          <StartFlowCard
            href="/editor/new?mode=formation"
            title="포메이션부터 시작"
            description="포메이션 고르고 플레이 만들기"
            icon={<LayoutGrid className="w-6 h-6" />}
            timeEstimate="2분"
            variant="secondary"
          />
          <StartFlowCard
            href="/playbooks"
            title="플레이북 관리"
            description="기존 플레이북 편집, 태그/섹션 정리"
            icon={<BookOpen className="w-6 h-6" />}
            timeEstimate="5분"
            variant="outline"
          />
        </div>

        {/* Recent Work Section */}
        {(recentWorks.length > 0 || isLoadingRecent) && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                이어서 작업하기
              </h2>
              {recentWorks.length > 0 && (
                <Link
                  href="/plays"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  전체 보기 <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {isLoadingRecent ? (
              <div className="grid md:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-3">
                {recentWorks.map((item) => (
                  <RecentWorkCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feature Cards - Evidence Section */}
        <div className="mb-12">
          <h2 className="text-center text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">
            왜 ForOffenseCoach인가?
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Target className="w-5 h-5" />}
              title="30+ 컨셉 템플릿"
              description="Pass/Run 자동 생성"
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="상황 기반 추천"
              description="이유 3줄과 함께"
            />
            <FeatureCard
              icon={<ClipboardList className="w-5 h-5" />}
              title="실패 포인트 → 드릴"
              description="Install Focus 연결"
            />
          </div>
        </div>

        {/* Quick Examples Preview */}
        <div className="text-center py-8 border-t border-slate-100">
          <p className="text-sm text-slate-400 mb-4">
            Power, Flood, Stick 등 인기 컨셉 바로 시작
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/editor/new?concept=power"
              className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
            >
              Power (Run)
            </Link>
            <Link
              href="/editor/new?concept=flood"
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Flood (Pass)
            </Link>
            <Link
              href="/editor/new?concept=stick"
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Stick (Pass)
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-slate-400">
          <div>ForOffenseCoach © 2024</div>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="hover:text-slate-600">
              Docs
            </Link>
            <Link href="/support" className="hover:text-slate-600">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
