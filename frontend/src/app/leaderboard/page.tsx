"use client"

import { useState, useEffect } from "react"
import { Trophy, Ghost, TrendingUp, ArrowUp, ArrowDown, Sparkles } from "lucide-react"
import CompanyCard from "@/components/CompanyCard"
import { apiFetch } from "@/lib/api"
import type { LeaderboardEntry } from "@/types"

type Filter = "overall" | "most_ghosted" | "most_reported" | "trending"

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [filter, setFilter] = useState<Filter>("overall")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiFetch("/api/companies/leaderboard?limit=50")
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = [...entries].sort((a, b) => {
    if (filter === "most_reported") return b.report_count - a.report_count
    return b.ghost_score - a.ghost_score
  })

  const filters: { key: Filter; label: string }[] = [
    { key: "overall", label: "Overall" },
    { key: "most_ghosted", label: "Most Ghosted" },
    { key: "most_reported", label: "Most Reported" },
    { key: "trending", label: "Trending" },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">THE GHOST LEADERBOARD</h1>
        <p className="text-gray-400 text-lg">&ldquo;The companies candidates are still waiting to hear from.&rdquo;</p>
        <p className="text-gray-600 text-sm mt-2">Congratulations to this week&apos;s biggest ghosts.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                : "bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Ghost className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-500">Waiting for HR to reply...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((entry, i) => (
            <CompanyCard
              key={entry.id}
              rank={i + 1}
              name={entry.name}
              slug={entry.slug}
              ghostScore={entry.ghost_score}
              reportCount={entry.report_count}
              emoji={entry.ghost_emoji}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <Ghost className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No ghosts detected... yet.</p>
        </div>
      )}
    </div>
  )
}
