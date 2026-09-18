import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { generateSlug } from "@/lib/server/slug";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    const companies = await db.searchCompanies(q, 20);
    return NextResponse.json(companies);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const name = typeof body.name === "string" ? body.name.trim() : "";

        if (!name) {
            return NextResponse.json(
                { detail: "Company name is required" },
                { status: 400 }
            );
        }

        let website = typeof body.website === "string" ? body.website.trim() : "";
        if (website && !/^https?:\/\//i.test(website)) {
            website = `https://${website}`;
        }

        const industry = typeof body.industry === "string" ? body.industry.trim() : undefined;
        const preexisting = await db.getCompanyBySlug(generateSlug(name));
        const company = await db.createCompany(name, website || undefined, industry);

        return NextResponse.json(company, {
            status: preexisting ? 200 : 201,
        });
    } catch {
        return NextResponse.json(
            { detail: "Invalid request payload" },
            { status: 400 }
        );
    }
}
