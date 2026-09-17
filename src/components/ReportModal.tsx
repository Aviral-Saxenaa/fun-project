"use client";

import React, { useState } from "react";
import { ReportReason } from "@/types";
import { api } from "@/lib/api";
import { AlertCircle, CheckCircle2, Flag, X } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceId?: string;
  commentId?: string;
  itemDescription?: string;
}

const REASONS: ReportReason[] = [
  "Personal Information",
  "Harassment",
  "Hate Speech",
  "Spam",
  "Misleading",
  "Other",
];

export function ReportModal({
  isOpen,
  onClose,
  experienceId,
  commentId,
  itemDescription,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>("Personal Information");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.reportContent({
        reason,
        experience_id: experienceId,
        comment_id: commentId,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to report content");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="report-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="report-modal-content"
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 relative"
      >
        <button
          id="report-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Report Received</h3>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
              Thank you for keeping Ghosted safe and anonymous. Our moderators will review this story.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <Flag className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Report Content</h3>
            </div>

            {itemDescription && (
              <p className="text-xs text-zinc-400 italic bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 line-clamp-2">
                &ldquo;{itemDescription}&rdquo;
              </p>
            )}

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                We protect candidate experiences, but we strictly ban doxxing, personal phone numbers, emails, and threats.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Reason for reporting
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      reason === r
                        ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
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
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40 transition-all disabled:opacity-50"
              >
                {submitting ? "Reporting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
