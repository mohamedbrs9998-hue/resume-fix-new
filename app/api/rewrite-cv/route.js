import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { cvText, targetRole } = await req.json();

    if (!cvText || !cvText.trim()) {
      return NextResponse.json(
        { ok: false, error: "cvText is required" },
        { status: 400 }
      );
    }

    const roleLine = targetRole?.trim()
      ? Target role: ${targetRole.trim()}
      : "Target role: General professional role";

    const prompt = 
You are a professional CV rewriting assistant.

Rewrite the CV content below into a stronger, ATS-friendly version.
Keep it honest, professional, and clear.
Return JSON with exactly these keys:
- resume_title
- professional_summary
- improved_resume
- ats_keywords

Rules:
- professional_summary: 3 to 4 lines
- improved_resume: plain text CV rewrite with better bullet points
- ats_keywords: comma-separated keywords only
- Do not invent fake experience
- Optimize for ${roleLine}

CV:
${cvText}
;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You rewrite CVs into stronger ATS-friendly versions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content || "{}";
    const data = JSON.parse(content);

    return NextResponse.json({ ok: true, result: data });
  } catch (error) {
    console.error("REWRITE CV ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Rewrite failed" },
      { status: 500 }
    );
  }
}
