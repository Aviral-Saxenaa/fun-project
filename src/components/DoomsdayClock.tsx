"use client";

import React, { useState, useEffect } from "react";
import { Clock, Skull, AlertTriangle, Sparkles, X } from "lucide-react";

export function DoomsdayClock() {
  const [collapsed, setCollapsed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    years: 13,
    days: 104,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const target = new Date("2040-01-01T00:00:00Z").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const secondsTotal = Math.floor(diff / 1000);
      const daysTotal = Math.floor(secondsTotal / 86400);
      const years = Math.floor(daysTotal / 365.25);
      const days = Math.floor(daysTotal % 365.25);
      const hours = Math.floor((secondsTotal % 86400) / 3600);
      const minutes = Math.floor((secondsTotal % 3600) / 60);
      const seconds = Math.floor(secondsTotal % 60);

      setTimeLeft({ years, days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 left-4 z-40 bg-zinc-900/90 border border-amber-500/50 hover:border-amber-400 px-3.5 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-mono font-bold text-amber-300 hover:scale-105 transition-all group"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <span>⏳ 2040 Doomsday Clock: सबका कटने वाला है</span>
      </button>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-6">
      <div className="relative rounded-3xl bg-gradient-to-r from-red-950/70 via-zinc-950 to-amber-950/70 border border-amber-500/40 p-3.5 sm:p-5 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Ambient pulse glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-3.5">
          {/* Headline & Sanskrit/Hindi Motto */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 text-center md:text-left w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                ⏳
              </div>
              <div className="text-left min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-black uppercase bg-red-950/80 border border-red-500/50 text-red-300 animate-pulse">
                    🔥 2040 REVERSE TICKER
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    सबका कटने वाला है 💀
                  </span>
                </div>
                <h4 className="text-xs sm:text-base font-black text-white truncate">
                  <span>&ldquo;न्यायेन राज्यं लवण्डेन भुज्यते&rdquo;</span>
                </h4>
              </div>
            </div>

            {/* Collapse button for mobile top-right */}
            <button
              onClick={() => setCollapsed(true)}
              className="md:hidden text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
              title="Minimize clock"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Realtime Countdown Blocks (No API load, pure client math) */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 font-mono w-full md:w-auto">
            <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 text-center min-w-[42px] sm:min-w-[50px] flex-1 sm:flex-initial">
              <div className="text-base sm:text-xl font-black text-amber-400 leading-tight">
                {timeLeft.years}
              </div>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-zinc-400">Yrs</div>
            </div>

            <span className="text-amber-500/60 font-bold text-xs sm:text-base">:</span>

            <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 text-center min-w-[42px] sm:min-w-[50px] flex-1 sm:flex-initial">
              <div className="text-base sm:text-xl font-black text-amber-300 leading-tight">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-zinc-400">Days</div>
            </div>

            <span className="text-amber-500/60 font-bold text-xs sm:text-base">:</span>

            <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 text-center min-w-[42px] sm:min-w-[50px] flex-1 sm:flex-initial">
              <div className="text-base sm:text-xl font-black text-amber-200 leading-tight">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-zinc-400">Hrs</div>
            </div>

            <span className="text-amber-500/60 font-bold text-xs sm:text-base">:</span>

            <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 text-center min-w-[42px] sm:min-w-[50px] flex-1 sm:flex-initial">
              <div className="text-base sm:text-xl font-black text-amber-100 leading-tight">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-zinc-400">Min</div>
            </div>

            <span className="text-amber-500/60 font-bold text-xs sm:text-base">:</span>

            <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 text-center min-w-[42px] sm:min-w-[50px] flex-1 sm:flex-initial">
              <div className="text-base sm:text-xl font-black text-red-400 leading-tight">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-zinc-400">Sec</div>
            </div>

            {/* Desktop collapse button */}
            <button
              onClick={() => setCollapsed(true)}
              className="hidden md:block ml-2 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              title="Minimize clock"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
