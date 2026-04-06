import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";

export async function POST(req) {
  try {
    const data = await req.json();

    const order = await createOrder({
      fullName: data.fullName || "",
      email: data.email || "",
      targetRole: data.targetRole || "",
      targetCountry: data.targetCountry || "",
      plan: "pro",
      amountAed: 109,
      jobDescription: data.jobDescription || "",
      resumeText: data.resumeText || "",
      originalFileName: null,
      originalFilePath: null,
    });

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    console.error("SAVE ORDER ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to save order" },
      { status: 500 }
    );
  }
}