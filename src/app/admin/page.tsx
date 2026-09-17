"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ReportItem } from "@/types";
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Ban,
  GitMerge,
  ArrowLeft,
  Key,
  CheckCircle,
} from "lucide-react";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [bannedHashes, setBannedHashes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Merge state
  const [sourceSlug, setSourceSlug] = useState("");
  const [targetSlug, setTargetSlug] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;

    setLoading(true);
    setAuthError(null);
    try {
      const data = await api.getAdminReports(secret.trim());
      setReports(data.reports || []);
      setBannedHashes(data.banned || []);
      setAuthenticated(true);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Invalid passphrase");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, params: Record<string, unknown>) => {
    try {
      await api.adminAction(secret, { action, ...params });
      setActionMessage(`Action "${action}" completed successfully.`);
      // Reload reports
      const data = await api.getAdminReports(secret);
      setReports(data.reports || []);
      setBannedHashes(data.banned || []);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Action failed");
    }
  };

  const handleMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceSlug.trim() || !targetSlug.trim()) return;
    try {
      await api.adminAction(secret, {
        action: "merge_companies",
        sourceSlug: sourceSlug.trim(),
        targetSlug: targetSlug.trim(),
      });
      setActionMessage(`Merged "${sourceSlug}" into "${targetSlug}"!`);
      setSourceSlug("");
      setTargetSlug("");
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Merge failed");
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Ghosted</span>
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-white">Ghosted Moderation Desk</h1>
            <p className="text-xs text-zinc-400">
              Community safety &amp; moderation portal for content review.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Admin Passphrase
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  id="admin-secret-input"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter secret (default: ghostbuster)"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <p className="text-[11px] text-zinc-500 italic">
                Tip for testing: default key is <code className="text-purple-300">ghostbuster</code>
              </p>
            </div>

            {authError && (
              <p className="text-xs text-rose-400 font-medium">{authError}</p>
            )}

            <button
              id="admin-unlock-btn"
              type="submit"
              disabled={loading || !secret.trim()}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Unlock Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white">Ghosted Moderation Center</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Enforcing community safety: removing doxxing, harassment, and maintaining data hygiene.
          </p>
        </div>

        <button
          onClick={() => {
            setAuthenticated(false);
            setSecret("");
          }}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-400 hover:text-white"
        >
          Lock &amp; Exit
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Reported Items Desk */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Flagged Community Submissions</span>
            <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
              {reports.length}
            </span>
          </h2>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl text-xs text-zinc-500">
            ✨ Clean queue! No content currently flagged for review.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      🚩 {r.reason}
                    </span>
                    {r.company_name && (
                      <span className="text-zinc-400">
                        Company: <strong className="text-zinc-200">{r.company_name}</strong>
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 whitespace-pre-line italic">
                  &ldquo;{r.target_content}&rdquo;
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-xs">
                  <span className="text-[11px] font-mono text-zinc-500">
                    Reporter Hash: {r.anonymous_id_hash.substring(0, 12)}...
                  </span>

                  <div className="flex items-center gap-2">
                    {r.experience_id && (
                      <button
                        onClick={() =>
                          handleAction("delete_experience", { id: r.experience_id })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Story</span>
                      </button>
                    )}
                    {r.comment_id && (
                      <button
                        onClick={() =>
                          handleAction("delete_comment", { id: r.comment_id })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Comment</span>
                      </button>
                    )}
                    <button
                      onClick={() =>
                        handleAction("ban_hash", { hash: r.anonymous_id_hash })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Ban Poster ID</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duplicate Company Merger */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">Merge Duplicate Companies</h2>
        </div>
        <p className="text-xs text-zinc-400">
          Move all candidate experiences and ghost metrics from a misspelled duplicate company into the primary verified company slug.
        </p>

        <form onSubmit={handleMerge} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={sourceSlug}
            onChange={(e) => setSourceSlug(e.target.value)}
            placeholder="Source slug (e.g. google-inc)"
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
          />
          <input
            type="text"
            value={targetSlug}
            onChange={(e) => setTargetSlug(e.target.value)}
            placeholder="Target slug (e.g. google)"
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!sourceSlug.trim() || !targetSlug.trim()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-colors"
          >
            Merge Companies
          </button>
        </form>
      </div>

      {/* Banned IDs Section */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Ban className="w-4 h-4 text-rose-400" />
          <span>Restricted Anonymous IDs ({bannedHashes.length})</span>
        </h3>
        {bannedHashes.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">No banned IDs.</p>
        ) : (
          <div className="space-y-2">
            {bannedHashes.map((h) => (
              <div
                key={h}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 font-mono text-xs text-zinc-400 border border-zinc-800"
              >
                <span>{h}</span>
                <button
                  onClick={() => handleAction("unban_hash", { hash: h })}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Unban
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
