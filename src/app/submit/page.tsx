"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Company, InterviewStage, InterviewOutcome, ExperienceCategory } from "@/types";
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  Clock,
  ArrowLeft,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import { AddCompanyModal } from "@/components/AddCompanyModal";
import { FullscreenMemeModal } from "@/components/FullscreenMemeModal";

const STAGES: InterviewStage[] = [
  "Applied",
  "Recruiter Call",
  "HR",
  "Technical",
  "Manager",
  "Final Round",
  "Offer Stage",
];

const OUTCOMES: { label: string; value: InterviewOutcome; emoji: string }[] = [
  { label: "Ghosted", value: "Ghosted", emoji: "👻" },
  { label: "Laid Off / Mass Layoff", value: "Laid Off / Mass Layoff", emoji: "🪓" },
  { label: "Still Waiting", value: "Still Waiting", emoji: "⏳" },
  { label: "Rejected", value: "Rejected", emoji: "🚫" },
  { label: "Never Responded", value: "Never Responded", emoji: "🪦" },
  { label: "Ghosted After Final Round", value: "Ghosted After Final Round", emoji: "💀" },
  { label: "Ghost Job / Fake Listing", value: "Ghost Job / Fake Listing", emoji: "🚩" },
];

const CATEGORIES: { label: string; value: ExperienceCategory; emoji: string; desc: string }[] = [
  { label: "Ghosting", value: "Ghosting", emoji: "👻", desc: "Never heard back after promises" },
  { label: "Layoff Shock", value: "Layoff Shock", emoji: "🪓", desc: "Sudden mass layoff, revoked Slack access" },
  { label: "Zombie Interview", value: "Zombie Interview", emoji: "🧟", desc: "Process refuses to die" },
  { label: "Infinite Waiting", value: "Infinite Waiting", emoji: "⏳", desc: "'We will get back to you soon'" },
  { label: "Rejected", value: "Rejected", emoji: "🚫", desc: "Cold automated rejection or no feedback" },
  { label: "Unpaid Assignment", value: "Unpaid Assignment", emoji: "💀", desc: "Free consulting disguised as interview" },
  { label: "Red Flag", value: "Red Flag", emoji: "🚩", desc: "Suspicious or toxic behavior" },
];

function SubmitFormContent() {
  const searchParams = useSearchParams();

  const prefilledId = searchParams.get("company_id") || "";
  const prefilledName = searchParams.get("company_name") || "";

  const [companyId, setCompanyId] = useState(prefilledId);
  const [companySearch, setCompanySearch] = useState(prefilledName);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [internetResult, setInternetResult] = useState<{
    name: string;
    domain: string;
    logo_url: string;
    existing_id: string | null;
    existing_slug: string | null;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [addingInternet, setAddingInternet] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<{
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
  } | null>(
    prefilledId && prefilledName ? { id: prefilledId, name: prefilledName, slug: "" } : null
  );

  const [stage, setStage] = useState<InterviewStage>("Final Round");
  const [outcome, setOutcome] = useState<InterviewOutcome>("Ghosted");
  const [category, setCategory] = useState<ExperienceCategory>("Ghosting");
  const [content, setContent] = useState("");
  const [waitingDays, setWaitingDays] = useState<string>("30");
  const [interviewRounds, setInterviewRounds] = useState<string>("3");

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showMemePopup, setShowMemePopup] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Search company autocomplete (both local DB & live internet lookup)
  useEffect(() => {
    const trimmed = companySearch.trim();
    if (!trimmed || selectedCompany) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [localMatches, internetRes] = await Promise.all([
          api.searchCompanies(trimmed).catch(() => []),
          fetch(`/api/companies/lookup?q=${encodeURIComponent(trimmed)}`)
            .then((r) => r.json())
            .then((d) => d.found || null)
            .catch(() => null),
        ]);
        setSearchResults(localMatches);
        setInternetResult(internetRes);
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [companySearch, selectedCompany]);

  const handleSelectCompany = (comp: Company) => {
    setSelectedCompany({
      id: comp.id,
      name: comp.name,
      slug: comp.slug,
      logo_url: comp.logo_url,
    });
    setCompanyId(comp.id);
    setCompanySearch(comp.name);
    setSearchResults([]);
    setInternetResult(null);
  };

  const handleSelectInternetResult = async (item: {
    name: string;
    domain: string;
    existing_id: string | null;
    existing_slug: string | null;
  }) => {
    if (item.existing_id) {
      setSelectedCompany({
        id: item.existing_id,
        name: item.name,
        slug: item.existing_slug || "",
      });
      setCompanyId(item.existing_id);
      setCompanySearch(item.name);
      setSearchResults([]);
      setInternetResult(null);
      return;
    }

    try {
      setAddingInternet(true);
      const res = await fetch(
        `/api/companies/lookup?q=${encodeURIComponent(item.name)}&auto_add=true`
      );
      const data = await res.json();
      if (data.found?.existing_id) {
        setSelectedCompany({
          id: data.found.existing_id,
          name: data.found.name || item.name,
          slug: data.found.existing_slug || "",
          logo_url: data.found.logo_url,
        });
        setCompanyId(data.found.existing_id);
        setCompanySearch(data.found.name || item.name);
      } else {
        setShowAddModal(true);
      }
    } catch (err) {
      console.error("Auto-add error:", err);
      setShowAddModal(true);
    } finally {
      setAddingInternet(false);
      setSearchResults([]);
      setInternetResult(null);
    }
  };

  const handleClearCompany = () => {
    setSelectedCompany(null);
    setCompanyId("");
    setCompanySearch("");
    setSearchResults([]);
    setInternetResult(null);
  };

  const handleCivilizeWithAI = async () => {
    if (!content.trim()) return;
    setPolishing(true);
    setAiNote(null);
    try {
      const res = await fetch("/api/grok/civilize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          companyName: selectedCompany?.name || companySearch || "The Company",
        }),
      });
      const data = await res.json();
      if (data.sanitized) {
        setContent(data.sanitized);
        setAiNote(data.explanation || "Transformed vulgarities/anger into sharp, witty corporate satire! ✨");
      }
    } catch (err) {
      console.error("AI Polish error:", err);
    } finally {
      setPolishing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      setError("Please choose or add the company that ghosted you.");
      return;
    }
    if (!content.trim()) {
      setError("Please describe what happened in your interview.");
      return;
    }

    setSubmitting(true);
    setError(null);

    let finalContent = content.trim();

    // Auto-civilize if aggressive or vulgar words detected
    const vulgarTest = /\b(fuck|shit|bitch|bastard|asshole|cunt|dick|idiot|scam|motherfucker|moron|bullshit)\b/i;
    if (vulgarTest.test(finalContent)) {
      try {
        const res = await fetch("/api/gemini/civilize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: finalContent,
            companyName: selectedCompany?.name || companySearch || "The Company",
          }),
        });
        const data = await res.json();
        if (data.sanitized) {
          finalContent = data.sanitized;
        }
      } catch (err) {
        console.error("Auto civilize error:", err);
      }
    }

    try {
      await api.createExperience({
        company_id: companyId,
        interview_stage: stage,
        outcome,
        category,
        content: finalContent,
        waiting_days: waitingDays ? parseInt(waitingDays) : null,
        interview_rounds: interviewRounds ? parseInt(interviewRounds) : null,
      });

      setCreatedSlug(selectedCompany?.slug || "");
      setSubmitted(true);
      setShowMemePopup(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit story");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 bg-zinc-900/90 border border-purple-500/40 rounded-3xl p-8 shadow-2xl relative">
        {/* Fullscreen Meme Reaction Modal automatically pops up on submit */}
        {showMemePopup && (
          <FullscreenMemeModal
            category={category}
            onClose={() => setShowMemePopup(false)}
            autoCloseSec={6}
          />
        )}

        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Story submitted.
          </h2>
          <p className="text-base text-purple-300 font-medium">
            Unlike some companies, we actually received it. 👻
          </p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto pt-2">
            Your candidate experience is now part of the anonymous company Ghost Score.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setShowMemePopup(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 transition-colors"
          >
            😂 Replay Savage Meme Reaction
          </button>
          {createdSlug && (
            <Link
              href={`/company/${createdSlug}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              View Company Ghost Score
            </Link>
          )}
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            Back to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-4xl">👻</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Got Ghosted? Tell the internet.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              100% Anonymous. No email, no passwords, no profiles.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-3.5 text-sm text-zinc-300">
        <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white font-bold">Community Safety Guidelines:</strong> Please describe what happened in your interview. Do NOT post personal phone numbers, emails, home addresses, or defamatory threats. Keep it focused on the hiring process!
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-7 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Company Selector */}
        <div className="space-y-2 relative">
          <label className="block text-sm font-bold uppercase tracking-wider text-zinc-200">
            Company Name *
          </label>

          {selectedCompany ? (
            <div className="flex items-center justify-between p-4 bg-zinc-950 border border-purple-500/60 rounded-2xl text-base text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {selectedCompany.logo_url ? (
                    <img
                      src={selectedCompany.logo_url}
                      alt=""
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <span className="font-extrabold text-lg text-white">{selectedCompany.name}</span>
              </div>
              <button
                type="button"
                onClick={handleClearCompany}
                className="text-sm text-zinc-400 hover:text-rose-400 font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                id="submit-company-search-input"
                type="text"
                value={companySearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setCompanySearch(val);
                  if (!val.trim()) {
                    setSearchResults([]);
                    setInternetResult(null);
                  }
                }}
                placeholder="Search or enter company name (e.g. Google, Stripe, Meta...)"
                className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-base text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />

              {(isSearching || addingInternet) && (
                <Loader2 className="w-5 h-5 animate-spin text-purple-400 absolute right-4 top-4" />
              )}

              {/* Autocomplete Dropdown */}
              {(searchResults.length > 0 || (internetResult && !searchResults.some((s) => s.name.toLowerCase() === internetResult.name.toLowerCase()))) && (
                <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto divide-y divide-zinc-800/80 p-2">
                  {/* Database matches */}
                  {searchResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCompany(c)}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-zinc-800/80 rounded-xl flex items-center justify-between text-sm text-zinc-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          {c.logo_url ? (
                            <img
                              src={c.logo_url}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Building2 className="w-4 h-4 text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold group-hover:text-purple-300 text-white">{c.name}</div>
                          {c.industry && <div className="text-xs text-zinc-400">{c.industry}</div>}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                        {c.ghost_emoji} {c.ghost_score} ({c.report_count} reports)
                      </span>
                    </button>
                  ))}

                  {/* Internet lookup match */}
                  {internetResult && !searchResults.some((s) => s.name.toLowerCase() === internetResult.name.toLowerCase()) && (
                    <div className="p-2">
                      <div className="text-[11px] font-mono text-purple-400 uppercase tracking-wider mb-1.5 px-2">
                        Web Directory Match
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectInternetResult(internetResult)}
                        className="w-full px-3.5 py-2.5 text-left bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center justify-between text-sm text-zinc-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-purple-500/40 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                            {internetResult.logo_url ? (
                              <img
                                src={internetResult.logo_url}
                                alt=""
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <Building2 className="w-4 h-4 text-purple-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white">{internetResult.name}</div>
                            <div className="text-xs text-zinc-400">{internetResult.domain}</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-purple-300 bg-purple-900/60 px-2.5 py-1 rounded-lg border border-purple-700/50">
                          {addingInternet ? "Adding..." : "+ Select & Add"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {companySearch.trim().length > 1 && !isSearching && searchResults.length === 0 && !internetResult && (
                <div className="mt-2.5 p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Company not listed yet?</span>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500 text-purple-200 font-bold transition-all text-xs sm:text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add &ldquo;{companySearch}&rdquo;</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interview Stage */}
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase tracking-wider text-zinc-200">
            Interview Stage
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold border text-center transition-all ${
                  stage === s
                    ? "bg-purple-600/20 border-purple-500 text-purple-200 font-bold shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Outcome */}
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase tracking-wider text-zinc-200">
            Outcome
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {OUTCOMES.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setOutcome(o.value)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${
                  outcome === o.value
                    ? "bg-purple-600 border-purple-500 text-white font-bold shadow-md shadow-purple-950/50"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                <span>{o.emoji}</span>
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fun Category */}
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase tracking-wider text-zinc-200">
            Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  category === cat.value
                    ? "bg-purple-950/40 border-purple-500 text-purple-200 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <div className="font-bold text-base flex items-center gap-2 text-white">
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </div>
                <div className="text-xs sm:text-sm text-zinc-400 mt-1 leading-snug">{cat.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Waiting duration & Interview rounds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-zinc-200 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>How long did you wait? (days)</span>
            </label>
            <input
              type="number"
              min="0"
              max="999"
              value={waitingDays}
              onChange={(e) => setWaitingDays(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-zinc-200 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Number of interview rounds</span>
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={interviewRounds}
              onChange={(e) => setInterviewRounds(e.target.value)}
              placeholder="e.g. 4"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Story Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold uppercase tracking-wider text-zinc-200">
              What happened? *
            </label>
            <button
              type="button"
              onClick={handleCivilizeWithAI}
              disabled={polishing || !content.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Transform spicy rants and vulgar language into witty corporate satire"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{polishing ? "Polishing into satire..." : "✨ AI De-Vulgarize & Polish"}</span>
            </button>
          </div>

          <textarea
            id="experience-content-textarea"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Had 4 interviews and a take-home assignment. They said they'd get back to me Monday morning. It is currently September..."
            className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-all leading-relaxed"
          />

          {aiNote && (
            <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-sm text-purple-200 flex items-center gap-2">
              <span>✨</span>
              <span>{aiNote}</span>
            </div>
          )}
          <p className="text-xs sm:text-sm text-zinc-400 italic">
            Tip: Keep it witty. Our AI automatically converts harsh profanity or spicy anger into hilarious corporate satire.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-300 font-medium">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          id="submit-experience-form-btn"
          type="submit"
          disabled={submitting || !companyId || !content.trim()}
          className="w-full py-4 rounded-2xl text-base font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-950/60 transition-all disabled:opacity-50 hover:scale-[1.01]"
        >
          {submitting ? "Sending your story into the void... 👻" : "Submit Experience"}
        </button>
      </form>

      {/* Add Company Modal if needed */}
      {showAddModal && (
        <AddCompanyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          initialName={companySearch}
          onSuccess={async (newSlug) => {
            setShowAddModal(false);
            try {
              const comp = await api.getCompany(newSlug);
              handleSelectCompany(comp.company as Company);
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}
    </div>
  );
}

export default function SubmitExperiencePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-zinc-400 font-mono text-sm">
          Waiting for HR to reply... ⏳
        </div>
      }
    >
      <SubmitFormContent />
    </Suspense>
  );
}
