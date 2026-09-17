import { Ghost } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Ghost className="w-20 h-20 text-purple-400 mx-auto mb-6" />
        <h1 className="text-4xl font-black text-white mb-3">404</h1>
        <p className="text-gray-400 text-lg">This page ghosted you.</p>
      </div>
    </div>
  )
}
