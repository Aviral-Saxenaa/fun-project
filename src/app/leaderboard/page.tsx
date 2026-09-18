"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { LeaderboardItem, LeaderboardFilter } from "@/types";
import { GhostScoreBadge } from "@/components/GhostScoreBadge";
import {
  Trophy,
  ArrowUp,
  ArrowDown,
  Search,
  Plus,
  Loader2,
  Briefcase,
} from "lucide-react";
import { AddCompanyModal } from "@/components/AddCompanyModal";

const FILTERS: { label: string; value: LeaderboardFilter; desc: string }[] = [
  { label: "Overall", value: "overall", desc: "Highest overall ghost score" },
  { label: "Most Ghosted", value: "most_ghosted", desc: "Pure volume of ghost reports" },
  { label: "Most Reported", value: "most_reported", desc: "Total community interview stories" },
  { label: "Trending", value: "trending", desc: "Spike in recent complaints" },
  { label: "Rising Ghosts", value: "rising", desc: "Newest entries breaking records" },
];

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<LeaderboardFilter>("overall");
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function fetchBoard() {
      setLoading(true);
      try {
        const res = await api.getLeaderboard(filter);
        setItems(res);
      } catch (e) {
        console.error("Failed to load leaderboard", e);
      } finally {
        setLoading(false);
      }
    }
    fetchBoard();
  }, [filter]);

  const filteredItems = searchQuery.trim()
    ? items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.industry && item.industry.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : items;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3.5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>OFFICIAL COMMUNITY RANKINGS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
          🏆 THE GHOST LEADERBOARD
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-2 text-lg sm:text-2xl font-bold">
          <span className="line-through decoration-zinc-500/80 decoration-2 text-zinc-400">
            &ldquo;we keep your profile in our active talent pool&rdquo;
          </span>
          <span className="text-rose-400 underline decoration-rose-500/40 font-black">
            GHOSTED 👻
          </span>
        </div>

        <p className="text-sm sm:text-base text-zinc-300 italic">
          Hall of Fame for corporate radio silence, 8-round marathons &amp; vanishing recruiters.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                filter === f.value
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-950/60"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search inside leaderboard & Add Company CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company or industry..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-zinc-900 border border-zinc-800 text-purple-300 hover:bg-zinc-800 hover:text-purple-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Unlisted Ghost</span>
            </button>

            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-md"
            >
              <span>Submit Story</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
          <p className="font-mono text-xs text-zinc-400">Waiting for HR to reply... ⏳</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <div className="text-3xl">👻</div>
          <p className="text-sm font-bold text-zinc-200">No companies found</p>
          <p className="text-xs text-zinc-500">
            Looks like this company hasn&apos;t been exposed yet. 👀
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add this company</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const rank = index + 1;
            const rankMedal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

            return (
              <Link
                key={item.id}
                href={`/company/${item.slug}`}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 gap-4 group ${
                  rank === 1
                    ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50"
                    : rank === 2
                    ? "bg-zinc-800/20 border-zinc-700/50 hover:border-zinc-600"
                    : rank === 3
                    ? "bg-orange-600/5 border-orange-600/30 hover:border-orange-600/50"
                    : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                {/* Left: Rank & Company Info */}
                <div className="flex items-center gap-4">
                  {/* Rank indicator */}
                  <div className="flex flex-col items-center justify-center w-10 text-center">
                    {rankMedal ? (
                      <span className="text-2xl leading-none">{rankMedal}</span>
                    ) : (
                      <span className="font-mono font-black text-lg text-zinc-400">
                        #{rank}
                      </span>
                    )}

                    {/* Shift badge */}
                    <div className="mt-1 flex items-center text-[10px] font-mono font-bold">
                      {item.rank_change === "up" && (
                        <span className="text-emerald-400 flex items-center">
                          <ArrowUp className="w-2.5 h-2.5" />
                          {item.rank_shift || 1}
                        </span>
                      )}
                      {item.rank_change === "down" && (
                        <span className="text-rose-400 flex items-center">
                          <ArrowDown className="w-2.5 h-2.5" />
                          {item.rank_shift || 1}
                        </span>
                      )}
                      {item.rank_change === "new" && (
                        <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px]">
                          NEW
                        </span>
                      )}
                      {item.rank_change === "same" && (
                        <span className="text-zinc-600">-</span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      {item.logo_url ? (
                        <img
                          src={item.logo_url}
                          alt=""
                          className="w-8 h-8 rounded-lg bg-zinc-900 object-contain p-0.5 border border-zinc-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : null}

                      <span className="font-black text-lg sm:text-xl text-white group-hover:text-purple-300 transition-colors">
                        {item.name}
                      </span>
                      {item.top_category && (
                        <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
                          {item.top_category}
                        </span>
                      )}
                    </div>

                    {item.meme_punchline && (
                      <div className="text-sm text-purple-300 font-medium italic line-clamp-1">
                        &ldquo;{item.meme_punchline}&rdquo;
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300">
                      {item.industry && (
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                          {item.industry}
                        </span>
                      )}
                      <span className="font-mono text-purple-300 font-bold">
                        {item.report_count} {item.report_count === 1 ? "report" : "reports"}
                      </span>
                      {item.avg_waiting_days > 0 && (
                        <span className="hidden sm:inline font-mono text-zinc-400">
                          • avg wait {item.avg_waiting_days}d
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Score Badge */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                  <span className="text-xs text-zinc-500 sm:hidden">Ghost Score:</span>
                  <GhostScoreBadge
                    score={item.ghost_score}
                    label={item.ghost_label}
                    emoji={item.ghost_emoji}
                    size="sm"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddCompanyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
