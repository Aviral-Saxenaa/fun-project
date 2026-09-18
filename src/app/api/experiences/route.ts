import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("company_id") || undefined;
  const category = searchParams.get("category") || undefined;
  const anonymousId = searchParams.get("anonymous_id") || undefined;
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam))) : 20;
  const offset = offsetParam ? Math.max(0, parseInt(offsetParam)) : 0;

  const experiences = await db.getExperiences(companyId, category, anonymousId, limit, offset);
  return NextResponse.json(experiences);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.company_id || !body.content || !body.anonymous_id) {
      return NextResponse.json(
        { detail: "Missing required fields: company_id, content, anonymous_id" },
        { status: 400 }
      );
    }

    // Anti-spam check
    if (!db.checkRateLimit(body.anonymous_id, "story")) {
      return NextResponse.json(
        { detail: "Rate limit reached (max 10 stories per day). Take a breather!" },
        { status: 429 }
      );
    }

    const exp = await db.createExperience({
      company_id: body.company_id,
      anonymous_id: body.anonymous_id,
      interview_stage: body.interview_stage || "Applied",
      outcome: body.outcome || "Ghosted",
      content: body.content.trim(),
      waiting_days: body.waiting_days ? Number(body.waiting_days) : null,
      interview_rounds: body.interview_rounds ? Number(body.interview_rounds) : null,
      category: body.category || "Ghosting",
    });

    return NextResponse.json(exp);
  } catch {
    return NextResponse.json(
      { detail: "Invalid request payload" },
      { status: 400 }
    );
  }
}
