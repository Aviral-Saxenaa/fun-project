"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Experience } from "@/types";
import { api } from "@/lib/api";
import { generatePseudonym } from "@/lib/client/anonymous";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Clock,
  Briefcase,
  Layers,
  Check,
  Sparkles,
} from "lucide-react";
import { CommentSection } from "./CommentSection";
import { FullscreenMemeModal } from "./FullscreenMemeModal";

interface ExperienceCardProps {
  experience: Experience;
  showCompany?: boolean;
}

export function ExperienceCard({ experience, showCompany = true }: ExperienceCardProps) {
  const [upvotes, setUpvotes] = useState(experience.upvotes);
  const [downvotes, setDownvotes] = useState(experience.downvotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(
    experience.user_vote || null
  );
  const [showComments, setShowComments] = useState(false);
  const [showMemeModal, setShowMemeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const authorName =
    experience.author_handle ||
    generatePseudonym(experience.id + (experience.anonymous_id_hash || ""));

  const handleVote = async (type: "up" | "down") => {
    const prevVote = userVote;
    let nextVote: "up" | "down" | null = type;
    let upDelta = 0;
    let downDelta = 0;

    if (prevVote === type) {
      nextVote = null;
      if (type === "up") upDelta = -1;
      else downDelta = -1;
    } else {
      if (prevVote === "up") upDelta = -1;
      if (prevVote === "down") downDelta = -1;
      if (type === "up") upDelta += 1;
      else downDelta += 1;
    }

    // Optimistic
    setUserVote(nextVote);
    setUpvotes((prev) => Math.max(0, prev + upDelta));
    setDownvotes((prev) => Math.max(0, prev + downDelta));

    try {
      const res = await api.voteExperience(experience.id, type);
      setUpvotes(res.upvotes);
      setDownvotes(res.downvotes);
      setUserVote(res.user_vote);
    } catch (e) {
      console.error("Failed to vote", e);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/company/${experience.company_slug || ""}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "Ghosted":
        return "bg-purple-500/20 text-purple-300 border-purple-500/50";
      case "Still Waiting":
        return "bg-amber-500/20 text-amber-300 border-amber-500/50";
      case "Got Offer":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
      case "Rejected":
        return "bg-rose-500/20 text-rose-300 border-rose-500/50";
      case "Laid Off / Mass Layoff":
        return "bg-red-500/25 text-red-300 border-red-500/60";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  const getCategoryBadge = (cat?: string | null) => {
    if (!cat) return null;
    let emoji = "👻";
    let label = cat;
    if (cat === "Zombie Interview") emoji = "🧟";
    if (cat === "Infinite Waiting") emoji = "⏳";
    if (cat === "Rejected" || cat === "HR Circus") {
      emoji = "🚫";
      label = "Rejected";
    }
    if (cat === "Layoff Shock") {
      emoji = "🪓";
      label = "Layoff Shock";
    }
    if (cat === "Unpaid Assignment") emoji = "💀";
    if (cat === "Red Flag") emoji = "🚩";

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-zinc-900/90 border border-zinc-700 text-zinc-200 shadow-sm">
        <span>{emoji}</span>
        <span>{label}</span>
      </span>
    );
  };

  // Format date relative or concise
  const formattedDate = new Date(experience.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const logoUrl =
    experience.company_logo_url ||
    (experience.company_domain
      ? `https://unavatar.io/${experience.company_domain}?fallback=https://www.google.com/s2/favicons?domain=${experience.company_domain}&sz=128`
      : null);

  return (
    <div
      id={`experience-card-${experience.id}`}
      className="bg-zinc-900/90 border border-zinc-800 hover:border-purple-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xl relative group"
    >
      {/* Top Header: Company Prominent with Logo */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-700/80 flex items-center justify-center p-1.5 shadow-md shrink-0 overflow-hidden relative">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={experience.company_name || "Company"}
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                  const fallback = (e.target as HTMLElement).nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-full h-full rounded-xl bg-gradient-to-br from-purple-900/80 to-zinc-900 flex items-center justify-center text-lg font-black text-purple-200 uppercase ${
                logoUrl ? "hidden" : "flex"
              }`}
            >
              {(experience.company_name || "C").charAt(0)}
            </div>
          </div>

          {/* Company Name & Anonymous Author */}
          <div className="min-w-0">
            {showCompany && experience.company_name ? (
              <Link
                href={`/company/${experience.company_slug || ""}`}
                className="text-lg sm:text-2xl font-black text-white hover:text-purple-300 transition-colors tracking-tight block truncate"
              >
                {experience.company_name}
              </Link>
            ) : (
              <span className="text-lg sm:text-2xl font-black text-white tracking-tight block truncate">
                {experience.company_name || "Company"}
              </span>
            )}
            <div className="text-xs sm:text-sm text-zinc-400 flex items-center gap-2 mt-0.5">
              <span className="font-medium text-zinc-300">{authorName}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Badges: Outcome & Category */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold border shadow-sm ${getOutcomeBadge(
              experience.outcome
            )}`}
          >
            {experience.outcome === "Ghosted" && "👻 "}
            {experience.outcome === "Still Waiting" && "⏳ "}
            {experience.outcome === "Got Offer" && "🎉 "}
            {experience.outcome === "Rejected" && "🚫 "}
            {experience.outcome}
          </span>
          {getCategoryBadge(experience.category)}
        </div>
      </div>

      {/* Meta Bar: Stage, rounds, waiting days */}
      <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-300 mb-4 pb-3 border-b border-zinc-800 font-medium">
        <span className="inline-flex items-center gap-1.5 text-zinc-200 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
          <Briefcase className="w-4 h-4 text-purple-400" />
          <span>{experience.interview_stage}</span>
        </span>
        {experience.interview_rounds && (
          <span className="inline-flex items-center gap-1.5 text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>{experience.interview_rounds} rounds</span>
          </span>
        )}
        {experience.waiting_days && (
          <span className="inline-flex items-center gap-1.5 text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Waited {experience.waiting_days} days</span>
          </span>
        )}
      </div>

      {/* Story Content - Generous, readable typography */}
      <div className="text-zinc-100 text-base sm:text-lg leading-relaxed mb-6 whitespace-pre-line font-normal">
        &ldquo;{experience.content}&rdquo;
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {/* Upvote */}
          <button
            id={`upvote-btn-${experience.id}`}
            onClick={() => handleVote("up")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-bold transition-all ${
              userVote === "up"
                ? "bg-purple-600/30 border-purple-500 text-purple-300 shadow-md shadow-purple-950/50"
                : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:border-zinc-700"
            }`}
            title="Upvote story"
          >
            <ArrowBigUp
              className={`w-5 h-5 ${userVote === "up" ? "fill-current text-purple-400" : ""}`}
            />
            <span className="font-mono">{upvotes > 999 ? `${(upvotes / 1000).toFixed(1)}k` : upvotes}</span>
          </button>

          {/* Downvote */}
          <button
            id={`downvote-btn-${experience.id}`}
            onClick={() => handleVote("down")}
            className={`p-2 rounded-xl border text-sm transition-all ${
              userVote === "down"
                ? "bg-rose-600/30 border-rose-500 text-rose-300"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
            title={`Downvote story (${downvotes})`}
          >
            <ArrowBigDown
              className={`w-5 h-5 ${userVote === "down" ? "fill-current text-rose-400" : ""}`}
            />
          </button>

          {/* Comments toggle */}
          <button
            id={`toggle-comments-${experience.id}`}
            onClick={() => setShowComments(!showComments)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all ${
              showComments
                ? "bg-zinc-800 border-zinc-700 text-purple-300"
                : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:border-zinc-700"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{experience.comment_count || 0}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Meme Reaction Button */}
          <button
            id={`meme-btn-${experience.id}`}
            onClick={() => setShowMemeModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm transition-all group/meme"
            title="View Savage Meme Reaction"
          >
            <span className="group-hover/meme:scale-125 transition-transform text-sm">😂</span>
            <span className="hidden sm:inline">Meme React</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Copy share link"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Fullscreen Meme Reaction Modal for this story */}
      {showMemeModal && (
        <FullscreenMemeModal
          category={experience.category || "Ghosting"}
          onClose={() => setShowMemeModal(false)}
        />
      )}

      {/* Expandable Comments Drawer */}
      {showComments && (
        <CommentSection
          experienceId={experience.id}
          initialCount={experience.comment_count}
        />
      )}
    </div>
  );
}
