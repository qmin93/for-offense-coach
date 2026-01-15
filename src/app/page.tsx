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
          Formation → Concept Recommendation → Instant Diagram → Export/Share
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
              20 Pass + 20 Run concept templates. Auto-generate with one click.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">💡 Suggestions</h3>
            <p className="text-gray-600 text-sm">
              Formation-based recommendations. Shows only valid options with 3-line reasoning.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">📋 Install Focus</h3>
            <p className="text-gray-600 text-sm">
              Play to practice connection. Drills + video references for each failure point.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
