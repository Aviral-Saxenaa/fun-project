import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { generateSlug } from "@/lib/server/slug";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q")?.trim() || "";

        const companies = await db.searchCompanies(q, 20);
        return NextResponse.json(companies);
    } catch (err: any) {
        console.error("GET /api/companies error:", err);
        return NextResponse.json(
            { detail: err?.message || "Failed to load companies" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { detail: "Invalid JSON in request body" },
            { status: 400 }
        );
    }

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
        return NextResponse.json(
            { detail: "Company name is required" },
            { status: 400 }
        );
    }

    let website = typeof body?.website === "string" ? body.website.trim() : "";
    if (website && !/^https?:\/\//i.test(website)) {
        website = `https://${website}`;
    }

    const industry = typeof body?.industry === "string" ? body.industry.trim() : undefined;

    try {
        const preexisting = await db.getCompanyBySlug(generateSlug(name));
        const company = await db.createCompany(name, website || undefined, industry);

        return NextResponse.json(company, {
            status: preexisting ? 200 : 201,
        });
    } catch (err: any) {
        console.error("POST /api/companies database error:", err);
        return NextResponse.json(
            { detail: err?.message || "Failed to save company to database" },
            { status: 500 }
        );
    }
}
