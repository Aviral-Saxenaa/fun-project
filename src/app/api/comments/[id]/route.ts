import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const adminSecret = searchParams.get("admin_secret");
  const expectedSecret = process.env.ADMIN_SECRET || "admin-secret";

  if (adminSecret !== expectedSecret) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 403 });
  }

  const success = db.deleteComment(id);
  if (!success) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ status: "deleted" });
}
