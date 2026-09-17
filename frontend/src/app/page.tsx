"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Ghost, Trophy, Users, Clock, Flame, Mail } from "lucide-react"
import SearchBar from "@/components/SearchBar"
import CompanyCard from "@/components/CompanyCard"
import { apiFetch } from "@/lib/api"
import type { LeaderboardEntry } from "@/types"

export default function HomePage() {
  const [trending, setTrending] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState({ stories: 0, waiting: 0, longest: 0, topVotes: 0 })

  useEffect(() => {
    apiFetch("/api/companies/leaderboard?limit=6").then(setTrending).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-8xl mb-6 animate-bounce">👻</div>
          <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter mb-6">
            GHOSTED
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 font-light mb-2">
            They interviewed. They promised.
          </p>
          <p className="text-xl sm:text-2xl text-gray-300 font-light mb-2">
            They vanished.
          </p>
          <p className="text-sm text-gray-500 mt-4 mb-10 italic">
            &ldquo;Because apparently rejection emails are a premium feature.&rdquo;
          </p>

          <SearchBar />

          <div className="mt-8">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <Trophy className="w-5 h-5" />
              Ghost Leaderboard
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "People Still Waiting", value: stats.waiting || "24,821", color: "text-purple-400" },
            { icon: Clock, label: "Longest Reported Wait", value: stats.longest ? `${stats.longest} days` : "11 months", color: "text-red-400" },
            { icon: Flame, label: "Most Upvoted Story", value: stats.topVotes ? `${stats.topVotes} votes` : "18.2K", color: "text-orange-400" },
            { icon: Mail, label: "Stories Submitted", value: stats.stories ? stats.stories.toLocaleString() : "31,284", color: "text-blue-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <Flame className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Trending Ghosts</h2>
        </div>
        {trending.length > 0 ? (
          <div className="grid gap-4">
            {trending.slice(0, 6).map((entry, i) => (
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
          <div className="text-center py-12 text-gray-500">
            <Ghost className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No ghosts detected... yet.</p>
          </div>
        )}
      </section>

      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">👻</div>
        <h2 className="text-3xl font-bold text-white mb-3">Got Ghosted?</h2>
        <p className="text-gray-400 mb-8">Tell the internet.</p>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
        >
          Share Your Experience
        </Link>
      </section>
    </div>
  )
}
