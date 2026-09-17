"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Ghost, Send } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { getAnonymousId } from "@/lib/anon"
import type { CompanySearchResult, InterviewStage, Outcome, Category } from "@/types"

const stages: InterviewStage[] = ["Applied", "Recruiter Call", "HR", "Technical", "Manager", "Final Round", "Offer Stage"]
const outcomes: { value: Outcome; label: string }[] = [
  { value: "Ghosted", label: "Ghosted 👻" },
  { value: "Rejected", label: "Rejected" },
  { value: "Got Offer", label: "Got Offer 🎉" },
  { value: "Still Waiting", label: "Still Waiting ⏳" },
  { value: "Withdrew", label: "Withdrew" },
]
const categories: { value: Category; label: string }[] = [
  { value: "Ghosting", label: "👻 Ghosting" },
  { value: "Zombie Interview", label: "🧟 Zombie Interview" },
  { value: "Infinite Waiting", label: "⏳ Infinite Waiting" },
  { value: "HR Circus", label: "🤡 HR Circus" },
  { value: "Unpaid Assignment", label: "💀 Unpaid Assignment" },
  { value: "Red Flag", label: "🚩 Red Flag" },
]

function SubmitForm() {
  const searchParams = useSearchParams()
  const prefilledCompany = searchParams.get("company") || ""

  const [companyQuery, setCompanyQuery] = useState(prefilledCompany)
  const [companyResults, setCompanyResults] = useState<CompanySearchResult[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [stage, setStage] = useState<InterviewStage>("Applied")
  const [outcome, setOutcome] = useState<Outcome>("Ghosted")
  const [content, setContent] = useState("")
  const [waitingDays, setWaitingDays] = useState("")
  const [rounds, setRounds] = useState("")
  const [category, setCategory] = useState<Category | "">("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (companyQuery.length < 2) { setCompanyResults([]); return }
    const t = setTimeout(async () => {
      try {
        const data = await apiFetch(`/api/companies?q=${encodeURIComponent(companyQuery)}`)
        setCompanyResults(data)
      } catch { setCompanyResults([]) }
    }, 300)
    return () => clearTimeout(t)
  }, [companyQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompanyId) { setError("Select a company first"); return }
    if (content.length < 10) { setError("Story must be at least 10 characters"); return }
    setSubmitting(true)
    setError("")
    try {
      await apiFetch("/api/experiences", {
        method: "POST",
        body: JSON.stringify({
          company_id: selectedCompanyId,
          interview_stage: stage,
          outcome,
          content,
          waiting_days: waitingDays ? parseInt(waitingDays) : null,
          interview_rounds: rounds ? parseInt(rounds) : null,
          category: category || null,
          anonymous_id: getAnonymousId(),
        }),
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    }
    setSubmitting(false)
  }

  const handleAddCompany = async () => {
    try {
      const res = await apiFetch("/api/companies", {
        method: "POST",
        body: JSON.stringify({ name: companyQuery }),
      })
      setSelectedCompanyId(res.id)
      setCompanyResults([res])
    } catch {}
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">👻</div>
        <h2 className="text-2xl font-bold text-white mb-3">Story submitted.</h2>
        <p className="text-gray-400">Unlike some companies, we actually received it. 👻</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">👻</div>
        <h1 className="text-3xl font-black text-white mb-2">Got Ghosted?</h1>
        <p className="text-gray-400">Tell the internet.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
          <input
            type="text"
            value={companyQuery}
            onChange={(e) => { setCompanyQuery(e.target.value); setSelectedCompanyId("") }}
            placeholder="Search for a company..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          {!selectedCompanyId && companyResults.length > 0 && (
            <div className="mt-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {companyResults.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setSelectedCompanyId(c.id); setCompanyQuery(c.name) }}
                  className="w-full px-4 py-2.5 text-left text-white hover:bg-purple-500/10 transition-colors border-b border-gray-800 last:border-0"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
          {!selectedCompanyId && companyQuery.length >= 2 && companyResults.length === 0 && (
            <div className="mt-2 text-center py-4 bg-gray-900 border border-gray-800 rounded-xl">
              <p className="text-gray-500 text-sm mb-2">No ghosts found... yet.</p>
              <button type="button" onClick={handleAddCompany} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                + Add this company
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Interview Stage</label>
          <select value={stage} onChange={(e) => setStage(e.target.value as InterviewStage)} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500">
            {stages.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">What happened?</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Had 4 interviews and a take-home assignment. They said they'd get back to me Monday. It is currently September."
            rows={5}
            maxLength={5000}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
          />
          <p className="text-xs text-gray-600 mt-1">{content.length}/5000</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">How long did you wait? (days)</label>
            <input type="number" value={waitingDays} onChange={(e) => setWaitingDays(e.target.value)} placeholder="37" min="0" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Number of rounds</label>
            <input type="number" value={rounds} onChange={(e) => setRounds(e.target.value)} placeholder="4" min="1" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Outcome</label>
          <div className="flex flex-wrap gap-2">
            {outcomes.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setOutcome(o.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  outcome === o.value ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-purple-500/50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Category (optional)</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(category === c.value ? "" : c.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === c.value ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-purple-500/50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>Sending your story into the void...</>
          ) : (
            <><Send className="w-5 h-5" /> Share Your Experience</>
          )}
        </button>
      </form>
    </div>
  )
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Waiting for HR to reply...</p></div>}>
      <SubmitForm />
    </Suspense>
  )
}
