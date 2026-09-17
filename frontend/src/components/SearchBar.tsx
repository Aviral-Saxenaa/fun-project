"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Ghost } from "lucide-react"
import { apiFetch } from "@/lib/api"
import type { CompanySearchResult } from "@/types"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CompanySearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await apiFetch(`/api/companies?q=${encodeURIComponent(query)}`)
        setResults(data)
        setOpen(true)
      } catch {
        setResults([])
      }
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div ref={ref} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Which company ghosted you?"
          className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-purple-500/30 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-lg transition-all"
        />
      </div>
      {open && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 z-50">
          {loading ? (
            <div className="p-4 text-gray-400 text-center">Waiting for HR to reply...</div>
          ) : results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.id}
                onClick={() => { router.push(`/company/${r.slug}`); setOpen(false) }}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-purple-500/10 transition-colors text-left border-b border-gray-800 last:border-0"
              >
                <span className="text-white font-medium">{r.name}</span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Ghost className="w-3.5 h-3.5 text-purple-400" />
                  {r.ghost_score}/100 · {r.report_count} reports
                </span>
              </button>
            ))
          ) : (
            <div className="p-6 text-center">
              <Ghost className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-gray-400">No ghosts found... yet.</p>
              <button
                onClick={() => router.push(`/submit?company=${encodeURIComponent(query)}`)}
                className="mt-3 text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                + Add this company
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
