"use client"

import { useState } from "react"
import { ArrowBigUp, ArrowBigDown, MessageCircle, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api"
import { getAnonymousId } from "@/lib/anon"
import type { Experience } from "@/types"

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ]
  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds)
    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`
  }
  return "just now"
}

const categoryEmojis: Record<string, string> = {
  "Ghosting": "👻",
  "Zombie Interview": "🧟",
  "Infinite Waiting": "⏳",
  "HR Circus": "🤡",
  "Unpaid Assignment": "💀",
  "Red Flag": "🚩",
}

const outcomeLabels: Record<string, string> = {
  "Ghosted": "Ghosted 👻",
  "Rejected": "Rejected",
  "Got Offer": "Got Offer 🎉",
  "Still Waiting": "Still Waiting ⏳",
  "Withdrew": "Withdrew",
}

export default function ExperienceCard({ experience }: { experience: Experience }) {
  const [upvotes, setUpvotes] = useState(experience.upvotes)
  const [downvotes, setDownvotes] = useState(experience.downvotes)
  const [userVote, setUserVote] = useState<string | null | undefined>(experience.user_vote)

  const handleVote = async (type: "up" | "down") => {
    const anonId = getAnonymousId()
    const prevVote = userVote
    const isRemoving = prevVote === type

    if (type === "up") {
      setUpvotes((v) => v + (isRemoving ? -1 : prevVote === "down" ? 0 : 1))
      if (prevVote === "down") setDownvotes((v) => v - 1)
    } else {
      setDownvotes((v) => v + (isRemoving ? -1 : prevVote === "up" ? 0 : 1))
      if (prevVote === "up") setUpvotes((v) => v - 1)
    }
    setUserVote(isRemoving ? null : type)

    try {
      const res = await apiFetch(`/api/experiences/${experience.id}/vote`, {
        method: "POST",
        body: JSON.stringify({ vote_type: type, anonymous_id: anonId }),
      })
      setUpvotes(res.upvotes)
      setDownvotes(res.downvotes)
    } catch {
      setUpvotes(experience.upvotes)
      setDownvotes(experience.downvotes)
      setUserVote(prevVote)
    }
  }

  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-gray-400 text-sm font-medium">👻 Anonymous Candidate</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{experience.interview_stage}</span>
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{outcomeLabels[experience.outcome] || experience.outcome}</span>
            {experience.category && (
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                {categoryEmojis[experience.category]} {experience.category}
              </span>
            )}
          </div>
        </div>
        <span className="text-gray-600 text-xs">{timeAgo(experience.created_at)}</span>
      </div>

      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap mb-4">{experience.content}</p>

      {experience.waiting_days && (
        <p className="text-sm text-gray-500 mb-4">Waited: {experience.waiting_days} days</p>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-gray-800">
        <button onClick={() => handleVote("up")} className={cn("flex items-center gap-1 text-sm transition-colors", userVote === "up" ? "text-green-400" : "text-gray-500 hover:text-green-400")}>
          <ArrowBigUp className={cn("w-5 h-5", userVote === "up" && "fill-current")} />
          {formatNumber(upvotes)}
        </button>
        <button onClick={() => handleVote("down")} className={cn("flex items-center gap-1 text-sm transition-colors", userVote === "down" ? "text-red-400" : "text-gray-500 hover:text-red-400")}>
          <ArrowBigDown className={cn("w-5 h-5", userVote === "down" && "fill-current")} />
          {formatNumber(downvotes)}
        </button>
        <span className="flex items-center gap-1 text-sm text-gray-500">
          <MessageCircle className="w-4 h-4" />
          {experience.comment_count}
        </span>
        <button className="ml-auto text-gray-600 hover:text-red-400 transition-colors text-sm flex items-center gap-1">
          <Flag className="w-3.5 h-3.5" />
          Report
        </button>
      </div>
    </div>
  )
}
