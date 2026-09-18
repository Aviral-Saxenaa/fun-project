"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Experience, LeaderboardItem, PlatformStats, ExperienceCategory } from "@/types";
import { SearchBar } from "@/components/SearchBar";
import { ExperienceCard } from "@/components/ExperienceCard";
import { GhostScoreBadge } from "@/components/GhostScoreBadge";
import { GhostThreeCanvas } from "@/components/GhostThreeCanvas";
import { MemeTicker } from "@/components/MemeTicker";
import { AddCompanyModal } from "@/components/AddCompanyModal";
import { DoomsdayClock } from "@/components/DoomsdayClock";
import { FullscreenMemeModal } from "@/components/FullscreenMemeModal";
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
  Building2,
  TrendingUp,
} from "lucide-react";

const CATEGORIES: { label: string; value: ExperienceCategory | "all"; emoji: string }[] = [
  { label: "All Stories", value: "all", emoji: "✨" },
  { label: "Ghosting", value: "Ghosting", emoji: "👻" },
  { label: "Layoff Shock", value: "Layoff Shock", emoji: "🪓" },
  { label: "Zombie Interview", value: "Zombie Interview", emoji: "🧟" },
  { label: "Infinite Waiting", value: "Infinite Waiting", emoji: "⏳" },
  { label: "Rejected", value: "Rejected", emoji: "🚫" },
  { label: "Unpaid Assignment", value: "Unpaid Assignment", emoji: "💀" },
  { label: "Red Flag", value: "Red Flag", emoji: "🚩" },
];

const MAX_LANDING_STORIES = 6;

export default function HomePage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [leaderboardTop5, setLeaderboardTop5] = useState<LeaderboardItem[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategory | "all">("all");
  const [activeMemeCategory, setActiveMemeCategory] = useState<string | null>(null);
  const [loadingExps, setLoadingExps] = useState(true);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  // Concurrent Loading: Platform Stats & Top 5 Leaderboard
  useEffect(() => {
    let isCancelled = false;

    api.getPlatformStats()
      .then((data) => {
        if (!isCancelled) setStats(data);
      })
      .catch((err) => console.error("Stats load error:", err));

    api.getLeaderboard("trending")
      .then((board) => {
        if (!isCancelled) setLeaderboardTop5(board.slice(0, 5));
      })
      .catch((err) => console.error("Leaderboard load error:", err));

    return () => {
      isCancelled = true;
    };
  }, []);

  // Category loading for experiences feed
  useEffect(() => {
    let isCancelled = false;
    setLoadingExps(true);

    api.getExperiences({
      category: selectedCategory === "all" ? undefined : selectedCategory,
      limit: MAX_LANDING_STORIES,
    })
      .then((exps) => {
        if (!isCancelled) {
          setExperiences(exps);
        }
      })
      .catch((e) => console.error("Failed to load experiences", e))
      .finally(() => {
        if (!isCancelled) setLoadingExps(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory]);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section with 3D Three.js Ghost, Taglines, Meme Ticker & Main Search */}
      <section className="relative pt-6 md:pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* 3D Three.js Interactive Mascot Canvas */}
        <div className="relative w-full max-w-md h-64 sm:h-72 mx-auto mb-3 flex flex-col items-center justify-center">
          <GhostThreeCanvas />
          <div className="text-xs font-mono text-purple-300/70 mt-1 pointer-events-none select-none">
            ✨ Interactive 3D Mascot • Move mouse to steer, click to spin
          </div>
        </div>

        {/* Catchy Hero Title with HR Struck-Through Reality */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-xs sm:text-sm font-mono text-zinc-300 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>THE CORPORATE TRANSLATION ENGINE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1] sm:leading-[1.1]">
            <span className="block text-zinc-100">Your application will be</span>
            <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1">
              <span className="line-through decoration-zinc-500/80 decoration-4 sm:decoration-[6px] text-zinc-400">
                reviewed
              </span>
              <span className="text-red-500 underline decoration-red-500/40 decoration-4 sm:decoration-[6px]">
                ignored.
              </span>
            </span>
          </h1>

          <p className="text-lg sm:text-2xl font-extrabold text-purple-300 max-w-xl mx-auto mt-4 leading-snug">
            &ldquo;We will get back to you by EOD&rdquo;{" "}
            <span className="text-zinc-400 font-normal line-through decoration-red-500 decoration-2">
              (Never)
            </span>{" "}
            <span className="text-amber-400 font-black">GHOSTED 👻</span>
          </p>

          <p className="text-xs sm:text-sm text-zinc-400 italic max-w-md mx-auto mt-2">
            Real candidate stories of vanishing recruiters, 9-round marathons, and sudden mass layoffs.
          </p>
        </div>

        {/* Meme Ticker: Catchy Quotes */}
        <div className="mb-8">
          <MemeTicker />
        </div>

        {/* Search Bar - Centerpiece */}
        <div className="mb-7">
          <SearchBar size="large" />
        </div>

        {/* Hero Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link
            id="hero-leaderboard-btn"
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-bold bg-zinc-900 border border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600 shadow-md transition-all"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>🏆 Ghost Leaderboard</span>
          </Link>

          <Link
            id="hero-submit-btn"
            href="/submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/60 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            <span>Got Ghosted? Tell the Internet</span>
          </Link>
        </div>
      </section>

      {/* Dynamic Community Statistics Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
            {/* Stat 1 */}
            <div className="text-center pt-3 md:pt-0">
              <div className="flex items-center justify-center gap-1.5 text-zinc-300 text-sm font-semibold mb-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span>People Still Waiting</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                {stats ? stats.people_waiting.toLocaleString() : "24,821"}
              </div>
              <div className="text-xs text-zinc-400 font-mono mt-1">Still in the queue ⏳</div>
            </div>

            {/* Stat 2 */}
            <div className="text-center pt-3 md:pt-0">
              <div className="flex items-center justify-center gap-1.5 text-zinc-300 text-sm font-semibold mb-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Longest Reported Wait</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-amber-300">
                {stats ? stats.longest_wait_str : "11 months"}
              </div>
              <div className="text-xs text-zinc-400 font-mono mt-1">Legendary patience 💀</div>
            </div>

            {/* Stat 3 */}
            <div className="text-center pt-3 md:pt-0">
              <div className="flex items-center justify-center gap-1.5 text-zinc-300 text-sm font-semibold mb-1.5">
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                <span>Most Upvoted Story</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-300">
                {stats ? stats.most_upvoted_count.toLocaleString() : "18,200"}
              </div>
              <div className="text-xs text-zinc-400 font-mono mt-1">Pure candidate grief 💔</div>
            </div>

            {/* Stat 4 */}
            <div className="text-center pt-3 md:pt-0">
              <div className="flex items-center justify-center gap-1.5 text-zinc-300 text-sm font-semibold mb-1.5">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Stories Submitted</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                {stats ? stats.stories_submitted.toLocaleString() : "31,284"}
              </div>
              <div className="text-xs text-zinc-400 font-mono mt-1">Exposing the void 📨</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2040 Doomsday Clock Banner */}
      <DoomsdayClock />

      {/* Main Section: Twitter/X Style Two-Column Layout (Left: Experiences Feed, Right: Sticky Leaderboard) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Candidate Experiences Feed (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <span>Candidate Experiences</span>
                  <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/60">
                    100% Anonymous
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 mt-1">
                  Real unfiltered interview &amp; layoff encounters. Upvote &amp; comment without an account.
                </p>
              </div>

              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md self-start sm:self-auto transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Your Story</span>
              </Link>
            </div>

            {/* Category Filter Pills (includes Layoff Shock, triggers meme reaction) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-sm text-zinc-400 flex items-center gap-1.5 pr-1 shrink-0 font-medium">
                <Filter className="w-4 h-4 text-purple-400" /> Filter:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    if (cat.value !== "all") {
                      setActiveMemeCategory(cat.value);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                    selectedCategory === cat.value
                      ? "bg-purple-600 text-white shadow-md shadow-purple-950/60 font-bold"
                      : "bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Fullscreen Meme Reaction Modal triggered by Category Filter */}
            {activeMemeCategory && (
              <FullscreenMemeModal
                category={activeMemeCategory}
                onClose={() => setActiveMemeCategory(null)}
              />
            )}

            {/* Stories Feed List */}
            {loadingExps ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 animate-pulse space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800" />
                      <div className="space-y-2">
                        <div className="w-40 h-4 bg-zinc-800 rounded" />
                        <div className="w-24 h-3 bg-zinc-800 rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-3.5 bg-zinc-800 rounded" />
                      <div className="w-4/5 h-3.5 bg-zinc-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : experiences.length === 0 ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 text-center space-y-4">
                <div className="text-4xl">👻</div>
                <h3 className="text-lg font-bold text-white">No stories in this category yet</h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  Did a company vanish during this stage? Be the first to share and warn future candidates.
                </p>
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white"
                >
                  <Plus className="w-4 h-4" />
                  <span>Share Experience</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {experiences.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} showCompany={true} />
                ))}

                {/* Teaser & Link to Dedicated Stories Archive Page */}
                <div className="pt-2">
                  <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-purple-950/40 border border-purple-500/30 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-2xl shrink-0">
                        🗄️
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-purple-300 uppercase tracking-wider mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>And Many More Stories In The Vault</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-white">
                          Looking for more candidate experiences?
                        </h3>
                        <p className="text-sm text-zinc-400 max-w-md mt-0.5">
                          Explore all verified stories with custom stage filters, upvote sorting, and our 3D Ghost Radar.
                        </p>
                      </div>
                    </div>

                    <Link
                      id="explore-all-stories-btn"
                      href={`/stories${selectedCategory !== "all" ? `?category=${selectedCategory}` : ""}`}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/80 whitespace-nowrap transition-all hover:scale-105 shrink-0"
                    >
                      <span>Explore Archive &amp; 3D Radar</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Leaderboard (like X/Twitter Trends on the right) (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            
            {/* The Leaderboard Card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-base">
                    🏆
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-white">
                      Ghost Leaderboard
                    </h3>
                    <p className="text-xs text-zinc-400">Top 5 Vanishing Acts</p>
                  </div>
                </div>
                <Link
                  href="/leaderboard"
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 group"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Top 5 Companies List */}
              <div className="divide-y divide-zinc-800/70">
                {leaderboardTop5.map((comp, idx) => {
                  const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                  return (
                    <Link
                      key={comp.id}
                      href={`/company/${comp.slug}`}
                      className="py-3 px-2 flex items-start justify-between gap-3 hover:bg-zinc-800/50 rounded-2xl transition-colors group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Rank */}
                        <span className="text-sm font-bold font-mono text-zinc-400 w-5 text-center mt-1">
                          {medal}
                        </span>

                        {/* Company Logo */}
                        <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-purple-500/50 transition-colors">
                          {comp.logo_url ? (
                            <img
                              src={comp.logo_url}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <div className="font-extrabold text-base text-white group-hover:text-purple-300 transition-colors truncate">
                            {comp.name}
                          </div>
                          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <span>{comp.report_count} {comp.report_count === 1 ? "report" : "reports"}</span>
                            {comp.industry && (
                              <>
                                <span>•</span>
                                <span className="truncate">{comp.industry}</span>
                              </>
                            )}
                          </div>
                          {comp.meme_punchline && (
                            <div className="text-xs text-purple-300/80 italic line-clamp-1 mt-0.5">
                              &ldquo;{comp.meme_punchline}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ghost Score Badge */}
                      <div className="shrink-0 mt-0.5">
                        <GhostScoreBadge
                          score={comp.ghost_score}
                          label={comp.ghost_label}
                          emoji={comp.ghost_emoji}
                          size="sm"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Show more button */}
              <div className="pt-3 mt-2 border-t border-zinc-800/80">
                <Link
                  href="/leaderboard"
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-center block text-purple-300 hover:text-white bg-purple-950/30 hover:bg-purple-950/60 border border-purple-800/40 transition-all"
                >
                  Explore Complete Hall of Shame →
                </Link>
              </div>
            </div>

            {/* Quick Add Company Widget */}
            <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-3xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Missing a ghosting company?</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Add any startup, enterprise, or agency to the public registry and hold recruiters accountable.
              </p>
              <button
                type="button"
                onClick={() => setShowAddCompanyModal(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-purple-400" />
                <span>+ Add Company to Registry</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Got Ghosted? Tell the Internet CTA Banner with integrated Company Search & Add */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/70 via-zinc-900 to-purple-950/70 border border-purple-500/40 p-8 sm:p-12 text-center overflow-hidden shadow-2xl space-y-6">
          <div className="text-5xl">👻</div>
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Got Ghosted? Tell the Internet.
            </h2>
            <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              100% Anonymous. No signup. No passwords. No corporate retaliation. Expose vanishing recruiters, ghost job listings, and endless interview marathons.
            </p>
          </div>

          {/* Integrated Company Search Bar in Got Ghosted Section */}
          <div className="max-w-xl mx-auto text-left pt-2">
            <div className="text-xs sm:text-sm font-semibold text-purple-200 mb-2 text-center">
              Search any company to report or read existing experiences:
            </div>
            <SearchBar size="default" />
          </div>

          {/* Direct CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              id="cta-submit-btn"
              href="/submit"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-base font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-950/80 transition-all hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Share Your Experience</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowAddCompanyModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-base font-bold bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 shadow-md transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5 text-purple-400" />
              <span>Add New Company</span>
            </button>
          </div>
        </div>
      </section>

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <AddCompanyModal
          isOpen={showAddCompanyModal}
          onClose={() => setShowAddCompanyModal(false)}
        />
      )}
    </div>
  );
}

