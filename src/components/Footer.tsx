"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";

export function Footer() {
  const [likes, setLikes] = useState(420);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 mt-16 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Full-width Wide Screen Rectangle Banner */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="relative group w-full rounded-2xl sm:rounded-3xl p-[1.5px] bg-gradient-to-r from-amber-500/50 via-rose-500/50 to-purple-600/50 shadow-[0_0_50px_rgba(245,158,11,0.12)] hover:shadow-[0_0_70px_rgba(244,63,94,0.22)] transition-all duration-500">
          
          {/* Inner Wide Rectangle Box */}
          <div className="relative w-full rounded-[22px] bg-gradient-to-b from-zinc-900/95 via-zinc-950 to-black p-5 sm:p-7 md:p-8 overflow-hidden border border-zinc-800/80">
            
            {/* Animated Ambient Light Pulses */}
            <div className="absolute -top-24 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-xs sm:text-sm font-mono font-black tracking-wider uppercase text-amber-400">
                  LEGENDARY CORPORATE MEME • सत्य वचन 📜
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-zinc-400">
                <span className="bg-zinc-900 border border-zinc-700/80 px-3 py-1 rounded-lg">
                  POV: 2024-2040 CANDIDATE SURVIVAL
                </span>
              </div>
            </div>

            {/* Middle Section: ONLY the Iconic Hindi Devanagari Meme Dialogue */}
            <div className="my-6 sm:my-10 md:my-12 flex items-center justify-center text-center">
              <h3 className="font-devanagari text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-normal leading-tight select-none flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 drop-shadow-[0_2px_14px_rgba(245,158,11,0.4)]">
                  हम भी पेले गए थे,
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-500 to-rose-400 drop-shadow-[0_2px_14px_rgba(244,63,94,0.4)]">
                  तुम भी पेले जाओगे
                </span>
              </h3>
            </div>

            {/* Lower Action Bar */}
            <div className="pt-3 sm:pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <button
                onClick={handleLike}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                  hasLiked
                    ? "bg-red-500/20 border-red-500 text-red-300 scale-105"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800"
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? "fill-red-500 text-red-500" : ""}`} />
                <span>Us Bhai Us ({likes})</span>
              </button>

              <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs sm:text-sm">
                <span className="text-amber-400 font-bold">100% Truth</span>
                <span>•</span>
                <span>No Corporate Filter</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
