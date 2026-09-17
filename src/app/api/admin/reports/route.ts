import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_SECRET || "ghostbuster";

  if (authHeader !== expected) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const reports = db.getReports();
  const banned = db.getBannedHashes();

  return NextResponse.json({
    reports,
    banned,
  });
}
