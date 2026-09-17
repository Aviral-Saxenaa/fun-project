"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Building2, Globe, Sparkles, X } from "lucide-react";

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  onSuccess?: (slug: string) => void;
}

const INDUSTRIES = [
  "Technology & Software",
  "Artificial Intelligence",
  "Fintech & Crypto",
  "E-Commerce & Retail",
  "Consulting & IT Services",
  "Healthcare & Biotech",
  "Media & Entertainment",
  "Aerospace & Defense",
  "Other",
];

export function AddCompanyModal({
  isOpen,
  onClose,
  initialName = "",
  onSuccess,
}: AddCompanyModalProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("Technology & Software");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a company name");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const company = await api.createCompany({
        name: name.trim(),
        website: website.trim() || undefined,
        industry: industry || undefined,
      });

      onClose();
      if (onSuccess) {
        onSuccess(company.slug);
      } else {
        router.push(`/company/${company.slug}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add company");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="add-company-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="add-company-modal-content"
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 relative"
      >
        <button
          id="add-company-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-xl font-bold text-white">Add New Company</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-5">
          Can&apos;t find the ghost? Add it here so fellow candidates know what to expect.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Company Name *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                id="company-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp, Pied Piper"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Website (optional)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                id="company-website-input"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. acme.com"
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Industry (optional)
            </label>
            <select
              id="company-industry-select"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-add-company-btn"
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/50 transition-all disabled:opacity-50"
            >
              {submitting ? "Adding Company..." : "Add Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
