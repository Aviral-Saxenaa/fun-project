import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Fallback witty corporate translations for vulgar / angry expressions
const CORPORATE_EUPHEMISMS: [RegExp, string][] = [
  [/\b(fuck|fucking|fucked|f\*ck|f\*\*\*ing)\b/gi, "unmitigated"],
  [/\b(shit|bullshit|sh\*t)\b/gi, "sub-optimal organizational practice"],
  [/\b(assholes?|bastards?|b\*stard|a\*\*hole)\b/gi, "non-communicative stakeholders"],
  [/\b(scam|scammers?|fraud)\b/gi, "phantom requisition initiative"],
  [/\b(idiots?|morons?|clowns?)\b/gi, "under-calibrated talent acquisition representatives"],
  [/\b(wasted my (fucking )?time)\b/gi, "demanded substantial uncompensated candidate bandwidth"],
  [/\b(ghosted me like (a )?bitch)\b/gi, "demonstrated an abrupt cessation of bidirectional communications"],
  [/\b(liars?|lied)\b/gi, "communicated counter-factual onboarding timelines"],
  [/\b(wtf|what the fuck)\b/gi, "with unprecedented operational opacity"],
  [/\b(hate this (company|place))\b/gi, "strongly advise candidate discretion regarding this organization"],
];

function fallbackCivilize(text: string): string {
  let cleaned = text;
  for (const [pattern, replacement] of CORPORATE_EUPHEMISMS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Capitalize and format neatly
  cleaned = cleaned.trim();
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (!/[.!?]$/.test(cleaned)) {
      cleaned += ".";
    }
  }

  return `[Civilized Review] ${cleaned}`;
}

export async function POST(request: Request) {
  try {
    const { text, companyName } = await request.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Review text is required" },
        { status: 400 }
      );
    }

    const rawText = text.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful local corporate civilizer fallback
      const civilized = fallbackCivilize(rawText);
      return NextResponse.json({
        civilized,
        method: "local_corporate_filter",
        pun: "Refined with local corporate euphemism engine",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `You are the Ghosted AI Civility Translator. You convert angry, raw, frustrating, or vulgar candidate reviews into devastatingly sharp, articulate, witty, and 100% clean/professional corporate burns.

Target Company: ${companyName || "The Company"}
Raw Candidate Rant: "${rawText}"

STRICT INSTRUCTIONS:
1. Completely eradicate any vulgarity, profanity, swear words, slurs, or aggressive abuse.
2. Translate frustration into cutting, articulate corporate satire and razor-sharp professional terminology (e.g., "uncompensated consulting", "indefinite cessation of bidirectional protocol", "phantom requisition", "recruiter entered witness protection").
3. Preserve all factual milestones (interview rounds, wait times, assignment details, positions, broken verbal promises).
4. Maintain a hilarious, relatable, savagely civilized tone suitable for public internet discourse.
5. Return ONLY the polished review text. Do not include markdown quotes, introductory labels like "Here is...", or conversational chit-chat.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const generated = response.text?.trim() || fallbackCivilize(rawText);

    return NextResponse.json({
      civilized: generated,
      method: "gemini-3.8-flash",
      detected_raw_length: rawText.length,
    });
  } catch (err) {
    console.error("Gemini civilize error:", err);
    // On error, fall back gracefully to local rephraser
    const { text } = await request.clone().json().catch(() => ({ text: "" }));
    return NextResponse.json({
      civilized: fallbackCivilize(text || ""),
      method: "fallback_recovery",
    });
  }
}
