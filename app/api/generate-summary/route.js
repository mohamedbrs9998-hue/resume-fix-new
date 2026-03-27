import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import mammoth from "mammoth";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromFile(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const type = file.type || "";
  const name = (file.name || "").toLowerCase();

  if (type.includes("pdf") || name.endsWith(".pdf")) {
    const result = await pdf(buffer);
    return result.text || "";
  }

  if (
    type.includes("word") ||
    type.includes("officedocument") ||
    name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  if (type.includes("text") || name.endsWith(".txt")) {
    return buffer.toString("utf8");
  }

  return buffer.toString("utf8");
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("cv");
    const targetRole = String(formData.get("targetRole") || "");
    const targetMarket = String(formData.get("targetMarket") || "");
    const jobDescription = String(formData.get("jobDescription") || "");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { ok: false, error: "CV file is required" },
        { status: 400 }
      );
    }

    const cvText = await extractTextFromFile(file);

    if (!cvText.trim()) {
      return NextResponse.json(
        { ok: false, error: "Could not extract text from CV file" },
        { status: 400 }
      );
    }

    const prompt =
      "You are an expert medical CV writer.\n\n" +
      "Write a strong professional CV summary in English.\n" +
      "Requirements:\n" +
      "- 3 to 5 lines\n" +
      "- ATS-friendly\n" +
      "- Clear, concise, professional\n" +
      "- Emphasize pediatric experience when relevant\n" +
      "- Tailor to the target role and market if provided\n\n" +
      "Target role: " + targetRole + "\n" +
      "Target market: " + targetMarket + "\n\n" +
      "Optional job description:\n" + jobDescription + "\n\n" +
      "CV text:\n" + cvText;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 220
    });

    const summary = response.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      ok: true,
      summary,
      extractedTextPreview: cvText.slice(0, 1000)
    });
  } catch (error) {
    console.error("GENERATE SUMMARY ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "OpenAI error" },
      { status: 500 }
    );
  }
}
