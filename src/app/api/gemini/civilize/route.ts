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
    const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are the Ghosted Corporate Translator. You convert angry, raw, frustrating, or vulgar candidate reviews into devastatingly sharp, articulate, witty, and 100% clean professional corporate burns.

Target Company: ${companyName || "The Company"}

STRICT INSTRUCTIONS:
1. Completely eradicate any vulgarity, profanity, swear words, slurs, or aggressive abuse.
2. Translate frustration into cutting, articulate corporate satire and razor-sharp professional terminology (e.g., "uncompensated consulting", "indefinite cessation of bidirectional protocol", "phantom requisition", "recruiter entered witness protection").
3. Preserve all factual milestones (interview rounds, wait times, assignment details, positions, broken verbal promises).
4. Maintain a hilarious, relatable, savagely civilized tone suitable for public internet discourse.
5. Return ONLY the polished review text. Do not include markdown quotes, introductory labels like "Here is...", or conversational chit-chat.`;

    // 1. Prioritize GROK_API_KEY
    if (grokKey) {
      try {
        const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${grokKey.trim()}`,
          },
          body: JSON.stringify({
            model: "grok-2-latest",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Raw Candidate Review: "${rawText}"` },
            ],
            temperature: 0.6,
          }),
        });

        if (grokRes.ok) {
          const grokData = await grokRes.json();
          const grokText = grokData.choices?.[0]?.message?.content?.trim();
          if (grokText) {
            return NextResponse.json({
              sanitized: grokText,
              civilized: grokText,
              explanation: "Refined with Grok AI into sharp corporate satire! ⚡",
              method: "grok-2-latest",
              detected_raw_length: rawText.length,
            });
          }
        } else {
          console.warn("Grok API response not ok:", grokRes.status, await grokRes.text().catch(() => ""));
        }
      } catch (grokErr) {
        console.error("Grok API call failed, attempting fallback:", grokErr);
      }
    }

    // 2. Fallback to Gemini if configured
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${systemPrompt}\n\nCandidate Review:\n"${rawText}"`,
        });

        const generated = response.text?.trim();
        if (generated) {
          return NextResponse.json({
            sanitized: generated,
            civilized: generated,
            explanation: "Refined with AI into sharp corporate satire! ✨",
            method: "gemini-flash",
            detected_raw_length: rawText.length,
          });
        }
      } catch (geminiErr) {
        console.error("Gemini API fallback error:", geminiErr);
      }
    }

    // 3. Graceful corporate euphemism engine fallback
    const civilized = fallbackCivilize(rawText);
    return NextResponse.json({
      sanitized: civilized,
      civilized,
      explanation: "Refined with local corporate euphemism engine",
      method: "local_corporate_filter",
      detected_raw_length: rawText.length,
    });
  } catch (err) {
    console.error("Civilize endpoint error:", err);
    return NextResponse.json({
      sanitized: fallbackCivilize("Interview experience submitted"),
      civilized: fallbackCivilize("Interview experience submitted"),
      explanation: "Transformed with corporate euphemism fallback engine",
      method: "fallback_recovery",
    });
  }
}
