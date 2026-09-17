import { calculateGhostScore, getGhostLabel, getGhostEmoji } from "./ghostScore";
import { generateSlug } from "./slug";
import { hashAnonymousId } from "./hashing";
import { LeaderboardItem, PlatformStats } from "@/types";

export interface CompanyRecord {
  id: string;
  name: string;
  slug: string;
  website?: string;
  domain?: string;
  logo_url?: string;
  meme_punchline?: string;
  industry?: string;
  created_at: string;
}

export interface ExperienceRecord {
  id: string;
  company_id: string;
  anonymous_id_hash: string;
  interview_stage: string;
  outcome: string;
  content: string;
  waiting_days?: number | null;
  interview_rounds?: number | null;
  category?: string | null;
  created_at: string;
  status: "active" | "deleted";
}

export interface VoteRecord {
  id: string;
  experience_id: string;
  anonymous_id_hash: string;
  vote_type: "up" | "down";
}

export interface CommentRecord {
  id: string;
  experience_id: string;
  anonymous_id_hash: string;
  content: string;
  created_at: string;
  status: "active" | "deleted";
}

export interface CommentVoteRecord {
  id: string;
  comment_id: string;
  anonymous_id_hash: string;
  vote_type: "up" | "down";
}

export interface ReportRecord {
  id: string;
  anonymous_id_hash: string;
  reason: string;
  experience_id?: string;
  comment_id?: string;
  created_at: string;
  status: "pending" | "reviewed" | "dismissed";
}

interface Store {
  companies: CompanyRecord[];
  experiences: ExperienceRecord[];
  votes: VoteRecord[];
  comments: CommentRecord[];
  commentVotes: CommentVoteRecord[];
  reports: ReportRecord[];
  bannedHashes: Set<string>;
  rateLimits: Map<string, { timestamp: number; count: number }[]>;
}

declare global {
  var __ghostedStore: Store | undefined;
}

function getStore(): Store {
  if (!globalThis.__ghostedStore) {
    globalThis.__ghostedStore = seedInitialData();
  }
  return globalThis.__ghostedStore;
}

function seedInitialData(): Store {
  const c1: CompanyRecord = {
    id: "c-google",
    name: "Google",
    slug: "google",
    website: "https://google.com",
    domain: "google.com",
    logo_url: "https://unavatar.io/google.com",
    industry: "Big Tech & Search",
    meme_punchline: "Ghosted more candidates than my toxic ex ghosted my texts 👻",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  };
  const c2: CompanyRecord = {
    id: "c-amazon",
    name: "Amazon",
    slug: "amazon",
    website: "https://amazon.com",
    domain: "amazon.com",
    logo_url: "https://unavatar.io/amazon.com",
    industry: "Cloud Computing & E-Commerce",
    meme_punchline: "Completed 6 rounds of interviews just to become Casper the Friendly Ghost 🪦",
    created_at: new Date(Date.now() - 85 * 86400000).toISOString(),
  };
  const c3: CompanyRecord = {
    id: "c-meta",
    name: "Meta",
    slug: "meta",
    website: "https://meta.com",
    domain: "meta.com",
    logo_url: "https://unavatar.io/meta.com",
    industry: "Social Media & AI",
    meme_punchline: "Faster at hiring AI than sending 1 automated rejection email 🤖",
    created_at: new Date(Date.now() - 80 * 86400000).toISOString(),
  };
  const c4: CompanyRecord = {
    id: "c-netflix",
    name: "Netflix",
    slug: "netflix",
    website: "https://netflix.com",
    domain: "netflix.com",
    logo_url: "https://unavatar.io/netflix.com",
    industry: "Streaming & Entertainment",
    meme_punchline: "Are you still watching? Because the recruiter stopped responding 🍿",
    created_at: new Date(Date.now() - 75 * 86400000).toISOString(),
  };
  const c5: CompanyRecord = {
    id: "c-microsoft",
    name: "Microsoft",
    slug: "microsoft",
    website: "https://microsoft.com",
    domain: "microsoft.com",
    logo_url: "https://unavatar.io/microsoft.com",
    industry: "Enterprise Software & Cloud",
    meme_punchline: "Blue screen of death on candidate communications 💻",
    created_at: new Date(Date.now() - 70 * 86400000).toISOString(),
  };
  const c6: CompanyRecord = {
    id: "c-uber",
    name: "Uber",
    slug: "uber",
    website: "https://uber.com",
    domain: "uber.com",
    logo_url: "https://unavatar.io/uber.com",
    industry: "Ride Sharing & Logistics",
    meme_punchline: "Your recruiter has cancelled this trip 🚗💨",
    created_at: new Date(Date.now() - 65 * 86400000).toISOString(),
  };

  const companies: CompanyRecord[] = [c1, c2, c3, c4, c5, c6];

  const experiences: ExperienceRecord[] = [
    // --- GOOGLE EXPERIENCES (#1 Most Reported & Longest Waiting) ---
    {
      id: "exp-google-1",
      company_id: c1.id,
      anonymous_id_hash: hashAnonymousId("seed-user-g1"),
      interview_stage: "Offer Stage",
      outcome: "Still Waiting",
      content:
        "Passed Google Hiring Committee with L5 recommendation! Recruiter sent email: 'Now we just need team matching, typically takes 1-2 weeks'. It has been 335 days. I have changed jobs, moved cities, and adopted a golden retriever. I still check my spam folder every single Wednesday.",
      waiting_days: 335,
      interview_rounds: 7,
      category: "Infinite Waiting",
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "exp-google-2",
      company_id: c1.id,
      anonymous_id_hash: hashAnonymousId("seed-user-g2"),
      interview_stage: "Final Round",
      outcome: "Ghosted After Final Round",
      content:
        "Finished the full on-site loop (5 back-to-back 45-minute technical interviews). Recruiter sent an email saying 'Gathering feedback from committee, will sync with you on Tuesday'. Tuesday was 3 months ago. Rejection emails are apparently not covered in Google's cloud computing budget.",
      waiting_days: 90,
      interview_rounds: 5,
      category: "Ghosting",
      created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "exp-google-3",
      company_id: c1.id,
      anonymous_id_hash: hashAnonymousId("seed-user-g3"),
      interview_stage: "Technical",
      outcome: "Never Responded",
      content:
        "Completed 2 coding screens with 100% optimal Big-O solutions. Interviewer said 'Great job, expect recruiter to schedule system design'. Recruiter disappeared from Earth. Automated status portal stuck on 'Submitted' forever.",
      waiting_days: 64,
      interview_rounds: 3,
      category: "Zombie Interview",
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "exp-google-4",
      company_id: c1.id,
      anonymous_id_hash: hashAnonymousId("seed-user-g4"),
      interview_stage: "Applied",
      outcome: "Ghost Job / Fake Listing",
      content:
        "Found the exact same Senior Staff Software Engineer role reposted on LinkedIn every 2 weeks for 14 straight months. Applied 8 months ago, never a single human ping. Ghost job requisition to show fake growth.",
      waiting_days: 240,
      interview_rounds: 0,
      category: "Red Flag",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      status: "active",
    },

    // --- AMAZON EXPERIENCES (#1 Most Ghosted / Cold-Blooded) ---
    {
      id: "exp-amazon-1",
      company_id: c2.id,
      anonymous_id_hash: hashAnonymousId("seed-user-a1"),
      interview_stage: "Final Round",
      outcome: "Ghosted After Final Round",
      content:
        "Bar raiser interview asked 14 behavioral leadership principle questions. At the end, the interviewer said 'You demonstrate extreme Ownership and Bias for Action'. Ironically, they demonstrated zero ownership when it came to sending any rejection or update. Complete radio silence.",
      waiting_days: 80,
      interview_rounds: 6,
      category: "Ghosting",
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "exp-amazon-2",
      company_id: c2.id,
      anonymous_id_hash: hashAnonymousId("seed-user-a2"),
      interview_stage: "HR",
      outcome: "Ghosted",
      content:
        "Recruiter sent urgent calendar invite for AWS position. Waited in Chime lobby for 45 minutes. Interviewer never showed up. Emailed recruiter twice, zero response. Sent connection on LinkedIn, immediately declined.",
      waiting_days: 52,
      interview_rounds: 1,
      category: "HR Circus",
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "exp-amazon-3",
      company_id: c2.id,
      anonymous_id_hash: hashAnonymousId("seed-user-a3"),
      interview_stage: "Technical",
      outcome: "Still Waiting",
      content:
        "Completed Amazon Online Assessment (OA2) with all test cases passing and optimal memory. The candidate portal has stated 'Under Consideration' for 98 days straight. Has my resume been archived to S3 Glacier Deep Archive?",
      waiting_days: 98,
      interview_rounds: 2,
      category: "Infinite Waiting",
      created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "exp-amazon-4",
      company_id: c2.id,
      anonymous_id_hash: hashAnonymousId("seed-user-a4"),
      interview_stage: "Final Round",
      outcome: "Ghosted",
      content:
        "Full 5-round loop completed for Senior TPM. Promised 2-and-5 SLA response within 5 business days. Day 67 now. Sent follow up to 3 different recruiters, every email bounced or was ignored.",
      waiting_days: 67,
      interview_rounds: 5,
      category: "Ghosting",
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      status: "active",
    },

    // --- META EXPERIENCES (#1 Trending & Rising Velocity) ---
    {
      id: "exp-meta-1",
      company_id: c3.id,
      anonymous_id_hash: hashAnonymousId("seed-user-m1"),
      interview_stage: "Technical",
      outcome: "Ghosted",
      content:
        "Passed Meta E5 coding round with flying colors. Recruiter booked salary negotiation sync. Day of call, recruiter was laid off in the morning restructure. Nobody took over the candidate pipeline. Vanished into the Metaverse.",
      waiting_days: 105,
      interview_rounds: 4,
      category: "HR Circus",
      created_at: new Date(Date.now() - 19 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "exp-meta-2",
      company_id: c3.id,
      anonymous_id_hash: hashAnonymousId("seed-user-m2"),
      interview_stage: "Final Round",
      outcome: "Ghosted After Final Round",
      content:
        "Completed 4 virtual on-site rounds for AI Infrastructure. Recruiter said 'Feedback is extremely strong, committee meets Thursday'. Thursday came and went 72 days ago. Left on read on WhatsApp and email.",
      waiting_days: 72,
      interview_rounds: 5,
      category: "Ghosting",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "exp-meta-3",
      company_id: c3.id,
      anonymous_id_hash: hashAnonymousId("seed-user-m3"),
      interview_stage: "Manager",
      outcome: "Still Waiting",
      content:
        "Hiring manager reached out directly on LinkedIn claiming 'Your profile is perfect for my team'. Interview went for an hour, agreed to next steps. Then ghosted completely. Profile still says 'Hiring' on LinkedIn.",
      waiting_days: 48,
      interview_rounds: 2,
      category: "Zombie Interview",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      status: "active",
    },

    // --- NETFLIX & MICROSOFT & UBER EXPERIENCES ---
    {
      id: "exp-netflix-1",
      company_id: c4.id,
      anonymous_id_hash: hashAnonymousId("seed-user-n1"),
      interview_stage: "Final Round",
      outcome: "Ghosted After Final Round",
      content:
        "Culture memo interview was intense. Recruiter promised top-of-market feedback within 48 hours. It's been 54 days. Guess my subscription to their talent pool was canceled.",
      waiting_days: 54,
      interview_rounds: 4,
      category: "Ghosting",
      created_at: new Date(Date.now() - 16 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "exp-msft-1",
      company_id: c5.id,
      anonymous_id_hash: hashAnonymousId("seed-user-ms1"),
      interview_stage: "Technical",
      outcome: "Still Waiting",
      content:
        "Did 3 rounds of Azure systems architecture. Recruiter said 'Hold tight while we realign headcount for fiscal Q3'. That was 140 days ago. Headcount is still apparently in orbit.",
      waiting_days: 140,
      interview_rounds: 3,
      category: "Infinite Waiting",
      created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "exp-uber-1",
      company_id: c6.id,
      anonymous_id_hash: hashAnonymousId("seed-user-u1"),
      interview_stage: "Final Round",
      outcome: "Ghosted",
      content:
        "Spent 4 hours on algorithmic routing problems. The hiring manager said 'We need someone like you tomorrow'. Tomorrow never came. Recruiter cancelled the candidate ride with 0 stars.",
      waiting_days: 62,
      interview_rounds: 4,
      category: "Ghosting",
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      status: "active",
    },
  ];

  const votes: VoteRecord[] = [
    { id: "v1", experience_id: "exp-google-1", anonymous_id_hash: "u1", vote_type: "up" },
    { id: "v2", experience_id: "exp-google-1", anonymous_id_hash: "u2", vote_type: "up" },
    { id: "v3", experience_id: "exp-google-1", anonymous_id_hash: "u3", vote_type: "up" },
    { id: "v4", experience_id: "exp-google-2", anonymous_id_hash: "u4", vote_type: "up" },
    { id: "v5", experience_id: "exp-amazon-1", anonymous_id_hash: "u5", vote_type: "up" },
    { id: "v6", experience_id: "exp-amazon-1", anonymous_id_hash: "u6", vote_type: "up" },
    { id: "v7", experience_id: "exp-amazon-2", anonymous_id_hash: "u7", vote_type: "up" },
    { id: "v8", experience_id: "exp-meta-1", anonymous_id_hash: "u8", vote_type: "up" },
    { id: "v9", experience_id: "exp-meta-2", anonymous_id_hash: "u9", vote_type: "up" },
    { id: "v10", experience_id: "exp-meta-1", anonymous_id_hash: "u10", vote_type: "up" },
  ];

  const comments: CommentRecord[] = [
    {
      id: "comm-1",
      experience_id: "exp-google-1",
      anonymous_id_hash: hashAnonymousId("anon-comm-1"),
      content: "335 days in Google team match! You deserve an honorary L6 salary just for your patience.",
      created_at: new Date(Date.now() - 24 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "comm-2",
      experience_id: "exp-amazon-1",
      anonymous_id_hash: hashAnonymousId("anon-comm-2"),
      content: "Classic Amazon Bar Raiser move. Extreme ownership only applies until they have to type an email.",
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      status: "active",
    },
    {
      id: "comm-3",
      experience_id: "exp-meta-1",
      anonymous_id_hash: hashAnonymousId("anon-comm-3"),
      content: "Meta recruiters getting laid off while you are in the middle of negotiating is the ultimate 2024-2026 tech experience.",
      created_at: new Date(Date.now() - 17 * 86400000).toISOString(),
      status: "active",
    },
  ];

  return {
    companies,
    experiences,
    votes,
    comments,
    commentVotes: [],
    reports: [],
    bannedHashes: new Set<string>(),
    rateLimits: new Map(),
  };
}

export const db = {
  // Check if hash is banned
  isBanned(anonymousId: string): boolean {
    const store = getStore();
    const hash = hashAnonymousId(anonymousId);
    return store.bannedHashes.has(hash);
  },

  banHash(hash: string) {
    const store = getStore();
    store.bannedHashes.add(hash);
  },

  unbanHash(hash: string) {
    const store = getStore();
    store.bannedHashes.delete(hash);
  },

  getBannedHashes(): string[] {
    const store = getStore();
    return Array.from(store.bannedHashes);
  },

  // Check rate limit
  checkRateLimit(anonymousId: string, action: "story" | "comment" | "company"): boolean {
    const store = getStore();
    const key = `${action}:${hashAnonymousId(anonymousId)}`;
    const now = Date.now();
    const windowMs = action === "story" ? 86400000 : 3600000;
    const maxCount = action === "story" ? 10 : action === "comment" ? 30 : 5;

    const list = store.rateLimits.get(key) || [];
    const valid = list.filter((item) => now - item.timestamp < windowMs);
    if (valid.length >= maxCount) {
      return false; // rate limited
    }
    valid.push({ timestamp: now, count: valid.length + 1 });
    store.rateLimits.set(key, valid);
    return true;
  },

  // Content moderation check for phone numbers / emails
  validateContentSafety(text: string): { safe: boolean; reason?: string } {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;

    if (emailRegex.test(text)) {
      return { safe: false, reason: "Please do not include personal email addresses." };
    }
    if (phoneRegex.test(text)) {
      return { safe: false, reason: "Please do not include personal phone numbers." };
    }
    return { safe: true };
  },

  getCompanyStats(companyId: string) {
    const store = getStore();
    const activeExps = store.experiences.filter(
      (e) => e.company_id === companyId && e.status === "active"
    );
    const total = activeExps.length;
    const ghosted = activeExps.filter((e) => e.outcome === "Ghosted").length;

    const waits = activeExps
      .map((e) => e.waiting_days)
      .filter((w): w is number => typeof w === "number" && !isNaN(w) && w > 0);

    const avgWait = waits.length > 0 ? waits.reduce((a, b) => a + b, 0) / waits.length : 0;
    const maxWait = waits.length > 0 ? Math.max(...waits) : 0;

    const uniqueReporters = new Set(activeExps.map((e) => e.anonymous_id_hash)).size;

    const categories: Record<string, number> = {};
    const outcomes: Record<string, number> = {};

    for (const exp of activeExps) {
      if (exp.category) {
        categories[exp.category] = (categories[exp.category] || 0) + 1;
      }
      if (exp.outcome) {
        outcomes[exp.outcome] = (outcomes[exp.outcome] || 0) + 1;
      }
    }

    return {
      total_reports: total,
      ghost_reports: ghosted,
      avg_waiting_days: Math.round(avgWait * 10) / 10,
      longest_wait_days: maxWait,
      unique_reporters: uniqueReporters,
      categories,
      outcomes,
    };
  },

  searchCompanies(query: string, limit = 20) {
    const store = getStore();
    const q = query.toLowerCase().trim();
    const matches = q
      ? store.companies.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q))
      : store.companies;

    return matches.slice(0, limit).map((c) => {
      const stats = this.getCompanyStats(c.id);
      const score = calculateGhostScore(
        stats.ghost_reports,
        stats.total_reports,
        0,
        stats.unique_reporters
      );
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        website: c.website,
        domain: c.domain,
        logo_url: c.logo_url,
        meme_punchline: c.meme_punchline,
        industry: c.industry,
        created_at: c.created_at,
        ghost_score: score,
        ghost_label: getGhostLabel(score),
        ghost_emoji: getGhostEmoji(score),
        report_count: stats.total_reports,
      };
    });
  },

  getCompanyBySlug(slug: string) {
    const store = getStore();
    return store.companies.find((c) => c.slug === slug) || null;
  },

  getCompanyById(id: string) {
    const store = getStore();
    return store.companies.find((c) => c.id === id) || null;
  },

  createCompany(
    name: string,
    website?: string,
    industry?: string,
    logo_url?: string,
    meme_punchline?: string
  ) {
    const store = getStore();
    const cleanName = name.trim();
    const slug = generateSlug(cleanName);
    const existing = store.companies.find(
      (c) => c.slug === slug || c.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) {
      if (logo_url && !existing.logo_url) existing.logo_url = logo_url;
      if (meme_punchline && !existing.meme_punchline) existing.meme_punchline = meme_punchline;
      return existing;
    }

    const domain = website
      ? website.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase()
      : undefined;

    const newCompany: CompanyRecord = {
      id: "comp-" + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      slug,
      website: website?.trim() || undefined,
      domain,
      logo_url: logo_url || (domain ? `https://unavatar.io/${domain}` : undefined),
      meme_punchline:
        meme_punchline || "This company ghosted more candidates than my toxic ex ghosted my texts 👻",
      industry: industry?.trim() || "Technology",
      created_at: new Date().toISOString(),
    };
    store.companies.unshift(newCompany);
    return newCompany;
  },

  getLeaderboard(filter: string = "overall", limit = 50): LeaderboardItem[] {
    const store = getStore();
    const board: LeaderboardItem[] = [];

    for (const c of store.companies) {
      const s = this.getCompanyStats(c.id);
      if (s.total_reports === 0) continue;

      const score = calculateGhostScore(
        s.ghost_reports,
        s.total_reports,
        0,
        s.unique_reporters
      );

      // Find top reported category
      let topCat = "Ghosting";
      let maxCatCount = 0;
      for (const [cat, rawCount] of Object.entries(s.categories)) {
        const count = Number(rawCount) || 0;
        if (count > maxCatCount) {
          maxCatCount = count;
          topCat = cat;
        }
      }

      // Dynamic curated shifts for realism across demo companies
      let rankChange: "up" | "down" | "new" | "same" = "same";
      let rankShift = 1;
      if (c.slug === "meta") {
        rankChange = "up";
        rankShift = 4;
      } else if (c.slug === "amazon") {
        rankChange = "up";
        rankShift = 2;
      } else if (c.slug === "google") {
        rankChange = "same";
        rankShift = 0;
      } else if (c.slug === "netflix") {
        rankChange = "down";
        rankShift = 1;
      }

      board.push({
        id: c.id,
        name: c.name,
        slug: c.slug,
        industry: c.industry,
        logo_url: c.logo_url,
        meme_punchline: c.meme_punchline,
        ghost_score: score,
        ghost_label: getGhostLabel(score),
        ghost_emoji: getGhostEmoji(score),
        report_count: s.total_reports,
        ghost_count: s.ghost_reports,
        avg_waiting_days: s.avg_waiting_days,
        rank_change: rankChange,
        rank_shift: rankShift,
        top_category: topCat,
      });
    }

    if (filter === "most_ghosted") {
      board.sort((a, b) => b.ghost_count - a.ghost_count || b.ghost_score - a.ghost_score);
    } else if (filter === "most_reported") {
      board.sort((a, b) => b.report_count - a.report_count || b.ghost_score - a.ghost_score);
    } else if (filter === "trending") {
      board.sort((a, b) => (b.rank_shift || 0) - (a.rank_shift || 0) || b.ghost_score - a.ghost_score);
    } else if (filter === "rising") {
      board.sort((a, b) => b.avg_waiting_days - a.avg_waiting_days || b.ghost_score - a.ghost_score);
    } else {
      // Overall default: Highest ghost score
      board.sort((a, b) => b.ghost_score - a.ghost_score || b.report_count - a.report_count);
    }

    return board.slice(0, limit);
  },

  getCompanyDetail(slug: string) {
    const company = this.getCompanyBySlug(slug);
    if (!company) return null;
    const stats = this.getCompanyStats(company.id);
    const score = calculateGhostScore(
      stats.ghost_reports,
      stats.total_reports,
      0,
      stats.unique_reporters
    );
    return {
      company,
      ghost_score: score,
      ghost_label: getGhostLabel(score),
      ghost_emoji: getGhostEmoji(score),
      stats,
    };
  },

  // Platform dynamic stats for homepage
  getPlatformStats(): PlatformStats {
    const store = getStore();
    const activeExps = store.experiences.filter((e) => e.status === "active");

    const peopleWaiting = activeExps.filter(
      (e) => e.outcome === "Ghosted" || e.outcome === "Still Waiting"
    ).length;

    const waits = activeExps
      .map((e) => e.waiting_days)
      .filter((w): w is number => typeof w === "number" && !isNaN(w) && w > 0);

    const maxWaitDays = waits.length > 0 ? Math.max(...waits) : 335;
    let longestWaitStr = `${maxWaitDays} days`;
    if (maxWaitDays >= 300) {
      longestWaitStr = `${Math.round(maxWaitDays / 30)} months`;
    }

    let maxVotes = 0;
    for (const exp of activeExps) {
      const up = store.votes.filter(
        (v) => v.experience_id === exp.id && v.vote_type === "up"
      ).length;
      if (up > maxVotes) maxVotes = up;
    }

    const trending = this.getLeaderboard("trending", 5);

    // Provide baseline community scale numbers dynamically calculated
    const totalStories = activeExps.length;
    // Scale up representation for community feel if low in dev
    const displayWaiting = peopleWaiting >= 10 ? peopleWaiting * 1420 + 2821 : 24821;
    const displayStories = totalStories >= 10 ? totalStories * 1840 + 31284 : 31284;
    const displayUpvotes = maxVotes > 0 ? maxVotes * 1200 + 482 : 18200;

    return {
      people_waiting: displayWaiting,
      longest_wait_str: maxWaitDays >= 300 ? "11 months" : longestWaitStr,
      longest_wait_days: maxWaitDays,
      most_upvoted_count: displayUpvotes,
      stories_submitted: displayStories,
      top_trending: trending,
    };
  },

  // Experiences
  createExperience(data: {
    company_id: string;
    anonymous_id: string;
    interview_stage: string;
    outcome: string;
    content: string;
    waiting_days?: number | null;
    interview_rounds?: number | null;
    category?: string | null;
  }) {
    const store = getStore();
    const hashed = hashAnonymousId(data.anonymous_id);

    const exp: ExperienceRecord = {
      id: "exp-" + Math.random().toString(36).substring(2, 9),
      company_id: data.company_id,
      anonymous_id_hash: hashed,
      interview_stage: data.interview_stage,
      outcome: data.outcome,
      content: data.content,
      waiting_days: data.waiting_days ?? null,
      interview_rounds: data.interview_rounds ?? null,
      category: data.category ?? "Ghosting",
      created_at: new Date().toISOString(),
      status: "active",
    };
    store.experiences.unshift(exp);
    return exp;
  },

  getExperienceById(id: string) {
    const store = getStore();
    return store.experiences.find((e) => e.id === id) || null;
  },

  getExperiences(
    companyId?: string,
    category?: string,
    anonymousId?: string,
    limit = 20,
    offset = 0
  ) {
    const store = getStore();
    const hashed = anonymousId ? hashAnonymousId(anonymousId) : null;

    let active = store.experiences.filter((e) => e.status === "active");

    if (companyId) {
      active = active.filter((e) => e.company_id === companyId);
    }
    if (category && category !== "all") {
      active = active.filter((e) => e.category?.toLowerCase() === category.toLowerCase());
    }

    active.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const paginated = active.slice(offset, offset + limit);

    return paginated.map((exp) => {
      const company = store.companies.find((c) => c.id === exp.company_id);
      const upvotes = store.votes.filter(
        (v) => v.experience_id === exp.id && v.vote_type === "up"
      ).length;
      const downvotes = store.votes.filter(
        (v) => v.experience_id === exp.id && v.vote_type === "down"
      ).length;
      const commentCount = store.comments.filter(
        (c) => c.experience_id === exp.id && c.status === "active"
      ).length;
      const userVote = hashed
        ? store.votes.find(
          (v) => v.experience_id === exp.id && v.anonymous_id_hash === hashed
        )?.vote_type || null
        : null;

      // Base vote boost for seeds to look relatable and funny
      const seedBoost = exp.id.startsWith("exp-") && parseInt(exp.id.replace(/\D/g, "") || "0", 10);
      const baseUp = seedBoost ? 120 + seedBoost * 85 : 0;

      return {
        ...exp,
        company_name: company?.name || "Unknown Company",
        company_slug: company?.slug || "",
        upvotes: upvotes + baseUp,
        downvotes,
        comment_count: commentCount,
        user_vote: userVote,
      };
    });
  },

  deleteExperience(experienceId: string) {
    const exp = this.getExperienceById(experienceId);
    if (!exp) return false;
    exp.status = "deleted";
    return true;
  },

  restoreExperience(experienceId: string) {
    const exp = this.getExperienceById(experienceId);
    if (!exp) return false;
    exp.status = "active";
    return true;
  },

  // Experience Votes
  voteExperience(
    experienceId: string,
    anonymousId: string,
    voteType: "up" | "down"
  ) {
    const store = getStore();
    const hashed = hashAnonymousId(anonymousId);
    const existingIndex = store.votes.findIndex(
      (v) => v.experience_id === experienceId && v.anonymous_id_hash === hashed
    );

    let newUserVote: "up" | "down" | null = voteType;

    if (existingIndex >= 0) {
      if (store.votes[existingIndex].vote_type === voteType) {
        // Toggle off
        store.votes.splice(existingIndex, 1);
        newUserVote = null;
      } else {
        store.votes[existingIndex].vote_type = voteType;
      }
    } else {
      store.votes.push({
        id: "v-" + Math.random().toString(36).substring(2, 9),
        experience_id: experienceId,
        anonymous_id_hash: hashed,
        vote_type: voteType,
      });
    }

    const upvotes = store.votes.filter(
      (v) => v.experience_id === experienceId && v.vote_type === "up"
    ).length;
    const downvotes = store.votes.filter(
      (v) => v.experience_id === experienceId && v.vote_type === "down"
    ).length;

    return { upvotes, downvotes, user_vote: newUserVote };
  },

  // Comments
  addComment(experienceId: string, anonymousId: string, content: string) {
    const store = getStore();
    const hashed = hashAnonymousId(anonymousId);
    const comment: CommentRecord = {
      id: "comm-" + Math.random().toString(36).substring(2, 9),
      experience_id: experienceId,
      anonymous_id_hash: hashed,
      content,
      created_at: new Date().toISOString(),
      status: "active",
    };
    store.comments.unshift(comment);
    return comment;
  },

  getComments(
    experienceId: string,
    anonymousId?: string,
    limit = 50,
    offset = 0
  ) {
    const store = getStore();
    const hashed = anonymousId ? hashAnonymousId(anonymousId) : null;
    const active = store.comments
      .filter((c) => c.experience_id === experienceId && c.status === "active")
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    const paginated = active.slice(offset, offset + limit);

    return paginated.map((c) => {
      const upvotes = store.commentVotes.filter(
        (v) => v.comment_id === c.id && v.vote_type === "up"
      ).length;
      const downvotes = store.commentVotes.filter(
        (v) => v.comment_id === c.id && v.vote_type === "down"
      ).length;
      const userVote = hashed
        ? store.commentVotes.find(
          (v) => v.comment_id === c.id && v.anonymous_id_hash === hashed
        )?.vote_type || null
        : null;

      return {
        ...c,
        upvotes,
        downvotes,
        user_vote: userVote,
      };
    });
  },

  deleteComment(commentId: string) {
    const store = getStore();
    const comm = store.comments.find((c) => c.id === commentId);
    if (!comm) return false;
    comm.status = "deleted";
    return true;
  },

  restoreComment(commentId: string) {
    const store = getStore();
    const comm = store.comments.find((c) => c.id === commentId);
    if (!comm) return false;
    comm.status = "active";
    return true;
  },

  voteComment(
    commentId: string,
    anonymousId: string,
    voteType: "up" | "down"
  ) {
    const store = getStore();
    const hashed = hashAnonymousId(anonymousId);
    const existingIndex = store.commentVotes.findIndex(
      (v) => v.comment_id === commentId && v.anonymous_id_hash === hashed
    );

    let newUserVote: "up" | "down" | null = voteType;

    if (existingIndex >= 0) {
      if (store.commentVotes[existingIndex].vote_type === voteType) {
        store.commentVotes.splice(existingIndex, 1);
        newUserVote = null;
      } else {
        store.commentVotes[existingIndex].vote_type = voteType;
      }
    } else {
      store.commentVotes.push({
        id: "cv-" + Math.random().toString(36).substring(2, 9),
        comment_id: commentId,
        anonymous_id_hash: hashed,
        vote_type: voteType,
      });
    }

    const upvotes = store.commentVotes.filter(
      (v) => v.comment_id === commentId && v.vote_type === "up"
    ).length;
    const downvotes = store.commentVotes.filter(
      (v) => v.comment_id === commentId && v.vote_type === "down"
    ).length;

    return { upvotes, downvotes, user_vote: newUserVote };
  },

  // Reports
  createReport(data: {
    anonymous_id: string;
    reason: string;
    experience_id?: string;
    comment_id?: string;
  }) {
    const store = getStore();
    const hashed = hashAnonymousId(data.anonymous_id);
    const report: ReportRecord = {
      id: "rep-" + Math.random().toString(36).substring(2, 9),
      anonymous_id_hash: hashed,
      reason: data.reason,
      experience_id: data.experience_id,
      comment_id: data.comment_id,
      created_at: new Date().toISOString(),
      status: "pending",
    };
    store.reports.push(report);
    return report;
  },

  getReports() {
    const store = getStore();
    return store.reports.map((r) => {
      let targetContent = "";
      let companyName = "";
      if (r.experience_id) {
        const exp = store.experiences.find((e) => e.id === r.experience_id);
        targetContent = exp ? exp.content : "[Deleted story]";
        const comp = exp ? store.companies.find((c) => c.id === exp.company_id) : null;
        companyName = comp?.name || "";
      } else if (r.comment_id) {
        const comm = store.comments.find((c) => c.id === r.comment_id);
        targetContent = comm ? comm.content : "[Deleted comment]";
      }
      return {
        ...r,
        target_content: targetContent,
        company_name: companyName,
      };
    });
  },

  // Merge duplicate companies
  mergeCompanies(sourceSlug: string, targetSlug: string) {
    const store = getStore();
    const source = store.companies.find((c) => c.slug === sourceSlug);
    const target = store.companies.find((c) => c.slug === targetSlug);
    if (!source || !target || source.id === target.id) {
      return { success: false, message: "Invalid companies for merge" };
    }

    // Move experiences
    for (const exp of store.experiences) {
      if (exp.company_id === source.id) {
        exp.company_id = target.id;
      }
    }

    // Remove source company
    const idx = store.companies.findIndex((c) => c.id === source.id);
    if (idx >= 0) {
      store.companies.splice(idx, 1);
    }

    return { success: true, targetSlug: target.slug };
  },
};
