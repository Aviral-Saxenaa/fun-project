"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Experience, LeaderboardItem, PlatformStats, ExperienceCategory } from "@/types";
import { SearchBar } from "@/components/SearchBar";
import { ExperienceCard } from "@/components/ExperienceCard";
import { GhostScoreBadge } from "@/components/GhostScoreBadge";
import {
  Trophy,
  Plus,
  Flame,
  Clock,
  ThumbsUp,
  FileText,
  Users,
  Sparkles,
  ArrowRight,
  Filter,
  Loader2,
} from "lucide-react";

const CATEGORIES: { label: string; value: ExperienceCategory | "all"; emoji: string }[] = [
  { label: "All Stories", value: "all", emoji: "✨" },
  { label: "Ghosting", value: "Ghosting", emoji: "👻" },
  { label: "Zombie Interview", value: "Zombie Interview", emoji: "🧟" },
  { label: "Infinite Waiting", value: "Infinite Waiting", emoji: "⏳" },
  { label: "HR Circus", value: "HR Circus", emoji: "🤡" },
  { label: "Unpaid Assignment", value: "Unpaid Assignment", emoji: "💀" },
  { label: "Red Flag", value: "Red Flag", emoji: "🚩" },
];

export default function HomePage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [trending, setTrending] = useState<LeaderboardItem[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategory | "all">("all");
  const [loadingExps, setLoadingExps] = useState(true);

  useEffect(() => {
    async function loadStatsAndTrending() {
      try {
        const [statData, board] = await Promise.all([
          api.getPlatformStats(),
          api.getLeaderboard("trending"),
        ]);
        setStats(statData);
        setTrending(board.slice(0, 3));
      } catch (e) {
        console.error("Failed to load homepage stats", e);
      }
    }
    loadStatsAndTrending();
  }, []);

  useEffect(() => {
    async function loadExperiences() {
      setLoadingExps(true);
      try {
        const exps = await api.getExperiences({
          category: selectedCategory === "all" ? undefined : selectedCategory,
          limit: 10,
        });
        setExperiences(exps);
      } catch (e) {
        console.error("Failed to load experiences", e);
      } finally {
        setLoadingExps(false);
      }
    }
    loadExperiences();
  }, [selectedCategory]);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Mascot */}
        <div className="inline-flex items-center justify-center p-3 rounded-3xl bg-zinc-900/90 border border-purple-500/30 shadow-2xl shadow-purple-950/60 mb-6 group cursor-default">
          <span className="text-5xl md:text-6xl animate-bounce duration-1000">👻</span>
        </div>

        {/* Title & Taglines */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-4">
          GHOSTED
        </h1>

        <p className="text-xl sm:text-2xl font-bold text-purple-300 max-w-2xl mx-auto mb-2">
          They interviewed. They promised. They vanished.
        </p>

        <p className="text-sm sm:text-base text-zinc-400 italic max-w-xl mx-auto mb-8">
          &ldquo;Because apparently rejection emails are a premium feature.&rdquo;
        </p>

        <p className="text-sm text-zinc-400 mb-6 font-medium">
          Search for a company and see what candidates really experienced.
        </p>

        {/* Search Bar - Centerpiece */}
        <div className="mb-6">
          <SearchBar size="large" />
        </div>

        {/* Hero Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            id="hero-leaderboard-btn"
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-zinc-900 border border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600 shadow-md transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>🏆 Ghost Leaderboard</span>
          </Link>

          <Link
            id="hero-submit-btn"
            href="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/60 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Got Ghosted? Tell the Internet</span>
          </Link>
        </div>
      </section>

      {/* Dynamic Community Statistics Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
            {/* Stat 1 */}
            <div className="text-center pt-3 md:pt-0">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-semibold mb-1">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>People Still Waiting</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {stats ? stats.people_waiting.toLocaleString() : "24,821"}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Still in the queue ⏳</div>
            </div>

            {/* Stat 2 */}
            <div className="text-center pt-3 md:pt-0">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-semibold mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Longest Reported Wait</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                {stats ? stats.longest_wait_str : "11 months"}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Legendary patience 💀</div>
            </div>

            {/* Stat 3 */}
            <div className="text-center pt-3 md:pt-0">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-semibold mb-1">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Most Upvoted Story</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
                {stats ? stats.most_upvoted_count.toLocaleString() : "18,200"}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Pure candidate grief 💔</div>
            </div>

            {/* Stat 4 */}
            <div className="text-center pt-3 md:pt-0">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-semibold mb-1">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Stories Submitted</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {stats ? stats.stories_submitted.toLocaleString() : "31,284"}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Exposing the void 📨</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 Trending Ghosts Podium */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              🔥 Trending Ghosts
            </h2>
          </div>
          <Link
            href="/leaderboard"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 group"
          >
            <span>Full Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trending.map((comp, idx) => {
            const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
            const borderCol =
              idx === 0
                ? "border-amber-500/40 bg-amber-500/5"
                : idx === 1
                ? "border-zinc-500/40 bg-zinc-500/5"
                : "border-orange-600/40 bg-orange-600/5";

            return (
              <Link
                key={comp.id}
                href={`/company/${comp.slug}`}
                className={`p-5 rounded-2xl border ${borderCol} hover:scale-[1.01] transition-all duration-200 group relative overflow-hidden shadow-lg`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{medal}</span>
                    <span className="font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                      {comp.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">#{idx + 1}</span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60">
                  <div>
                    <div className="text-xs text-zinc-400 font-mono">
                      {comp.report_count} {comp.report_count === 1 ? "report" : "reports"}
                    </div>
                    {comp.industry && (
                      <div className="text-[11px] text-zinc-500">{comp.industry}</div>
                    )}
                  </div>
                  <GhostScoreBadge score={comp.ghost_score} label={comp.ghost_label} emoji={comp.ghost_emoji} size="sm" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Candidate Experiences Feed */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Candidate Experiences</span>
              <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                100% Anonymous
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Read real recruiter horror stories, upvote, and comment without an account.
            </p>
          </div>

          <Link
            href="/submit"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600/90 hover:bg-purple-600 text-white shadow-md self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Your Story</span>
          </Link>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <span className="text-xs text-zinc-500 flex items-center gap-1 pr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategory === cat.value
                  ? "bg-purple-600 text-white shadow-md shadow-purple-950/60 font-semibold"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Stories List */}
        {loadingExps ? (
          <div className="p-12 text-center text-sm text-zinc-400 space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto" />
            <p className="font-mono text-xs">Waiting for HR to reply... ⏳</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-10 text-center space-y-4">
            <div className="text-3xl">👻</div>
            <h3 className="text-base font-bold text-white">No stories in this category yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Did a company vanish during this stage? Be the first to share and warn future candidates.
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Share Experience</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} showCompany={true} />
            ))}
          </div>
        )}
      </section>

      {/* Got Ghosted? Tell the Internet CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/60 via-zinc-900 to-purple-950/60 border border-purple-500/30 p-8 sm:p-10 text-center overflow-hidden shadow-2xl">
          <div className="text-4xl mb-3">👻</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
            Got Ghosted? Tell the Internet.
          </h2>
          <p className="text-zinc-300 text-sm max-w-lg mx-auto mb-6">
            No signup. No login. No corporate retaliation. Expose ghosting, infinite loops, and 14-round interview marathons completely anonymously.
          </p>
          <Link
            id="cta-submit-btn"
            href="/submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-950/80 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Share Your Experience</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
