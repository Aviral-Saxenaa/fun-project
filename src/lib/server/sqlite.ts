import { createClient } from "@libsql/client";
import path from "path";
import { hashAnonymousId } from "./hashing";

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const rawDbUrl = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
const rawAuthToken = (process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN)?.trim().replace(/^["']|["']$/g, "");

// If in serverless (e.g. Vercel) and no remote DATABASE_URL provided, fallback to writable /tmp
const fallbackLocalPath = isServerless ? "file:/tmp/ghosted.db" : `file:${path.join(process.cwd(), "ghosted.db")}`;
const finalDbUrl = rawDbUrl || fallbackLocalPath;

export const sqlite = createClient({
  url: finalDbUrl,
  ...(rawAuthToken ? { authToken: rawAuthToken } : {}),
});

export const dbConfigInfo = {
  isTurso: finalDbUrl.startsWith("libsql://") || finalDbUrl.startsWith("https://"),
  hasUrl: Boolean(rawDbUrl),
  hasToken: Boolean(rawAuthToken),
  urlPreview: rawDbUrl ? (rawDbUrl.startsWith("libsql://") ? rawDbUrl.slice(0, 30) + "..." : "custom-url") : "local-file",
};

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureDatabase(): Promise<void> {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 0. Fast-path check: if companies table already exists with data, skip DDL overhead
      try {
        const quick = await sqlite.execute("SELECT COUNT(*) as count FROM companies");
        const count = Number(quick.rows[0]?.count ?? 0);
        if (count > 0) {
          isInitialized = true;
          return;
        }
      } catch {
        // Tables do not exist yet; proceed with table creation and seeding
      }

      // 1. Create tables and indices in batch (single roundtrip)
      await sqlite.batch([
        `CREATE TABLE IF NOT EXISTS companies (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          website TEXT,
          domain TEXT,
          logo_url TEXT,
          meme_punchline TEXT,
          industry TEXT,
          created_at TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS experiences (
          id TEXT PRIMARY KEY,
          company_id TEXT NOT NULL REFERENCES companies(id),
          anonymous_id_hash TEXT NOT NULL,
          interview_stage TEXT NOT NULL,
          outcome TEXT NOT NULL,
          content TEXT NOT NULL,
          waiting_days INTEGER,
          interview_rounds INTEGER,
          category TEXT,
          created_at TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active'
        );`,
        `CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          experience_id TEXT NOT NULL REFERENCES experiences(id),
          anonymous_id_hash TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active'
        );`,
        `CREATE TABLE IF NOT EXISTS votes (
          id TEXT PRIMARY KEY,
          experience_id TEXT NOT NULL REFERENCES experiences(id),
          anonymous_id_hash TEXT NOT NULL,
          vote_type TEXT NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(experience_id, anonymous_id_hash)
        );`,
        `CREATE TABLE IF NOT EXISTS comment_votes (
          id TEXT PRIMARY KEY,
          comment_id TEXT NOT NULL REFERENCES comments(id),
          anonymous_id_hash TEXT NOT NULL,
          vote_type TEXT NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(comment_id, anonymous_id_hash)
        );`,
        `CREATE INDEX IF NOT EXISTS idx_exp_active_created ON experiences(status, created_at DESC);`,
        `CREATE INDEX IF NOT EXISTS idx_exp_company ON experiences(company_id, status);`,
        `CREATE INDEX IF NOT EXISTS idx_votes_exp ON votes(experience_id, vote_type);`,
        `CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(experience_id, anonymous_id_hash);`,
        `CREATE INDEX IF NOT EXISTS idx_comm_exp ON comments(experience_id, status);`
      ]);

      // 2. Check if seeded
      const check = await sqlite.execute("SELECT COUNT(*) as count FROM companies");
      const count = Number(check.rows[0]?.count ?? 0);

  if (count === 0) {
    console.log("Seeding SQLite database with initial companies and experiences...");

    const companies = [
      {
        id: "c-google",
        name: "Google",
        slug: "google",
        website: "https://google.com",
        domain: "google.com",
        logo_url: "https://unavatar.io/google.com",
        industry: "Big Tech & Search",
        meme_punchline: "Ghosted more candidates than my toxic ex ghosted my texts 👻",
        created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      },
      {
        id: "c-amazon",
        name: "Amazon",
        slug: "amazon",
        website: "https://amazon.com",
        domain: "amazon.com",
        logo_url: "https://unavatar.io/amazon.com",
        industry: "Cloud Computing & E-Commerce",
        meme_punchline: "Completed 6 rounds of interviews just to become Casper the Friendly Ghost 🪦",
        created_at: new Date(Date.now() - 85 * 86400000).toISOString(),
      },
      {
        id: "c-meta",
        name: "Meta",
        slug: "meta",
        website: "https://meta.com",
        domain: "meta.com",
        logo_url: "https://unavatar.io/meta.com",
        industry: "Social Media & AI",
        meme_punchline: "Faster at hiring AI than sending 1 automated rejection email 🤖",
        created_at: new Date(Date.now() - 80 * 86400000).toISOString(),
      },
      {
        id: "c-netflix",
        name: "Netflix",
        slug: "netflix",
        website: "https://netflix.com",
        domain: "netflix.com",
        logo_url: "https://unavatar.io/netflix.com",
        industry: "Streaming & Entertainment",
        meme_punchline: "Are you still watching? Because the recruiter stopped responding 🍿",
        created_at: new Date(Date.now() - 75 * 86400000).toISOString(),
      },
      {
        id: "c-microsoft",
        name: "Microsoft",
        slug: "microsoft",
        website: "https://microsoft.com",
        domain: "microsoft.com",
        logo_url: "https://unavatar.io/microsoft.com",
        industry: "Enterprise Software & Cloud",
        meme_punchline: "Blue screen of death on candidate communications 💻",
        created_at: new Date(Date.now() - 70 * 86400000).toISOString(),
      },
      {
        id: "c-uber",
        name: "Uber",
        slug: "uber",
        website: "https://uber.com",
        domain: "uber.com",
        logo_url: "https://unavatar.io/uber.com",
        industry: "Ride Sharing & Logistics",
        meme_punchline: "Your recruiter has cancelled this trip 🚗💨",
        created_at: new Date(Date.now() - 65 * 86400000).toISOString(),
      },
    ];

    for (const c of companies) {
      await sqlite.execute({
        sql: `INSERT INTO companies (id, name, slug, website, domain, logo_url, meme_punchline, industry, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          c.id,
          c.name,
          c.slug,
          c.website,
          c.domain,
          c.logo_url,
          c.meme_punchline,
          c.industry,
          c.created_at,
        ],
      });
    }

    const experiences = [
      {
        id: "exp-google-1",
        company_id: "c-google",
        anonymous_id_hash: hashAnonymousId("seed-user-g1"),
        interview_stage: "Offer Stage",
        outcome: "Still Waiting",
        content:
          "Passed Google Hiring Committee with L5 recommendation! Recruiter sent email: 'Now we just need team matching, typically takes 1-2 weeks'. It has been 335 days. I have changed jobs, moved cities, and adopted a golden retriever. I still check my spam folder every single Wednesday.",
        waiting_days: 335,
        interview_rounds: 7,
        category: "Infinite Waiting",
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: "exp-google-2",
        company_id: "c-google",
        anonymous_id_hash: hashAnonymousId("seed-user-g2"),
        interview_stage: "Final Round",
        outcome: "Ghosted After Final Round",
        content:
          "Finished the full on-site loop (5 back-to-back 45-minute technical interviews). Recruiter sent an email saying 'Gathering feedback from committee, will sync with you on Tuesday'. Tuesday was 3 months ago. Rejection emails are apparently not covered in Google's cloud computing budget.",
        waiting_days: 90,
        interview_rounds: 5,
        category: "Ghosting",
        created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
      },
      {
        id: "exp-google-3",
        company_id: "c-google",
        anonymous_id_hash: hashAnonymousId("seed-user-g3"),
        interview_stage: "Technical",
        outcome: "Never Responded",
        content:
          "Completed 2 coding screens with 100% optimal Big-O solutions. Interviewer said 'Great job, expect recruiter to schedule system design'. Recruiter disappeared from Earth. Automated status portal stuck on 'Submitted' forever.",
        waiting_days: 64,
        interview_rounds: 3,
        category: "Zombie Interview",
        created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
      {
        id: "exp-google-4",
        company_id: "c-google",
        anonymous_id_hash: hashAnonymousId("seed-user-g4"),
        interview_stage: "Applied",
        outcome: "Ghost Job / Fake Listing",
        content:
          "Found the exact same Senior Staff Software Engineer role reposted on LinkedIn every 2 weeks for 14 straight months. Applied 8 months ago, never a single human ping. Ghost job requisition to show fake growth.",
        waiting_days: 240,
        interview_rounds: 0,
        category: "Red Flag",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: "exp-amazon-1",
        company_id: "c-amazon",
        anonymous_id_hash: hashAnonymousId("seed-user-a1"),
        interview_stage: "Final Round",
        outcome: "Ghosted After Final Round",
        content:
          "Bar raiser interview asked 14 behavioral leadership principle questions. At the end, the interviewer said 'You demonstrate extreme Ownership and Bias for Action'. Ironically, they demonstrated zero ownership when it came to sending any rejection or update. Complete radio silence.",
        waiting_days: 80,
        interview_rounds: 6,
        category: "Ghosting",
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: "exp-amazon-2",
        company_id: "c-amazon",
        anonymous_id_hash: hashAnonymousId("seed-user-a2"),
        interview_stage: "HR",
        outcome: "Ghosted",
        content:
          "Recruiter sent urgent calendar invite for AWS position. Waited in Chime lobby for 45 minutes. Interviewer never showed up. Emailed recruiter twice, zero response. Sent connection on LinkedIn, immediately declined.",
        waiting_days: 52,
        interview_rounds: 1,
        category: "HR Circus",
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: "exp-amazon-3",
        company_id: "c-amazon",
        anonymous_id_hash: hashAnonymousId("seed-user-a3"),
        interview_stage: "Technical",
        outcome: "Still Waiting",
        content:
          "Completed Amazon Online Assessment (OA2) with all test cases passing and optimal memory. The candidate portal has stated 'Under Consideration' for 98 days straight. Has my resume been archived to S3 Glacier Deep Archive?",
        waiting_days: 98,
        interview_rounds: 2,
        category: "Infinite Waiting",
        created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
      },
      {
        id: "exp-amazon-4",
        company_id: "c-amazon",
        anonymous_id_hash: hashAnonymousId("seed-user-a4"),
        interview_stage: "Final Round",
        outcome: "Ghosted",
        content:
          "Full 5-round loop completed for Senior TPM. Promised 2-and-5 SLA response within 5 business days. Day 67 now. Sent follow up to 3 different recruiters, every email bounced or was ignored.",
        waiting_days: 67,
        interview_rounds: 5,
        category: "Ghosting",
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: "exp-meta-1",
        company_id: "c-meta",
        anonymous_id_hash: hashAnonymousId("seed-user-m1"),
        interview_stage: "Technical",
        outcome: "Ghosted",
        content:
          "Passed Meta E5 coding round with flying colors. Recruiter booked salary negotiation sync. Day of call, recruiter was laid off in the morning restructure. Nobody took over the candidate pipeline. Vanished into the Metaverse.",
        waiting_days: 105,
        interview_rounds: 4,
        category: "HR Circus",
        created_at: new Date(Date.now() - 19 * 86400000).toISOString(),
      },
      {
        id: "exp-meta-2",
        company_id: "c-meta",
        anonymous_id_hash: hashAnonymousId("seed-user-m2"),
        interview_stage: "Final Round",
        outcome: "Ghosted After Final Round",
        content:
          "Completed 4 virtual on-site rounds for AI Infrastructure. Recruiter said 'Feedback is extremely strong, committee meets Thursday'. Thursday came and went 72 days ago. Left on read on WhatsApp and email.",
        waiting_days: 72,
        interview_rounds: 5,
        category: "Ghosting",
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: "exp-meta-3",
        company_id: "c-meta",
        anonymous_id_hash: hashAnonymousId("seed-user-m3"),
        interview_stage: "Manager",
        outcome: "Still Waiting",
        content:
          "Hiring manager reached out directly on LinkedIn claiming 'Your profile is perfect for my team'. Interview went for an hour, agreed to next steps. Then ghosted completely. Profile still says 'Hiring' on LinkedIn.",
        waiting_days: 48,
        interview_rounds: 2,
        category: "Zombie Interview",
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: "exp-netflix-1",
        company_id: "c-netflix",
        anonymous_id_hash: hashAnonymousId("seed-user-n1"),
        interview_stage: "Final Round",
        outcome: "Ghosted After Final Round",
        content:
          "Culture memo interview was intense. Recruiter promised top-of-market feedback within 48 hours. It's been 54 days. Guess my subscription to their talent pool was canceled.",
        waiting_days: 54,
        interview_rounds: 4,
        category: "Ghosting",
        created_at: new Date(Date.now() - 16 * 86400000).toISOString(),
      },
      {
        id: "exp-msft-1",
        company_id: "c-microsoft",
        anonymous_id_hash: hashAnonymousId("seed-user-ms1"),
        interview_stage: "Technical",
        outcome: "Still Waiting",
        content:
          "Did 3 rounds of Azure systems architecture. Recruiter said 'Hold tight while we realign headcount for fiscal Q3'. That was 140 days ago. Headcount is still apparently in orbit.",
        waiting_days: 140,
        interview_rounds: 3,
        category: "Infinite Waiting",
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
      {
        id: "exp-uber-1",
        company_id: "c-uber",
        anonymous_id_hash: hashAnonymousId("seed-user-u1"),
        interview_stage: "Final Round",
        outcome: "Ghosted",
        content:
          "Spent 4 hours on algorithmic routing problems. The hiring manager said 'We need someone like you tomorrow'. Tomorrow never came. Recruiter cancelled the candidate ride with 0 stars.",
        waiting_days: 62,
        interview_rounds: 4,
        category: "Ghosting",
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
    ];

    for (const exp of experiences) {
      await sqlite.execute({
        sql: `INSERT INTO experiences (id, company_id, anonymous_id_hash, interview_stage, outcome, content, waiting_days, interview_rounds, category, created_at, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        args: [
          exp.id,
          exp.company_id,
          exp.anonymous_id_hash,
          exp.interview_stage,
          exp.outcome,
          exp.content,
          exp.waiting_days,
          exp.interview_rounds,
          exp.category,
          exp.created_at,
        ],
      });
    }

    const comments = [
      {
        id: "comm-1",
        experience_id: "exp-google-1",
        anonymous_id_hash: hashAnonymousId("anon-comm-1"),
        content: "335 days in Google team match! You deserve an honorary L6 salary just for your patience.",
        created_at: new Date(Date.now() - 24 * 86400000).toISOString(),
      },
      {
        id: "comm-2",
        experience_id: "exp-amazon-1",
        anonymous_id_hash: hashAnonymousId("anon-comm-2"),
        content: "Classic Amazon Bar Raiser move. Extreme ownership only applies until they have to type an email.",
        created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
      {
        id: "comm-3",
        experience_id: "exp-meta-1",
        anonymous_id_hash: hashAnonymousId("anon-comm-3"),
        content: "Meta recruiters getting laid off while you are in the middle of negotiating is the ultimate tech experience.",
        created_at: new Date(Date.now() - 17 * 86400000).toISOString(),
      },
    ];

    for (const comm of comments) {
      await sqlite.execute({
        sql: `INSERT INTO comments (id, experience_id, anonymous_id_hash, content, created_at, status)
              VALUES (?, ?, ?, ?, ?, 'active')`,
        args: [
          comm.id,
          comm.experience_id,
          comm.anonymous_id_hash,
          comm.content,
          comm.created_at,
        ],
      });
    }

    const votes = [
      { id: "v1", experience_id: "exp-google-1", hash: "u1" },
      { id: "v2", experience_id: "exp-google-1", hash: "u2" },
      { id: "v3", experience_id: "exp-google-1", hash: "u3" },
      { id: "v4", experience_id: "exp-google-2", hash: "u4" },
      { id: "v5", experience_id: "exp-amazon-1", hash: "u5" },
      { id: "v6", experience_id: "exp-amazon-1", hash: "u6" },
      { id: "v7", experience_id: "exp-amazon-2", hash: "u7" },
      { id: "v8", experience_id: "exp-meta-1", hash: "u8" },
      { id: "v9", experience_id: "exp-meta-2", hash: "u9" },
    ];

    for (const v of votes) {
      await sqlite.execute({
        sql: `INSERT OR IGNORE INTO votes (id, experience_id, anonymous_id_hash, vote_type, created_at)
              VALUES (?, ?, ?, 'up', ?)`,
        args: [v.id, v.experience_id, v.hash, new Date().toISOString()],
      });
    }
    }
    isInitialized = true;
  } catch (err) {
    console.error("Database initialization failed:", err);
    throw err;
  } finally {
    initPromise = null;
  }
})();

  return initPromise;
}
