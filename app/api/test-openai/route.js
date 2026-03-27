import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Write a short professional CV summary for a pediatric doctor in 3 lines."
        }
      ],
    });

    return NextResponse.json({
      ok: true,
      text: response.choices?.[0]?.message?.content || ""
    });
  } catch (error) {
    console.error("OPENAI TEST ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "OpenAI error" },
      { status: 500 }
    );
  }
}
