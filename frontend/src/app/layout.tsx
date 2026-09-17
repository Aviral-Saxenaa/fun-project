import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "Ghosted 👻 | They interviewed. They promised. They vanished.",
  description: "Because apparently rejection emails are a premium feature. Anonymous company ghosting leaderboard.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#030014] text-gray-100 antialiased">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}
