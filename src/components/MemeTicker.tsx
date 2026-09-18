"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Flame } from "lucide-react";

export const GHOST_MEMES = [
  "‘We are like a family here’ — Ha, wahi family jo property ke batwaare me baat nahi karti! 🚩",
  "Sabka katne wala hai: 2040 tak AI will interview AI and layoff AI 🤖",
  "Completed 6 rounds of interviews just for the recruiter to enter witness protection 🪦",
  "HR said 'We will be in touch Monday'... didn't specify which leap year 💀",
  "Tough market reality: Nyayene rajyam lavdenabhujvam — everyone gets served! 📜",
  "Slack deactivated at 9:01 AM after receiving 'Top Performer' badge at 8:59 AM 🪓",
  "Faster at firing 12,000 employees on a 1-minute Zoom call than sending a polite rejection email 📉",
  "Relationship status: Left on Read by 47 Fortune 500 recruiters 💔",
  "Status: 'Under Consideration'. Brother, Gandhi Ji got independence faster than this reply! ⏳",
  "Their ATS didn't just reject me, it dispatched my resume into a black hole 🌌",
  "Rejection emails are apparently locked behind a premium DLC subscription 🎮",
];

export function MemeTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % GHOST_MEMES.length);
        setFade(true);
      }, 250);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % GHOST_MEMES.length);
      setFade(true);
    }, 200);
  };

  return (
    <div
      id="ghost-meme-banner"
      className="relative max-w-3xl mx-auto px-4 py-3 sm:py-3.5 bg-gradient-to-r from-purple-950/40 via-zinc-900/80 to-purple-950/40 border border-purple-500/25 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-3 group"
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
        </span>

        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 shrink-0 hidden sm:inline">
            Savage Reality:
          </span>
          <p
            className={`text-sm sm:text-base font-medium text-zinc-100 truncate transition-opacity duration-300 ${
              fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
            }`}
          >
            &ldquo;{GHOST_MEMES[currentIndex]}&rdquo;
          </p>
        </div>
      </div>

      <button
        id="next-meme-btn"
        onClick={handleNext}
        title="Get another dose of candidate copium"
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-zinc-300 hover:text-purple-300 hover:bg-purple-950/40 transition-colors border border-zinc-800 hover:border-purple-800/40"
      >
        <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
        <span className="hidden sm:inline">Next Meme</span>
      </button>
    </div>
  );
}
