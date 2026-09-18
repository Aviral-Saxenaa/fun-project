import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "overall";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam))) : 50;

    const board = await db.getLeaderboard(filter, limit);
    return NextResponse.json(board);
  } catch (err: any) {
    console.error("GET /api/companies/leaderboard error:", err);
    return NextResponse.json(
      { detail: err?.message || "Failed to load leaderboard data" },
      { status: 500 }
    );
  }
}
