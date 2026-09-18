"use client";

import React, { useEffect, useState } from "react";
import { MEME_REACTIONS, MemeReaction } from "@/lib/memes";
import { X, Sparkles, Volume2 } from "lucide-react";

interface FullscreenMemeModalProps {
  category: string;
  onClose: () => void;
  autoCloseSec?: number;
}

export function FullscreenMemeModal({
  category,
  onClose,
  autoCloseSec = 5,
}: FullscreenMemeModalProps) {
  const meme: MemeReaction =
    MEME_REACTIONS[category] || MEME_REACTIONS["Ghosting"];
  const [secondsLeft, setSecondsLeft] = useState(autoCloseSec);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Background card with category gradient */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl p-6 sm:p-10 border-2 border-amber-500/50 bg-gradient-to-br ${meme.bgGradient} shadow-[0_0_80px_rgba(245,158,11,0.25)] text-center overflow-hidden`}
      >
        {/* Close Button & Timer */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-300/80 bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-700">
            Auto closing in {secondsLeft}s
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Meme Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{meme.badge}</span>
        </div>

        {/* Big Meme Emoji Mascot */}
        <div className="text-6xl sm:text-7xl mb-3 animate-bounce select-none">
          {meme.emoji}
        </div>

        {/* Punchy Title */}
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
          {meme.title}
        </h2>

        {/* Dialogue Box */}
        <div className="bg-black/60 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 my-4 text-amber-200 font-bold text-base sm:text-xl leading-relaxed shadow-inner">
          &ldquo;{meme.dialogue}&rdquo;
        </div>

        {/* Hindi Punchline */}
        {meme.hindiQuote && (
          <p className="text-sm sm:text-base text-zinc-300 font-medium italic mt-2">
            {meme.hindiQuote}
          </p>
        )}

        {/* Sanskrit Corporate Reality Motto */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>न्यायेन राज्यं लवण्डेन भुज्यते 📜</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md transition-all font-sans"
          >
            Back to Stories 🏃‍♂️
          </button>
        </div>
      </div>
    </div>
  );
}
