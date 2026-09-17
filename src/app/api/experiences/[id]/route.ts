import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const exp = db.getExperienceById(id);
  if (!exp || exp.status === "deleted") {
    return NextResponse.json({ detail: "Experience not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const anonymousId = searchParams.get("anonymous_id") || undefined;
  const list = db.getExperiences(exp.company_id, undefined, anonymousId, 100, 0);
  const found = list.find((e) => e.id === id);

  return NextResponse.json(found || exp);
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

  const success = db.deleteExperience(id);
  if (!success) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ status: "deleted" });
}
