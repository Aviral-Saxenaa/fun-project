import React from "react";
import Link from "next/link";
import { Trophy, ShieldCheck, Flag } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950/90 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & philosophy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👻</span>
              <span className="font-black text-lg tracking-tight text-white">GHOSTED</span>
            </div>
            <p className="text-sm font-semibold text-zinc-300">
              &ldquo;They interviewed. They promised. They vanished.&rdquo;
            </p>
            <p className="text-xs text-zinc-400 italic">
              &ldquo;Because apparently rejection emails are a premium feature.&rdquo;
            </p>
          </div>

          {/* Quick navigation */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Community Navigation
            </div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li>
                <Link
                  href="/leaderboard"
                  className="hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>The Ghost Leaderboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                >
                  <span>👻 Share Your Experience</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Content Moderation &amp; Admin</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Frictionless Privacy Promise */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Frictionless Privacy
            </div>
            <div className="text-xs text-zinc-400 space-y-1.5">
              <p>
                <strong className="text-zinc-200">NO SIGN UP. NO LOGIN. NO EMAIL. NO PASSWORD.</strong>
              </p>
              <p className="leading-relaxed">
                Candidate experiences are shared anonymously using client-side device hashes. No personal profiles are ever created or tracked.
              </p>
              <p className="text-[11px] text-zinc-500 pt-1 flex items-center gap-1">
                <Flag className="w-3 h-3 text-zinc-500" />
                Moderated community. Doxxing and personal data strictly removed.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} Ghosted. All community experiences are candidate submissions.</p>
          <p className="font-mono text-[11px] text-zinc-400">
            Waiting for HR to reply... ⏳
          </p>
        </div>
      </div>
    </footer>
  );
}
