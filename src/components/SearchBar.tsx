"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Company } from "@/types";
import { Search, Plus, Loader2, Globe } from "lucide-react";
import { AddCompanyModal } from "./AddCompanyModal";

interface SearchBarProps {
  placeholder?: string;
  size?: "default" | "large";
}

interface InternetLookupResult {
  name: string;
  domain: string;
  website: string;
  industry: string;
  logo_url: string;
  meme_punchline: string;
  existing_slug: string | null;
  existing_id: string | null;
}

export function SearchBar({
  placeholder = "Which company ghosted you? (e.g. Google, Amazon, Meta, Spotify...)",
  size = "default",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [internetResult, setInternetResult] = useState<InternetLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [addingInternet, setAddingInternet] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search (both local DB & live internet logo resolution)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [localMatches, internetLookupRes] = await Promise.all([
          api.searchCompanies(trimmed).catch(() => []),
          fetch(`/api/companies/lookup?q=${encodeURIComponent(trimmed)}`)
            .then((r) => r.json())
            .then((d) => d.found as InternetLookupResult | null)
            .catch(() => null),
        ]);

        setResults(localMatches);
        setInternetResult(internetLookupRes);
      } catch (e) {
        console.error("Search error", e);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCompany = (slug: string) => {
    setOpenDropdown(false);
    setQuery("");
    router.push(`/company/${slug}`);
  };

  const handleSelectInternetResult = async (item: InternetLookupResult) => {
    if (item.existing_slug) {
      handleSelectCompany(item.existing_slug);
      return;
    }

    try {
      setAddingInternet(true);
      const res = await fetch(`/api/companies/lookup?q=${encodeURIComponent(item.name)}&auto_add=true`);
      const data = await res.json();
      if (data.found?.existing_slug) {
        handleSelectCompany(data.found.existing_slug);
      } else {
        router.push(`/company/${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`);
      }
    } catch (err) {
      console.error("Failed to auto-add internet company:", err);
      setShowAddModal(true);
    } finally {
      setAddingInternet(false);
    }
  };

  const isLarge = size === "large";

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div
        className={`relative flex items-center bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl shadow-xl transition-all focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 backdrop-blur-md ${
          isLarge ? "p-2 pl-4" : "p-1 pl-3"
        }`}
      >
        <Search
          className={`shrink-0 text-zinc-400 mr-2.5 ${
            isLarge ? "w-6 h-6 text-purple-400" : "w-4 h-4"
          }`}
        />
        <input
          id="search-company-input"
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (!val.trim()) {
              setResults([]);
              setInternetResult(null);
              setOpenDropdown(false);
              setLoading(false);
            } else {
              setOpenDropdown(true);
            }
          }}
          onFocus={() => {
            if (query.trim()) setOpenDropdown(true);
          }}
          placeholder={placeholder}
          className={`w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none ${
            isLarge ? "text-base md:text-lg py-2" : "text-sm py-1.5"
          }`}
        />
        {loading && (
          <Loader2
            className={`animate-spin text-purple-400 mr-2 shrink-0 ${
              isLarge ? "w-5 h-5" : "w-4 h-4"
            }`}
          />
        )}
      </div>

      {/* Dropdown Results */}
      {openDropdown && query.trim().length > 0 && (
        <div
          id="search-results-dropdown"
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-zinc-800/60"
        >
          {loading && results.length === 0 && !internetResult ? (
            <div className="p-6 text-center text-sm text-zinc-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>Scanning internet & candidate archives...</span>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto p-1.5 space-y-1">
              {/* Existing Database Matches */}
              {results.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Exposed Companies
                  </div>
                  {results.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => handleSelectCompany(comp.slug)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        {comp.logo_url ? (
                          <img
                            src={comp.logo_url}
                            alt=""
                            className="w-8 h-8 rounded-lg bg-zinc-800 object-contain p-0.5 border border-zinc-700"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-xs font-bold text-purple-300">
                            {comp.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors text-sm">
                            {comp.name}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {comp.report_count} {comp.report_count === 1 ? "report" : "reports"}
                            {comp.industry ? ` • ${comp.industry}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-zinc-200">
                            {comp.ghost_emoji} {comp.ghost_score}
                          </div>
                          <div className="text-[10px] text-zinc-400">{comp.ghost_label}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Internet Company Resolution with Logo Preview */}
              {internetResult && !results.some((r) => r.slug === internetResult.existing_slug) && (
                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Internet Discovery (Live Logo Fetch)</span>
                  </div>

                  <button
                    onClick={() => handleSelectInternetResult(internetResult)}
                    disabled={addingInternet}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={internetResult.logo_url}
                        alt={`${internetResult.name} logo`}
                        className="w-9 h-9 rounded-lg bg-zinc-900 object-contain p-1 border border-purple-500/40 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />

                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-100 group-hover:text-purple-300 transition-colors text-sm">
                            {internetResult.name}
                          </span>
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-1.5 py-0.2 rounded border border-purple-500/30">
                            {internetResult.domain}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400">
                          {internetResult.industry} • Tap to view or expose
                        </span>
                        {internetResult.meme_punchline && (
                          <span className="text-[11px] text-amber-300/90 italic mt-0.5">
                            &ldquo;{internetResult.meme_punchline}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md">
                        {addingInternet ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        Expose
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {/* Add Custom Fallback */}
              <div className="p-2 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <span>Not seeing the exact company?</span>
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    setShowAddModal(true);
                  }}
                  className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 rounded-lg hover:bg-purple-950/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom &ldquo;{query}&rdquo;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddCompanyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          initialName={query}
          onSuccess={(slug) => {
            setShowAddModal(false);
            router.push(`/company/${slug}`);
          }}
        />
      )}
    </div>
  );
}

