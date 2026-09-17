export function getGhostEmoji(score: number): string {
  if (score <= 20) return "👼"
  if (score <= 40) return "🙂"
  if (score <= 60) return "😐"
  if (score <= 80) return "👻"
  return "💀"
}

export function getGhostLabel(score: number): string {
  if (score <= 20) return "Surprisingly Responsive"
  if (score <= 40) return "Mostly Responsive"
  if (score <= 60) return "Could Be Better"
  if (score <= 80) return "Getting Ghosty"
  return "Professional Ghost"
}

export default function GhostScore({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const emoji = getGhostEmoji(score)
  const label = getGhostLabel(score)
  const sizes = { sm: "text-3xl", md: "text-5xl", lg: "text-7xl" }
  const ringColor = score <= 20 ? "border-green-500/30" : score <= 40 ? "border-blue-500/30" : score <= 60 ? "border-yellow-500/30" : score <= 80 ? "border-orange-500/30" : "border-red-500/30"

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`rounded-full border-4 ${ringColor} p-6 bg-gray-900/50`}>
        <span className={`${sizes[size]} block text-center`}>{emoji}</span>
      </div>
      <span className="text-white font-bold text-2xl">{score}<span className="text-gray-500 text-lg">/100</span></span>
      <span className="text-gray-400 text-sm">&ldquo;{label}&rdquo;</span>
    </div>
  )
}
