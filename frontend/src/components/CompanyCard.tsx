import Link from "next/link"
import { Ghost } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  rank: number
  name: string
  slug: string
  ghostScore: number
  reportCount: number
  emoji: string
}

const medals = ["🥇", "🥈", "🥉"]

export default function CompanyCard({ rank, name, slug, ghostScore, reportCount, emoji }: Props) {
  return (
    <Link href={`/company/${slug}`} className="block">
      <div className={cn(
        "bg-gray-900 border border-purple-500/20 rounded-2xl p-5 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 group",
        rank === 1 && "border-yellow-500/30 hover:border-yellow-500/60"
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{rank <= 3 ? medals[rank - 1] : `#${rank}`}</span>
            <h3 className="text-white font-semibold text-lg group-hover:text-purple-400 transition-colors">{name}</h3>
          </div>
          <span className="text-2xl">{emoji}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-purple-400 font-medium">
            <Ghost className="w-4 h-4" />
            {ghostScore}/100
          </span>
          <span className="text-gray-500">{reportCount.toLocaleString()} reports</span>
        </div>
      </div>
    </Link>
  )
}
