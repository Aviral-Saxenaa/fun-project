import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const detail = await db.getCompanyDetail(slug);

  if (!detail) {
    return NextResponse.json(
      { detail: "Company not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(detail);
}
