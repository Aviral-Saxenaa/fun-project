export interface Company {
  id: string
  name: string
  slug: string
  website?: string
  industry?: string
  created_at: string
}

export interface CompanySearchResult {
  id: string
  name: string
  slug: string
  ghost_score: number
  report_count: number
}

export interface CompanyDetail {
  company: Company
  ghost_score: number
  ghost_label: string
  ghost_emoji: string
  stats: {
    total_reports: number
    ghost_reports: number
    avg_waiting_days: number
    longest_wait_days: number
    unique_reporters: number
  }
}

export type InterviewStage =
  | "Applied"
  | "Recruiter Call"
  | "HR"
  | "Technical"
  | "Manager"
  | "Final Round"
  | "Offer Stage"

export type Outcome = "Ghosted" | "Rejected" | "Got Offer" | "Still Waiting" | "Withdrew"

export type Category =
  | "Ghosting"
  | "Zombie Interview"
  | "Infinite Waiting"
  | "HR Circus"
  | "Unpaid Assignment"
  | "Red Flag"

export interface Experience {
  id: string
  company_id: string
  interview_stage: InterviewStage
  outcome: Outcome
  content: string
  waiting_days?: number
  interview_rounds?: number
  category?: Category
  created_at: string
  status: string
  upvotes: number
  downvotes: number
  comment_count: number
  user_vote?: string | null
}

export interface Comment {
  id: string
  experience_id: string
  content: string
  created_at: string
  status: string
  upvotes: number
  downvotes: number
  user_vote?: string | null
}

export interface LeaderboardEntry {
  id: string
  name: string
  slug: string
  ghost_score: number
  ghost_label: string
  ghost_emoji: string
  report_count: number
}
