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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-xl shadow-lg shadow-purple-950/50 group-hover:scale-105 group-hover:border-purple-400 transition-all duration-200">
              👻
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-white group-hover:text-purple-300 transition-colors">
                GHOSTED
              </span>
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline tracking-wide">
                ANONYMOUS LEADERBOARD
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              id="nav-leaderboard-link"
              href="/leaderboard"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </Link>

            <Link
              id="nav-stories-link"
              href="/stories"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <span className="text-sm">🗄️</span>
              <span>Stories Vault</span>
            </Link>

            <button
              id="nav-add-company-btn"
              onClick={() => setShowAddCompanyModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Add Company</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-[11px] font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>No login • 100% Anonymous</span>
            </div>

            <Link
              id="nav-submit-experience-btn"
              href="/submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/60 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Got Ghosted? Tell Us</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/submit"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white"
            >
              Post Story
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900"
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
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Ghost Leaderboard</span>
            </Link>
            <Link
              href="/stories"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              <span className="text-sm">🗄️</span>
              <span>Stories Vault & 3D Radar</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowAddCompanyModal(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-200 hover:bg-zinc-900 text-left"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Add a Company</span>
            </button>
            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-300 hover:bg-zinc-900"
            >
              <Plus className="w-4 h-4" />
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
