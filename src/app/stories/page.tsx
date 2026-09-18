"use client";

import React, { useState, useEffect, useMemo, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Experience, ExperienceCategory } from "@/types";
import { ExperienceCard } from "@/components/ExperienceCard";
import { GhostArchiveRadar3D } from "@/components/GhostArchiveRadar3D";
import {
  Flame,
  Search,
  Plus,
  ArrowLeft,
  Filter,
  Loader2,
  Clock,
  ThumbsUp,
  Sparkles,
  ShieldCheck,
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

type SortOption = "upvotes" | "recent" | "waiting";

function StoriesArchiveInner() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as ExperienceCategory) || "all";

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategory | "all">(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("upvotes");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const PAGE_CHUNK = 6;

  // Fetch initial batch
  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const data = await api.getExperiences({
          category: selectedCategory === "all" ? undefined : selectedCategory,
          limit: 50,
        });
        if (!isCancelled) {
          setExperiences(data);
          setPage(1);
        }
      } catch (e) {
        console.error("Failed to load archive stories", e);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [selectedCategory]);

  // Filter & Sort (client-side fast yield)
  const filteredAndSorted = useMemo(() => {
    let list = [...experiences];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (exp) =>
          exp.content.toLowerCase().includes(q) ||
          exp.company_name?.toLowerCase().includes(q) ||
          exp.interview_stage.toLowerCase().includes(q) ||
          exp.outcome.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === "upvotes") {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === "recent") {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "waiting") {
      list.sort((a, b) => (b.waiting_days || 0) - (a.waiting_days || 0));
    }

    return list;
  }, [experiences, searchQuery, sortBy]);

  // Progressive chunking (user sees items in fast chunks without UI freeze)
  const visibleStories = useMemo(() => {
    return filteredAndSorted.slice(0, page * PAGE_CHUNK);
  }, [filteredAndSorted, page]);

  const hasMore = visibleStories.length < filteredAndSorted.length;

  const handleLoadMore = () => {
    startTransition(() => {
      setPage((prev) => prev + 1);
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Anonymous Vault</span>
        </div>
      </div>

      {/* Hero Header with 3D Radar Mascot */}
      <div className="relative rounded-3xl bg-gradient-to-b from-purple-950/40 via-zinc-900/80 to-zinc-950 border border-purple-500/30 p-6 sm:p-10 text-center overflow-hidden shadow-2xl">
        <div className="max-w-md mx-auto mb-2">
          <GhostArchiveRadar3D />
          <div className="text-[11px] font-mono text-purple-300/60 pointer-events-none select-none">
            ⚡ Interactive 3D Ghost Radar • Move cursor to navigate anonymous signals
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
          THE GHOST ARCHIVE 🗄️
        </h1>
        <p className="text-base sm:text-lg text-purple-200 font-medium max-w-xl mx-auto mb-6">
          Unfiltered candidate testimonies from the hiring trenches. Real interviews, vanishing recruiters, and zero corporate spin.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/80 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Expose Another Company</span>
          </Link>

          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 transition-all"
          >
            <span>View Ghost Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* Filter & Controls Panel */}
      <div className="space-y-4 bg-zinc-900/60 border border-zinc-800/80 p-4 sm:p-6 rounded-2xl">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies, keywords, stages, or recruiters..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
            <button
              onClick={() => setSortBy("upvotes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                sortBy === "upvotes"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Top Upvoted</span>
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                sortBy === "recent"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Newest</span>
            </button>
            <button
              onClick={() => setSortBy("waiting")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                sortBy === "waiting"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Longest Wait</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-zinc-500 flex items-center gap-1 pr-1 shrink-0 font-mono">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategory === cat.value
                  ? "bg-purple-600 text-white shadow-md shadow-purple-950/60 font-semibold"
                  : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Live Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800/60">
          <span>
            Showing <strong className="text-purple-300">{visibleStories.length}</strong> of{" "}
            <strong className="text-white">{filteredAndSorted.length}</strong> stories
          </span>
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-purple-400 hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {/* Stories Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800" />
                <div className="space-y-1.5">
                  <div className="w-32 h-3.5 bg-zinc-800 rounded" />
                  <div className="w-20 h-2.5 bg-zinc-800 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-zinc-800 rounded" />
                <div className="w-4/5 h-3 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center space-y-4">
          <div className="text-4xl">👻</div>
          <h3 className="text-lg font-bold text-white">No stories matched your filters</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleStories.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} showCompany={true} />
          ))}

          {/* Progressive Yield / Chunk Loader */}
          {hasMore ? (
            <div className="pt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-700 hover:border-purple-500/60 hover:bg-zinc-800 text-zinc-100 transition-all shadow-lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    <span>Loading next batch...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Load More ({filteredAndSorted.length - visibleStories.length} remaining)
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="pt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-400">
                <span>✨ You have reached the end of the archive ({filteredAndSorted.length} stories total).</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StoriesArchivePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
          <p className="font-mono text-sm text-zinc-400">Loading Ghost Archive Vault... 👻</p>
        </div>
      }
    >
      <StoriesArchiveInner />
    </Suspense>
  );
}
