import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "overall";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam))) : 50;

  const board = await db.getLeaderboard(filter, limit);
  return NextResponse.json(board);
}
