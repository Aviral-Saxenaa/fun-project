"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trophy, Plus, Sparkles, Menu, X } from "lucide-react";
import { AddCompanyModal } from "./AddCompanyModal";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap overflow-hidden sm:overflow-visible">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-lg sm:text-2xl shadow-lg shadow-purple-950/50 group-hover:scale-105 group-hover:border-purple-400 transition-all duration-200 shrink-0">
              👻
            </div>
            <div className="flex flex-col justify-center shrink-0">
              <span className="font-black text-lg sm:text-2xl tracking-tight text-white group-hover:text-purple-300 transition-colors leading-tight whitespace-nowrap">
                GHOSTED
              </span>
              <span className="text-[10px] sm:text-xs text-zinc-400 font-mono tracking-tight line-through decoration-rose-500/90 decoration-2 whitespace-nowrap">
                &ldquo;we will get back to you&rdquo;
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links - Single Line Strict */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0 flex-nowrap">
            <Link
              id="nav-leaderboard-link"
              href="/leaderboard"
              className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 rounded-xl text-sm font-bold text-zinc-200 hover:text-white hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0"
            >
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">Leaderboard</span>
            </Link>

            <Link
              id="nav-stories-link"
              href="/stories"
              className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 rounded-xl text-sm font-bold text-zinc-200 hover:text-white hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0"
            >
              <span className="text-base shrink-0">🗄️</span>
              <span className="whitespace-nowrap">Stories Vault</span>
            </Link>

            <button
              id="nav-add-company-btn"
              onClick={() => setShowAddCompanyModal(true)}
              className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 rounded-xl text-sm font-bold text-zinc-200 hover:text-white hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="whitespace-nowrap">Add Company</span>
            </button>
          </nav>

          {/* Action CTAs - Single Line Strict */}
          <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0 flex-nowrap">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/70 text-xs font-mono text-zinc-300 whitespace-nowrap shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="whitespace-nowrap">No login • 100% Anonymous</span>
            </div>

            <Link
              id="nav-submit-experience-btn"
              href="/submit"
              className="inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/60 transition-all hover:scale-[1.02] whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Got Ghosted? Tell Us</span>
            </Link>
          </div>

          {/* Mobile Menu Button - Single Line Strict */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0 flex-nowrap">
            <Link
              href="/submit"
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white whitespace-nowrap shrink-0"
            >
              Post Story
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800/80 bg-zinc-950 p-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-base font-bold text-zinc-100 hover:bg-zinc-900"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Ghost Leaderboard</span>
            </Link>
            <Link
              href="/stories"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-base font-bold text-zinc-100 hover:bg-zinc-900"
            >
              <span className="text-lg">🗄️</span>
              <span>Stories Vault & 3D Radar</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowAddCompanyModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-base font-bold text-zinc-100 hover:bg-zinc-900 text-left"
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Add a Company</span>
            </button>
            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-base font-bold text-purple-300 hover:bg-zinc-900"
            >
              <Plus className="w-5 h-5" />
              <span>Submit Experience</span>
            </Link>
          </div>
        )}
      </header>

      {showAddCompanyModal && (
        <AddCompanyModal
          isOpen={showAddCompanyModal}
          onClose={() => setShowAddCompanyModal(false)}
        />
      )}
    </>
  );
}
