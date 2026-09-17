import { getAnonymousId } from "./client/anonymous";
import {
  Company,
  CompanyDetail,
  Experience,
  Comment,
  LeaderboardItem,
  PlatformStats,
} from "@/types";

export const api = {
  async getPlatformStats(): Promise<PlatformStats> {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error("Failed to load platform stats");
    return res.json();
  },

  async searchCompanies(q: string): Promise<Company[]> {
    const res = await fetch(`/api/companies?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("Failed to search companies");
    return res.json();
  },

  async getCompany(slug: string): Promise<CompanyDetail> {
    const res = await fetch(`/api/companies/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error("Company not found");
    return res.json();
  },

  async createCompany(data: {
    name: string;
    website?: string;
    industry?: string;
  }): Promise<Company> {
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to create company" }));
      throw new Error(err.detail || "Failed to create company");
    }
    return res.json();
  },

  async getLeaderboard(filter: string = "overall"): Promise<LeaderboardItem[]> {
    const res = await fetch(`/api/companies/leaderboard?filter=${encodeURIComponent(filter)}`);
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    return res.json();
  },

  async getExperiences(params: {
    company_id?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Experience[]> {
    const anonId = getAnonymousId();
    const query = new URLSearchParams();
    if (params.company_id) query.set("company_id", params.company_id);
    if (params.category && params.category !== "all") query.set("category", params.category);
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.offset) query.set("offset", params.offset.toString());
    query.set("anonymous_id", anonId);

    const res = await fetch(`/api/experiences?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch experiences");
    return res.json();
  },

  async getExperience(id: string): Promise<Experience> {
    const anonId = getAnonymousId();
    const res = await fetch(`/api/experiences/${encodeURIComponent(id)}?anonymous_id=${encodeURIComponent(anonId)}`);
    if (!res.ok) throw new Error("Experience not found");
    return res.json();
  },

  async createExperience(data: {
    company_id: string;
    interview_stage: string;
    outcome: string;
    content: string;
    waiting_days?: number | null;
    interview_rounds?: number | null;
    category?: string | null;
  }): Promise<Experience> {
    const anonId = getAnonymousId();
    const res = await fetch("/api/experiences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        anonymous_id: anonId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to submit story" }));
      throw new Error(err.detail || "Failed to submit experience");
    }
    return res.json();
  },

  async voteExperience(
    experienceId: string,
    voteType: "up" | "down"
  ): Promise<{ upvotes: number; downvotes: number; user_vote: "up" | "down" | null }> {
    const anonId = getAnonymousId();
    const res = await fetch(`/api/experiences/${encodeURIComponent(experienceId)}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymous_id: anonId,
        vote_type: voteType,
      }),
    });
    if (!res.ok) throw new Error("Failed to vote");
    return res.json();
  },

  async getComments(experienceId: string): Promise<Comment[]> {
    const anonId = getAnonymousId();
    const res = await fetch(
      `/api/experiences/${encodeURIComponent(experienceId)}/comments?anonymous_id=${encodeURIComponent(anonId)}`
    );
    if (!res.ok) throw new Error("Failed to fetch comments");
    return res.json();
  },

  async addComment(experienceId: string, content: string): Promise<Comment> {
    const anonId = getAnonymousId();
    const res = await fetch(`/api/experiences/${encodeURIComponent(experienceId)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymous_id: anonId,
        content,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to add comment" }));
      throw new Error(err.detail || "Failed to post comment");
    }
    return res.json();
  },

  async voteComment(
    commentId: string,
    voteType: "up" | "down"
  ): Promise<{ upvotes: number; downvotes: number; user_vote: "up" | "down" | null }> {
    const anonId = getAnonymousId();
    const res = await fetch(`/api/comments/${encodeURIComponent(commentId)}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymous_id: anonId,
        vote_type: voteType,
      }),
    });
    if (!res.ok) throw new Error("Failed to vote on comment");
    return res.json();
  },

  async reportContent(data: {
    reason: string;
    experience_id?: string;
    comment_id?: string;
  }): Promise<{ id: string; status: string }> {
    const anonId = getAnonymousId();
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymous_id: anonId,
        ...data,
      }),
    });
    if (!res.ok) throw new Error("Failed to submit report");
    return res.json();
  },

  async getAdminReports(secret: string) {
    const res = await fetch("/api/admin/reports", {
      headers: { "x-admin-secret": secret },
    });
    if (!res.ok) throw new Error("Unauthorized or failed to load reports");
    return res.json();
  },

  async adminAction(secret: string, payload: Record<string, unknown>) {
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Admin action failed");
    return res.json();
  },
};
