"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Ghost, Trophy, Search } from "lucide-react"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-gray-950/90 backdrop-blur-md border-b border-purple-500/20" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl hover:text-purple-400 transition-colors">
          <Ghost className="w-6 h-6 text-purple-400" />
          <span>GHOSTED</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/submit" className="text-sm text-gray-300 hover:text-purple-400 transition-colors hidden sm:block">
            Share Your Story
          </Link>
          <Link href="/leaderboard" className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  )
}
