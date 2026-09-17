"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Flame } from "lucide-react";

export const GHOST_MEMES = [
  "This company ghosted more candidates than my toxic ex ghosted my texts 👻",
  "HR said 'We will be in touch Monday'... didn't specify which leap year 💀",
  "Completed 6 rounds of interviews just for the recruiter to enter witness protection 🪦",
  "Their Ghosting Score is officially higher than my college GPA 📉",
  "Faster at firing up AI than sending a 1-sentence polite rejection email 🤖",
  "Relationship status: Left on Read by 47 Fortune 500 recruiters 💔",
  "‘We are like a family here’ — yeah, the estranged kind that never speaks to you again 🚩",
  "Spends 45 minutes asking ‘Where do you see yourself in 5 years?’, vanishes in 5 minutes 🕳️",
  "Did a 14-hour take-home project; my code is in production, but my recruiter is in Narnia 🧟",
  "Rejection emails are apparently locked behind a premium DLC subscription 🎮",
  "Their ATS didn't just reject me, it dispatched my resume into a black hole 🌌",
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
      className="relative max-w-3xl mx-auto px-4 py-3 bg-gradient-to-r from-purple-950/40 via-zinc-900/80 to-purple-950/40 border border-purple-500/25 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-3 group"
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </span>

        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400/90 shrink-0 hidden sm:inline">
            Savage Reality:
          </span>
          <p
            className={`text-xs sm:text-sm font-medium text-zinc-200 truncate transition-opacity duration-300 ${
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
        className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-purple-300 hover:bg-purple-950/40 transition-colors border border-transparent hover:border-purple-800/40"
      >
        <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
        <span className="hidden sm:inline">Next Copium</span>
      </button>
    </div>
  );
}
