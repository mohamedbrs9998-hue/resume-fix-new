import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const data = await req.json();

    const {
      fullName,
      targetRole,
      yearsExperience,
      location,
      phone,
      email,
      summaryNotes,
      workExperience,
      education,
      skills,
      certifications,
      languages,
    } = data;

    if (!fullName?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!targetRole?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Target role is required" },
        { status: 400 }
      );
    }

    const prompt = `
Create a complete professional CV for the following candidate.

Return JSON only with these exact keys:
- professional_summary
- core_skills
- professional_experience
- education
- certifications
- languages

Rules:
- Make it ATS-friendly
- Make it professional and strong
- Do not invent fake experience
- Improve wording and structure
- Use the user's information only
- professional_experience should be rewritten as polished CV bullet points
- core_skills should be a clean list in text form

Candidate details:
Full name: ${fullName || ""}
Target role: ${targetRole || ""}
Years of experience: ${yearsExperience || ""}
Location: ${location || ""}
Phone: ${phone || ""}
Email: ${email || ""}
Summary notes: ${summaryNotes || ""}
Work experience: ${workExperience || ""}
Education: ${education || ""}
Skills: ${skills || ""}
Certifications: ${certifications || ""}
Languages: ${languages || ""}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert professional CV writer. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(content);

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("GENERATE FULL CV ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to generate CV" },
      { status: 500 }
    );
  }
}
