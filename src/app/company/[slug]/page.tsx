"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { CompanyDetail, Experience, ExperienceCategory } from "@/types";
import { GhostScoreBadge } from "@/components/GhostScoreBadge";
import { ExperienceCard } from "@/components/ExperienceCard";
import {
  Globe,
  Briefcase,
  AlertTriangle,
  Plus,
  ArrowLeft,
  Clock,
  FileText,
  Skull,
  Loader2,
  Filter,
} from "lucide-react";

const CATEGORIES: { label: string; value: ExperienceCategory | "all"; emoji: string }[] = [
  { label: "All", value: "all", emoji: "✨" },
  { label: "Ghosting", value: "Ghosting", emoji: "👻" },
  { label: "Zombie Interview", value: "Zombie Interview", emoji: "🧟" },
  { label: "Infinite Waiting", value: "Infinite Waiting", emoji: "⏳" },
  { label: "HR Circus", value: "HR Circus", emoji: "🤡" },
  { label: "Unpaid Assignment", value: "Unpaid Assignment", emoji: "💀" },
  { label: "Red Flag", value: "Red Flag", emoji: "🚩" },
];

export default function CompanyDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;

  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategory | "all">("all");

  useEffect(() => {
    if (!slug) return;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const compDetail = await api.getCompany(slug);
        setDetail(compDetail);

        const exps = await api.getExperiences({
          company_id: compDetail.company.id,
          category: selectedCategory === "all" ? undefined : selectedCategory,
        });
        setExperiences(exps);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Company not found");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, selectedCategory]);

  if (loading && !detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
        <p className="font-mono text-sm text-zinc-400">Waiting for HR to reply... ⏳</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-4xl">👻</div>
        <h2 className="text-2xl font-bold text-white">This page ghosted you.</h2>
        <p className="text-sm text-zinc-400">
          No ghost records found for &ldquo;{slug}&rdquo;. Maybe they haven&apos;t been exposed yet.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-700 text-zinc-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Home</span>
          </button>
          <Link
            href={`/submit?company_name=${encodeURIComponent(slug || "")}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Be the first to post</span>
          </Link>
        </div>
      </div>
    );
  }

  const { company, ghost_score, ghost_label, ghost_emoji, stats } = detail;

  // Format longest wait
  const longestWaitStr =
    stats.longest_wait_days >= 300
      ? `${Math.round(stats.longest_wait_days / 30)} months`
      : `${stats.longest_wait_days} days`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to search &amp; leaderboard</span>
      </Link>

      {/* Company Header Card */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Company Title & Info */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{company.name}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-400">
              {company.industry && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
                  <Briefcase className="w-3 h-3 text-zinc-500" />
                  {company.industry}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-purple-400 hover:text-purple-300 hover:border-purple-500/50 transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  <span>Website</span>
                </a>
              )}
            </div>

            {/* Disclaimer pill */}
            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
              <AlertTriangle className="w-3 h-3 text-amber-500/80 shrink-0" />
              <span>Based on anonymous community reports. Not official corporate metrics.</span>
            </div>
          </div>

          {/* Large Ghost Score Display */}
          <div className="shrink-0 flex justify-center md:justify-end">
            <GhostScoreBadge
              score={ghost_score}
              label={ghost_label}
              emoji={ghost_emoji}
              size="lg"
            />
          </div>
        </div>

        {/* Dynamic Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 mb-1">
              <span>👻</span>
              <span>Ghost Reports</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{stats.ghost_reports}</div>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 mb-1">
              <FileText className="w-3 h-3 text-sky-400" />
              <span>Total Experiences</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{stats.total_reports}</div>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 mb-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Avg. Waiting</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-300">
              {stats.avg_waiting_days > 0 ? `${stats.avg_waiting_days} days` : "—"}
            </div>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 mb-1">
              <Skull className="w-3 h-3 text-rose-400" />
              <span>Longest Wait</span>
            </div>
            <div className="text-xl font-bold font-mono text-rose-300">
              {stats.longest_wait_days > 0 ? longestWaitStr : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-white">Interviewed at {company.name}?</h3>
          <p className="text-xs text-zinc-400">
            Tell future applicants what happened. 100% anonymous, zero login.
          </p>
        </div>
        <Link
          id="company-submit-story-btn"
          href={`/submit?company_id=${company.id}&company_name=${encodeURIComponent(company.name)}`}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/50 transition-all shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Post Experience with {company.name}</span>
        </Link>
      </div>

      {/* Candidate Stories Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Candidate Stories</span>
            <span className="text-xs font-normal text-zinc-400 font-mono">
              ({experiences.length})
            </span>
          </h2>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-zinc-500 flex items-center gap-1 pr-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategory === cat.value
                  ? "bg-purple-600 text-white shadow font-semibold"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {experiences.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-10 text-center space-y-3">
            <div className="text-3xl">👻</div>
            <p className="text-sm font-semibold text-zinc-300">
              No stories found in this category for {company.name}.
            </p>
            <p className="text-xs text-zinc-500">
              Did they ghost you or send you on a wild goose chase?
            </p>
            <Link
              href={`/submit?company_id=${company.id}&company_name=${encodeURIComponent(company.name)}`}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share your experience</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} showCompany={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
