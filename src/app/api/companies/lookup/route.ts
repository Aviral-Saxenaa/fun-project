import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

// Common tech / popular company domain map for instant high-accuracy resolution
const KNOWN_COMPANIES: Record<
  string,
  { name: string; domain: string; industry: string; meme: string }
> = {
  google: {
    name: "Google",
    domain: "google.com",
    industry: "Big Tech & Search",
    meme: "Ghosted more candidates than my ex ghosted texts 👻",
  },
  alphabet: {
    name: "Google (Alphabet)",
    domain: "google.com",
    industry: "Big Tech & Search",
    meme: "Ghosted more candidates than my ex ghosted texts 👻",
  },
  amazon: {
    name: "Amazon",
    domain: "amazon.com",
    industry: "Cloud & E-Commerce",
    meme: "6-hour loop completed, then recruiter entered witness protection 🪦",
  },
  aws: {
    name: "Amazon Web Services (AWS)",
    domain: "amazon.com",
    industry: "Cloud Computing",
    meme: "Server uptime 99.99%, HR response rate 0.00% 💀",
  },
  meta: {
    name: "Meta",
    domain: "meta.com",
    industry: "Social Media & AI",
    meme: "Promised feedback in 48 hours, still left on read in the Metaverse 🥽",
  },
  facebook: {
    name: "Meta (Facebook)",
    domain: "meta.com",
    industry: "Social Media & AI",
    meme: "Promised feedback in 48 hours, still left on read in the Metaverse 🥽",
  },
  apple: {
    name: "Apple",
    domain: "apple.com",
    industry: "Consumer Electronics & OS",
    meme: "Their privacy policy includes keeping interview results strictly private 🍏",
  },
  microsoft: {
    name: "Microsoft",
    domain: "microsoft.com",
    industry: "Enterprise Software & Cloud",
    meme: "Blue screen of death on candidate communications 💻",
  },
  netflix: {
    name: "Netflix",
    domain: "netflix.com",
    industry: "Streaming & Entertainment",
    meme: "Are you still watching? Because the recruiter stopped responding 🍿",
  },
  uber: {
    name: "Uber",
    domain: "uber.com",
    industry: "Ride Sharing & Logistics",
    meme: "Your recruiter has cancelled this trip 🚗💨",
  },
  stripe: {
    name: "Stripe",
    domain: "stripe.com",
    industry: "Fintech & Payments",
    meme: "Instant payout API, 6-month delay on rejection email 💳",
  },
  spotify: {
    name: "Spotify",
    domain: "spotify.com",
    industry: "Audio & Streaming",
    meme: "Playing: 'Sound of Silence' on repeat 🎧",
  },
  adobe: {
    name: "Adobe",
    domain: "adobe.com",
    industry: "Creative Software",
    meme: "Recruiter erased all traces like Photoshop Content-Aware Fill 🎨",
  },
  salesforce: {
    name: "Salesforce",
    domain: "salesforce.com",
    industry: "Enterprise CRM",
    meme: "Closed-Lost: Candidate communication pipeline stalled ☁️",
  },
  tcs: {
    name: "Tata Consultancy Services (TCS)",
    domain: "tcs.com",
    industry: "IT Services & Consulting",
    meme: "Offer in release pool since last epoch ⏳",
  },
  infosys: {
    name: "Infosys",
    domain: "infosys.com",
    industry: "IT & Consulting",
    meme: "Induction date delayed into next reincarnation 🏢",
  },
  wipro: {
    name: "Wipro",
    domain: "wipro.com",
    industry: "IT Services",
    meme: "Waiting for the onboarding link like rain in the desert 🌧️",
  },
  oracle: {
    name: "Oracle",
    domain: "oracle.com",
    industry: "Database & Cloud Infrastructure",
    meme: "Transaction locked indefinitely without commit or rollback 🗄️",
  },
  nvidia: {
    name: "NVIDIA",
    domain: "nvidia.com",
    industry: "Semiconductors & AI",
    meme: "GPU stock up 1000%, recruiter bandwidth 0% ⚡",
  },
  openai: {
    name: "OpenAI",
    domain: "openai.com",
    industry: "Artificial Intelligence",
    meme: "AI passed the bar exam, but HR can't generate a 1-sentence rejection 🤖",
  },
  airbnb: {
    name: "Airbnb",
    domain: "airbnb.com",
    industry: "Hospitality & Travel",
    meme: "Host never showed up with the interview keys 🧳",
  },
  twitter: {
    name: "X (formerly Twitter)",
    domain: "x.com",
    industry: "Social Media",
    meme: "Recruiter account suspended mid-interview thread 🐦",
  },
  x: {
    name: "X (formerly Twitter)",
    domain: "x.com",
    industry: "Social Media",
    meme: "Recruiter account suspended mid-interview thread 🐦",
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const autoAdd = searchParams.get("auto_add") === "true";

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const lower = query.toLowerCase();
    const cleanAlphanumeric = lower.replace(/[^a-z0-9]/g, "");

    // 1. Check known lookup dictionary
    let found = KNOWN_COMPANIES[lower] || KNOWN_COMPANIES[cleanAlphanumeric];
    if (!found) {
      // Check partial match in known companies
      const matchKey = Object.keys(KNOWN_COMPANIES).find(
        (k) => k.includes(lower) || lower.includes(k)
      );
      if (matchKey) {
        found = KNOWN_COMPANIES[matchKey];
      }
    }

    // 2. Synthesize domain if custom/unlisted
    let domain = found?.domain;
    const displayName = found?.name || query.charAt(0).toUpperCase() + query.slice(1);
    const industry = found?.industry || "Technology & Software";
    const meme = found?.meme || "This company ghosted more candidates than my ex ghosted texts 👻";

    if (!domain) {
      if (query.includes(".")) {
        domain = query.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
      } else {
        domain = `${cleanAlphanumeric || "company"}.com`;
      }
    }

    const logoUrl = `https://unavatar.io/${domain}?fallback=https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    // If auto_add requested, register in database immediately if not present
    let existingInDb = db.getCompanyBySlug(cleanAlphanumeric);
    if (!existingInDb) {
      const searchDb = db.searchCompanies(query, 1);
      if (searchDb.length > 0 && searchDb[0].name.toLowerCase() === displayName.toLowerCase()) {
        existingInDb = db.getCompanyById(searchDb[0].id);
      }
    }

    let createdOrExisting = existingInDb;
    if (autoAdd && !existingInDb) {
      createdOrExisting = db.createCompany(
        displayName,
        `https://${domain}`,
        industry,
        logoUrl,
        meme
      );
    }

    return NextResponse.json({
      query,
      found: {
        name: displayName,
        domain,
        website: `https://${domain}`,
        industry,
        logo_url: logoUrl,
        meme_punchline: meme,
        existing_slug: createdOrExisting?.slug || null,
        existing_id: createdOrExisting?.id || null,
      },
    });
  } catch (error) {
    console.error("Company lookup error:", error);
    return NextResponse.json(
      { error: "Failed to perform internet company lookup" },
      { status: 500 }
    );
  }
}
