"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Skull, Flame, Laugh, Heart } from "lucide-react";

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
    <footer className="border-t border-zinc-800/80 bg-zinc-950 mt-20 pt-12 pb-16 px-4">
      {/* Container: Not full width, centered with elegant max-width */}
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* WIDE RECTANGLE MEME CARD (Cinematic Mirzapur / Corporate Candidate Reality) */}
        <div className="relative group mx-auto max-w-3xl rounded-3xl p-1 bg-gradient-to-r from-amber-500/40 via-red-500/40 to-purple-600/40 shadow-[0_0_50px_rgba(245,158,11,0.15)] hover:shadow-[0_0_70px_rgba(245,158,11,0.3)] transition-all duration-500">
          
          {/* Inner Card - 21:9 to 16:7 Cinematic Wide Rectangle */}
          <div className="relative rounded-[22px] bg-gradient-to-b from-zinc-900/95 via-zinc-950 to-black p-6 sm:p-8 md:p-10 overflow-hidden border border-zinc-800/80 text-center">
            
            {/* Animated Ambient Light Beams */}
            <div className="absolute -top-24 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -right-20 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

            {/* Meme Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-zinc-800/70">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-mono font-black tracking-wider uppercase text-amber-400">
                  LEGENDARY CORPORATE MEME • सत्य वचन 📜
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="bg-zinc-900 border border-zinc-700 px-2.5 py-1 rounded-lg">
                  POV: 2024-2040 CANDIDATE SURVIVAL
                </span>
              </div>
            </div>

            {/* Cinematic Centerpiece Visual Illustration with Animated Float & Glow */}
            <div className="relative my-4 py-4 sm:py-6 flex flex-col items-center justify-center">
              
              {/* Dual Meme Characters Emoji / Silhouette Staging */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
                {/* Character 1: Senior Dev / Laid-off veteran */}
                <div className="flex flex-col items-center group/char">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 border-2 border-amber-500/60 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-amber-950/50 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    🪓
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 mt-2 font-bold uppercase">
                    Ex-FAANG Senior
                  </span>
                </div>

                {/* Knowing smirk bridge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl sm:text-3xl animate-bounce">
                    🤝
                  </div>
                  <span className="text-xs font-mono text-purple-400 font-bold tracking-widest mt-1">
                    SAME BOAT
                  </span>
                </div>

                {/* Character 2: Fresh Candidate who thought 8 rounds were going well */}
                <div className="flex flex-col items-center group/char">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 border-2 border-red-500/60 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-red-950/50 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    🤡
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 mt-2 font-bold uppercase">
                    Final Round Hopeful
                  </span>
                </div>
              </div>

              {/* The Iconic Punchline - Ultra Bold Cinematic Typography */}
              <div className="relative">
                <h3 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)] leading-tight">
                  &ldquo;हम भी पेले गए थे, तुम भी पेले जाओगे&rdquo;
                </h3>
              </div>

              {/* Sub-Punchline dialogue */}
              <p className="text-sm sm:text-base text-zinc-300 font-medium italic mt-3 max-w-xl mx-auto">
                Recruiter ne kaha tha &ldquo;You are the strongest candidate so far&rdquo;... 
                fir dono ko sath me layoff kar diya! 💀
              </p>
            </div>

            {/* Meme Action Bar */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                onClick={handleLike}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  hasLiked
                    ? "bg-red-500/20 border-red-500 text-red-300 scale-105"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? "fill-red-500 text-red-500" : ""}`} />
                <span>Us Bhai Us ({likes})</span>
              </button>

              <div className="flex items-center gap-2 text-zinc-400 font-mono">
                <span className="text-amber-400 font-bold">100% Truth</span>
                <span>•</span>
                <span>No Corporate Filter</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Navigation & Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-900 text-center sm:text-left text-xs sm:text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-base">👻</span>
            <span className="font-bold text-zinc-200">GHOSTED</span>
            <span>— The Anonymous Candidate Community</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <Link href="/leaderboard" className="text-zinc-400 hover:text-purple-300 transition-colors">
              Leaderboard
            </Link>
            <Link href="/stories" className="text-zinc-400 hover:text-purple-300 transition-colors">
              Stories Vault
            </Link>
            <Link href="/submit" className="text-zinc-400 hover:text-purple-300 transition-colors">
              Post Story
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
