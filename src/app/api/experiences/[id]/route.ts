import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const exp = await db.getExperienceById(id);
  if (!exp) {
    return NextResponse.json({ detail: "Experience not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const anonymousId = searchParams.get("anonymous_id") || undefined;
  const detailed = await db.getExperienceById(id, anonymousId);

  return NextResponse.json(detailed || exp);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const adminSecret = searchParams.get("admin_secret");
  const expectedSecret = process.env.ADMIN_SECRET || "ghostbuster";

  if (adminSecret !== expectedSecret) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 403 });
  }

  const success = await db.deleteExperience(id);
  if (!success) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ status: "deleted" });
}
