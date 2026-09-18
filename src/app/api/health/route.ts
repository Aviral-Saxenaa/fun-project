import { NextResponse } from "next/server";
import { sqlite, ensureDatabase, dbConfigInfo } from "@/lib/server/sqlite";

export async function GET() {
  try {
    await ensureDatabase();
    const companiesRes = await sqlite.execute("SELECT COUNT(*) as count FROM companies");
    const experiencesRes = await sqlite.execute("SELECT COUNT(*) as count FROM experiences");

    const companiesCount = Number(companiesRes.rows[0]?.count ?? 0);
    const experiencesCount = Number(experiencesRes.rows[0]?.count ?? 0);

    return NextResponse.json({
      status: "ok",
      database: {
        type: dbConfigInfo.isTurso ? "turso_cloud" : "local_sqlite",
        has_database_url: dbConfigInfo.hasUrl,
        has_auth_token: dbConfigInfo.hasToken,
        companies_count: companiesCount,
        experiences_count: experiencesCount,
      },
      message: "Database is online and operational.",
    });
  } catch (err: any) {
    console.error("Health check database error:", err);
    return NextResponse.json(
      {
        status: "error",
        database: {
          type: dbConfigInfo.isTurso ? "turso_cloud" : "local_sqlite",
          has_database_url: dbConfigInfo.hasUrl,
          has_auth_token: dbConfigInfo.hasToken,
        },
        error: err?.message || String(err),
        hint: !dbConfigInfo.hasUrl
          ? "DATABASE_URL environment variable is missing. If deployed on Vercel, make sure DATABASE_URL and DATABASE_AUTH_TOKEN are added in Vercel Project Settings > Environment Variables, then click Redeploy."
          : "Database connection failed. Please check your Turso credentials.",
      },
      { status: 500 }
    );
  }
}
