import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_SECRET || "ghostbuster";

  if (authHeader !== expected) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, id, sourceSlug, targetSlug, hash } = body;

    if (action === "delete_experience" && id) {
      const success = db.deleteExperience(id);
      return NextResponse.json({ success });
    }

    if (action === "restore_experience" && id) {
      const success = db.restoreExperience(id);
      return NextResponse.json({ success });
    }

    if (action === "delete_comment" && id) {
      const success = db.deleteComment(id);
      return NextResponse.json({ success });
    }

    if (action === "restore_comment" && id) {
      const success = db.restoreComment(id);
      return NextResponse.json({ success });
    }

    if (action === "ban_hash" && hash) {
      db.banHash(hash);
      return NextResponse.json({ success: true, banned: db.getBannedHashes() });
    }

    if (action === "unban_hash" && hash) {
      db.unbanHash(hash);
      return NextResponse.json({ success: true, banned: db.getBannedHashes() });
    }

    if (action === "merge_companies" && sourceSlug && targetSlug) {
      const res = db.mergeCompanies(sourceSlug, targetSlug);
      return NextResponse.json(res);
    }

    return NextResponse.json({ detail: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ detail: "Invalid request payload" }, { status: 400 });
  }
}
