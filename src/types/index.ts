export type InterviewStage =
  | "Applied"
  | "Recruiter Call"
  | "HR"
  | "Technical"
  | "Manager"
  | "Final Round"
  | "Offer Stage";

export type InterviewOutcome =
  | "Ghosted"
  | "Still Waiting"
  | "Never Responded"
  | "Ghosted After Final Round"
  | "Ghost Job / Fake Listing"
  | "Rejected";

export type ExperienceCategory =
  | "Ghosting"
  | "Zombie Interview"
  | "Infinite Waiting"
  | "Rejected"
  | "Unpaid Assignment"
  | "Red Flag"
  | "HR Circus";

export type LeaderboardFilter =
  | "overall"
  | "most_ghosted"
  | "most_reported"
  | "trending"
  | "rising";

export type ReportReason =
  | "Spam"
  | "Harassment"
  | "Personal Information"
  | "Hate Speech"
  | "Misleading"
  | "Other";

export interface Company {
  id: string;
  name: string;
  slug: string;
  website?: string;
  domain?: string;
  logo_url?: string;
  meme_punchline?: string;
  industry?: string;
  created_at: string;
  ghost_score: number;
  ghost_label: string;
  ghost_emoji: string;
  report_count: number;
}

export interface CompanyStats {
  total_reports: number;
  ghost_reports: number;
  avg_waiting_days: number;
  longest_wait_days: number;
  unique_reporters: number;
  categories: Record<string, number>;
  outcomes: Record<string, number>;
}

export interface CompanyDetail {
  company: {
    id: string;
    name: string;
    slug: string;
    website?: string;
    domain?: string;
    logo_url?: string;
    meme_punchline?: string;
    industry?: string;
    created_at: string;
  };
  ghost_score: number;
  ghost_label: string;
  ghost_emoji: string;
  stats: CompanyStats;
}

export interface Experience {
  id: string;
  company_id: string;
  company_name?: string;
  company_slug?: string;
  company_logo_url?: string;
  company_domain?: string;
  anonymous_id_hash?: string;
  author_handle: string;
  interview_stage: string;
  outcome: string;
  content: string;
  waiting_days?: number | null;
  interview_rounds?: number | null;
  category?: string | null;
  created_at: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  user_vote?: "up" | "down" | null;
  status: "active" | "deleted";
}

export interface Comment {
  id: string;
  experience_id: string;
  author_handle: string;
  content: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  user_vote?: "up" | "down" | null;
  status: "active" | "deleted";
}

export interface LeaderboardItem {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  domain?: string;
  logo_url?: string;
  meme_punchline?: string;
  ghost_score: number;
  ghost_label: string;
  ghost_emoji: string;
  report_count: number;
  ghost_count: number;
  avg_waiting_days: number;
  rank_change: "up" | "down" | "new" | "same";
  rank_shift?: number;
  top_category?: string;
}

export interface PlatformStats {
  people_waiting: number;
  longest_wait_str: string;
  longest_wait_days: number;
  most_upvoted_count: number;
  stories_submitted: number;
  top_trending: LeaderboardItem[];
}

export interface ReportItem {
  id: string;
  anonymous_id_hash: string;
  reason: string;
  experience_id?: string;
  comment_id?: string;
  created_at: string;
  target_content?: string;
  company_name?: string;
}
