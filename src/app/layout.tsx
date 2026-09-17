import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ghosted 👻 — Anonymous Company Ghosting Leaderboard",
  description:
    "Anonymous company interview ghosting leaderboard and candidate experience sharing platform. They interviewed. They promised. They vanished.",
  openGraph: {
    title: "Ghosted 👻 — Anonymous Company Ghosting Leaderboard",
    description:
      "Because apparently rejection emails are a premium feature. See which companies have the biggest Ghost Score.",
    siteName: "Ghosted",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090a0f] text-zinc-100 antialiased min-h-screen flex flex-col selection:bg-purple-500/30 selection:text-purple-200">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
