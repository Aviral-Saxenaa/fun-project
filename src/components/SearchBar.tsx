"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Company } from "@/types";
import { Search, Plus, Loader2 } from "lucide-react";
import { AddCompanyModal } from "./AddCompanyModal";

interface SearchBarProps {
  placeholder?: string;
  size?: "default" | "large";
}

export function SearchBar({
  placeholder = "Which company ghosted you? (e.g. Acme, Google, Amazon...)",
  size = "default",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchCompanies(trimmed);
        setResults(data);
      } catch (e) {
        console.error("Search error", e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

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
            className={`animate-spin text-zinc-400 mr-2 shrink-0 ${
              isLarge ? "w-5 h-5" : "w-4 h-4"
            }`}
          />
        )}
      </div>

      {/* Dropdown Results */}
      {openDropdown && query.trim().length > 0 && (
        <div
          id="search-results-dropdown"
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {loading && results.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>Scanning for phantom employers...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60 p-1.5">
              {results.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => handleSelectCompany(comp.slug)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/60 transition-colors text-left group"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors text-sm">
                      {comp.name}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {comp.report_count} {comp.report_count === 1 ? "report" : "reports"}
                      {comp.industry ? ` • ${comp.industry}` : ""}
                    </span>
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

              <div className="p-2 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <span>Not seeing the company?</span>
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    setShowAddModal(true);
                  }}
                  className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 rounded-lg hover:bg-purple-950/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add &ldquo;{query}&rdquo;
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center space-y-3">
              <div className="text-2xl">👻</div>
              <p className="text-sm font-semibold text-zinc-200">No ghosts found... Yet.</p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Looks like &ldquo;{query}&rdquo; hasn&apos;t been exposed yet. Be the first to put them on the board.
              </p>
              <button
                id="search-add-company-btn"
                onClick={() => {
                  setOpenDropdown(false);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-950/50"
              >
                <Plus className="w-4 h-4" />
                Add &ldquo;{query}&rdquo; to Ghosted
              </button>
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
