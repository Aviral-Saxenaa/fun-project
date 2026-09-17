"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Ghost, FileText, Clock, Hourglass, Users } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { getAnonymousId } from "@/lib/anon"
import GhostScore from "@/components/GhostScore"
import ExperienceCard from "@/components/ExperienceCard"
import type { CompanyDetail, Experience } from "@/types"

export default function CompanyPage() {
  const params = useParams()
  const slug = params.slug as string
  const [detail, setDetail] = useState<CompanyDetail | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      apiFetch(`/api/companies/${slug}`),
      apiFetch(`/api/experiences?company_id=&anonymous_id=${getAnonymousId()}`),
    ])
      .then(([d, exps]) => {
        setDetail(d)
        setExperiences(exps)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!detail) return
    apiFetch(`/api/experiences?company_id=${detail.company.id}&anonymous_id=${getAnonymousId()}`)
      .then(setExperiences)
      .catch(() => {})
  }, [detail])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Ghost className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-500">Waiting for HR to reply...</p>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Ghost className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">This page ghosted you.</h1>
          <p className="text-gray-500">Company not found.</p>
        </div>
      </div>
    )
  }

  const { company, ghost_score, ghost_label, ghost_emoji, stats } = detail

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">{company.name}</h1>
        <GhostScore score={ghost_score} size="lg" />
        <p className="text-gray-600 text-sm mt-4">Based on anonymous community reports.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { icon: Ghost, label: "Ghost Reports", value: stats.ghost_reports, color: "text-purple-400" },
          { icon: FileText, label: "Total Experiences", value: stats.total_reports, color: "text-blue-400" },
          { icon: Clock, label: "Avg. Waiting", value: `${stats.avg_waiting_days} days`, color: "text-orange-400" },
          { icon: Hourglass, label: "Longest Wait", value: stats.longest_wait_days ? `${stats.longest_wait_days} days` : "N/A", color: "text-red-400" },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
            <div className="text-xl font-bold text-white">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Candidate Experiences</h2>
      </div>

      {experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
          <Ghost className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
          <p className="text-gray-400">No ghosts detected... yet.</p>
          <p className="text-gray-600 text-sm mt-1">Looks like this company hasn&apos;t been exposed yet. 👀</p>
        </div>
      )}
    </div>
  )
}
