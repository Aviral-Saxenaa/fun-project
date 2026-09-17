"use client";

import React from "react";

interface GhostScoreBadgeProps {
  score: number;
  label?: string;
  emoji?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function GhostScoreBadge({
  score,
  label,
  emoji,
  size = "md",
  showLabel = true,
}: GhostScoreBadgeProps) {
  const getBadgeStyle = (val: number) => {
    if (val <= 20) {
      return {
        bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        ring: "text-emerald-400",
        accent: "text-emerald-400",
        defaultEmoji: "👼",
        defaultLabel: "Surprisingly Responsive",
      };
    }
    if (val <= 40) {
      return {
        bg: "bg-sky-500/10 border-sky-500/30 text-sky-400",
        ring: "text-sky-400",
        accent: "text-sky-400",
        defaultEmoji: "🙂",
        defaultLabel: "Mostly Responsive",
      };
    }
    if (val <= 60) {
      return {
        bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        ring: "text-amber-400",
        accent: "text-amber-400",
        defaultEmoji: "😐",
        defaultLabel: "Could Be Better",
      };
    }
    if (val <= 80) {
      return {
        bg: "bg-purple-500/15 border-purple-500/40 text-purple-300",
        ring: "text-purple-400",
        accent: "text-purple-400",
        defaultEmoji: "👻",
        defaultLabel: "Getting Ghosty",
      };
    }
    return {
      bg: "bg-rose-500/15 border-rose-500/40 text-rose-400",
      ring: "text-rose-400",
      accent: "text-rose-400",
      defaultEmoji: "💀",
      defaultLabel: "Professional Ghost",
    };
  };

  const style = getBadgeStyle(score);
  const displayLabel = label || style.defaultLabel;
  const displayEmoji = emoji || style.defaultEmoji;

  if (size === "sm") {
    return (
      <span
        id={`ghost-score-badge-${score}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${style.bg}`}
      >
        <span>{displayEmoji}</span>
        <span className="font-mono font-bold">{score}</span>
        {showLabel && <span className="text-[11px] opacity-90">• {displayLabel}</span>}
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div
        id={`ghost-score-badge-large-${score}`}
        className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${style.bg} backdrop-blur-md`}
      >
        <div className="text-4xl mb-2">{displayEmoji}</div>
        <div className="text-xs uppercase tracking-widest font-mono text-zinc-400 mb-1">
          GHOST SCORE
        </div>
        <div className="text-5xl font-black font-mono tracking-tight text-white mb-2">
          {score}
          <span className="text-xl text-zinc-500 font-normal"> / 100</span>
        </div>
        {showLabel && (
          <div className="text-sm font-semibold tracking-wide px-3 py-1 rounded-full bg-black/40 border border-white/10 text-white">
            &ldquo;{displayLabel}&rdquo;
          </div>
        )}
      </div>
    );
  }

  // Medium (default)
  return (
    <div
      id={`ghost-score-badge-med-${score}`}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium ${style.bg}`}
    >
      <span className="text-base">{displayEmoji}</span>
      <span className="font-mono font-bold text-white text-base">{score}</span>
      <span className="text-xs text-zinc-400">/ 100</span>
      {showLabel && (
        <span className="text-xs font-semibold pl-1 border-l border-zinc-700/60">
          {displayLabel}
        </span>
      )}
    </div>
  );
}
