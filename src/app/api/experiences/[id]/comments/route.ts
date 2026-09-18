import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const anonymousId = searchParams.get("anonymous_id") || undefined;
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const limit = limitParam ? Math.min(200, Math.max(1, parseInt(limitParam))) : 50;
  const offset = offsetParam ? Math.max(0, parseInt(offsetParam)) : 0;

  const comments = await db.getComments(id, anonymousId, limit, offset);
  return NextResponse.json(comments);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    if (!body.content || !body.anonymous_id) {
      return NextResponse.json(
        { detail: "content and anonymous_id are required" },
        { status: 400 }
      );
    }

    if (!db.checkRateLimit(body.anonymous_id, "comment")) {
      return NextResponse.json(
        { detail: "Too many comments! Rate limit is 30/hour. Please wait a bit." },
        { status: 429 }
      );
    }

    const comment = await db.addComment(id, body.anonymous_id, body.content.trim());
    return NextResponse.json({
      id: comment.id,
      experience_id: comment.experience_id,
      content: comment.content,
      created_at: comment.created_at,
      status: comment.status,
      upvotes: 0,
      downvotes: 0,
      user_vote: null,
    });
  } catch {
    return NextResponse.json(
      { detail: "Invalid request payload" },
      { status: 400 }
    );
  }
}
