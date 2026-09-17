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
  Flag,
  Clock,
  Briefcase,
  Layers,
  Check,
} from "lucide-react";
import { CommentSection } from "./CommentSection";
import { ReportModal } from "./ReportModal";

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
  const [showReportModal, setShowReportModal] = useState(false);
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
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "Still Waiting":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Got Offer":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Rejected":
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getCategoryBadge = (cat?: string | null) => {
    if (!cat) return null;
    let emoji = "👻";
    if (cat === "Zombie Interview") emoji = "🧟";
    if (cat === "Infinite Waiting") emoji = "⏳";
    if (cat === "HR Circus") emoji = "🤡";
    if (cat === "Unpaid Assignment") emoji = "💀";
    if (cat === "Red Flag") emoji = "🚩";

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300">
        <span>{emoji}</span>
        <span>{cat}</span>
      </span>
    );
  };

  // Format date relative or concise
  const formattedDate = new Date(experience.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      id={`experience-card-${experience.id}`}
      className="bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-5 md:p-6 transition-all duration-200 shadow-lg relative group"
    >
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-sm shadow-inner">
            👻
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <span>{authorName}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500 font-normal">{formattedDate}</span>
            </div>
            {showCompany && experience.company_name && (
              <Link
                href={`/company/${experience.company_slug}`}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 mt-0.5"
              >
                <Briefcase className="w-3 h-3" />
                <span>{experience.company_name}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getOutcomeBadge(
              experience.outcome
            )}`}
          >
            {experience.outcome === "Ghosted" && "👻 "}
            {experience.outcome === "Still Waiting" && "⏳ "}
            {experience.outcome === "Got Offer" && "🎉 "}
            {experience.outcome}
          </span>
          {getCategoryBadge(experience.category)}
        </div>
      </div>

      {/* Meta Bar: Stage, rounds, waiting days */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mb-4 pb-3 border-b border-zinc-800/60 font-mono">
        <span className="inline-flex items-center gap-1 text-zinc-300">
          <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
          {experience.interview_stage}
        </span>
        {experience.interview_rounds && (
          <span className="inline-flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            {experience.interview_rounds} rounds
          </span>
        )}
        {experience.waiting_days && (
          <span className="inline-flex items-center gap-1 text-amber-300/80">
            <Clock className="w-3.5 h-3.5" />
            Waited {experience.waiting_days} days
          </span>
        )}
      </div>

      {/* Story Content */}
      <div className="text-zinc-200 text-sm md:text-base leading-relaxed mb-5 whitespace-pre-line font-normal">
        &ldquo;{experience.content}&rdquo;
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          {/* Upvote */}
          <button
            id={`upvote-btn-${experience.id}`}
            onClick={() => handleVote("up")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              userVote === "up"
                ? "bg-purple-600/30 border-purple-500 text-purple-300 shadow-md shadow-purple-950/50"
                : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
            }`}
            title="Upvote story"
          >
            <ArrowBigUp
              className={`w-4 h-4 ${userVote === "up" ? "fill-current text-purple-400" : ""}`}
            />
            <span className="font-mono">{upvotes > 999 ? `${(upvotes / 1000).toFixed(1)}k` : upvotes}</span>
          </button>

          {/* Downvote */}
          <button
            id={`downvote-btn-${experience.id}`}
            onClick={() => handleVote("down")}
            className={`p-1.5 rounded-xl border text-xs transition-all ${
              userVote === "down"
                ? "bg-rose-600/30 border-rose-500 text-rose-300"
                : "border-zinc-800 bg-zinc-950/60 text-zinc-500 hover:text-zinc-200 hover:border-zinc-700"
            }`}
            title={`Downvote story (${downvotes})`}
          >
            <ArrowBigDown
              className={`w-4 h-4 ${userVote === "down" ? "fill-current text-rose-400" : ""}`}
            />
          </button>

          {/* Comments toggle */}
          <button
            id={`toggle-comments-${experience.id}`}
            onClick={() => setShowComments(!showComments)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              showComments
                ? "bg-zinc-800 border-zinc-700 text-purple-300"
                : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{experience.comment_count || 0}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
            title="Copy share link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Report */}
          <button
            id={`report-btn-${experience.id}`}
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
            title="Report this story"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <CommentSection
          experienceId={experience.id}
          initialCount={experience.comment_count}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          experienceId={experience.id}
          itemDescription={experience.content}
        />
      )}
    </div>
  );
}
