import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    if (!body.anonymous_id || !body.vote_type) {
      return NextResponse.json(
        { detail: "anonymous_id and vote_type are required" },
        { status: 400 }
      );
    }

    const voteType = body.vote_type === "down" ? "down" : "up";
    const counts = await db.voteExperience(id, body.anonymous_id, voteType);
    return NextResponse.json(counts);
  } catch {
    return NextResponse.json(
      { detail: "Invalid request payload" },
      { status: 400 }
    );
  }
}
