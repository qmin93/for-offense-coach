import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          ForOffenseCoach
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Football Playbook Builder & Concept Recommender
        </p>
        <p className="text-gray-500 mb-12">
          Formation → Concept 추천 → 클릭 즉시 다이어그램 생성 → 출력/공유
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/editor/new"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Start from Concept (Recommended)
          </Link>
          <Link
            href="/editor/new?mode=formation"
            className="px-8 py-4 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Start from Formation
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">🎯 Concept Library</h3>
            <p className="text-gray-600 text-sm">
              Pass 20개 + Run 20개 컨셉 템플릿. 클릭 한 번으로 자동 생성.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">💡 Suggestions</h3>
            <p className="text-gray-600 text-sm">
              Formation 기반 추천. 가능한 선택지만 보여주고 근거 3줄 제공.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">📋 Install Focus</h3>
            <p className="text-gray-600 text-sm">
              플레이 → 연습 연결. Failure Point별 드릴 + 영상 레퍼런스.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
