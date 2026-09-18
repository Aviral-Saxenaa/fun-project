"use client";

import React, { useState, useEffect } from "react";
import { Comment } from "@/types";
import { api } from "@/lib/api";
import { generatePseudonym } from "@/lib/client/anonymous";
import { ThumbsUp, ThumbsDown, Send, Loader2 } from "lucide-react";

interface CommentSectionProps {
  experienceId: string;
  initialCount?: number;
}

export function CommentSection({ experienceId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await api.getComments(experienceId);
        if (isMounted) setComments(data);
      } catch (err) {
        console.error("Failed to load comments", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [experienceId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const created = await api.addComment(experienceId, newComment.trim());
      setComments((prev) => [created, ...prev]);
      setNewComment("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (commentId: string, type: "up" | "down") => {
    // Optimistic update
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const currentVote = c.user_vote;
        let newVote: "up" | "down" | null = type;
        let upDiff = 0;
        let downDiff = 0;

        if (currentVote === type) {
          // Toggle off
          newVote = null;
          if (type === "up") upDiff = -1;
          else downDiff = -1;
        } else {
          if (currentVote === "up") upDiff = -1;
          if (currentVote === "down") downDiff = -1;
          if (type === "up") upDiff += 1;
          else downDiff += 1;
        }

        return {
          ...c,
          upvotes: Math.max(0, c.upvotes + upDiff),
          downvotes: Math.max(0, c.downvotes + downDiff),
          user_vote: newVote,
        };
      })
    );

    try {
      const res = await api.voteComment(commentId, type);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, upvotes: res.upvotes, downvotes: res.downvotes, user_vote: res.user_vote }
            : c
        )
      );
    } catch (e) {
      console.error("Vote failed", e);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Anonymous Candidate Discussions ({comments.length})
        </h4>
        <span className="text-[11px] text-zinc-500 italic">No account required</span>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleAddComment} className="relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts on this ghost story... (Keep it civilized, no doxxing!)"
          rows={2}
          className="w-full p-3 pr-12 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="absolute right-2.5 bottom-3 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:hover:bg-purple-600 transition-all shadow-md"
          title="Send anonymous comment"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

      {/* Comment List */}
      {loading ? (
        <div className="py-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
          <span>Fetching fellow survivor comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <p className="py-3 text-center text-xs text-zinc-500 italic">
          No comments yet. Be the first to commiserate! 💬
        </p>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {comments.map((comm) => {
            const pseudonym = generatePseudonym(comm.id + (comm.created_at || ""));
            return (
              <div
                key={comm.id}
                className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-xs space-y-1.5 group/comment"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-semibold text-purple-300/90">{pseudonym}</span>
                  <span className="text-zinc-500">
                    {new Date(comm.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-zinc-300 leading-relaxed">{comm.content}</p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleVote(comm.id, "up")}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] transition-all ${
                      comm.user_vote === "up"
                        ? "bg-purple-600/30 border-purple-500/50 text-purple-300"
                        : "border-zinc-800/80 text-zinc-400 hover:bg-zinc-900"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{comm.upvotes}</span>
                  </button>

                  <button
                    onClick={() => handleVote(comm.id, "down")}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[11px] transition-all ${
                      comm.user_vote === "down"
                        ? "bg-rose-600/30 border-rose-500/50 text-rose-300"
                        : "border-zinc-800/80 text-zinc-500 hover:bg-zinc-900"
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
