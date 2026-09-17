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
} from "lucide-react";
import { AddCompanyModal } from "@/components/AddCompanyModal";

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
  { label: "Still Waiting", value: "Still Waiting", emoji: "⏳" },
  { label: "Rejected", value: "Rejected", emoji: "❌" },
  { label: "Got Offer", value: "Got Offer", emoji: "🎉" },
  { label: "Withdrew", value: "Withdrew", emoji: "🏃" },
];

const CATEGORIES: { label: string; value: ExperienceCategory; emoji: string; desc: string }[] = [
  { label: "Ghosting", value: "Ghosting", emoji: "👻", desc: "Never heard back after promises" },
  { label: "Zombie Interview", value: "Zombie Interview", emoji: "🧟", desc: "Process refuses to die" },
  { label: "Infinite Waiting", value: "Infinite Waiting", emoji: "⏳", desc: "'We will get back to you soon'" },
  { label: "HR Circus", value: "HR Circus", emoji: "🤡", desc: "A ridiculous clown experience" },
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
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<{ id: string; name: string; slug: string } | null>(
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
  const [submitted, setSubmitted] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Search company autocomplete
  useEffect(() => {
    const trimmed = companySearch.trim();
    if (!trimmed || selectedCompany) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.searchCompanies(trimmed);
        setSearchResults(res);
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [companySearch, selectedCompany]);

  const handleSelectCompany = (comp: Company) => {
    setSelectedCompany(comp);
    setCompanyId(comp.id);
    setCompanySearch(comp.name);
    setSearchResults([]);
  };

  const handleClearCompany = () => {
    setSelectedCompany(null);
    setCompanyId("");
    setCompanySearch("");
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

    try {
      await api.createExperience({
        company_id: companyId,
        interview_stage: stage,
        outcome,
        category,
        content: content.trim(),
        waiting_days: waitingDays ? parseInt(waitingDays) : null,
        interview_rounds: interviewRounds ? parseInt(interviewRounds) : null,
      });

      setCreatedSlug(selectedCompany?.slug || "");
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit story");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 bg-zinc-900/90 border border-purple-500/40 rounded-3xl p-8 shadow-2xl">
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
      <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-400">
        <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-200">Community Safety Guidelines:</strong> Please describe what happened in your interview. Do NOT post personal phone numbers, emails, home addresses, or defamatory threats. Keep it focused on the hiring process!
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Company Selector */}
        <div className="space-y-1.5 relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
            Company Name *
          </label>

          {selectedCompany ? (
            <div className="flex items-center justify-between p-3 bg-zinc-950 border border-purple-500/50 rounded-xl text-sm text-white">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">{selectedCompany.name}</span>
              </div>
              <button
                type="button"
                onClick={handleClearCompany}
                className="text-xs text-zinc-400 hover:text-rose-400 font-mono underline"
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
                  }
                }}
                placeholder="Type to search company (e.g. Acme, Google, Amazon...)"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />

              {isSearching && (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400 absolute right-3 top-3.5" />
              )}

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-zinc-800 p-1">
                  {searchResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCompany(c)}
                      className="w-full px-3 py-2 text-left hover:bg-zinc-800/80 rounded-lg flex items-center justify-between text-xs text-zinc-200"
                    >
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-zinc-500 font-mono">
                        {c.ghost_emoji} {c.ghost_score} ({c.report_count} reports)
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {companySearch.trim().length > 1 && !isSearching && searchResults.length === 0 && (
                <div className="mt-2 p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Not listed yet?</span>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add &ldquo;{companySearch}&rdquo; to database
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interview Stage */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
            Interview Stage
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  stage === s
                    ? "bg-purple-600/20 border-purple-500 text-purple-300 font-bold"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Outcome */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
            Outcome
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {OUTCOMES.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setOutcome(o.value)}
                className={`px-2.5 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                  outcome === o.value
                    ? "bg-purple-600 border-purple-500 text-white font-bold shadow-md shadow-purple-950/50"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>{o.emoji}</span>
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fun Category */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
            Fun Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-2.5 rounded-xl text-xs text-left border transition-all ${
                  category === cat.value
                    ? "bg-purple-950/40 border-purple-500 text-purple-200"
                    : "bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-zinc-200">
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{cat.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Waiting duration & Interview rounds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>How long did you wait? (days)</span>
            </label>
            <input
              type="number"
              min="0"
              max="999"
              value={waitingDays}
              onChange={(e) => setWaitingDays(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Number of interview rounds</span>
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={interviewRounds}
              onChange={(e) => setInterviewRounds(e.target.value)}
              placeholder="e.g. 4"
              className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Story Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
            What happened? *
          </label>
          <textarea
            id="experience-content-textarea"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Had 4 interviews and a take-home assignment. They said they'd get back to me Monday morning. It is currently September..."
            className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-all leading-relaxed"
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          id="submit-experience-form-btn"
          type="submit"
          disabled={submitting || !companyId || !content.trim()}
          className="w-full py-3.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-950/60 transition-all disabled:opacity-50 hover:scale-[1.01]"
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
