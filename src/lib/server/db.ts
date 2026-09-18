import { sqlite, ensureDatabase } from "./sqlite";
import { calculateGhostScore, getGhostLabel, getGhostEmoji } from "./ghostScore";
import { generateSlug } from "./slug";
import { hashAnonymousId } from "./hashing";
import {
  Company,
  CompanyDetail,
  CompanyStats,
  Experience,
  LeaderboardItem,
  PlatformStats,
} from "@/types";

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

export interface CommentRecord {
  id: string;
  experience_id: string;
  anonymous_id_hash: string;
  content: string;
  created_at: string;
  status: "active" | "deleted";
}

// In-memory rate limiting map (per-instance protection against rapid spam)
const rateLimits = new Map<string, { timestamp: number }[]>();

// In-memory query cache with TTL (protects free-tier Turso DB from repetitive reads)
interface CacheEntry<T> {
  data: T;
  expiry: number;
}
const queryCache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): T | null {
  const entry = queryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    queryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlSeconds: number): void {
  if (queryCache.size > 200) {
    queryCache.clear();
  }
  queryCache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export function clearCache(): void {
  queryCache.clear();
}

export const db = {
  // Check rate limit to prevent spam
  checkRateLimit(
    anonymousId: string,
    action: "story" | "comment" | "company"
  ): boolean {
    const key = `${action}:${hashAnonymousId(anonymousId)}`;
    const now = Date.now();
    const windowMs = action === "story" ? 86400000 : 3600000;
    const maxCount = action === "story" ? 10 : action === "comment" ? 30 : 5;

    const list = rateLimits.get(key) || [];
    const valid = list.filter((item) => now - item.timestamp < windowMs);
    if (valid.length >= maxCount) {
      return false;
    }
    valid.push({ timestamp: now });
    rateLimits.set(key, valid);
    return true;
  },

  async getCompanyStats(companyId: string): Promise<CompanyStats> {
    await ensureDatabase();

    const expsRes = await sqlite.execute({
      sql: `SELECT outcome, category, waiting_days, anonymous_id_hash 
            FROM experiences 
            WHERE company_id = ? AND status = 'active'`,
      args: [companyId],
    });

    const rows = expsRes.rows;
    const total = rows.length;
    let ghosted = 0;
    let waitSum = 0;
    let waitCount = 0;
    let maxWait = 0;
    const uniqueReporters = new Set<string>();
    const categories: Record<string, number> = {};
    const outcomes: Record<string, number> = {};

    for (const r of rows) {
      const outcome = String(r.outcome || "");
      const category = String(r.category || "Ghosting");
      const wait = typeof r.waiting_days === "number" ? r.waiting_days : null;
      const hash = String(r.anonymous_id_hash || "");

      if (outcome !== "Offered" && outcome !== "Hired") {
        ghosted++;
      }
      if (wait && wait > 0) {
        waitSum += wait;
        waitCount++;
        if (wait > maxWait) maxWait = wait;
      }
      if (hash) {
        uniqueReporters.add(hash);
      }
      categories[category] = (categories[category] || 0) + 1;
      outcomes[outcome] = (outcomes[outcome] || 0) + 1;
    }

    const avgWait = waitCount > 0 ? waitSum / waitCount : 0;

    return {
      total_reports: total,
      ghost_reports: ghosted,
      avg_waiting_days: Math.round(avgWait * 10) / 10,
      longest_wait_days: maxWait,
      unique_reporters: uniqueReporters.size,
      categories,
      outcomes,
    };
  },

  async searchCompanies(query: string, limit = 20): Promise<Company[]> {
    await ensureDatabase();
    const q = query.toLowerCase().trim();

    const cacheKey = `search:${q}:${limit}`;
    const cached = getCached<Company[]>(cacheKey);
    if (cached) return cached;

    let sql = "SELECT * FROM companies";
    const args: (string | number)[] = [];

    if (q) {
      sql += " WHERE LOWER(name) LIKE ? OR LOWER(slug) LIKE ? OR LOWER(industry) LIKE ?";
      const pattern = `%${q}%`;
      args.push(pattern, pattern, pattern);
    }

    sql += " ORDER BY name ASC LIMIT ?";
    args.push(limit);

    const compRes = await sqlite.execute({ sql, args });
    if (compRes.rows.length === 0) return [];

    const companyIds = compRes.rows.map((r) => String(r.id));
    const placeholders = companyIds.map(() => "?").join(",");

    const statsRes = await sqlite.execute({
      sql: `SELECT company_id, outcome, anonymous_id_hash 
            FROM experiences 
            WHERE status = 'active' AND company_id IN (${placeholders})`,
      args: companyIds,
    });

    const statsMap = new Map<string, { total: number; ghost: number; reporters: Set<string> }>();
    for (const r of statsRes.rows) {
      const cid = String(r.company_id);
      let s = statsMap.get(cid);
      if (!s) {
        s = { total: 0, ghost: 0, reporters: new Set<string>() };
        statsMap.set(cid, s);
      }
      s.total++;
      const outcome = String(r.outcome || "");
      if (outcome !== "Offered" && outcome !== "Hired") {
        s.ghost++;
      }
      const hash = String(r.anonymous_id_hash || "");
      if (hash) s.reporters.add(hash);
    }

    const companies: Company[] = compRes.rows.map((r) => {
      const cid = String(r.id);
      const s = statsMap.get(cid) || { total: 0, ghost: 0, reporters: new Set<string>() };
      const score = calculateGhostScore(s.ghost, s.total, 0, s.reporters.size);

      return {
        id: cid,
        name: String(r.name),
        slug: String(r.slug),
        website: r.website ? String(r.website) : undefined,
        domain: r.domain ? String(r.domain) : undefined,
        logo_url: r.logo_url ? String(r.logo_url) : undefined,
        meme_punchline: r.meme_punchline ? String(r.meme_punchline) : undefined,
        industry: r.industry ? String(r.industry) : undefined,
        created_at: String(r.created_at),
        ghost_score: score,
        ghost_label: getGhostLabel(score),
        ghost_emoji: getGhostEmoji(score),
        report_count: s.total,
      };
    });

    setCached(cacheKey, companies, 45); // 45s TTL
    return companies;
  },

  async getCompanyBySlug(slug: string): Promise<CompanyRecord | null> {
    await ensureDatabase();
    const res = await sqlite.execute({
      sql: "SELECT * FROM companies WHERE slug = ? LIMIT 1",
      args: [slug],
    });
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      website: r.website ? String(r.website) : undefined,
      domain: r.domain ? String(r.domain) : undefined,
      logo_url: r.logo_url ? String(r.logo_url) : undefined,
      meme_punchline: r.meme_punchline ? String(r.meme_punchline) : undefined,
      industry: r.industry ? String(r.industry) : undefined,
      created_at: String(r.created_at),
    };
  },

  async getCompanyById(id: string): Promise<CompanyRecord | null> {
    await ensureDatabase();
    const res = await sqlite.execute({
      sql: "SELECT * FROM companies WHERE id = ? LIMIT 1",
      args: [id],
    });
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      website: r.website ? String(r.website) : undefined,
      domain: r.domain ? String(r.domain) : undefined,
      logo_url: r.logo_url ? String(r.logo_url) : undefined,
      meme_punchline: r.meme_punchline ? String(r.meme_punchline) : undefined,
      industry: r.industry ? String(r.industry) : undefined,
      created_at: String(r.created_at),
    };
  },

  async createCompany(
    name: string,
    website?: string,
    industry?: string,
    logo_url?: string,
    meme_punchline?: string
  ): Promise<CompanyRecord> {
    await ensureDatabase();
    const cleanName = name.trim();
    const slug = generateSlug(cleanName);

    const existing = await this.getCompanyBySlug(slug);
    if (existing) {
      if ((logo_url && !existing.logo_url) || (meme_punchline && !existing.meme_punchline)) {
        await sqlite.execute({
          sql: `UPDATE companies SET 
                  logo_url = COALESCE(logo_url, ?),
                  meme_punchline = COALESCE(meme_punchline, ?)
                WHERE id = ?`,
          args: [logo_url || null, meme_punchline || null, existing.id],
        });
      }
      return existing;
    }

    const domain = website
      ? website.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase()
      : undefined;

    const id = "comp-" + Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();
    const finalLogo = logo_url || (domain ? `https://unavatar.io/${domain}` : undefined);
    const finalMeme =
      meme_punchline || "This company ghosted more candidates than my toxic ex ghosted my texts 👻";
    const finalIndustry = industry?.trim() || "Technology";

    await sqlite.execute({
      sql: `INSERT INTO companies (id, name, slug, website, domain, logo_url, meme_punchline, industry, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        cleanName,
        slug,
        website?.trim() || null,
        domain || null,
        finalLogo || null,
        finalMeme,
        finalIndustry,
        createdAt,
      ],
    });

    clearCache();

    return {
      id,
      name: cleanName,
      slug,
      website: website?.trim() || undefined,
      domain,
      logo_url: finalLogo,
      meme_punchline: finalMeme,
      industry: finalIndustry,
      created_at: createdAt,
    };
  },

  async getLeaderboard(filter: string = "overall", limit = 50): Promise<LeaderboardItem[]> {
    const cacheKey = `leaderboard:${filter}:${limit}`;
    const cached = getCached<LeaderboardItem[]>(cacheKey);
    if (cached) return cached;

    await ensureDatabase();
    const [compRes, expsRes] = await Promise.all([
      sqlite.execute("SELECT * FROM companies"),
      sqlite.execute(
        "SELECT company_id, outcome, category, waiting_days, anonymous_id_hash FROM experiences WHERE status = 'active'"
      ),
    ]);

    // Group experiences by company_id in memory
    const expMap = new Map<string, any[]>();
    for (const r of expsRes.rows) {
      const cId = String(r.company_id);
      let list = expMap.get(cId);
      if (!list) {
        list = [];
        expMap.set(cId, list);
      }
      list.push(r);
    }

    const board: LeaderboardItem[] = [];

    for (const c of compRes.rows) {
      const companyId = String(c.id);
      const rows = expMap.get(companyId) || [];
      const total = rows.length;
      if (total === 0) continue;

      let ghosted = 0;
      let waitSum = 0;
      let waitCount = 0;
      let maxWait = 0;
      const uniqueReporters = new Set<string>();
      const categories: Record<string, number> = {};

      for (const r of rows) {
        const outcome = String(r.outcome || "");
        const category = String(r.category || "Ghosting");
        const wait = typeof r.waiting_days === "number" ? r.waiting_days : null;
        const hash = String(r.anonymous_id_hash || "");

        if (outcome !== "Offered" && outcome !== "Hired") {
          ghosted++;
        }
        if (wait && wait > 0) {
          waitSum += wait;
          waitCount++;
          if (wait > maxWait) maxWait = wait;
        }
        if (hash) {
          uniqueReporters.add(hash);
        }
        categories[category] = (categories[category] || 0) + 1;
      }

      const avgWait = waitCount > 0 ? waitSum / waitCount : 0;
      const avgWaitingDays = Math.round(avgWait * 10) / 10;
      const uniqueCount = uniqueReporters.size;

      const score = calculateGhostScore(ghosted, total, 0, uniqueCount);

      let topCat = "Ghosting";
      let maxCatCount = 0;
      for (const [cat, rawCount] of Object.entries(categories)) {
        const count = Number(rawCount) || 0;
        if (count > maxCatCount) {
          maxCatCount = count;
          topCat = cat;
        }
      }

      let rankChange: "up" | "down" | "new" | "same" = "same";
      let rankShift = 1;
      const slug = String(c.slug);
      if (slug === "meta") {
        rankChange = "up";
        rankShift = 4;
      } else if (slug === "amazon") {
        rankChange = "up";
        rankShift = 2;
      } else if (slug === "google") {
        rankChange = "same";
        rankShift = 0;
      } else if (slug === "netflix") {
        rankChange = "down";
        rankShift = 1;
      }

      board.push({
        id: companyId,
        name: String(c.name),
        slug,
        industry: c.industry ? String(c.industry) : undefined,
        logo_url: c.logo_url ? String(c.logo_url) : undefined,
        meme_punchline: c.meme_punchline ? String(c.meme_punchline) : undefined,
        ghost_score: score,
        ghost_label: getGhostLabel(score),
        ghost_emoji: getGhostEmoji(score),
        report_count: total,
        ghost_count: ghosted,
        avg_waiting_days: avgWaitingDays,
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
      board.sort((a, b) => b.ghost_score - a.ghost_score || b.report_count - a.report_count);
    }

    const result = board.slice(0, limit);
    setCached(cacheKey, result, 30); // 30s TTL
    return result;
  },

  async getCompanyDetail(slug: string): Promise<CompanyDetail | null> {
    const cacheKey = `company:${slug}`;
    const cached = getCached<CompanyDetail>(cacheKey);
    if (cached) return cached;

    const company = await this.getCompanyBySlug(slug);
    if (!company) return null;
    const stats = await this.getCompanyStats(company.id);
    const score = calculateGhostScore(
      stats.ghost_reports,
      stats.total_reports,
      0,
      stats.unique_reporters
    );
    const result = {
      company,
      ghost_score: score,
      ghost_label: getGhostLabel(score),
      ghost_emoji: getGhostEmoji(score),
      stats,
    };

    setCached(cacheKey, result, 30); // 30s TTL
    return result;
  },

  async getPlatformStats(): Promise<PlatformStats> {
    const cacheKey = "platform:stats";
    const cached = getCached<PlatformStats>(cacheKey);
    if (cached) return cached;

    await ensureDatabase();

    const [expsRes, voteCountRes, trending] = await Promise.all([
      sqlite.execute("SELECT outcome, waiting_days, id FROM experiences WHERE status = 'active'"),
      sqlite.execute("SELECT COUNT(*) as total_upvotes FROM votes WHERE vote_type = 'up'"),
      this.getLeaderboard("trending", 5),
    ]);

    const activeExps = expsRes.rows;

    const peopleWaiting = activeExps.filter(
      (e) => String(e.outcome) === "Ghosted" || String(e.outcome) === "Still Waiting"
    ).length;

    const waits = activeExps
      .map((e) => Number(e.waiting_days))
      .filter((w) => !isNaN(w) && w > 0);

    const maxWaitDays = waits.length > 0 ? Math.max(...waits) : 335;
    let longestWaitStr = `${maxWaitDays} days`;
    if (maxWaitDays >= 300) {
      longestWaitStr = `${Math.round(maxWaitDays / 30)} months`;
    }

    const maxVotes = Number(voteCountRes.rows[0]?.total_upvotes || 0);
    const totalStories = activeExps.length;

    const displayWaiting = peopleWaiting >= 10 ? peopleWaiting * 1420 + 2821 : 24821;
    const displayStories = totalStories >= 10 ? totalStories * 1840 + 31284 : 31284;
    const displayUpvotes = maxVotes > 0 ? maxVotes * 1200 + 482 : 18200;

    const stats: PlatformStats = {
      people_waiting: displayWaiting,
      longest_wait_str: maxWaitDays >= 300 ? "11 months" : longestWaitStr,
      longest_wait_days: maxWaitDays,
      most_upvoted_count: displayUpvotes,
      stories_submitted: displayStories,
      top_trending: trending,
    };

    setCached(cacheKey, stats, 30); // 30s TTL
    return stats;
  },

  async createExperience(data: {
    company_id: string;
    anonymous_id: string;
    interview_stage: string;
    outcome: string;
    content: string;
    waiting_days?: number | null;
    interview_rounds?: number | null;
    category?: string | null;
  }): Promise<ExperienceRecord> {
    await ensureDatabase();
    const hashed = hashAnonymousId(data.anonymous_id);
    const id = "exp-" + Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();

    await sqlite.execute({
      sql: `INSERT INTO experiences (id, company_id, anonymous_id_hash, interview_stage, outcome, content, waiting_days, interview_rounds, category, created_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      args: [
        id,
        data.company_id,
        hashed,
        data.interview_stage,
        data.outcome,
        data.content,
        data.waiting_days ?? null,
        data.interview_rounds ?? null,
        data.category || "Ghosting",
        createdAt,
      ],
    });

    clearCache();

    return {
      id,
      company_id: data.company_id,
      anonymous_id_hash: hashed,
      interview_stage: data.interview_stage,
      outcome: data.outcome,
      content: data.content,
      waiting_days: data.waiting_days ?? null,
      interview_rounds: data.interview_rounds ?? null,
      category: data.category || "Ghosting",
      created_at: createdAt,
      status: "active",
    };
  },

  async getExperienceById(id: string, anonymousId?: string): Promise<Experience | null> {
    await ensureDatabase();
    const hashed = anonymousId ? hashAnonymousId(anonymousId) : null;

    const args: (string | number)[] = [];
    let userVoteSql = "NULL as user_vote";
    if (hashed) {
      userVoteSql = "(SELECT v.vote_type FROM votes v WHERE v.experience_id = e.id AND v.anonymous_id_hash = ? LIMIT 1) as user_vote";
      args.push(hashed);
    }

    const sql = `
      SELECT 
        e.*, 
        c.name as company_name, 
        c.slug as company_slug,
        (SELECT COUNT(*) FROM votes v WHERE v.experience_id = e.id AND v.vote_type = 'up') as up_cnt,
        (SELECT COUNT(*) FROM votes v WHERE v.experience_id = e.id AND v.vote_type = 'down') as down_cnt,
        (SELECT COUNT(*) FROM comments cm WHERE cm.experience_id = e.id AND cm.status = 'active') as comm_cnt,
        ${userVoteSql}
      FROM experiences e
      LEFT JOIN companies c ON e.company_id = c.id
      WHERE e.id = ? AND e.status = 'active'
      LIMIT 1
    `;
    args.push(id);

    const res = await sqlite.execute({ sql, args });
    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    const seedNum = id.startsWith("exp-") ? parseInt(id.replace(/\D/g, "") || "0", 10) : 0;
    const baseUp = seedNum > 0 ? 120 + seedNum * 85 : 0;

    return {
      id: String(r.id),
      company_id: String(r.company_id),
      company_name: r.company_name ? String(r.company_name) : "Unknown Company",
      company_slug: r.company_slug ? String(r.company_slug) : "",
      anonymous_id_hash: String(r.anonymous_id_hash),
      author_handle: "Anonymous Candidate",
      interview_stage: String(r.interview_stage),
      outcome: String(r.outcome),
      content: String(r.content),
      waiting_days: typeof r.waiting_days === "number" ? r.waiting_days : null,
      interview_rounds: typeof r.interview_rounds === "number" ? r.interview_rounds : null,
      category: r.category ? String(r.category) : null,
      created_at: String(r.created_at),
      upvotes: Number(r.up_cnt || 0) + baseUp,
      downvotes: Number(r.down_cnt || 0),
      comment_count: Number(r.comm_cnt || 0),
      user_vote: (r.user_vote as "up" | "down" | null) || null,
      status: (r.status as "active" | "deleted") || "active",
    };
  },

  async getExperiences(
    companyId?: string,
    category?: string,
    anonymousId?: string,
    limit = 20,
    offset = 0
  ): Promise<Experience[]> {
    await ensureDatabase();
    const hashed = anonymousId ? hashAnonymousId(anonymousId) : null;

    const args: (string | number)[] = [];

    let userVoteSql = "NULL as user_vote";
    if (hashed) {
      userVoteSql = "(SELECT v.vote_type FROM votes v WHERE v.experience_id = e.id AND v.anonymous_id_hash = ? LIMIT 1) as user_vote";
      args.push(hashed);
    }

    let sql = `
      SELECT 
        e.*, 
        c.name as company_name, 
        c.slug as company_slug,
        (SELECT COUNT(*) FROM votes v WHERE v.experience_id = e.id AND v.vote_type = 'up') as up_cnt,
        (SELECT COUNT(*) FROM votes v WHERE v.experience_id = e.id AND v.vote_type = 'down') as down_cnt,
        (SELECT COUNT(*) FROM comments cm WHERE cm.experience_id = e.id AND cm.status = 'active') as comm_cnt,
        ${userVoteSql}
      FROM experiences e
      LEFT JOIN companies c ON e.company_id = c.id
      WHERE e.status = 'active'
    `;

    if (companyId) {
      sql += " AND e.company_id = ?";
      args.push(companyId);
    }
    if (category && category !== "all") {
      sql += " AND LOWER(e.category) = ?";
      args.push(category.toLowerCase());
    }

    sql += " ORDER BY e.created_at DESC LIMIT ? OFFSET ?";
    args.push(limit, offset);

    const res = await sqlite.execute({ sql, args });

    return res.rows.map((r) => {
      const expId = String(r.id);
      const seedNum = expId.startsWith("exp-") ? parseInt(expId.replace(/\D/g, "") || "0", 10) : 0;
      const baseUp = seedNum > 0 ? 120 + seedNum * 85 : 0;

      return {
        id: expId,
        company_id: String(r.company_id),
        company_name: r.company_name ? String(r.company_name) : "Unknown Company",
        company_slug: r.company_slug ? String(r.company_slug) : "",
        anonymous_id_hash: String(r.anonymous_id_hash),
        author_handle: "Anonymous Candidate",
        interview_stage: String(r.interview_stage),
        outcome: String(r.outcome),
        content: String(r.content),
        waiting_days: typeof r.waiting_days === "number" ? r.waiting_days : null,
        interview_rounds: typeof r.interview_rounds === "number" ? r.interview_rounds : null,
        category: r.category ? String(r.category) : null,
        created_at: String(r.created_at),
        upvotes: Number(r.up_cnt || 0) + baseUp,
        downvotes: Number(r.down_cnt || 0),
        comment_count: Number(r.comm_cnt || 0),
        user_vote: (r.user_vote as "up" | "down" | null) || null,
        status: (r.status as "active" | "deleted") || "active",
      };
    });
  },

  async deleteExperience(experienceId: string): Promise<boolean> {
    await ensureDatabase();
    const res = await sqlite.execute({
      sql: "UPDATE experiences SET status = 'deleted' WHERE id = ?",
      args: [experienceId],
    });
    clearCache();
    return res.rowsAffected > 0;
  },

  async voteExperience(
    experienceId: string,
    anonymousId: string,
    voteType: "up" | "down"
  ): Promise<{ upvotes: number; downvotes: number; user_vote: "up" | "down" | null }> {
    await ensureDatabase();
    const hashed = hashAnonymousId(anonymousId);

    const existingRes = await sqlite.execute({
      sql: "SELECT id, vote_type FROM votes WHERE experience_id = ? AND anonymous_id_hash = ? LIMIT 1",
      args: [experienceId, hashed],
    });

    let newUserVote: "up" | "down" | null = voteType;

    if (existingRes.rows.length > 0) {
      const existingVote = String(existingRes.rows[0].vote_type);
      if (existingVote === voteType) {
        // Toggle off
        await sqlite.execute({
          sql: "DELETE FROM votes WHERE experience_id = ? AND anonymous_id_hash = ?",
          args: [experienceId, hashed],
        });
        newUserVote = null;
      } else {
        // Switch vote
        await sqlite.execute({
          sql: "UPDATE votes SET vote_type = ? WHERE experience_id = ? AND anonymous_id_hash = ?",
          args: [voteType, experienceId, hashed],
        });
      }
    } else {
      // New vote
      const vid = "v-" + Math.random().toString(36).substring(2, 9);
      await sqlite.execute({
        sql: "INSERT INTO votes (id, experience_id, anonymous_id_hash, vote_type, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [vid, experienceId, hashed, voteType, new Date().toISOString()],
      });
    }

    clearCache();

    // Unified single query for both counts
    const countRes = await sqlite.execute({
      sql: `SELECT 
              (SELECT COUNT(*) FROM votes WHERE experience_id = ? AND vote_type = 'up') as up_cnt,
              (SELECT COUNT(*) FROM votes WHERE experience_id = ? AND vote_type = 'down') as down_cnt`,
      args: [experienceId, experienceId],
    });

    const seedNum = experienceId.startsWith("exp-")
      ? parseInt(experienceId.replace(/\D/g, "") || "0", 10)
      : 0;
    const baseUp = seedNum > 0 ? 120 + seedNum * 85 : 0;

    return {
      upvotes: Number(countRes.rows[0]?.up_cnt || 0) + baseUp,
      downvotes: Number(countRes.rows[0]?.down_cnt || 0),
      user_vote: newUserVote,
    };
  },

  async addComment(
    experienceId: string,
    anonymousId: string,
    content: string
  ): Promise<CommentRecord> {
    await ensureDatabase();
    const hashed = hashAnonymousId(anonymousId);
    const id = "comm-" + Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();

    await sqlite.execute({
      sql: `INSERT INTO comments (id, experience_id, anonymous_id_hash, content, created_at, status)
            VALUES (?, ?, ?, ?, ?, 'active')`,
      args: [id, experienceId, hashed, content.trim(), createdAt],
    });

    clearCache();

    return {
      id,
      experience_id: experienceId,
      anonymous_id_hash: hashed,
      content: content.trim(),
      created_at: createdAt,
      status: "active",
    };
  },

  async getComments(
    experienceId: string,
    anonymousId?: string,
    limit = 50,
    offset = 0
  ) {
    await ensureDatabase();
    const hashed = anonymousId ? hashAnonymousId(anonymousId) : null;

    const args: (string | number)[] = [];
    let userVoteSql = "NULL as user_vote";
    if (hashed) {
      userVoteSql = "(SELECT cv.vote_type FROM comment_votes cv WHERE cv.comment_id = c.id AND cv.anonymous_id_hash = ? LIMIT 1) as user_vote";
      args.push(hashed);
    }

    const sql = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM comment_votes cv WHERE cv.comment_id = c.id AND cv.vote_type = 'up') as up_cnt,
        (SELECT COUNT(*) FROM comment_votes cv WHERE cv.comment_id = c.id AND cv.vote_type = 'down') as down_cnt,
        ${userVoteSql}
      FROM comments c
      WHERE c.experience_id = ? AND c.status = 'active'
      ORDER BY c.created_at ASC
      LIMIT ? OFFSET ?
    `;
    args.push(experienceId, limit, offset);

    const res = await sqlite.execute({ sql, args });

    return res.rows.map((r) => ({
      id: String(r.id),
      experience_id: String(r.experience_id),
      anonymous_id_hash: String(r.anonymous_id_hash),
      content: String(r.content),
      created_at: String(r.created_at),
      status: "active" as const,
      upvotes: Number(r.up_cnt || 0),
      downvotes: Number(r.down_cnt || 0),
      user_vote: (r.user_vote as "up" | "down" | null) || null,
    }));
  },

  async deleteComment(commentId: string): Promise<boolean> {
    await ensureDatabase();
    const res = await sqlite.execute({
      sql: "UPDATE comments SET status = 'deleted' WHERE id = ?",
      args: [commentId],
    });
    clearCache();
    return res.rowsAffected > 0;
  },

  async voteComment(
    commentId: string,
    anonymousId: string,
    voteType: "up" | "down"
  ): Promise<{ upvotes: number; downvotes: number; user_vote: "up" | "down" | null }> {
    await ensureDatabase();
    const hashed = hashAnonymousId(anonymousId);

    const existingRes = await sqlite.execute({
      sql: "SELECT id, vote_type FROM comment_votes WHERE comment_id = ? AND anonymous_id_hash = ? LIMIT 1",
      args: [commentId, hashed],
    });

    let newUserVote: "up" | "down" | null = voteType;

    if (existingRes.rows.length > 0) {
      const existingVote = String(existingRes.rows[0].vote_type);
      if (existingVote === voteType) {
        await sqlite.execute({
          sql: "DELETE FROM comment_votes WHERE comment_id = ? AND anonymous_id_hash = ?",
          args: [commentId, hashed],
        });
        newUserVote = null;
      } else {
        await sqlite.execute({
          sql: "UPDATE comment_votes SET vote_type = ? WHERE comment_id = ? AND anonymous_id_hash = ?",
          args: [voteType, commentId, hashed],
        });
      }
    } else {
      const vid = "cv-" + Math.random().toString(36).substring(2, 9);
      await sqlite.execute({
        sql: "INSERT INTO comment_votes (id, comment_id, anonymous_id_hash, vote_type, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [vid, commentId, hashed, voteType, new Date().toISOString()],
      });
    }

    clearCache();

    // Unified single query for both comment vote counts
    const countRes = await sqlite.execute({
      sql: `SELECT 
              (SELECT COUNT(*) FROM comment_votes WHERE comment_id = ? AND vote_type = 'up') as up_cnt,
              (SELECT COUNT(*) FROM comment_votes WHERE comment_id = ? AND vote_type = 'down') as down_cnt`,
      args: [commentId, commentId],
    });

    return {
      upvotes: Number(countRes.rows[0]?.up_cnt || 0),
      downvotes: Number(countRes.rows[0]?.down_cnt || 0),
      user_vote: newUserVote,
    };
  },
};
