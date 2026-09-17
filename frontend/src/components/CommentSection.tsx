"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { getAnonymousId } from "@/lib/anon"
import type { Comment as CommentType } from "@/types"
import { ArrowBigUp, ArrowBigDown } from "lucide-react"
import { cn } from "@/lib/utils"

const funNames = [
  "Ghost Hunter",
  "Interview Survivor",
  "Round-5 Survivor",
  "HR Victim",
  "Void Screamer",
  "Resume Sender",
  "Follow-up Email Writer",
]

function getFunName(hash: string): string {
  let sum = 0
  for (let i = 0; i < hash.length; i++) sum += hash.charCodeAt(i)
  const name = funNames[sum % funNames.length]
  const num = (sum * 7 + 13) % 1000
  return `${name} #${num}`
}

export default function CommentSection({ experienceId }: { experienceId: string }) {
  const [comments, setComments] = useState<CommentType[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)

  const loadComments = async () => {
    try {
      const data = await apiFetch(`/api/experiences/${experienceId}/comments?anonymous_id=${getAnonymousId()}`)
      setComments(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadComments() }, [experienceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      await apiFetch(`/api/experiences/${experienceId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment, anonymous_id: getAnonymousId() }),
      })
      setNewComment("")
      loadComments()
    } catch {}
  }

  const handleVote = async (commentId: string, type: "up" | "down") => {
    try {
      await apiFetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        body: JSON.stringify({ vote_type: type, anonymous_id: getAnonymousId() }),
      })
      loadComments()
    } catch {}
  }

  return (
    <div className="mt-6">
      <h3 className="text-white font-semibold mb-4">💬 {comments.length} Comments</h3>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your two cents..."
          maxLength={1000}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
        />
        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Post
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500 text-sm">Waiting for HR to reply...</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-400 text-sm font-medium">{getFunName(c.id)}</span>
                <span className="text-gray-600 text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">{c.content}</p>
              <div className="flex items-center gap-3">
                <button onClick={() => handleVote(c.id, "up")} className={cn("flex items-center gap-1 text-xs transition-colors", c.user_vote === "up" ? "text-green-400" : "text-gray-500 hover:text-green-400")}>
                  <ArrowBigUp className="w-4 h-4" />{c.upvotes}
                </button>
                <button onClick={() => handleVote(c.id, "down")} className={cn("flex items-center gap-1 text-xs transition-colors", c.user_vote === "down" ? "text-red-400" : "text-gray-500 hover:text-red-400")}>
                  <ArrowBigDown className="w-4 h-4" />{c.downvotes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
